<?php

declare(strict_types=1);

namespace Modules\Nutrition\Infrastructure\Persistence;

use Illuminate\Database\Eloquent\Builder;
use Modules\Nutrition\Domain\Models\NutritionPlan;
use Modules\Nutrition\Domain\Repositories\NutritionPlanRepositoryInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

final class EloquentNutritionPlanRepository implements NutritionPlanRepositoryInterface
{
    public function paginate(
        PaginationQuery $query,
        ?string $goal = null,
        ?bool $isTemplate = null,
        ?int $memberId = null,
        ?string $search = null,
    ): PaginatedResult {
        /** @var Builder<NutritionPlan> $builder */
        $builder = NutritionPlan::query()
            ->with('meals')
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
            mapper: static fn (NutritionPlan $plan): NutritionPlan => $plan,
        );
    }

    public function findByIdWithMeals(int $id): ?NutritionPlan
    {
        return NutritionPlan::query()->with('meals')->find($id);
    }

    public function saveWithMeals(NutritionPlan $plan, array $meals): NutritionPlan
    {
        $plan->save();
        $plan->meals()->delete();

        if ($meals !== []) {
            $plan->meals()->createMany($meals);
        }

        return $plan->load('meals');
    }

    public function delete(NutritionPlan $plan): void
    {
        $plan->delete();
    }
}
