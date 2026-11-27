import { Apple, ArrowRight, Award, Calendar, Clock, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KpiCard } from '../../shared/components/KpiCard';
import {
  formatWeekdayProgressLabel,
  getMembershipStatusLabel,
  getNutritionGoalLabel,
  getRoutineGoalLabel,
} from '../../shared/utils/format';
import { useAuth } from '../auth/AuthContext';
import {
  useMemberMembershipsQuery,
  useMemberNutritionQuery,
  useMemberRoutinesQuery,
  useMemberScheduleQuery,
  useMemberWorkoutLogsQuery,
} from './memberQueries';

export function MemberOverviewPage() {
  const { user } = useAuth();
  const membershipsQuery = useMemberMembershipsQuery();
  const scheduleQuery = useMemberScheduleQuery();
  const routinesQuery = useMemberRoutinesQuery('mine');
  const nutritionQuery = useMemberNutritionQuery('mine');
  const logsQuery = useMemberWorkoutLogsQuery();

  const activeMembership =
    membershipsQuery.data?.active_membership ?? membershipsQuery.data?.data?.[0] ?? null;
  const bookedIds = new Set(scheduleQuery.data?.booked_session_ids ?? []);
  const bookedSessions = (scheduleQuery.data?.data ?? []).filter((s) => bookedIds.has(s.id));
  const primaryRoutine = routinesQuery.data?.data?.[0] ?? null;
  const primaryNutrition = nutritionQuery.data?.data?.[0] ?? null;
  const recentLogs = (logsQuery.data?.data ?? []).slice(0, 4);

  const firstName = (user?.member_name || user?.name || 'Socio').split(/\s+/)[0];
  const isOverviewLoading =
    membershipsQuery.isLoading ||
    scheduleQuery.isLoading ||
    routinesQuery.isLoading ||
    nutritionQuery.isLoading ||
    logsQuery.isLoading;

  return (
    <div className="space-y-6">
      <section className="relative flex min-h-[210px] items-end justify-between overflow-hidden bg-[#181c17] p-6 text-white md:min-h-[225px] md:px-9 md:py-7">
        <img
          src="/images/hero-gym.jpg"
          alt="Entrena en LOBO Club"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#171b16fa] via-[#171b16bd] to-[#171b1670]"
          aria-hidden="true"
        />

        <div className="relative z-10 flex w-full flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="block text-[9px] font-bold tracking-[0.06em] text-[#d3f36b] uppercase">
              TU ESPACIO LOBO
            </span>
            <h1 className="font-display mt-2 text-[28px] leading-[1.06] font-bold sm:text-[34px]">
              Hola, {firstName}.
              <br />
              <span className="text-[#d3f36b]">Sigue sumando sesiones.</span>
            </h1>
            <p className="mt-2.5 max-w-[440px] text-[11px] text-[#dedfd9]">
              Consulta tu membresía, reserva clases de la semana y registra cada entrenamiento.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/mi-espacio/horarios"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-[3px] bg-[#d3f36b] px-4 text-[11px] font-bold text-[#22251f] hover:bg-[#c8eb55]"
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              Reservar clase
            </Link>
            <Link
              to="/mi-espacio/membresia"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-[3px] border border-white/25 bg-black/45 px-4 text-[11px] font-bold text-white hover:bg-white hover:text-[#22251f]"
            >
              Ver membresía
            </Link>
          </div>
        </div>
      </section>

      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="block text-[8px] font-bold tracking-[0.02em] text-[#9b9d95] uppercase">
            {formatWeekdayProgressLabel()}
          </span>
          <h2 className="font-display mt-1 text-[20px] font-semibold text-[#22251f]">
            Tu resumen personal
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Membresía"
          value={
            membershipsQuery.isLoading
              ? '...'
              : activeMembership
                ? getMembershipStatusLabel(activeMembership.status)
                : 'Sin plan'
          }
          subtitle={
            membershipsQuery.isLoading
              ? 'Cargando membresía...'
              : activeMembership
                ? `${activeMembership.plan_name} · ${activeMembership.days_remaining} días rest.`
                : 'Solicita un plan en Mi membresía'
          }
          icon={<Award className="h-[13px] w-[13px] stroke-[2.1] text-[#22251f]" />}
          iconBgClass="bg-[#d3f36b]"
        />
        <KpiCard
          label="Clases reservadas"
          value={scheduleQuery.isLoading ? '...' : String(bookedSessions.length)}
          subtitle={
            scheduleQuery.isLoading
              ? 'Cargando reservas...'
              : bookedSessions[0]
                ? `Próxima: ${bookedSessions[0].day_label} ${bookedSessions[0].start_time_label}`
                : 'Reserva desde Horarios'
          }
          icon={<Clock className="h-[13px] w-[13px] stroke-[2.1] text-[#22251f]" />}
          iconBgClass="bg-[#dceefa]"
        />
        <KpiCard
          label="Rutina asignada"
          value={
            routinesQuery.isLoading
              ? '...'
              : primaryRoutine
                ? `${primaryRoutine.days_per_week} días`
                : 'Plantillas'
          }
          subtitle={
            routinesQuery.isLoading
              ? 'Cargando rutina...'
              : primaryRoutine
                ? primaryRoutine.title
                : 'Revisa plantillas disponibles del club'
          }
          icon={<Dumbbell className="h-[13px] w-[13px] stroke-[2.1] text-[#22251f]" />}
          iconBgClass="bg-[#ffe0d8]"
        />
        <KpiCard
          label="Meta nutricional"
          value={
            nutritionQuery.isLoading
              ? '...'
              : primaryNutrition
                ? `${primaryNutrition.daily_calories} kcal`
                : 'Sin asignar'
          }
          subtitle={
            nutritionQuery.isLoading
              ? 'Cargando nutrición...'
              : primaryNutrition
                ? `${primaryNutrition.protein_grams}P · ${primaryNutrition.carbs_grams}C · ${primaryNutrition.fats_grams}G`
                : 'Consulta planes alimenticios del club'
          }
          icon={<Apple className="h-[13px] w-[13px] stroke-[2.1] text-[#22251f]" />}
          iconBgClass="bg-[#d3f36b]"
        />
      </div>

      <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-12">
        <section className="rounded-[3px] border border-[#e7e8e2] bg-white p-[18px] lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#f0f1ec] pb-3">
            <div>
              <span className="block text-[8px] font-bold text-[#8b8e84] uppercase">
                PLAN DE ENTRENAMIENTO
              </span>
              <h3 className="font-display mt-0.5 text-[16px] font-semibold text-[#22251f]">
                {primaryRoutine ? primaryRoutine.title : 'Explora tu rutina y entrenamientos'}
              </h3>
            </div>
            <Link
              to="/mi-espacio/rutina"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#22251f] hover:underline"
            >
              Ver completa <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isOverviewLoading ? (
            <p className="py-8 text-center text-[10px] text-[#73756e]">
              Cargando tu rutina y progreso...
            </p>
          ) : primaryRoutine ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-[9px] font-bold text-[#686b63] uppercase">
                <span className="bg-[#d3f36b] px-2 py-0.5 text-[#22251f]">
                  {getRoutineGoalLabel(primaryRoutine.goal)}
                </span>
                <span>{primaryRoutine.estimated_minutes} min aprox.</span>
              </div>
              <div className="divide-y divide-[#f0f1ec]">
                {primaryRoutine.exercises.slice(0, 4).map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between gap-3 py-2 text-[10px]"
                  >
                    <div>
                      <span className="text-[8px] font-bold text-[#8b8e84] uppercase">
                        {ex.day_label}
                      </span>
                      <p className="font-semibold text-[#22251f]">{ex.exercise_name}</p>
                    </div>
                    <span className="tabular-nums font-bold text-[#22251f]">
                      {ex.sets} × {ex.reps}
                      {ex.target_weight ? ` · ${ex.target_weight}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-[10px] text-[#73756e]">
              Aún no tienes una rutina personalizada asignada. Revisa las plantillas del club en{' '}
              <Link to="/mi-espacio/rutina" className="font-bold text-[#22251f] underline">
                Mi rutina
              </Link>
              .
            </p>
          )}
        </section>

        <section className="rounded-[3px] border border-[#e7e8e2] bg-white p-[18px] lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#f0f1ec] pb-3">
            <div>
              <span className="block text-[8px] font-bold text-[#8b8e84] uppercase">
                ACTIVIDAD RECIENTE
              </span>
              <h3 className="font-display mt-0.5 text-[16px] font-semibold text-[#22251f]">
                Bitácora y nutrición
              </h3>
            </div>
            <Link
              to="/mi-espacio/entrenamientos"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#22251f] hover:underline"
            >
              Registrar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {primaryNutrition ? (
            <div className="mt-3 rounded-[3px] border border-[#eceee7] bg-[#f8f9f5] p-3 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#22251f]">{primaryNutrition.title}</span>
                <span className="bg-[#dceefa] px-1.5 py-0.5 text-[8px] font-bold text-[#184c6b] uppercase">
                  {getNutritionGoalLabel(primaryNutrition.goal)}
                </span>
              </div>
              <p className="mt-1 text-[#686b63]">
                {primaryNutrition.daily_calories} kcal · {primaryNutrition.protein_grams}g P ·{' '}
                {primaryNutrition.carbs_grams}g C · {primaryNutrition.fats_grams}g G · Agua{' '}
                {primaryNutrition.water_liters} L
              </p>
            </div>
          ) : null}

          <div className="mt-3 divide-y divide-[#f0f1ec]">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-2 py-2.5 text-[10px]"
                >
                  <div>
                    <strong className="font-semibold text-[#22251f]">{log.title}</strong>
                    <span className="block text-[9px] text-[#73756e]">
                      {log.performed_at} · {log.duration_minutes} min
                    </span>
                  </div>
                  <span className="tabular-nums rounded-[2px] bg-[#22251f] px-2 py-0.5 text-[8px] font-bold text-[#d3f36b]">
                    RPE {log.effort_rpe}/10
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-[10px] text-[#73756e]">
                Sin sesiones registradas todavía.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

