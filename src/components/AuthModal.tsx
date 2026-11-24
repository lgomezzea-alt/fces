import React, { useEffect, useState } from 'react';
import { KeyRound, Lock, UserCheck, X } from 'lucide-react';
import { SENA_REGIONALES } from '../data/setManualData';
import type { RaciRole, UserProfile } from '../types/set';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (token: string, user: UserProfile) => void;
}

type AuthMode = 'login' | 'bootstrap' | 'register';

const RACI_ROLES: RaciRole[] = [
  'Coordinador Académico / Enlace SET',
  'Subdirector de Centro',
  'Dirección Regional',
  'Apoyo Administrativo Mixto',
];

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [hasUsers, setHasUsers] = useState<boolean>(true);
  const [envPasscodeConfigured, setEnvPasscodeConfigured] = useState<boolean>(false);
  const [statusLoading, setStatusLoading] = useState<boolean>(true);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [regional, setRegional] = useState('Regional Antioquia');
  const [centroFormacion, setCentroFormacion] = useState('');
  const [role, setRole] = useState<RaciRole>('Coordinador Académico / Enlace SET');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setErrorMsg(null);
    setStatusLoading(true);
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data: { hasUsers?: boolean; envPasscodeConfigured?: boolean }) => {
        if (!active) return;
        const usersExist = Boolean(data.hasUsers);
        const envSet = Boolean(data.envPasscodeConfigured);
        setHasUsers(usersExist);
        setEnvPasscodeConfigured(envSet);
        if (!usersExist && !envSet) {
          setMode('bootstrap');
        } else {
          setMode('login');
        }
      })
      .catch(() => {
        if (active) setMode('login');
      })
      .finally(() => {
        if (active) setStatusLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const endpoint =
      mode === 'bootstrap'
        ? '/api/auth/bootstrap'
        : mode === 'register'
          ? '/api/auth/register'
          : '/api/auth/login';

    const body =
      mode === 'login'
        ? { username, password }
        : { username, password, fullName, regional, centroFormacion, role };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { token?: string; user?: UserProfile; error?: string };
      if (!res.ok || !data.token || !data.user) {
        setErrorMsg(data.error || 'No fue posible autenticar. Verifique los datos ingresados.');
        setSubmitting(false);
        return;
      }
      setPassword('');
      onAuthenticated(data.token, data.user);
      onClose();
    } catch {
      setErrorMsg('Error de conexión con el servidor de autenticación.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-medium text-emerald-800">
              Acceso Institucional · Centros de Formación SENA
            </p>
            <h2 id="auth-modal-title" className="mt-1 text-xl font-bold text-slate-900">
              {mode === 'bootstrap'
                ? 'Configuración Inicial de Acceso'
                : mode === 'register'
                  ? 'Registrar Cuenta de Centro'
                  : 'Ingreso por Nombre y Clave'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
            aria-label="Cerrar ventana de ingreso"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!statusLoading && (hasUsers || envPasscodeConfigured) && (
          <div className="mt-4 flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ingresar con Nombre y Clave
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registrar Nuevo Centro
            </button>
          </div>
        )}

        {mode === 'bootstrap' && !statusLoading && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs leading-relaxed text-emerald-950">
            Primer ingreso detectado. Cree el usuario administrador inicial del Centro de Formación con
            su nombre y clave para habilitar el guardado de avances y cierre del proceso.
          </div>
        )}

        {errorMsg && (
          <div
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800"
            role="alert"
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="auth-username"
                className="block text-xs font-semibold text-slate-700"
              >
                Nombre de Usuario (Ingreso)
              </label>
              <div className="relative mt-1.5">
                <UserCheck className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-username"
                  type="text"
                  required
                  minLength={3}
                  maxLength={80}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej. enlace.antioquia"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold text-slate-700"
              >
                Clave de Acceso
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={mode === 'login' ? 1 : 6}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {mode !== 'login' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="auth-fullname"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Nombre Completo del Funcionario
                  </label>
                  <input
                    id="auth-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nombre y apellidos"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="auth-role"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Rol RACI en Línea SET
                  </label>
                  <select
                    id="auth-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as RaciRole)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none"
                  >
                    {RACI_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="auth-regional"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Dirección Regional SENA
                  </label>
                  <select
                    id="auth-regional"
                    value={regional}
                    onChange={(e) => setRegional(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none"
                  >
                    {SENA_REGIONALES.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="auth-centro"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Centro de Formación
                  </label>
                  <input
                    id="auth-centro"
                    type="text"
                    required
                    value={centroFormacion}
                    onChange={(e) => setCentroFormacion(e.target.value)}
                    placeholder="Ej. Centro de Tecnología de la Manufactura"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || statusLoading}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#0B5D2B] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#094a22] disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />
              {submitting
                ? 'Verificando...'
                : mode === 'bootstrap'
                  ? 'Crear Acceso e Ingresar'
                  : mode === 'register'
                    ? 'Registrar e Ingresar'
                    : 'Ingresar a la Plataforma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
