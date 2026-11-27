<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Auth\Application\Services\AuthService;
use Modules\Auth\Domain\Enums\UserRole;
use Modules\Auth\Domain\Models\AccountUser;
use Modules\Auth\Domain\Repositories\AuthRepositoryInterface;

uses(RefreshDatabase::class);

function createAdminHeaders(string $email = 'admin.rbac@loboclub.com'): array
{
    $user = app(AuthRepositoryInterface::class)->saveUser(new AccountUser([
        'name' => 'Admin LOBO',
        'email' => $email,
        'role' => UserRole::Admin,
        'member_id' => null,
        'password' => 'SecretAdmin!123',
    ]));

    return [
        'Authorization' => 'Bearer '.app(AuthService::class)->issueTokenForUser($user, 'test'),
    ];
}

it('returns 401 on protected routes when unauthenticated', function (): void {
    $this->getJson('/api/v1/dashboard/summary')->assertUnauthorized();
    $this->getJson('/api/v1/members')->assertUnauthorized();
    $this->getJson('/api/v1/member/memberships')->assertUnauthorized();
    $this->getJson('/api/v1/auth/me')->assertUnauthorized();
});

it('registers public member account, rejects wrong login credentials and revokes token on logout', function (): void {
    $register = $this->postJson('/api/v1/auth/register', [
        'name' => 'Sofía Navarro',
        'email' => 'sofia@loboclub.com',
        'password' => 'LoboFit2026!',
        'role' => 'admin',
    ])->assertCreated()
        ->assertJsonPath('data.user.role', 'member')
        ->assertJsonPath('data.user.member_name', 'Sofía Navarro');

    $memberId = $register->json('data.user.member_id');
    expect($memberId)->toBeInt()->toBeGreaterThan(0);

    $token = (string) $register->json('data.token');

    $this->withToken($token)->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.email', 'sofia@loboclub.com')
        ->assertJsonPath('data.role', 'member');

    $this->postJson('/api/v1/auth/login', [
        'email' => 'sofia@loboclub.com',
        'password' => 'wrong-password',
    ])->assertUnauthorized();

    $this->withToken($token)->postJson('/api/v1/auth/logout')->assertNoContent();
    $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();
});

