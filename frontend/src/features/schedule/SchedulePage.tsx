import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ApiError, requestJson } from '../../shared/api/http';
import type {
  ClassSessionItem,
  PaginatedResponse,
  SingleResponse,
  WorkoutItem,
} from '../../shared/api/types';
import { DetailCardsGridSkeleton, staggerStyle } from '../../shared/components/Skeletons';
import { useToast } from '../../shared/components/ToastContext';

interface DayScheduleCard {
  day: number;
  label: string;
  sessions: Array<{
    id?: number;
    time: string;
    name: string;
    meta: string;
    enrolled?: number;
    capacity?: number;
  }>;
}

const DEFAULT_WEEK_SCHEDULE: DayScheduleCard[] = [
  {
    day: 1,
    label: 'Lunes',
    sessions: [
      { time: '07:00', name: 'Fuerza funcional', meta: 'Sala Norte · 45 min' },
      { time: '09:30', name: 'Boxeo', meta: 'Ring · 50 min' },
      { time: '18:00', name: 'Spinning', meta: 'Sala Sur · 40 min' },
      { time: '19:30', name: 'Yoga y movilidad', meta: 'Sala Norte · 50 min' },
    ],
  },
  {
    day: 2,
    label: 'Martes',
    sessions: [
      { time: '07:00', name: 'Spinning', meta: 'Sala Sur · 40 min' },
      { time: '10:00', name: 'Yoga y movilidad', meta: 'Sala Norte · 50 min' },
      { time: '17:00', name: 'Fuerza funcional', meta: 'Sala Norte · 45 min' },
      { time: '19:00', name: 'Boxeo', meta: 'Ring · 50 min' },
    ],
  },
  {
    day: 3,
    label: 'Miércoles',
    sessions: [
      { time: '07:00', name: 'Fuerza funcional', meta: 'Sala Norte · 45 min' },
      { time: '09:30', name: 'Boxeo', meta: 'Ring · 50 min' },
      { time: '18:00', name: 'Spinning', meta: 'Sala Sur · 40 min' },
      { time: '19:30', name: 'Yoga y movilidad', meta: 'Sala Norte · 50 min' },
    ],
  },
  {
    day: 4,
    label: 'Jueves',
    sessions: [
      { time: '07:00', name: 'Spinning', meta: 'Sala Sur · 40 min' },
      { time: '10:00', name: 'Yoga y movilidad', meta: 'Sala Norte · 50 min' },
      { time: '17:00', name: 'Fuerza funcional', meta: 'Sala Norte · 45 min' },
      { time: '19:00', name: 'Boxeo', meta: 'Ring · 50 min' },
    ],
  },
  {
    day: 5,
    label: 'Viernes',
    sessions: [
      { time: '07:00', name: 'Fuerza funcional', meta: 'Sala Norte · 45 min' },
      { time: '09:30', name: 'Boxeo', meta: 'Ring · 50 min' },
      { time: '18:00', name: 'Spinning', meta: 'Sala Sur · 40 min' },
      { time: '19:30', name: 'Yoga y movilidad', meta: 'Sala Norte · 50 min' },
    ],
  },
  {
    day: 6,
    label: 'Sábado',
    sessions: [
      { time: '08:00', name: 'Spinning', meta: 'Sala Sur · 40 min' },
      { time: '09:30', name: 'Fuerza funcional', meta: 'Sala Norte · 45 min' },
      { time: '11:00', name: 'Boxeo', meta: 'Ring · 50 min' },
    ],
  },
];

const DAY_NAMES: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

