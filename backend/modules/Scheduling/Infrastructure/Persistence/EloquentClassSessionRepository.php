<?php

declare(strict_types=1);

namespace Modules\Scheduling\Infrastructure\Persistence;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Modules\Scheduling\Domain\Enums\SessionStatus;
use Modules\Scheduling\Domain\Models\ClassSession;
use Modules\Scheduling\Domain\Repositories\ClassSessionRepositoryInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

final class EloquentClassSessionRepository implements ClassSessionRepositoryInterface
{
    private const array COLUMNS = [
        'id',
        'workout_id',
        'day_of_week',
        'room',
        'instructor_name',
        'starts_at',
        'duration_minutes',
        'capacity',
        'enrolled_count',
        'accent_color',
        'status',
        'created_at',
        'updated_at',
    ];

    public function paginate(
        PaginationQuery $query,
        ?CarbonImmutable $date = null,
        ?SessionStatus $status = null,
    ): PaginatedResult {
        $builder = $this->baseQuery();

        if ($date !== null) {
            $dayOfWeek = $date->dayOfWeekIso;
            $builder->where('day_of_week', $dayOfWeek <= 6 ? $dayOfWeek : 1);
        }

        if ($status !== null) {
            $builder->where('status', $status->value);
        }

        $paginator = $builder
            ->orderBy('day_of_week')
            ->orderBy('starts_at')
            ->paginate(perPage: $query->perPage, page: $query->page);

        return PaginatedResult::fromPaginator(
            paginator: $paginator,
            mapper: static fn (ClassSession $session): ClassSession => $session,
        );
    }

    public function featuredForDate(CarbonImmutable $date, int $limit = 3): array
    {
        $dayOfWeek = $date->dayOfWeekIso <= 6 ? $date->dayOfWeekIso : 1;

        /** @var list<ClassSession> $items */
        $items = $this->baseQuery()
            ->where('status', SessionStatus::Scheduled->value)
            ->where('day_of_week', $dayOfWeek)
            ->orderBy('starts_at')
            ->limit($limit)
            ->get()
            ->all();

        if ($items === []) {
            /** @var list<ClassSession> $fallback */
            $fallback = $this->baseQuery()
                ->where('status', SessionStatus::Scheduled->value)
                ->orderBy('day_of_week')
                ->orderBy('starts_at')
                ->limit($limit)
                ->get()
                ->all();

            return $fallback;
        }

        return $items;
    }

    public function nextUpcoming(CarbonImmutable $from): ?ClassSession
    {
        $dayOfWeek = $from->dayOfWeekIso <= 6 ? $from->dayOfWeekIso : 1;

        return $this->baseQuery()
            ->where('status', SessionStatus::Scheduled->value)
            ->where('day_of_week', $dayOfWeek)
            ->orderBy('starts_at')
            ->first()
            ?? $this->baseQuery()
                ->where('status', SessionStatus::Scheduled->value)
                ->orderBy('day_of_week')
                ->orderBy('starts_at')
                ->first();
    }

    public function findById(int $id): ?ClassSession
    {
        return $this->baseQuery()->find($id);
    }

    public function findByIdForUpdate(int $id): ?ClassSession
    {
        return $this->baseQuery()->lockForUpdate()->find($id);
    }

    public function save(ClassSession $session): ClassSession
    {
        $session->save();

        return $session->refresh()->load(['workout:id,name,slug,category']);
    }

    public function delete(ClassSession $session): void
    {
        $session->delete();
    }

    /**
     * @return Builder<ClassSession>
     */
    private function baseQuery(): Builder
    {
        return ClassSession::query()
            ->select(self::COLUMNS)
            ->with(['workout:id,name,slug,category']);
    }
}
