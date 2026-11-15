/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAnonymizedConsultationPayload,
  computeAppointmentCoverageSeries,
  computeBlockFrequencyStats,
  computeGlobalEvolutionSeries,
  normalizeMenopauseAnalysis,
  resolveCellScore,
} from './menopause-ai';
import { createEmptyCita, createNewPatient } from './storage';

test('buildAnonymizedConsultationPayload excludes diagnostico and PII fields', () => {
  const patient = createNewPatient('Maria', 'Quispe', '71234567', '1976-05-20', '987654321', 'Av. Real 100', 'Docente');
  patient.hc.citas[0].funcionesVitales.pesoKg = '64';
  patient.hc.citas[0].funcionesVitales.tallaCm = '160';
  patient.hc.citas[0].cincoEjes.eje1.sofocos = 'Moderados diarios (4/día)';
  patient.hc.citas[0].diagnostico.etapa = 'Perimenopausia tardía';
  patient.hc.citas[0].diagnostico.otrosDiagnosticos = 'NO DEBE APARECER';

  const payload = buildAnonymizedConsultationPayload(patient);
  const serialized = JSON.stringify(payload);

  assert.equal(serialized.includes('71234567'), false);
  assert.equal(serialized.includes('Maria'), false);
  assert.equal(serialized.includes('Quispe'), false);
  assert.equal(serialized.includes('Av. Real 100'), false);
  assert.equal(serialized.includes('NO DEBE APARECER'), false);
  assert.equal('diagnostico' in payload.citas[0], false);
  assert.equal(payload.citas[0].eje1VasomotorHormonal.sofocos, 'Moderados diarios (4/día)');
});

test('computeBlockFrequencyStats counts recorded clinical blocks across appointments accurately', () => {
  const c1 = createEmptyCita('Inicial', '2026-09-01');
  const c2 = createEmptyCita('C1', '2026-10-01');

  c1.funcionesVitales.presionArterial = '120/80';
  c2.funcionesVitales.presionArterial = '118/76';

  c1.cincoEjes.eje1.sofocos = 'Frecuentes';
  // c2 eje1 stays empty

  const stats = computeBlockFrequencyStats([c1, c2]);
  const vitales = stats.find((s) => s.cuadro === 'Funciones Vitales y Antropometría');
  const eje1 = stats.find((s) => s.cuadro === 'Eje 1: Vasomotor / Hormonal');
  const eje3 = stats.find((s) => s.cuadro === 'Eje 3: Genitourinario / Sexual');

  assert.equal(vitales?.citasConRegistro, 2);
  assert.equal(vitales?.totalCitas, 2);
  assert.equal(eje1?.citasConRegistro, 1);
  assert.deepEqual(eje1?.etiquetasRegistradas, ['Inicial']);
  assert.equal(eje3?.citasConRegistro, 0);
});

test('normalizeMenopauseAnalysis normalizes AI JSON response safely for UI and Firestore', () => {
  const c1 = createEmptyCita('Inicial', '2026-09-01');
  const c2 = createEmptyCita('C1', '2026-10-01');

  const raw = {
    filas: [
      {
        cuadro: 'Eje 1: Vasomotor / Hormonal',
        frecuenciaRegistro: '2/2 citas',
        tendencia: 'mejoria',
        analisisEvolucion: 'Reducción marcada de sofocos tras ajuste hormonal.',
        celdasPorCita: [
          { etiquetaCita: 'Inicial', estadoFrecuencia: 'Frecuentes', resumenCita: 'Sofocos 5/día', puntaje: 3 },
          { etiquetaCita: 'C1', estadoFrecuencia: 'Leves', resumenCita: 'Sofocos 1/día', puntaje: 8 },
        ],
      },
      {
        cuadro: 'Eje 3: Genitourinario / Sexual',
        frecuenciaRegistro: '0/2 citas',
        tendencia: 'invalid_enum_value',
        analisisEvolucion: '',
        celdasPorCita: [],
      },
    ],
    resumenGeneral: {
      evolucionGlobal: 'Evolución clínica favorable en síntomas vasomotores.',
      logrosPrincipales: ['Disminución de sofocos nocturnos'],
      areasAtencion: ['Completar tamizaje de Eje 3'],
      recomendacionesSeguimiento: ['Reevaluar sueño en C2'],
    },
  };

  const normalized = normalizeMenopauseAnalysis(raw, [c1, c2]);
  assert.equal(normalized.totalCitasAnalizadas, 2);
  assert.equal(normalized.filas.length, 2);
  assert.equal(normalized.filas[0].tendencia, 'mejoria');
  assert.equal(normalized.filas[0].celdasPorCita[0].puntaje, 3);
  assert.equal(normalized.filas[0].celdasPorCita[1].puntaje, 8);
  assert.equal(normalized.filas[0].celdasPorCita[1].resumenCita, 'Sofocos 1/día');
  assert.equal(normalized.filas[1].tendencia, 'estable');
  assert.equal(normalized.filas[1].celdasPorCita.length, 2);
  assert.equal(normalized.filas[1].celdasPorCita[0].puntaje, null);
  assert.equal(normalized.resumenGeneral.logrosPrincipales.length, 1);
});

test('resolveCellScore and chart series compute clean numeric trajectories', () => {
  assert.equal(resolveCellScore('Sin dato'), null);
  assert.equal(resolveCellScore('Severo', -1), null);
  assert.equal(resolveCellScore('Severo', 12), 10);
  assert.equal(resolveCellScore('Leve / Ocasional'), 7.5);
  assert.equal(resolveCellScore('Severo / Diario'), 1.5);

  const c1 = createEmptyCita('Inicial', '2026-09-01');
  const c2 = createEmptyCita('C1', '2026-10-01');
  c1.funcionesVitales.presionArterial = '120/80';
  c1.cincoEjes.eje1.sofocos = '5/día';
  c2.funcionesVitales.presionArterial = '115/75';

  const coverage = computeAppointmentCoverageSeries([c1, c2]);
  // Note: createEmptyCita initializes calidadVida.impactoGlobalPercibido = '7' (1 baseline block)
  assert.equal(coverage[0].value, 3);
  assert.equal(coverage[1].value, 2);

  const globalSeries = computeGlobalEvolutionSeries([c1, c2], [
    {
      cuadro: 'Eje 1',
      frecuenciaRegistro: '2/2 citas',
      tendencia: 'mejoria',
      analisisEvolucion: 'Mejoría clara.',
      celdasPorCita: [
        { etiquetaCita: 'Inicial', fecha: '2026-09-01', estadoFrecuencia: 'Severo', resumenCita: '5/día', puntaje: 2 },
        { etiquetaCita: 'C1', fecha: '2026-10-01', estadoFrecuencia: 'Leve', resumenCita: '1/día', puntaje: 8 },
      ],
    },
    {
      cuadro: 'Eje 2',
      frecuenciaRegistro: '2/2 citas',
      tendencia: 'mejoria',
      analisisEvolucion: 'Descanso mejor.',
      celdasPorCita: [
        { etiquetaCita: 'Inicial', fecha: '2026-09-01', estadoFrecuencia: 'Moderado', resumenCita: 'Insomnio parcial', puntaje: 4 },
        { etiquetaCita: 'C1', fecha: '2026-10-01', estadoFrecuencia: 'Óptimo', resumenCita: 'Duerme 7h', puntaje: 9 },
      ],
    },
  ]);

  assert.equal(globalSeries[0].value, 3);
  assert.equal(globalSeries[1].value, 8.5);
});
