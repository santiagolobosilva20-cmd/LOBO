<?php

declare(strict_types=1);

namespace Modules\Plans\Domain\Repositories;

use Modules\Plans\Domain\Models\Plan;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

interface PlanRepositoryInterface
{
    /**
     * @return PaginatedResult<Plan>
     */
    public function paginate(
        PaginationQuery $query,
        ?bool $activeOnly = null,
    ): PaginatedResult;

    public function findById(int $id): ?Plan;

    public function existsBySlug(string $slug, ?int $excludeId = null): bool;

    public function save(Plan $plan): Plan;

    public function delete(Plan $plan): void;
}
