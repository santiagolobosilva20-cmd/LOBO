import { useQuery } from '@tanstack/react-query';
import {
  Apple,
  Award,
  Clock,
  CreditCard,
  Dumbbell,
  Home,
  LogOut,
  Menu,
  RefreshCw,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { requestJson } from '../../shared/api/http';
import type { HealthStatus, SingleResponse } from '../../shared/api/types';
import { formatSpanishDateHeader, getMemberInitials } from '../../shared/utils/format';

interface AppShellProps {
  clubStatus?: {
    is_open: boolean;
    hours: string;
  };
  children: ReactNode;
}

const ADMIN_NAV_ITEMS = [
  { to: '/', label: 'Resumen', icon: Home },
  { to: '/socios', label: 'Socios', icon: Users },
  { to: '/horarios', label: 'Horarios', icon: Clock },
  { to: '/planes', label: 'Planes y precios', icon: CreditCard },
  { to: '/rutinas', label: 'Rutinas', icon: Dumbbell },
  { to: '/entrenamientos', label: 'Entrenamientos', icon: TrendingUp },
  { to: '/alimentacion', label: 'Alimentación', icon: Apple },
];

const MEMBER_NAV_ITEMS = [
  { to: '/mi-espacio', label: 'Mi resumen', icon: Home },
  { to: '/mi-espacio/membresia', label: 'Mi membresía', icon: Award },
  { to: '/mi-espacio/horarios', label: 'Horarios y reservas', icon: Clock },
  { to: '/mi-espacio/rutina', label: 'Mi rutina', icon: Dumbbell },
  { to: '/mi-espacio/entrenamientos', label: 'Mis entrenamientos', icon: TrendingUp },
  { to: '/mi-espacio/alimentacion', label: 'Mi alimentación', icon: Apple },
];

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Resumen',
  '/socios': 'Socios y membresías',
  '/horarios': 'Horarios',
  '/planes': 'Planes y precios',
  '/rutinas': 'Rutinas',
  '/entrenamientos': 'Entrenamientos',
  '/alimentacion': 'Alimentación',
  '/mi-espacio': 'Mi resumen',
  '/mi-espacio/membresia': 'Mi membresía y pagos',
  '/mi-espacio/horarios': 'Horarios y reservas',
  '/mi-espacio/rutina': 'Mi rutina',
  '/mi-espacio/entrenamientos': 'Mis entrenamientos',
  '/mi-espacio/alimentacion': 'Mi alimentación',
};

