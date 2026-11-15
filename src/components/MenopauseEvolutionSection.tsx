/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Loader2,
  RefreshCw,
  LineChart,
  Table2,
} from 'lucide-react';
import { EvolucionIAAnalisis, Patient, TendenciaEvolucion } from '../types/clinical';
import {
  buildAnonymizedConsultationPayload,
  ChartDataPoint,
  computeAppointmentCoverageSeries,
  computeBlockFrequencyStats,
  computeGlobalEvolutionSeries,
  normalizeMenopauseAnalysis,
  resolveCellScore,
} from '../utils/menopause-ai';
import { ClinicalLineChart } from './ClinicalLineChart';

interface MenopauseEvolutionSectionProps {
  patient: Patient;
  onSaveAnalysis: (analysis: EvolucionIAAnalisis) => void;
}

const TENDENCIA_CONFIG: Record<
  TendenciaEvolucion,
  {
    label: string;
    className: string;
    strokeColor: string;
    fillColor: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  mejoria: {
    label: 'Mejoría',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    strokeColor: '#059669',
    fillColor: 'rgba(5, 150, 105, 0.08)',
    Icon: TrendingUp,
  },
  estable: {
    label: 'Estable',
    className: 'bg-sky-50 text-sky-800 border-sky-200',
    strokeColor: '#0284c7',
    fillColor: 'rgba(2, 132, 199, 0.08)',
    Icon: Minus,
  },
  empeoramiento: {
    label: 'Empeoramiento',
    className: 'bg-rose-50 text-rose-800 border-rose-200',
    strokeColor: '#e11d48',
    fillColor: 'rgba(225, 29, 72, 0.08)',
    Icon: TrendingDown,
  },
  mixta: {
    label: 'Evolución mixta',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    strokeColor: '#d97706',
    fillColor: 'rgba(217, 119, 6, 0.08)',
    Icon: Activity,
  },
  sin_datos: {
    label: 'Sin datos',
    className: 'bg-slate-100 text-slate-500 border-slate-200',
    strokeColor: '#64748b',
    fillColor: 'rgba(100, 116, 139, 0.08)',
    Icon: Minus,
  },
};

