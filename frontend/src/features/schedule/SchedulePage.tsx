import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestJson } from '../../shared/api/http';
import type { ClassSessionItem, PaginatedResponse, SingleResponse } from '../../shared/api/types';

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

  const sessionsQuery = useQuery({
    queryKey: ['sessions'],
    queryFn: () => requestJson<PaginatedResponse<ClassSessionItem>>('/schedule/sessions?per_page=100'),
    retry: false,
  });

  const enrollMutation = useMutation({
    mutationFn: (sessionId: number) =>
      requestJson<SingleResponse<ClassSessionItem>>(`/schedule/sessions/${sessionId}/enroll`, {
        method: 'POST',
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
          Encuentra tu momento
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#17191C] sm:text-3xl">
          Horarios de clase
        </h1>
        <p className="mt-1 text-xs text-[#6B7280] sm:text-sm">Una sesión para cada forma de moverte.</p>
      </div>

      <section className="flex flex-col justify-between gap-4 rounded-2xl bg-[#CEF542] px-7 py-7 text-[#17191C] sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-[#4B5563] uppercase">
            Lunes a sábado
          </p>
          <h2 className="mt-1.5 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            Tu próxima mejor hora
            <span className="block">es la que eliges.</span>
          </h2>
        </div>
        <p className="tabular-nums text-3xl font-extrabold tracking-tight sm:text-4xl">06:00 – 22:00</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {days.map((day) => (
          <article key={day.day} className="rounded-xl border border-[#E6E7E2] bg-white p-5">
            <h3 className="border-b border-[#F2F3EE] pb-3 text-sm font-bold text-[#17191C]">
              {day.label}
            </h3>
            <ul className="divide-y divide-[#F2F3EE]">
              {day.sessions.map((session, idx) => (
                <li
                  key={session.id ?? `${day.day}-${idx}`}
                  className="flex items-center justify-between gap-3 py-3.5"
                >
                  <div className="flex items-center gap-4">
                    <span className="tabular-nums w-11 shrink-0 text-xs font-medium text-[#6B7280]">
                      {session.time}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#17191C]">{session.name}</p>
                      <p className="text-xs text-[#9CA3AF]">{session.meta}</p>
                    </div>
                  </div>
                  {session.id !== undefined && session.capacity !== undefined ? (
                    <button
                      type="button"
                      disabled={
                        enrollMutation.isPending || (session.enrolled ?? 0) >= session.capacity
                      }
                      onClick={() => enrollMutation.mutate(session.id!)}
                      title="Reservar cupo (+1)"
                      className="tabular-nums rounded-md border border-[#E6E7E2] px-2 py-1 text-[11px] font-semibold text-[#4B5563] hover:bg-[#CEF542] hover:text-[#17191C] disabled:opacity-40"
                    >
                      {session.enrolled}/{session.capacity}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}
