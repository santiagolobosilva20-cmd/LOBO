import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ApiError, requestJson } from '../../shared/api/http';
import type { SingleResponse, WorkoutItem, WorkoutLogItem } from '../../shared/api/types';
import { useToast } from '../../shared/components/ToastContext';
import { useClubWorkoutsQuery, useMemberWorkoutLogsQuery } from './memberQueries';

export function MemberWorkoutsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const workoutsQuery = useClubWorkoutsQuery();
  const logsQuery = useMemberWorkoutLogsQuery();

  const [modalOpen, setModalOpen] = useState(false);
  const [workoutId, setWorkoutId] = useState('');
  const [title, setTitle] = useState('Entrenamiento funcional');
  const [category, setCategory] = useState('FUERZA');
  const [performedAt, setPerformedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState('45');
  const [rpe, setRpe] = useState('8');
  const [calories, setCalories] = useState('380');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const createLogMutation = useMutation({
    mutationFn: () =>
      requestJson<SingleResponse<WorkoutLogItem>>('/member/workout-logs', {
        method: 'POST',
        body: JSON.stringify({
          workout_id: workoutId ? Number(workoutId) : null,
          title: title.trim(),
          category: category.trim(),
          performed_at: performedAt,
          duration_minutes: Number(duration),
          effort_rpe: Number(rpe),
          calories_estimate: calories ? Number(calories) : null,
          notes: notes.trim() || null,
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['member', 'workout-logs'] });
      showToast('Sesión guardada en tu bitácora.');
      setNotes('');
      setFormError('');
      setModalOpen(false);
    },
    onError: (err) => {
      setFormError(
        err instanceof ApiError ? err.message : 'No pudimos guardar tu sesión.',
      );
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: (id: number) =>
      requestJson<void>(`/member/workout-logs/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['member', 'workout-logs'] });
      showToast('Registro eliminado de tu bitácora.');
    },
    onError: (err) => {
      showToast(err instanceof ApiError ? err.message : 'No se pudo eliminar el registro.');
    },
  });

  function openForWorkout(workout?: WorkoutItem) {
    if (workout) {
      setWorkoutId(String(workout.id));
      setTitle(workout.name);
      setCategory(workout.category);
      setDuration(String(workout.default_duration_minutes));
    } else {
      setWorkoutId('');
      setTitle('Sesión de entrenamiento');
      setCategory('FUERZA');
      setDuration('45');
    }
    setFormError('');
    setModalOpen(true);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    if (!title.trim()) {
      setFormError('Ingresa un título para la sesión.');
      return;
    }
    createLogMutation.mutate();
  }

  const workouts = workoutsQuery.data?.data ?? [];
  const logs = logsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="block text-[9px] font-bold tracking-[0.02em] text-[#8b8e84] uppercase">
            MI PROGRESO FÍSICO
          </span>
          <h1 className="font-display mt-[7px] text-[24px] leading-[1.08] font-bold text-[#22251f] sm:text-[26px]">
            Mis entrenamientos
          </h1>
          <p className="mt-1.5 text-[11px] text-[#6d7067]">
            Elige una disciplina del club y registra tus sesiones en tu bitácora personal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openForWorkout()}
          className="inline-flex min-h-[39px] items-center justify-center gap-2 rounded-[3px] bg-[#d3f36b] px-4 text-[10px] font-bold text-[#22251f] hover:bg-[#c8eb55]"
        >
          ＋ Registrar mi sesión
        </button>
      </div>

      <section className="grid grid-cols-1 gap-[13px] md:grid-cols-2">
        {workouts.map((workout, idx) => {
          const orderNum = String(workout.display_order || idx + 1).padStart(2, '0');
          return (
            <article
              key={workout.id}
              className="relative flex min-h-[205px] items-end overflow-hidden bg-[#181c17] p-[21px] text-white sm:min-h-[220px]"
            >
              {workout.image_url ? (
                <img
                  src={workout.image_url}
                  alt={workout.name}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              ) : null}
              <div
                className="absolute inset-0 bg-gradient-to-b from-[#181c170f] to-[#181c17f0]"
                aria-hidden="true"
              />
              <span className="font-display tabular-nums absolute top-[15px] right-[18px] z-10 text-[18px] font-semibold text-white/80">
                {orderNum}
              </span>
              <div className="relative z-10 w-full">
                <span className="block text-[8px] font-bold text-[#d3f36b] uppercase">
                  {workout.category} · {workout.default_duration_minutes} MIN
                </span>
                <h2 className="font-display mt-[7px] mb-[5px] text-[20px] font-semibold">
                  {workout.name}
                </h2>
                {workout.description ? (
                  <p className="max-w-[400px] text-[10px] leading-[1.55] text-[#e1e2dd]">
                    {workout.description}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-block bg-[#d3f36b] px-[7px] py-[5px] text-[7px] font-bold text-[#22251f] uppercase">
                    {workout.badge_label}
                  </span>
                  <button
                    type="button"
                    onClick={() => openForWorkout(workout)}
                    className="border border-white/30 bg-black/45 px-2.5 py-[4px] text-[8px] font-bold text-white uppercase hover:bg-white hover:text-[#22251f]"
                  >
                    + Registrar mi sesión
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-[3px] border border-[#e7e8e2] bg-white">
        <div className="border-b border-[#f0f1ec] px-[18px] py-[14px]">
          <span className="block text-[8px] font-bold text-[#8b8e84] uppercase">
            HISTORIAL DEL SOCIO
          </span>
          <h2 className="font-display mt-0.5 text-[16px] font-semibold text-[#22251f]">
            Mi bitácora personal
          </h2>
        </div>

        {logsQuery.isLoading ? (
          <p className="py-10 text-center text-[10px] text-[#73756e]">
            Cargando tus entrenamientos...
          </p>
        ) : logs.length === 0 ? (
          <p className="py-10 text-center text-[10px] text-[#73756e]">
            Aún no registras sesiones personales.
          </p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#f8f9f5]">
                <tr>
                  <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                    Sesión
                  </th>
                  <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                    Categoría
                  </th>
                  <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                    Fecha
                  </th>
                  <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                    Duración
                  </th>
                  <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                    Esfuerzo
                  </th>
                  <th className="px-[13px] py-[10px] text-right text-[8px] font-bold text-[#92948c] uppercase">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-[#f0f1ec] last:border-b-0">
                    <td className="px-[13px] py-[11px] text-[10px] font-semibold text-[#22251f]">
                      {log.title}
                      {log.notes ? (
                        <span className="mt-0.5 block text-[9px] font-normal text-[#73756e]">
                          {log.notes}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-[13px] py-[11px] text-[9px] font-bold text-[#686b63] uppercase">
                      {log.category}
                    </td>
                    <td className="tabular-nums px-[13px] py-[11px] text-[10px] text-[#666960]">
                      {log.performed_at}
                    </td>
                    <td className="tabular-nums px-[13px] py-[11px] text-[10px] text-[#666960]">
                      {log.duration_minutes} min
                      {log.calories_estimate ? ` · ${log.calories_estimate} kcal` : ''}
                    </td>
                    <td className="px-[13px] py-[11px]">
                      <span className="tabular-nums inline-block rounded-[2px] bg-[#22251f] px-2 py-0.5 text-[8px] font-bold text-[#d3f36b]">
                        RPE {log.effort_rpe}/10
                      </span>
                    </td>
                    <td className="px-[13px] py-[11px] text-right">
                      <button
                        type="button"
                        onClick={() => deleteLogMutation.mutate(log.id)}
                        aria-label={`Eliminar sesión ${log.title}`}
                        className="inline-grid h-7 w-7 place-items-center rounded-[3px] border border-[#e7e8e2] text-[#9b2c1a] hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c201b]/75 p-3.5 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              onClick={(e) => {
                if (e.target === e.currentTarget) setModalOpen(false);
              }}
            >
              <div className="w-[min(450px,100%)] rounded-[4px] bg-white p-6 shadow-[0_20px_70px_rgba(23,26,22,0.44)]">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
                      MI BITÁCORA
                    </span>
                    <h2 className="font-display mt-1 text-[21px] font-semibold text-[#22251f]">
                      Registrar mi sesión
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    aria-label="Cerrar"
                    className="grid h-[31px] w-[31px] place-items-center rounded-[3px] border border-[#e8e9e3] text-[20px]"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Sesión / Título
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Categoría
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    <div className="col-span-2">
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={performedAt}
                        onChange={(e) => setPerformedAt(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Min
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        RPE (1-10)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={rpe}
                        onChange={(e) => setRpe(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2 text-[11px]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Kcal est. (opcional)
                      </label>
                      <input
                        type="number"
                        min={10}
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Notas (opcional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Sensaciones o marca..."
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                  </div>

                  {formError ? (
                    <p role="alert" className="text-[10px] text-[#b42318]">
                      {formError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={createLogMutation.isPending}
                    className="min-h-[40px] w-full rounded-[3px] bg-[#22251f] px-4 text-[11px] font-bold text-white hover:bg-[#3b4037] disabled:opacity-60"
                  >
                    {createLogMutation.isPending ? 'Guardando...' : 'Guardar sesión'}
                  </button>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
