/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { auth } from './firebase';
import {
  Patient,
  UserSession,
  HistoriaClinicaData,
  HojaControlData,
  IndicacionGuiaData,
  NotaVoz,
} from './types/clinical';
import { getStoredPatients } from './utils/storage';
import { findPatientsToMigrate } from './utils/patient-sync-pure';
import {
  createPatientInCloud,
  deletePatientInCloud,
  loadOrCreateUserProfile,
  migrateLocalPatientsToCloud,
  subscribeToUserPatients,
  updatePatientFieldsInCloud,
  updateUserProfileInCloud,
} from './utils/cloud-service';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { EmailVerificationView } from './components/EmailVerificationView';
import { ProfileModal } from './components/ProfileModal';
import { PatientList } from './components/PatientList';
import { PatientSummaryBar, TabKey } from './components/PatientSummaryBar';
import { HistoriaClinicaView } from './components/HistoriaClinicaView';
import { HojaControlView } from './components/HojaControlView';
import { IndicacionGuiaView } from './components/IndicacionGuiaView';
import { VoiceNotesView } from './components/VoiceNotesView';

type SyncSection = 'info' | 'hc' | 'hojaControl' | 'indicacionGuia' | 'notasVoz' | 'all';

interface PendingWrite {
  patient: Patient;
  section: SyncSection;
  timer: ReturnType<typeof setTimeout>;
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('hc');

  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudBanner, setCloudBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const pendingWritesRef = useRef<Map<string, PendingWrite>>(new Map());
  const migratedThisSessionRef = useRef<string | null>(null);

  const stampSaved = useCallback(() => {
    const timeStr = new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLastSaved(timeStr);
  }, []);

  const hydrateSession = useCallback(async (fbUser: User) => {
    let pendingProfile:
      | {
          nombre?: string;
          rol?: 'Doctora' | 'Equipo Asistencial';
          especialidad?: string;
          cmp?: string;
          rne?: string;
        }
      | undefined;

    try {
      const rawPending = sessionStorage.getItem('hampiq_pending_profile');
      if (rawPending) {
        pendingProfile = JSON.parse(rawPending);
        if (fbUser.emailVerified) {
          sessionStorage.removeItem('hampiq_pending_profile');
        }
      }
    } catch {
      // Ignore malformed sessionStorage
    }

    const session = await loadOrCreateUserProfile(fbUser, pendingProfile);
    setUser(session);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setUser(null);
        setPatients([]);
        setSelectedPatientId(null);
        migratedThisSessionRef.current = null;
        setAuthReady(true);
        return;
      }

      if (!fbUser.emailVerified) {
        setUser(null);
        setAuthReady(true);
        return;
      }

      try {
        await hydrateSession(fbUser);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setCloudBanner({
          type: 'err',
          text: 'No se pudo cargar el perfil de usuario en la nube.',
        });
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsub();
  }, [hydrateSession]);

