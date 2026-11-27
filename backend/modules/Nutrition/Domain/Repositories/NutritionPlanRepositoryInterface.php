<?php

declare(strict_types=1);

namespace Modules\Nutrition\Domain\Repositories;

use Modules\Nutrition\Domain\Models\NutritionPlan;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

interface NutritionPlanRepositoryInterface
{
    /**
     * @return PaginatedResult<NutritionPlan>
     */
    public function paginate(
        PaginationQuery $query,
        ?string $goal = null,
        ?bool $isTemplate = null,
        ?int $memberId = null,
        ?string $search = null,
    ): PaginatedResult;

    public function findByIdWithMeals(int $id): ?NutritionPlan;

    /**
     * @param  list<array{meal_slot: string, title: string, foods_summary: string, calories: int, protein_grams: int, carbs_grams: int, fats_grams: int, sort_order: int}>  $meals
     */
    public function saveWithMeals(NutritionPlan $plan, array $meals): NutritionPlan;

    public function delete(NutritionPlan $plan): void;
}
