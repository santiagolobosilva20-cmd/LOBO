<?php

declare(strict_types=1);

namespace Modules\Nutrition\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Modules\Nutrition\Domain\Enums\NutritionGoal;

/**
 * @property int $id
 * @property int|null $member_id
 * @property string|null $member_name_snapshot
 * @property string $title
 * @property NutritionGoal $goal
 * @property int $daily_calories
 * @property int $protein_grams
 * @property int $carbs_grams
 * @property int $fats_grams
 * @property float $water_liters
 * @property bool $is_template
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, MealEntry> $meals
 */
#[Table('nutrition_plans')]
#[Fillable([
    'member_id',
    'member_name_snapshot',
    'title',
    'goal',
    'daily_calories',
    'protein_grams',
    'carbs_grams',
    'fats_grams',
    'water_liters',
    'is_template',
    'notes',
])]
final class NutritionPlan extends Model
{
    /**
     * @return HasMany<MealEntry, $this>
     */
    public function meals(): HasMany
    {
        return $this->hasMany(MealEntry::class, 'nutrition_plan_id')
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'member_id' => 'integer',
            'goal' => NutritionGoal::class,
            'daily_calories' => 'integer',
            'protein_grams' => 'integer',
            'carbs_grams' => 'integer',
            'fats_grams' => 'integer',
            'water_liters' => 'float',
            'is_template' => 'boolean',
        ];
    }
}
