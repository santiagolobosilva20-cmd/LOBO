import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ApiError, requestJson } from '../../shared/api/http';
import type {
  PaginatedResponse,
  RoutineGoal,
  RoutineItem,
  SingleResponse,
  WorkoutLevel,
} from '../../shared/api/types';
import { useToast } from '../../shared/components/ToastContext';
import { getRoutineGoalLabel, getWorkoutLevelLabel } from '../../shared/utils/format';
import { AssignMemberModal } from '../../shared/components/AssignMemberModal';
import { DetailCardsGridSkeleton, staggerStyle } from '../../shared/components/Skeletons';

interface ExerciseDraft {
  day_label: string;
  exercise_name: string;
  sets: string;
  reps: string;
  target_weight: string;
  rest_seconds: string;
}

const GOAL_FILTERS: Array<{ value: '' | RoutineGoal; label: string }> = [
  { value: '', label: 'Todos los objetivos' },
  { value: 'strength', label: 'Fuerza' },
  { value: 'hypertrophy', label: 'Hipertrofia' },
  { value: 'fat_loss', label: 'Definición' },
  { value: 'endurance', label: 'Resistencia' },
  { value: 'mobility', label: 'Movilidad' },
];

const EMPTY_EXERCISE = (): ExerciseDraft => ({
  day_label: 'Día 1 · Principal',
  exercise_name: '',
  sets: '4',
  reps: '8-12',
  target_weight: '',
  rest_seconds: '60',
});