export const MenopauseEvolutionSection: React.FC<MenopauseEvolutionSectionProps> = ({
  patient,
  onSaveAnalysis,
}) => {
  const { citas, analisisEvolucionIA } = patient.hc;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grafica' | 'tabla'>('grafica');

  const blockStats = useMemo(() => computeBlockFrequencyStats(citas), [citas]);
  const coverageSeries = useMemo(() => computeAppointmentCoverageSeries(citas), [citas]);
  const globalSeries = useMemo(
    () =>
      analisisEvolucionIA ? computeGlobalEvolutionSeries(citas, analisisEvolucionIA.filas) : [],
    [citas, analisisEvolucionIA]
  );

  const handleGenerateAnalysis = async () => {
    setError('');
    setLoading(true);
    try {
      const clinicalPayload = buildAnonymizedConsultationPayload(patient);
      const response = await fetch('/api/ai/menopause-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicalPayload }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || `Error del servidor (${response.status})`);
      }

      const normalized = normalizeMenopauseAnalysis(data.analysis, citas);
      onSaveAnalysis(normalized);
      setViewMode('grafica');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo generar el análisis evolutivo con IA. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formattedTimestamp = analisisEvolucionIA?.generadoEn
    ? new Date(analisisEvolucionIA.generadoEn).toLocaleString('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <section
      aria-labelledby="menopause-ai-heading"
      className="bg-white rounded-2xl border-2 border-sky-200 overflow-hidden shadow-xs text-xs"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 text-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 text-sky-300 shrink-0" />
            <h3 id="menopause-ai-heading" className="text-sm font-bold tracking-wide uppercase">
              Tabla Gráfica de Frecuencia y Evolución — IA Especialista en Menopausia
            </h3>
          </div>
          <p className="text-[11px] text-sky-100/90 mt-1">
            Curvas evolutivas de todos los cuadros de consulta desde Funciones Vitales hasta los 5
            Ejes, Laboratorio, Alarmas y Tratamiento (excluye Diagnóstico).
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2.5 shrink-0">
          {analisisEvolucionIA && (
            <div
              role="group"
              aria-label="Modo de visualización de evolución clínica"
              className="inline-flex bg-slate-900/60 border border-sky-400/30 rounded-xl p-1"
            >
              <button
                type="button"
                onClick={() => setViewMode('grafica')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  viewMode === 'grafica'
                    ? 'bg-white text-sky-950 shadow-xs'
                    : 'text-sky-100 hover:text-white'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Vista Gráfica</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tabla')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  viewMode === 'tabla'
                    ? 'bg-white text-sky-950 shadow-xs'
                    : 'text-sky-100 hover:text-white'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Vista Tabla</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerateAnalysis}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-sky-900 hover:bg-sky-50 disabled:opacity-70 font-bold text-xs rounded-xl shadow-sm transition cursor-pointer shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-700" />
                <span>Analizando evolución...</span>
              </>
            ) : analisisEvolucionIA ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-sky-700" />
                <span>Actualizar Gráficas con IA</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-sky-700" />
                <span>Generar Gráficas y Resumen con IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!analisisEvolucionIA ? (
          <div className="space-y-5">
            <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800 text-xs">
                  Frecuencia de registro actual ({citas.length}{' '}
                  {citas.length === 1 ? 'cita registrada' : 'citas registradas'})
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Haz clic en &ldquo;Generar Gráficas y Resumen con IA&rdquo; para trazar las
                  curvas de evolución clínica (0–10) por cada cuadro y generar el resumen general.
                </p>
              </div>
            </div>

            {/* Pre-AI Live Coverage Line Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Gráfica de Frecuencia de Registro por Cita (0–12 cuadros)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Cantidad de cuadros clínicos completados en cada cita registrada.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-bold">
                  {citas.length} {citas.length === 1 ? 'punto' : 'puntos'}
                </span>
              </div>
              <ClinicalLineChart
                points={coverageSeries}
                maxY={12}
                yAxisLabel="Frecuencia de cuadros registrados por cita"
                strokeColor="#0284c7"
                fillColor="rgba(2, 132, 199, 0.09)"
                height={200}
              />
            </div>

            {/* Compact per-block coverage cards */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2.5">
                Cobertura Actual por Cuadro de Consulta
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {blockStats.map((stat) => {
                  const pct =
                    stat.totalCitas > 0
                      ? Math.round((stat.citasConRegistro / stat.totalCitas) * 100)
                      : 0;
                  return (
                    <div
                      key={stat.cuadro}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800 text-[11px] leading-snug">
                          {stat.cuadro}
                        </span>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            stat.citasConRegistro > 0
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {stat.citasConRegistro}/{stat.totalCitas}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {stat.etiquetasRegistradas.length > 0
                          ? `Registrado en: ${stat.etiquetasRegistradas.join(', ')}`
                          : 'Sin registros aún'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Metadata bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 border-b border-slate-100 pb-3">
              <span>
                Análisis clínico generado sobre{' '}
                <strong className="text-slate-700">
                  {analisisEvolucionIA.totalCitasAnalizadas} cita(s)
                </strong>{' '}
                (excluyendo Diagnóstico)
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                  Escala gráfica 0–10: 0–3 Crítico · 4–6 Moderado · 7–10 Controlado/Óptimo
                </span>
                {formattedTimestamp && <span>Actualizado: {formattedTimestamp}</span>}
              </div>
            </div>

            {/* 1. Resumen General de Evolución */}
            <div className="bg-sky-50/50 border border-sky-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-sky-700 shrink-0" />
                <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wide">
                  Resumen General de Evolución de la Paciente
                </h4>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {analisisEvolucionIA.resumenGeneral.evolucionGlobal}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="bg-white rounded-xl border border-emerald-200/80 p-3.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px] uppercase mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Logros Principales</span>
                  </div>
                  {analisisEvolucionIA.resumenGeneral.logrosPrincipales.length > 0 ? (
                    <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc pl-4">
                      {analisisEvolucionIA.resumenGeneral.logrosPrincipales.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-400">Sin logros registrados aún.</p>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-amber-200/80 p-3.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] uppercase mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Áreas de Atención</span>
                  </div>
                  {analisisEvolucionIA.resumenGeneral.areasAtencion.length > 0 ? (
                    <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc pl-4">
                      {analisisEvolucionIA.resumenGeneral.areasAtencion.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-400">Sin alertas pendientes.</p>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-sky-200/80 p-3.5">
                  <div className="flex items-center gap-1.5 font-bold text-sky-900 text-[11px] uppercase mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span>Sugerencias de Control</span>
                  </div>
                  {analisisEvolucionIA.resumenGeneral.recomendacionesSeguimiento.length > 0 ? (
                    <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc pl-4">
                      {analisisEvolucionIA.resumenGeneral.recomendacionesSeguimiento.map(
                        (item, i) => (
                          <li key={i}>{item}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-400">Continuar controles habituales.</p>
                  )}
                </div>
              </div>
            </div>

            {viewMode === 'grafica' ? (
              <div className="space-y-6">
                {/* 2. Top Dual Summary Line Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Evolución Clínica Global (Índice 0–10)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Promedio longitudinal de control clínico en todos los cuadros evaluados.
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold shrink-0">
                        Global IA
                      </span>
                    </div>
                    <ClinicalLineChart
                      points={globalSeries}
                      maxY={10}
                      yAxisLabel="Índice global de control clínico (0 a 10)"
                      strokeColor="#0284c7"
                      fillColor="rgba(2, 132, 199, 0.09)"
                      height={195}
                    />
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Frecuencia de Registro por Cita (0–12 cuadros)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Cantidad de cuadros de consulta evaluados en cada control clínico.
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold shrink-0">
                        Cobertura
                      </span>
                    </div>
                    <ClinicalLineChart
                      points={coverageSeries}
                      maxY={12}
                      yAxisLabel="Cuadros registrados por cita (0 a 12)"
                      strokeColor="#0f766e"
                      fillColor="rgba(15, 118, 110, 0.08)"
                      height={195}
                    />
                  </div>
                </div>

                {/* 3. Grid of Per-Block Line Graphs (matching visual reference) */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Tablas Gráficas de Frecuencia y Evolución por Cuadro de Consulta
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Haz clic o pasa el cursor sobre cada punto para ver el detalle de la cita
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {analisisEvolucionIA.filas.map((fila) => {
                      const tend = TENDENCIA_CONFIG[fila.tendencia] || TENDENCIA_CONFIG.estable;
                      const TendIcon = tend.Icon;

                      const rowPoints: ChartDataPoint[] = citas.map((c, idx) => {
                        const cell =
                          fila.celdasPorCita.find((x) => x.etiquetaCita === c.etiqueta) ||
                          fila.celdasPorCita[idx];
                        if (!cell) {
                          return {
                            etiqueta: c.etiqueta,
                            fecha: c.fecha || '',
                            value: null,
                            estado: 'Sin dato',
                            detail: 'Sin registros evaluables en esta cita.',
                          };
                        }
                        const score = resolveCellScore(cell.estadoFrecuencia, cell.puntaje);
                        return {
                          etiqueta: c.etiqueta,
                          fecha: c.fecha || cell.fecha || '',
                          value: score,
                          estado: cell.estadoFrecuencia,
                          detail: cell.resumenCita,
                        };
                      });

                      return (
                        <article
                          key={fila.cuadro}
                          className="bg-white border border-slate-200 hover:border-sky-300 transition rounded-2xl p-4 flex flex-col gap-3 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h5 className="font-bold text-slate-900 text-xs leading-snug">
                                {fila.cuadro}
                              </h5>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                                Frecuencia: {fila.frecuenciaRegistro}
                              </span>
                            </div>

                            <span
                              className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${tend.className}`}
                            >
                              <TendIcon className="w-3 h-3 shrink-0" />
                              <span>{tend.label}</span>
                            </span>
                          </div>

                          <ClinicalLineChart
                            points={rowPoints}
                            maxY={10}
                            yAxisLabel={`Evolución de ${fila.cuadro}`}
                            strokeColor={tend.strokeColor}
                            fillColor={tend.fillColor}
                            height={165}
                            compact
                          />

                          <p className="text-[11px] text-slate-700 leading-relaxed bg-slate-50/80 border border-slate-100 rounded-xl p-2.5 mt-auto">
                            {fila.analisisEvolucion}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Optional Table View */
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2.5">
                  Vista Tabular de Frecuencia y Evolución por Cuadro de Consulta
                </h4>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse min-w-[780px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                        <th className="py-2.5 px-3 w-48">Cuadro de Consulta</th>
                        <th className="py-2.5 px-3 w-28">Frecuencia</th>
                        {citas.map((c) => (
                          <th key={c.id} className="py-2.5 px-3 min-w-[140px]">
                            <div>{c.etiqueta}</div>
                            {c.fecha && (
                              <div className="text-[10px] font-normal text-slate-400">
                                {c.fecha}
                              </div>
                            )}
                          </th>
                        ))}
                        <th className="py-2.5 px-3 w-28">Tendencia</th>
                        <th className="py-2.5 px-3 min-w-[220px]">Evolución (IA Menopausia)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 align-top">
                      {analisisEvolucionIA.filas.map((fila) => {
                        const tend = TENDENCIA_CONFIG[fila.tendencia] || TENDENCIA_CONFIG.estable;
                        const TendIcon = tend.Icon;
                        return (
                          <tr key={fila.cuadro} className="hover:bg-sky-50/30">
                            <td className="py-2.5 px-3 font-bold text-slate-800">{fila.cuadro}</td>
                            <td className="py-2.5 px-3">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                                {fila.frecuenciaRegistro}
                              </span>
                            </td>
                            {citas.map((c, idx) => {
                              const cell =
                                fila.celdasPorCita.find((x) => x.etiquetaCita === c.etiqueta) ||
                                fila.celdasPorCita[idx];
                              const cellScore = cell
                                ? resolveCellScore(cell.estadoFrecuencia, cell.puntaje)
                                : null;
                              return (
                                <td key={c.id} className="py-2.5 px-3">
                                  {cell ? (
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-1">
                                        <span className="inline-block px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100 font-semibold text-[10px]">
                                          {cell.estadoFrecuencia}
                                        </span>
                                        {cellScore !== null && (
                                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                            {cellScore}/10
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-600 leading-snug">
                                        {cell.resumenCita}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${tend.className}`}
                              >
                                <TendIcon className="w-3 h-3 shrink-0" />
                                <span>{tend.label}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-700 leading-relaxed">
                              {fila.analisisEvolucion}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
