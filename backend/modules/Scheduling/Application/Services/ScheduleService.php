<?php

declare(strict_types=1);

namespace Modules\Scheduling\Application\Services;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Modules\Scheduling\Application\DTOs\CreateClassSessionData;
use Modules\Scheduling\Contracts\DTOs\ClassSessionSummaryData;
use Modules\Scheduling\Contracts\Queries\ScheduleSummaryQueryInterface;
use Modules\Scheduling\Domain\Enums\SessionStatus;
use Modules\Scheduling\Domain\Models\ClassSession;
use Modules\Scheduling\Domain\Repositories\ClassSessionRepositoryInterface;
use Modules\Scheduling\Domain\Repositories\WorkoutRepositoryInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;
use Modules\Shared\Domain\Exceptions\ConflictException;
use Modules\Shared\Domain\Exceptions\ResourceNotFoundException;

final readonly class ScheduleService implements ScheduleSummaryQueryInterface
{
    private const array DAY_LABELS = [
        1 => 'Lunes',
        2 => 'Martes',
        3 => 'Miércoles',
        4 => 'Jueves',
        5 => 'Viernes',
        6 => 'Sábado',
    ];

    public function __construct(
        private ClassSessionRepositoryInterface $sessions,
        private WorkoutRepositoryInterface $workouts,
    ) {}

    /**
     * @return PaginatedResult<ClassSessionSummaryData>
     */
    #[\NoDiscard]
    public function list(
        PaginationQuery $pagination,
        ?CarbonImmutable $date = null,
        ?SessionStatus $status = null,
    ): PaginatedResult {
        $paginated = $this->sessions->paginate($pagination, $date, $status);

        return new PaginatedResult(
            items: array_map(
                fn (ClassSession $session): ClassSessionSummaryData => $this->toSummary($session),
                $paginated->items,
            ),
            currentPage: $paginated->currentPage,
            perPage: $paginated->perPage,
            total: $paginated->total,
            lastPage: $paginated->lastPage,
        );
    }

    public function getNextUpcoming(): ?ClassSessionSummaryData
    {
        $session = $this->sessions->nextUpcoming(CarbonImmutable::now());

        return $session !== null ? $this->toSummary($session) : null;
    }

    /**
     * @return list<ClassSessionSummaryData>
     */
    public function getFeaturedToday(int $limit = 4): array
    {
        $items = $this->sessions->featuredForDate(
            date: CarbonImmutable::today(),
            limit: max(1, min(12, $limit)),
        );

        return array_map(
            fn (ClassSession $session): ClassSessionSummaryData => $this->toSummary($session),
            $items,
        );
    }

    #[\NoDiscard]
    public function create(CreateClassSessionData $data): ClassSessionSummaryData
    {
        return DB::transaction(function () use ($data): ClassSessionSummaryData {
            $workout = $this->workouts->findById($data->workoutId);
            if ($workout === null) {
                throw new ResourceNotFoundException('Workout', $data->workoutId);
            }

            if ($data->enrolledCount > $data->capacity) {
                throw new ConflictException(
                    message: 'Enrolled count cannot exceed session capacity.',
                    errors: ['enrolled_count' => ['Enrolled count exceeds maximum capacity.']],
                );
            }

            $session = new ClassSession([
                'workout_id' => $workout->id,
                'day_of_week' => max(1, min(6, $data->dayOfWeek)),
                'room' => trim($data->room),
                'instructor_name' => trim($data->instructorName),
                'starts_at' => $data->startsAt,
                'duration_minutes' => $data->durationMinutes,
                'capacity' => $data->capacity,
                'enrolled_count' => $data->enrolledCount,
                'accent_color' => $data->accentColor,
                'status' => $data->status,
            ]);

            return $this->toSummary($this->sessions->save($session));
        });
    }

    #[\NoDiscard]
    public function enroll(int $sessionId): ClassSessionSummaryData
    {
        return DB::transaction(function () use ($sessionId): ClassSessionSummaryData {
            $session = $this->sessions->findByIdForUpdate($sessionId);
            if ($session === null) {
                throw new ResourceNotFoundException('ClassSession', $sessionId);
            }

            if ($session->status !== SessionStatus::Scheduled) {
                throw new ConflictException('Cannot enroll in a session that is not scheduled.');
            }

            if ($session->enrolled_count >= $session->capacity) {
                throw new ConflictException('Session has reached maximum capacity.');
            }

            $session->enrolled_count += 1;

            return $this->toSummary($this->sessions->save($session));
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id): void {
            $session = $this->sessions->findById($id);
            if ($session === null) {
                throw new ResourceNotFoundException('ClassSession', $id);
            }

            $this->sessions->delete($session);
        });
    }

    private function toSummary(ClassSession $session): ClassSessionSummaryData
    {
        return new ClassSessionSummaryData(
            id: $session->id,
            workoutId: $session->workout_id,
            workoutName: $session->workout->name ?? 'Clase',
            category: $session->workout->category ?? 'General',
            dayOfWeek: $session->day_of_week,
            dayLabel: self::DAY_LABELS[$session->day_of_week] ?? 'Lunes',
            room: $session->room,
            instructorName: $session->instructor_name,
            startsAt: $session->starts_at->toIso8601String(),
            startTimeLabel: $session->starts_at->format('h:i A'),
            shortTimeLabel: $session->starts_at->format('H:i'),
            durationMinutes: $session->duration_minutes,
            capacity: $session->capacity,
            enrolledCount: $session->enrolled_count,
            accentColor: $session->accent_color,
            status: $session->status->value,
        );
    }
}
