<?php

declare(strict_types=1);

namespace Modules\Training\Domain\Repositories;

use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;
use Modules\Training\Domain\Models\WorkoutLog;

interface WorkoutLogRepositoryInterface
{
    /**
     * @return PaginatedResult<WorkoutLog>
     */
    public function paginate(
        PaginationQuery $query,
        ?int $memberId = null,
        ?string $category = null,
        ?string $search = null,
    ): PaginatedResult;

    public function findById(int $id): ?WorkoutLog;

    public function save(WorkoutLog $log): WorkoutLog;

    public function delete(WorkoutLog $log): void;
}
