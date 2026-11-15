/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  UserCog,
  Mail,
  Lock,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { auth } from '../firebase';
import { UserSession } from '../types/clinical';
import { mapFirebaseAuthError } from '../utils/patient-sync-pure';

interface ProfileModalProps {
  user: UserSession;
  cloudCount: number;
  localPendingCount: number;
  onClose: () => void;
  onSaveProfile: (
    updates: {
      nombre: string;
      especialidad: string;
      cmp: string;
      rne: string;
      rol: 'Doctora' | 'Equipo Asistencial';
    },
    applyToAllPatients: boolean
  ) => Promise<void>;
  onUploadLocalPatients: () => Promise<number>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  cloudCount,
  localPendingCount,
  onClose,
  onSaveProfile,
  onUploadLocalPatients,
}) => {
  const [nombre, setNombre] = useState(user.nombre);
  const [rol, setRol] = useState<'Doctora' | 'Equipo Asistencial'>(user.rol);
  const [especialidad, setEspecialidad] = useState(
    user.especialidad || 'Medicina Funcional y Antienvejecimiento'
  );
  const [cmp, setCmp] = useState(user.cmp || '');
  const [rne, setRne] = useState(user.rne || '');
  const [applyToAllPatients, setApplyToAllPatients] = useState(false);

  // Email & password update (only for password provider)
  const isPasswordProvider = user.providerId === 'password';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState(user.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');

    const cleanNombre = nombre.trim();
    if (!cleanNombre) {
      setErrorMsg('El nombre de la doctora no puede estar vacío.');
      return;
    }

    setSavingProfile(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: cleanNombre });
      }
      await onSaveProfile(
        {
          nombre: cleanNombre,
          especialidad: especialidad.trim(),
          cmp: cmp.trim(),
          rne: rne.trim(),
          rol,
        },
        applyToAllPatients
      );
      setStatusMsg('Datos de la doctora actualizados correctamente en la nube.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateEmail = async () => {
    setStatusMsg('');
    setErrorMsg('');

    const cleanEmail = newEmail.trim();
    if (!cleanEmail || cleanEmail === user.email) {
      setErrorMsg('Ingresa un correo electrónico nuevo diferente al actual.');
      return;
    }
    if (!currentPassword) {
      setErrorMsg('Ingresa tu contraseña actual para autorizar el cambio de correo.');
      return;
    }
    if (!auth.currentUser || !auth.currentUser.email) return;

    setSavingCredentials(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await verifyBeforeUpdateEmail(auth.currentUser, cleanEmail);
      setStatusMsg(
        `Enviamos un enlace de confirmación a ${cleanEmail}. Haz clic en ese enlace y luego inicia sesión con el nuevo correo.`
      );
      setCurrentPassword('');
    } catch (err: any) {
      setErrorMsg(mapFirebaseAuthError(err?.code || ''));
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleUpdatePassword = async () => {
    setStatusMsg('');
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Ingresa tu contraseña actual.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (!auth.currentUser || !auth.currentUser.email) return;

    setSavingCredentials(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setStatusMsg('Contraseña actualizada correctamente. Úsala en tu próximo inicio de sesión.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(mapFirebaseAuthError(err?.code || ''));
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleUploadLocal = async () => {
    setStatusMsg('');
    setErrorMsg('');
    setMigrating(true);
    try {
      const count = await onUploadLocalPatients();
      setStatusMsg(
        count > 0
          ? `Se subieron ${count} pacientes locales a tu cuenta en la nube.`
          : 'Todos tus pacientes locales ya están sincronizados en la nube.'
      );
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al subir pacientes locales.');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-sky-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base font-bold text-slate-800">
                Perfil de la Doctora y Cuenta en la Nube
              </h2>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar perfil"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div
            role="status"
            className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Section 1: Doctor Info */}
        <form onSubmit={handleProfileSubmit} className="mt-5 space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700">
            1. Datos de la Doctora (Cabecera y Recetas)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="prof-nombre"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Nombre de la Doctora
              </label>
              <input
                id="prof-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="prof-rol"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Rol
              </label>
              <select
                id="prof-rol"
                value={rol}
                onChange={(e) =>
                  setRol(e.target.value === 'Equipo Asistencial' ? 'Equipo Asistencial' : 'Doctora')
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
              >
                <option value="Doctora">Doctora</option>
                <option value="Equipo Asistencial">Equipo Asistencial</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="prof-especialidad"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Especialidad
            </label>
            <input
              id="prof-especialidad"
              type="text"
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="prof-cmp"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                CMP
              </label>
              <input
                id="prof-cmp"
                type="text"
                value={cmp}
                onChange={(e) => setCmp(e.target.value)}
                placeholder="CMP: 48921"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
              />
            </div>
            <div>
              <label
                htmlFor="prof-rne"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                RNE
              </label>
              <input
                id="prof-rne"
                type="text"
                value={rne}
                onChange={(e) => setRne(e.target.value)}
                placeholder="RNE: 24105"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={applyToAllPatients}
              onChange={(e) => setApplyToAllPatients(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>Actualizar estos datos de firma en todas mis pacientes actuales</span>
          </label>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingProfile ? 'Guardando...' : 'Guardar Datos de la Doctora'}</span>
          </button>
        </form>

        {/* Section 2: Email & Password */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700">
            2. Correo y Contraseña de Acceso
          </h3>

          {!isPasswordProvider ? (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
              Ingresaste con <strong>Google</strong> ({user.email}). La contraseña y el correo se
              administran desde tu cuenta de Google. Si prefieres un correo y contraseña propios,
              cierra sesión y crea una cuenta en la pestaña <strong>Crear Cuenta</strong>.
            </p>
          ) : (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="cred-current-pass"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Contraseña Actual (necesaria para cambios de seguridad)
                </label>
                <input
                  id="cred-current-pass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-end">
                <div>
                  <label
                    htmlFor="cred-new-email"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Cambiar Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="cred-new-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUpdateEmail}
                  disabled={savingCredentials}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cambiar Correo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label
                    htmlFor="cred-new-pass"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="cred-new-pass"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="cred-confirm-pass"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    id="cred-confirm-pass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={savingCredentials}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Actualizar Contraseña
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Cloud Sync Status */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sky-50/70 border border-sky-100 rounded-xl p-3.5">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Sincronización en la Nube: {cloudCount} pacientes
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {localPendingCount > 0
                  ? `Hay ${localPendingCount} paciente(s) guardados localmente pendientes de subir.`
                  : 'Todos tus registros están respaldados en la nube.'}
              </p>
            </div>
            {localPendingCount > 0 && (
              <button
                type="button"
                onClick={handleUploadLocal}
                disabled={migrating}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer shrink-0"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{migrating ? 'Subiendo...' : 'Subir Pacientes Locales'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