export function SchedulePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [workoutId, setWorkoutId] = useState('1');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [room, setRoom] = useState('Sala Norte');
  const [instructor, setInstructor] = useState('Carlos Méndez');
  const [timeInput, setTimeInput] = useState('08:00');
  const [duration, setDuration] = useState('45');
  const [capacity, setCapacity] = useState('12');
  const [formError, setFormError] = useState('');

  const sessionsQuery = useQuery({
    queryKey: ['sessions'],
    queryFn: () => requestJson<PaginatedResponse<ClassSessionItem>>('/schedule/sessions?per_page=100'),
    retry: false,
  });

  const workoutsQuery = useQuery({
    queryKey: ['workouts', 'schedule-select'],
    queryFn: () => requestJson<PaginatedResponse<WorkoutItem>>('/workouts?per_page=30'),
    enabled: addModalOpen,
    retry: false,
  });

  const enrollMutation = useMutation({
    mutationFn: (sessionId: number) =>
      requestJson<SingleResponse<ClassSessionItem>>(`/schedule/sessions/${sessionId}/enroll`, {
        method: 'POST',
      }),
    onSuccess: async (res) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      showToast(
        `Cupo reservado en ${res.data.workout_name} (${res.data.enrolled_count}/${res.data.capacity}).`,
      );
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: () => {
      const today = new Date().toISOString().slice(0, 10);
      return requestJson<SingleResponse<ClassSessionItem>>('/schedule/sessions', {
        method: 'POST',
        body: JSON.stringify({
          workout_id: Number(workoutId),
          day_of_week: Number(dayOfWeek),
          room: room.trim(),
          instructor_name: instructor.trim(),
          starts_at: `${today}T${timeInput}:00`,
          duration_minutes: Number(duration) || 45,
          capacity: Number(capacity) || 12,
        }),
      });
    },
    onSuccess: async (res) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      showToast(`Clase "${res.data.workout_name}" agregada a ${DAY_NAMES[res.data.day_of_week]}.`);
      setAddModalOpen(false);
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo programar la clase.');
    },
  });

  const apiSessions = sessionsQuery.data?.data ?? [];

  const days: DayScheduleCard[] =
    apiSessions.length > 0
      ? [1, 2, 3, 4, 5, 6].map((day) => ({
          day,
          label: DAY_NAMES[day],
          sessions: apiSessions
            .filter((s) => s.day_of_week === day)
            .map((s) => ({
              id: s.id,
              time: s.short_time_label,
              name: s.workout_name,
              meta: `${s.room} · ${s.duration_minutes} min`,
              enrolled: s.enrolled_count,
              capacity: s.capacity,
            })),
        }))
      : DEFAULT_WEEK_SCHEDULE;

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    createSessionMutation.mutate();
  };

  return (
    <div>
      <div className="mt-[9px] mb-[19px] flex flex-wrap items-end justify-between gap-[18px] md:mt-3 md:mb-6">
        <div>
          <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
            ENCUENTRA TU MOMENTO
          </span>
          <h1 className="font-display mt-[7px] text-[25px] leading-[1.15] font-semibold text-[#22251f] sm:text-[29px]">
            Horarios de clase
          </h1>
          <p className="mt-[7px] max-w-[240px] text-[11px] leading-normal text-[#83857d] sm:max-w-none">
            Una sesión para cada forma de moverte.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="lobo-pressable inline-flex min-h-[39px] items-center justify-center gap-[9px] rounded-[3px] bg-[#22251f] px-[15px] text-[10px] font-bold text-white hover:bg-[#3b4037]"
        >
          <span className="text-[15px] leading-none">＋</span> Agregar clase
        </button>
      </div>

      <section className="flex min-h-[148px] flex-col justify-between gap-4 bg-[#d3f36b] p-[21px] text-[#22251f] sm:min-h-[170px] sm:flex-row sm:items-center sm:px-[32px] sm:py-[27px]">
        <div>
          <span className="block text-[9px] font-bold text-[#5e653d] uppercase">
            LUNES A SÁBADO
          </span>
          <h2 className="font-display mt-3 text-[23px] leading-[1.06] font-semibold text-[#22251f] sm:text-[28px]">
            Tu próxima mejor hora
            <br />
            es la que eliges.
          </h2>
        </div>
        <div className="font-display tabular-nums text-[25px] font-semibold text-[#22251f] sm:text-[35px]">
          06:00{' '}
          <small className="font-sans text-[16px] font-normal text-[#77834b] sm:text-[20px]">–</small>{' '}
          22:00
        </div>
      </section>

      {sessionsQuery.isLoading ? (
        <div className="mt-[15px]">
          <DetailCardsGridSkeleton variant="schedule" count={6} />
        </div>
      ) : (
        <section className="mt-[15px] grid grid-cols-1 gap-[12px] md:grid-cols-2 xl:grid-cols-3">
          {days.map((day, dayIdx) => (
            <article
              key={day.day}
              style={staggerStyle(dayIdx)}
              className="lobo-stagger-item border border-[#e7e8e2] bg-white px-[17px] pt-[17px] pb-[8px]"
            >
              <h3 className="font-display mb-[9px] text-[13px] font-semibold text-[#22251f]">
                {day.label}
              </h3>
              <div>
                {day.sessions.map((session, idx) => (
                  <div
                    key={session.id ?? `${day.day}-${idx}`}
                    className="group flex min-h-[49px] items-center gap-[10px] border-t border-[#eff0eb]"
                  >
                    <time className="tabular-nums w-[42px] shrink-0 text-[9px] text-[#76786f]">
                      {session.time}
                    </time>
                    <div className="min-w-0 flex-1">
                      <strong className="block text-[10px] font-bold text-[#22251f]">
                        {session.name}
                      </strong>
                      <small className="mt-[3px] block text-[8px] text-[#9b9d95]">
                        {session.meta}
                      </small>
                    </div>
                    {session.id !== undefined && session.capacity !== undefined ? (
                      <button
                        type="button"
                        disabled={
                          enrollMutation.isPending || (session.enrolled ?? 0) >= session.capacity
                        }
                        onClick={() => enrollMutation.mutate(session.id!)}
                        title="Reservar cupo (+1)"
                        className="tabular-nums rounded-[3px] px-1.5 py-0.5 text-[9px] font-medium text-[#9b9d95] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#d3f36b] hover:text-[#22251f] focus:opacity-100 disabled:opacity-40"
                      >
                        {session.enrolled}/{session.capacity}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      {addModalOpen
        ? createPortal(
            <div
              className="lobo-backdrop-enter fixed inset-0 z-50 flex items-center justify-center bg-[#1c201b]/75 p-3.5 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              onClick={(e) => {
                if (e.target === e.currentTarget) setAddModalOpen(false);
              }}
            >
              <div className="lobo-modal-enter w-[min(420px,100%)] rounded-[4px] bg-white p-6 shadow-[0_20px_70px_rgba(23,26,22,0.44)]">
                <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
                  AGENDA LOBO
                </span>
                <h2 className="font-display mt-1 text-[21px] font-semibold text-[#22251f]">
                  Programar clase
                </h2>
                <form onSubmit={handleAddSubmit} className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Disciplina
                      </label>
                      <select
                        value={workoutId}
                        onChange={(e) => setWorkoutId(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-2 text-[11px]"
                      >
                        {(workoutsQuery.data?.data ?? [
                          { id: 1, name: 'Fuerza funcional' },
                          { id: 2, name: 'Boxeo' },
                          { id: 3, name: 'Spinning' },
                          { id: 4, name: 'Yoga y movilidad' },
                        ]).map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Día</label>
                      <select
                        value={dayOfWeek}
                        onChange={(e) => setDayOfWeek(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-2 text-[11px]"
                      >
                        {Object.entries(DAY_NAMES).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Sala</label>
                      <input
                        type="text"
                        required
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Entrenador
                      </label>
                      <input
                        type="text"
                        required
                        value={instructor}
                        onChange={(e) => setInstructor(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Hora</label>
                      <input
                        type="time"
                        required
                        value={timeInput}
                        onChange={(e) => setTimeInput(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Duración (min)
                      </label>
                      <input
                        type="number"
                        min={15}
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Cupo</label>
                      <input
                        type="number"
                        min={1}
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2 text-[11px]"
                      />
                    </div>
                  </div>
                  {formError ? <p className="text-[11px] text-red-600">{formError}</p> : null}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setAddModalOpen(false)}
                      className="min-h-[38px] flex-1 rounded-[3px] border border-[#e2e4dc] text-[10px] font-bold text-[#686b63]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={createSessionMutation.isPending}
                      className="min-h-[38px] flex-1 rounded-[3px] bg-[#22251f] text-[10px] font-bold text-white"
                    >
                      {createSessionMutation.isPending ? 'Guardando...' : 'Programar clase'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
