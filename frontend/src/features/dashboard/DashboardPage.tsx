import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, DollarSign, Plus, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestJson } from '../../shared/api/http';
import type { DashboardSummary, SingleResponse } from '../../shared/api/types';
import { KpiCard } from '../../shared/components/KpiCard';
import { formatWeekdayProgressLabel, getPaymentMethodLabel } from '../../shared/utils/format';
import { RegisterPaymentModal } from '../billing/RegisterPaymentModal';

const DEFAULT_FEATURED = [
  {
    id: 1,
    time: '07:00',
    period: 'AM',
    name: 'Fuerza funcional',
    meta: 'Sala Norte · 45 min',
    ratio: '8/12',
    color: '#CEF542',
  },
  {
    id: 2,
    time: '09:30',
    period: 'AM',
    name: 'Boxeo',
    meta: 'Ring · 50 min',
    ratio: '6/10',
    color: '#EF4444',
  },
  {
    id: 3,
    time: '06:00',
    period: 'PM',
    name: 'Spinning',
    meta: 'Sala Sur · 40 min',
    ratio: '10/14',
    color: '#3B82F6',
  },
];

export function DashboardPage() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => requestJson<SingleResponse<DashboardSummary>>('/dashboard/summary'),
    retry: false,
  });

  const summary = summaryQuery.data?.data;
  const kpis = summary?.kpis;
  const recentPayments = summary?.recent_payments ?? [];
  const featured =
    summary?.featured_sessions && summary.featured_sessions.length > 0
      ? summary.featured_sessions.map((s) => {
          const [timePart, periodPart] = s.start_time_label.split(' ');
          return {
            id: s.id,
            time: timePart ?? s.short_time_label,
            period: periodPart ?? '',
            name: s.workout_name,
            meta: `${s.room} · ${s.duration_minutes} min`,
            ratio: `${s.enrolled_count}/${s.capacity}`,
            color: s.accent_color || '#CEF542',
          };
        })
      : DEFAULT_FEATURED;

  const nextTimeParts = (kpis?.next_session?.start_time_label ?? '07:00 AM').split(' ');

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-[#16181A] text-white">
        <img
          src="/images/hero-gym.jpg"
          alt="Área de entrenamiento en LOBO Club"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#111315]/95 via-[#111315]/70 to-[#111315]/45"
          aria-hidden="true"
        />

        <div className="relative flex flex-col justify-between gap-6 px-7 py-8 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold tracking-widest text-[#CEF542] uppercase">
              Tu espacio. Tu ritmo.
            </p>
            <h1 className="mt-2.5 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
              Entrena hoy.
              <span className="block text-[#CEF542]">Supera tu marca.</span>
            </h1>
            <p className="mt-3 text-xs text-gray-300 sm:text-sm">
              El progreso se construye una sesión a la vez.
            </p>
          </div>

          <div className="flex flex-col items-start gap-1.5 md:items-end">
            <span className="text-[11px] text-gray-200">¿Entró un pago?</span>
            <button
              type="button"
              onClick={() => setPaymentModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#CEF542] px-4 py-2.5 text-xs font-bold text-[#17191C] transition-colors hover:bg-[#C1EA2C]"
            >
              <Plus className="h-4 w-4" />
              Registrar ingreso
            </button>
          </div>
        </div>
      </section>

      <section aria-labelledby="kpis-heading" className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
              {formatWeekdayProgressLabel()}
            </p>
            <h2 id="kpis-heading" className="text-xl font-bold tracking-tight text-[#17191C]">
              Tu gimnasio, al día
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E6E7E2] bg-white px-3 py-1 text-xs font-medium text-[#4B5563]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Este mes
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Ingresos del mes"
            value={kpis?.formatted_monthly_revenue ?? '$0.00'}
            subtitle="Pagos registrados este mes"
            icon={<DollarSign className="h-4 w-4 text-[#17191C]" />}
            iconBgClass="bg-[#CEF542]"
          />
          <KpiCard
            label="Socios activos"
            value={kpis?.active_members_count ?? 0}
            subtitle="Personas en tu comunidad"
            icon={<Users className="h-4 w-4 text-rose-700" />}
            iconBgClass="bg-rose-50"
          />
          <KpiCard
            label="Pagos registrados"
            value={kpis?.monthly_payments_count ?? 0}
            subtitle="Movimientos de este mes"
            icon={<TrendingUp className="h-4 w-4 text-sky-700" />}
            iconBgClass="bg-sky-50"
          />
          <KpiCard
            label="Próxima clase"
            value={
              <span>
                {nextTimeParts[0]}{' '}
                <span className="text-xs font-semibold text-[#6B7280]">{nextTimeParts[1] ?? ''}</span>
              </span>
            }
            subtitle={
              kpis?.next_session
                ? `${kpis.next_session.workout_name} · ${kpis.next_session.room}`
                : 'Fuerza funcional · Sala Norte'
            }
            icon={<Clock className="h-4 w-4 text-white" />}
            iconBgClass="bg-[#17191C]"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-[#E6E7E2] bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                  Movimientos recientes
                </p>
                <h3 className="text-base font-bold text-[#17191C]">Ingresos por socio</h3>
              </div>
              <Link
                to="/socios"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#4B5563] hover:text-[#17191C]"
              >
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E7E2] bg-[#FAFBF9] text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                    <th className="px-3 py-2.5">Socio</th>
                    <th className="px-3 py-2.5">Plan</th>
                    <th className="px-3 py-2.5">Fecha</th>
                    <th className="px-3 py-2.5">Método</th>
                    <th className="px-3 py-2.5 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-[#F2F3EE] last:border-0">
                      <td className="px-3 py-3 font-semibold text-[#17191C]">{payment.member_name}</td>
                      <td className="px-3 py-3 text-[#4B5563]">{payment.plan_name}</td>
                      <td className="tabular-nums px-3 py-3 text-[#6B7280]">{payment.paid_at}</td>
                      <td className="px-3 py-3 text-[#4B5563]">
                        {getPaymentMethodLabel(payment.payment_method)}
                      </td>
                      <td className="tabular-nums px-3 py-3 text-right font-bold text-[#17191C]">
                        {payment.formatted_amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {recentPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CEF542] text-[#17191C]">
                  <Plus className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-bold text-[#17191C]">Aún no hay ingresos</p>
                <p className="mt-1 text-xs text-[#6B7280]">Registra el primer pago para empezar.</p>
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(true)}
                  className="mt-4 rounded-lg bg-[#17191C] px-4 py-2 text-xs font-semibold text-white hover:bg-black"
                >
                  Registrar ingreso
                </button>
              </div>
            ) : null}
          </div>

          <p className="mt-2.5 px-1 text-[11px] text-[#9CA3AF]">
            Los registros se guardan en PostgreSQL vía Laravel API.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="flex h-full flex-col justify-between rounded-xl border border-[#E6E7E2] bg-white p-5">
            <div>
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                    Hoy en LOBO
                  </p>
                  <h3 className="text-base font-bold text-[#17191C]">Clases destacadas</h3>
                </div>
                <Link
                  to="/horarios"
                  aria-label="Ir a Horarios"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6E7E2] text-[#4B5563] hover:bg-[#F5F5F0] hover:text-[#17191C]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <ul className="divide-y divide-[#F2F3EE]">
                {featured.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="tabular-nums w-11 shrink-0 text-left">
                        <span className="block text-xs font-bold text-[#17191C]">{item.time}</span>
                        <span className="block text-[10px] font-medium text-[#9CA3AF]">
                          {item.period}
                        </span>
                      </div>
                      <span
                        className="h-8 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-bold text-[#17191C]">{item.name}</p>
                        <p className="text-xs text-[#6B7280]">{item.meta}</p>
                      </div>
                    </div>
                    <span className="tabular-nums text-xs font-semibold text-[#6B7280]">
                      {item.ratio}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#F2F3EE] pt-3 text-[11px] text-[#9CA3AF]">
              <span>Más movimiento, mejores días.</span>
              <Sparkles className="h-3.5 w-3.5 text-[#84CC16]" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <RegisterPaymentModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
    </div>
  );
}
