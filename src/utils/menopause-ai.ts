/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EvolucionIAAnalisis,
  EvolucionIAFila,
  HCCita,
  Patient,
  TendenciaEvolucion,
} from '../types/clinical';
import { calculateAge, calculateIMC, calculateWaistToHeightRatio } from './clinical-calculations';

export interface BlockFrequencyStat {
  cuadro: string;
  citasConRegistro: number;
  totalCitas: number;
  etiquetasRegistradas: string[];
}

export interface AnonymizedCitaPayload {
  etiqueta: string;
  fecha: string;
  funcionesVitalesYAntropometria: Record<string, unknown>;
  suenoYFuncionesBiologicas: Record<string, unknown>;
  examenFisico: Record<string, unknown>;
  eje1VasomotorHormonal: Record<string, string>;
  eje2NeurologicoSuenoPsicoemocional: Record<string, string>;
  eje3GenitourinarioSexual: Record<string, string>;
  eje4Cardiometabolico: Record<string, string>;
  eje5MusculoesqueleticoOseo: Record<string, string>;
  calidadVida: Record<string, string>;
  laboratorioHormonasTamizajes: Record<string, unknown>;
  efectosAdversosAlarmas: Record<string, unknown>;
  tratamientoPrescrito: Record<string, unknown>;
}

export interface AnonymizedClinicalPayload {
  edadAnos: number | null;
  etapaActual: string;
  antecedentesBasales: {
    strawEtapa: string;
    tipoMenopausia: string;
    embarazoPosible: string;
    cirugia: Record<string, unknown>;
    simuladoresActivos: string[];
    agravantesActivos: string[];
    modificadoresActivos: string[];
    habitos: Record<string, string>;
    thmPreviaActual: string;
  };
  citas: AnonymizedCitaPayload[];
}

function collectTrueKeys(obj: Record<string, unknown> | undefined, exclude: string[] = []): string[] {
  if (!obj) return [];
  const active: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (exclude.includes(k)) continue;
    if (v === true) active.push(k);
  }
  return active;
}

function hasAnyNonEmptyValue(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (typeof val === 'boolean') return val === true;
  if (Array.isArray(val)) return val.some((item) => hasAnyNonEmptyValue(item));
  if (typeof val === 'object') {
    return Object.values(val as Record<string, unknown>).some((v) => hasAnyNonEmptyValue(v));
  }
  return false;
}