  // Flush any pending debounced writes immediately
  const flushPendingWrites = useCallback(async () => {
    if (!user?.uid) return;
    const entries = Array.from(pendingWritesRef.current.entries());
    if (entries.length === 0) return;

    pendingWritesRef.current.clear();
    setIsSyncing(true);
    try {
      await Promise.all(
        entries.map(([, item]) => {
          clearTimeout(item.timer);
          return updatePatientFieldsInCloud(item.patient, user.uid, item.section);
        })
      );
      stampSaved();
    } catch (err) {
      console.error('Error flushing cloud writes:', err);
      setCloudBanner({
        type: 'err',
        text: 'Hubo un problema al sincronizar los últimos cambios con la nube.',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [user?.uid, stampSaved]);

  // Subscribe to Firestore patients in real time
  useEffect(() => {
    if (!user?.uid || !user.emailVerified) return;

    setLoadingPatients(true);
    const unsub = subscribeToUserPatients(
      user.uid,
      async (cloudList) => {
        // Merge in-flight local pending edits so typing never flickers
        const pendingPatientIds = new Set(
          Array.from(pendingWritesRef.current.values()).map((w) => w.patient.id)
        );

        setPatients((prev) => {
          if (pendingPatientIds.size === 0) return cloudList;
          const prevMap = new Map(prev.map((p) => [p.id, p]));
          return cloudList.map((cp) => (pendingPatientIds.has(cp.id) ? prevMap.get(cp.id) || cp : cp));
        });
        setLoadingPatients(false);

        // One-time automatic migration of existing localStorage patients per login session
        if (migratedThisSessionRef.current !== user.uid) {
          migratedThisSessionRef.current = user.uid;
          const localPatients = getStoredPatients();
          const toMigrate = findPatientsToMigrate(localPatients, cloudList);
          if (toMigrate.length > 0) {
            setIsSyncing(true);
            try {
              const count = await migrateLocalPatientsToCloud(localPatients, cloudList, user.uid, {
                nombre: user.nombre,
                especialidad: user.especialidad,
                cmp: user.cmp,
                rne: user.rne,
              });
              if (count > 0) {
                localStorage.removeItem('hampiq_biomedicina_pacientes_v3');
                stampSaved();
                setCloudBanner({
                  type: 'ok',
                  text: `Se subieron automáticamente ${count} expediente(s) que tenías guardados en este dispositivo a tu cuenta en la nube.`,
                });
              }
            } catch (err) {
              console.error('Error migrating local patients:', err);
            } finally {
              setIsSyncing(false);
            }
          }
        }
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setLoadingPatients(false);
        setCloudBanner({
          type: 'err',
          text: 'Error al sincronizar pacientes con la nube. Verifica tu conexión o permisos.',
        });
      }
    );

    return () => {
      unsub();
    };
  }, [user?.uid, user?.emailVerified, user?.nombre, user?.especialidad, user?.cmp, user?.rne, stampSaved]);

  const scheduleCloudUpdate = useCallback(
    (updatedPatient: Patient, section: SyncSection) => {
      if (!user?.uid) return;
      const key = `${updatedPatient.id}:${section}`;
      const existing = pendingWritesRef.current.get(key);
      if (existing) {
        clearTimeout(existing.timer);
      }

      setIsSyncing(true);
      const timer = setTimeout(async () => {
        pendingWritesRef.current.delete(key);
        try {
          await updatePatientFieldsInCloud(updatedPatient, user.uid, section);
          stampSaved();
        } catch (err) {
          console.error('Cloud save error:', err);
          setCloudBanner({
            type: 'err',
            text: 'No se pudo guardar el cambio en la nube. Verifica tu conexión.',
          });
        } finally {
          if (pendingWritesRef.current.size === 0) {
            setIsSyncing(false);
          }
        }
      }, 500);

      pendingWritesRef.current.set(key, {
        patient: updatedPatient,
        section,
        timer,
      });
    },
    [user?.uid, stampSaved]
  );

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  const localPendingCount = useMemo(() => {
    const localPatients = getStoredPatients();
    return findPatientsToMigrate(localPatients, patients).length;
  }, [patients]);

  const handleUpdatePatientField = (field: keyof Patient, value: unknown) => {
    if (!selectedPatientId) return;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPatientId) return p;
        const next: Patient = {
          ...p,
          [field]: value,
          updatedAt: new Date().toISOString(),
        };
        scheduleCloudUpdate(next, 'info');
        return next;
      })
    );
  };

