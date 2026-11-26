import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Clock,
  CreditCard,
  Home,
  Menu,
  MoreHorizontal,
  RefreshCw,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { requestJson } from '../../shared/api/http';
import type { HealthStatus, SingleResponse } from '../../shared/api/types';
import { formatSpanishDateHeader } from '../../shared/utils/format';

interface AppShellProps {
  clubStatus?: {
    is_open: boolean;
    hours: string;
  };
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: '/', label: 'Resumen', icon: Home },
  { to: '/socios', label: 'Socios', icon: Users },
  { to: '/horarios', label: 'Horarios', icon: Clock },
  { to: '/planes', label: 'Planes y precios', icon: CreditCard },
  { to: '/entrenamientos', label: 'Entrenamientos', icon: TrendingUp },
];

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Resumen',
  '/socios': 'Socios',
  '/horarios': 'Horarios',
  '/planes': 'Planes y precios',
  '/entrenamientos': 'Entrenamientos',
};

export function AppShell({ clubStatus, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const currentTitle = ROUTE_TITLES[location.pathname] ?? 'Resumen';
  const ActiveIcon = NAV_ITEMS.find((item) => item.to === location.pathname)?.icon ?? Home;

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

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-6">
      <div>
        <div className="mb-8 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CEF542] text-base font-black text-[#17191C]">
              L
            </div>
            <div>
              <p className="text-base font-extrabold leading-none tracking-tight text-[#17191C]">LOBO</p>
              <p className="mt-1 text-[9px] font-semibold tracking-wider text-[#6B7280] uppercase">
                Club de entrenamiento
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-[#6B7280] lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-2.5 px-2 text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
          Menú principal
        </p>

        <nav className="space-y-1.5" aria-label="Menú principal">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-[#CEF542] font-semibold text-[#17191C]'
                    : 'font-medium text-[#4B5563] hover:bg-[#F5F5F0] hover:text-[#17191C]'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-3 border-t border-[#E6E7E2] pt-4">
        <div className="rounded-xl border border-[#E6E7E2] bg-[#FAFBF9] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-amber-500'}`}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-[#17191C]">
              {isOpen ? 'Gimnasio abierto' : 'Fuera de horario'}
            </span>
          </div>
          <p className="tabular-nums mt-0.5 pl-4 text-[11px] text-[#6B7280]">{hours}</p>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#17191C] text-xs font-bold text-white">
              LC
            </div>
            <div>
              <p className="text-xs font-bold text-[#17191C]">LOBO Club</p>
              <p className="text-[11px] text-[#6B7280]">Administración</p>
            </div>
          </div>
          <MoreHorizontal className="h-4 w-4 text-[#9CA3AF]" aria-hidden="true" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F5F5F0]">
      <aside className="hidden w-[236px] shrink-0 border-r border-[#E6E7E2] bg-white lg:block">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="w-64 border-r border-[#E6E7E2] bg-white shadow-xl">{sidebarContent}</div>
          <button
            type="button"
            aria-label="Cerrar menú lateral"
            className="flex-1 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="px-5 pt-4 sm:px-8">
          <div className="flex h-12 items-center justify-between border-b border-[#E6E7E2] pb-3">
            <div className="flex items-center gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-1.5 text-[#4B5563] hover:bg-white lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="font-semibold tracking-wide text-[#9CA3AF] uppercase">LOBO CLUB</span>
              <span className="text-[#D1D5DB]">/</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#17191C]">
                <ActiveIcon className="h-3.5 w-3.5 text-[#6B7280]" />
                {currentTitle}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-[#6B7280] sm:inline">{formatSpanishDateHeader()}</span>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F27D62] text-xs font-bold text-white"
                title="LOBO Club Administración"
              >
                LC
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-5 sm:px-8">
          {dbDisconnected ? (
            <div
              role="alert"
              className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
                <div>
                  <strong className="font-semibold">Base de datos PostgreSQL desconectada:</strong>{' '}
                  inicia el servicio local en el puerto 5432 y ejecuta{' '}
                  <code className="rounded bg-amber-100 px-1 py-0.5">php backend/artisan migrate --seed</code> para
                  persistir socios, pagos y clases.
                </div>
              </div>
              <button
                type="button"
                onClick={() => void healthQuery.refetch()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-semibold text-amber-900 hover:bg-amber-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reintentar
              </button>
            </div>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  );
}
