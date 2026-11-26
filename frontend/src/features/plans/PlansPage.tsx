import { useQuery } from '@tanstack/react-query';
import { Clock, Sparkles, Users } from 'lucide-react';
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
    <div>
      <div className="mt-[9px] mb-[19px] flex flex-wrap items-end justify-between gap-[18px] md:mt-3 md:mb-6">
        <div>
          <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
            ENTRENA A TU MANERA
          </span>
          <h1 className="font-display mt-[7px] text-[25px] leading-[1.15] font-semibold text-[#22251f] sm:text-[29px]">
            Planes y precios
          </h1>
          <p className="mt-[7px] max-w-[240px] text-[11px] leading-normal text-[#83857d] sm:max-w-none">
            Opciones claras para mantenerte en movimiento.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModalForPlan(null)}
          className="inline-flex min-h-[39px] items-center justify-center gap-[9px] rounded-[3px] bg-[#d3f36b] px-[15px] text-[10px] font-bold text-[#22251f] transition-all hover:-translate-y-px hover:bg-[#c5eb50]"
        >
          <span className="text-[15px] leading-none">＋</span> Registrar ingreso
        </button>
      </div>

      <section className="grid grid-cols-1 gap-[14px] lg:grid-cols-3">
        {plans.map((plan, index) => {
          const isDark = plan.is_featured;
          const IconComponent = isDark ? Sparkles : index === 0 ? Clock : Users;
          const symbolBg = isDark
            ? 'bg-[#d3f36b]'
            : index % 3 === 2
              ? 'bg-[#dceefa]'
              : 'bg-[#eef5d9]';

          return (
            <article
              key={plan.id}
              onClick={() => openModalForPlan(plan.id)}
              className={`relative min-h-[300px] cursor-pointer border p-[21px] transition-colors md:min-h-[332px] ${
                isDark
                  ? 'border-[#242820] bg-[#252922] text-white'
                  : 'border-[#e7e8e2] bg-white text-[#22251f] hover:border-[#d5d7cf]'
              }`}
            >
              <span
                className={`block text-[8px] font-bold uppercase ${
                  isDark ? 'text-[#d3f36b]' : 'text-[#898b83]'
                }`}
              >
                {plan.tagline ?? `0${index + 1} / PLAN LOBO`}
              </span>

              {isDark ? (
                <span className="absolute top-[21px] right-[17px] text-[7px] font-bold text-[#d3f36b] uppercase">
                  MÁS ELEGIDO
                </span>
              ) : null}

              <div
                className={`mt-6 mb-[15px] grid h-[39px] w-[39px] place-items-center rounded-full text-[#22251f] ${symbolBg}`}
                aria-hidden="true"
              >
                <IconComponent className="h-[18px] w-[18px] stroke-[1.7]" />
              </div>

              <h2 className="font-display mb-[7px] text-[19px] font-semibold">{plan.name}</h2>
              {plan.description ? (
                <p
                  className={`min-h-[32px] text-[10px] leading-[1.6] ${
                    isDark ? 'text-[#c4c6bf]' : 'text-[#85877f]'
                  }`}
                >
                  {plan.description}
                </p>
              ) : null}

              <div className="my-[15px] mb-[13px] flex items-baseline gap-[5px]">
                <strong className="font-display tabular-nums text-[26px] font-semibold">
                  {plan.formatted_price}
                </strong>
                <span className="text-[9px] text-[#92948c]">/ {plan.billing_period_label}</span>
              </div>

              <div
                className={`h-px w-full ${isDark ? 'bg-[#464941]' : 'bg-[#e8e9e3]'}`}
                aria-hidden="true"
              />

              <ul
                className={`mt-4 grid gap-[10px] p-0 text-[9px] list-none ${
                  isDark ? 'text-[#dedfd9]' : 'text-[#72746d]'
                }`}
              >
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center">
                    <span className="mr-2 font-bold text-[#8db33b]" aria-hidden="true">
                      ✓
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <p className="mt-[13px] text-[9px] text-[#999b93]">
        Registra el pago de cada socio desde &ldquo;Registrar ingreso&rdquo;.
      </p>

      <RegisterPaymentModal
        open={modalOpen}
        defaultPlanId={selectedPlanId}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
