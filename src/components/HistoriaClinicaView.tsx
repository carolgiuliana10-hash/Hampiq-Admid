/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  AlertTriangle,
  Info,
  Download
} from 'lucide-react';
import { Patient, HistoriaClinicaData, HCCita, AntecedentesData } from '../types/clinical';
import { calculateAge } from '../utils/clinical-calculations';
import { createEmptyCita } from '../utils/storage';
import { FuncionesVitalesMatrixTable, ExamenFisicoMatrixTable } from './HCCitasMatrixTables';
import {
  CincoEjesMatrixTable,
  LaboratorioMatrixTable,
  AlarmasMatrixTable,
  TratamientoMatrixTable,
} from './HCCitasRestMatrixTables';

interface HistoriaClinicaViewProps {
  patient: Patient;
  onUpdateHC: (updatedHC: HistoriaClinicaData) => void;
}

export const HistoriaClinicaView: React.FC<HistoriaClinicaViewProps> = ({
  patient,
  onUpdateHC,
}) => {
  const { antecedentes, citas } = patient.hc;
  const [activeSubTab, setActiveSubTab] = useState<'antecedentes' | 'seguimiento'>('seguimiento');
  const [activeCitaIndex, setActiveCitaIndex] = useState(0);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  const calculatedAge = calculateAge(patient.fechaNacimiento);

  // Helper to update antecedents
  const updateAntecedente = <K extends keyof AntecedentesData>(key: K, value: AntecedentesData[K]) => {
    onUpdateHC({
      ...patient.hc,
      antecedentes: {
        ...antecedentes,
        [key]: value,
      },
    });
  };

  // Helper to update appointment cell
  const updateCita = (index: number, updater: (cita: HCCita) => HCCita) => {
    const nextCitas = [...citas];
    nextCitas[index] = updater(nextCitas[index]);
    onUpdateHC({
      ...patient.hc,
      citas: nextCitas,
    });
  };

  // Add appointment column
  const handleAddCita = () => {
    const nextNum = citas.length === 0 ? 'Inicial' : `C${citas.length}`;
    const newCita = createEmptyCita(nextNum, new Date().toISOString().split('T')[0]);
    onUpdateHC({
      ...patient.hc,
      citas: [...citas, newCita],
    });
    setActiveCitaIndex(citas.length);
    setPendingDeleteIndex(null);
  };

  // Delete appointment column with inline confirmation (safe in embedded iframes)
  const handleDeleteCita = (index: number) => {
    if (citas.length <= 1) return;
    setPendingDeleteIndex(index);
  };

  const confirmDeleteCita = () => {
    if (pendingDeleteIndex === null || citas.length <= 1) return;
    const index = pendingDeleteIndex;
    const nextCitas = citas.filter((_, i) => i !== index);
    onUpdateHC({
      ...patient.hc,
      citas: nextCitas,
    });
    setActiveCitaIndex((prev) => {
      if (prev === index) return Math.max(0, index - 1);
      if (prev > index) return prev - 1;
      return prev;
    });
    setPendingDeleteIndex(null);
  };

  const handleDownloadPDF = () => {
    const originalTitle = document.title;
    document.title = `Hampiq_Historia_Clinica_${patient.nombres}_${patient.apellidos}`.replace(/\s+/g, '_');
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Internal Document Badge & Sub-navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              HISTORIA CLÍNICA INTEGRAL
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md border border-slate-200">
              Uso Interno Médico
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mismos campos, secciones y orden de los documentos físicos de la clínica.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-view Switcher */}
          <div className="no-print flex items-center p-1 bg-sky-50/70 border border-sky-100 rounded-xl">
            <button
              onClick={() => setActiveSubTab('seguimiento')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeSubTab === 'seguimiento'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              Seguimiento por Citas ({citas.length})
            </button>
            <button
              onClick={() => setActiveSubTab('antecedentes')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeSubTab === 'antecedentes'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              Antecedentes Basales
            </button>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="no-print inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0"
            title="Descargar Historia Clínica en PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Official Hampiq Header for UI and Printable Export */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-3 mb-5">
        <div className="flex items-center gap-3">
          <img
            src="/logo-hampiq.jpg"
            alt="Hampiq Biomedicina"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/IMG-20261030-WA0075_90400adc.jpg';
            }}
            className="h-14 sm:h-16 w-auto object-contain rounded-md"
          />
        </div>
        <div className="text-right text-xs text-slate-500">
          <div className="font-bold text-slate-900 text-sm">Hampiq Biomedicina</div>
          <div className="text-[11px] text-sky-800 font-medium">HISTORIA CLÍNICA INTEGRAL</div>
          <div className="text-[10px] text-slate-400">Emisión: {new Date().toLocaleDateString('es-PE')}</div>
        </div>
      </div>

      {/* Patient Header Grid matching Image 4 */}
      <div className="bg-white rounded-2xl border border-sky-100 p-4 mb-6 shadow-xs text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-100 pb-3 mb-3">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Nombre y apellido</span>
            <span className="font-bold text-slate-900 text-sm">{patient.nombres} {patient.apellidos}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha</span>
            <span className="font-semibold text-slate-800">{patient.ultimaCita || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">DNI</span>
            <span className="font-semibold text-slate-800">{patient.dni}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Edad</span>
            <span className="font-bold text-sky-800">{calculatedAge !== null ? `${calculatedAge} años` : '—'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Celular</span>
            <span className="font-semibold text-slate-800">{patient.celular || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">F.nac.</span>
            <span className="font-semibold text-slate-800">{patient.fechaNacimiento || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Dirección</span>
            <span className="font-semibold text-slate-800">{patient.direccion || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Ocupac.</span>
            <span className="font-semibold text-slate-800">{patient.ocupacion || '—'}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: ANTECEDENTES (SE LLENAN UNA VEZ)                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'antecedentes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-xs text-xs">
            <div className="bg-slate-50 px-5 py-3 border-b border-sky-100 flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wide">
                Datos y Antecedentes Basales (Registrar / Marcar)
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {/* FUM / ciclo */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">FUM / ciclo</div>
                <div className="md:col-span-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-600">FUM:</span>
                    <input
                      type="date"
                      value={antecedentes.fumFecha}
                      onChange={(e) => updateAntecedente('fumFecha', e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.regular}
                        onChange={(e) => updateAntecedente('regular', e.target.checked)}
                      />
                      <span>regular</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.irregular}
                        onChange={(e) => updateAntecedente('irregular', e.target.checked)}
                      />
                      <span>irregular</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.cambioPersistente7d}
                        onChange={(e) => updateAntecedente('cambioPersistente7d', e.target.checked)}
                      />
                      <span>cambio persistente ≥7 días</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.intervaloSinSangrado60d}
                        onChange={(e) => updateAntecedente('intervaloSinSangrado60d', e.target.checked)}
                      />
                      <span>intervalo sin sangrado ≥60 días</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.amenorrea12m}
                        onChange={(e) => updateAntecedente('amenorrea12m', e.target.checked)}
                      />
                      <span>amenorrea ≥12 meses</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.posmenopausia60o10}
                        onChange={(e) => updateAntecedente('posmenopausia60o10', e.target.checked)}
                      />
                      <span>Posmenopausia ≥60 años o &gt;10 años desde menopausia</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.mayor70anos}
                        onChange={(e) => updateAntecedente('mayor70anos', e.target.checked)}
                      />
                      <span>≥70 años</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* STRAW+10. */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">STRAW+10.</div>
                <div className="md:col-span-3 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    {[
                      ['-3', '−3 reproductiva tardía'],
                      ['-2', '−2 transición temprana'],
                      ['-1', '−1 transición tardía'],
                      ['0', '0 última menstruación'],
                      ['+1a', '+1a'],
                      ['+1b', '+1b'],
                      ['+1c', '+1c'],
                      ['+2', '+2'],
                    ].map(([k, label]) => (
                      <label key={k} className="flex items-center gap-1.5 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="strawEtapa"
                          checked={antecedentes.strawEtapa === k}
                          onChange={() => updateAntecedente('strawEtapa', k)}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 italic bg-sky-50/60 p-2.5 rounded-lg border border-sky-100">
                    STRAW+10: −2 = variación persistente ≥7 días entre ciclos; −1 = ≥60 días sin menstruación; +1a = primeros 12 meses desde la última menstruación; +1b = segundo año; +1c ≈ siguientes 3–6 años; +2 = posmenopausia tardía. El patrón menstrual es criterio principal; biomarcadores son de apoyo.
                  </p>
                </div>
              </div>

              {/* Tipo */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Tipo</div>
                <div className="md:col-span-3 flex flex-wrap items-center gap-4">
                  {[
                    ['natural', 'natural'],
                    ['quirurgica', 'quirúrgica'],
                    ['temprana', 'temprana 40–44'],
                    ['iop', 'insuficiencia ovárica primaria <40'],
                    ['por_confirmar', 'por confirmar'],
                  ].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="tipoMenopausia"
                        checked={antecedentes.tipoMenopausia === val}
                        onChange={() => updateAntecedente('tipoMenopausia', val as any)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gestaciones & Embarazo Posible */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Gestaciones</div>
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600">G:</span>
                    <input
                      type="text"
                      value={antecedentes.gestaciones.g}
                      onChange={(e) =>
                        updateAntecedente('gestaciones', { ...antecedentes.gestaciones, g: e.target.value })
                      }
                      className="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center"
                    />
                    <span className="font-semibold text-slate-600 ml-1">P:</span>
                    <input
                      type="text"
                      value={antecedentes.gestaciones.p}
                      onChange={(e) =>
                        updateAntecedente('gestaciones', { ...antecedentes.gestaciones, p: e.target.value })
                      }
                      className="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center"
                    />
                    <span className="font-semibold text-slate-600 ml-1">A:</span>
                    <input
                      type="text"
                      value={antecedentes.gestaciones.a}
                      onChange={(e) =>
                        updateAntecedente('gestaciones', { ...antecedentes.gestaciones, a: e.target.value })
                      }
                      className="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center"
                    />
                    <span className="font-semibold text-slate-600 ml-1">C:</span>
                    <input
                      type="text"
                      value={antecedentes.gestaciones.c}
                      onChange={(e) =>
                        updateAntecedente('gestaciones', { ...antecedentes.gestaciones, c: e.target.value })
                      }
                      className="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-600">último embarazo:</span>
                    <input
                      type="text"
                      value={antecedentes.gestaciones.ultimoEmbarazo}
                      onChange={(e) =>
                        updateAntecedente('gestaciones', {
                          ...antecedentes.gestaciones,
                          ultimoEmbarazo: e.target.value,
                        })
                      }
                      className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Embarazo Posible */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Embarazo Posible</div>
                <div className="md:col-span-3 flex flex-wrap items-center gap-3">
                  {['NO', 'SÍ', 'duda'].map((val) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer font-semibold">
                      <input
                        type="radio"
                        name="embarazoPosible"
                        checked={antecedentes.embarazoPosible === val}
                        onChange={() => updateAntecedente('embarazoPosible', val as any)}
                      />
                      <span>{val}</span>
                    </label>
                  ))}
                  <span className="text-slate-400">→ prueba antes de tratamiento cuando corresponda</span>
                </div>
              </div>

              {/* Anticoncepción */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Anticoncepción</div>
                <div className="md:col-span-3 flex flex-wrap items-center gap-3 text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={antecedentes.anticoncepcion.noRequiere}
                      onChange={(e) =>
                        updateAntecedente('anticoncepcion', {
                          ...antecedentes.anticoncepcion,
                          noRequiere: e.target.checked,
                        })
                      }
                    />
                    <span>no requiere</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={antecedentes.anticoncepcion.preservativo}
                      onChange={(e) =>
                        updateAntecedente('anticoncepcion', {
                          ...antecedentes.anticoncepcion,
                          preservativo: e.target.checked,
                        })
                      }
                    />
                    <span>preservativo</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={antecedentes.anticoncepcion.diuCobre}
                      onChange={(e) =>
                        updateAntecedente('anticoncepcion', {
                          ...antecedentes.anticoncepcion,
                          diuCobre: e.target.checked,
                        })
                      }
                    />
                    <span>DIU cobre</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={antecedentes.anticoncepcion.diuLng52mg}
                      onChange={(e) =>
                        updateAntecedente('anticoncepcion', {
                          ...antecedentes.anticoncepcion,
                          diuLng52mg: e.target.checked,
                        })
                      }
                    />
                    <span>DIU-LNG 52 mg</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={antecedentes.anticoncepcion.pildoraImplanteProgestageno}
                      onChange={(e) =>
                        updateAntecedente('anticoncepcion', {
                          ...antecedentes.anticoncepcion,
                          pildoraImplanteProgestageno: e.target.checked,
                        })
                      }
                    />
                    <span>píldora/implante/progestágeno</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={antecedentes.anticoncepcion.combinada}
                      onChange={(e) =>
                        updateAntecedente('anticoncepcion', {
                          ...antecedentes.anticoncepcion,
                          combinada: e.target.checked,
                        })
                      }
                    />
                    <span>combinada</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <span>otro</span>
                    <input
                      type="text"
                      value={antecedentes.anticoncepcion.otro}
                      onChange={(e) =>
                        updateAntecedente('anticoncepcion', {
                          ...antecedentes.anticoncepcion,
                          otro: e.target.value,
                        })
                      }
                      className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded w-28 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Cirugía */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Cirugía</div>
                <div className="md:col-span-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.cirugia.uteroIntacto}
                        onChange={(e) =>
                          updateAntecedente('cirugia', {
                            ...antecedentes.cirugia,
                            uteroIntacto: e.target.checked,
                          })
                        }
                      />
                      <span>útero intacto</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.cirugia.histerectomiaTotal}
                        onChange={(e) =>
                          updateAntecedente('cirugia', {
                            ...antecedentes.cirugia,
                            histerectomiaTotal: e.target.checked,
                          })
                        }
                      />
                      <span>histerectomía total</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.cirugia.histerectomiaSubtotal}
                        onChange={(e) =>
                          updateAntecedente('cirugia', {
                            ...antecedentes.cirugia,
                            histerectomiaSubtotal: e.target.checked,
                          })
                        }
                      />
                      <span>subtotal</span>
                    </label>
                    <span className="text-slate-300">|</span>
                    <span className="font-semibold text-slate-600">ovarios:</span>
                    {['ambos', 'uno', 'ninguno'].map((ov) => (
                      <label key={ov} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="ovarios"
                          checked={antecedentes.cirugia.ovarios === ov}
                          onChange={() =>
                            updateAntecedente('cirugia', {
                              ...antecedentes.cirugia,
                              ovarios: ov as any,
                            })
                          }
                        />
                        <span>{ov}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">fecha/causa:</span>
                    <input
                      type="text"
                      value={antecedentes.cirugia.fechaCausa}
                      onChange={(e) =>
                        updateAntecedente('cirugia', {
                          ...antecedentes.cirugia,
                          fechaCausa: e.target.value,
                        })
                      }
                      className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Sangrado actual */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Sangrado actual</div>
                <div className="md:col-span-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="sangradoPresenta"
                        checked={antecedentes.sangradoActual.presenta === 'NO'}
                        onChange={() =>
                          updateAntecedente('sangradoActual', {
                            ...antecedentes.sangradoActual,
                            presenta: 'NO',
                          })
                        }
                      />
                      <span>NO</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-rose-700">
                      <input
                        type="radio"
                        name="sangradoPresenta"
                        checked={antecedentes.sangradoActual.presenta === 'SÍ'}
                        onChange={() =>
                          updateAntecedente('sangradoActual', {
                            ...antecedentes.sangradoActual,
                            presenta: 'SÍ',
                          })
                        }
                      />
                      <span>SÍ:</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.sangradoActual.intermenstrual}
                        onChange={(e) =>
                          updateAntecedente('sangradoActual', {
                            ...antecedentes.sangradoActual,
                            intermenstrual: e.target.checked,
                          })
                        }
                      />
                      <span>intermenstrual</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.sangradoActual.postcoital}
                        onChange={(e) =>
                          updateAntecedente('sangradoActual', {
                            ...antecedentes.sangradoActual,
                            postcoital: e.target.checked,
                          })
                        }
                      />
                      <span>postcoital</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-rose-800">
                      <input
                        type="checkbox"
                        checked={antecedentes.sangradoActual.postmenopausico}
                        onChange={(e) =>
                          updateAntecedente('sangradoActual', {
                            ...antecedentes.sangradoActual,
                            postmenopausico: e.target.checked,
                          })
                        }
                      />
                      <span>postmenopáusico</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.sangradoActual.abundanteProlongado}
                        onChange={(e) =>
                          updateAntecedente('sangradoActual', {
                            ...antecedentes.sangradoActual,
                            abundanteProlongado: e.target.checked,
                          })
                        }
                      />
                      <span>abundante/prolongado</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">detalle:</span>
                    <input
                      type="text"
                      value={antecedentes.sangradoActual.detalle}
                      onChange={(e) =>
                        updateAntecedente('sangradoActual', {
                          ...antecedentes.sangradoActual,
                          detalle: e.target.value,
                        })
                      }
                      className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Tamizajes */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Tamizajes</div>
                <div className="md:col-span-3 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">Cérvix: fecha</span>
                      <input
                        type="date"
                        value={antecedentes.tamizajes.cervixFecha}
                        onChange={(e) =>
                          updateAntecedente('tamizajes', {
                            ...antecedentes.tamizajes,
                            cervixFecha: e.target.value,
                          })
                        }
                        className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                      <span className="font-semibold text-slate-700">resultado</span>
                      <input
                        type="text"
                        value={antecedentes.tamizajes.cervixResultado}
                        onChange={(e) =>
                          updateAntecedente('tamizajes', {
                            ...antecedentes.tamizajes,
                            cervixResultado: e.target.value,
                          })
                        }
                        className="flex-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">Mama: fecha</span>
                      <input
                        type="date"
                        value={antecedentes.tamizajes.mamaFecha}
                        onChange={(e) =>
                          updateAntecedente('tamizajes', {
                            ...antecedentes.tamizajes,
                            mamaFecha: e.target.value,
                          })
                        }
                        className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                      <span className="font-semibold text-slate-700">resultado</span>
                      <input
                        type="text"
                        value={antecedentes.tamizajes.mamaResultado}
                        onChange={(e) =>
                          updateAntecedente('tamizajes', {
                            ...antecedentes.tamizajes,
                            mamaResultado: e.target.value,
                          })
                        }
                        className="flex-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">otros:</span>
                    <input
                      type="text"
                      value={antecedentes.tamizajes.otros}
                      onChange={(e) =>
                        updateAntecedente('tamizajes', {
                          ...antecedentes.tamizajes,
                          otros: e.target.value,
                        })
                      }
                      className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Simulador (All 13 checkboxes matching image 4) */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Simulador</div>
                <div className="md:col-span-3 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      ['anemiaFerropenia', 'anemia/ferropenia'],
                      ['hipotiroidismo', 'hipotiroidismo'],
                      ['hipertiroidismo', 'hipertiroidismo'],
                      ['diabetes', 'diabetes'],
                      ['deficitB12', 'déficit B12 según clínica'],
                      ['apnea', 'apnea'],
                      ['depresionAnsiedad', 'depresión/ansiedad'],
                      ['infeccion', 'infección'],
                      ['reumatologicoArtrosisLupus', 'reumatológico/artrosis/lupus'],
                      ['neurologico', 'neurológico'],
                      ['ituDermatosisVulvodiniaPisoPelvico', 'infección urinaria/dermatosis/vulvodinia/piso pélvico'],
                      ['farmacos', 'fármacos'],
                      ['corticoides', 'corticoides'],
                    ].map(([k, label]) => (
                      <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!(antecedentes.simuladores as any)[k]}
                          onChange={(e) =>
                            updateAntecedente('simuladores', {
                              ...antecedentes.simuladores,
                              [k]: e.target.checked,
                            })
                          }
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Detalle o descartes de simuladores..."
                    value={antecedentes.simuladores.detalle}
                    onChange={(e) =>
                      updateAntecedente('simuladores', {
                        ...antecedentes.simuladores,
                        detalle: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded mt-1"
                  />
                </div>
              </div>

              {/* Agravante (All checkboxes matching image 4) */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Agravante</div>
                <div className="md:col-span-3 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {[
                      ['obesidad', 'obesidad'],
                      ['sedentarismo', 'sedentarismo'],
                      ['estres', 'estrés'],
                      ['alcohol', 'alcohol'],
                      ['tabaco', 'tabaco'],
                      ['cafeina', 'cafeína'],
                      ['malSueno', 'mal sueño'],
                      ['dolorCronico', 'dolor crónico'],
                      ['factoresSexualesRelacionales', 'factores sexuales/relacionales'],
                      ['farmacos', 'fármacos'],
                      ['fracturaFragilidad', 'fractura por fragilidad'],
                      ['antecedenteParentalCadera', 'antecedente parental de cadera'],
                      ['corticoides', 'corticoides'],
                      ['bajoPeso', 'bajo peso'],
                      ['caidas', 'caídas'],
                      ['enfermedadSecundaria', 'enfermedad secundaria'],
                    ].map(([k, label]) => (
                      <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!(antecedentes.agravantes as any)[k]}
                          onChange={(e) =>
                            updateAntecedente('agravantes', {
                              ...antecedentes.agravantes,
                              [k]: e.target.checked,
                            })
                          }
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-400 italic">
                    → considerar FRAX/DXA según edad y riesgo.
                  </div>
                  <input
                    type="text"
                    placeholder="Detalle de factores agravantes..."
                    value={antecedentes.agravantes.detalle}
                    onChange={(e) =>
                      updateAntecedente('agravantes', {
                        ...antecedentes.agravantes,
                        detalle: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
                  />
                </div>
              </div>

              {/* Modificador de tratamiento (All checkboxes from Image 4 & 3) */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-rose-900 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Modificador de tratamiento</span>
                </div>
                <div className="md:col-span-3 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 text-[11px]">
                    {[
                      ['hipertension', 'hipertensión'],
                      ['diabetes', 'diabetes'],
                      ['obesidad', 'obesidad'],
                      ['dislipidemiaHipertrigliceridemia', 'dislipidemia/hipertrigliceridemia'],
                      ['migrana', 'migraña'],
                      ['tromboembolismoTrombofilia', 'tromboembolismo/trombofilia'],
                      ['cardiovascular', 'cardiovascular'],
                      ['hepatopatia', 'hepatopatía'],
                      ['lupusSaf', 'lupus/SAF'],
                      ['artritisReumatoide', 'artritis reumatoide'],
                      ['sop', 'SOP'],
                      ['endometriosis', 'endometriosis'],
                      ['tiroides', 'tiroides'],
                      ['osteoporosis', 'osteoporosis'],
                      ['sangradoPosmenopausicoInexplicado', 'sangrado posmenopáusico/inexplicado'],
                      ['cancerHormonodependienteRelevante', 'cáncer hormonodependiente relevante'],
                      ['ictusEnfermedadCardiovascular', 'ictus/enfermedad cardiovascular'],
                      ['hepatopatiaSignificativa', 'hepatopatía significativa'],
                    ].map(([k, label]) => (
                      <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!(antecedentes.modificadores as any)[k]}
                          onChange={(e) =>
                            updateAntecedente('modificadores', {
                              ...antecedentes.modificadores,
                              [k]: e.target.checked,
                            })
                          }
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Red/High Alert block from image 3 */}
                  <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-200 mt-2">
                    <div className="text-[11px] font-bold text-rose-900 mb-1">
                      Condiciones de Alerta / Contraindicación THM:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 text-[11px]">
                      {[
                        ['cancerMama', 'Cáncer de mama'],
                        ['endometrio', 'endometrio'],
                        ['ovarioOtroHormonodependiente', 'ovario/otro hormonodependiente'],
                        ['lesionMamariaPendiente', 'lesión mamaria pendiente'],
                        ['trombosisVenosa', 'trombosis venosa'],
                        ['emboliaPulmonar', 'embolia pulmonar'],
                        ['trombofilia', 'trombofilia'],
                        ['acvAit', 'ACV/AIT'],
                        ['infartoCoronaria', 'infarto/coronaria'],
                        ['migranaConAura', 'migraña con aura'],
                        ['hta', 'HTA'],
                        ['erc', 'ERC'],
                        ['litiasisRenal', 'litiasis renal'],
                        ['malabsorcionBariatrica', 'malabsorción/bariátrica'],
                        ['epilepsia', 'epilepsia'],
                      ].map(([k, label]) => (
                        <label key={k} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!(antecedentes.modificadores as any)[k]}
                            onChange={(e) =>
                              updateAntecedente('modificadores', {
                                ...antecedentes.modificadores,
                                [k]: e.target.checked,
                              })
                            }
                          />
                          <span className={(antecedentes.modificadores as any)[k] ? 'font-bold text-rose-800' : ''}>
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="DETALLE/FECHA/TRATAMIENTO..."
                    value={antecedentes.modificadores.detalleFechaTratamiento}
                    onChange={(e) =>
                      updateAntecedente('modificadores', {
                        ...antecedentes.modificadores,
                        detalleFechaTratamiento: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded mt-1"
                  />
                </div>
              </div>

              {/* Riesgo óseo (Image 3) */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Riesgo oseo</div>
                <div className="md:col-span-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.riesgoOseo.osteoporosis}
                        onChange={(e) =>
                          updateAntecedente('riesgoOseo', {
                            ...antecedentes.riesgoOseo,
                            osteoporosis: e.target.checked,
                          })
                        }
                      />
                      <span>osteoporosis</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.riesgoOseo.fracturaFragilidad}
                        onChange={(e) =>
                          updateAntecedente('riesgoOseo', {
                            ...antecedentes.riesgoOseo,
                            fracturaFragilidad: e.target.checked,
                          })
                        }
                      />
                      <span>fractura fragilidad</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.riesgoOseo.familiarCadera}
                        onChange={(e) =>
                          updateAntecedente('riesgoOseo', {
                            ...antecedentes.riesgoOseo,
                            familiarCadera: e.target.checked,
                          })
                        }
                      />
                      <span>Familiar cadera</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.riesgoOseo.corticoide}
                        onChange={(e) =>
                          updateAntecedente('riesgoOseo', {
                            ...antecedentes.riesgoOseo,
                            corticoide: e.target.checked,
                          })
                        }
                      />
                      <span>Corticoide</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.riesgoOseo.caidas}
                        onChange={(e) =>
                          updateAntecedente('riesgoOseo', {
                            ...antecedentes.riesgoOseo,
                            caidas: e.target.checked,
                          })
                        }
                      />
                      <span>Caídas</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-700">FRAX:</span>
                      <input
                        type="text"
                        value={antecedentes.riesgoOseo.frax}
                        onChange={(e) =>
                          updateAntecedente('riesgoOseo', {
                            ...antecedentes.riesgoOseo,
                            frax: e.target.value,
                          })
                        }
                        className="flex-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-700">DXA:</span>
                      <input
                        type="text"
                        value={antecedentes.riesgoOseo.dxa}
                        onChange={(e) =>
                          updateAntecedente('riesgoOseo', {
                            ...antecedentes.riesgoOseo,
                            dxa: e.target.value,
                          })
                        }
                        className="flex-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-700">Vitamina D/calcio:</span>
                      <input
                        type="text"
                        value={antecedentes.riesgoOseo.vitaminaDCalcio}
                        onChange={(e) =>
                          updateAntecedente('riesgoOseo', {
                            ...antecedentes.riesgoOseo,
                            vitaminaDCalcio: e.target.value,
                          })
                        }
                        className="flex-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Habitos (Image 3) */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Habitos</div>
                <div className="md:col-span-3 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Tabaco:</span>
                      <input
                        type="text"
                        value={antecedentes.habitos.tabaco}
                        onChange={(e) =>
                          updateAntecedente('habitos', { ...antecedentes.habitos, tabaco: e.target.value })
                        }
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Alcohol:</span>
                      <input
                        type="text"
                        value={antecedentes.habitos.alcohol}
                        onChange={(e) =>
                          updateAntecedente('habitos', { ...antecedentes.habitos, alcohol: e.target.value })
                        }
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Sueño (h):</span>
                      <input
                        type="text"
                        value={antecedentes.habitos.suenoHoras}
                        onChange={(e) =>
                          updateAntecedente('habitos', { ...antecedentes.habitos, suenoHoras: e.target.value })
                        }
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Fuerza/sem:</span>
                      <input
                        type="text"
                        value={antecedentes.habitos.fuerzaSem}
                        onChange={(e) =>
                          updateAntecedente('habitos', { ...antecedentes.habitos, fuerzaSem: e.target.value })
                        }
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Aeróbico/sem:</span>
                      <input
                        type="text"
                        value={antecedentes.habitos.aerobicoSem}
                        onChange={(e) =>
                          updateAntecedente('habitos', { ...antecedentes.habitos, aerobicoSem: e.target.value })
                        }
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Alimentación/proteína/calcio:</span>
                    <input
                      type="text"
                      value={antecedentes.habitos.alimentacionProteinaCalcio}
                      onChange={(e) =>
                        updateAntecedente('habitos', {
                          ...antecedentes.habitos,
                          alimentacionProteinaCalcio: e.target.value,
                        })
                      }
                      className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Antecedentes familiares (Image 3) */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Antecedentes familiares</div>
                <div className="md:col-span-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.antecedentesFamiliares.cancerMamaOvarioEndometrioColon}
                        onChange={(e) =>
                          updateAntecedente('antecedentesFamiliares', {
                            ...antecedentes.antecedentesFamiliares,
                            cancerMamaOvarioEndometrioColon: e.target.checked,
                          })
                        }
                      />
                      <span>cancer de mama/ovario/endometrio/colon</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.antecedentesFamiliares.trombosis}
                        onChange={(e) =>
                          updateAntecedente('antecedentesFamiliares', {
                            ...antecedentes.antecedentesFamiliares,
                            trombosis: e.target.checked,
                          })
                        }
                      />
                      <span>trombosis</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.antecedentesFamiliares.cvPrecoz}
                        onChange={(e) =>
                          updateAntecedente('antecedentesFamiliares', {
                            ...antecedentes.antecedentesFamiliares,
                            cvPrecoz: e.target.checked,
                          })
                        }
                      />
                      <span>CV precoz</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={antecedentes.antecedentesFamiliares.fracturaCadera}
                        onChange={(e) =>
                          updateAntecedente('antecedentesFamiliares', {
                            ...antecedentes.antecedentesFamiliares,
                            fracturaCadera: e.target.checked,
                          })
                        }
                      />
                      <span>fractura cadera</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Detalles y parentesco..."
                    value={antecedentes.antecedentesFamiliares.detalle}
                    onChange={(e) =>
                      updateAntecedente('antecedentesFamiliares', {
                        ...antecedentes.antecedentesFamiliares,
                        detalle: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
                  />
                </div>
              </div>

              {/* Medicamentos previos (Image 3) */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="font-bold text-slate-800">Medicamentos previos</div>
                <div className="md:col-span-3 space-y-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Medicamentos y dosis:</span>
                    <input
                      type="text"
                      value={antecedentes.medicamentosPrevios.medicamentosDosis}
                      onChange={(e) =>
                        updateAntecedente('medicamentosPrevios', {
                          ...antecedentes.medicamentosPrevios,
                          medicamentosDosis: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">THM previa/actual:</span>
                      <input
                        type="text"
                        value={antecedentes.medicamentosPrevios.thmPreviaActual}
                        onChange={(e) =>
                          updateAntecedente('medicamentosPrevios', {
                            ...antecedentes.medicamentosPrevios,
                            thmPreviaActual: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">respuesta/EA:</span>
                      <input
                        type="text"
                        value={antecedentes.medicamentosPrevios.respuestaEa}
                        onChange={(e) =>
                          updateAntecedente('medicamentosPrevios', {
                            ...antecedentes.medicamentosPrevios,
                            respuestaEa: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: SEGUIMIENTO POR CITAS (INICIAL, C1 A C6)                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'seguimiento' && (
        <div className="space-y-6">
          {/* Matrix legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-sky-50/60 border border-sky-100 rounded-2xl text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                Todas las tablas clínicas (<strong>Funciones Vitales</strong>, <strong>Examen Físico</strong>, <strong>5 Ejes</strong>, <strong>Laboratorio</strong>, <strong>Alarmas</strong> y <strong>Tratamiento</strong>) muestran todas las citas ({citas.map((c) => c.etiqueta).join(', ')}) en columnas comparativas estilo Hoja de Control.
              </span>
            </div>
          </div>

          {/* Inline Delete Confirmation Dialog (visible at any scroll position) */}
          {pendingDeleteIndex !== null && citas[pendingDeleteIndex] && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-cita-title"
              className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4"
            >
              <div className="bg-white rounded-2xl border border-rose-200 shadow-xl max-w-md w-full p-5 text-xs space-y-4">
                <div className="space-y-1">
                  <h4 id="delete-cita-title" className="text-sm font-bold text-slate-900">
                    Eliminar cita {citas[pendingDeleteIndex].etiqueta}
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    ¿Confirmas eliminar la cita <strong>{citas[pendingDeleteIndex].etiqueta}</strong> y todos sus registros asociados en Funciones Vitales, Examen Físico, Ejes y Diagnóstico?
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingDeleteIndex(null)}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl cursor-pointer transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteCita}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl cursor-pointer transition"
                  >
                    Sí, eliminar cita
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 1. FUNCIONES VITALES Y ANTROPOMETRÍA (Matrix Layout: Inicial, C1, C2...) */}
          <FuncionesVitalesMatrixTable
            citas={citas}
            activeCitaIndex={activeCitaIndex}
            onSelectCita={setActiveCitaIndex}
            onUpdateCita={updateCita}
            onAddCita={handleAddCita}
            onDeleteCita={handleDeleteCita}
          />

          {/* 2. EXAMEN FÍSICO DIRIGIDO (Matrix Layout: Inicial, C1, C2...) */}
          <ExamenFisicoMatrixTable
            citas={citas}
            activeCitaIndex={activeCitaIndex}
            onSelectCita={setActiveCitaIndex}
            onUpdateCita={updateCita}
            onAddCita={handleAddCita}
            onDeleteCita={handleDeleteCita}
          />

          {/* 3. LOS 5 EJES CLÍNICOS (Matrix Layout: Inicial, C1, C2...) */}
          <CincoEjesMatrixTable
            citas={citas}
            activeCitaIndex={activeCitaIndex}
            onSelectCita={setActiveCitaIndex}
            onUpdateCita={updateCita}
            onAddCita={handleAddCita}
            onDeleteCita={handleDeleteCita}
          />

          {/* 4. LABORATORIO - "IMITADORES", HORMONAS Y TAMIZAJES (Matrix Layout) */}
          <LaboratorioMatrixTable
            citas={citas}
            activeCitaIndex={activeCitaIndex}
            onSelectCita={setActiveCitaIndex}
            onUpdateCita={updateCita}
            onAddCita={handleAddCita}
            onDeleteCita={handleDeleteCita}
          />

          {/* 5. EFECTOS ADVERSOS / ALARMAS DURANTE EL TRATAMIENTO (Matrix Layout) */}
          <AlarmasMatrixTable
            citas={citas}
            activeCitaIndex={activeCitaIndex}
            onSelectCita={setActiveCitaIndex}
            onUpdateCita={updateCita}
            onAddCita={handleAddCita}
            onDeleteCita={handleDeleteCita}
          />

          {/* 6. TRATAMIENTO PRESCRITO (Matrix Layout) */}
          <TratamientoMatrixTable
            citas={citas}
            activeCitaIndex={activeCitaIndex}
            onSelectCita={setActiveCitaIndex}
            onUpdateCita={updateCita}
            onAddCita={handleAddCita}
            onDeleteCita={handleDeleteCita}
          />

          {/* Selector de cita para Diagnóstico (Diagnóstico permanece sin cambios) */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto p-2 bg-white rounded-2xl border border-sky-100 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-600 px-2">Cita para Diagnóstico:</span>
              {citas.map((cita, idx) => {
                const isActive = idx === activeCitaIndex;
                return (
                  <button
                    key={cita.id}
                    type="button"
                    onClick={() => setActiveCitaIndex(idx)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-sky-800 hover:bg-sky-50'
                    }`}
                  >
                    <span>{cita.etiqueta}</span>
                    {cita.fecha && (
                      <span className={`text-[10px] font-normal ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                        ({cita.fecha})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAddCita}
              className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold text-xs rounded-xl border border-sky-200/80 transition cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Cita</span>
            </button>
          </div>

          {/* 7. DIAGNOSTICO (Sin cambios) */}
          {citas[activeCitaIndex] && (() => {
            const cita = citas[activeCitaIndex];

            return (
              <div className="space-y-6">
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md text-xs">
                  <h3 className="text-sm font-bold text-sky-200 mb-3 pb-2 border-b border-slate-700 uppercase tracking-wide">
                    DIAGNOSTICO:
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <span className="text-sky-300 block text-[10px]">FECHA</span>
                      <input
                        type="date"
                        value={cita.diagnostico.fecha || cita.fecha}
                        onChange={(e) =>
                          updateCita(activeCitaIndex, (c) => ({
                            ...c,
                            diagnostico: { ...c.diagnostico, fecha: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-white rounded"
                      />
                    </div>
                    <div>
                      <span className="text-sky-300 block text-[10px]">Etapa</span>
                      <input
                        type="text"
                        value={cita.diagnostico.etapa}
                        onChange={(e) =>
                          updateCita(activeCitaIndex, (c) => ({
                            ...c,
                            diagnostico: { ...c.diagnostico, etapa: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-white rounded"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-sky-300 block text-[10px]">Motivo de consulta (sintoma principal)</span>
                      <input
                        type="text"
                        value={cita.diagnostico.motivoConsultaSintomaPrincipal}
                        onChange={(e) =>
                          updateCita(activeCitaIndex, (c) => ({
                            ...c,
                            diagnostico: { ...c.diagnostico, motivoConsultaSintomaPrincipal: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-white rounded"
                      />
                    </div>
                    <div>
                      <span className="text-sky-300 block text-[10px]">Simulador</span>
                      <input
                        type="text"
                        value={cita.diagnostico.simulador}
                        onChange={(e) =>
                          updateCita(activeCitaIndex, (c) => ({
                            ...c,
                            diagnostico: { ...c.diagnostico, simulador: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-white rounded"
                      />
                    </div>
                    <div>
                      <span className="text-sky-300 block text-[10px]">Agravante</span>
                      <input
                        type="text"
                        value={cita.diagnostico.agravante}
                        onChange={(e) =>
                          updateCita(activeCitaIndex, (c) => ({
                            ...c,
                            diagnostico: { ...c.diagnostico, agravante: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-white rounded"
                      />
                    </div>
                    <div>
                      <span className="text-sky-300 block text-[10px]">Modificador</span>
                      <input
                        type="text"
                        value={cita.diagnostico.modificador}
                        onChange={(e) =>
                          updateCita(activeCitaIndex, (c) => ({
                            ...c,
                            diagnostico: { ...c.diagnostico, modificador: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-white rounded"
                      />
                    </div>
                    <div>
                      <span className="text-sky-300 block text-[10px]">Eje dominante</span>
                      <input
                        type="text"
                        value={cita.diagnostico.ejeDominante}
                        onChange={(e) =>
                          updateCita(activeCitaIndex, (c) => ({
                            ...c,
                            diagnostico: { ...c.diagnostico, ejeDominante: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-white rounded"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <span className="text-sky-300 block text-[10px]">Otros diagnosticos</span>
                      <input
                        type="text"
                        value={cita.diagnostico.otrosDiagnosticos}
                        onChange={(e) =>
                          updateCita(activeCitaIndex, (c) => ({
                            ...c,
                            diagnostico: { ...c.diagnostico, otrosDiagnosticos: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-white rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
