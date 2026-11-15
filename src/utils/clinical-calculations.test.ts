/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAge,
  calculateIMC,
  calculateWaistToHeightRatio,
  STRAW_STAGES,
  findNearestAppointment
} from './clinical-calculations';

test('calculateAge calculates exact age accurately', () => {
  assert.equal(calculateAge('1975-06-15', '2026-10-30'), 51);
  assert.equal(calculateAge('1975-11-20', '2026-10-30'), 50); // Birthday hasn't happened yet in 2026
  assert.equal(calculateAge(''), null);
  assert.equal(calculateAge('invalid-date'), null);
});

test('calculateIMC calculates BMI and categorization correctly', () => {
  // Normal weight: 60 kg, 1.62 m -> 22.9
  const resNormal = calculateIMC(60, 1.62);
  assert.equal(resNormal.formatted, '22.9');
  assert.equal(resNormal.categoria, 'Normal');

  // Input with cm height auto-converted: 68 kg, 160 cm -> 26.6 (Sobrepeso)
  const resSobrepeso = calculateIMC(68, 160);
  assert.equal(resSobrepeso.formatted, '26.6');
  assert.equal(resSobrepeso.categoria, 'Sobrepeso');

  // Obesidad I: 85 kg, 1.60 m -> 33.2
  const resObeso = calculateIMC(85, 1.60);
  assert.equal(resObeso.formatted, '33.2');
  assert.equal(resObeso.categoria, 'Obesidad Grado I');

  // Empty values
  const resEmpty = calculateIMC('', '');
  assert.equal(resEmpty.formatted, '—');
});

test('calculateWaistToHeightRatio calculates cardiometabolic risk accurately', () => {
  // 70 cm waist, 1.60 m height -> 70 / 160 = 0.44 (Riesgo bajo)
  const resLow = calculateWaistToHeightRatio(70, 1.60);
  assert.equal(resLow.formatted, '0.44');
  assert.match(resLow.riesgo, /Riesgo bajo/);

  // 86 cm waist, 1.60 m height -> 86 / 160 = 0.54 (Incrementado)
  const resInc = calculateWaistToHeightRatio(86, 160);
  assert.equal(resInc.formatted, '0.54');
  assert.match(resInc.riesgo, /incrementado/i);

  // 102 cm waist, 1.55 m height -> 102 / 155 = 0.66 (Sustancial)
  const resHigh = calculateWaistToHeightRatio(102, 1.55);
  assert.equal(resHigh.formatted, '0.66');
  assert.match(resHigh.riesgo, /sustancial/i);
});

test('STRAW_STAGES contains all official stages and detailed descriptions', () => {
  const keys = ['-3', '-2', '-1', '0', '+1a', '+1b', '+1c', '+2'];
  for (const k of keys) {
    assert.ok(STRAW_STAGES[k], `Missing STRAW stage ${k}`);
    assert.ok(STRAW_STAGES[k].label.length > 0);
    assert.ok(STRAW_STAGES[k].descripcion.length > 0);
  }
});

test('findNearestAppointment identifies upcoming appointment correctly', () => {
  const fechas = [
    { id: 'Inicial', fecha: '2026-08-01' },
    { id: 'C1', fecha: '2026-09-15' },
    { id: 'C2', fecha: '2026-11-10' },
    { id: 'C3', fecha: '2026-12-15' }
  ];
  // Assuming current date is late October 2026, C2 (2026-11-10) is upcoming
  const nearest = findNearestAppointment(fechas, '2026-10-30');
  assert.equal(nearest, 'C2');
});
