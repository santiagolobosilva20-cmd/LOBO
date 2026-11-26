<?php

declare(strict_types=1);

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Modules\Scheduling\Application\Services\ScheduleService;
use Modules\Scheduling\Domain\Enums\SessionStatus;
use Modules\Scheduling\Domain\Models\ClassSession;
use Modules\Scheduling\Domain\Models\Workout;
use Modules\Scheduling\Domain\Repositories\ClassSessionRepositoryInterface;
use Modules\Scheduling\Domain\Repositories\WorkoutRepositoryInterface;
use Modules\Shared\Domain\Exceptions\ConflictException;

it('increments enrolled count atomically when capacity is available', function (): void {
    DB::shouldReceive('transaction')
        ->once()
        ->andReturnUsing(static fn (Closure $callback): mixed => $callback());

    $workout = new Workout(['name' => 'Boxeo', 'category' => 'Combate']);
    $workout->id = 2;

    $session = new ClassSession([
        'workout_id' => 2,
        'day_of_week' => 1,
        'room' => 'Ring',
        'instructor_name' => 'Andrea Silva',
        'starts_at' => Carbon::parse('2026-11-26 08:30:00'),
        'duration_minutes' => 50,
        'capacity' => 10,
        'enrolled_count' => 8,
        'accent_color' => '#EF4444',
        'status' => SessionStatus::Scheduled,
    ]);
    $session->id = 5;
    $session->setRelation('workout', $workout);

    $sessionRepo = Mockery::mock(ClassSessionRepositoryInterface::class);
    $sessionRepo->shouldReceive('findByIdForUpdate')->once()->with(5)->andReturn($session);
    $sessionRepo->shouldReceive('save')->once()->andReturnUsing(static fn (ClassSession $saved): ClassSession => $saved);

    $workoutRepo = Mockery::mock(WorkoutRepositoryInterface::class);
    $service = new ScheduleService($sessionRepo, $workoutRepo);

    $updated = $service->enroll(5);

    expect($updated->enrolledCount)->toBe(9)
        ->and($updated->capacity)->toBe(10);
});

it('rejects enrollment when session is at full capacity', function (): void {
    DB::shouldReceive('transaction')
        ->once()
        ->andReturnUsing(static fn (Closure $callback): mixed => $callback());

    $session = new ClassSession([
        'workout_id' => 1,
        'room' => 'Sala Norte',
        'instructor_name' => 'Carlos',
        'starts_at' => Carbon::parse('2026-11-26 07:00:00'),
        'duration_minutes' => 45,
        'capacity' => 12,
        'enrolled_count' => 12,
        'status' => SessionStatus::Scheduled,
    ]);
    $session->id = 1;

    $sessionRepo = Mockery::mock(ClassSessionRepositoryInterface::class);
    $sessionRepo->shouldReceive('findByIdForUpdate')->once()->with(1)->andReturn($session);

    $workoutRepo = Mockery::mock(WorkoutRepositoryInterface::class);
    $service = new ScheduleService($sessionRepo, $workoutRepo);

    expect(fn () => $service->enroll(1))->toThrow(ConflictException::class);
});