export function AppShell({ clubStatus, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMemberPortal = user?.role === 'member';
  const navItems = isMemberPortal ? MEMBER_NAV_ITEMS : ADMIN_NAV_ITEMS;
  const brandHref = isMemberPortal ? '/mi-espacio' : '/';
  const currentTitle = ROUTE_TITLES[location.pathname] ?? (isMemberPortal ? 'Mi resumen' : 'Resumen');
  const displayName = user?.member_name || user?.name || 'LOBO Club';
  const roleLabel = isMemberPortal ? 'Socio LOBO' : 'Administración';
  const initials = getMemberInitials(displayName);

  const healthQuery = useQuery({
    queryKey: ['healthz'],
    queryFn: async () => {
      try {
        return await requestJson<SingleResponse<HealthStatus>>('/healthz');
      } catch {
        return {
          data: {
            status: 'degraded' as const,
            database: 'disconnected' as const,
            timestamp: new Date().toISOString(),
          },
        };
      }
    },
    refetchInterval: 30000,
    retry: false,
  });

  const dbDisconnected = healthQuery.data?.data.database === 'disconnected';
  const isOpen = clubStatus?.is_open ?? true;
  const hours = clubStatus?.hours ?? 'Lun a sáb · 06:00–22:00';

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white px-[18px] pt-[29px] pb-[17px]">
      <div className="flex items-center justify-between px-[9px]">
        <NavLink to={brandHref} className="flex items-center gap-[11px] text-[#22251f] no-underline">
          <span className="font-display grid h-[39px] w-[39px] shrink-0 -rotate-4 place-items-center bg-[#d3f36b] text-[24px] leading-none font-bold text-[#22251f]">
            L
          </span>
          <span className="flex flex-col gap-[2px]">
            <strong className="font-display text-[19px] leading-none font-bold text-[#22251f]">
              LOBO
            </strong>
            <small className="text-[8px] font-bold tracking-[0.02em] text-[#8a8c83] uppercase">
              CLUB DE ENTRENAMIENTO
            </small>
          </span>
        </NavLink>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-[3px] p-1 text-[#686b63] hover:bg-[#f5f6f1] lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-[10px] mt-[38px] mb-[12px] text-[9px] font-bold tracking-[0.02em] text-[#9c9e96] uppercase">
        {isMemberPortal ? 'PORTAL SOCIO' : 'MENÚ PRINCIPAL'}
      </div>

      <nav className="grid gap-[4px]" aria-label="Navegación principal">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/' || to === '/mi-espacio'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex min-h-[41px] w-full items-center gap-[12px] rounded-[3px] px-[12px] text-left text-[12px] font-semibold transition-colors ${
                isActive
                  ? 'bg-[#d3f36b] text-[#22251f]'
                  : 'text-[#686b63] hover:bg-[#f5f6f1] hover:text-[#22251f]'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0 stroke-[1.6]" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="my-3 mb-[19px] flex items-start gap-[9px] rounded-[3px] border border-[#e8e9e3] bg-white px-[10px] py-[12px] text-[11px] font-bold text-[#3d4039]">
          <span
            className={`mt-[3px] inline-block h-[7px] w-[7px] shrink-0 rounded-full ${
              isOpen ? 'live-dot-ring' : 'bg-amber-500'
            }`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <span>{isOpen ? 'Gimnasio abierto' : 'Fuera de horario'}</span>
            <small className="tabular-nums mt-1 block text-[9px] font-medium text-[#85877f]">
              {hours}
            </small>
            {dbDisconnected ? (
              <div
                role="status"
                className="mt-2 flex items-center justify-between gap-2 border-t border-[#eff0eb] pt-2 text-[9px] font-semibold text-amber-700"
              >
                <span>PostgreSQL offline</span>
                <button
                  type="button"
                  onClick={() => void healthQuery.refetch()}
                  className="inline-flex items-center gap-1 rounded-[3px] border border-[#e8e9e3] bg-[#f8f9f5] px-1.5 py-0.5 text-[9px] font-bold text-[#22251f] hover:bg-[#d3f36b]"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  Reintentar
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-[9px] border-t border-[#e8e9e3] px-1 pt-[13px]">
          <div className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full bg-[#22251f] text-[10px] font-bold text-[#d3f36b]">
            {initials}
          </div>
          <span className="grid min-w-0 gap-[3px] text-[10px]">
            <strong className="truncate font-bold text-[#22251f]">{displayName}</strong>
            <small className="text-[9px] text-[#85877f]">{roleLabel}</small>
          </span>
          <button
            type="button"
            onClick={() => void handleLogout()}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-[3px] border border-[#e8e9e3] text-[#686b63] hover:bg-[#f5f6f1] hover:text-[#22251f]"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4ef]">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-[218px] border-r border-[#e8e9e3] bg-white lg:block xl:w-[244px]">
        {sidebarContent}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="w-[244px] border-r border-[#e8e9e3] bg-white shadow-[10px_0_30px_rgba(23,26,22,0.08)]">
            {sidebarContent}
          </div>
          <button
            type="button"
            aria-label="Cerrar menú lateral"
            className="flex-1 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      ) : null}

      <div className="min-h-screen max-w-[1600px] px-[17px] pb-[30px] md:px-[25px] lg:ml-[218px] lg:px-[43px] xl:ml-[244px] 2xl:mr-auto">
        <header className="flex h-[59px] items-center justify-between gap-[11px] border-b border-[#e6e7e1] md:h-[71px]">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-1 text-[#22251f] lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="mr-auto text-[8px] font-bold tracking-[0.02em] text-[#898b83] uppercase sm:text-[9px]">
            LOBO CLUB <span className="mx-[5px] text-[#c3c4bd] sm:mx-[10px]">/</span>{' '}
            <strong className="text-[#22251f] normal-case">{currentTitle}</strong>
          </div>

          <div className="flex items-center gap-[14px]">
            <span className="hidden text-[10px] text-[#73756e] sm:inline">
              {formatSpanishDateHeader()}
            </span>
            <span
              className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full bg-[#ff8068] text-[10px] font-bold text-[#22251f] sm:h-[31px] sm:w-[31px]"
              title={`${displayName} · ${roleLabel}`}
            >
              {initials}
            </span>
          </div>
        </header>

        <main className="view-appear pt-[17px] md:pt-[26px]">{children}</main>
      </div>
    </div>
  );
}
