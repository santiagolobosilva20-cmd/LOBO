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
    <div>
      <div className="mt-[9px] mb-[19px] flex flex-wrap items-end justify-between gap-[18px] md:mt-3 md:mb-6">
        <div>
          <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
            ENTRENA CON INTENCIÓN
          </span>
          <h1 className="font-display mt-[7px] text-[25px] leading-[1.15] font-semibold text-[#22251f] sm:text-[29px]">
            Entrenamientos
          </h1>
          <p className="mt-[7px] max-w-[240px] text-[11px] leading-normal text-[#83857d] sm:max-w-none">
            Clases para ganar fuerza, energía y confianza.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-[13px] md:grid-cols-2">
        {workouts.map((workout, idx) => {
          const orderNum = String(workout.display_order || idx + 1).padStart(2, '0');
          const imgSrc = workout.image_url || DEFAULT_WORKOUTS[idx % DEFAULT_WORKOUTS.length].image_url!;

          return (
            <article
              key={workout.id}
              className="relative flex min-h-[205px] items-end overflow-hidden bg-[#181c17] p-[21px] text-white sm:min-h-[226px]"
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

              <span className="font-display tabular-nums absolute top-[15px] right-[18px] z-10 text-[18px] font-semibold text-white/80">
                {orderNum}
              </span>

              <div className="relative z-10">
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
                <span className="mt-3 inline-block bg-[#d3f36b] px-[7px] py-[5px] text-[7px] font-bold text-[#22251f] uppercase">
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
