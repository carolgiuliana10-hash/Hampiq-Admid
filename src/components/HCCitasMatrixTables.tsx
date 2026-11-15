/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Plus, Trash2, Activity, Stethoscope } from 'lucide-react';
import { HCCita } from '../types/clinical';
import { calculateIMC, calculateWaistToHeightRatio } from '../utils/clinical-calculations';

interface MatrixTablesSharedProps {
  citas: HCCita[];
  activeCitaIndex: number;
  onSelectCita: (index: number) => void;
  onUpdateCita: (index: number, updater: (cita: HCCita) => HCCita) => void;
  onAddCita: () => void;
  onDeleteCita: (index: number) => void;
}

const SLEEP_CHECKBOX_ROWS: Array<{
  key: keyof HCCita['funcionesVitales'];
  label: string;
}> = [
  { key: 'conciliacionDificil', label: 'Conciliación difícil' },
  { key: 'despertaresFrecuentes', label: 'Despertares frecuentes' },
  { key: 'despertarPrecoz', label: 'Despertar precoz' },
  { key: 'ronquidosImportantes', label: 'Ronquidos importantes' },
  { key: 'pausasRespiratoriasObservadas', label: 'Pausas respiratorias observadas' },
  { key: 'somnolenciaDiurna', label: 'Somnolencia diurna' },
  { key: 'necesidadMoverPiernas', label: 'Necesidad de mover las piernas' },
  { key: 'nocturia', label: 'Nocturia' },
];

const VITAL_TEXT_ROWS: Array<{
  key: keyof HCCita['funcionesVitales'];
  label: string;
  placeholder?: string;
  emphasis?: boolean;
}> = [
  { key: 'presionArterial', label: 'Presión arterial', placeholder: 'Ej. 118/76' },
  { key: 'frecuenciaCardiaca', label: 'Frecuencia cardíaca', placeholder: 'lpm' },
  { key: 'frecuenciaRespiratoria', label: 'Frecuencia respiratoria', placeholder: 'rpm' },
  { key: 'saturacionO2', label: 'Saturación O₂ (%)', placeholder: '%' },
  { key: 'temperatura', label: 'Temperatura *', placeholder: '°C' },
  { key: 'pesoKg', label: 'Peso kg', placeholder: 'kg', emphasis: true },
  { key: 'tallaCm', label: 'Talla cm', placeholder: 'cm', emphasis: true },
];

const BIOLOGICAL_TEXT_ROWS: Array<{
  key: keyof HCCita['funcionesVitales'];
  label: string;
  placeholder?: string;
}> = [
  { key: 'apetito', label: 'Apetito', placeholder: 'Registrar...' },
  { key: 'sed', label: 'Sed', placeholder: 'Registrar...' },
  { key: 'deposiciones', label: 'Deposiciones', placeholder: 'Registrar...' },
  { key: 'miccion', label: 'Micción', placeholder: 'Registrar...' },
  { key: 'actividadFisica', label: 'Actividad física', placeholder: 'Registrar...' },
  { key: 'funcionSexual', label: 'Función sexual', placeholder: 'Registrar...' },
];

