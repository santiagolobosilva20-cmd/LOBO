import { useQuery } from '@tanstack/react-query';
import { requestJson } from '../../shared/api/http';
import type { PaginatedResponse, WorkoutItem } from '../../shared/api/types';

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
  const workoutsQuery = useQuery({
    queryKey: ['workouts'],
    queryFn: () => requestJson<PaginatedResponse<WorkoutItem>>('/workouts?per_page=20'),
    retry: false,
  });

  const workouts = workoutsQuery.data?.data?.length ? workoutsQuery.data.data : DEFAULT_WORKOUTS;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
          Entrena con intención
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#17191C] sm:text-3xl">
          Entrenamientos
        </h1>
        <p className="mt-1 text-xs text-[#6B7280] sm:text-sm">
          Clases para ganar fuerza, energía y confianza.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {workouts.map((workout, idx) => {
          const orderNum = String(workout.display_order || idx + 1).padStart(2, '0');
          const imgSrc = workout.image_url || DEFAULT_WORKOUTS[idx % DEFAULT_WORKOUTS.length].image_url!;

          return (
            <article
              key={workout.id}
              className="relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-2xl bg-[#16181A] p-6 text-white"
            >
              <img
                src={imgSrc}
                alt={workout.name}
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25"
                aria-hidden="true"
              />

              <span className="tabular-nums absolute top-5 right-6 text-sm font-semibold text-white/65">
                {orderNum}
              </span>

              <div className="relative z-10 max-w-md">
                <p className="text-[10px] font-bold tracking-wider text-[#CEF542] uppercase">
                  {workout.category} · {workout.default_duration_minutes} MIN
                </p>
                <h2 className="mt-1.5 text-2xl font-bold tracking-tight">{workout.name}</h2>
                {workout.description ? (
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-200">{workout.description}</p>
                ) : null}
                <span className="mt-4 inline-flex rounded-md bg-[#CEF542] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-[#17191C] uppercase">
                  {workout.badge_label}
                </span>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
