<?php

declare(strict_types=1);

namespace Modules\Training\Infrastructure\Persistence;

use Illuminate\Database\Eloquent\Builder;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;
use Modules\Training\Domain\Models\WorkoutLog;
use Modules\Training\Domain\Repositories\WorkoutLogRepositoryInterface;

final class EloquentWorkoutLogRepository implements WorkoutLogRepositoryInterface
{
    public function paginate(
        PaginationQuery $query,
        ?int $memberId = null,
        ?string $category = null,
        ?string $search = null,
    ): PaginatedResult {
        /** @var Builder<WorkoutLog> $builder */
        $builder = WorkoutLog::query()->orderByDesc('performed_at')->orderByDesc('id');

        if ($memberId !== null) {
            $builder->where('member_id', $memberId);
        }

        if ($category !== null && trim($category) !== '') {
            $builder->where('category', strtoupper(trim($category)));
        }

        if ($search !== null && trim($search) !== '') {
            $needle = '%'.mb_strtolower(trim($search)).'%';
            $builder->where(static function (Builder $sub) use ($needle): void {
                $sub->whereRaw('LOWER(title) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(member_name_snapshot) LIKE ?', [$needle]);
            });
        }

        $paginator = $builder->paginate(perPage: $query->perPage, page: $query->page);

        return PaginatedResult::fromPaginator(
            paginator: $paginator,
            mapper: static fn (WorkoutLog $log): WorkoutLog => $log,
        );
    }

    public function findById(int $id): ?WorkoutLog
    {
        return WorkoutLog::query()->find($id);
    }

    public function save(WorkoutLog $log): WorkoutLog
    {
        $log->save();

        return $log;
    }

    public function delete(WorkoutLog $log): void
    {
        $log->delete();
    }
}
