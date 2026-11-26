<?php

declare(strict_types=1);

namespace Modules\Plans\Infrastructure\Persistence;

use Modules\Plans\Domain\Models\Plan;
use Modules\Plans\Domain\Repositories\PlanRepositoryInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

final class EloquentPlanRepository implements PlanRepositoryInterface
{
    private const array COLUMNS = [
        'id',
        'name',
        'slug',
        'tagline',
        'price_cents',
        'duration_days',
        'billing_period_label',
        'description',
        'features',
        'is_featured',
        'is_active',
        'created_at',
        'updated_at',
    ];

    public function paginate(
        PaginationQuery $query,
        ?bool $activeOnly = null,
    ): PaginatedResult {
        $builder = Plan::query()->select(self::COLUMNS);

        if ($activeOnly !== null) {
            $builder->where('is_active', $activeOnly);
        }

        $paginator = $builder
            ->orderBy('price_cents')
            ->paginate(perPage: $query->perPage, page: $query->page);

        return PaginatedResult::fromPaginator(
            paginator: $paginator,
            mapper: static fn (Plan $plan): Plan => $plan,
        );
    }

    public function findById(int $id): ?Plan
    {
        return Plan::query()->select(self::COLUMNS)->find($id);
    }

    public function existsBySlug(string $slug, ?int $excludeId = null): bool
    {
        $builder = Plan::query()->where('slug', $slug);
        if ($excludeId !== null) {
            $builder->whereKeyNot($excludeId);
        }

        return $builder->exists();
    }

    public function save(Plan $plan): Plan
    {
        $plan->save();

        return $plan->refresh();
    }

    public function delete(Plan $plan): void
    {
        $plan->delete();
    }
}
