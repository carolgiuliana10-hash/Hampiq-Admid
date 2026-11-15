/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, UserSession } from '../types/clinical';
import {
  createDefaultHojaControl,
  createDefaultIndicacionGuia,
  createEmptyAntecedentes,
  createEmptyCita,
} from './storage';

export const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function isValidFirestoreId(id: unknown): id is string {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && ID_PATTERN.test(id);
}

export function normalizeFirestoreId(rawId: unknown, prefix: string = 'paciente'): string {
  if (isValidFirestoreId(rawId)) return rawId;
  if (typeof rawId === 'string' && rawId.trim().length > 0) {
    const cleaned = rawId.trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
    if (cleaned.length > 0 && ID_PATTERN.test(cleaned)) return cleaned;
  }
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}

export function clampString(value: unknown, maxLength: number, fallback: string = ''): string {
  if (typeof value !== 'string') return fallback.slice(0, maxLength);
  const trimmed = value.trim();
  if (trimmed.length === 0 && fallback.length > 0) return fallback.slice(0, maxLength);
  return value.slice(0, maxLength);
}

export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val !== undefined) {
        result[key] = stripUndefinedDeep(val);
      }
    }
    return result as T;
  }
  return value;
}

export interface SanitizedUserProfileData {
  uid: string;
  email: string;
  nombre: string;
  especialidad: string;
  cmp: string;
  rne: string;
  rol: 'Doctora' | 'Equipo Asistencial';
}

export function sanitizeUserProfilePayload(
  input: Partial<UserSession> & { uid: string; email: string }
): SanitizedUserProfileData {
  const uid = normalizeFirestoreId(input.uid, 'user');
  const email = clampString(input.email, 200, 'usuario@hampiq.pe');
  const nombre = clampString(input.nombre, 120, 'Dra. Especialista Hampiq').trim() || 'Dra. Especialista Hampiq';
  const especialidad = clampString(input.especialidad, 160, 'Medicina Funcional y Antienvejecimiento');
  const cmp = clampString(input.cmp, 40, '');
  const rne = clampString(input.rne, 40, '');
  const rol: 'Doctora' | 'Equipo Asistencial' =
    input.rol === 'Equipo Asistencial' ? 'Equipo Asistencial' : 'Doctora';

  return {
    uid,
    email,
    nombre,
    especialidad,
    cmp,
    rne,
    rol,
  };
}

export interface SanitizedPatientDocData {
  id: string;
  ownerId: string;
  nombres: string;
  apellidos: string;
  dni: string;
  celular: string;
  fechaNacimiento: string;
  direccion: string;
  ocupacion: string;
  etapaActual: string;
  proximaCita: string;
  ultimaCita: string;
  hc: Patient['hc'];
  hojaControl: Patient['hojaControl'];
  indicacionGuia: Patient['indicacionGuia'];
  notasVoz: Patient['notasVoz'];
}

