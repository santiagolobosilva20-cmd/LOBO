<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('runs full gym workflow registering payment by member name and updating dashboard kpis', function (): void {
    $planId = $this->postJson('/api/v1/plans', [
        'name' => 'Mensualidad',
        'tagline' => '02 / FAVORITO LOBO',
        'price_cents' => 89000,
        'duration_days' => 30,
        'billing_period_label' => 'mes',
        'features' => ['Acceso ilimitado', 'Clases grupales incluidas'],
        'is_featured' => true,
    ])->assertCreated()->json('data.id');

    $this->postJson('/api/v1/payments', [
        'member_name' => 'Alex Rivera',
        'plan_id' => $planId,
        'payment_method' => 'cash',
        'paid_at' => now()->toDateString(),
    ])->assertCreated()
        ->assertJsonPath('data.member_name', 'Alex Rivera')
        ->assertJsonPath('data.formatted_amount', '$890.00');

    $workoutId = $this->postJson('/api/v1/workouts', [
        'name' => 'Fuerza funcional',
        'category' => 'FUERZA',
        'default_duration_minutes' => 45,
        'badge_label' => 'TODOS LOS NIVELES',
    ])->assertCreated()->json('data.id');

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
        ->assertJsonPath('data.kpis.monthly_payments_count', 1)
        ->assertJsonPath('data.recent_payments.0.member_name', 'Alex Rivera')
        ->assertJsonPath('data.featured_sessions.0.workout_name', 'Fuerza funcional');
});
