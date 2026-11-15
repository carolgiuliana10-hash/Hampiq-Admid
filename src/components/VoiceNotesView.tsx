/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Trash2,
  Edit2,
  Check,
  Copy,
  Clock,
  FileText,
  RotateCcw
} from 'lucide-react';
import { Patient, NotaVoz, HistoriaClinicaData, EvolucionIAAnalisis } from '../types/clinical';
import { MenopauseEvolutionSection } from './MenopauseEvolutionSection';

interface VoiceNotesViewProps {
  patient: Patient;
  onUpdateNotes: (notes: NotaVoz[]) => void;
  onUpdateHC: (updatedHC: HistoriaClinicaData) => void;
}

export const VoiceNotesView: React.FC<VoiceNotesViewProps> = ({
  patient,
  onUpdateNotes,
  onUpdateHC,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [draftNote, setDraftNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSaveDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSave = draftNote.trim();
    if (!textToSave) return;

    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const newNote: NotaVoz = {
      id: 'nc_' + Math.random().toString(36).substring(2, 9),
      fecha: formattedDate,
      texto: textToSave,
    };

    onUpdateNotes([newNote, ...(patient.notasVoz || [])]);
    setDraftNote('');
  };

  const insertSnippet = (snippet: string) => {
    setDraftNote((prev) => {
      const cleanPrev = prev.trim();
      const prefix = cleanPrev ? (cleanPrev.endsWith('\n') ? '' : '\n') : '';
      return `${cleanPrev}${prefix}${snippet}`;
    });
  };

  const insertPunctuation = (symbol: string) => {
    setDraftNote((prev) => {
      if (symbol === '\n\n') {
        return prev + '\n\n';
      }
      const trimmed = prev.trimEnd();
      return trimmed + symbol + ' ';
    });
  };

  const handleDeleteNote = (id: string) => {
    onUpdateNotes((patient.notasVoz || []).filter((n) => n.id !== id));
    setConfirmDeleteId(null);
  };

  const handleStartEdit = (note: NotaVoz) => {
    setEditingNoteId(note.id);
    setEditingText(note.texto);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    onUpdateNotes(
      (patient.notasVoz || []).map((n) => (n.id === id ? { ...n, texto: editingText.trim() } : n))
    );
    setEditingNoteId(null);
    setEditingText('');
  };

  const handleCopyNote = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter notes
  const notesList = patient.notasVoz || [];
  const filteredNotes = notesList.filter((n) =>
    n.texto.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Anotaciones y Notas Clínicas de Seguimiento
            </h2>
            <span className="text-xs bg-sky-50 text-sky-800 font-bold px-2 py-0.5 rounded-md border border-sky-200">
              Uso Interno
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro rápido de observaciones médicas, evolución y acuerdos clínicos para{' '}
            <strong className="text-sky-950 font-bold">
              {patient.nombres} {patient.apellidos}
            </strong>
            .
          </p>
        </div>
      </div>

      {/* Main Note Drafting Card */}
      <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Redactar Nueva Observación / Nota</span>
          </span>

          {draftNote.trim() && (
            <button
              type="button"
              onClick={() => setDraftNote('')}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Text Area */}
        <textarea
          rows={4}
          value={draftNote}
          onChange={(e) => setDraftNote(e.target.value)}
          placeholder="Escriba aquí sus observaciones clínicas, evolución de síntomas, acuerdos terapéuticos o pendientes para la siguiente cita..."
          className="w-full p-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 rounded-xl text-xs text-slate-800 outline-hidden transition resize-none leading-relaxed"
        />

        {/* Quick Clinical Snippets & Punctuation */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-medium">Plantillas rápidas:</span>
            <button
              type="button"
              onClick={() => insertSnippet('Motivo de consulta: ')}
              className="px-2 py-0.5 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-md transition cursor-pointer"
            >
              + Motivo
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('Evolución clínica: ')}
              className="px-2 py-0.5 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-md transition cursor-pointer"
            >
              + Evolución
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('Plan terapéutico: ')}
              className="px-2 py-0.5 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-md transition cursor-pointer"
            >
              + Plan
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('Próximo control en: ')}
              className="px-2 py-0.5 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-md transition cursor-pointer"
            >
              + Próximo control
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveDraft()}
              disabled={!draftNote.trim()}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar en Expediente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notes Chronological List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Historial de Notas Clínicas ({notesList.length})</span>
          </h3>

          {/* Search within notes */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en las notas..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 focus:border-sky-400 rounded-xl text-xs outline-hidden shadow-2xs"
            />
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-sky-100 p-8 text-center shadow-xs">
            <p className="text-xs text-slate-500">
              {searchTerm
                ? 'No se encontraron notas con el término de búsqueda ingresado.'
                : 'Aún no hay notas clínicas registradas para esta paciente. Utilice el formulario de arriba para redactar una.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => {
              const isEditing = editingNoteId === note.id;
              return (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl border border-sky-100 p-4 shadow-xs hover:border-sky-300 transition"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-sky-800 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      <span>{note.fecha}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyNote(note.id, note.texto)}
                        title="Copiar texto de la nota"
                        className="p-1.5 text-slate-400 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                      >
                        {copiedId === note.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleStartEdit(note)}
                        title="Editar nota"
                        className="p-1.5 text-slate-400 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {confirmDeleteId === note.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                          >
                            Eliminar
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[11px] text-slate-600 hover:underline cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(note.id)}
                          title="Eliminar nota"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-sky-300 rounded-xl text-xs text-slate-800 outline-hidden"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveEdit(note.id)}
                          className="px-3 py-1 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-500 cursor-pointer"
                        >
                          Guardar Cambios
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {note.texto}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gráficas de Frecuencia y Evolución Clínica (IA Especialista en Menopausia) */}
      <div className="pt-2">
        <MenopauseEvolutionSection
          patient={patient}
          onSaveAnalysis={(analysis: EvolucionIAAnalisis) => {
            onUpdateHC({
              ...patient.hc,
              analisisEvolucionIA: analysis,
            });
          }}
        />
      </div>
    </div>
  );
};