export function sanitizePatientForFirestore(
  patient: Patient,
  ownerId: string,
  doctorDefaults?: { nombre?: string; especialidad?: string; cmp?: string; rne?: string }
): SanitizedPatientDocData {
  const id = normalizeFirestoreId(patient.id, 'paciente');
  const safeOwnerId = normalizeFirestoreId(ownerId, 'user');
  const defaultIndicacion = createDefaultIndicacionGuia();
  const defaultHoja = createDefaultHojaControl();

  const rawCitas = Array.isArray(patient.hc?.citas) && patient.hc.citas.length > 0
    ? patient.hc.citas.slice(0, 50)
    : [createEmptyCita('Inicial', new Date().toISOString().split('T')[0])];

  const hc: Patient['hc'] = stripUndefinedDeep({
    antecedentes: patient.hc?.antecedentes
      ? { ...createEmptyAntecedentes(), ...patient.hc.antecedentes }
      : createEmptyAntecedentes(),
    citas: rawCitas,
    ...(patient.hc?.analisisEvolucionIA
      ? { analisisEvolucionIA: patient.hc.analisisEvolucionIA }
      : {}),
  });

  const hojaControl: Patient['hojaControl'] = stripUndefinedDeep({
    citas: (Array.isArray(patient.hojaControl?.citas) ? patient.hojaControl.citas : defaultHoja.citas).slice(0, 30),
    fechas: patient.hojaControl?.fechas && typeof patient.hojaControl.fechas === 'object'
      ? patient.hojaControl.fechas
      : defaultHoja.fechas,
    filas: (Array.isArray(patient.hojaControl?.filas) ? patient.hojaControl.filas : defaultHoja.filas).slice(0, 40),
  });

  const mergedDoctora = {
    nombre: clampString(
      patient.indicacionGuia?.doctora?.nombre || doctorDefaults?.nombre,
      120,
      defaultIndicacion.doctora.nombre
    ),
    especialidad: clampString(
      patient.indicacionGuia?.doctora?.especialidad || doctorDefaults?.especialidad,
      160,
      defaultIndicacion.doctora.especialidad
    ),
    cmp: clampString(
      patient.indicacionGuia?.doctora?.cmp ?? doctorDefaults?.cmp,
      40,
      defaultIndicacion.doctora.cmp
    ),
    rne: clampString(
      patient.indicacionGuia?.doctora?.rne ?? doctorDefaults?.rne,
      40,
      defaultIndicacion.doctora.rne
    ),
  };

  const indicacionGuia: Patient['indicacionGuia'] = stripUndefinedDeep({
    ...defaultIndicacion,
    ...(patient.indicacionGuia || {}),
    planSemanal: (
      Array.isArray(patient.indicacionGuia?.planSemanal) && patient.indicacionGuia.planSemanal.length > 0
        ? patient.indicacionGuia.planSemanal
        : defaultIndicacion.planSemanal
    ).slice(0, 14),
    reglasImportantes: (
      Array.isArray(patient.indicacionGuia?.reglasImportantes) && patient.indicacionGuia.reglasImportantes.length > 0
        ? patient.indicacionGuia.reglasImportantes
        : defaultIndicacion.reglasImportantes
    ).slice(0, 50),
    fuentesProteina: (
      Array.isArray(patient.indicacionGuia?.fuentesProteina) && patient.indicacionGuia.fuentesProteina.length > 0
        ? patient.indicacionGuia.fuentesProteina
        : defaultIndicacion.fuentesProteina
    ).slice(0, 50),
    higieneSuenoPautas: (
      Array.isArray(patient.indicacionGuia?.higieneSuenoPautas) && patient.indicacionGuia.higieneSuenoPautas.length > 0
        ? patient.indicacionGuia.higieneSuenoPautas
        : defaultIndicacion.higieneSuenoPautas
    ).slice(0, 50),
    doctora: mergedDoctora,
  });

  const notasVoz: Patient['notasVoz'] = stripUndefinedDeep(
    (Array.isArray(patient.notasVoz) ? patient.notasVoz : [])
      .filter((n) => n && typeof n === 'object')
      .slice(0, 200)
  );

  return {
    id,
    ownerId: safeOwnerId,
    nombres: clampString(patient.nombres, 120, 'Sin nombre').trim() || 'Sin nombre',
    apellidos: clampString(patient.apellidos, 120, 'Sin apellido').trim() || 'Sin apellido',
    dni: clampString(patient.dni, 32, 'Sin DNI').trim() || 'Sin DNI',
    celular: clampString(patient.celular, 40, ''),
    fechaNacimiento: clampString(patient.fechaNacimiento, 20, ''),
    direccion: clampString(patient.direccion, 240, ''),
    ocupacion: clampString(patient.ocupacion, 120, ''),
    etapaActual: clampString(patient.etapaActual, 120, 'Evaluación Inicial'),
    proximaCita: clampString(patient.proximaCita, 40, ''),
    ultimaCita: clampString(patient.ultimaCita, 40, ''),
    hc,
    hojaControl,
    indicacionGuia,
    notasVoz,
  };
}

export function findPatientsToMigrate(localPatients: Patient[], cloudPatients: Patient[]): Patient[] {
  const cloudIds = new Set(cloudPatients.map((p) => p.id));
  return localPatients.filter((p) => p && p.id && !cloudIds.has(p.id));
}

export function sortPatientsByUpdatedAt(patients: Patient[]): Patient[] {
  return [...patients].sort((a, b) => {
    const timeA = Date.parse(a.updatedAt || a.createdAt || '') || 0;
    const timeB = Date.parse(b.updatedAt || b.createdAt || '') || 0;
    return timeB - timeA;
  });
}

export function mapFirebaseAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo electrónico ingresado no tiene un formato válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido deshabilitada.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos. Verifica tus datos o usa "¿Olvidaste tu contraseña?".';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta registrada con ese correo electrónico. Inicia sesión con él.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/operation-not-allowed':
      return 'El acceso con correo y contraseña aún no está habilitado en la consola de Firebase. Habilítalo en Authentication > Sign-in method > Correo electrónico/contraseña, o ingresa con Google.';
    case 'auth/popup-closed-by-user':
      return 'Se cerró la ventana de Google antes de completar el ingreso.';
    case 'auth/popup-blocked':
      return 'Tu navegador bloqueó la ventana emergente de Google. Permite ventanas emergentes e intenta nuevamente.';
    case 'auth/requires-recent-login':
      return 'Por seguridad, ingresa tu contraseña actual nuevamente antes de cambiar tu correo o contraseña.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos seguidos. Espera unos minutos antes de volver a intentarlo.';
    case 'auth/network-request-failed':
      return 'Sin conexión a internet. Verifica tu red e intenta nuevamente.';
    default:
      return 'Ocurrió un error al autenticar. Verifica tus datos e intenta nuevamente.';
  }
}
