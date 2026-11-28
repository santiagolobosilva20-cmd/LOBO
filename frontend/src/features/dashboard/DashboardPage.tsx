import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestJson } from '../../shared/api/http';
import type { DashboardSummary, SingleResponse } from '../../shared/api/types';
import { KpiCard } from '../../shared/components/KpiCard';
import { FeaturedSessionsSkeleton, TableSkeleton } from '../../shared/components/Skeletons';
import { formatWeekdayProgressLabel } from '../../shared/utils/format';
import { PaymentsTable } from '../billing/PaymentsTable';
import { RegisterPaymentModal } from '../billing/RegisterPaymentModal';

const DEFAULT_FEATURED = [
  {
    id: 1,
    time: '07:00',
    period: 'AM',
    name: 'Fuerza funcional',
    meta: 'Sala Norte · 45 min',
    ratio: '8/12',
    color: '#b6dc4a',
  },
  {
    id: 2,
    time: '09:30',
    period: 'AM',
    name: 'Boxeo',
    meta: 'Ring · 50 min',
    ratio: '6/10',
    color: '#ff8068',
  },
  {
    id: 3,
    time: '06:00',
    period: 'PM',
    name: 'Spinning',
    meta: 'Sala Sur · 40 min',
    ratio: '10/14',
    color: '#78b9e5',
  },
];