  const handleUpdateHC = (updatedHC: HistoriaClinicaData) => {
    if (!selectedPatientId) return;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPatientId) return p;
        const next: Patient = {
          ...p,
          hc: updatedHC,
          updatedAt: new Date().toISOString(),
        };
        scheduleCloudUpdate(next, 'hc');
        return next;
      })
    );
  };

  const handleUpdateHojaControl = (data: HojaControlData) => {
    if (!selectedPatientId) return;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPatientId) return p;
        const next: Patient = {
          ...p,
          hojaControl: data,
          updatedAt: new Date().toISOString(),
        };
        scheduleCloudUpdate(next, 'hojaControl');
        return next;
      })
    );
  };

  const handleUpdateIndicacionGuia = (data: IndicacionGuiaData) => {
    if (!selectedPatientId) return;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPatientId) return p;
        const next: Patient = {
          ...p,
          indicacionGuia: data,
          updatedAt: new Date().toISOString(),
        };
        scheduleCloudUpdate(next, 'indicacionGuia');
        return next;
      })
    );
  };

  const handleUpdateVoiceNotes = (notes: NotaVoz[]) => {
    if (!selectedPatientId) return;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPatientId) return p;
        const next: Patient = {
          ...p,
          notasVoz: notes,
          updatedAt: new Date().toISOString(),
        };
        scheduleCloudUpdate(next, 'notasVoz');
        return next;
      })
    );
  };

  const handleAddPatient = async (newP: Patient) => {
    if (!user?.uid) return;
    const enriched: Patient = {
      ...newP,
      indicacionGuia: {
        ...newP.indicacionGuia,
        doctora: {
          nombre: user.nombre || newP.indicacionGuia.doctora.nombre,
          especialidad: user.especialidad || newP.indicacionGuia.doctora.especialidad,
          cmp: user.cmp || newP.indicacionGuia.doctora.cmp,
          rne: user.rne || newP.indicacionGuia.doctora.rne,
        },
      },
    };
    setPatients((prev) => [enriched, ...prev]);
    setSelectedPatientId(enriched.id);
    setActiveTab('hc');

    setIsSyncing(true);
    try {
      await createPatientInCloud(enriched, user.uid, {
        nombre: user.nombre,
        especialidad: user.especialidad,
        cmp: user.cmp,
        rne: user.rne,
      });
      stampSaved();
    } catch (err) {
      console.error('Error creating patient in cloud:', err);
      setCloudBanner({
        type: 'err',
        text: 'No se pudo guardar el nuevo expediente en la nube.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    if (selectedPatientId === patientId) {
      setSelectedPatientId(null);
    }
    setIsSyncing(true);
    try {
      await deletePatientInCloud(patientId);
      stampSaved();
    } catch (err) {
      console.error('Error deleting patient in cloud:', err);
      setCloudBanner({
        type: 'err',
        text: 'No se pudo eliminar el expediente de la nube.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportBackup = async (imported: Patient[]) => {
    if (!user?.uid) return;
    setIsSyncing(true);
    try {
      for (const p of imported) {
        await createPatientInCloud(p, user.uid, {
          nombre: user.nombre,
          especialidad: user.especialidad,
          cmp: user.cmp,
          rne: user.rne,
        });
      }
      setSelectedPatientId(null);
      stampSaved();
    } catch (err) {
      console.error('Error importing backup to cloud:', err);
      setCloudBanner({
        type: 'err',
        text: 'Error al subir algunos registros del respaldo a la nube.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveProfile = async (
    updates: {
      nombre: string;
      especialidad: string;
      cmp: string;
      rne: string;
      rol: 'Doctora' | 'Equipo Asistencial';
    },
    applyToAllPatients: boolean
  ) => {
    if (!user?.uid) return;
    await updateUserProfileInCloud(user.uid, {
      ...updates,
      email: user.email,
    });
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));

    if (applyToAllPatients && patients.length > 0) {
      setIsSyncing(true);
      try {
        for (const p of patients) {
          const updatedPatient: Patient = {
            ...p,
            indicacionGuia: {
              ...p.indicacionGuia,
              doctora: {
                nombre: updates.nombre,
                especialidad: updates.especialidad,
                cmp: updates.cmp,
                rne: updates.rne,
              },
            },
          };
          await updatePatientFieldsInCloud(updatedPatient, user.uid, 'indicacionGuia');
        }
        stampSaved();
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleUploadLocalPatients = async (): Promise<number> => {
    if (!user?.uid) return 0;
    const localPatients = getStoredPatients();
    const count = await migrateLocalPatientsToCloud(localPatients, patients, user.uid, {
      nombre: user.nombre,
      especialidad: user.especialidad,
      cmp: user.cmp,
      rne: user.rne,
    });
    if (count > 0) {
      localStorage.removeItem('hampiq_biomedicina_pacientes_v3');
      stampSaved();
    }
    return count;
  };

  const handleLogout = async () => {
    await flushPendingWrites();
    await signOut(auth);
  };

  const handleBackToList = async () => {
    await flushPendingWrites();
    setSelectedPatientId(null);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs font-medium">Conectando con la nube de Hampiq...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return <LoginView />;
  }

  if (!firebaseUser.emailVerified) {
    return (
      <EmailVerificationView
        firebaseUser={firebaseUser}
        onVerified={async () => {
          if (auth.currentUser) {
            await hydrateSession(auth.currentUser);
          }
        }}
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 gap-3">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs font-medium">Cargando perfil médico...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800 antialiased font-sans">
      {/* Top Main Navigation */}
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
        patients={patients}
        onImportBackup={handleImportBackup}
        lastSaved={lastSaved}
        isSyncing={isSyncing}
        selectedPatient={selectedPatient}
        onBackToList={handleBackToList}
      />

      {/* Cloud Notification Banner */}
      {cloudBanner && (
        <div
          role="status"
          className={`no-print border-b px-4 py-2.5 text-xs flex items-center justify-between gap-3 ${
            cloudBanner.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {cloudBanner.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{cloudBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setCloudBanner(null)}
              aria-label="Cerrar aviso"
              className="p-1 hover:bg-black/5 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {!selectedPatient ? (
          loadingPatients && patients.length === 0 ? (
            <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-7 h-7 text-sky-600 animate-spin" />
              <p className="text-xs font-medium">Cargando expedientes desde la nube...</p>
            </div>
          ) : (
            <PatientList
              patients={patients}
              onSelectPatient={(p) => {
                setSelectedPatientId(p.id);
                setActiveTab('hc');
              }}
              onAddPatient={handleAddPatient}
              onDeletePatient={handleDeletePatient}
            />
          )
        ) : (
          <div>
            {/* Patient Header Summary Bar with 4 1-tap tabs */}
            <PatientSummaryBar
              patient={selectedPatient}
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              onBackToList={handleBackToList}
              onUpdatePatientField={handleUpdatePatientField}
            />

            {/* Tab 1: Historia Clínica Integral */}
            {activeTab === 'hc' && (
              <HistoriaClinicaView patient={selectedPatient} onUpdateHC={handleUpdateHC} />
            )}

            {/* Tab 2: Hoja de Control y Seguimiento */}
            {activeTab === 'hoja_control' && (
              <HojaControlView
                patient={selectedPatient}
                onUpdateHojaControl={handleUpdateHojaControl}
              />
            )}

            {/* Tab 3: Indicación Médica y Guía Nutricional (The only document for the patient) */}
            {activeTab === 'indicacion_guia' && (
              <IndicacionGuiaView
                patient={selectedPatient}
                onUpdateIndicacionGuia={handleUpdateIndicacionGuia}
              />
            )}

            {/* Tab 4: Notas Clínicas */}
            {activeTab === 'notas_voz' && (
              <VoiceNotesView
                patient={selectedPatient}
                onUpdateNotes={handleUpdateVoiceNotes}
                onUpdateHC={handleUpdateHC}
              />
            )}
          </div>
        )}
      </main>

      {/* Doctor Profile & Credentials Modal */}
      {isProfileOpen && (
        <ProfileModal
          user={user}
          cloudCount={patients.length}
          localPendingCount={localPendingCount}
          onClose={() => setIsProfileOpen(false)}
          onSaveProfile={handleSaveProfile}
          onUploadLocalPatients={handleUploadLocalPatients}
        />
      )}

      {/* Footer (Hidden in Print) */}
      <footer className="no-print border-t border-sky-100/80 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hampiq Biomedicina – Sistema de Seguimiento Clínico Climatérico</span>
          <span>Uso Exclusivo del Personal Médico Autorizado</span>
        </div>
      </footer>
    </div>
  );
}
