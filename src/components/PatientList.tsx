/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Calendar,
  Phone,
  FileText,
  Trash2,
  Clock,
  ChevronRight,
  User
} from 'lucide-react';
import { Patient } from '../types/clinical';
import { calculateAge } from '../utils/clinical-calculations';
import { createNewPatient } from '../utils/storage';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: (newPatient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  onSelectPatient,
  onAddPatient,
  onDeletePatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [formError, setFormError] = useState('');

  // New patient form state
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [celular, setCelular] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ocupacion, setOcupacion] = useState('');

  const calculatedAge = useMemo(() => {
    return calculateAge(fechaNacimiento);
  }, [fechaNacimiento]);

  const filteredPatients = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return patients;
    return patients.filter((p) => {
      const fullName = `${p.nombres} ${p.apellidos}`.toLowerCase();
      return fullName.includes(term) || p.dni.includes(term);
    });
  }, [patients, searchTerm]);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!nombres.trim() || !apellidos.trim() || !dni.trim() || !fechaNacimiento) {
      setFormError(
        'Por favor complete los campos obligatorios: Nombres, Apellidos, DNI y Fecha de Nacimiento.'
      );
      return;
    }

    const newP = createNewPatient(
      nombres.trim(),
      apellidos.trim(),
      dni.trim(),
      fechaNacimiento,
      celular.trim(),
      direccion.trim(),
      ocupacion.trim()
    );
    onAddPatient(newP);
    // Reset form
    setNombres('');
    setApellidos('');
    setDni('');
    setCelular('');
    setFechaNacimiento('');
    setDireccion('');
    setOcupacion('');
    setIsModalOpen(false);
    onSelectPatient(newP);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Directorio de Pacientes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión interna de historias clínicas y seguimiento para la doctora y su equipo.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/20 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Registrar Paciente</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar paciente por nombre, apellido o DNI..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:ring-3 focus:ring-sky-100 rounded-xl text-sm transition outline-hidden shadow-xs"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Patients Grid / List */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sky-100 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No se encontraron pacientes</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No hay registros que coincidan con "${searchTerm}". Intente con otro término o DNI.`
              : 'Aún no hay pacientes registradas. Comience añadiendo una nueva paciente.'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-500 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Primera Paciente</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((patient) => {
            const age = calculateAge(patient.fechaNacimiento);
            return (
              <div
                key={patient.id}
                className="bg-white rounded-2xl border border-sky-100/80 hover:border-sky-300 p-5 shadow-xs hover:shadow-md transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <h3
                        onClick={() => onSelectPatient(patient)}
                        className="text-base font-bold text-slate-800 group-hover:text-sky-700 transition cursor-pointer"
                      >
                        {patient.nombres} {patient.apellidos}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>DNI: {patient.dni}</span>
                        <span>·</span>
                        <span>{age !== null ? `${age} años` : 'Edad sin definir'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setPatientToDelete(patient)}
                      title="Eliminar paciente"
                      className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                      aria-label="Eliminar paciente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stage & Details */}
                  <div className="space-y-2 py-3 border-y border-slate-100 my-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Etapa actual:</span>
                      <span className="font-semibold text-sky-800 bg-sky-50/70 px-2 py-0.5 rounded-md text-[11px]">
                        {patient.etapaActual || 'En evaluación'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Última cita:
                      </span>
                      <span className="font-medium text-slate-700">
                        {patient.ultimaCita || 'Sin registro'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        Próxima cita:
                      </span>
                      <span className="font-semibold text-sky-700">
                        {patient.proximaCita || 'Por programar'}
                      </span>
                    </div>

                    {patient.celular && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          Celular:
                        </span>
                        <span className="text-slate-700">{patient.celular}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <button
                  onClick={() => onSelectPatient(patient)}
                  className="w-full mt-3 py-2.5 px-3 bg-sky-50 hover:bg-sky-100/80 text-sky-800 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 group-hover:bg-sky-600 group-hover:text-white cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Abrir Expediente y Seguimiento</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Patient */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-sky-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Registrar Nueva Paciente</h3>
                <p className="text-xs text-slate-500">Ingreso al sistema interno Hampiq Biomedicina</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700"
                >
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombres <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Ej. María Teresa"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Apellidos <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Ej. Quispe Morales"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    DNI <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="8 dígitos"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Celular
                  </label>
                  <input
                    type="tel"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    placeholder="+51 987 654 321"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Fecha de Nacimiento <span className="text-rose-500">*</span>
                  </label>
                  {calculatedAge !== null && (
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                      Edad calculada: {calculatedAge} años
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  required
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle / Jr. / Av. y Ciudad"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ocupación
                </label>
                <input
                  type="text"
                  value={ocupacion}
                  onChange={(e) => setOcupacion(e.target.value)}
                  placeholder="Ej. Docente, Contadora, Comerciante"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-sm outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-sky-600/20 transition cursor-pointer"
                >
                  Crear e Iniciar Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Patient */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-100">
            <h3 className="text-base font-bold text-slate-800 mb-2">¿Eliminar paciente?</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Está a punto de eliminar el expediente completo de{' '}
              <strong className="text-slate-900">
                {patientToDelete.nombres} {patientToDelete.apellidos}
              </strong>{' '}
              (DNI: {patientToDelete.dni}). Esta acción borrará su historia clínica, hoja de control, notas de voz e indicaciones.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPatientToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeletePatient(patientToDelete.id);
                  setPatientToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
              >
                Sí, eliminar expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