export function buildAnonymizedConsultationPayload(patient: Patient): AnonymizedClinicalPayload {
  const { antecedentes, citas } = patient.hc;
  const edadAnos = calculateAge(patient.fechaNacimiento);

  const sanitizedCitas: AnonymizedCitaPayload[] = citas.map((c) => {
    const imcRes = calculateIMC(c.funcionesVitales.pesoKg, c.funcionesVitales.tallaCm);
    const ctRes = calculateWaistToHeightRatio(
      c.funcionesVitales.cinturaCm,
      c.funcionesVitales.tallaCm
    );

    return {
      etiqueta: c.etiqueta,
      fecha: c.fecha || 'Sin fecha',
      funcionesVitalesYAntropometria: {
        presionArterial: c.funcionesVitales.presionArterial,
        frecuenciaCardiaca: c.funcionesVitales.frecuenciaCardiaca,
        frecuenciaRespiratoria: c.funcionesVitales.frecuenciaRespiratoria,
        saturacionO2: c.funcionesVitales.saturacionO2,
        temperatura: c.funcionesVitales.temperatura,
        pesoKg: c.funcionesVitales.pesoKg,
        tallaCm: c.funcionesVitales.tallaCm,
        imcCalculado: imcRes.formatted !== '—' ? `${imcRes.formatted} (${imcRes.categoria})` : '',
        cinturaCm: c.funcionesVitales.cinturaCm,
        cinturaTallaCalculado:
          ctRes.formatted !== '—' ? `${ctRes.formatted} (${ctRes.riesgo})` : '',
      },
      suenoYFuncionesBiologicas: {
        apetito: c.funcionesVitales.apetito,
        sed: c.funcionesVitales.sed,
        deposiciones: c.funcionesVitales.deposiciones,
        miccion: c.funcionesVitales.miccion,
        actividadFisica: c.funcionesVitales.actividadFisica,
        funcionSexual: c.funcionesVitales.funcionSexual,
        suenoHoras: c.funcionesVitales.suenoHoras,
        alertasSueno: collectTrueKeys(c.funcionesVitales as unknown as Record<string, unknown>, [
          'presionArterial',
          'frecuenciaCardiaca',
          'frecuenciaRespiratoria',
          'saturacionO2',
          'temperatura',
          'pesoKg',
          'tallaCm',
          'imc',
          'cinturaCm',
          'cinturaTalla',
          'apetito',
          'sed',
          'deposiciones',
          'miccion',
          'actividadFisica',
          'funcionSexual',
          'suenoHoras',
        ]),
      },
      examenFisico: {
        general: c.examenFisico.general,
        dermatologico: c.examenFisico.dermatologico,
        cardiovascular: c.examenFisico.cardiovascular,
        respiratorio: c.examenFisico.respiratorio,
        tiroides: c.examenFisico.tiroides,
        tiroidesOtro: c.examenFisico.tiroidesOtro,
        mama: c.examenFisico.mama,
        abdomen: c.examenFisico.abdomen,
        ginecologico: c.examenFisico.ginecologico,
        musculoesqueleticoNeurologico: c.examenFisico.musculoesqueleticoNeurologico,
        psicologicoEmocional: c.examenFisico.psicologicoEmocional,
      },
      eje1VasomotorHormonal: { ...c.cincoEjes.eje1 },
      eje2NeurologicoSuenoPsicoemocional: { ...c.cincoEjes.eje2 },
      eje3GenitourinarioSexual: { ...c.cincoEjes.eje3 },
      eje4Cardiometabolico: { ...c.cincoEjes.eje4 },
      eje5MusculoesqueleticoOseo: { ...c.cincoEjes.eje5 },
      calidadVida: { ...c.cincoEjes.calidadVida },
      laboratorioHormonasTamizajes: {
        laboratorio: c.laboratorio,
        hormonas: c.hormonas,
        tamizajesEstudios: c.tamizajesEstudios,
      },
      efectosAdversosAlarmas: { ...c.alarmas },
      tratamientoPrescrito: { ...c.tratamiento },
    };
  });

  return {
    edadAnos,
    etapaActual: patient.etapaActual || '',
    antecedentesBasales: {
      strawEtapa: antecedentes.strawEtapa,
      tipoMenopausia: antecedentes.tipoMenopausia,
      embarazoPosible: antecedentes.embarazoPosible,
      cirugia: { ...antecedentes.cirugia },
      simuladoresActivos: collectTrueKeys(
        antecedentes.simuladores as unknown as Record<string, unknown>,
        ['detalle']
      ),
      agravantesActivos: collectTrueKeys(
        antecedentes.agravantes as unknown as Record<string, unknown>,
        ['detalle']
      ),
      modificadoresActivos: collectTrueKeys(
        antecedentes.modificadores as unknown as Record<string, unknown>,
        ['otraSituacionCompleja', 'detalleFechaTratamiento']
      ),
      habitos: { ...antecedentes.habitos },
      thmPreviaActual: antecedentes.medicamentosPrevios.thmPreviaActual,
    },
    citas: sanitizedCitas,
  };
}

