import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ApiError, requestJson } from '../../shared/api/http';
import type {
  MealSlot,
  NutritionGoal,
  NutritionPlanItem,
  PaginatedResponse,
  SingleResponse,
} from '../../shared/api/types';
import { AssignMemberModal } from '../../shared/components/AssignMemberModal';
import { useToast } from '../../shared/components/ToastContext';
import { getMealSlotLabel, getNutritionGoalLabel } from '../../shared/utils/format';

interface MealDraft {
  meal_slot: MealSlot;
  title: string;
  foods_summary: string;
  calories: string;
  protein_grams: string;
  carbs_grams: string;
  fats_grams: string;
}

const GOAL_FILTERS: Array<{ value: '' | NutritionGoal; label: string }> = [
  { value: '', label: 'Todos los objetivos' },
  { value: 'fat_loss', label: 'Déficit' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'muscle_gain', label: 'Volumen' },
  { value: 'performance', label: 'Rendimiento' },
];

const EMPTY_MEAL = (): MealDraft => ({
  meal_slot: 'breakfast',
  title: '',
  foods_summary: '',
  calories: '450',
  protein_grams: '35',
  carbs_grams: '45',
  fats_grams: '12',
});

export function NutritionPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [scope, setScope] = useState<'all' | 'templates' | 'assigned'>('all');
  const [goalFilter, setGoalFilter] = useState<'' | NutritionGoal>('');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<NutritionPlanItem | null>(null);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState<NutritionGoal>('maintenance');
  const [dailyCalories, setDailyCalories] = useState('2200');
  const [proteinGrams, setProteinGrams] = useState('160');
  const [carbsGrams, setCarbsGrams] = useState('240');
  const [fatsGrams, setFatsGrams] = useState('68');
  const [waterLiters, setWaterLiters] = useState('3.0');
  const [memberName, setMemberName] = useState('');
  const [notes, setNotes] = useState('');
  const [meals, setMeals] = useState<MealDraft[]>([EMPTY_MEAL()]);
  const [formError, setFormError] = useState('');

  const [assignTarget, setAssignTarget] = useState<NutritionPlanItem | null>(null);
  const [assignError, setAssignError] = useState('');

  const plansQuery = useQuery({
    queryKey: ['nutrition', { scope, goalFilter, search }],
    queryFn: () => {
      const params = new URLSearchParams({ per_page: '50' });
      if (scope === 'templates') params.set('is_template', '1');
      if (scope === 'assigned') params.set('is_template', '0');
      if (goalFilter !== '') params.set('goal', goalFilter);
      if (search.trim() !== '') params.set('search', search.trim());
      return requestJson<PaginatedResponse<NutritionPlanItem>>(
        `/nutrition/plans?${params.toString()}`,
      );
    },
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: title.trim(),
        goal,
        daily_calories: Number(dailyCalories) || 2000,
        protein_grams: Number(proteinGrams) || 150,
        carbs_grams: Number(carbsGrams) || 200,
        fats_grams: Number(fatsGrams) || 65,
        water_liters: Number.parseFloat(waterLiters) || 2.5,
        is_template: memberName.trim() === '',
        member_name: memberName.trim() !== '' ? memberName.trim() : null,
        notes: notes.trim() !== '' ? notes.trim() : null,
        meals: meals
          .filter((meal) => meal.title.trim() !== '' && meal.foods_summary.trim() !== '')
          .map((meal, idx) => ({
            meal_slot: meal.meal_slot,
            title: meal.title.trim(),
            foods_summary: meal.foods_summary.trim(),
            calories: Number(meal.calories) || 0,
            protein_grams: Number(meal.protein_grams) || 0,
            carbs_grams: Number(meal.carbs_grams) || 0,
            fats_grams: Number(meal.fats_grams) || 0,
            sort_order: idx + 1,
          })),
      };

      return editingPlan
        ? requestJson<SingleResponse<NutritionPlanItem>>(`/nutrition/plans/${editingPlan.id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        : requestJson<SingleResponse<NutritionPlanItem>>('/nutrition/plans', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['nutrition'] });
      showToast(
        editingPlan
          ? `Plan "${res.data.title}" actualizado.`
          : `Plan "${res.data.title}" guardado.`,
      );
      setFormOpen(false);
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el plan alimenticio.');
    },
  });

  const assignMutation = useMutation({
    mutationFn: (targetMemberName: string) => {
      if (!assignTarget) throw new Error('Sin plan seleccionado');
      return requestJson<SingleResponse<NutritionPlanItem>>(
        `/nutrition/plans/${assignTarget.id}/assign`,
        {
          method: 'POST',
          body: JSON.stringify({ member_name: targetMemberName }),
        },
      );
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['nutrition'] });
      await queryClient.invalidateQueries({ queryKey: ['members'] });
      showToast(`Plan asignado a ${res.data.member_name ?? 'socio'}.`);
      setAssignTarget(null);
      setAssignError('');
    },
    onError: (err) => {
      setAssignError(err instanceof ApiError ? err.message : 'No se pudo asignar el plan.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (planId: number) =>
      requestJson<void>(`/nutrition/plans/${planId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['nutrition'] });
      showToast('Plan nutricional eliminado.');
    },
  });

  const openCreateModal = () => {
    setEditingPlan(null);
    setTitle('');
    setGoal('maintenance');
    setDailyCalories('2200');
    setProteinGrams('160');
    setCarbsGrams('240');
    setFatsGrams('68');
    setWaterLiters('3.0');
    setMemberName('');
    setNotes('');
    setMeals([EMPTY_MEAL()]);
    setFormError('');
    setFormOpen(true);
  };

  const openEditModal = (plan: NutritionPlanItem) => {
    setEditingPlan(plan);
    setTitle(plan.title);
    setGoal(plan.goal);
    setDailyCalories(String(plan.daily_calories));
    setProteinGrams(String(plan.protein_grams));
    setCarbsGrams(String(plan.carbs_grams));
    setFatsGrams(String(plan.fats_grams));
    setWaterLiters(String(plan.water_liters));
    setMemberName(plan.member_name ?? '');
    setNotes(plan.notes ?? '');
    setMeals(
      plan.meals.length > 0
        ? plan.meals.map((meal) => ({
            meal_slot: meal.meal_slot,
            title: meal.title,
            foods_summary: meal.foods_summary,
            calories: String(meal.calories),
            protein_grams: String(meal.protein_grams),
            carbs_grams: String(meal.carbs_grams),
            fats_grams: String(meal.fats_grams),
          }))
        : [EMPTY_MEAL()],
    );
    setFormError('');
    setFormOpen(true);
  };

  const handleSaveSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (title.trim().length < 2) {
      setFormError('Ingresa un título para el plan nutricional.');
      return;
    }
    saveMutation.mutate();
  };

  const plans = plansQuery.data?.data ?? [];

  return (
    <div>
      <div className="mt-[9px] mb-[19px] flex flex-wrap items-end justify-between gap-[18px] md:mt-3 md:mb-6">
        <div>
          <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
            NUTRICIÓN DEPORTIVA
          </span>
          <h1 className="font-display mt-[7px] text-[25px] leading-[1.15] font-semibold text-[#22251f] sm:text-[29px]">
            Alimentación
          </h1>
          <p className="mt-[7px] max-w-[340px] text-[11px] leading-normal text-[#83857d] sm:max-w-none">
            Metas calóricas, macronutrientes diarios y menú por tiempos de comida.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex min-h-[39px] items-center justify-center gap-[9px] rounded-[3px] bg-[#d3f36b] px-[15px] text-[10px] font-bold text-[#22251f] transition-all hover:-translate-y-px hover:bg-[#c5eb50]"
        >
          <span className="text-[15px] leading-none">＋</span> Nuevo plan nutricional
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-[#e7e8e2] bg-white px-[18px] py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'templates', label: 'Plantillas del club' },
            { key: 'assigned', label: 'Asignados a socios' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setScope(tab.key as 'all' | 'templates' | 'assigned')}
              className={`rounded-[3px] px-3 py-1.5 text-[10px] font-bold transition-colors ${
                scope === tab.key
                  ? 'bg-[#22251f] text-white'
                  : 'bg-[#f8f9f5] text-[#686b63] hover:text-[#22251f]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filtrar por objetivo nutricional"
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value as '' | NutritionGoal)}
            className="h-[34px] rounded-[3px] border border-[#e7e8e2] bg-white px-2.5 text-[10px] text-[#22251f] outline-none focus:border-[#97bd42]"
          >
            {GOAL_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar plan o socio..."
            aria-label="Buscar plan nutricional"
            className="h-[34px] w-full rounded-[3px] border border-[#e7e8e2] px-3 text-[10px] text-[#22251f] outline-none focus:border-[#97bd42] sm:w-[210px]"
          />
        </div>
      </div>

      {plansQuery.isLoading ? (
        <div className="rounded-[3px] border border-[#e7e8e2] bg-white py-12 text-center text-[11px] text-[#73756e]">
          Cargando planes alimenticios...
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-[3px] border border-[#e7e8e2] bg-white px-5 py-12 text-center text-[#73756e]">
          <strong className="font-display block text-[14px] font-semibold text-[#22251f]">
            No hay planes nutricionales
          </strong>
          <p className="mt-1.5 mb-3.5 text-[10px]">Crea un plan diario con sus macros y tiempos de comida.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex min-h-[39px] items-center justify-center rounded-[3px] bg-[#22251f] px-[15px] text-[10px] font-bold text-white"
          >
            Crear plan nutricional
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-[14px] lg:grid-cols-2">
          {plans.map((plan) => {
            const totalMacroGrams = Math.max(
              1,
              plan.protein_grams + plan.carbs_grams + plan.fats_grams,
            );
            const pPct = Math.round((plan.protein_grams / totalMacroGrams) * 100);
            const cPct = Math.round((plan.carbs_grams / totalMacroGrams) * 100);
            const fPct = Math.max(0, 100 - pPct - cPct);

            return (
              <article
                key={plan.id}
                className="flex flex-col justify-between overflow-hidden rounded-[3px] border border-[#e7e8e2] bg-white"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 px-[18px] pt-[18px] pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="bg-[#d3f36b] px-2 py-0.5 text-[8px] font-bold text-[#22251f] uppercase">
                          {getNutritionGoalLabel(plan.goal)}
                        </span>
                        <span className="border border-[#e7e8e2] bg-[#f8f9f5] px-2 py-0.5 text-[8px] font-bold text-[#686b63] uppercase">
                          {plan.member_name ? `SOCIO: ${plan.member_name}` : 'PLANTILLA LOBO'}
                        </span>
                      </div>
                      <h2 className="font-display mt-2 text-[17px] font-semibold text-[#22251f]">
                        {plan.title}
                      </h2>
                      <p className="tabular-nums mt-0.5 text-[10px] text-[#85877f]">
                        {plan.daily_calories.toLocaleString('es-MX')} kcal/día · Agua:{' '}
                        {plan.water_liters.toFixed(1)} L
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAssignTarget(plan);
                          setAssignError('');
                        }}
                        className="inline-flex h-[30px] items-center gap-1 rounded-[3px] border border-[#e7e8e2] bg-white px-2 text-[9px] font-bold text-[#22251f] hover:bg-[#d3f36b]"
                      >
                        <UserPlus className="h-3 w-3" />
                        Asignar
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(plan)}
                        aria-label={`Editar ${plan.title}`}
                        className="grid h-[30px] w-[30px] place-items-center rounded-[3px] border border-[#e7e8e2] text-[#686b63] hover:bg-[#f5f6f1] hover:text-[#22251f]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(plan.id)}
                        aria-label={`Eliminar ${plan.title}`}
                        className="grid h-[30px] w-[30px] place-items-center rounded-[3px] border border-[#e7e8e2] text-[#85877f] hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="px-[18px] pb-3.5">
                    <div className="flex h-2 w-full overflow-hidden rounded-[2px] bg-[#eff0eb]">
                      <div style={{ width: `${pPct}%` }} className="bg-[#a1c849]" />
                      <div style={{ width: `${cPct}%` }} className="bg-[#78b9e5]" />
                      <div style={{ width: `${fPct}%` }} className="bg-[#ff8068]" />
                    </div>
                    <div className="tabular-nums mt-2 flex flex-wrap gap-4 text-[9px] font-semibold text-[#5f6259]">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#a1c849]" />
                        Proteína: {plan.protein_grams} g ({pPct}%)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#78b9e5]" />
                        Carbos: {plan.carbs_grams} g ({cPct}%)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#ff8068]" />
                        Grasas: {plan.fats_grams} g ({fPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[#eff0eb]">
                    <div className="bg-[#f8f9f5] px-[18px] py-1.5 text-[8px] font-bold text-[#92948c] uppercase">
                      Menú diario ({plan.meals.length} tiempos)
                    </div>
                    <ul className="divide-y divide-[#eff0eb]">
                      {plan.meals.map((meal) => (
                        <li key={meal.id} className="px-[18px] py-2.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <div>
                              <span className="mr-2 text-[8px] font-bold text-[#8b8e84] uppercase">
                                {getMealSlotLabel(meal.meal_slot)}
                              </span>
                              <strong className="text-[10px] font-bold text-[#22251f]">
                                {meal.title}
                              </strong>
                            </div>
                            <span className="tabular-nums shrink-0 text-[9px] font-semibold text-[#686b63]">
                              {meal.calories} kcal · {meal.protein_grams}P/{meal.carbs_grams}C/
                              {meal.fats_grams}G
                            </span>
                          </div>
                          <p className="mt-1 text-[9px] text-[#73756e]">{meal.foods_summary}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {formOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c201b]/75 p-3.5 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              onClick={(e) => {
                if (e.target === e.currentTarget) setFormOpen(false);
              }}
            >
              <div className="max-h-[90vh] w-[min(640px,100%)] overflow-y-auto rounded-[4px] bg-white p-6 shadow-[0_20px_70px_rgba(23,26,22,0.44)]">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
                      NUTRICIÓN LOBO
                    </span>
                    <h2 className="font-display mt-1 text-[21px] font-semibold text-[#22251f]">
                      {editingPlan ? 'Editar plan nutricional' : 'Nuevo plan nutricional'}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    aria-label="Cerrar"
                    className="grid h-[31px] w-[31px] place-items-center rounded-[3px] border border-[#e8e9e3] text-[20px] text-[#22251f]"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSaveSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Título</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej. Definición 1,900 kcal"
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Socio asignado (opcional, vacío = plantilla)
                      </label>
                      <input
                        type="text"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        placeholder="Ej. Alex Rivera"
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
                    <div className="col-span-2 sm:col-span-2">
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Objetivo</label>
                      <select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value as NutritionGoal)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-2 text-[11px]"
                      >
                        <option value="fat_loss">Déficit</option>
                        <option value="maintenance">Mantenimiento</option>
                        <option value="muscle_gain">Volumen</option>
                        <option value="performance">Rendimiento</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Kcal</label>
                      <input
                        type="number"
                        min={800}
                        max={8000}
                        value={dailyCalories}
                        onChange={(e) => setDailyCalories(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Prot (g)</label>
                      <input
                        type="number"
                        min={20}
                        value={proteinGrams}
                        onChange={(e) => setProteinGrams(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Carb (g)</label>
                      <input
                        type="number"
                        min={10}
                        value={carbsGrams}
                        onChange={(e) => setCarbsGrams(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Gras (g)</label>
                      <input
                        type="number"
                        min={10}
                        value={fatsGrams}
                        onChange={(e) => setFatsGrams(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2 text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Agua (L)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="10"
                        value={waterLiters}
                        onChange={(e) => setWaterLiters(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Notas</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Indicaciones o suplementación sugerida"
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#e8e9e3] pt-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#22251f] uppercase">
                        Tiempos de comida ({meals.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setMeals((prev) => [...prev, EMPTY_MEAL()])}
                        className="rounded-[3px] border border-[#e8e9e3] bg-[#f8f9f5] px-2.5 py-1 text-[9px] font-bold text-[#22251f] hover:bg-[#d3f36b]"
                      >
                        + Agregar comida
                      </button>
                    </div>

                    <div className="space-y-2">
                      {meals.map((meal, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-12 gap-2 rounded-[3px] border border-[#eff0eb] bg-[#fafbf8] p-2"
                        >
                          <select
                            value={meal.meal_slot}
                            onChange={(e) =>
                              setMeals((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...row, meal_slot: e.target.value as MealSlot } : row,
                                ),
                              )
                            }
                            className="col-span-4 rounded-[3px] border border-[#e2e4dc] bg-white px-2 py-1.5 text-[10px]"
                          >
                            <option value="breakfast">Desayuno</option>
                            <option value="mid_morning">Media mañana</option>
                            <option value="lunch">Almuerzo</option>
                            <option value="snack">Merienda</option>
                            <option value="dinner">Cena</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Nombre del platillo"
                            value={meal.title}
                            onChange={(e) =>
                              setMeals((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...row, title: e.target.value } : row,
                                ),
                              )
                            }
                            className="col-span-7 rounded-[3px] border border-[#e2e4dc] bg-white px-2 py-1.5 text-[10px]"
                          />
                          <button
                            type="button"
                            disabled={meals.length <= 1}
                            onClick={() => setMeals((prev) => prev.filter((_, i) => i !== idx))}
                            className="col-span-1 text-[12px] text-[#85877f] hover:text-red-700 disabled:opacity-30"
                          >
                            ×
                          </button>
                          <input
                            type="text"
                            placeholder="Alimentos y gramajes (ej. 180 g pechuga, 150 g arroz)"
                            value={meal.foods_summary}
                            onChange={(e) =>
                              setMeals((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...row, foods_summary: e.target.value } : row,
                                ),
                              )
                            }
                            className="col-span-8 rounded-[3px] border border-[#e2e4dc] bg-white px-2 py-1.5 text-[10px]"
                          />
                          <input
                            type="number"
                            min={0}
                            placeholder="Kcal"
                            value={meal.calories}
                            onChange={(e) =>
                              setMeals((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...row, calories: e.target.value } : row,
                                ),
                              )
                            }
                            className="col-span-4 rounded-[3px] border border-[#e2e4dc] bg-white px-2 py-1.5 text-[10px]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {formError ? <p className="text-[11px] font-medium text-red-600">{formError}</p> : null}

                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="flex min-h-[39px] w-full items-center rounded-[3px] bg-[#22251f] px-[15px] text-[10px] font-bold text-white hover:bg-[#3b4037] disabled:opacity-50"
                  >
                    <span>{saveMutation.isPending ? 'Guardando...' : 'Guardar plan nutricional'}</span>
                    <span className="ml-auto text-[15px]">→</span>
                  </button>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      <AssignMemberModal
        open={assignTarget !== null}
        eyebrow="ASIGNAR PLAN ALIMENTICIO"
        title={assignTarget?.title ?? ''}
        submitLabel="Asignar plan"
        isPending={assignMutation.isPending}
        errorMsg={assignError}
        onClose={() => setAssignTarget(null)}
        onSubmit={(targetMemberName) => assignMutation.mutate(targetMemberName)}
      />
    </div>
  );
}

