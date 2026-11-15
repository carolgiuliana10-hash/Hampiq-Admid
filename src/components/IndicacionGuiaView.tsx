/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Download,
  HeartPulse,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { Patient, IndicacionGuiaData } from '../types/clinical';

interface IndicacionGuiaViewProps {
  patient: Patient;
  onUpdateIndicacionGuia: (data: IndicacionGuiaData) => void;
}

export const IndicacionGuiaView: React.FC<IndicacionGuiaViewProps> = ({
  patient,
  onUpdateIndicacionGuia,
}) => {
  const { indicacionGuia } = patient;

  const updateField = <K extends keyof IndicacionGuiaData>(key: K, value: IndicacionGuiaData[K]) => {
    onUpdateIndicacionGuia({
      ...indicacionGuia,
      [key]: value,
    });
  };

  const handleDownloadPDF = () => {
    const originalTitle = document.title;
    document.title = `Hampiq_Indicacion_Medica_${patient.nombres}_${patient.apellidos}`.replace(/\s+/g, '_');
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // --- Hormonas Handlers ---
  const handleAddHormona = () => {
    const nextHormona = {
      id: 'h_' + Math.random().toString(36).substring(2, 7),
      nombre: 'Nueva Hormona',
      dosis: 'Dosis e indicación',
    };
    updateField('hormonasLineas', [...(indicacionGuia.hormonasLineas || []), nextHormona]);
  };

  const handleDeleteHormona = (id: string) => {
    updateField(
      'hormonasLineas',
      (indicacionGuia.hormonasLineas || []).filter((h) => h.id !== id)
    );
  };

  const handleUpdateHormona = (id: string, field: 'nombre' | 'dosis', val: string) => {
    updateField(
      'hormonasLineas',
      (indicacionGuia.hormonasLineas || []).map((h) => (h.id === id ? { ...h, [field]: val } : h))
    );
  };

  // --- Sueroterapia Handlers ---
  const handleAddSueroterapia = () => {
    const nextLine = {
      id: 'st_' + Math.random().toString(36).substring(2, 7),
      periodo: 'Nueva dosis',
      indicacion: 'DETOX o NAD+ 10ml Ev',
    };
    updateField('sueroterapiaLineas', [...indicacionGuia.sueroterapiaLineas, nextLine]);
  };

  const handleDeleteSueroterapia = (id: string) => {
    updateField(
      'sueroterapiaLineas',
      indicacionGuia.sueroterapiaLineas.filter((l) => l.id !== id)
    );
  };

  // --- Higiene del Sueño Handlers ---
  const handleAddSuenoPauta = () => {
    updateField('higieneSuenoPautas', [...(indicacionGuia.higieneSuenoPautas || []), 'Nueva pauta de sueño']);
  };

  const handleUpdateSuenoPauta = (index: number, val: string) => {
    const updated = [...(indicacionGuia.higieneSuenoPautas || [])];
    updated[index] = val;
    updateField('higieneSuenoPautas', updated);
  };

  const handleDeleteSuenoPauta = (index: number) => {
    const updated = [...(indicacionGuia.higieneSuenoPautas || [])];
    updated.splice(index, 1);
    updateField('higieneSuenoPautas', updated);
  };

  // --- Batido Handlers ---
  const handleAddSmoothieOption = () => {
    const nextNum = indicacionGuia.batidoOpciones.length + 1;
    const newOption = {
      id: 'opt_' + Math.random().toString(36).substring(2, 7),
      titulo: `OPCIÓN ${nextNum} — BATIDO PERSONALIZADO`,
      receta: 'Leche 250ml(1vaso) o bebida vegetal + fuente de proteína andina/aislada + fruta baja en azúcar + semillas.',
    };
    updateField('batidoOpciones', [...indicacionGuia.batidoOpciones, newOption]);
  };

  const handleDeleteSmoothieOption = (id: string) => {
    if (indicacionGuia.batidoOpciones.length <= 1) {
      alert('Debe mantenerse al menos una opción de batido.');
      return;
    }
    updateField(
      'batidoOpciones',
      indicacionGuia.batidoOpciones.filter((o) => o.id !== id)
    );
  };

  const handleUpdateSmoothieOption = (id: string, recipeText: string) => {
    updateField(
      'batidoOpciones',
      indicacionGuia.batidoOpciones.map((o) => (o.id === id ? { ...o, receta: recipeText } : o))
    );
  };

  // --- Plan Semanal Handlers ---
  const handleMealChange = (index: number, meal: 'desayuno' | 'almuerzo' | 'cena', val: string) => {
    const nextPlan = [...indicacionGuia.planSemanal];
    nextPlan[index] = {
      ...nextPlan[index],
      [meal]: val,
    };
    updateField('planSemanal', nextPlan);
  };

  // --- Reglas Importantes Handlers ---
  const handleAddRegla = () => {
    updateField('reglasImportantes', [...(indicacionGuia.reglasImportantes || []), 'Nueva regla nutricional']);
  };

  const handleUpdateRegla = (index: number, val: string) => {
    const updated = [...(indicacionGuia.reglasImportantes || [])];
    updated[index] = val;
    updateField('reglasImportantes', updated);
  };

  const handleDeleteRegla = (index: number) => {
    const updated = [...(indicacionGuia.reglasImportantes || [])];
    updated.splice(index, 1);
    updateField('reglasImportantes', updated);
  };

  // --- Fuentes de Proteína Handlers ---
  const handleAddFuenteProteina = () => {
    const nextItem = {
      id: 'fp_' + Math.random().toString(36).substring(2, 7),
      alimento: 'Nuevo alimento',
      proteina: '15 g',
    };
    updateField('fuentesProteina', [...(indicacionGuia.fuentesProteina || []), nextItem]);
  };

  const handleUpdateFuenteProteina = (id: string, field: 'alimento' | 'proteina', val: string) => {
    updateField(
      'fuentesProteina',
      (indicacionGuia.fuentesProteina || []).map((fp) => (fp.id === id ? { ...fp, [field]: val } : fp))
    );
  };

  const handleDeleteFuenteProteina = (id: string) => {
    updateField(
      'fuentesProteina',
      (indicacionGuia.fuentesProteina || []).filter((fp) => fp.id !== id)
    );
  };

  const todayFormatted = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Top Banner with Download Button (Hidden in Print) */}
      <div className="no-print bg-white rounded-2xl border border-sky-100 p-4 sm:p-5 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Indicación Médica y Guía Nutricional
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
              Documento Entregable a la Paciente
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Permite editar hormonas (con agregar filas), sueroterapia, sueño, reglas de la región y fuentes de proteína.
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/20 transition cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Descargar PDF</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PRINTABLE OFFICIAL MEDICAL DOCUMENT                                      */}
      {/* ========================================================================= */}
      <div className="print-container space-y-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-12 text-slate-800">
        
        {/* ========================================================================= */}
        {/* DOCUMENT 1 OF DELIVERY: INDICACIÓN MÉDICA                                */}
        {/* ========================================================================= */}
        <section className="border-b-2 border-slate-200 pb-12">
          {/* Header Hampiq */}
          <div className="flex items-center justify-between border-b border-sky-200 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo-hampiq.jpg"
                alt="Hampiq Biomedicina"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/IMG-20261030-WA0075_90400adc.jpg';
                }}
                className="h-16 sm:h-20 w-auto object-contain rounded-md"
              />
            </div>

            <div className="text-right text-xs text-slate-500">
              <div>Fecha: <strong className="text-slate-800">{todayFormatted}</strong></div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-wide uppercase">
              INDICACION MÉDICA
            </h1>
          </div>

          <div className="mb-6 text-sm text-slate-700 border-b border-slate-100 pb-3">
            <span>Nombre y Apellido: </span>
            <strong className="text-slate-900 border-b border-slate-300 px-2 pb-0.5">
              {patient.nombres} {patient.apellidos}
            </strong>
          </div>

          {/* Numbered Sections matching Image 7 */}
          <div className="space-y-4 text-xs text-slate-800">
            {/* 1) HORMONAS (Con agregar fila editable) */}
            <div className="bg-sky-50/40 p-4 rounded-xl border border-sky-100">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-sm text-slate-900">
                  1) <em>HORMONAS:</em>
                </div>
                <button
                  type="button"
                  onClick={handleAddHormona}
                  className="no-print inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-white hover:bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Fila</span>
                </button>
              </div>

              <div className="pl-2 space-y-2">
                {(indicacionGuia.hormonasLineas || []).map((linea) => (
                  <div key={linea.id} className="flex items-center gap-2 bg-white/70 p-1.5 rounded-lg border border-sky-100/70">
                    <span className="font-bold text-slate-700">•</span>
                    <input
                      type="text"
                      value={linea.nombre}
                      onChange={(e) => handleUpdateHormona(linea.id, 'nombre', e.target.value)}
                      placeholder="Ej. PROGESTERONA / ESTRADIOL"
                      className="w-48 sm:w-64 font-bold text-slate-900 bg-white px-2.5 py-1 rounded text-xs border border-slate-200 outline-hidden focus:border-sky-400"
                    />
                    <span className="font-bold text-slate-500">:</span>
                    <input
                      type="text"
                      value={linea.dosis}
                      onChange={(e) => handleUpdateHormona(linea.id, 'dosis', e.target.value)}
                      placeholder="100 mg antes de dormir / Gel 0.06%..."
                      className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 outline-hidden focus:border-sky-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteHormona(linea.id)}
                      className="no-print text-slate-300 hover:text-rose-600 p-1 transition cursor-pointer"
                      title="Eliminar fila de hormona"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2) SUEROTERAPIA */}
            <div className="bg-sky-50/40 p-4 rounded-xl border border-sky-100">
              <div className="flex items-center justify-between mb-1.5">
                <div className="font-bold text-sm text-slate-900">
                  2) SUEROTERAPIA:
                </div>
                <button
                  type="button"
                  onClick={handleAddSueroterapia}
                  className="no-print inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-white hover:bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar línea</span>
                </button>
              </div>

              <div className="pl-2 space-y-1.5">
                {indicacionGuia.sueroterapiaLineas.map((linea) => (
                  <div key={linea.id} className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">•</span>
                    <input
                      type="text"
                      value={linea.periodo}
                      onChange={(e) => {
                        const updated = indicacionGuia.sueroterapiaLineas.map((l) =>
                          l.id === linea.id ? { ...l, periodo: e.target.value } : l
                        );
                        updateField('sueroterapiaLineas', updated);
                      }}
                      className="w-28 font-bold text-sky-950 bg-white px-2 py-1 rounded text-xs border border-slate-200 outline-hidden focus:border-sky-400"
                    />
                    <span className="font-bold text-slate-500">:</span>
                    <input
                      type="text"
                      value={linea.indicacion}
                      onChange={(e) => {
                        const updated = indicacionGuia.sueroterapiaLineas.map((l) =>
                          l.id === linea.id ? { ...l, indicacion: e.target.value } : l
                        );
                        updateField('sueroterapiaLineas', updated);
                      }}
                      className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 outline-hidden focus:border-sky-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSueroterapia(linea.id)}
                      className="no-print text-slate-300 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3) ELECTROESTIMULACION MUSCULAR(EMS) */}
            <div className="bg-sky-50/40 p-4 rounded-xl border border-sky-100 flex flex-col sm:flex-row sm:items-baseline gap-2">
              <span className="font-bold text-sm text-slate-900 whitespace-nowrap">
                3) ELECTROESTIMULACION MUSCULAR(EMS):
              </span>
              <input
                type="text"
                value={indicacionGuia.emsSesiones}
                onChange={(e) => updateField('emsSesiones', e.target.value)}
                placeholder="12 sesiones"
                className="flex-1 px-3 py-1 bg-white border border-slate-200 focus:border-sky-400 rounded-lg text-xs font-semibold text-slate-900 outline-hidden"
              />
            </div>

            {/* 4) Probiotico */}
            <div className="bg-sky-50/40 p-4 rounded-xl border border-sky-100 flex flex-col sm:flex-row sm:items-baseline gap-2">
              <span className="font-bold text-sm text-slate-900 whitespace-nowrap">
                4) Probiotico:
              </span>
              <input
                type="text"
                value={indicacionGuia.probiotico}
                onChange={(e) => updateField('probiotico', e.target.value)}
                className="flex-1 px-3 py-1 bg-white border border-slate-200 focus:border-sky-400 rounded-lg text-xs text-slate-800 outline-hidden"
              />
            </div>

            {/* 5) Consumo de proteínas diaria según guía Nutricional (EDITABLE) */}
            <div className="p-4 bg-sky-50/40 rounded-xl border border-sky-100 flex flex-col sm:flex-row sm:items-baseline gap-2">
              <span className="font-bold text-sm text-slate-900 whitespace-nowrap">
                5) Consumo de proteínas diaria:
              </span>
              <input
                type="text"
                value={indicacionGuia.consumoProteinasDiaria || 'Consumo de proteínas diaria según guía Nutricional'}
                onChange={(e) => updateField('consumoProteinasDiaria', e.target.value)}
                placeholder="Consumo de proteínas diaria según guía Nutricional"
                className="flex-1 px-3 py-1 bg-white border border-slate-200 focus:border-sky-400 rounded-lg text-xs font-semibold text-slate-900 outline-hidden"
              />
            </div>

            {/* 6) HIGIENE DEL SUEÑO (EDITABLE con agregar/eliminar pautas) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-sm text-slate-900">
                  6) HIGIENE DEL SUEÑO:
                </div>
                <button
                  type="button"
                  onClick={handleAddSuenoPauta}
                  className="no-print inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-white hover:bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar pauta</span>
                </button>
              </div>

              <div className="space-y-1.5 pl-2">
                {(indicacionGuia.higieneSuenoPautas || []).map((pauta, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">•</span>
                    <input
                      type="text"
                      value={pauta}
                      onChange={(e) => handleUpdateSuenoPauta(idx, e.target.value)}
                      className="flex-1 px-2.5 py-1 bg-white border border-slate-200 focus:border-sky-400 rounded text-xs text-slate-800 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSuenoPauta(idx)}
                      className="no-print text-slate-300 hover:text-rose-600 p-1 cursor-pointer"
                      title="Eliminar pauta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 7) Cenar máximo : 7pm (EDITABLE) */}
            <div className="p-4 bg-sky-100/60 border border-sky-300 rounded-xl flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 font-bold text-sm text-sky-950">
                <Clock className="w-4 h-4 text-sky-700" />
                <span>7) Cenar máximo :</span>
              </div>
              <input
                type="text"
                value={indicacionGuia.cenarMaximoHora || '7:00 pm'}
                onChange={(e) => updateField('cenarMaximoHora', e.target.value)}
                placeholder="7:00 pm"
                className="w-40 px-3 py-1 bg-white border border-sky-300 rounded-lg text-xs font-bold text-sky-950 outline-hidden focus:border-sky-500"
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* DOCUMENT 2 OF DELIVERY: GUÍA NUTRICIONAL                                 */}
        {/* ========================================================================= */}
        <section className="page-break pt-4">
          {/* Header Hampiq */}
          <div className="flex items-center justify-between border-b border-sky-200 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo-hampiq.jpg"
                alt="Hampiq Biomedicina"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/IMG-20261030-WA0075_90400adc.jpg';
                }}
                className="h-16 sm:h-20 w-auto object-contain rounded-md"
              />
            </div>

            <div className="text-right text-xs text-slate-500">
              <div>Fecha: <strong className="text-slate-800">{todayFormatted}</strong></div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-wide uppercase">
              GUÍA NUTRICIONAL
            </h2>
          </div>

          <div className="mb-6 text-sm text-slate-700 border-b border-slate-100 pb-3">
            <span>Nombre y Apellido: </span>
            <strong className="text-slate-900 border-b border-slate-300 px-2 pb-0.5">
              {patient.nombres} {patient.apellidos}
            </strong>
          </div>

          {/* 1. BATIDO PROTEICO */}
          <div className="bg-sky-50/40 p-5 rounded-2xl border border-sky-100 mb-6 text-xs text-slate-800 space-y-2.5">
            <div className="font-bold text-sm text-slate-900">
              1. BATIDO PROTEICO:
            </div>

            <div className="pl-4 flex flex-col sm:flex-row sm:items-baseline gap-2">
              <span className="font-bold text-slate-800">• Objetivo:</span>
              <input
                type="text"
                value={indicacionGuia.batidoProteicoObjetivo}
                onChange={(e) => updateField('batidoProteicoObjetivo', e.target.value)}
                placeholder="Disminuir hambre , mejorar metabolismo ,reducir grasa visceral , proteger músculo , mejorar energía."
                className="flex-1 px-3 py-1 bg-white border border-slate-200 focus:border-sky-400 rounded-lg text-xs font-semibold text-slate-900 outline-hidden"
              />
            </div>

            <div className="pl-4 font-bold text-sky-900">
              • Tomar todos los días con el Desayuno
            </div>

            {/* Smoothie options */}
            <div className="pl-4 space-y-2 pt-1">
              {indicacionGuia.batidoOpciones.map((opcion, idx) => (
                <div key={opcion.id} className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">
                      • {opcion.titulo}:
                    </span>
                    {idx > 0 && (
                      <button
                        onClick={() => handleDeleteSmoothieOption(opcion.id)}
                        className="no-print text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={opcion.receta}
                    onChange={(e) => handleUpdateSmoothieOption(opcion.id, e.target.value)}
                    className="w-full p-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden resize-none"
                  />
                </div>
              ))}

              <div className="no-print pt-1">
                <button
                  type="button"
                  onClick={handleAddSmoothieOption}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-white hover:bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar opción de batido</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. PLAN SEMANAL PERIMENOPAUSIA 5 EJES */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide mb-3">
              2. PLAN SEMANAL PERIMENOPAUSIA 5 EJES
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-sky-50 text-sky-950 border-b border-sky-200">
                    <th className="py-2.5 px-3 font-bold w-24">Día</th>
                    <th className="py-2.5 px-3 font-bold">Desayuno</th>
                    <th className="py-2.5 px-3 font-bold">Almuerzo</th>
                    <th className="py-2.5 px-3 font-bold">Cena</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {indicacionGuia.planSemanal.map((item, idx) => (
                    <tr key={item.dia} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-bold text-slate-800 bg-slate-50/80 align-top">
                        {item.dia}
                      </td>
                      <td className="py-1.5 px-2">
                        <textarea
                          rows={2}
                          value={item.desayuno}
                          onChange={(e) => handleMealChange(idx, 'desayuno', e.target.value)}
                          className="w-full p-1.5 bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent focus:border-sky-300 rounded text-xs text-slate-800 outline-hidden resize-none"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <textarea
                          rows={2}
                          value={item.almuerzo}
                          onChange={(e) => handleMealChange(idx, 'almuerzo', e.target.value)}
                          className="w-full p-1.5 bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent focus:border-sky-300 rounded text-xs text-slate-800 outline-hidden resize-none"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <textarea
                          rows={2}
                          value={item.cena}
                          onChange={(e) => handleMealChange(idx, 'cena', e.target.value)}
                          className="w-full p-1.5 bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent focus:border-sky-300 rounded text-xs text-slate-800 outline-hidden resize-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. REGLAS IMPORTANTES & 4. FUENTES DE PROTEÍNA DE LA REGIÓN (EDITABLES) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* 3. REGLAS IMPORTANTES: REGIÓN (EDITABLE con agregar/eliminar) */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  3. REGLAS IMPORTANTES: REGIÓN
                </h4>
                <button
                  type="button"
                  onClick={handleAddRegla}
                  className="no-print inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800 bg-white hover:bg-sky-50 px-2 py-0.5 rounded border border-sky-200 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Agregar</span>
                </button>
              </div>

              <div className="space-y-1.5 pl-1">
                {(indicacionGuia.reglasImportantes || []).map((regla, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">•</span>
                    <input
                      type="text"
                      value={regla}
                      onChange={(e) => handleUpdateRegla(idx, e.target.value)}
                      className="flex-1 px-2 py-1 bg-white border border-slate-200 focus:border-sky-400 rounded text-xs text-slate-800 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteRegla(idx)}
                      className="no-print text-slate-300 hover:text-rose-600 p-1 cursor-pointer"
                      title="Eliminar regla"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. FUENTES DE PROTEÍNA DE LA REGIÓN (EDITABLE con agregar/eliminar) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  4. FUENTES DE PROTEÍNA DE LA REGIÓN
                </h4>
                <button
                  type="button"
                  onClick={handleAddFuenteProteina}
                  className="no-print inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded border border-sky-200 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Agregar alimento</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 border-b border-slate-200">
                      <th className="py-2 px-3 font-bold">Alimento</th>
                      <th className="py-2 px-3 font-bold">Proteína aprox.</th>
                      <th className="py-2 px-2 text-center w-8 no-print"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(indicacionGuia.fuentesProteina || []).map((fp) => (
                      <tr key={fp.id} className="hover:bg-slate-50/60">
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={fp.alimento}
                            onChange={(e) => handleUpdateFuenteProteina(fp.id, 'alimento', e.target.value)}
                            className="w-full px-2 py-0.5 bg-transparent focus:bg-white border border-transparent focus:border-sky-300 rounded text-xs text-slate-800 outline-hidden"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={fp.proteina}
                            onChange={(e) => handleUpdateFuenteProteina(fp.id, 'proteina', e.target.value)}
                            className="w-24 px-2 py-0.5 bg-transparent focus:bg-white border border-transparent focus:border-sky-300 rounded text-xs font-bold text-sky-900 outline-hidden"
                          />
                        </td>
                        <td className="py-1 px-1 text-center no-print">
                          <button
                            type="button"
                            onClick={() => handleDeleteFuenteProteina(fp.id)}
                            className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Doctor Signature, Stamp, CMP, RNE */}
          <div className="mt-12 pt-8 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-xs text-slate-500 max-w-xs text-center sm:text-left">
              <p>Hampiq Biomedicina – Centro Especializado</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Huancayo, Perú · Tel: +51 964 123 456
              </p>
            </div>

            <div className="text-center w-64 border-t-2 border-slate-800 pt-2 space-y-1">
              <input
                type="text"
                value={indicacionGuia.doctora.nombre}
                onChange={(e) =>
                  updateField('doctora', { ...indicacionGuia.doctora, nombre: e.target.value })
                }
                className="w-full text-center font-bold text-xs text-slate-900 bg-transparent outline-hidden"
              />
              <input
                type="text"
                value={indicacionGuia.doctora.especialidad}
                onChange={(e) =>
                  updateField('doctora', { ...indicacionGuia.doctora, especialidad: e.target.value })
                }
                className="w-full text-center text-[10px] text-slate-600 bg-transparent outline-hidden"
              />
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={indicacionGuia.doctora.cmp}
                  onChange={(e) =>
                    updateField('doctora', { ...indicacionGuia.doctora, cmp: e.target.value })
                  }
                  className="w-24 text-center font-semibold text-[10px] text-slate-700 bg-transparent outline-hidden"
                />
                <span className="text-slate-300">|</span>
                <input
                  type="text"
                  value={indicacionGuia.doctora.rne}
                  onChange={(e) =>
                    updateField('doctora', { ...indicacionGuia.doctora, rne: e.target.value })
                  }
                  className="w-24 text-center font-semibold text-[10px] text-slate-700 bg-transparent outline-hidden"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
