<?php

declare(strict_types=1);

namespace Modules\Nutrition\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Modules\Nutrition\Domain\Enums\MealSlot;

/**
 * @property int $id
 * @property int $nutrition_plan_id
 * @property MealSlot $meal_slot
 * @property string $title
 * @property string $foods_summary
 * @property int $calories
 * @property int $protein_grams
 * @property int $carbs_grams
 * @property int $fats_grams
 * @property int $sort_order
 */
#[Table('meal_entries')]
#[Fillable([
    'nutrition_plan_id',
    'meal_slot',
    'title',
    'foods_summary',
    'calories',
    'protein_grams',
    'carbs_grams',
    'fats_grams',
    'sort_order',
])]
final class MealEntry extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'nutrition_plan_id' => 'integer',
            'meal_slot' => MealSlot::class,
            'calories' => 'integer',
            'protein_grams' => 'integer',
            'carbs_grams' => 'integer',
            'fats_grams' => 'integer',
            'sort_order' => 'integer',
        ];
    }
}
