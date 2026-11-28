import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, requestJson } from '../../shared/api/http';
import type { AuthConfigStatus, SingleResponse, UserRole } from '../../shared/api/types';
import { SkeletonBlock } from '../../shared/components/Skeletons';
import { useAuth } from './AuthContext';

type AuthMode = 'login' | 'register';

export function AuthPage() {
  const navigate = useNavigate();
  const { login, registerMember, demoLogin } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const configQuery = useQuery({
    queryKey: ['auth', 'config'],
    queryFn: async () => {
      try {
        return await requestJson<SingleResponse<AuthConfigStatus>>('/auth/config');
      } catch {
        return { data: { demo_login_enabled: false } };
      }
    },
    retry: false,
  });

  const demoEnabled = configQuery.data?.data.demo_login_enabled ?? false;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const signedUser =
        mode === 'login'
          ? await login(email.trim(), password)
          : await registerMember(name.trim(), email.trim(), password);

      navigate(signedUser.role === 'admin' ? '/' : '/mi-espacio', { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos completar la autenticación. Intenta de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDemo(role: UserRole) {
    setError('');
    setSubmitting(true);
    try {
      const signedUser = await demoLogin(role);
      navigate(signedUser.role === 'admin' ? '/' : '/mi-espacio', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos iniciar sesión demo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f4ef] px-4 py-8 sm:px-8 sm:py-12">
      <div className="lobo-view-enter mx-auto grid max-w-[1040px] overflow-hidden rounded-[4px] border border-[#e7e8e2] bg-white lg:grid-cols-12">
        <section className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-[#181c17] p-7 text-white sm:p-10 lg:col-span-6 lg:min-h-[600px]">
          <img
            src="/images/hero-gym.jpg"
            alt="LOBO Club de Entrenamiento"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-50"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#181c1766] via-[#181c1788] to-[#181c17f5]"
            aria-hidden="true"
          />

          <div className="relative z-10 flex items-center gap-3">
            <span className="font-display grid h-[39px] w-[39px] -rotate-4 place-items-center bg-[#d3f36b] text-[24px] leading-none font-bold text-[#22251f]">
              L
            </span>
            <div>
              <strong className="font-display block text-[19px] leading-none font-bold text-white">
                LOBO
              </strong>
              <small className="text-[8px] font-bold tracking-[0.06em] text-[#d3f36b] uppercase">
                CLUB DE ENTRENAMIENTO
              </small>
            </div>
          </div>

          <div className="relative z-10 mt-10">
            <span className="block text-[9px] font-bold tracking-[0.08em] text-[#d3f36b] uppercase">
              ACCESO INTEGRAL POR ROL
            </span>
            <h1 className="font-display mt-3 text-[28px] leading-[1.08] font-bold sm:text-[34px]">
              Tu progreso, tu rutina y tu club en un solo lugar.
            </h1>
            <p className="mt-3 max-w-[380px] text-[11px] leading-[1.6] text-[#d8dad3]">
              Inicia sesión como socio para revisar tu membresía, reservar clases, seguir tu rutina
              y registrar tus entrenamientos; o ingresa como administrador para gestionar el club.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2.5 text-[10px]">
              <div className="rounded-[3px] border border-white/15 bg-black/35 p-3">
                <strong className="block font-bold text-[#d3f36b]">PORTAL SOCIO</strong>
                <span className="mt-1 block text-[#d8dad3]">
                  Membresía, reservas, rutina y alimentación
                </span>
              </div>
              <div className="rounded-[3px] border border-white/15 bg-black/35 p-3">
                <strong className="block font-bold text-[#dceefa]">PANEL ADMIN</strong>
                <span className="mt-1 block text-[#d8dad3]">
                  Cobros, aprobaciones, clases y asignaciones
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-6">
          <div className="flex items-center gap-1.5 rounded-[3px] bg-[#f8f9f5] p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 rounded-[3px] py-2 text-[11px] font-bold transition-colors ${
                mode === 'login'
                  ? 'bg-[#22251f] text-white'
                  : 'text-[#686b63] hover:text-[#22251f]'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 rounded-[3px] py-2 text-[11px] font-bold transition-colors ${
                mode === 'register'
                  ? 'bg-[#22251f] text-white'
                  : 'text-[#686b63] hover:text-[#22251f]'
              }`}
            >
              Registrarme como socio
            </button>
          </div>

          <div className="mt-6">
            <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
              {mode === 'login' ? 'BIENVENIDO DE VUELTA' : 'NUEVO SOCIO LOBO'}
            </span>
            <h2 className="font-display mt-1 text-[24px] font-semibold text-[#22251f]">
              {mode === 'login' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta de socio'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {mode === 'register' ? (
              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-[#5f6259]">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Sofía Navarro"
                  className="min-h-[40px] w-full rounded-[3px] border border-[#e2e4dc] px-3 text-[12px] text-[#22251f] outline-none focus:border-[#22251f]"
                />
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block text-[10px] font-bold text-[#5f6259]">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@correo.com"
                className="min-h-[40px] w-full rounded-[3px] border border-[#e2e4dc] px-3 text-[12px] text-[#22251f] outline-none focus:border-[#22251f]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold text-[#5f6259]">
                Contraseña
              </label>
              <input
                type="password"
                required
                minLength={mode === 'register' ? 6 : 4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                className="min-h-[40px] w-full rounded-[3px] border border-[#e2e4dc] px-3 text-[12px] text-[#22251f] outline-none focus:border-[#22251f]"
              />
            </div>

            {error ? (
              <p role="alert" className="text-[11px] font-medium text-[#b42318]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="lobo-pressable inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[3px] bg-[#d3f36b] px-4 text-[12px] font-bold text-[#22251f] hover:bg-[#c8eb55] disabled:opacity-60"
            >
              {submitting
                ? 'Validando...'
                : mode === 'login'
                  ? 'Ingresar'
                  : 'Crear cuenta e ingresar'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          {configQuery.isLoading ? (
            <div
              className="mt-7 border-t border-[#eceee7] pt-5"
              role="status"
              aria-busy="true"
              aria-label="Cargando opciones de acceso"
            >
              <SkeletonBlock className="h-2.5 w-36" />
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                <SkeletonBlock className="h-[38px] w-full rounded-[3px]" />
                <SkeletonBlock className="h-[38px] w-full rounded-[3px]" />
              </div>
            </div>
          ) : demoEnabled ? (
            <div className="lobo-view-enter mt-7 border-t border-[#eceee7] pt-5">
              <span className="block text-[9px] font-bold tracking-[0.04em] text-[#8b8e84] uppercase">
                ACCESO RÁPIDO EN ENTORNO LOCAL
              </span>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleDemo('member')}
                  className="lobo-pressable inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[3px] border border-[#e2e4dc] bg-[#f8f9f5] px-3 text-[10px] font-bold text-[#22251f] hover:border-[#22251f] hover:bg-[#d3f36b]"
                >
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                  Socio · Alex Rivera
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleDemo('admin')}
                  className="lobo-pressable inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[3px] border border-[#e2e4dc] bg-[#22251f] px-3 text-[10px] font-bold text-white hover:bg-[#363a31]"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#d3f36b]" aria-hidden="true" />
                  Administrador LOBO
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

