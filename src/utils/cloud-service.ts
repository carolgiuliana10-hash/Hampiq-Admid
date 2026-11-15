/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Patient, UserSession } from '../types/clinical';
import {
  findPatientsToMigrate,
  sanitizePatientForFirestore,
  sanitizeUserProfilePayload,
  sortPatientsByUpdatedAt,
  stripUndefinedDeep,
} from './patient-sync-pure';

function toIsoString(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export async function loadOrCreateUserProfile(
  firebaseUser: User,
  overrides?: {
    nombre?: string;
    rol?: 'Doctora' | 'Equipo Asistencial';
    especialidad?: string;
    cmp?: string;
    rne?: string;
  }
): Promise<UserSession> {
  const path = `users/${firebaseUser.uid}`;
  const userRef = doc(db, 'users', firebaseUser.uid);

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  const providerId = firebaseUser.providerData?.[0]?.providerId || 'password';

  if (existingSnap && existingSnap.exists()) {
    const data = existingSnap.data();
    // Keep Firestore email synced if user changed email in Firebase Auth
    if (firebaseUser.email && data.email !== firebaseUser.email && firebaseUser.emailVerified) {
      try {
        await updateDoc(userRef, {
          email: firebaseUser.email.slice(0, 200),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || data.email || '',
      nombre: data.nombre || firebaseUser.displayName || 'Dra. Especialista Hampiq',
      rol: data.rol === 'Equipo Asistencial' ? 'Equipo Asistencial' : 'Doctora',
      especialidad: data.especialidad || 'Medicina Funcional y Antienvejecimiento',
      cmp: data.cmp || '',
      rne: data.rne || '',
      emailVerified: firebaseUser.emailVerified,
      providerId,
      isAuthenticated: true,
    };
  }

  const defaultName =
    overrides?.nombre ||
    firebaseUser.displayName ||
    (firebaseUser.email ? `Dra. ${firebaseUser.email.split('@')[0]}` : 'Dra. Especialista Hampiq');

  const sanitized = sanitizeUserProfilePayload({
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    nombre: defaultName,
    especialidad: overrides?.especialidad || 'Medicina Funcional y Antienvejecimiento',
    cmp: overrides?.cmp || '',
    rne: overrides?.rne || '',
    rol: overrides?.rol || 'Doctora',
  });

  if (firebaseUser.emailVerified) {
    try {
      await setDoc(userRef, {
        ...sanitized,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  return {
    ...sanitized,
    emailVerified: firebaseUser.emailVerified,
    providerId,
    isAuthenticated: true,
  };
}

export async function updateUserProfileInCloud(
  uid: string,
  updates: {
    nombre: string;
    especialidad: string;
    cmp: string;
    rne: string;
    rol: 'Doctora' | 'Equipo Asistencial';
    email?: string;
  }
): Promise<void> {
  const path = `users/${uid}`;
  const userRef = doc(db, 'users', uid);
  const sanitized = sanitizeUserProfilePayload({
    uid,
    email: updates.email || 'usuario@hampiq.pe',
    nombre: updates.nombre,
    especialidad: updates.especialidad,
    cmp: updates.cmp,
    rne: updates.rne,
    rol: updates.rol,
  });

  const payload: Record<string, unknown> = {
    nombre: sanitized.nombre,
    especialidad: sanitized.especialidad,
    cmp: sanitized.cmp,
    rne: sanitized.rne,
    rol: sanitized.rol,
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(userRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeToUserPatients(
  ownerId: string,
  onData: (patients: Patient[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(collection(db, 'patients'), where('ownerId', '==', ownerId));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Patient[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          nombres: data.nombres || '',
          apellidos: data.apellidos || '',
          dni: data.dni || '',
          celular: data.celular || '',
          fechaNacimiento: data.fechaNacimiento || '',
          direccion: data.direccion || '',
          ocupacion: data.ocupacion || '',
          etapaActual: data.etapaActual || 'Evaluación Inicial',
          proximaCita: data.proximaCita || '',
          ultimaCita: data.ultimaCita || '',
          createdAt: toIsoString(data.createdAt),
          updatedAt: toIsoString(data.updatedAt),
          hc: data.hc,
          hojaControl: data.hojaControl,
          indicacionGuia: data.indicacionGuia,
          notasVoz: Array.isArray(data.notasVoz) ? data.notasVoz : [],
        };
      });
      onData(sortPatientsByUpdatedAt(list));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'patients');
      } catch (wrappedErr) {
        onError(wrappedErr instanceof Error ? wrappedErr : new Error(String(wrappedErr)));
      }
    }
  );
}

export async function createPatientInCloud(
  patient: Patient,
  ownerId: string,
  doctorDefaults?: { nombre?: string; especialidad?: string; cmp?: string; rne?: string }
): Promise<Patient> {
  const sanitized = sanitizePatientForFirestore(patient, ownerId, doctorDefaults);
  const path = `patients/${sanitized.id}`;
  try {
    await setDoc(doc(db, 'patients', sanitized.id), {
      ...sanitized,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
  return {
    ...patient,
    ...sanitized,
    updatedAt: new Date().toISOString(),
  };
}

export async function updatePatientFieldsInCloud(
  patient: Patient,
  ownerId: string,
  section: 'info' | 'hc' | 'hojaControl' | 'indicacionGuia' | 'notasVoz' | 'all'
): Promise<void> {
  const sanitized = sanitizePatientForFirestore(patient, ownerId);
  const path = `patients/${sanitized.id}`;
  const ref = doc(db, 'patients', sanitized.id);

  let updatePayload: Record<string, unknown>;
  switch (section) {
    case 'hc':
      updatePayload = { hc: stripUndefinedDeep(sanitized.hc), updatedAt: serverTimestamp() };
      break;
    case 'hojaControl':
      updatePayload = { hojaControl: stripUndefinedDeep(sanitized.hojaControl), updatedAt: serverTimestamp() };
      break;
    case 'indicacionGuia':
      updatePayload = { indicacionGuia: stripUndefinedDeep(sanitized.indicacionGuia), updatedAt: serverTimestamp() };
      break;
    case 'notasVoz':
      updatePayload = { notasVoz: stripUndefinedDeep(sanitized.notasVoz), updatedAt: serverTimestamp() };
      break;
    case 'info':
      updatePayload = {
        nombres: sanitized.nombres,
        apellidos: sanitized.apellidos,
        dni: sanitized.dni,
        celular: sanitized.celular,
        fechaNacimiento: sanitized.fechaNacimiento,
        direccion: sanitized.direccion,
        ocupacion: sanitized.ocupacion,
        etapaActual: sanitized.etapaActual,
        proximaCita: sanitized.proximaCita,
        ultimaCita: sanitized.ultimaCita,
        updatedAt: serverTimestamp(),
      };
      break;
    default:
      updatePayload = {
        nombres: sanitized.nombres,
        apellidos: sanitized.apellidos,
        dni: sanitized.dni,
        celular: sanitized.celular,
        fechaNacimiento: sanitized.fechaNacimiento,
        direccion: sanitized.direccion,
        ocupacion: sanitized.ocupacion,
        etapaActual: sanitized.etapaActual,
        proximaCita: sanitized.proximaCita,
        ultimaCita: sanitized.ultimaCita,
        hc: stripUndefinedDeep(sanitized.hc),
        hojaControl: stripUndefinedDeep(sanitized.hojaControl),
        indicacionGuia: stripUndefinedDeep(sanitized.indicacionGuia),
        notasVoz: stripUndefinedDeep(sanitized.notasVoz),
        updatedAt: serverTimestamp(),
      };
      break;
  }

  try {
    await updateDoc(ref, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePatientInCloud(patientId: string): Promise<void> {
  const path = `patients/${patientId}`;
  try {
    await deleteDoc(doc(db, 'patients', patientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function migrateLocalPatientsToCloud(
  localPatients: Patient[],
  cloudPatients: Patient[],
  ownerId: string,
  doctorDefaults?: { nombre?: string; especialidad?: string; cmp?: string; rne?: string }
): Promise<number> {
  const toMigrate = findPatientsToMigrate(localPatients, cloudPatients);
  let migratedCount = 0;
  for (const patient of toMigrate) {
    await createPatientInCloud(patient, ownerId, doctorDefaults);
    migratedCount += 1;
  }
  return migratedCount;
}
