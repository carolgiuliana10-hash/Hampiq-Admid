/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidFirestoreId,
  normalizeFirestoreId,
  sanitizePatientForFirestore,
  sanitizeUserProfilePayload,
  findPatientsToMigrate,
  sortPatientsByUpdatedAt,
  mapFirebaseAuthError,
} from './patient-sync-pure';
import { createNewPatient } from './storage';

test('isValidFirestoreId enforces length and character rules', () => {
  assert.equal(isValidFirestoreId('paciente_abc123'), true);
  assert.equal(isValidFirestoreId('user-UID-01'), true);
  assert.equal(isValidFirestoreId(''), false);
  assert.equal(isValidFirestoreId('bad/id'), false);
  assert.equal(isValidFirestoreId('bad id with spaces'), false);
  assert.equal(isValidFirestoreId('a'.repeat(129)), false);
});

test('normalizeFirestoreId cleans invalid IDs safely', () => {
  assert.equal(normalizeFirestoreId('pac 123/4'), 'pac_123_4');
  assert.match(normalizeFirestoreId('', 'pac'), /^pac_/);
});

test('sanitizeUserProfilePayload enforces bounds and defaults', () => {
  const sanitized = sanitizeUserProfilePayload({
    uid: 'uid_doc_1',
    email: 'doctora@clinica.pe',
    nombre: '  ',
    especialidad: 'Medicina Funcional',
    cmp: '12345',
    rne: '67890',
    rol: 'Doctora',
  });
  assert.equal(sanitized.uid, 'uid_doc_1');
  assert.equal(sanitized.nombre, 'Dra. Especialista Hampiq');
  assert.equal(sanitized.rol, 'Doctora');
});

test('sanitizePatientForFirestore strips undefined and respects Firestore limits', () => {
  const patient = createNewPatient('Ana', 'López', '12345678', '1978-04-12');
  (patient as unknown as Record<string, unknown>).extraGhostField = 'should-be-stripped';
  (patient.hc.antecedentes as unknown as Record<string, unknown>).undefField = undefined;

  const sanitized = sanitizePatientForFirestore(patient, 'uid_123', {
    nombre: 'Dra. Carol Ruiz',
    especialidad: 'Ginecología',
    cmp: 'CMP: 99999',
    rne: 'RNE: 11111',
  });

  assert.equal(sanitized.ownerId, 'uid_123');
  assert.equal('extraGhostField' in sanitized, false);
  assert.equal('undefField' in sanitized.hc.antecedentes, false);
  assert.ok(sanitized.hc.citas.length >= 1);
  assert.ok(sanitized.indicacionGuia.planSemanal.length <= 14);
});

test('findPatientsToMigrate only selects local patients absent from cloud', () => {
  const p1 = createNewPatient('Rosa', 'Perez', '11111111', '1975-01-01');
  const p2 = createNewPatient('Lucia', 'Gomez', '22222222', '1976-02-02');
  const p3 = createNewPatient('Carmen', 'Diaz', '33333333', '1977-03-03');

  const toMigrate = findPatientsToMigrate([p1, p2, p3], [p2]);
  assert.equal(toMigrate.length, 2);
  assert.deepEqual(
    toMigrate.map((p) => p.id),
    [p1.id, p3.id]
  );
});

test('sortPatientsByUpdatedAt orders newest first', () => {
  const p1 = createNewPatient('A', 'A', '1', '1980-01-01');
  const p2 = createNewPatient('B', 'B', '2', '1980-01-01');
  p1.updatedAt = '2026-10-01T10:00:00.000Z';
  p2.updatedAt = '2026-11-15T10:00:00.000Z';

  const sorted = sortPatientsByUpdatedAt([p1, p2]);
  assert.equal(sorted[0].id, p2.id);
  assert.equal(sorted[1].id, p1.id);
});

test('mapFirebaseAuthError returns Spanish user-friendly messages', () => {
  assert.match(mapFirebaseAuthError('auth/operation-not-allowed'), /consola de Firebase/i);
  assert.match(mapFirebaseAuthError('auth/invalid-credential'), /incorrectos/i);
  assert.match(mapFirebaseAuthError('auth/weak-password'), /6 caracteres/i);
});
