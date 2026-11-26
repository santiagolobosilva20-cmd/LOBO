<?php

declare(strict_types=1);

namespace Modules\Scheduling\Domain\Repositories;

use Modules\Scheduling\Domain\Models\Workout;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

interface WorkoutRepositoryInterface
{
    /**
     * @return PaginatedResult<Workout>
     */
    public function paginate(PaginationQuery $query, ?string $category = null): PaginatedResult;

    public function findById(int $id): ?Workout;

    public function existsBySlug(string $slug, ?int $excludeId = null): bool;

    public function save(Workout $workout): Workout;

    public function delete(Workout $workout): void;
}
