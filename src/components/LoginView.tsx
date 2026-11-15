/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cloud,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
  LogIn,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { mapFirebaseAuthError } from '../utils/patient-sync-pure';

interface LoginViewProps {
  onPendingProfileSaved?: (profile: {
    nombre: string;
    rol: 'Doctora' | 'Equipo Asistencial';
    especialidad: string;
    cmp: string;
    rne: string;
  }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onPendingProfileSaved }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration fields
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<'Doctora' | 'Equipo Asistencial'>('Doctora');
  const [especialidad, setEspecialidad] = useState('Medicina Funcional y Antienvejecimiento');
  const [cmp, setCmp] = useState('');
  const [rne, setRne] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (err: any) {
      setError(mapFirebaseAuthError(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanNombre = nombre.trim();
    const cleanEmail = email.trim();
    if (!cleanNombre) {
      setError('Por favor ingresa el nombre completo de la doctora o usuario.');
      return;
    }
    if (!cleanEmail || !password) {
      setError('Por favor ingresa un correo electrónico y una contraseña.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const pendingProfile = {
        nombre: cleanNombre,
        rol,
        especialidad: especialidad.trim() || 'Medicina Funcional y Antienvejecimiento',
        cmp: cmp.trim(),
        rne: rne.trim(),
      };
      sessionStorage.setItem('hampiq_pending_profile', JSON.stringify(pendingProfile));
      onPendingProfileSaved?.(pendingProfile);

      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(cred.user, { displayName: cleanNombre });
      await sendEmailVerification(cred.user);
    } catch (err: any) {
      sessionStorage.removeItem('hampiq_pending_profile');
      setError(mapFirebaseAuthError(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(mapFirebaseAuthError(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    setInfoMessage('');
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Escribe tu correo electrónico arriba para enviarte el enlace de recuperación.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setInfoMessage(`Se envió un enlace para restablecer tu contraseña a ${cleanEmail}.`);
    } catch (err: any) {
      setError(mapFirebaseAuthError(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-sky-50 via-slate-50 to-sky-100/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-sky-900/5 border border-sky-100 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <img
              src="/logo-hampiq.jpg"
              alt="Hampiq Biomedicina"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  '/assets/aistudio/IMG-20261030-WA0075_90400adc.jpg';
              }}
              className="h-20 w-auto object-contain rounded-xl shadow-xs"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Hampiq Biomedicina</h1>
          <p className="text-sm text-slate-500 mt-1">
            Historias Clínicas Sincronizadas en la Nube
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 text-xs text-sky-800 bg-sky-50 border border-sky-200/60 px-3 py-1 rounded-full">
            <Cloud className="w-3.5 h-3.5 text-sky-600" />
            <span>Acceso multi-dispositivo seguro</span>
          </div>
        </div>

        {/* Mode Tabs */}
        <div
          role="tablist"
          aria-label="Modo de acceso"
          className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => {
              setMode('login');
              setError('');
              setInfoMessage('');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => {
              setMode('register');
              setError('');
              setInfoMessage('');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Cuenta</span>
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div
            role="status"
            className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@clinica.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 rounded-xl text-sm transition outline-hidden"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-[11px] font-medium text-sky-600 hover:text-sky-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>¿Olvidaste tu contraseña?</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 rounded-xl text-sm transition outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/20 transition cursor-pointer"
            >
              {loading ? 'Ingresando...' : 'Ingresar a la Nube'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label
                htmlFor="reg-nombre"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Nombre de la Doctora / Usuario <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Dra. Carol Mendoza"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 rounded-xl text-sm transition outline-hidden"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-especialidad"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Especialidad
              </label>
              <input
                id="reg-especialidad"
                type="text"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                placeholder="Medicina Funcional y Antienvejecimiento"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-xs outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label
                  htmlFor="reg-rol"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Rol
                </label>
                <select
                  id="reg-rol"
                  value={rol}
                  onChange={(e) =>
                    setRol(
                      e.target.value === 'Equipo Asistencial' ? 'Equipo Asistencial' : 'Doctora'
                    )
                  }
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-xs outline-hidden"
                >
                  <option value="Doctora">Doctora</option>
                  <option value="Equipo Asistencial">Equipo Asistencial</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="reg-cmp"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  CMP (opcional)
                </label>
                <input
                  id="reg-cmp"
                  type="text"
                  value={cmp}
                  onChange={(e) => setCmp(e.target.value)}
                  placeholder="CMP: 48921"
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-xs outline-hidden"
                />
              </div>
              <div>
                <label
                  htmlFor="reg-rne"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  RNE (opcional)
                </label>
                <input
                  id="reg-rne"
                  type="text"
                  value={rne}
                  onChange={(e) => setRne(e.target.value)}
                  placeholder="RNE: 24105"
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 focus:border-sky-400 rounded-xl text-xs outline-hidden"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Tu Correo Electrónico <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctora@tucorreo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 rounded-xl text-sm transition outline-hidden"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Nueva Contraseña (mín. 6 caracteres) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crea una contraseña segura"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 rounded-xl text-sm transition outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/20 transition cursor-pointer"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta y Subir a la Nube'}
            </button>
          </form>
        )}

        {/* Divider & Google Sign-In */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-medium text-slate-400 uppercase">o accede con</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm rounded-xl shadow-2xs transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
            />
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-1">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Tus pacientes se sincronizan en todos tus dispositivos.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
