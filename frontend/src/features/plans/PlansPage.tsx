import { useQuery } from '@tanstack/react-query';
import { Check, Clock, Plus, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { requestJson } from '../../shared/api/http';
import type { PaginatedResponse, PlanItem } from '../../shared/api/types';
import { RegisterPaymentModal } from '../billing/RegisterPaymentModal';

const DEFAULT_PLANS: PlanItem[] = [
  {
    id: 1,
    name: 'Pase diario',
    slug: 'pase-diario',
    tagline: '01 / A TU RITMO',
    price_cents: 12000,
    formatted_price: '$120',
    duration_days: 1,
    billing_period_label: 'día',
    description: 'Un día completo para conocer el club y entrenar sin límites.',
    features: ['Acceso por un día', 'Zona de peso libre', 'Cardio y vestidores'],
    is_featured: false,
    is_active: true,
    created_at: null,
    updated_at: null,
  },
  {
    id: 2,
    name: 'Mensualidad',
    slug: 'mensualidad',
    tagline: '02 / FAVORITO LOBO',
    price_cents: 89000,
    formatted_price: '$890',
    duration_days: 30,
    billing_period_label: 'mes',
    description: 'Entrena a tu horario, tantas veces como quieras.',
    features: ['Acceso ilimitado', 'Clases grupales incluidas', 'Evaluación inicial'],
    is_featured: true,
    is_active: true,
    created_at: null,
    updated_at: null,
  },
  {
    id: 3,
    name: 'Trimestral',
    slug: 'trimestral',
    tagline: '03 / EN EQUIPO',
    price_cents: 235000,
    formatted_price: '$2,350',
    duration_days: 90,
    billing_period_label: '3 meses',
    description: 'Tres meses para convertir el progreso en hábito.',
    features: ['Todo lo del plan mensual', 'Plan de entrenamiento', 'Una sesión de seguimiento'],
    is_featured: false,
    is_active: true,
    created_at: null,
    updated_at: null,
  },
];

export function PlansPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const plansQuery = useQuery({
    queryKey: ['plans'],
    queryFn: () => requestJson<PaginatedResponse<PlanItem>>('/plans?per_page=50&active_only=1'),
    retry: false,
  });

  const plans = plansQuery.data?.data?.length ? plansQuery.data.data : DEFAULT_PLANS;

  const openModalForPlan = (planId: number | null = null) => {
    setSelectedPlanId(planId);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
            Entrena a tu manera
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#17191C] sm:text-3xl">
            Planes y precios
          </h1>
          <p className="mt-1 text-xs text-[#6B7280] sm:text-sm">
            Opciones claras para mantenerte en movimiento.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModalForPlan(null)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#CEF542] px-4 py-2.5 text-xs font-bold text-[#17191C] hover:bg-[#C1EA2C]"
        >
          <Plus className="h-4 w-4" />
          Registrar ingreso
        </button>
      </div>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const isDark = plan.is_featured;
          const IconComponent = isDark ? Sparkles : index === 0 ? Clock : Users;

          return (
            <article
              key={plan.id}
              onClick={() => openModalForPlan(plan.id)}
              className={`cursor-pointer rounded-2xl border p-6 transition-transform hover:-translate-y-0.5 ${
                isDark
                  ? 'border-[#1E2118] bg-[#1D2016] text-white'
                  : 'border-[#E6E7E2] bg-white text-[#17191C]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-semibold tracking-wider uppercase ${
                    isDark ? 'text-[#CEF542]' : 'text-[#9CA3AF]'
                  }`}
                >
                  {plan.tagline ?? `0${index + 1} / PLAN LOBO`}
                </span>
                {isDark ? (
                  <span className="text-[10px] font-bold tracking-wider text-[#CEF542] uppercase">
                    Más elegido
                  </span>
                ) : null}
              </div>

              <div
                className={`mt-5 flex h-9 w-9 items-center justify-center rounded-full ${
                  isDark
                    ? 'bg-[#CEF542] text-[#17191C]'
                    : index === 0
                      ? 'bg-[#EEF8D6] text-[#17191C]'
                      : 'bg-sky-50 text-sky-700'
                }`}
              >
                <IconComponent className="h-4 w-4" />
              </div>

              <h2 className="mt-5 text-xl font-bold">{plan.name}</h2>
              {plan.description ? (
                <p className={`mt-1 text-xs ${isDark ? 'text-gray-300' : 'text-[#6B7280]'}`}>
                  {plan.description}
                </p>
              ) : null}

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="tabular-nums text-4xl font-extrabold tracking-tight">
                  {plan.formatted_price}
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                  / {plan.billing_period_label}
                </span>
              </div>

              <div
                className={`my-5 h-px w-full ${isDark ? 'bg-white/10' : 'bg-[#F0F1EC]'}`}
                aria-hidden="true"
              />

              <ul className="space-y-2.5 text-xs">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5">
                    <Check
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isDark ? 'text-[#CEF542]' : 'text-emerald-600'
                      }`}
                    />
                    <span className={isDark ? 'text-gray-200' : 'text-[#4B5563]'}>{feat}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <p className="text-[11px] text-[#9CA3AF]">
        Registra el pago de cada socio desde &quot;Registrar ingreso&quot;.
      </p>

      <RegisterPaymentModal
        open={modalOpen}
        defaultPlanId={selectedPlanId}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
