<?php

declare(strict_types=1);

namespace Modules\Training\Domain\Repositories;

use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;
use Modules\Training\Domain\Models\Routine;

interface RoutineRepositoryInterface
{
    /**
     * @return PaginatedResult<Routine>
     */
    public function paginate(
        PaginationQuery $query,
        ?string $goal = null,
        ?bool $isTemplate = null,
        ?int $memberId = null,
        ?string $search = null,
    ): PaginatedResult;

    public function findByIdWithExercises(int $id): ?Routine;

    /**
     * @param  list<array{day_label: string, exercise_name: string, sets: int, reps: string, target_weight: ?string, rest_seconds: int, sort_order: int}>  $exercises
     */
    public function saveWithExercises(Routine $routine, array $exercises): Routine;

    public function delete(Routine $routine): void;
}
