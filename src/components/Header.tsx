/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  LogOut,
  Cloud,
  CloudCog,
  UserCog,
} from 'lucide-react';
import { UserSession, Patient } from '../types/clinical';
import { exportBackupJSON } from '../utils/storage';

interface HeaderProps {
  user: UserSession | null;
  onLogout: () => void;
  onOpenProfile: () => void;
  patients: Patient[];
  onImportBackup: (imported: Patient[]) => Promise<void> | void;
  lastSaved: string | null;
  isSyncing?: boolean;
  selectedPatient: Patient | null;
  onBackToList: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenProfile,
  patients,
  onImportBackup,
  lastSaved,
  isSyncing = false,
  selectedPatient,
  onBackToList,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importNotice, setImportNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          await onImportBackup(parsed);
          setImportNotice({
            type: 'ok',
            text: `Respaldo importado y subido a la nube (${parsed.length} pacientes).`,
          });
          setTimeout(() => setImportNotice(null), 5000);
        } else {
          setImportNotice({
            type: 'err',
            text: 'El archivo no contiene un formato válido de pacientes.',
          });
        }
      } catch {
        setImportNotice({ type: 'err', text: 'Error al leer el archivo JSON.' });
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={onBackToList}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onBackToList();
          }}
        >
          <img
            src="/logo-hampiq.jpg"
            alt="Hampiq Biomedicina"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                '/assets/aistudio/IMG-20261030-WA0075_90400adc.jpg';
            }}
            className="h-11 sm:h-12 w-auto object-contain rounded-lg shadow-2xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-slate-800 tracking-tight whitespace-nowrap">
                Hampiq Biomedicina
              </span>
              <span className="text-[10px] sm:text-xs bg-sky-50 text-sky-700 border border-sky-200/60 font-medium px-1.5 py-0.5 rounded-md">
                Uso Médico
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 font-normal">
              Seguimiento Integral de Pacientes en Climatérico
            </p>
          </div>
        </div>

        {/* Center / Patient Breadcrumb */}
        {selectedPatient && (
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-sky-50/70 py-1.5 px-3.5 rounded-lg border border-sky-100">
            <button
              type="button"
              onClick={onBackToList}
              className="text-sky-700 hover:text-sky-800 hover:underline font-medium text-xs transition cursor-pointer"
            >
              Lista de Pacientes
            </button>
            <span className="text-sky-300">/</span>
            <span className="font-semibold text-slate-800 text-xs truncate max-w-xs">
              {selectedPatient.nombres} {selectedPatient.apellidos}
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Sync indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border ${
              isSyncing
                ? 'bg-sky-50 border-sky-200 text-sky-800'
                : 'bg-emerald-50/80 border-emerald-200/50 text-emerald-800'
            }`}
          >
            {isSyncing ? (
              <>
                <CloudCog className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                <span className="font-medium">Sincronizando...</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">En la nube</span>
                {lastSaved && (
                  <span className="text-emerald-600/80 text-[10px]">({lastSaved})</span>
                )}
              </>
            )}
          </div>

          {/* Backup buttons */}
          <button
            type="button"
            onClick={() => exportBackupJSON(patients)}
            title="Exportar copia de seguridad en archivo JSON"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 hover:border-sky-200 px-3 py-2 rounded-lg transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Respaldo</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Restaurar copia de respaldo y subir a la nube"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-100 px-2.5 py-2 rounded-lg transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar</span>
          </button>

          {/* User Profile & Logout */}
          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={onOpenProfile}
                title="Editar nombre de la doctora, correo y contraseña"
                aria-label="Editar perfil de la doctora y cuenta"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-sky-50 border border-transparent hover:border-sky-200/70 transition cursor-pointer text-right"
              >
                <div className="hidden lg:block">
                  <div className="text-xs font-semibold text-slate-800">{user.nombre}</div>
                  <div className="text-[11px] text-slate-500">{user.rol} · Editar perfil</div>
                </div>
                <UserCog className="w-4 h-4 text-sky-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={onLogout}
                title="Cerrar sesión segura"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {importNotice && (
        <div
          role="status"
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-xs font-medium flex items-center justify-between ${
            importNotice.type === 'ok'
              ? 'bg-emerald-50 text-emerald-800 border-t border-emerald-100'
              : 'bg-rose-50 text-rose-700 border-t border-rose-100'
          }`}
        >
          <span>{importNotice.text}</span>
          <button
            type="button"
            onClick={() => setImportNotice(null)}
            className="text-xs underline ml-4 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}
    </header>
  );
};
