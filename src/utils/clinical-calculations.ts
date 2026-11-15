/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculates exact age in years from an ISO birth date string (YYYY-MM-DD).
 */
export function calculateAge(birthDateString: string, referenceDateString?: string): number | null {
  if (!birthDateString) return null;
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return null;

  const refDate = referenceDateString ? new Date(referenceDateString) : new Date();
  let age = refDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = refDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Calculates Body Mass Index (IMC) = weight (kg) / height (m)^2.
 * Returns formatted string to 1 decimal place and classification.
 */
export function calculateIMC(pesoKg: number | string, tallaM: number | string): {
  imc: number | null;
  formatted: string;
  categoria: string;
  badgeColor: string;
} {
  const peso = typeof pesoKg === 'number' ? pesoKg : parseFloat(pesoKg);
  let talla = typeof tallaM === 'number' ? tallaM : parseFloat(tallaM);

  // If user entered height in cm (e.g. 158 instead of 1.58), convert to meters
  if (talla > 30) {
    talla = talla / 100;
  }

  if (!peso || !talla || isNaN(peso) || isNaN(talla) || peso <= 0 || talla <= 0) {
    return { imc: null, formatted: '—', categoria: 'Sin datos', badgeColor: 'text-slate-500' };
  }

  const imcVal = Number((peso / (talla * talla)).toFixed(1));

  let categoria = 'Normal';
  let badgeColor = 'text-emerald-700';

  if (imcVal < 18.5) {
    categoria = 'Bajo peso';
    badgeColor = 'text-amber-700';
  } else if (imcVal >= 25 && imcVal < 30) {
    categoria = 'Sobrepeso';
    badgeColor = 'text-amber-700';
  } else if (imcVal >= 30 && imcVal < 35) {
    categoria = 'Obesidad Grado I';
    badgeColor = 'text-orange-700';
  } else if (imcVal >= 35 && imcVal < 40) {
    categoria = 'Obesidad Grado II';
    badgeColor = 'text-rose-700';
  } else if (imcVal >= 40) {
    categoria = 'Obesidad Grado III';
    badgeColor = 'text-rose-800';
  }

  return { imc: imcVal, formatted: imcVal.toFixed(1), categoria, badgeColor };
}

/**
 * Calculates Waist-to-Height Ratio (Índice Cintura / Talla)
 * Normal for women is typically < 0.5 (cardiometabolic risk begins at >= 0.5).
 */
export function calculateWaistToHeightRatio(cinturaCm: number | string, tallaM: number | string): {
  ratio: number | null;
  formatted: string;
  riesgo: string;
  badgeColor: string;
} {
  const cintura = typeof cinturaCm === 'number' ? cinturaCm : parseFloat(cinturaCm);
  let talla = typeof tallaM === 'number' ? tallaM : parseFloat(tallaM);

  // Ensure talla is in cm
  if (talla < 3) {
    talla = talla * 100;
  }

  if (!cintura || !talla || isNaN(cintura) || isNaN(talla) || cintura <= 0 || talla <= 0) {
    return { ratio: null, formatted: '—', riesgo: 'Sin datos', badgeColor: 'text-slate-500' };
  }

  const ratioVal = Number((cintura / talla).toFixed(2));
  let riesgo = 'Riesgo bajo (< 0.50)';
  let badgeColor = 'text-emerald-700';

  if (ratioVal >= 0.50 && ratioVal < 0.60) {
    riesgo = 'Riesgo cardiometabólico incrementado (≥ 0.50)';
    badgeColor = 'text-amber-700';
  } else if (ratioVal >= 0.60) {
    riesgo = 'Riesgo cardiometabólico sustancial (≥ 0.60)';
    badgeColor = 'text-rose-700';
  }

  return { ratio: ratioVal, formatted: ratioVal.toFixed(2), riesgo, badgeColor };
}

/**
 * Descriptions for STRAW + 10 Stages (Stages of Reproductive Aging Workshop)
 */
export const STRAW_STAGES: Record<string, { label: string; etapa: string; descripcion: string; caracteristicas: string }> = {
  '-3': {
    label: '−3: Reproductiva tardía',
    etapa: 'Reproductiva',
    descripcion: 'Ciclos menstruales regulares o cambios sutiles en duración/flujo.',
    caracteristicas: 'FSH normal o ligeramente elevada en fase folicular temprana. AMH/inhibina B en descenso.'
  },
  '-2': {
    label: '−2: Transición temprana a la menopausia',
    etapa: 'Perimenopausia Temprana',
    descripcion: 'Diferencia persistente de ≥ 7 días en la duración de ciclos consecutivos.',
    caracteristicas: 'Fluctuaciones hormonales amplias, inicio de síntomas vasomotores leves en algunas pacientes.'
  },
  '-1': {
    label: '−1: Transición tardía a la menopausia',
    etapa: 'Perimenopausia Tardía',
    descripcion: 'Intervalo de amenorrea ≥ 60 días en los últimos 12 meses.',
    caracteristicas: 'Fluctuación estrogénica máxima, sofocos y síntomas neurológicos más frecuentes e intensos.'
  },
  '0': {
    label: '0: FUM final (Menopausia)',
    etapa: 'Menopausia',
    descripcion: 'Cese permanente de la menstruación (confirmado retrospectivamente tras 12 meses de amenorrea).',
    caracteristicas: 'Punto de inflexión hormonal definitivo.'
  },
  '+1a': {
    label: '+1a: Posmenopausia muy temprana',
    etapa: 'Posmenopausia',
    descripcion: 'Año 1 posterior a la última menstruación (completando los 12 meses de amenorrea).',
    caracteristicas: 'FSH elevada de forma persistente, estradiol bajo. Síntomas vasomotores aún prominentes.'
  },
  '+1b': {
    label: '+1b: Posmenopausia temprana',
    etapa: 'Posmenopausia',
    descripcion: 'Años 2 a 5-6 posteriores a la menopausia.',
    caracteristicas: 'Estabilización de niveles hormonales bajos. Pérdida ósea acelerada y mayor riesgo cardiometabólico.'
  },
  '+1c': {
    label: '+1c: Posmenopausia tardía estabilizada',
    etapa: 'Posmenopausia',
    descripcion: 'Años 6 en adelante posteriores a la menopausia.',
    caracteristicas: 'Atenuación de sofocos vasomotores pero incremento de GSM (síndrome genitourinario).'
  },
  '+2': {
    label: '+2: Posmenopausia tardía / vejez',
    etapa: 'Posmenopausia Tardía',
    descripcion: 'Etapa que abarca el resto de la vida (> 10 años desde la menopausia o edad ≥ 65-70 años).',
    caracteristicas: 'Vulnerabilidad a sarcopenia, fragilidad ósea, declive cognitivo y afecciones cardiovasculares.'
  }
};

/**
 * Finds the nearest upcoming appointment date from an array of date strings.
 */
export function findNearestAppointment(
  fechas: Array<{ id: string; fecha: string }>,
  referenceDateStr?: string
): string | null {
  const validFechas = fechas.filter(f => f.fecha && !isNaN(new Date(f.fecha).getTime()));
  if (validFechas.length === 0) return null;

  const today = referenceDateStr ? new Date(referenceDateStr) : new Date();
  today.setHours(0, 0, 0, 0);

  // Check upcoming dates (>= today)
  const upcoming = validFechas
    .map(f => ({ id: f.id, date: new Date(f.fecha) }))
    .filter(f => f.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (upcoming.length > 0) {
    return upcoming[0].id;
  }

  // If no future date, return the most recent date
  const past = validFechas
    .map(f => ({ id: f.id, date: new Date(f.fecha) }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return past[0]?.id || null;
}