export function RoutinesPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [scope, setScope] = useState<'all' | 'templates' | 'assigned'>('all');
  const [goalFilter, setGoalFilter] = useState<'' | RoutineGoal>('');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineItem | null>(null);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState<RoutineGoal>('hypertrophy');
  const [level, setLevel] = useState<WorkoutLevel>('all_levels');
  const [daysPerWeek, setDaysPerWeek] = useState('4');
  const [estimatedMinutes, setEstimatedMinutes] = useState('50');
  const [memberName, setMemberName] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ExerciseDraft[]>([EMPTY_EXERCISE()]);
  const [formError, setFormError] = useState('');

  const [assignTarget, setAssignTarget] = useState<RoutineItem | null>(null);
  const [assignError, setAssignError] = useState('');

  const routinesQuery = useQuery({
    queryKey: ['routines', { scope, goalFilter, search }],
    queryFn: () => {
      const params = new URLSearchParams({ per_page: '50' });
      if (scope === 'templates') params.set('is_template', '1');
      if (scope === 'assigned') params.set('is_template', '0');
      if (goalFilter !== '') params.set('goal', goalFilter);
      if (search.trim() !== '') params.set('search', search.trim());
      return requestJson<PaginatedResponse<RoutineItem>>(`/routines?${params.toString()}`);
    },
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: title.trim(),
        goal,
        level,
        days_per_week: Number(daysPerWeek) || 4,
        estimated_minutes: Number(estimatedMinutes) || 50,
        is_template: memberName.trim() === '',
        member_name: memberName.trim() !== '' ? memberName.trim() : null,
        notes: notes.trim() !== '' ? notes.trim() : null,
        exercises: exercises
          .filter((ex) => ex.exercise_name.trim() !== '')
          .map((ex, idx) => ({
            day_label: ex.day_label.trim() || 'Día 1',
            exercise_name: ex.exercise_name.trim(),
            sets: Number(ex.sets) || 3,
            reps: ex.reps.trim() || '10',
            target_weight: ex.target_weight.trim() !== '' ? ex.target_weight.trim() : null,
            rest_seconds: Number(ex.rest_seconds) || 60,
            sort_order: idx + 1,
          })),
      };

      return editingRoutine
        ? requestJson<SingleResponse<RoutineItem>>(`/routines/${editingRoutine.id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        : requestJson<SingleResponse<RoutineItem>>('/routines', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['routines'] });
      showToast(
        editingRoutine
          ? `Rutina "${res.data.title}" actualizada.`
          : `Rutina "${res.data.title}" guardada.`,
      );
      setFormOpen(false);
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar la rutina.');
    },
  });

  const assignMutation = useMutation({
    mutationFn: (targetMemberName: string) => {
      if (!assignTarget) throw new Error('Sin rutina seleccionada');
      return requestJson<SingleResponse<RoutineItem>>(`/routines/${assignTarget.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ member_name: targetMemberName }),
      });
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['routines'] });
      await queryClient.invalidateQueries({ queryKey: ['members'] });
      showToast(`Rutina asignada a ${res.data.member_name ?? 'socio'}.`);
      setAssignTarget(null);
      setAssignError('');
    },
    onError: (err) => {
      setAssignError(err instanceof ApiError ? err.message : 'No se pudo asignar la rutina.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (routineId: number) => requestJson<void>(`/routines/${routineId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['routines'] });
      showToast('Rutina eliminada.');
    },
  });

  const openCreateModal = () => {
    setEditingRoutine(null);
    setTitle('');
    setGoal('hypertrophy');
    setLevel('all_levels');
    setDaysPerWeek('4');
    setEstimatedMinutes('50');
    setMemberName('');
    setNotes('');
    setExercises([EMPTY_EXERCISE()]);
    setFormError('');
    setFormOpen(true);
  };

  const openEditModal = (routine: RoutineItem) => {
    setEditingRoutine(routine);
    setTitle(routine.title);
    setGoal(routine.goal);
    setLevel(routine.level);
    setDaysPerWeek(String(routine.days_per_week));
    setEstimatedMinutes(String(routine.estimated_minutes));
    setMemberName(routine.member_name ?? '');
    setNotes(routine.notes ?? '');
    setExercises(
      routine.exercises.length > 0
        ? routine.exercises.map((ex) => ({
            day_label: ex.day_label,
            exercise_name: ex.exercise_name,
            sets: String(ex.sets),
            reps: ex.reps,
            target_weight: ex.target_weight ?? '',
            rest_seconds: String(ex.rest_seconds),
          }))
        : [EMPTY_EXERCISE()],
    );
    setFormError('');
    setFormOpen(true);
  };

  const handleSaveSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (title.trim().length < 2) {
      setFormError('Ingresa un nombre válido para la rutina.');
      return;
    }
    saveMutation.mutate();
  };

  const routines = routinesQuery.data?.data ?? [];

  return (
    <div>
      <div className="mt-[9px] mb-[19px] flex flex-wrap items-end justify-between gap-[18px] md:mt-3 md:mb-6">
        <div>
          <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
            PLANIFICACIÓN TÉCNICA
          </span>
          <h1 className="font-display mt-[7px] text-[25px] leading-[1.15] font-semibold text-[#22251f] sm:text-[29px]">
            Rutinas de entrenamiento
          </h1>
          <p className="mt-[7px] max-w-[340px] text-[11px] leading-normal text-[#83857d] sm:max-w-none">
            Organiza bloques por día, series, repeticiones y asígnalos a cada socio.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="lobo-pressable inline-flex min-h-[39px] items-center justify-center gap-[9px] rounded-[3px] bg-[#d3f36b] px-[15px] text-[10px] font-bold text-[#22251f] hover:bg-[#c5eb50]"
        >
          <span className="text-[15px] leading-none">＋</span> Nueva rutina
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-[#e7e8e2] bg-white px-[18px] py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'templates', label: 'Plantillas del club' },
            { key: 'assigned', label: 'Asignadas a socios' },
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
            aria-label="Filtrar por objetivo"
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value as '' | RoutineGoal)}
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
            placeholder="Buscar rutina o socio..."
            aria-label="Buscar rutina"
            className="h-[34px] w-full rounded-[3px] border border-[#e7e8e2] px-3 text-[10px] text-[#22251f] outline-none focus:border-[#97bd42] sm:w-[210px]"
          />
        </div>
      </div>

      {routinesQuery.isLoading ? (
        <DetailCardsGridSkeleton variant="routine" count={2} />
      ) : routines.length === 0 ? (
        <div className="rounded-[3px] border border-[#e7e8e2] bg-white px-5 py-12 text-center text-[#73756e]">
          <strong className="font-display block text-[14px] font-semibold text-[#22251f]">
            No hay rutinas registradas
          </strong>
          <p className="mt-1.5 mb-3.5 text-[10px]">Crea la primera rutina del club o ajusta los filtros.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="lobo-pressable inline-flex min-h-[39px] items-center justify-center rounded-[3px] bg-[#22251f] px-[15px] text-[10px] font-bold text-white"
          >
            Crear rutina
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-[13px] lg:grid-cols-2">
          {routines.map((routine, idx) => (
            <article
              key={routine.id}
              style={staggerStyle(idx)}
              className="lobo-stagger-item flex flex-col justify-between overflow-hidden rounded-[3px] border border-[#e7e8e2] bg-white"
            >
              <div>
                <div className="flex items-start justify-between gap-3 px-[18px] pt-[18px] pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-[#d3f36b] px-2 py-0.5 text-[8px] font-bold text-[#22251f] uppercase">
                        {getRoutineGoalLabel(routine.goal)}
                      </span>
                      <span className="border border-[#e7e8e2] bg-[#f8f9f5] px-2 py-0.5 text-[8px] font-bold text-[#686b63] uppercase">
                        {routine.member_name ? `SOCIO: ${routine.member_name}` : 'PLANTILLA LOBO'}
                      </span>
                    </div>
                    <h2 className="font-display mt-2 text-[17px] font-semibold text-[#22251f]">
                      {routine.title}
                    </h2>
                    <p className="mt-0.5 text-[10px] text-[#85877f]">
                      {getWorkoutLevelLabel(routine.level)} · {routine.days_per_week} días/sem ·{' '}
                      {routine.estimated_minutes} min
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAssignTarget(routine);
                        setAssignError('');
                      }}
                      title="Asignar a socio"
                      className="inline-flex h-[30px] items-center gap-1 rounded-[3px] border border-[#e7e8e2] bg-white px-2 text-[9px] font-bold text-[#22251f] hover:bg-[#d3f36b]"
                    >
                      <UserPlus className="h-3 w-3" />
                      Asignar
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(routine)}
                      aria-label={`Editar ${routine.title}`}
                      className="grid h-[30px] w-[30px] place-items-center rounded-[3px] border border-[#e7e8e2] text-[#686b63] hover:bg-[#f5f6f1] hover:text-[#22251f]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(routine.id)}
                      aria-label={`Eliminar ${routine.title}`}
                      className="grid h-[30px] w-[30px] place-items-center rounded-[3px] border border-[#e7e8e2] text-[#85877f] hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {routine.notes ? (
                  <p className="px-[18px] pb-3 text-[10px] text-[#73756e]">{routine.notes}</p>
                ) : null}

                <div className="overflow-x-auto border-t border-[#eff0eb]">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-[#f8f9f5]">
                      <tr>
                        <th className="px-[14px] py-2 text-[8px] font-bold text-[#92948c] uppercase">
                          Bloque / Día
                        </th>
                        <th className="px-[14px] py-2 text-[8px] font-bold text-[#92948c] uppercase">
                          Ejercicio
                        </th>
                        <th className="px-[14px] py-2 text-[8px] font-bold text-[#92948c] uppercase">
                          Series × Reps
                        </th>
                        <th className="px-[14px] py-2 text-right text-[8px] font-bold text-[#92948c] uppercase">
                          Carga / Desc.
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {routine.exercises.map((ex) => (
                        <tr key={ex.id} className="border-t border-[#eff0eb]">
                          <td className="px-[14px] py-2 text-[9px] font-semibold text-[#686b63]">
                            {ex.day_label}
                          </td>
                          <td className="px-[14px] py-2 text-[10px] font-bold text-[#22251f]">
                            {ex.exercise_name}
                          </td>
                          <td className="tabular-nums px-[14px] py-2 text-[10px] text-[#363932]">
                            {ex.sets} × {ex.reps}
                          </td>
                          <td className="tabular-nums px-[14px] py-2 text-right text-[9px] text-[#85877f]">
                            {ex.target_weight ? `${ex.target_weight} · ` : ''}
                            {ex.rest_seconds}s
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {formOpen
        ? createPortal(
            <div
              className="lobo-backdrop-enter fixed inset-0 z-50 flex items-center justify-center bg-[#1c201b]/75 p-3.5 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="routine-dialog-title"
              onClick={(e) => {
                if (e.target === e.currentTarget) setFormOpen(false);
              }}
            >
              <div className="lobo-modal-enter max-h-[90vh] w-[min(620px,100%)] overflow-y-auto rounded-[4px] bg-white p-6 shadow-[0_20px_70px_rgba(23,26,22,0.44)]">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
                      ENTRENAMIENTO LOBO
                    </span>
                    <h2
                      id="routine-dialog-title"
                      className="font-display mt-1 text-[21px] font-semibold text-[#22251f]"
                    >
                      {editingRoutine ? 'Editar rutina' : 'Nueva rutina'}
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
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Título de la rutina
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej. Fuerza Base 4 Días"
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px] outline-none focus:border-[#97bd42]"
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
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px] outline-none focus:border-[#97bd42]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Objetivo</label>
                      <select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value as RoutineGoal)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-2.5 text-[11px]"
                      >
                        <option value="strength">Fuerza</option>
                        <option value="hypertrophy">Hipertrofia</option>
                        <option value="fat_loss">Definición</option>
                        <option value="endurance">Resistencia</option>
                        <option value="mobility">Movilidad</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Nivel</label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value as WorkoutLevel)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-2.5 text-[11px]"
                      >
                        <option value="all_levels">Todos los niveles</option>
                        <option value="beginner">Inicial</option>
                        <option value="intermediate">Intermedio</option>
                        <option value="advanced">Avanzado</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Días / sem</label>
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={daysPerWeek}
                        onChange={(e) => setDaysPerWeek(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Minutos</label>
                      <input
                        type="number"
                        min={10}
                        max={240}
                        value={estimatedMinutes}
                        onChange={(e) => setEstimatedMinutes(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Notas</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Progresión, cadencia o indicaciones del entrenador"
                      className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                    />
                  </div>

                  <div className="border-t border-[#e8e9e3] pt-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#22251f] uppercase">
                        Ejercicios ({exercises.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setExercises((prev) => [...prev, EMPTY_EXERCISE()])}
                        className="rounded-[3px] border border-[#e8e9e3] bg-[#f8f9f5] px-2.5 py-1 text-[9px] font-bold text-[#22251f] hover:bg-[#d3f36b]"
                      >
                        + Agregar ejercicio
                      </button>
                    </div>

                    <div className="space-y-2">
                      {exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-12 gap-2 rounded-[3px] border border-[#eff0eb] bg-[#fafbf8] p-2"
                        >
                          <input
                            type="text"
                            placeholder="Día (ej. Día 1)"
                            value={ex.day_label}
                            onChange={(e) =>
                              setExercises((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...row, day_label: e.target.value } : row,
                                ),
                              )
                            }
                            className="col-span-4 rounded-[3px] border border-[#e2e4dc] bg-white px-2 py-1.5 text-[10px]"
                          />
                          <input
                            type="text"
                            placeholder="Ejercicio"
                            value={ex.exercise_name}
                            onChange={(e) =>
                              setExercises((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...row, exercise_name: e.target.value } : row,
                                ),
                              )
                            }
                            className="col-span-5 rounded-[3px] border border-[#e2e4dc] bg-white px-2 py-1.5 text-[10px]"
                          />
                          <input
                            type="number"
                            min={1}
                            placeholder="Series"
                            value={ex.sets}
                            onChange={(e) =>
                              setExercises((prev) =>
                                prev.map((row, i) => (i === idx ? { ...row, sets: e.target.value } : row)),
                              )
                            }
                            className="col-span-3 rounded-[3px] border border-[#e2e4dc] bg-white px-2 py-1.5 text-[10px]"
                          />
                          <input
                            type="text"
                            placeholder="Reps (ej. 8-12)"
                            value={ex.reps}
                            onChange={(e) =>
                              setExercises((prev) =>
                                prev.map((row, i) => (i === idx ? { ...row, reps: e.target.value } : row)),
                              )
                            }
                            className="col-span-4 rounded-[3px] border border-[#e2e4dc] bg-white px-2 py-1.5 text-[10px]"
                          />
                          <input
                            type="text"
                            placeholder="Peso (ej. 60 kg)"
                            value={ex.target_weight}
                            onChange={(e) =>
                              setExercises((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...row, target_weight: e.target.value } : row,
                                ),
                              )
                            }
                            className="col-span-4 rounded-[3px] border border-[#e2e4dc] bg-white px-2 py-1.5 text-[10px]"
                          />
                          <input
                            type="number"
                            min={0}
                            placeholder="Descanso s"
                            value={ex.rest_seconds}
                            onChange={(e) =>
                              setExercises((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...row, rest_seconds: e.target.value } : row,
                                ),
                              )
                            }
                            className="col-span-3 rounded-[3px] border border-[#e2e4dc] bg-white px-2 py-1.5 text-[10px]"
                          />
                          <button
                            type="button"
                            disabled={exercises.length <= 1}
                            onClick={() =>
                              setExercises((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="col-span-1 rounded-[3px] text-[12px] text-[#85877f] hover:text-red-700 disabled:opacity-30"
                            aria-label="Quitar ejercicio"
                          >
                            ×
                          </button>
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
                    <span>{saveMutation.isPending ? 'Guardando...' : 'Guardar rutina'}</span>
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
        eyebrow="ASIGNAR RUTINA"
        title={assignTarget?.title ?? ''}
        submitLabel="Asignar rutina"
        isPending={assignMutation.isPending}
        errorMsg={assignError}
        onClose={() => setAssignTarget(null)}
        onSubmit={(targetMemberName) => assignMutation.mutate(targetMemberName)}
      />
    </div>
  );
}
