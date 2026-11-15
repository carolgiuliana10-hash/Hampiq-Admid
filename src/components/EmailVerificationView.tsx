/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MailCheck, RefreshCw, LogOut, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendEmailVerification, signOut, User } from 'firebase/auth';
import { auth } from '../firebase';

interface EmailVerificationViewProps {
  firebaseUser: User;
  onVerified: () => Promise<void>;
}

export const EmailVerificationView: React.FC<EmailVerificationViewProps> = ({
  firebaseUser,
  onVerified,
}) => {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCheckVerified = async () => {
    setError('');
    setMessage('');
    setChecking(true);
    try {
      await firebaseUser.reload();
      await firebaseUser.getIdToken(true);
      if (auth.currentUser?.emailVerified) {
        await onVerified();
      } else {
        setError(
          'Tu correo aún figura como no verificado. Revisa tu bandeja de entrada o carpeta de Spam y haz clic en el enlace de verificación.'
        );
      }
    } catch {
      setError('No se pudo verificar el estado en este momento. Intenta de nuevo.');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    setResending(true);
    try {
      await sendEmailVerification(firebaseUser);
      setMessage(`Se reenvió el correo de verificación a ${firebaseUser.email}.`);
    } catch {
      setError('Espera unos momentos antes de volver a solicitar el correo.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-sky-50 via-slate-50 to-sky-100/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-sky-900/5 border border-sky-100 p-7 text-center">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-100">
          <MailCheck className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Verifica tu Correo Electrónico</h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Para proteger las historias clínicas en la nube, enviamos un enlace de confirmación a:
        </p>
        <p className="mt-2 inline-block px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100 text-xs font-semibold text-sky-800">
          {firebaseUser.email}
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={handleCheckVerified}
            disabled={checking}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Comprobando...' : 'Ya verifiqué mi correo — Continuar'}</span>
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{resending ? 'Enviando...' : 'Reenviar enlace de verificación'}</span>
          </button>

          <button
            type="button"
            onClick={() => signOut(auth)}
            className="w-full py-2.5 px-4 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-medium text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Usar otro correo / Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
