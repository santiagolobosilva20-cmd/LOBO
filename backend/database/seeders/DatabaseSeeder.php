<?php

declare(strict_types=1);

namespace Database\Seeders;

use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Modules\Plans\Application\DTOs\CreatePlanData;
use Modules\Plans\Application\DTOs\ListPlansFilterData;
use Modules\Plans\Application\Services\PlanService;
use Modules\Scheduling\Application\DTOs\CreateClassSessionData;
use Modules\Scheduling\Application\DTOs\CreateWorkoutData;
use Modules\Scheduling\Application\Services\ScheduleService;
use Modules\Scheduling\Application\Services\WorkoutService;
use Modules\Scheduling\Domain\Enums\WorkoutLevel;
use Modules\Shared\Application\DTOs\PaginationQuery;

final class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $planService = app(PlanService::class);
        $workoutService = app(WorkoutService::class);
        $scheduleService = app(ScheduleService::class);

        if ($planService->list(new ListPlansFilterData(new PaginationQuery()))->total === 0) {
            (void) $planService->create(new CreatePlanData(
                name: 'Pase diario',
                priceCents: 12000,
                durationDays: 1,
                tagline: '01 / A TU RITMO',
                billingPeriodLabel: 'día',
                description: 'Un día completo para conocer el club y entrenar sin límites.',
                features: ['Acceso por un día', 'Zona de peso libre', 'Cardio y vestidores'],
                isFeatured: false,
            ));
            (void) $planService->create(new CreatePlanData(
                name: 'Mensualidad',
                priceCents: 89000,
                durationDays: 30,
                tagline: '02 / FAVORITO LOBO',
                billingPeriodLabel: 'mes',
                description: 'Entrena a tu horario, tantas veces como quieras.',
                features: ['Acceso ilimitado', 'Clases grupales incluidas', 'Evaluación inicial'],
                isFeatured: true,
            ));
            (void) $planService->create(new CreatePlanData(
                name: 'Trimestral',
                priceCents: 235000,
                durationDays: 90,
                tagline: '03 / EN EQUIPO',
                billingPeriodLabel: '3 meses',
                description: 'Tres meses para convertir el progreso en hábito.',
                features: ['Todo lo del plan mensual', 'Plan de entrenamiento', 'Una sesión de seguimiento'],
                isFeatured: false,
            ));
        }

        if ($workoutService->list(new PaginationQuery())->total === 0) {
            $fuerza = $workoutService->create(new CreateWorkoutData(
                name: 'Fuerza funcional',
                category: 'FUERZA',
                level: WorkoutLevel::AllLevels,
                defaultDurationMinutes: 45,
                badgeLabel: 'TODOS LOS NIVELES',
                imageUrl: '/images/workout-fuerza.jpg',
                displayOrder: 1,
                description: 'Movimientos compuestos, técnica y fuerza que se nota fuera del gimnasio.',
            ));
            $boxeo = $workoutService->create(new CreateWorkoutData(
                name: 'Boxeo',
                category: 'COMBATE',
                level: WorkoutLevel::AllLevels,
                defaultDurationMinutes: 50,
                badgeLabel: 'GUANTES DISPONIBLES',
                imageUrl: '/images/workout-boxeo.jpg',
                displayOrder: 2,
                description: 'Golpes, coordinación y acondicionamiento. Saca todo en el ring.',
            ));
            $spinning = $workoutService->create(new CreateWorkoutData(
                name: 'Spinning',
                category: 'CARDIO',
                level: WorkoutLevel::AllLevels,
                defaultDurationMinutes: 40,
                badgeLabel: 'BICICLETA RESERVADA',
                imageUrl: '/images/workout-spinning.jpg',
                displayOrder: 3,
                description: 'Ritmo, resistencia y una playlist que no te deja bajar la intensidad.',
            ));
            $yoga = $workoutService->create(new CreateWorkoutData(
                name: 'Yoga y movilidad',
                category: 'MOVILIDAD',
                level: WorkoutLevel::AllLevels,
                defaultDurationMinutes: 50,
                badgeLabel: 'TAPETE INCLUIDO',
                imageUrl: '/images/workout-yoga.jpg',
                displayOrder: 4,
                description: 'Respira, recupera y encuentra espacio para moverte mejor.',
            ));

            $baseDate = CarbonImmutable::today();
            $scheduleRows = [
                // Lunes (1)
                [$fuerza->id, 1, 'Sala Norte', 'Carlos Méndez', 7, 0, 45, 12, 8, '#CEF542'],
                [$boxeo->id, 1, 'Ring', 'Andrea Silva', 9, 30, 50, 10, 6, '#EF4444'],
                [$spinning->id, 1, 'Sala Sur', 'Mateo Rojas', 18, 0, 40, 14, 10, '#3B82F6'],
                [$yoga->id, 1, 'Sala Norte', 'Lucía Vargas', 19, 30, 50, 12, 7, '#A855F7'],
                // Martes (2)
                [$spinning->id, 2, 'Sala Sur', 'Mateo Rojas', 7, 0, 40, 14, 9, '#3B82F6'],
                [$yoga->id, 2, 'Sala Norte', 'Lucía Vargas', 10, 0, 50, 12, 8, '#A855F7'],
                [$fuerza->id, 2, 'Sala Norte', 'Carlos Méndez', 17, 0, 45, 12, 10, '#CEF542'],
                [$boxeo->id, 2, 'Ring', 'Andrea Silva', 19, 0, 50, 10, 7, '#EF4444'],
                // Miércoles (3)
                [$fuerza->id, 3, 'Sala Norte', 'Carlos Méndez', 7, 0, 45, 12, 8, '#CEF542'],
                [$boxeo->id, 3, 'Ring', 'Andrea Silva', 9, 30, 50, 10, 6, '#EF4444'],
                [$spinning->id, 3, 'Sala Sur', 'Mateo Rojas', 18, 0, 40, 14, 10, '#3B82F6'],
                [$yoga->id, 3, 'Sala Norte', 'Lucía Vargas', 19, 30, 50, 12, 7, '#A855F7'],
                // Jueves (4)
                [$fuerza->id, 4, 'Sala Norte', 'Carlos Méndez', 7, 0, 45, 12, 8, '#CEF542'],
                [$boxeo->id, 4, 'Ring', 'Andrea Silva', 9, 30, 50, 10, 6, '#EF4444'],
                [$spinning->id, 4, 'Sala Sur', 'Mateo Rojas', 18, 0, 40, 14, 10, '#3B82F6'],
                [$yoga->id, 4, 'Sala Norte', 'Lucía Vargas', 19, 30, 50, 12, 5, '#A855F7'],
                // Viernes (5)
                [$fuerza->id, 5, 'Sala Norte', 'Carlos Méndez', 7, 0, 45, 12, 9, '#CEF542'],
                [$boxeo->id, 5, 'Ring', 'Andrea Silva', 9, 30, 50, 10, 6, '#EF4444'],
                [$spinning->id, 5, 'Sala Sur', 'Mateo Rojas', 18, 0, 40, 14, 11, '#3B82F6'],
                [$yoga->id, 5, 'Sala Norte', 'Lucía Vargas', 19, 30, 50, 12, 8, '#A855F7'],
                // Sábado (6)
                [$spinning->id, 6, 'Sala Sur', 'Mateo Rojas', 8, 0, 40, 14, 9, '#3B82F6'],
                [$fuerza->id, 6, 'Sala Norte', 'Carlos Méndez', 9, 30, 45, 12, 8, '#CEF542'],
                [$boxeo->id, 6, 'Ring', 'Andrea Silva', 11, 0, 50, 10, 6, '#EF4444'],
            ];

            foreach ($scheduleRows as [$wId, $day, $room, $coach, $hour, $minute, $dur, $cap, $enrolled, $color]) {
                (void) $scheduleService->create(new CreateClassSessionData(
                    workoutId: $wId,
                    room: $room,
                    instructorName: $coach,
                    startsAt: $baseDate->setTime($hour, $minute),
                    durationMinutes: $dur,
                    capacity: $cap,
                    dayOfWeek: $day,
                    enrolledCount: $enrolled,
                    accentColor: $color,
                ));
            }
        }
    }
}
