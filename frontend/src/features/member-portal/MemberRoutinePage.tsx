import { useState } from 'react';
import { DetailCardsGridSkeleton, staggerStyle } from '../../shared/components/Skeletons';
import { getRoutineGoalLabel, getWorkoutLevelLabel } from '../../shared/utils/format';
import { useMemberRoutinesQuery } from './memberQueries';

export function MemberRoutinePage() {
  const [scope, setScope] = useState<'mine' | 'templates'>('mine');
  const routinesQuery = useMemberRoutinesQuery(scope);
  const routines = routinesQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="block text-[9px] font-bold tracking-[0.02em] text-[#8b8e84] uppercase">
            ENTRENAMIENTO PERSONAL
          </span>
          <h1 className="font-display mt-[7px] text-[24px] leading-[1.08] font-bold text-[#22251f] sm:text-[26px]">
            Mi rutina y plantillas
          </h1>
          <p className="mt-1.5 text-[11px] text-[#6d7067]">
            Bloques por día, series, repeticiones, carga sugerida y tiempos de descanso.
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
            Mi rutina asignada
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

      {routinesQuery.isLoading ? (
        <DetailCardsGridSkeleton variant="routine" count={2} />
      ) : routines.length === 0 ? (
        <div className="rounded-[3px] border border-[#e7e8e2] bg-white p-10 text-center text-[#73756e]">
          <strong className="font-display block text-[15px] font-semibold text-[#22251f]">
            {scope === 'mine'
              ? 'No tienes una rutina asignada aún'
              : 'Sin plantillas disponibles'}
          </strong>
          <p className="mt-1.5 text-[10px]">
            {scope === 'mine'
              ? 'Explora las plantillas del club o solicita a tu entrenador una rutina a medida.'
              : 'Consulta con administración.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-2">
          {routines.map((routine, idx) => (
            <article
              key={routine.id}
              style={staggerStyle(idx)}
              className="lobo-stagger-item overflow-hidden rounded-[3px] border border-[#e7e8e2] bg-white"
            >
              <div className="border-b border-[#f0f1ec] p-[18px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="bg-[#d3f36b] px-2 py-0.5 text-[8px] font-bold text-[#22251f] uppercase">
                    {getRoutineGoalLabel(routine.goal)}
                  </span>
                  <span className="border border-[#e7e8e2] bg-[#f8f9f5] px-2 py-0.5 text-[8px] font-bold text-[#686b63] uppercase">
                    {routine.is_template ? 'Plantilla LOBO' : 'Asignada a ti'}
                  </span>
                </div>
                <h2 className="font-display mt-2 text-[18px] font-semibold text-[#22251f]">
                  {routine.title}
                </h2>
                <p className="mt-1 text-[10px] text-[#686b63]">
                  {getWorkoutLevelLabel(routine.level)} · {routine.days_per_week} días/sem ·{' '}
                  {routine.estimated_minutes} min
                </p>
                {routine.notes ? (
                  <p className="mt-2 text-[10px] text-[#73756e]">{routine.notes}</p>
                ) : null}
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-[#f8f9f5]">
                    <tr>
                      <th className="px-4 py-2 text-[8px] font-bold text-[#92948c] uppercase">
                        Bloque
                      </th>
                      <th className="px-4 py-2 text-[8px] font-bold text-[#92948c] uppercase">
                        Ejercicio
                      </th>
                      <th className="px-4 py-2 text-[8px] font-bold text-[#92948c] uppercase">
                        Series × Reps
                      </th>
                      <th className="px-4 py-2 text-right text-[8px] font-bold text-[#92948c] uppercase">
                        Carga / Desc.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {routine.exercises.map((ex) => (
                      <tr key={ex.id} className="border-b border-[#f0f1ec] last:border-b-0">
                        <td className="px-4 py-2.5 text-[9px] font-bold text-[#686b63]">
                          {ex.day_label}
                        </td>
                        <td className="px-4 py-2.5 text-[10px] font-semibold text-[#22251f]">
                          {ex.exercise_name}
                        </td>
                        <td className="tabular-nums px-4 py-2.5 text-[10px] text-[#22251f]">
                          {ex.sets} × {ex.reps}
                        </td>
                        <td className="tabular-nums px-4 py-2.5 text-right text-[9px] text-[#686b63]">
                          {[ex.target_weight, `${ex.rest_seconds}s`].filter(Boolean).join(' · ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

