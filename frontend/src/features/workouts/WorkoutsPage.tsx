import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ApiError, requestJson } from '../../shared/api/http';
import type {
  PaginatedResponse,
  SingleResponse,
  WorkoutItem,
  WorkoutLevel,
  WorkoutLogItem,
} from '../../shared/api/types';
import { useToast } from '../../shared/components/ToastContext';
import { getMemberInitials } from '../../shared/utils/format';

const DEFAULT_WORKOUTS: WorkoutItem[] = [
  {
    id: 1,
    name: 'Fuerza funcional',
    slug: 'fuerza-funcional',
    category: 'FUERZA',
    level: 'all_levels',
    default_duration_minutes: 45,
    badge_label: 'TODOS LOS NIVELES',
    image_url: '/images/workout-fuerza.jpg',
    display_order: 1,
    description: 'Movimientos compuestos, técnica y fuerza que se nota fuera del gimnasio.',
    created_at: null,
  },
  {
    id: 2,
    name: 'Boxeo',
    slug: 'boxeo',
    category: 'COMBATE',
    level: 'all_levels',
    default_duration_minutes: 50,
    badge_label: 'GUANTES DISPONIBLES',
    image_url: '/images/workout-boxeo.jpg',
    display_order: 2,
    description: 'Golpes, coordinación y acondicionamiento. Saca todo en el ring.',
    created_at: null,
  },
  {
    id: 3,
    name: 'Spinning',
    slug: 'spinning',
    category: 'CARDIO',
    level: 'all_levels',
    default_duration_minutes: 40,
    badge_label: 'BICICLETA RESERVADA',
    image_url: '/images/workout-spinning.jpg',
    display_order: 3,
    description: 'Ritmo, resistencia y una playlist que no te deja bajar la intensidad.',
    created_at: null,
  },
  {
    id: 4,
    name: 'Yoga y movilidad',
    slug: 'yoga-y-movilidad',
    category: 'MOVILIDAD',
    level: 'all_levels',
    default_duration_minutes: 50,
    badge_label: 'TAPETE INCLUIDO',
    image_url: '/images/workout-yoga.jpg',
    display_order: 4,
    description: 'Respira, recupera y encuentra espacio para moverte mejor.',
    created_at: null,
  },
];