it('enforces RBAC between admin and gym member and isolates personal resources across members', function (): void {
    $adminHeaders = createAdminHeaders();

    $planId = $this->withHeaders($adminHeaders)->postJson('/api/v1/plans', [
        'name' => 'Mensualidad',
        'price_cents' => 89000,
        'duration_days' => 30,
        'billing_period_label' => 'mes',
    ])->assertCreated()->json('data.id');

    $workoutId = $this->withHeaders($adminHeaders)->postJson('/api/v1/workouts', [
        'name' => 'Boxeo',
        'category' => 'COMBATE',
        'default_duration_minutes' => 50,
    ])->assertCreated()->json('data.id');

    $sessionId = $this->withHeaders($adminHeaders)->postJson('/api/v1/schedule/sessions', [
        'workout_id' => $workoutId,
        'day_of_week' => 1,
        'room' => 'Ring',
        'instructor_name' => 'Andrea Silva',
        'starts_at' => now()->setTime(9, 30)->toIso8601String(),
        'duration_minutes' => 50,
        'capacity' => 10,
        'enrolled_count' => 6,
    ])->assertCreated()->json('data.id');

    $memberARes = $this->postJson('/api/v1/auth/register', [
        'name' => 'Lucía Vega',
        'email' => 'lucia@loboclub.com',
        'password' => 'SecretMember!1',
    ])->assertCreated();
    $tokenA = (string) $memberARes->json('data.token');
    $memberAId = (int) $memberARes->json('data.user.member_id');

    $memberBRes = $this->postJson('/api/v1/auth/register', [
        'name' => 'Diego Castro',
        'email' => 'diego@loboclub.com',
        'password' => 'SecretMember!2',
    ])->assertCreated();
    $tokenB = (string) $memberBRes->json('data.token');

    // Member A cannot access admin endpoints
    $this->withToken($tokenA)->getJson('/api/v1/dashboard/summary')->assertForbidden();
    $this->withToken($tokenA)->getJson('/api/v1/members')->assertForbidden();
    $this->withToken($tokenA)->postJson('/api/v1/plans', ['name' => 'X'])->assertForbidden();

    // Admin assigns private routine to Member A; Member B must not see Member A's routine
    $templateRoutineId = $this->withHeaders($adminHeaders)->postJson('/api/v1/routines', [
        'title' => 'Plantilla Club',
        'goal' => 'strength',
        'is_template' => true,
        'exercises' => [
            ['day_label' => 'Día 1', 'exercise_name' => 'Sentadilla', 'sets' => 3, 'reps' => '8-10'],
        ],
    ])->assertCreated()->json('data.id');

    $this->withHeaders($adminHeaders)->postJson("/api/v1/routines/{$templateRoutineId}/assign", [
        'member_id' => $memberAId,
    ])->assertCreated();

    $this->withToken($tokenA)->getJson('/api/v1/member/routines?scope=mine')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.member_id', $memberAId);

    $this->withToken($tokenB)->getJson('/api/v1/member/routines?scope=mine')
        ->assertOk()
        ->assertJsonCount(0, 'data');

    // Member A books and cancels class session
    $this->withToken($tokenA)->postJson("/api/v1/member/schedule/sessions/{$sessionId}/book")
        ->assertOk()
        ->assertJsonPath('data.enrolled_count', 7);

    $this->withToken($tokenA)->getJson('/api/v1/member/schedule/sessions')
        ->assertOk()
        ->assertJsonPath('booked_session_ids.0', $sessionId);

    $this->withToken($tokenA)->deleteJson("/api/v1/member/schedule/sessions/{$sessionId}/book")
        ->assertOk()
        ->assertJsonPath('data.enrolled_count', 6);

    // Member A records workout log; Member B cannot delete Member A's log
    $logId = $this->withToken($tokenA)->postJson('/api/v1/member/workout-logs', [
        'title' => 'Box Técnico',
        'category' => 'COMBATE',
        'duration_minutes' => 50,
        'effort_rpe' => 9,
    ])->assertCreated()->json('data.id');

    $this->withToken($tokenB)->deleteJson("/api/v1/member/workout-logs/{$logId}")->assertForbidden();
    $this->withToken($tokenA)->deleteJson("/api/v1/member/workout-logs/{$logId}")->assertNoContent();

    // Member A requests payment renewal -> pending -> Admin approves -> Membership becomes active
    $requestPaymentId = $this->withToken($tokenA)->postJson('/api/v1/member/payment-requests', [
        'plan_id' => $planId,
        'payment_method' => 'transfer',
        'notes' => 'Transferencia SPEI #4421',
    ])->assertCreated()
        ->assertJsonPath('data.status', 'pending')
        ->json('data.id');

    $this->withHeaders($adminHeaders)->getJson('/api/v1/dashboard/summary')
        ->assertOk()
        ->assertJsonPath('data.kpis.monthly_payments_count', 0);

    $this->withHeaders($adminHeaders)->postJson("/api/v1/payments/{$requestPaymentId}/approve")
        ->assertOk()
        ->assertJsonPath('data.status', 'paid');

    $this->withToken($tokenA)->getJson('/api/v1/member/memberships')
        ->assertOk()
        ->assertJsonPath('active_membership.status', 'active')
        ->assertJsonPath('active_membership.plan_name', 'Mensualidad');

    $this->withHeaders($adminHeaders)->getJson('/api/v1/dashboard/summary')
        ->assertOk()
        ->assertJsonPath('data.kpis.monthly_payments_count', 1)
        ->assertJsonPath('data.kpis.active_memberships_count', 1);
});