export function computeBlockFrequencyStats(citas: HCCita[]): BlockFrequencyStat[] {
  const totalCitas = citas.length;
  const extractors: Array<{ cuadro: string; hasData: (c: HCCita) => boolean }> = [
    {
      cuadro: 'Funciones Vitales y Antropometría',
      hasData: (c) =>
        hasAnyNonEmptyValue({
          pa: c.funcionesVitales.presionArterial,
          fc: c.funcionesVitales.frecuenciaCardiaca,
          fr: c.funcionesVitales.frecuenciaRespiratoria,
          sat: c.funcionesVitales.saturacionO2,
          temp: c.funcionesVitales.temperatura,
          peso: c.funcionesVitales.pesoKg,
          talla: c.funcionesVitales.tallaCm,
          cintura: c.funcionesVitales.cinturaCm,
        }),
    },
    {
      cuadro: 'Sueño y Funciones Biológicas',
      hasData: (c) =>
        hasAnyNonEmptyValue({
          apetito: c.funcionesVitales.apetito,
          sed: c.funcionesVitales.sed,
          deposiciones: c.funcionesVitales.deposiciones,
          miccion: c.funcionesVitales.miccion,
          actividadFisica: c.funcionesVitales.actividadFisica,
          funcionSexual: c.funcionesVitales.funcionSexual,
          suenoHoras: c.funcionesVitales.suenoHoras,
          conciliacionDificil: c.funcionesVitales.conciliacionDificil,
          despertaresFrecuentes: c.funcionesVitales.despertaresFrecuentes,
          despertarPrecoz: c.funcionesVitales.despertarPrecoz,
          ronquidosImportantes: c.funcionesVitales.ronquidosImportantes,
          pausasRespiratoriasObservadas: c.funcionesVitales.pausasRespiratoriasObservadas,
          somnolenciaDiurna: c.funcionesVitales.somnolenciaDiurna,
          necesidadMoverPiernas: c.funcionesVitales.necesidadMoverPiernas,
          nocturia: c.funcionesVitales.nocturia,
        }),
    },
    {
      cuadro: 'Examen Físico Dirigido',
      hasData: (c) =>
        hasAnyNonEmptyValue({
          general: c.examenFisico.general,
          dermatologico: c.examenFisico.dermatologico,
          cardiovascular: c.examenFisico.cardiovascular,
          respiratorio: c.examenFisico.respiratorio,
          tiroidesOtro: c.examenFisico.tiroidesOtro,
          mama: c.examenFisico.mama,
          abdomen: c.examenFisico.abdomen,
          ginecologico: c.examenFisico.ginecologico,
          musculoesqueleticoNeurologico: c.examenFisico.musculoesqueleticoNeurologico,
          tiroidesMod: c.examenFisico.tiroides !== 'normal' && c.examenFisico.tiroides !== '',
        }),
    },
    {
      cuadro: 'Eje 1: Vasomotor / Hormonal',
      hasData: (c) => hasAnyNonEmptyValue(c.cincoEjes.eje1),
    },
    {
      cuadro: 'Eje 2: Neurológico / Sueño / Psicoemocional',
      hasData: (c) => hasAnyNonEmptyValue(c.cincoEjes.eje2),
    },
    {
      cuadro: 'Eje 3: Genitourinario / Sexual',
      hasData: (c) => hasAnyNonEmptyValue(c.cincoEjes.eje3),
    },
    {
      cuadro: 'Eje 4: Cardiometabólico / Composición Corporal',
      hasData: (c) => hasAnyNonEmptyValue(c.cincoEjes.eje4),
    },
    {
      cuadro: 'Eje 5: Musculoesquelético / Hueso / Función',
      hasData: (c) => hasAnyNonEmptyValue(c.cincoEjes.eje5),
    },
    {
      cuadro: 'Calidad de Vida (Impacto Global)',
      hasData: (c) => hasAnyNonEmptyValue(c.cincoEjes.calidadVida),
    },
    {
      cuadro: 'Laboratorio, Hormonas y Tamizajes',
      hasData: (c) =>
        hasAnyNonEmptyValue({
          lab: c.laboratorio,
          hormonas: c.hormonas,
          tamizajes: c.tamizajesEstudios,
        }),
    },
    {
      cuadro: 'Efectos Adversos / Alarmas',
      hasData: (c) => hasAnyNonEmptyValue(c.alarmas),
    },
    {
      cuadro: 'Tratamiento Prescrito',
      hasData: (c) => hasAnyNonEmptyValue(c.tratamiento),
    },
  ];

  return extractors.map((ext) => {
    const registradas = citas.filter((c) => ext.hasData(c)).map((c) => c.etiqueta);
    return {
      cuadro: ext.cuadro,
      citasConRegistro: registradas.length,
      totalCitas,
      etiquetasRegistradas: registradas,
    };
  });
}

const VALID_TENDENCIAS: TendenciaEvolucion[] = [
  'mejoria',
  'estable',
  'empeoramiento',
  'mixta',
  'sin_datos',
];

export function resolveCellScore(estadoFrecuencia: string, rawPuntaje?: unknown): number | null {
  if (typeof rawPuntaje === 'number' && Number.isFinite(rawPuntaje)) {
    if (rawPuntaje < 0) return null;
    return Math.round(Math.min(10, Math.max(0, rawPuntaje)) * 10) / 10;
  }

  const normalized = (estadoFrecuencia || '').trim().toLowerCase();
  if (
    !normalized ||
    normalized === '—' ||
    normalized.includes('sin dato') ||
    normalized.includes('no registr')
  ) {
    return null;
  }
  if (
    normalized.includes('severo') ||
    normalized.includes('severa') ||
    normalized.includes('grave') ||
    normalized.includes('alarma') ||
    normalized.includes('diario') ||
    normalized.includes('descontrol')
  ) {
    return 1.5;
  }
  if (
    normalized.includes('frecuente') ||
    normalized.includes('persistente') ||
    normalized.includes('alterad') ||
    normalized.includes('mal')
  ) {
    return 3;
  }
  if (
    normalized.includes('moderad') ||
    normalized.includes('parcial') ||
    normalized.includes('mixt')
  ) {
    return 5;
  }
  if (
    normalized.includes('óptim') ||
    normalized.includes('optim') ||
    normalized.includes('normal') ||
    normalized.includes('asintom') ||
    normalized.includes('controlad') ||
    normalized.includes('resuelt') ||
    normalized.includes('sin síntom') ||
    normalized.includes('sin sintom')
  ) {
    return 9;
  }
  if (
    normalized.includes('leve') ||
    normalized.includes('ocasional') ||
    normalized.includes('buen') ||
    normalized.includes('adecuad')
  ) {
    return 7.5;
  }
  if (normalized.includes('registrad') || normalized.includes('estable')) {
    return 6;
  }
  return 6;
}