export function WorkoutsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logMemberName, setLogMemberName] = useState('');
  const [logWorkoutId, setLogWorkoutId] = useState('');
  const [logTitle, setLogTitle] = useState('Entrenamiento funcional');
  const [logCategory, setLogCategory] = useState('FUERZA');
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [logDuration, setLogDuration] = useState('45');
  const [logRpe, setLogRpe] = useState('8');
  const [logCalories, setLogCalories] = useState('380');
  const [logNotes, setLogNotes] = useState('');
  const [logError, setLogError] = useState('');

  const [disciplineModalOpen, setDisciplineModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutItem | null>(null);
  const [wName, setWName] = useState('');
  const [wCategory, setWCategory] = useState('FUERZA');
  const [wLevel, setWLevel] = useState<WorkoutLevel>('all_levels');
  const [wDuration, setWDuration] = useState('45');
  const [wBadge, setWBadge] = useState('TODOS LOS NIVELES');
  const [wDesc, setWDesc] = useState('');
  const [wError, setWError] = useState('');

  const workoutsQuery = useQuery({
    queryKey: ['workouts'],
    queryFn: () => requestJson<PaginatedResponse<WorkoutItem>>('/workouts?per_page=20'),
    retry: false,
  });

  const logsQuery = useQuery({
    queryKey: ['workout-logs'],
    queryFn: () => requestJson<PaginatedResponse<WorkoutLogItem>>('/workout-logs?per_page=20'),
    retry: false,
  });

  const recordLogMutation = useMutation({
    mutationFn: () =>
      requestJson<SingleResponse<WorkoutLogItem>>('/workout-logs', {
        method: 'POST',
        body: JSON.stringify({
          member_name: logMemberName.trim(),
          workout_id: logWorkoutId !== '' ? Number(logWorkoutId) : null,
          title: logTitle.trim(),
          category: logCategory.trim(),
          performed_at: logDate,
          duration_minutes: Number(logDuration) || 45,
          effort_rpe: Number(logRpe) || 7,
          calories_estimate: logCalories !== '' ? Number(logCalories) : null,
          notes: logNotes.trim() !== '' ? logNotes.trim() : null,
        }),
      }),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['workout-logs'] });
      await queryClient.invalidateQueries({ queryKey: ['members'] });
      showToast(`Sesión "${res.data.title}" registrada para ${res.data.member_name}.`);
      setLogModalOpen(false);
    },
    onError: (err) => {
      setLogError(err instanceof ApiError ? err.message : 'No se pudo guardar el entrenamiento.');
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: (id: number) => requestJson<void>(`/workout-logs/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workout-logs'] });
      showToast('Registro de entrenamiento eliminado.');
    },
  });

  const saveWorkoutMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: wName.trim(),
        category: wCategory.trim().toUpperCase(),
        level: wLevel,
        default_duration_minutes: Number(wDuration) || 45,
        badge_label: wBadge.trim().toUpperCase(),
        image_url: editingWorkout?.image_url ?? '/images/workout-fuerza.jpg',
        display_order: editingWorkout?.display_order ?? (workouts.length + 1),
        description: wDesc.trim() !== '' ? wDesc.trim() : null,
      };
      return editingWorkout
        ? requestJson<SingleResponse<WorkoutItem>>(`/workouts/${editingWorkout.id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        : requestJson<SingleResponse<WorkoutItem>>('/workouts', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['workouts'] });
      showToast(`Disciplina "${res.data.name}" guardada.`);
      setDisciplineModalOpen(false);
    },
    onError: (err) => {
      setWError(err instanceof ApiError ? err.message : 'No se pudo guardar la disciplina.');
    },
  });

  const workouts = workoutsQuery.data?.data?.length ? workoutsQuery.data.data : DEFAULT_WORKOUTS;
  const logs = logsQuery.data?.data ?? [];

  const openLogForWorkout = (workout?: WorkoutItem) => {
    setLogMemberName('');
    setLogWorkoutId(workout ? String(workout.id) : '');
    setLogTitle(workout ? workout.name : 'Sesión libre de fuerza');
    setLogCategory(workout ? workout.category : 'FUERZA');
    setLogDuration(workout ? String(workout.default_duration_minutes) : '45');
    setLogRpe('8');
    setLogCalories('380');
    setLogNotes('');
    setLogError('');
    setLogModalOpen(true);
  };

  const openDisciplineModal = (workout: WorkoutItem | null) => {
    setEditingWorkout(workout);
    setWName(workout?.name ?? '');
    setWCategory(workout?.category ?? 'FUERZA');
    setWLevel(workout?.level ?? 'all_levels');
    setWDuration(String(workout?.default_duration_minutes ?? 45));
    setWBadge(workout?.badge_label ?? 'TODOS LOS NIVELES');
    setWDesc(workout?.description ?? '');
    setWError('');
    setDisciplineModalOpen(true);
  };

  const handleLogSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLogError('');
    if (logMemberName.trim().length < 2) {
      setLogError('Ingresa el nombre del socio.');
      return;
    }
    recordLogMutation.mutate();
  };

  const handleWorkoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    setWError('');
    if (wName.trim().length < 2) {
      setWError('Ingresa el nombre de la disciplina.');
      return;
    }
    saveWorkoutMutation.mutate();
  };

  return (
    <div>
      <div className="mt-[9px] mb-[19px] flex flex-wrap items-end justify-between gap-[18px] md:mt-3 md:mb-6">
        <div>
          <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
            ENTRENA CON INTENCIÓN
          </span>
          <h1 className="font-display mt-[7px] text-[25px] leading-[1.15] font-semibold text-[#22251f] sm:text-[29px]">
            Entrenamientos
          </h1>
          <p className="mt-[7px] max-w-[300px] text-[11px] leading-normal text-[#83857d] sm:max-w-none">
            Disciplinas del club y bitácora de sesiones completadas por socio.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openLogForWorkout()}
            className="inline-flex min-h-[39px] items-center justify-center gap-[9px] rounded-[3px] bg-[#d3f36b] px-[15px] text-[10px] font-bold text-[#22251f] transition-all hover:-translate-y-px hover:bg-[#c5eb50]"
          >
            <span className="text-[15px] leading-none">＋</span> Registrar sesión
          </button>
          <button
            type="button"
            onClick={() => openDisciplineModal(null)}
            className="inline-flex min-h-[39px] items-center justify-center gap-[9px] rounded-[3px] bg-[#22251f] px-[15px] text-[10px] font-bold text-white transition-all hover:-translate-y-px hover:bg-[#3b4037]"
          >
            <span className="text-[15px] leading-none">＋</span> Nueva disciplina
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-[13px] md:grid-cols-2">
        {workouts.map((workout, idx) => {
          const orderNum = String(workout.display_order || idx + 1).padStart(2, '0');
          const imgSrc = workout.image_url || DEFAULT_WORKOUTS[idx % DEFAULT_WORKOUTS.length].image_url!;

          return (
            <article
              key={workout.id}
              className="group relative flex min-h-[205px] items-end overflow-hidden bg-[#181c17] p-[21px] text-white sm:min-h-[226px]"
            >
              <img
                src={imgSrc}
                alt={workout.name}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div
                className="absolute inset-0 bg-gradient-to-b from-[#181c170f] to-[#181c17f0]"
                aria-hidden="true"
              />

              <div className="absolute top-[15px] right-[18px] z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openDisciplineModal(workout)}
                  aria-label={`Editar ${workout.name}`}
                  className="grid h-7 w-7 place-items-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#d3f36b] hover:text-[#22251f] focus:opacity-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <span className="font-display tabular-nums text-[18px] font-semibold text-white/80">
                  {orderNum}
                </span>
              </div>

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
                    onClick={() => openLogForWorkout(workout)}
                    className="border border-white/30 bg-black/45 px-2.5 py-[4px] text-[8px] font-bold text-white uppercase hover:bg-white hover:text-[#22251f]"
                  >
                    + Registrar sesión
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <div className="mt-[18px] overflow-hidden rounded-[3px] border border-[#e7e8e2] bg-white">
        <div className="flex min-h-[70px] items-center justify-between gap-3 px-[18px] py-[14px]">
          <div>
            <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
              SEGUIMIENTO DE ACTIVIDAD
            </span>
            <h2 className="font-display mt-1 text-[15px] font-semibold text-[#22251f]">
              Bitácora de entrenamientos
            </h2>
          </div>
          <span className="text-[9px] font-semibold text-[#85877f]">
            {logs.length} sesiones recientes
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#f8f9f5]">
              <tr>
                <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                  Socio
                </th>
                <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                  Entrenamiento
                </th>
                <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                  Fecha
                </th>
                <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                  Duración / RPE
                </th>
                <th className="px-[13px] py-[10px] text-right text-[8px] font-bold text-[#92948c] uppercase">
                  Kcal / Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={log.id} className="border-b border-[#f0f1ec] last:border-b-0">
                  <td className="px-[13px] py-[11px] text-[10px]">
                    <span className="flex items-center gap-2 font-semibold text-[#22251f]">
                      <span
                        className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full text-[8px] font-bold text-[#262820] ${
                          idx % 2 === 0 ? 'bg-[#d9ef9f]' : 'bg-[#ffd3c8]'
                        }`}
                      >
                        {getMemberInitials(log.member_name)}
                      </span>
                      {log.member_name}
                    </span>
                  </td>
                  <td className="px-[13px] py-[11px] text-[10px]">
                    <strong className="font-semibold text-[#22251f]">{log.title}</strong>
                    <span className="ml-2 text-[8px] font-bold text-[#8b8e84] uppercase">
                      {log.category}
                    </span>
                  </td>
                  <td className="tabular-nums px-[13px] py-[11px] text-[10px] text-[#666960]">
                    {log.performed_at}
                  </td>
                  <td className="tabular-nums px-[13px] py-[11px] text-[10px] text-[#22251f]">
                    {log.duration_minutes} min · RPE {log.effort_rpe}/10
                  </td>
                  <td className="tabular-nums px-[13px] py-[11px] text-right text-[10px] text-[#666960]">
                    <span className="mr-3">
                      {log.calories_estimate ? `${log.calories_estimate} kcal` : '—'}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteLogMutation.mutate(log.id)}
                      aria-label={`Eliminar sesión de ${log.member_name}`}
                      className="inline-flex rounded-[3px] p-1 text-[#85877f] hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 ? (
          <div className="px-5 py-9 text-center text-[#73756e]">
            <strong className="font-display block text-[13px] font-semibold text-[#22251f]">
              Aún no hay sesiones registradas
            </strong>
            <p className="mt-1 text-[10px]">
              Pulsa &ldquo;Registrar sesión&rdquo; para llevar el seguimiento de cada socio.
            </p>
          </div>
        ) : null}
      </div>

      {logModalOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c201b]/75 p-3.5 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              onClick={(e) => {
                if (e.target === e.currentTarget) setLogModalOpen(false);
              }}
            >
              <div className="w-[min(460px,100%)] rounded-[4px] bg-white p-6 shadow-[0_20px_70px_rgba(23,26,22,0.44)]">
                <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
                  BITÁCORA LOBO
                </span>
                <h2 className="font-display mt-1 text-[21px] font-semibold text-[#22251f]">
                  Registrar entrenamiento
                </h2>
                <form onSubmit={handleLogSubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                      Nombre del socio
                    </label>
                    <input
                      type="text"
                      autoFocus
                      required
                      value={logMemberName}
                      onChange={(e) => setLogMemberName(e.target.value)}
                      placeholder="Ej. Alex Rivera"
                      className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Sesión / Título
                      </label>
                      <input
                        type="text"
                        required
                        value={logTitle}
                        onChange={(e) => setLogTitle(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Categoría
                      </label>
                      <input
                        type="text"
                        value={logCategory}
                        onChange={(e) => setLogCategory(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    <div className="col-span-2">
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Fecha</label>
                      <input
                        type="date"
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Min</label>
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={logDuration}
                        onChange={(e) => setLogDuration(e.target.value)}
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
                        value={logRpe}
                        onChange={(e) => setLogRpe(e.target.value)}
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
                        value={logCalories}
                        onChange={(e) => setLogCalories(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Notas</label>
                      <input
                        type="text"
                        value={logNotes}
                        onChange={(e) => setLogNotes(e.target.value)}
                        placeholder="PRs o sensaciones"
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                  </div>
                  {logError ? <p className="text-[11px] text-red-600">{logError}</p> : null}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setLogModalOpen(false)}
                      className="min-h-[38px] flex-1 rounded-[3px] border border-[#e2e4dc] text-[10px] font-bold text-[#686b63]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={recordLogMutation.isPending}
                      className="min-h-[38px] flex-1 rounded-[3px] bg-[#22251f] text-[10px] font-bold text-white"
                    >
                      {recordLogMutation.isPending ? 'Guardando...' : 'Guardar sesión'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      {disciplineModalOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c201b]/75 p-3.5 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              onClick={(e) => {
                if (e.target === e.currentTarget) setDisciplineModalOpen(false);
              }}
            >
              <div className="w-[min(440px,100%)] rounded-[4px] bg-white p-6 shadow-[0_20px_70px_rgba(23,26,22,0.44)]">
                <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
                  CATÁLOGO DE DISCIPLINAS
                </span>
                <h2 className="font-display mt-1 text-[21px] font-semibold text-[#22251f]">
                  {editingWorkout ? 'Editar disciplina' : 'Nueva disciplina'}
                </h2>
                <form onSubmit={handleWorkoutSubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Nombre</label>
                    <input
                      type="text"
                      required
                      value={wName}
                      onChange={(e) => setWName(e.target.value)}
                      className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Categoría
                      </label>
                      <input
                        type="text"
                        required
                        value={wCategory}
                        onChange={(e) => setWCategory(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Nivel</label>
                      <select
                        value={wLevel}
                        onChange={(e) => setWLevel(e.target.value as WorkoutLevel)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-2 text-[11px]"
                      >
                        <option value="all_levels">Todos</option>
                        <option value="beginner">Inicial</option>
                        <option value="intermediate">Intermedio</option>
                        <option value="advanced">Avanzado</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Minutos
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={240}
                        value={wDuration}
                        onChange={(e) => setWDuration(e.target.value)}
                        className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2 text-[11px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                      Etiqueta destacada
                    </label>
                    <input
                      type="text"
                      value={wBadge}
                      onChange={(e) => setWBadge(e.target.value)}
                      className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={wDesc}
                      onChange={(e) => setWDesc(e.target.value)}
                      className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                    />
                  </div>
                  {wError ? <p className="text-[11px] text-red-600">{wError}</p> : null}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDisciplineModalOpen(false)}
                      className="min-h-[38px] flex-1 rounded-[3px] border border-[#e2e4dc] text-[10px] font-bold text-[#686b63]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saveWorkoutMutation.isPending}
                      className="min-h-[38px] flex-1 rounded-[3px] bg-[#22251f] text-[10px] font-bold text-white"
                    >
                      {saveWorkoutMutation.isPending ? 'Guardando...' : 'Guardar disciplina'}
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
