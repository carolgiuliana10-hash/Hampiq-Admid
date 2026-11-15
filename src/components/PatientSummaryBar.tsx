/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Table,
  FileCheck2,
  FileText,
  CalendarClock,
  UserCog,
  X,
  Check
} from 'lucide-react';
import { Patient } from '../types/clinical';
import { calculateAge } from '../utils/clinical-calculations';

export type TabKey = 'hc' | 'hoja_control' | 'indicacion_guia' | 'notas_voz';

interface PatientSummaryBarProps {
  patient: Patient;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onBackToList: () => void;
  onUpdatePatientField: (field: keyof Patient, value: any) => void;
}

export const PatientSummaryBar: React.FC<PatientSummaryBarProps> = ({
  patient,
  activeTab,
  onTabChange,
  onBackToList,
  onUpdatePatientField,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNombres, setEditNombres] = useState(patient.nombres);
  const [editApellidos, setEditApellidos] = useState(patient.apellidos);
  const [editDni, setEditDni] = useState(patient.dni);
  const [editCelular, setEditCelular] = useState(patient.celular || '');
  const [editFechaNac, setEditFechaNac] = useState(patient.fechaNacimiento);
  const [editDireccion, setEditDireccion] = useState(patient.direccion || '');
  const [editOcupacion, setEditOcupacion] = useState(patient.ocupacion || '');

  const age = calculateAge(patient.fechaNacimiento);

  const handleOpenEdit = () => {
    setEditNombres(patient.nombres);
    setEditApellidos(patient.apellidos);
    setEditDni(patient.dni);
    setEditCelular(patient.celular || '');
    setEditFechaNac(patient.fechaNacimiento);
    setEditDireccion(patient.direccion || '');
    setEditOcupacion(patient.ocupacion || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNombres.trim() || !editApellidos.trim() || !editDni.trim()) {
      alert('Por favor complete los nombres, apellidos y DNI.');
      return;
    }
    onUpdatePatientField('nombres', editNombres.trim());
    onUpdatePatientField('apellidos', editApellidos.trim());
    onUpdatePatientField('dni', editDni.trim());
    onUpdatePatientField('celular', editCelular.trim());
    onUpdatePatientField('fechaNacimiento', editFechaNac);
    onUpdatePatientField('direccion', editDireccion.trim());
    onUpdatePatientField('ocupacion', editOcupacion.trim());
    setIsEditModalOpen(false);
  };

  return (
    <div className="no-print bg-white border-b border-sky-100 shadow-xs mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top Info Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <button
              onClick={onBackToList}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition cursor-pointer"
              title="Volver a la lista de pacientes"
              aria-label="Volver a la lista"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  {patient.nombres} {patient.apellidos}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200/60">
                  {age !== null ? `${age} años` : 'Edad no calculada'}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium">DNI: {patient.dni}</span>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100/70 px-2 py-0.5 rounded border border-sky-200 transition cursor-pointer"
                  title="Editar datos demográficos de la paciente"
                >
                  <UserCog className="w-3 h-3" />
                  <span>Editar datos</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Etapa reproductiva:</span>
                  <input
                    type="text"
                    value={patient.etapaActual || ''}
                    onChange={(e) => onUpdatePatientField('etapaActual', e.target.value)}
                    placeholder="Ej. Perimenopausia tardía"
                    className="font-medium text-slate-700 bg-transparent hover:bg-slate-50 focus:bg-white border-b border-dashed border-slate-300 focus:border-sky-500 px-1 py-0.5 outline-hidden transition text-xs"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Última cita:</span>
                  <input
                    type="date"
                    value={patient.ultimaCita || ''}
                    onChange={(e) => onUpdatePatientField('ultimaCita', e.target.value)}
                    className="font-medium text-slate-700 bg-transparent hover:bg-slate-50 border-b border-dashed border-slate-300 px-1 py-0.5 text-xs outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <CalendarClock className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-sky-800 font-semibold">Próxima cita:</span>
                  <input
                    type="date"
                    value={patient.proximaCita || ''}
                    onChange={(e) => onUpdatePatientField('proximaCita', e.target.value)}
                    className="font-bold text-sky-700 bg-sky-50/70 border border-sky-200/80 rounded-md px-2 py-0.5 text-xs outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats or Pills */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            {patient.celular && (
              <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                Cel: {patient.celular}
              </span>
            )}
            {patient.ocupacion && (
              <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg hidden sm:inline-block">
                {patient.ocupacion}
              </span>
            )}
          </div>
        </div>

        {/* 4 Navigation Tabs: 2 taps max to any view */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('hc')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'hc'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/70'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>1. Historia Clínica Integral</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-sm ${
                activeTab === 'hc' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              Interno
            </span>
          </button>

          <button
            onClick={() => onTabChange('hoja_control')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'hoja_control'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/70'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>2. Hoja de Control y Seguimiento</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-sm ${
                activeTab === 'hoja_control' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              Interno
            </span>
          </button>

          <button
            onClick={() => onTabChange('indicacion_guia')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'indicacion_guia'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/70'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>3. Indicación Médica y Guía Nutricional</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-sm">
              Para Paciente
            </span>
          </button>

          <button
            onClick={() => onTabChange('notas_voz')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'notas_voz'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/70'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>4. Notas Clínicas</span>
            {(patient.notasVoz || []).length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'notas_voz' ? 'bg-sky-700 text-white' : 'bg-sky-100 text-sky-800'
                }`}
              >
                {(patient.notasVoz || []).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Demographic Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <UserCog className="w-4 h-4 text-sky-600" />
                <span>Editar Datos de la Paciente</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    value={editNombres}
                    onChange={(e) => setEditNombres(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    value={editApellidos}
                    onChange={(e) => setEditApellidos(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">DNI *</label>
                  <input
                    type="text"
                    value={editDni}
                    onChange={(e) => setEditDni(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Celular</label>
                  <input
                    type="text"
                    value={editCelular}
                    onChange={(e) => setEditCelular(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={editFechaNac}
                    onChange={(e) => setEditFechaNac(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ocupación</label>
                  <input
                    type="text"
                    value={editOcupacion}
                    onChange={(e) => setEditOcupacion(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={editDireccion}
                  onChange={(e) => setEditDireccion(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Datos</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
