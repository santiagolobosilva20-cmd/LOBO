<?php

declare(strict_types=1);

namespace Modules\Nutrition\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Nutrition\Contracts\DTOs\MealEntryData;
use Modules\Nutrition\Contracts\DTOs\NutritionPlanSummaryData;

/**
 * @mixin NutritionPlanSummaryData
 */
final class NutritionPlanResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var NutritionPlanSummaryData $plan */
        $plan = $this->resource;

        return [
            'id' => $plan->id,
            'member_id' => $plan->memberId,
            'member_name' => $plan->memberName,
            'title' => $plan->title,
            'goal' => $plan->goal,
            'daily_calories' => $plan->dailyCalories,
            'protein_grams' => $plan->proteinGrams,
            'carbs_grams' => $plan->carbsGrams,
            'fats_grams' => $plan->fatsGrams,
            'water_liters' => $plan->waterLiters,
            'is_template' => $plan->isTemplate,
            'notes' => $plan->notes,
            'meals' => array_map(
                static fn (MealEntryData $meal): array => [
                    'id' => $meal->id,
                    'meal_slot' => $meal->mealSlot,
                    'title' => $meal->title,
                    'foods_summary' => $meal->foodsSummary,
                    'calories' => $meal->calories,
                    'protein_grams' => $meal->proteinGrams,
                    'carbs_grams' => $meal->carbsGrams,
                    'fats_grams' => $meal->fatsGrams,
                    'sort_order' => $meal->sortOrder,
                ],
                $plan->meals,
            ),
            'created_at' => $plan->createdAt,
        ];
    }
}