export interface ChartDataPoint {
  etiqueta: string;
  fecha: string;
  value: number | null;
  estado?: string;
  detail?: string;
}

export function computeAppointmentCoverageSeries(citas: HCCita[]): ChartDataPoint[] {
  const statsPerBlock = [
    (c: HCCita) =>
      hasAnyNonEmptyValue({
        pa: c.funcionesVitales.presionArterial,
        fc: c.funcionesVitales.frecuenciaCardiaca,
        fr: c.funcionesVitales.frecuenciaRespiratoria,
        sat: c.funcionesVitales.saturacionO2,
        temp: c.funcionesVitales.temperatura,
        peso: c.funcionesVitales.pesoKg,
        talla: c.funcionesVitales.tallaCm,
        cintura: c.funcionesVitales.cinturaCm,
      }),
    (c: HCCita) =>
      hasAnyNonEmptyValue({
        apetito: c.funcionesVitales.apetito,
        sed: c.funcionesVitales.sed,
        deposiciones: c.funcionesVitales.deposiciones,
        miccion: c.funcionesVitales.miccion,
        actividadFisica: c.funcionesVitales.actividadFisica,
        funcionSexual: c.funcionesVitales.funcionSexual,
        suenoHoras: c.funcionesVitales.suenoHoras,
        conciliacionDificil: c.funcionesVitales.conciliacionDificil,
        despertaresFrecuentes: c.funcionesVitales.despertaresFrecuentes,
        despertarPrecoz: c.funcionesVitales.despertarPrecoz,
        ronquidosImportantes: c.funcionesVitales.ronquidosImportantes,
        pausasRespiratoriasObservadas: c.funcionesVitales.pausasRespiratoriasObservadas,
        somnolenciaDiurna: c.funcionesVitales.somnolenciaDiurna,
        necesidadMoverPiernas: c.funcionesVitales.necesidadMoverPiernas,
        nocturia: c.funcionesVitales.nocturia,
      }),
    (c: HCCita) =>
      hasAnyNonEmptyValue({
        general: c.examenFisico.general,
        dermatologico: c.examenFisico.dermatologico,
        cardiovascular: c.examenFisico.cardiovascular,
        respiratorio: c.examenFisico.respiratorio,
        tiroidesOtro: c.examenFisico.tiroidesOtro,
        mama: c.examenFisico.mama,
        abdomen: c.examenFisico.abdomen,
        ginecologico: c.examenFisico.ginecologico,
        musculoesqueleticoNeurologico: c.examenFisico.musculoesqueleticoNeurologico,
        tiroidesMod: c.examenFisico.tiroides !== 'normal' && c.examenFisico.tiroides !== '',
      }),
    (c: HCCita) => hasAnyNonEmptyValue(c.cincoEjes.eje1),
    (c: HCCita) => hasAnyNonEmptyValue(c.cincoEjes.eje2),
    (c: HCCita) => hasAnyNonEmptyValue(c.cincoEjes.eje3),
    (c: HCCita) => hasAnyNonEmptyValue(c.cincoEjes.eje4),
    (c: HCCita) => hasAnyNonEmptyValue(c.cincoEjes.eje5),
    (c: HCCita) => hasAnyNonEmptyValue(c.cincoEjes.calidadVida),
    (c: HCCita) =>
      hasAnyNonEmptyValue({
        lab: c.laboratorio,
        hormonas: c.hormonas,
        tamizajes: c.tamizajesEstudios,
      }),
    (c: HCCita) => hasAnyNonEmptyValue(c.alarmas),
    (c: HCCita) => hasAnyNonEmptyValue(c.tratamiento),
  ];

  return citas.map((cita) => {
    const count = statsPerBlock.reduce((acc, fn) => acc + (fn(cita) ? 1 : 0), 0);
    return {
      etiqueta: cita.etiqueta,
      fecha: cita.fecha || '',
      value: count,
      estado: `${count}/12 cuadros`,
      detail: `${count} de 12 cuadros clínicos evaluados en ${cita.etiqueta}.`,
    };
  });
}