function normalizeBarColor(color: string | undefined, index: number): string {
  if (!color || color.toUpperCase() === '#CEF542') {
    return index === 0 ? '#b6dc4a' : index === 1 ? '#ff8068' : '#78b9e5';
  }
  if (color.toUpperCase() === '#EF4444') return '#ff8068';
  if (color.toUpperCase() === '#3B82F6') return '#78b9e5';
  return color;
}

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
      ? summary.featured_sessions.map((s, idx) => {
          const [timePart, periodPart] = s.start_time_label.split(' ');
          return {
            id: s.id,
            time: timePart ?? s.short_time_label,
            period: periodPart ?? '',
            name: s.workout_name,
            meta: `${s.room} · ${s.duration_minutes} min`,
            ratio: `${s.enrolled_count}/${s.capacity}`,
            color: normalizeBarColor(s.accent_color, idx),
          };
        })
      : DEFAULT_FEATURED;

  const nextTimeParts = (kpis?.next_session?.start_time_label ?? '07:00 AM').split(' ');

  return (
    <div>
      <section className="relative flex min-h-[213px] flex-col justify-between gap-4 overflow-hidden bg-[#2a3025] px-[20px] py-[23px] text-white sm:flex-row sm:items-center sm:px-[35px] sm:py-[27px] md:min-h-[225px]">
        <img
          src="/images/hero-gym.jpg"
          alt="Área de entrenamiento en LOBO Club"
          className="absolute inset-0 h-full w-full object-cover object-[50%_48%]"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,25,20,0.91)_0%,rgba(20,25,20,0.72)_48%,rgba(20,25,20,0.18)_100%)]"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <span className="block text-[9px] font-bold text-[#d3f36b] uppercase">
            TU ESPACIO. TU RITMO.
          </span>
          <h1 className="font-display mt-3 mb-2 text-[29px] leading-[1.03] font-semibold sm:text-[31px] md:text-[37px]">
            Entrena hoy.
            <br />
            <span className="text-[#d3f36b]">Supera tu marca.</span>
          </h1>
          <p className="max-w-[230px] text-[11px] leading-normal text-[#d1d2cb] sm:max-w-none">
            El progreso se construye una sesión a la vez.
          </p>
        </div>

        <div className="relative z-10 mt-auto flex flex-col items-start gap-[9px] sm:items-end">
          <span className="text-[10px] text-[#e3e3de]">¿Entró un pago?</span>
          <button
            type="button"
            onClick={() => setPaymentModalOpen(true)}
            className="lobo-pressable inline-flex min-h-[39px] items-center justify-center gap-[9px] rounded-[3px] bg-[#d3f36b] px-[15px] text-[10px] font-bold text-[#22251f] hover:bg-[#c5eb50]"
          >
            <span className="text-[15px] leading-none">＋</span> Registrar ingreso
          </button>
        </div>
      </section>

      <div className="mt-[28px] mb-[15px] flex items-end justify-between gap-2">
        <div>
          <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
            {formatWeekdayProgressLabel()}
          </span>
          <h2 className="font-display mt-[5px] text-[19px] leading-[1.15] font-semibold text-[#22251f] sm:text-[22px]">
            Tu gimnasio, al día
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-[3px] border border-[#e4e6de] bg-white px-[10px] py-2 text-[9px] text-[#686b63]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#80bd42]" aria-hidden="true" />
          Este mes
        </span>
      </div>

      <section aria-label="Indicadores del mes" className="grid grid-cols-2 gap-[8px] sm:gap-[12px] xl:grid-cols-4">
        <KpiCard
          index={0}
          loading={summaryQuery.isLoading}
          label="Ingresos del mes"
          value={kpis?.formatted_monthly_revenue ?? '$0.00'}
          subtitle="Pagos registrados este mes"
          icon={<DollarSign className="h-[13px] w-[13px] stroke-[2.1] text-[#22251f]" />}
          iconBgClass="bg-[#d3f36b]"
        />
        <KpiCard
          index={1}
          loading={summaryQuery.isLoading}
          label="Socios activos"
          value={kpis?.active_members_count ?? 0}
          subtitle={
            (kpis?.active_memberships_count ?? 0) > 0
              ? `${kpis?.active_memberships_count} membresías vigentes`
              : 'Personas en tu comunidad'
          }
          icon={<Users className="h-[13px] w-[13px] stroke-[1.9] text-[#22251f]" />}
          iconBgClass="bg-[#ffe0d8]"
        />
        <KpiCard
          index={2}
          loading={summaryQuery.isLoading}
          label="Pagos registrados"
          value={kpis?.monthly_payments_count ?? 0}
          subtitle="Movimientos de este mes"
          icon={<TrendingUp className="h-[13px] w-[13px] stroke-[1.9] text-[#22251f]" />}
          iconBgClass="bg-[#dceefa]"
        />
        <KpiCard
          index={3}
          loading={summaryQuery.isLoading}
          label="Próxima clase"
          value={
            <>
              {nextTimeParts[0]}{' '}
              <span className="font-sans text-[11px] font-semibold text-[#22251f]">
                {nextTimeParts[1] ?? ''}
              </span>
            </>
          }
          subtitle={
            kpis?.next_session
              ? `${kpis.next_session.workout_name} · ${kpis.next_session.room}`
              : 'Fuerza funcional · Sala Norte'
          }
          icon={<Clock className="h-[13px] w-[13px] stroke-[2] text-[#d3f36b]" />}
          iconBgClass="bg-[#252922]"
        />
      </section>

      <section className="mt-[14px] grid grid-cols-1 gap-[10px] sm:gap-[13px] lg:grid-cols-[minmax(0,1.65fr)_minmax(270px,0.95fr)]">
        <div className="min-w-0">
          <div className="min-w-0 overflow-hidden rounded-[3px] border border-[#e7e8e2] bg-white">
            <div className="flex min-h-[72px] items-center justify-between gap-3 px-[18px] py-[14px]">
              <div>
                <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
                  MOVIMIENTOS RECIENTES
                </span>
                <h3 className="font-display mt-1 text-[15px] leading-[1.2] font-semibold text-[#22251f]">
                  Ingresos por socio
                </h3>
              </div>
              <Link
                to="/socios"
                className="inline-flex items-center gap-1 py-1.5 pl-2 text-[10px] font-semibold whitespace-nowrap text-[#65685f] hover:text-[#22251f]"
              >
                Ver todos <span className="ml-0.5">→</span>
              </Link>
            </div>

            {summaryQuery.isLoading ? (
              <TableSkeleton rows={4} cols={6} />
            ) : (
              <>
                <PaymentsTable payments={recentPayments} />

                {recentPayments.length === 0 ? (
                  <div className="px-5 py-[24px] text-center text-[#73756e]">
                    <div
                      className="mx-auto mb-[10px] grid h-8 w-8 place-items-center rounded-full bg-[#d3f36b] text-[18px] leading-none text-[#22251f]"
                      aria-hidden="true"
                    >
                      +
                    </div>
                    <strong className="font-display block text-[14px] font-semibold text-[#22251f]">
                      Aún no hay ingresos
                    </strong>
                    <p className="mt-1.5 mb-3.5 text-[10px]">Registra el primer pago para empezar.</p>
                    <button
                      type="button"
                      onClick={() => setPaymentModalOpen(true)}
                      className="lobo-pressable mt-[3px] inline-flex min-h-[39px] items-center justify-center rounded-[3px] bg-[#22251f] px-[15px] text-[10px] font-bold text-white hover:bg-[#3b4037]"
                    >
                      Registrar ingreso
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <p className="mt-[13px] text-[9px] text-[#999b93]">
            Los registros se guardan en PostgreSQL vía Laravel API.
          </p>
        </div>

        <article className="flex min-w-0 flex-col justify-between rounded-[3px] border border-[#e7e8e2] bg-white">
          <div>
            <div className="flex min-h-[72px] items-center justify-between gap-3 px-[18px] py-[14px]">
              <div>
                <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
                  HOY EN LOBO
                </span>
                <h3 className="font-display mt-1 text-[15px] leading-[1.2] font-semibold text-[#22251f]">
                  Clases destacadas
                </h3>
              </div>
              <Link
                to="/horarios"
                aria-label="Ir a horarios"
                className="grid h-[31px] w-[31px] place-items-center rounded-[3px] border border-[#e8e9e3] bg-white text-[#22251f] hover:bg-[#f5f6f1]"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {summaryQuery.isLoading ? (
              <FeaturedSessionsSkeleton count={3} />
            ) : (
              <div className="px-[17px]">
                {featured.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-h-[62px] items-center gap-[10px] border-b border-[#eff0eb] last:border-b-0"
                  >
                    <div className="font-display tabular-nums flex w-[39px] shrink-0 flex-col text-[11px] font-semibold text-[#22251f]">
                      {item.time}
                      <small className="mt-0.5 font-sans text-[8px] font-semibold text-[#9c9e96]">
                        {item.period}
                      </small>
                    </div>
                    <span
                      className="h-[31px] w-[3px] shrink-0 rounded-[5px]"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <div className="grid min-w-0 gap-1">
                      <strong className="truncate text-[10px] font-bold text-[#363932]">
                        {item.name}
                      </strong>
                      <span className="text-[9px] text-[#999b93]">{item.meta}</span>
                    </div>
                    <span className="tabular-nums ml-auto text-[9px] whitespace-nowrap text-[#85877f]">
                      {item.ratio}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mx-[17px] mt-[7px] flex items-center justify-between border-t border-[#eff0eb] pt-3 pb-[13px] text-[9px] text-[#898b83]">
            <span>Más movimiento, mejores días.</span>
            <span className="text-[16px] leading-none text-[#a1c849]" aria-hidden="true">
              ✳
            </span>
          </div>
        </article>
      </section>

      <RegisterPaymentModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
    </div>
  );
}
