<?php

declare(strict_types=1);

namespace Database\Seeders;

use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Modules\Nutrition\Application\DTOs\ListNutritionPlansFilterData;
use Modules\Nutrition\Application\DTOs\MealEntryInputData;
use Modules\Nutrition\Application\DTOs\SaveNutritionPlanData;
use Modules\Nutrition\Application\Services\NutritionService;
use Modules\Nutrition\Domain\Enums\MealSlot;
use Modules\Nutrition\Domain\Enums\NutritionGoal;
use Modules\Plans\Application\DTOs\CreatePlanData;
use Modules\Plans\Application\DTOs\ListPlansFilterData;
use Modules\Plans\Application\Services\PlanService;
use Modules\Scheduling\Application\DTOs\CreateClassSessionData;
use Modules\Scheduling\Application\DTOs\CreateWorkoutData;
use Modules\Scheduling\Application\Services\ScheduleService;
use Modules\Scheduling\Application\Services\WorkoutService;
use Modules\Scheduling\Domain\Enums\WorkoutLevel;
use Modules\Shared\Application\DTOs\PaginationQuery;
use Modules\Training\Application\DTOs\ListRoutinesFilterData;
use Modules\Training\Application\DTOs\RoutineExerciseInputData;
use Modules\Training\Application\DTOs\SaveRoutineData;
use Modules\Training\Application\Services\RoutineService;
use Modules\Training\Domain\Enums\RoutineGoal;

