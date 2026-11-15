/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Calendar, Star, Info, HeartPulse, Download } from 'lucide-react';
import { Patient, HojaControlData } from '../types/clinical';
import { findNearestAppointment } from '../utils/clinical-calculations';

interface HojaControlViewProps {
  patient: Patient;
  onUpdateHojaControl: (data: HojaControlData) => void;
}

export const HojaControlView: React.FC<HojaControlViewProps> = ({
  patient,
  onUpdateHojaControl,
}) => {
  const { citas, fechas, filas } = patient.hojaControl;
  const [newRowName, setNewRowName] = useState('');
  const [showAddRowInput, setShowAddRowInput] = useState(false);

  // Compute nearest appointment for highlighting
  const nearestCitaId = useMemo(() => {
    const datesArray = citas.map((c) => ({
      id: c.id,
      fecha: fechas[c.id] || '',
    }));
    return findNearestAppointment(datesArray);
  }, [citas, fechas]);

  // Update date for a consultation column
  const handleDateChange = (citaId: string, newDate: string) => {
    onUpdateHojaControl({
      ...patient.hojaControl,
      fechas: {
        ...fechas,
        [citaId]: newDate,
      },
    });
  };

  // Update cell value
  const handleCellChange = (filaId: string, citaId: string, val: string) => {
    const nextFilas = filas.map((f) => {
      if (f.id === filaId) {
        return {
          ...f,
          valores: {
            ...f.valores,
            [citaId]: val,
          },
        };
      }
      return f;
    });

    onUpdateHojaControl({
      ...patient.hojaControl,
      filas: nextFilas,
    });
  };

  // Add consultation column
  const handleAddColumn = () => {
    let nextEtiqueta = 'Inicial';
    if (citas.length > 0) {
      nextEtiqueta = `C${citas.length}`;
    }
    const newCitaId = nextEtiqueta;

    onUpdateHojaControl({
      ...patient.hojaControl,
      citas: [...citas, { id: newCitaId, etiqueta: nextEtiqueta }],
    });
  };

  // Add custom row
  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRowName.trim()) return;

    const newFila = {
      id: 'f_' + Math.random().toString(36).substring(2, 8),
      concepto: newRowName.trim(),
      valores: {},
    };

    onUpdateHojaControl({
      ...patient.hojaControl,
      filas: [...filas, newFila],
    });
    setNewRowName('');
    setShowAddRowInput(false);
  };

  // Delete row
  const handleDeleteRow = (filaId: string, concepto: string) => {
    if (confirm(`¿Eliminar la fila "${concepto}"?`)) {
      onUpdateHojaControl({
        ...patient.hojaControl,
        filas: filas.filter((f) => f.id !== filaId),
      });
    }
  };

  const handleDownloadPDF = () => {
    const originalTitle = document.title;
    document.title = `Hampiq_Hoja_de_Control_${patient.nombres}_${patient.apellidos}`.replace(/\s+/g, '_');
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              HOJA DE CONTROL Y SEGUIMIENTO
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md border border-slate-200">
              Uso Interno Médico
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Matriz de seguimiento de citas (Inicial, C1 a C12). Registro interno confidencial del equipo médico.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="no-print inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-sky-50 text-sky-800 font-semibold text-xs rounded-xl border border-sky-200 shadow-xs transition cursor-pointer"
            title="Descargar Hoja de Control en PDF"
          >
            <Download className="w-3.5 h-3.5 text-sky-700" />
            <span>Descargar PDF</span>
          </button>
          <button
            onClick={handleAddColumn}
            className="no-print inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Agregar Cita</span>
          </button>
        </div>
      </div>

      {/* Official Hampiq Header for UI and Printable Export */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo-hampiq.jpg"
            alt="Hampiq Biomedicina"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/IMG-20261030-WA0075_90400adc.jpg';
            }}
            className="h-12 sm:h-14 w-auto object-contain rounded-md"
          />
        </div>
        <div className="text-right text-xs text-slate-500">
          <div className="font-bold text-slate-900 text-sm">Hampiq Biomedicina</div>
          <div className="text-[11px] text-sky-800 font-medium">HOJA DE CONTROL Y SEGUIMIENTO</div>
          <div className="text-[10px] text-slate-400">Emisión: {new Date().toLocaleDateString('es-PE')}</div>
        </div>
      </div>

      {/* Patient header matching image 2 */}
      <div className="bg-white rounded-xl border border-sky-100 p-4 mb-4 flex items-center justify-between shadow-2xs">
        <div className="text-sm text-slate-700">
          <span className="text-slate-400">Nombre y Apellido: </span>
          <strong className="text-slate-900 font-bold ml-1">
            {patient.nombres} {patient.apellidos}
          </strong>
        </div>
        <div className="text-xs text-slate-500">
          DNI: <span className="font-semibold text-slate-800">{patient.dni}</span>
        </div>
      </div>

      {/* Legend & Nearest highlight */}
      <div className="flex items-center justify-between gap-3 p-3 bg-sky-50/60 border border-sky-100 rounded-xl mb-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            Las columnas corresponden a las citas sucesivas. La fila superior &quot;Consulta Médica&quot; almacena la fecha de cada consulta.
          </span>
        </div>
        {nearestCitaId && (
          <div className="flex items-center gap-1.5 font-bold text-sky-900 bg-sky-100/90 px-2.5 py-1 rounded-lg border border-sky-300 shrink-0">
            <Star className="w-3.5 h-3.5 text-sky-600 fill-sky-600" />
            <span>Cita más próxima: {nearestCitaId}</span>
          </div>
        )}
      </div>

      {/* Spreadsheet / Matrix with Horizontal Scroll */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[900px]">
            <thead>
              {/* Header: Citas */}
              <tr className="bg-slate-50/90 border-b border-sky-100">
                <th className="py-3 px-4 font-bold text-slate-700 w-52 sticky left-0 bg-slate-50/95 z-10 shadow-xs border-r border-slate-200">
                  Parámetro / Procedimiento
                </th>
                {citas.map((cita) => {
                  const isNearest = cita.id === nearestCitaId;
                  return (
                    <th
                      key={cita.id}
                      className={`py-3 px-3 text-center min-w-[150px] border-r border-slate-100 transition ${
                        isNearest
                          ? 'bg-sky-100/90 text-sky-950 font-extrabold ring-2 ring-sky-300 ring-inset'
                          : 'text-slate-700 font-bold'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {isNearest && <Star className="w-3 h-3 text-sky-600 fill-sky-600" />}
                        <span className="text-xs uppercase tracking-wide">
                          {cita.etiqueta}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>

              {/* Row 1: Consulta Médica (FECHA) */}
              <tr className="border-b-2 border-sky-200 bg-sky-50/40">
                <td className="py-2.5 px-4 font-bold text-sky-900 sticky left-0 bg-sky-50/95 z-10 border-r border-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Consulta Médica</span>
                </td>
                {citas.map((cita) => {
                  const isNearest = cita.id === nearestCitaId;
                  return (
                    <td
                      key={cita.id}
                      className={`py-2 px-2 text-center border-r border-slate-100 ${
                        isNearest ? 'bg-sky-100/80 ring-2 ring-sky-300 ring-inset' : ''
                      }`}
                    >
                      <input
                        type="date"
                        value={fechas[cita.id] || ''}
                        onChange={(e) => handleDateChange(cita.id, e.target.value)}
                        className={`w-full text-center px-2 py-1.5 rounded-lg text-xs font-semibold outline-hidden border ${
                          isNearest
                            ? 'bg-white border-sky-300 text-sky-950 shadow-xs'
                            : 'bg-white/80 border-slate-200 text-slate-800'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filas.map((fila) => (
                <tr key={fila.id} className="hover:bg-slate-50/60 transition group">
                  {/* Row Concept Header */}
                  <td className="py-2 px-4 font-bold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">{fila.concepto}</span>
                      <button
                        onClick={() => handleDeleteRow(fila.id, fila.concepto)}
                        title="Eliminar fila"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Row Cells */}
                  {citas.map((cita) => {
                    const isNearest = cita.id === nearestCitaId;
                    const val = fila.valores[cita.id] || '';
                    return (
                      <td
                        key={cita.id}
                        className={`py-1.5 px-2 border-r border-slate-100 ${
                          isNearest ? 'bg-sky-50/50 ring-1 ring-sky-200 ring-inset' : ''
                        }`}
                      >
                        <textarea
                          rows={2}
                          value={val}
                          onChange={(e) => handleCellChange(fila.id, cita.id, e.target.value)}
                          placeholder="Registrar indicación..."
                          className={`w-full p-2 text-xs rounded-lg outline-hidden resize-none transition border ${
                            isNearest
                              ? 'bg-white border-sky-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-200'
                              : 'bg-slate-50/60 hover:bg-white focus:bg-white border-slate-200/80 focus:border-sky-300'
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Section */}
        <div className="p-4 bg-slate-50 border-t border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {showAddRowInput ? (
            <form onSubmit={handleAddRow} className="flex items-center gap-2 w-full max-w-md">
              <input
                type="text"
                autoFocus
                value={newRowName}
                onChange={(e) => setNewRowName(e.target.value)}
                placeholder="Nombre del nuevo concepto..."
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-hidden focus:border-sky-400"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-500 transition cursor-pointer"
              >
                Guardar Fila
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddRowInput(false);
                  setNewRowName('');
                }}
                className="px-3 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Cancelar
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddRowInput(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 bg-white hover:bg-sky-50 px-3.5 py-2 rounded-xl border border-sky-200 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Agregar Fila</span>
            </button>
          )}

          <div className="text-[11px] text-slate-400">
            Filas base: ESM, Sueroterapia, Estrogeno, Progesterona, Testosterona.
          </div>
        </div>
      </div>
    </div>
  );
};
