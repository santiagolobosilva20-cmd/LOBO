import { useState } from 'react';
import { DetailCardsGridSkeleton, staggerStyle } from '../../shared/components/Skeletons';
import { getMealSlotLabel, getNutritionGoalLabel } from '../../shared/utils/format';
import { useMemberNutritionQuery } from './memberQueries';

export function MemberNutritionPage() {
  const [scope, setScope] = useState<'mine' | 'templates'>('mine');
  const plansQuery = useMemberNutritionQuery(scope);
  const plans = plansQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="block text-[9px] font-bold tracking-[0.02em] text-[#8b8e84] uppercase">
            NUTRICIÓN DEPORTIVA
          </span>
          <h1 className="font-display mt-[7px] text-[24px] leading-[1.08] font-bold text-[#22251f] sm:text-[26px]">
            Mi alimentación
          </h1>
          <p className="mt-1.5 text-[11px] text-[#6d7067]">
            Metas calóricas, distribución de macronutrientes y menú por tiempos de comida.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-[3px] border border-[#e7e8e2] bg-white p-1">
          <button
            type="button"
            onClick={() => setScope('mine')}
            className={`rounded-[3px] px-3 py-1.5 text-[10px] font-bold ${
              scope === 'mine' ? 'bg-[#22251f] text-white' : 'text-[#686b63] hover:text-[#22251f]'
            }`}
          >
            Mi plan asignado
          </button>
          <button
            type="button"
            onClick={() => setScope('templates')}
            className={`rounded-[3px] px-3 py-1.5 text-[10px] font-bold ${
              scope === 'templates'
                ? 'bg-[#22251f] text-white'
                : 'text-[#686b63] hover:text-[#22251f]'
            }`}
          >
            Plantillas del club
          </button>
        </div>
      </div>

      {plansQuery.isLoading ? (
        <DetailCardsGridSkeleton variant="nutrition" count={2} />
      ) : plans.length === 0 ? (
        <div className="rounded-[3px] border border-[#e7e8e2] bg-white p-10 text-center text-[#73756e]">
          <strong className="font-display block text-[15px] font-semibold text-[#22251f]">
            {scope === 'mine'
              ? 'No tienes un plan nutricional asignado aún'
              : 'Sin plantillas nutricionales'}
          </strong>
          <p className="mt-1.5 text-[10px]">
            Consulta las plantillas base del club en la pestaña superior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-2">
          {plans.map((plan, idx) => {
            const totalMacros = Math.max(
              1,
              plan.protein_grams + plan.carbs_grams + plan.fats_grams,
            );
            const pPct = Math.round((plan.protein_grams / totalMacros) * 100);
            const cPct = Math.round((plan.carbs_grams / totalMacros) * 100);
            const fPct = Math.max(0, 100 - pPct - cPct);

            return (
              <article
                key={plan.id}
                style={staggerStyle(idx)}
                className="lobo-stagger-item overflow-hidden rounded-[3px] border border-[#e7e8e2] bg-white"
              >
                <div className="border-b border-[#f0f1ec] p-[18px]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="bg-[#d3f36b] px-2 py-0.5 text-[8px] font-bold text-[#22251f] uppercase">
                      {getNutritionGoalLabel(plan.goal)}
                    </span>
                    <span className="border border-[#e7e8e2] bg-[#f8f9f5] px-2 py-0.5 text-[8px] font-bold text-[#686b63] uppercase">
                      {plan.is_template ? 'Plantilla LOBO' : 'Asignado a ti'}
                    </span>
                  </div>
                  <h2 className="font-display mt-2 text-[18px] font-semibold text-[#22251f]">
                    {plan.title}
                  </h2>
                  <p className="tabular-nums mt-1 text-[10px] text-[#686b63]">
                    {plan.daily_calories.toLocaleString('en-US')} kcal/día · Agua: {plan.water_liters} L
                  </p>

                  <div className="mt-3">
                    <div className="flex h-2 w-full overflow-hidden rounded-[2px] bg-[#f0f1ec]">
                      <div style={{ width: `${pPct}%` }} className="bg-[#97bd42]" />
                      <div style={{ width: `${cPct}%` }} className="bg-[#64a8d1]" />
                      <div style={{ width: `${fPct}%` }} className="bg-[#ff8068]" />
                    </div>
                    <div className="tabular-nums mt-2 flex flex-wrap gap-3 text-[9px] text-[#5f6259]">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <i className="inline-block h-2 w-2 rounded-full bg-[#97bd42]" />
                        Proteína: {plan.protein_grams} g ({pPct}%)
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold">
                        <i className="inline-block h-2 w-2 rounded-full bg-[#64a8d1]" />
                        Carbos: {plan.carbs_grams} g ({cPct}%)
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold">
                        <i className="inline-block h-2 w-2 rounded-full bg-[#ff8068]" />
                        Grasas: {plan.fats_grams} g ({fPct}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[#f0f1ec]">
                  {plan.meals.map((meal) => (
                    <div key={meal.id} className="px-[18px] py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-bold text-[#8b8e84] uppercase">
                            {getMealSlotLabel(meal.meal_slot)}
                          </span>
                          <strong className="text-[11px] font-semibold text-[#22251f]">
                            {meal.title}
                          </strong>
                        </div>
                        <span className="tabular-nums text-[9px] font-bold text-[#686b63]">
                          {meal.calories} kcal · {meal.protein_grams}P/{meal.carbs_grams}C/
                          {meal.fats_grams}G
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-[#6d7067]">{meal.foods_summary}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