final class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedPlansAndSchedule();
        $this->seedRoutines();
        $this->seedNutritionPlans();
    }

    private function seedPlansAndSchedule(): void
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
                [$fuerza->id, 1, 'Sala Norte', 'Carlos Méndez', 7, 0, 45, 12, 8, '#CEF542'],
                [$boxeo->id, 1, 'Ring', 'Andrea Silva', 9, 30, 50, 10, 6, '#EF4444'],
                [$spinning->id, 1, 'Sala Sur', 'Mateo Rojas', 18, 0, 40, 14, 10, '#3B82F6'],
                [$yoga->id, 1, 'Sala Norte', 'Lucía Vargas', 19, 30, 50, 12, 7, '#A855F7'],
                [$spinning->id, 2, 'Sala Sur', 'Mateo Rojas', 7, 0, 40, 14, 9, '#3B82F6'],
                [$yoga->id, 2, 'Sala Norte', 'Lucía Vargas', 10, 0, 50, 12, 8, '#A855F7'],
                [$fuerza->id, 2, 'Sala Norte', 'Carlos Méndez', 17, 0, 45, 12, 10, '#CEF542'],
                [$boxeo->id, 2, 'Ring', 'Andrea Silva', 19, 0, 50, 10, 7, '#EF4444'],
                [$fuerza->id, 3, 'Sala Norte', 'Carlos Méndez', 7, 0, 45, 12, 8, '#CEF542'],
                [$boxeo->id, 3, 'Ring', 'Andrea Silva', 9, 30, 50, 10, 6, '#EF4444'],
                [$spinning->id, 3, 'Sala Sur', 'Mateo Rojas', 18, 0, 40, 14, 10, '#3B82F6'],
                [$yoga->id, 3, 'Sala Norte', 'Lucía Vargas', 19, 30, 50, 12, 7, '#A855F7'],
                [$fuerza->id, 4, 'Sala Norte', 'Carlos Méndez', 7, 0, 45, 12, 8, '#CEF542'],
                [$boxeo->id, 4, 'Ring', 'Andrea Silva', 9, 30, 50, 10, 6, '#EF4444'],
                [$spinning->id, 4, 'Sala Sur', 'Mateo Rojas', 18, 0, 40, 14, 10, '#3B82F6'],
                [$yoga->id, 4, 'Sala Norte', 'Lucía Vargas', 19, 30, 50, 12, 5, '#A855F7'],
                [$fuerza->id, 5, 'Sala Norte', 'Carlos Méndez', 7, 0, 45, 12, 9, '#CEF542'],
                [$boxeo->id, 5, 'Ring', 'Andrea Silva', 9, 30, 50, 10, 6, '#EF4444'],
                [$spinning->id, 5, 'Sala Sur', 'Mateo Rojas', 18, 0, 40, 14, 11, '#3B82F6'],
                [$yoga->id, 5, 'Sala Norte', 'Lucía Vargas', 19, 30, 50, 12, 8, '#A855F7'],
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

    private function seedRoutines(): void
    {
        $routineService = app(RoutineService::class);
        if ($routineService->list(new ListRoutinesFilterData(new PaginationQuery()))->total > 0) {
            return;
        }

        (void) $routineService->create(new SaveRoutineData(
            title: 'Fuerza e Hipertrofia · 4 días',
            goal: RoutineGoal::Hypertrophy,
            level: 'intermediate',
            daysPerWeek: 4,
            estimatedMinutes: 60,
            isTemplate: true,
            notes: 'Enfoque torso/pierna con progresión semanal de cargas.',
            exercises: [
                new RoutineExerciseInputData('Día 1 · Torso empuje', 'Press de banca con barra', 4, '6-8', '70 kg', 120, 1),
                new RoutineExerciseInputData('Día 1 · Torso empuje', 'Press militar con mancuernas', 3, '8-10', '20 kg c/u', 90, 2),
                new RoutineExerciseInputData('Día 2 · Tren inferior', 'Sentadilla trasera', 4, '6-8', '90 kg', 120, 3),
                new RoutineExerciseInputData('Día 2 · Tren inferior', 'Peso muerto rumano', 3, '8-10', '75 kg', 90, 4),
            ],
        ));

        (void) $routineService->create(new SaveRoutineData(
            title: 'Full Body Principiantes · 3 días',
            goal: RoutineGoal::Strength,
            level: 'beginner',
            daysPerWeek: 3,
            estimatedMinutes: 45,
            isTemplate: true,
            notes: 'Base técnica multiarticular para las primeras 6 semanas.',
            exercises: [
                new RoutineExerciseInputData('Sesión A', 'Sentadilla goblet con kettlebell', 3, '10-12', '16 kg', 75, 1),
                new RoutineExerciseInputData('Sesión A', 'Remo en polea baja', 3, '12', '35 kg', 60, 2),
                new RoutineExerciseInputData('Sesión B', 'Press inclinado con mancuernas', 3, '10', '14 kg c/u', 75, 3),
                new RoutineExerciseInputData('Sesión B', 'Plancha frontal', 3, '45 seg', 'Peso corporal', 45, 4),
            ],
        ));

        (void) $routineService->create(new SaveRoutineData(
            title: 'Acondicionamiento & Box · 4 días',
            goal: RoutineGoal::FatLoss,
            level: 'all_levels',
            daysPerWeek: 4,
            estimatedMinutes: 50,
            isTemplate: true,
            notes: 'Bloques metabólicos combinados con técnica de combate y core.',
            exercises: [
                new RoutineExerciseInputData('Circuito 1', 'Rounds de saco pesado (3 min)', 4, '3 min', null, 60, 1),
                new RoutineExerciseInputData('Circuito 1', 'Kettlebell swing', 4, '20', '20 kg', 45, 2),
                new RoutineExerciseInputData('Circuito 2', 'Saltos al cajón o step-ups', 3, '15', null, 45, 3),
            ],
        ));
    }

    private function seedNutritionPlans(): void
    {
        $nutritionService = app(NutritionService::class);
        if ($nutritionService->list(new ListNutritionPlansFilterData(new PaginationQuery()))->total > 0) {
            return;
        }

        (void) $nutritionService->create(new SaveNutritionPlanData(
            title: 'Definición Limpia · 1,900 kcal',
            goal: NutritionGoal::FatLoss,
            dailyCalories: 1900,
            proteinGrams: 155,
            carbsGrams: 175,
            fatsGrams: 62,
            waterLiters: 3.0,
            isTemplate: true,
            notes: 'Déficit moderado preservando masa magra.',
            meals: [
                new MealEntryInputData(MealSlot::Breakfast, 'Claras y avena con frutos', '2 huevos + 3 claras, 50 g avena, 80 g fresas', 430, 32, 46, 13, 1),
                new MealEntryInputData(MealSlot::Lunch, 'Pechuga asada y arroz integral', '180 g pechuga, 150 g arroz cocido, ensalada verde y aguacate', 680, 52, 66, 22, 2),
                new MealEntryInputData(MealSlot::Snack, 'Yogurt griego y almendras', '200 g yogurt griego natural sin azúcar + 18 g almendras', 270, 22, 12, 14, 3),
                new MealEntryInputData(MealSlot::Dinner, 'Salmón o atún con vegetales', '170 g pescado blanco/atún, 200 g camote al horno y brócoli', 520, 49, 51, 13, 4),
            ],
        ));

        (void) $nutritionService->create(new SaveNutritionPlanData(
            title: 'Mantenimiento Atlético · 2,400 kcal',
            goal: NutritionGoal::Maintenance,
            dailyCalories: 2400,
            proteinGrams: 168,
            carbsGrams: 265,
            fatsGrams: 74,
            waterLiters: 3.2,
            isTemplate: true,
            notes: 'Energía estable para 4 sesiones semanales de fuerza y cardio.',
            meals: [
                new MealEntryInputData(MealSlot::Breakfast, 'Huevos revueltos y pan masa madre', '3 huevos enteros, 2 rebanadas masa madre, 1/2 aguacate', 560, 29, 44, 29, 1),
                new MealEntryInputData(MealSlot::MidMorning, 'Batido post-entreno', '1 scoop proteína whey, 1 plátano, 250 ml leche descremada', 340, 34, 42, 4, 2),
                new MealEntryInputData(MealSlot::Lunch, 'Res magra con pasta o papa', '200 g carne magra, 250 g papa cocida, pimientos salteados', 790, 55, 88, 22, 3),
                new MealEntryInputData(MealSlot::Dinner, 'Tacos de pollo y frijoles', '170 g pollo deshebrado, 3 tortillas maíz, 80 g frijol negro', 710, 50, 91, 19, 4),
            ],
        ));

        (void) $nutritionService->create(new SaveNutritionPlanData(
            title: 'Superávit Magro · 2,950 kcal',
            goal: NutritionGoal::MuscleGain,
            dailyCalories: 2950,
            proteinGrams: 185,
            carbsGrams: 355,
            fatsGrams: 85,
            waterLiters: 3.5,
            isTemplate: true,
            notes: 'Enfocado en ganancia muscular progresiva.',
            meals: [
                new MealEntryInputData(MealSlot::Breakfast, 'Hotcakes de avena y crema de cacahuate', '80 g avena, 3 huevos, 1 plátano, 20 g crema de cacahuate', 740, 34, 88, 26, 1),
                new MealEntryInputData(MealSlot::Lunch, 'Pollo teriyaki con arroz blanco', '220 g pollo, 280 g arroz cocido, verduras al vapor', 920, 62, 125, 18, 2),
                new MealEntryInputData(MealSlot::Snack, 'Sandwich integral de pavo y queso', '120 g pechuga pavo, 2 panes integrales, 30 g queso panela', 490, 36, 48, 16, 3),
                new MealEntryInputData(MealSlot::Dinner, 'Salmón sellado con quinoa y camote', '190 g salmón, 180 g quinoa cocida, ensalada con aceite de oliva', 800, 53, 94, 25, 4),
            ],
        ));
    }
}
