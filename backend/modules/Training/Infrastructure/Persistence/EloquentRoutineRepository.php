<?php

declare(strict_types=1);

namespace Modules\Training\Infrastructure\Persistence;

use Illuminate\Database\Eloquent\Builder;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;
use Modules\Training\Domain\Models\Routine;
use Modules\Training\Domain\Repositories\RoutineRepositoryInterface;

final class EloquentRoutineRepository implements RoutineRepositoryInterface
{
    public function paginate(
        PaginationQuery $query,
        ?string $goal = null,
        ?bool $isTemplate = null,
        ?int $memberId = null,
        ?string $search = null,
    ): PaginatedResult {
        /** @var Builder<Routine> $builder */
        $builder = Routine::query()
            ->with('exercises')
            ->orderByDesc('is_template')
            ->orderByDesc('id');

        if ($goal !== null && $goal !== '') {
            $builder->where('goal', $goal);
        }

        if ($isTemplate !== null) {
            $builder->where('is_template', $isTemplate);
        }

        if ($memberId !== null) {
            $builder->where('member_id', $memberId);
        }

        if ($search !== null && trim($search) !== '') {
            $needle = '%'.mb_strtolower(trim($search)).'%';
            $builder->where(static function (Builder $sub) use ($needle): void {
                $sub->whereRaw('LOWER(title) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(COALESCE(member_name_snapshot, \'\')) LIKE ?', [$needle]);
            });
        }

        $paginator = $builder->paginate(perPage: $query->perPage, page: $query->page);

        return PaginatedResult::fromPaginator(
            paginator: $paginator,
            mapper: static fn (Routine $routine): Routine => $routine,
        );
    }

    public function findByIdWithExercises(int $id): ?Routine
    {
        return Routine::query()->with('exercises')->find($id);
    }

    public function saveWithExercises(Routine $routine, array $exercises): Routine
    {
        $routine->save();
        $routine->exercises()->delete();

        if ($exercises !== []) {
            $routine->exercises()->createMany($exercises);
        }

        return $routine->load('exercises');
    }

    public function delete(Routine $routine): void
    {
        $routine->delete();
    }
}