export const FuncionesVitalesMatrixTable: React.FC<MatrixTablesSharedProps> = ({
  citas,
  activeCitaIndex,
  onSelectCita,
  onUpdateCita,
  onAddCita,
  onDeleteCita,
}) => {
  return (
    <section className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden text-xs">
      {/* Section Header */}
      <div className="px-5 py-3.5 bg-slate-50/90 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-600 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            FUNCIONES VITALES Y ANTROPOMETRIA
          </h3>
          <span className="text-[11px] bg-sky-50 text-sky-800 font-semibold px-2 py-0.5 rounded-md border border-sky-200/80 whitespace-nowrap shrink-0">
            {citas.length} {citas.length === 1 ? 'cita' : 'citas'}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddCita}
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Cita</span>
        </button>
      </div>

      {/* Longitudinal Spreadsheet Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            {/* Appointment Columns */}
            <tr className="bg-slate-50/95 border-b border-sky-100">
              <th className="py-2.5 px-3 sm:px-4 font-bold text-slate-800 w-44 sm:w-56 min-w-[165px] sm:min-w-[200px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.06)]">
                Parámetro
              </th>
              {citas.map((cita, idx) => {
                const isActive = idx === activeCitaIndex;
                return (
                  <th
                    key={cita.id}
                    onClick={() => onSelectCita(idx)}
                    className={`py-2.5 px-2.5 text-center min-w-[138px] border-r border-slate-100 cursor-pointer transition select-none ${
                      isActive
                        ? 'bg-sky-100/90 text-sky-950 font-extrabold ring-1 ring-sky-300 ring-inset'
                        : 'text-slate-700 font-bold hover:bg-sky-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="uppercase tracking-wide">{cita.etiqueta}</span>
                      {citas.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCita(idx);
                          }}
                          title={`Eliminar cita ${cita.etiqueta}`}
                          className="no-print p-0.5 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>

            {/* Fecha Row */}
            <tr className="border-b-2 border-sky-200 bg-sky-50/40">
              <td className="py-2 px-4 font-bold text-sky-900 sticky left-0 bg-sky-50/95 z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Fecha</span>
                </div>
              </td>
              {citas.map((cita, idx) => {
                const isActive = idx === activeCitaIndex;
                return (
                  <td
                    key={cita.id}
                    className={`py-1.5 px-2 border-r border-slate-100 ${
                      isActive ? 'bg-sky-100/50' : ''
                    }`}
                  >
                    <input
                      type="date"
                      value={cita.fecha || ''}
                      onFocus={() => onSelectCita(idx)}
                      onChange={(e) =>
                        onUpdateCita(idx, (c) => ({
                          ...c,
                          fecha: e.target.value,
                          diagnostico: { ...c.diagnostico, fecha: e.target.value },
                        }))
                      }
                      className={`w-full px-2 py-1 rounded-lg text-[11px] font-semibold outline-hidden border ${
                        isActive
                          ? 'bg-white border-sky-300 text-sky-950'
                          : 'bg-white/90 border-slate-200 text-slate-800'
                      }`}
                    />
                  </td>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {/* Standard vitals up to Talla cm */}
            {VITAL_TEXT_ROWS.map((row) => (
              <tr key={String(row.key)} className="hover:bg-slate-50/60 transition">
                <td className="py-1.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.05)]">
                  {row.label}
                </td>
                {citas.map((cita, idx) => {
                  const isActive = idx === activeCitaIndex;
                  return (
                    <td
                      key={cita.id}
                      className={`py-1 px-2 border-r border-slate-100 ${
                        isActive ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      <input
                        type="text"
                        placeholder={row.placeholder}
                        value={(cita.funcionesVitales[row.key] as string) || ''}
                        onFocus={() => onSelectCita(idx)}
                        onChange={(e) =>
                          onUpdateCita(idx, (c) => ({
                            ...c,
                            funcionesVitales: {
                              ...c.funcionesVitales,
                              [row.key]: e.target.value,
                            },
                          }))
                        }
                        className={`w-full px-2 py-1 rounded-lg text-xs outline-hidden border transition ${
                          row.emphasis ? 'font-bold text-slate-900' : 'text-slate-800'
                        } ${
                          isActive
                            ? 'bg-white border-sky-200 focus:border-sky-400'
                            : 'bg-slate-50/70 hover:bg-white focus:bg-white border-slate-200/80 focus:border-sky-300'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Auto-calculated Índice de masa corporal */}
            <tr className="bg-sky-50/35">
              <td className="py-2 px-4 font-bold text-sky-900 sticky left-0 bg-sky-50/95 z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.05)]">
                Índice de masa corporal
                <span className="block text-[10px] font-normal text-sky-700">Cálculo automático</span>
              </td>
              {citas.map((cita, idx) => {
                const isActive = idx === activeCitaIndex;
                const imc = calculateIMC(cita.funcionesVitales.pesoKg, cita.funcionesVitales.tallaCm);
                return (
                  <td
                    key={cita.id}
                    className={`py-1.5 px-2.5 border-r border-slate-100 ${
                      isActive ? 'bg-sky-100/40' : ''
                    }`}
                  >
                    <div className="flex flex-col leading-tight">
                      <span className="font-bold text-slate-900 text-xs">{imc.formatted}</span>
                      {imc.formatted !== '—' && (
                        <span className={`text-[10px] font-semibold ${imc.badgeColor}`}>
                          {imc.categoria}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Cintura cm */}
            <tr className="hover:bg-slate-50/60 transition">
              <td className="py-1.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.05)]">
                Cintura cm
              </td>
              {citas.map((cita, idx) => {
                const isActive = idx === activeCitaIndex;
                return (
                  <td
                    key={cita.id}
                    className={`py-1 px-2 border-r border-slate-100 ${
                      isActive ? 'bg-sky-50/40' : ''
                    }`}
                  >
                    <input
                      type="text"
                      placeholder="cm"
                      value={cita.funcionesVitales.cinturaCm || ''}
                      onFocus={() => onSelectCita(idx)}
                      onChange={(e) =>
                        onUpdateCita(idx, (c) => ({
                          ...c,
                          funcionesVitales: {
                            ...c.funcionesVitales,
                            cinturaCm: e.target.value,
                          },
                        }))
                      }
                      className={`w-full px-2 py-1 rounded-lg text-xs outline-hidden border transition ${
                        isActive
                          ? 'bg-white border-sky-200 focus:border-sky-400'
                          : 'bg-slate-50/70 hover:bg-white focus:bg-white border-slate-200/80 focus:border-sky-300'
                      }`}
                    />
                  </td>
                );
              })}
            </tr>

            {/* Auto-calculated Cintura/talla */}
            <tr className="bg-sky-50/35">
              <td className="py-2 px-4 font-bold text-sky-900 sticky left-0 bg-sky-50/95 z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.05)]">
                Cintura/talla
                <span className="block text-[10px] font-normal text-sky-700">Cálculo automático</span>
              </td>
              {citas.map((cita, idx) => {
                const isActive = idx === activeCitaIndex;
                const ratio = calculateWaistToHeightRatio(
                  cita.funcionesVitales.cinturaCm,
                  cita.funcionesVitales.tallaCm
                );
                return (
                  <td
                    key={cita.id}
                    className={`py-1.5 px-2.5 border-r border-slate-100 ${
                      isActive ? 'bg-sky-100/40' : ''
                    }`}
                  >
                    <div className="flex flex-col leading-tight">
                      <span className="font-bold text-slate-900 text-xs">{ratio.formatted}</span>
                      {ratio.formatted !== '—' && (
                        <span className={`text-[10px] font-semibold ${ratio.badgeColor}`}>
                          {ratio.riesgo}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Biological Functions */}
            {BIOLOGICAL_TEXT_ROWS.map((row) => (
              <tr key={String(row.key)} className="hover:bg-slate-50/60 transition">
                <td className="py-1.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.05)]">
                  {row.label}
                </td>
                {citas.map((cita, idx) => {
                  const isActive = idx === activeCitaIndex;
                  return (
                    <td
                      key={cita.id}
                      className={`py-1 px-2 border-r border-slate-100 ${
                        isActive ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      <input
                        type="text"
                        placeholder={row.placeholder}
                        value={(cita.funcionesVitales[row.key] as string) || ''}
                        onFocus={() => onSelectCita(idx)}
                        onChange={(e) =>
                          onUpdateCita(idx, (c) => ({
                            ...c,
                            funcionesVitales: {
                              ...c.funcionesVitales,
                              [row.key]: e.target.value,
                            },
                          }))
                        }
                        className={`w-full px-2 py-1 rounded-lg text-xs outline-hidden border transition ${
                          isActive
                            ? 'bg-white border-sky-200 focus:border-sky-400'
                            : 'bg-slate-50/70 hover:bg-white focus:bg-white border-slate-200/80 focus:border-sky-300'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Sueño: Horas/noche */}
            <tr className="bg-slate-50/80 border-t-2 border-slate-200">
              <td className="py-2 px-4 font-bold text-slate-800 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.05)]">
                Sueño — Horas/noche
              </td>
              {citas.map((cita, idx) => {
                const isActive = idx === activeCitaIndex;
                return (
                  <td
                    key={cita.id}
                    className={`py-1.5 px-2 border-r border-slate-100 ${
                      isActive ? 'bg-sky-50/50' : ''
                    }`}
                  >
                    <input
                      type="text"
                      placeholder="Ej. 7 h"
                      value={cita.funcionesVitales.suenoHoras || ''}
                      onFocus={() => onSelectCita(idx)}
                      onChange={(e) =>
                        onUpdateCita(idx, (c) => ({
                          ...c,
                          funcionesVitales: {
                            ...c.funcionesVitales,
                            suenoHoras: e.target.value,
                          },
                        }))
                      }
                      className={`w-full px-2 py-1 rounded-lg text-xs outline-hidden border transition ${
                        isActive
                          ? 'bg-white border-sky-200 focus:border-sky-400'
                          : 'bg-white border-slate-200 focus:border-sky-300'
                      }`}
                    />
                  </td>
                );
              })}
            </tr>

            {/* Sueño: Checkboxes per appointment */}
            {SLEEP_CHECKBOX_ROWS.map((item) => (
              <tr key={String(item.key)} className="hover:bg-slate-50/60 transition">
                <td className="py-1.5 pl-6 pr-4 font-medium text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.05)]">
                  {item.label}
                </td>
                {citas.map((cita, idx) => {
                  const isActive = idx === activeCitaIndex;
                  const checked = Boolean(cita.funcionesVitales[item.key]);
                  return (
                    <td
                      key={cita.id}
                      className={`py-1.5 px-2 text-center border-r border-slate-100 ${
                        isActive ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      <label className="inline-flex items-center justify-center gap-1.5 cursor-pointer select-none px-2 py-0.5 rounded-md hover:bg-sky-50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            onSelectCita(idx);
                            onUpdateCita(idx, (c) => ({
                              ...c,
                              funcionesVitales: {
                                ...c.funcionesVitales,
                                [item.key]: e.target.checked,
                              },
                            }));
                          }}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span
                          className={`text-[11px] font-medium ${
                            checked ? 'text-sky-800 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {checked ? 'Sí' : 'No'}
                        </span>
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export const ExamenFisicoMatrixTable: React.FC<MatrixTablesSharedProps> = ({
  citas,
  activeCitaIndex,
  onSelectCita,
  onUpdateCita,
  onAddCita,
  onDeleteCita,
}) => {
  const renderTextRow = (
    label: string,
    subtitle: string | null,
    getValue: (cita: HCCita) => string,
    setValue: (cita: HCCita, val: string) => HCCita,
    placeholder = 'Registrar hallazgos...'
  ) => (
    <tr className="hover:bg-slate-50/60 transition align-top">
      <td className="py-2 px-4 font-semibold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.05)]">
        <div>{label}</div>
        {subtitle && (
          <div className="text-[10px] font-normal text-slate-500 leading-snug mt-0.5">
            {subtitle}
          </div>
        )}
      </td>
      {citas.map((cita, idx) => {
        const isActive = idx === activeCitaIndex;
        return (
          <td
            key={cita.id}
            className={`py-1.5 px-2 border-r border-slate-100 ${
              isActive ? 'bg-sky-50/40' : ''
            }`}
          >
            <textarea
              rows={2}
              placeholder={placeholder}
              value={getValue(cita)}
              onFocus={() => onSelectCita(idx)}
              onChange={(e) => onUpdateCita(idx, (c) => setValue(c, e.target.value))}
              className={`w-full p-2 rounded-lg text-xs outline-hidden resize-y border transition ${
                isActive
                  ? 'bg-white border-sky-200 focus:border-sky-400'
                  : 'bg-slate-50/70 hover:bg-white focus:bg-white border-slate-200/80 focus:border-sky-300'
              }`}
            />
          </td>
        );
      })}
    </tr>
  );

  return (
    <section className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden text-xs">
      {/* Section Header */}
      <div className="px-5 py-3.5 bg-slate-50/90 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-sky-600 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            EXAMEN FÍSICO DIRIGIDO
          </h3>
          <span className="text-[11px] bg-sky-50 text-sky-800 font-semibold px-2 py-0.5 rounded-md border border-sky-200/80 whitespace-nowrap shrink-0">
            {citas.length} {citas.length === 1 ? 'cita' : 'citas'}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddCita}
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Cita</span>
        </button>
      </div>

      {/* Longitudinal Spreadsheet Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            {/* Appointment Columns */}
            <tr className="bg-slate-50/95 border-b border-sky-100">
              <th className="py-2.5 px-3 sm:px-4 font-bold text-slate-800 w-44 sm:w-56 min-w-[165px] sm:min-w-[200px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.06)]">
                EXAMEN FÍSICO DIRIGIDO
              </th>
              {citas.map((cita, idx) => {
                const isActive = idx === activeCitaIndex;
                return (
                  <th
                    key={cita.id}
                    onClick={() => onSelectCita(idx)}
                    className={`py-2.5 px-2.5 text-center min-w-[220px] border-r border-slate-100 cursor-pointer transition select-none ${
                      isActive
                        ? 'bg-sky-100/90 text-sky-950 font-extrabold ring-1 ring-sky-300 ring-inset'
                        : 'text-slate-700 font-bold hover:bg-sky-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="uppercase tracking-wide">{cita.etiqueta}</span>
                      {citas.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCita(idx);
                          }}
                          title={`Eliminar cita ${cita.etiqueta}`}
                          className="no-print p-0.5 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>

            {/* Fecha Row */}
            <tr className="border-b-2 border-sky-200 bg-sky-50/40">
              <td className="py-2 px-4 font-bold text-sky-900 sticky left-0 bg-sky-50/95 z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Fecha</span>
                </div>
              </td>
              {citas.map((cita, idx) => {
                const isActive = idx === activeCitaIndex;
                return (
                  <td
                    key={cita.id}
                    className={`py-1.5 px-2 border-r border-slate-100 ${
                      isActive ? 'bg-sky-100/50' : ''
                    }`}
                  >
                    <input
                      type="date"
                      value={cita.fecha || ''}
                      onFocus={() => onSelectCita(idx)}
                      onChange={(e) =>
                        onUpdateCita(idx, (c) => ({
                          ...c,
                          fecha: e.target.value,
                          diagnostico: { ...c.diagnostico, fecha: e.target.value },
                        }))
                      }
                      className={`w-full px-2 py-1 rounded-lg text-[11px] font-semibold outline-hidden border ${
                        isActive
                          ? 'bg-white border-sky-300 text-sky-950'
                          : 'bg-white/90 border-slate-200 text-slate-800'
                      }`}
                    />
                  </td>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {renderTextRow(
              'General',
              null,
              (c) => c.examenFisico.general,
              (c, val) => ({ ...c, examenFisico: { ...c.examenFisico, general: val } })
            )}
            {renderTextRow(
              'Dermatológico',
              null,
              (c) => c.examenFisico.dermatologico,
              (c, val) => ({ ...c, examenFisico: { ...c.examenFisico, dermatologico: val } })
            )}
            {renderTextRow(
              'Cardiovascular',
              null,
              (c) => c.examenFisico.cardiovascular,
              (c, val) => ({ ...c, examenFisico: { ...c.examenFisico, cardiovascular: val } })
            )}
            {renderTextRow(
              'Respiratorio',
              null,
              (c) => c.examenFisico.respiratorio,
              (c, val) => ({ ...c, examenFisico: { ...c.examenFisico, respiratorio: val } })
            )}

            {/* Tiroides: ☐ normal ☐ bocio/nódulo ☐ otro */}
            <tr className="hover:bg-slate-50/60 transition align-top">
              <td className="py-2 px-4 font-semibold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.05)]">
                <div>Tiroides</div>
                <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                  normal / bocio-nódulo / otro
                </div>
              </td>
              {citas.map((cita, idx) => {
                const isActive = idx === activeCitaIndex;
                return (
                  <td
                    key={cita.id}
                    className={`py-2 px-2.5 border-r border-slate-100 ${
                      isActive ? 'bg-sky-50/40' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]">
                      {(
                        [
                          ['normal', 'normal'],
                          ['bocio_nodulo', 'bocio/nódulo'],
                          ['otro', 'otro'],
                        ] as const
                      ).map(([val, label]) => (
                        <label key={val} className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`tiroides_${cita.id}`}
                            checked={cita.examenFisico.tiroides === val}
                            onChange={() => {
                              onSelectCita(idx);
                              onUpdateCita(idx, (c) => ({
                                ...c,
                                examenFisico: { ...c.examenFisico, tiroides: val },
                              }));
                            }}
                          />
                          <span
                            className={
                              cita.examenFisico.tiroides === val
                                ? 'font-semibold text-sky-900'
                                : 'text-slate-600'
                            }
                          >
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>

                    {cita.examenFisico.tiroides === 'otro' && (
                      <input
                        type="text"
                        placeholder="Detalle tiroides..."
                        value={cita.examenFisico.tiroidesOtro}
                        onFocus={() => onSelectCita(idx)}
                        onChange={(e) =>
                          onUpdateCita(idx, (c) => ({
                            ...c,
                            examenFisico: {
                              ...c.examenFisico,
                              tiroidesOtro: e.target.value,
                            },
                          }))
                        }
                        className="w-full mt-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                      />
                    )}
                  </td>
                );
              })}
            </tr>

            {renderTextRow(
              'Mama',
              null,
              (c) => c.examenFisico.mama,
              (c, val) => ({ ...c, examenFisico: { ...c.examenFisico, mama: val } })
            )}
            {renderTextRow(
              'Abdomen',
              null,
              (c) => c.examenFisico.abdomen,
              (c, val) => ({ ...c, examenFisico: { ...c.examenFisico, abdomen: val } })
            )}

            {/* Ginecológico: ☐ no requerido ☐ atrofia/sequedad ☐ lesión ☐ prolapso ☐ sangrado */}
            <tr className="hover:bg-slate-50/60 transition align-top">
              <td className="py-2 px-4 font-semibold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(15,23,42,0.05)]">
                <div>Ginecológico</div>
                <div className="text-[10px] font-normal text-slate-500 mt-0.5 leading-snug">
                  no requerido / atrofia / lesión / prolapso / sangrado
                </div>
              </td>
              {citas.map((cita, idx) => {
                const isActive = idx === activeCitaIndex;
                return (
                  <td
                    key={cita.id}
                    className={`py-2 px-2.5 border-r border-slate-100 ${
                      isActive ? 'bg-sky-50/40' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]">
                      {(
                        [
                          ['noRequerido', 'no requerido'],
                          ['atrofiaSequedad', 'atrofia/sequedad'],
                          ['lesion', 'lesión'],
                          ['prolapso', 'prolapso'],
                          ['sangrado', 'sangrado'],
                        ] as const
                      ).map(([k, label]) => (
                        <label key={k} className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(cita.examenFisico.ginecologico[k])}
                            onChange={(e) => {
                              onSelectCita(idx);
                              onUpdateCita(idx, (c) => ({
                                ...c,
                                examenFisico: {
                                  ...c.examenFisico,
                                  ginecologico: {
                                    ...c.examenFisico.ginecologico,
                                    [k]: e.target.checked,
                                  },
                                },
                              }));
                            }}
                          />
                          <span
                            className={
                              cita.examenFisico.ginecologico[k]
                                ? 'font-semibold text-sky-900'
                                : 'text-slate-600'
                            }
                          >
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Detalle ginecológico..."
                      value={cita.examenFisico.ginecologico.detalle || ''}
                      onFocus={() => onSelectCita(idx)}
                      onChange={(e) =>
                        onUpdateCita(idx, (c) => ({
                          ...c,
                          examenFisico: {
                            ...c.examenFisico,
                            ginecologico: {
                              ...c.examenFisico.ginecologico,
                              detalle: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full mt-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                    />
                  </td>
                );
              })}
            </tr>

            {renderTextRow(
              'Músculo-esquelético / neurológico',
              'fuerza / función / dolor',
              (c) => c.examenFisico.musculoesqueleticoNeurologico,
              (c, val) => ({
                ...c,
                examenFisico: { ...c.examenFisico, musculoesqueleticoNeurologico: val },
              })
            )}

            {renderTextRow(
              'Psicológico-emocional',
              'estable, (tendencia al llanto, ansiosa, irritable)',
              (c) => c.examenFisico.psicologicoEmocional,
              (c, val) => ({
                ...c,
                examenFisico: { ...c.examenFisico, psicologicoEmocional: val },
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