export function computeGlobalEvolutionSeries(
  citas: HCCita[],
  filas: EvolucionIAFila[]
): ChartDataPoint[] {
  return citas.map((cita, idx) => {
    const scores: number[] = [];
    for (const fila of filas) {
      const cell =
        fila.celdasPorCita.find((c) => c.etiquetaCita === cita.etiqueta) ||
        fila.celdasPorCita[idx];
      if (!cell) continue;
      const score = resolveCellScore(cell.estadoFrecuencia, cell.puntaje);
      if (score !== null) scores.push(score);
    }

    if (scores.length === 0) {
      return {
        etiqueta: cita.etiqueta,
        fecha: cita.fecha || '',
        value: null,
        estado: 'Sin datos',
        detail: 'No se registraron cuadros evaluables en esta cita.',
      };
    }

    const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    return {
      etiqueta: cita.etiqueta,
      fecha: cita.fecha || '',
      value: avg,
      estado: `${avg}/10 promedio (${scores.length} cuadros)`,
      detail: `Índice global de control clínico de ${avg}/10 promediado sobre ${scores.length} cuadros evaluados.`,
    };
  });
}

export function normalizeMenopauseAnalysis(raw: unknown, citas: HCCita[]): EvolucionIAAnalisis {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const rawFilas = Array.isArray(input.filas) ? input.filas : [];

  const filas: EvolucionIAFila[] = rawFilas
    .filter((f) => f && typeof f === 'object')
    .slice(0, 20)
    .map((f) => {
      const row = f as Record<string, unknown>;
      const rawTendencia = typeof row.tendencia === 'string' ? row.tendencia : 'sin_datos';
      const tendencia: TendenciaEvolucion = VALID_TENDENCIAS.includes(
        rawTendencia as TendenciaEvolucion
      )
        ? (rawTendencia as TendenciaEvolucion)
        : 'estable';

      const rawCeldas = Array.isArray(row.celdasPorCita) ? row.celdasPorCita : [];
      const celdasPorCita = citas.map((cita, idx) => {
        const match =
          rawCeldas.find(
            (c) =>
              c &&
              typeof c === 'object' &&
              (c as Record<string, unknown>).etiquetaCita === cita.etiqueta
          ) || rawCeldas[idx];
        const cell = (match && typeof match === 'object' ? match : {}) as Record<string, unknown>;
        const estadoFrecuencia =
          typeof cell.estadoFrecuencia === 'string' && cell.estadoFrecuencia.trim()
            ? cell.estadoFrecuencia.trim().slice(0, 60)
            : 'Sin dato';
        return {
          etiquetaCita: cita.etiqueta,
          fecha: cita.fecha || '',
          estadoFrecuencia,
          resumenCita:
            typeof cell.resumenCita === 'string' && cell.resumenCita.trim()
              ? cell.resumenCita.trim().slice(0, 240)
              : '—',
          puntaje: resolveCellScore(estadoFrecuencia, cell.puntaje),
        };
      });

      return {
        cuadro:
          typeof row.cuadro === 'string' && row.cuadro.trim()
            ? row.cuadro.trim().slice(0, 120)
            : 'Cuadro clínico',
        frecuenciaRegistro:
          typeof row.frecuenciaRegistro === 'string' && row.frecuenciaRegistro.trim()
            ? row.frecuenciaRegistro.trim().slice(0, 60)
            : `${citas.length} cita(s)`,
        celdasPorCita,
        tendencia,
        analisisEvolucion:
          typeof row.analisisEvolucion === 'string' && row.analisisEvolucion.trim()
            ? row.analisisEvolucion.trim().slice(0, 500)
            : 'Sin hallazgos evolutivos registrados.',
      };
    });

  const rawResumen = (
    input.resumenGeneral && typeof input.resumenGeneral === 'object' ? input.resumenGeneral : {}
  ) as Record<string, unknown>;

  const toStringList = (val: unknown): string[] =>
    Array.isArray(val)
      ? val
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map((item) => item.trim().slice(0, 300))
          .slice(0, 10)
      : [];

  return {
    generadoEn: new Date().toISOString(),
    totalCitasAnalizadas: citas.length,
    filas,
    resumenGeneral: {
      evolucionGlobal:
        typeof rawResumen.evolucionGlobal === 'string' && rawResumen.evolucionGlobal.trim()
          ? rawResumen.evolucionGlobal.trim().slice(0, 2000)
          : 'No se encontró suficiente información clínica registrada para emitir un resumen evolutivo.',
      logrosPrincipales: toStringList(rawResumen.logrosPrincipales),
      areasAtencion: toStringList(rawResumen.areasAtencion),
      recomendacionesSeguimiento: toStringList(rawResumen.recomendacionesSeguimiento),
    },
  };
}
