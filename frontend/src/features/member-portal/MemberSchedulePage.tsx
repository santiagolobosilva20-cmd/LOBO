import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError, requestJson } from '../../shared/api/http';
import type { ClassSessionItem, SingleResponse } from '../../shared/api/types';
import { useToast } from '../../shared/components/ToastContext';
import { useMemberScheduleQuery } from './memberQueries';

const DAYS = [
  { day: 1, name: 'Lunes' },
  { day: 2, name: 'Martes' },
  { day: 3, name: 'Miércoles' },
  { day: 4, name: 'Jueves' },
  { day: 5, name: 'Viernes' },
  { day: 6, name: 'Sábado' },
] as const;

export function MemberSchedulePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [onlyMine, setOnlyMine] = useState(false);

  const scheduleQuery = useMemberScheduleQuery();

  const bookMutation = useMutation({
    mutationFn: ({ sessionId, action }: { sessionId: number; action: 'book' | 'cancel' }) =>
      requestJson<SingleResponse<ClassSessionItem>>(`/member/schedule/sessions/${sessionId}/book`, {
        method: action === 'book' ? 'POST' : 'DELETE',
      }),
    onSuccess: async (_res, vars) => {
      await queryClient.invalidateQueries({ queryKey: ['member', 'schedule'] });
      showToast(
        vars.action === 'book' ? 'Cupo reservado con éxito.' : 'Reserva cancelada.',
      );
    },
    onError: (err) => {
      showToast(err instanceof ApiError ? err.message : 'No pudimos actualizar tu reserva.');
    },
  });

  const bookedIds = new Set(scheduleQuery.data?.booked_session_ids ?? []);
  const allSessions = scheduleQuery.data?.data ?? [];
  const visibleSessions = onlyMine ? allSessions.filter((s) => bookedIds.has(s.id)) : allSessions;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="block text-[9px] font-bold tracking-[0.02em] text-[#8b8e84] uppercase">
            HORARIOS Y RESERVAS
          </span>
          <h1 className="font-display mt-[7px] text-[24px] leading-[1.08] font-bold text-[#22251f] sm:text-[26px]">
            Reserva tu clase
          </h1>
          <p className="mt-1.5 text-[11px] text-[#6d7067]">
            Aparta tu lugar en cualquiera de las sesiones semanales o cancela cuando lo necesites.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-[3px] border border-[#e7e8e2] bg-white p-1">
          <button
            type="button"
            onClick={() => setOnlyMine(false)}
            className={`rounded-[3px] px-3 py-1.5 text-[10px] font-bold ${
              !onlyMine ? 'bg-[#22251f] text-white' : 'text-[#686b63] hover:text-[#22251f]'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setOnlyMine(true)}
            className={`rounded-[3px] px-3 py-1.5 text-[10px] font-bold ${
              onlyMine ? 'bg-[#22251f] text-white' : 'text-[#686b63] hover:text-[#22251f]'
            }`}
          >
            Mis reservas ({bookedIds.size})
          </button>
        </div>
      </div>

      {scheduleQuery.isLoading ? (
        <div className="rounded-[3px] border border-[#e7e8e2] bg-white p-10 text-center text-[10px] text-[#73756e]">
          Cargando horarios disponibles...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2">
          {DAYS.map(({ day, name }) => {
            const sessions = visibleSessions.filter((s) => s.day_of_week === day);
            if (onlyMine && sessions.length === 0) {
              return null;
            }

            return (
              <section key={day} className="rounded-[3px] border border-[#e7e8e2] bg-white p-[18px]">
                <h2 className="font-display border-b border-[#f0f1ec] pb-2.5 text-[15px] font-semibold text-[#22251f]">
                  {name}
                </h2>
                {sessions.length === 0 ? (
                  <p className="py-5 text-center text-[10px] text-[#73756e]">
                    Sin sesiones programadas este día.
                  </p>
                ) : (
                  <div className="divide-y divide-[#f0f1ec]">
                    {sessions.map((session) => {
                      const isBooked = bookedIds.has(session.id);
                      const isFull = session.enrolled_count >= session.capacity;
                      const busy =
                        bookMutation.isPending && bookMutation.variables?.sessionId === session.id;

                      return (
                        <div
                          key={session.id}
                          className="flex flex-wrap items-center justify-between gap-2 py-3 text-[10px]"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="tabular-nums font-bold text-[#22251f]">
                                {session.short_time_label}
                              </span>
                              <strong className="font-semibold text-[#22251f]">
                                {session.workout_name}
                              </strong>
                            </div>
                            <span className="mt-0.5 block text-[9px] text-[#73756e]">
                              {session.room} · {session.instructor_name} ·{' '}
                              {session.duration_minutes} min · Cupos {session.enrolled_count}/
                              {session.capacity}
                            </span>
                          </div>

                          {isBooked ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                bookMutation.mutate({ sessionId: session.id, action: 'cancel' })
                              }
                              className="rounded-[3px] border border-[#ff8068] bg-[#fff4f2] px-3 py-1.5 text-[9px] font-bold text-[#9b2c1a] hover:bg-[#ffe0d8] disabled:opacity-50"
                            >
                              {busy ? 'Actualizando...' : 'Cancelar reserva'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busy || isFull}
                              onClick={() =>
                                bookMutation.mutate({ sessionId: session.id, action: 'book' })
                              }
                              className="rounded-[3px] bg-[#d3f36b] px-3 py-1.5 text-[9px] font-bold text-[#22251f] hover:bg-[#c8eb55] disabled:bg-[#f0f1ec] disabled:text-[#8b8e84]"
                            >
                              {isFull ? 'Sin cupos' : busy ? 'Reservando...' : 'Reservar cupo'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
