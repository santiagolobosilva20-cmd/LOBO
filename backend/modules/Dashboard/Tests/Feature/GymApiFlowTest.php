<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('runs full gym workflow with memberships, routines, workout logs and nutrition plans', function (): void {
    $planId = $this->postJson('/api/v1/plans', [
        'name' => 'Mensualidad',
        'tagline' => '02 / FAVORITO LOBO',
        'price_cents' => 89000,
        'duration_days' => 30,
        'billing_period_label' => 'mes',
        'features' => ['Acceso ilimitado', 'Clases grupales incluidas'],
        'is_featured' => true,
    ])->assertCreated()->json('data.id');

    $paymentResponse = $this->postJson('/api/v1/payments', [
        'member_name' => 'Alex Rivera',
        'plan_id' => $planId,
        'payment_method' => 'cash',
        'paid_at' => now()->toDateString(),
    ])->assertCreated()
        ->assertJsonPath('data.member_name', 'Alex Rivera')
        ->assertJsonPath('data.formatted_amount', '$890.00');

    $memberId = $paymentResponse->json('data.member_id');

    $membershipsResponse = $this->getJson('/api/v1/memberships')
        ->assertOk()
        ->assertJsonPath('stats.active_count', 1)
        ->assertJsonPath('data.0.member_name', 'Alex Rivera')
        ->assertJsonPath('data.0.status', 'active');

    $membershipId = $membershipsResponse->json('data.0.id');

    $this->postJson("/api/v1/memberships/{$membershipId}/pause")
        ->assertOk()
        ->assertJsonPath('data.status', 'paused');

    $this->postJson("/api/v1/memberships/{$membershipId}/resume")
        ->assertOk()
        ->assertJsonPath('data.status', 'active');

    $routineId = $this->postJson('/api/v1/routines', [
        'title' => 'Fuerza Base 4D',
        'goal' => 'strength',
        'level' => 'intermediate',
        'days_per_week' => 4,
        'estimated_minutes' => 55,
        'is_template' => true,
        'exercises' => [
            [
                'day_label' => 'Día 1 · Tren inferior',
                'exercise_name' => 'Sentadilla trasera',
                'sets' => 4,
                'reps' => '6-8',
                'target_weight' => '80 kg',
                'rest_seconds' => 120,
            ],
        ],
    ])->assertCreated()->json('data.id');

    $assignedRoutineId = $this->postJson("/api/v1/routines/{$routineId}/assign", [
        'member_id' => $memberId,
    ])->assertCreated()
        ->assertJsonPath('data.member_name', 'Alex Rivera')
        ->assertJsonPath('data.is_template', false)
        ->json('data.id');

    $workoutId = $this->postJson('/api/v1/workouts', [
        'name' => 'Fuerza funcional',
        'category' => 'FUERZA',
        'default_duration_minutes' => 45,
        'badge_label' => 'TODOS LOS NIVELES',
    ])->assertCreated()->json('data.id');

    $this->postJson('/api/v1/workout-logs', [
        'member_id' => $memberId,
        'workout_id' => $workoutId,
        'routine_id' => $assignedRoutineId,
        'title' => 'Sesión Día 1 · Sentadilla',
        'category' => 'FUERZA',
        'duration_minutes' => 50,
        'effort_rpe' => 8,
        'calories_estimate' => 420,
    ])->assertCreated()
        ->assertJsonPath('data.member_name', 'Alex Rivera')
        ->assertJsonPath('data.effort_rpe', 8);

    $nutritionId = $this->postJson('/api/v1/nutrition/plans', [
        'title' => 'Mantenimiento Atlético',
        'goal' => 'maintenance',
        'daily_calories' => 2400,
        'protein_grams' => 165,
        'carbs_grams' => 260,
        'fats_grams' => 75,
        'water_liters' => 3.0,
        'is_template' => true,
        'meals' => [
            [
                'meal_slot' => 'breakfast',
                'title' => 'Avena proteica y huevos',
                'foods_summary' => '3 huevos, 60 g avena, frutos rojos',
                'calories' => 540,
                'protein_grams' => 36,
                'carbs_grams' => 52,
                'fats_grams' => 19,
            ],
        ],
    ])->assertCreated()->json('data.id');

    $this->postJson("/api/v1/nutrition/plans/{$nutritionId}/assign", [
        'member_id' => $memberId,
    ])->assertCreated()
        ->assertJsonPath('data.member_name', 'Alex Rivera')
        ->assertJsonPath('data.daily_calories', 2400);

    $sessionId = $this->postJson('/api/v1/schedule/sessions', [
        'workout_id' => $workoutId,
        'day_of_week' => now()->dayOfWeekIso <= 6 ? now()->dayOfWeekIso : 1,
        'room' => 'Sala Norte',
        'instructor_name' => 'Carlos Méndez',
        'starts_at' => now()->setTime(7, 0)->toIso8601String(),
        'duration_minutes' => 45,
        'capacity' => 12,
        'enrolled_count' => 8,
    ])->assertCreated()->json('data.id');

    $this->postJson("/api/v1/schedule/sessions/{$sessionId}/enroll")
        ->assertOk()
        ->assertJsonPath('data.enrolled_count', 9);

    $this->getJson('/api/v1/dashboard/summary')
        ->assertOk()
        ->assertJsonPath('data.kpis.formatted_monthly_revenue', '$890.00')
        ->assertJsonPath('data.kpis.active_members_count', 1)
        ->assertJsonPath('data.kpis.active_memberships_count', 1)
        ->assertJsonPath('data.kpis.monthly_payments_count', 1)
        ->assertJsonPath('data.recent_payments.0.member_name', 'Alex Rivera')
        ->assertJsonPath('data.featured_sessions.0.workout_name', 'Fuerza funcional');
});
