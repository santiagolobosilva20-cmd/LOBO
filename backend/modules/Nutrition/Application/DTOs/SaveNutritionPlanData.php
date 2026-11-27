<?php

declare(strict_types=1);

namespace Modules\Nutrition\Application\DTOs;

use Modules\Nutrition\Domain\Enums\NutritionGoal;

final readonly class SaveNutritionPlanData
{
    /**
     * @param  list<MealEntryInputData>  $meals
     */
    public function __construct(
        public string $title,
        public NutritionGoal $goal,
        public int $dailyCalories,
        public int $proteinGrams,
        public int $carbsGrams,
        public int $fatsGrams,
        public float $waterLiters = 2.5,
        public bool $isTemplate = true,
        public ?int $memberId = null,
        public ?string $memberName = null,
        public ?string $notes = null,
        public array $meals = [],
    ) {}
}
