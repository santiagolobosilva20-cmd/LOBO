<?php

declare(strict_types=1);

namespace Modules\Nutrition\Contracts\DTOs;

final readonly class NutritionPlanSummaryData
{
    /**
     * @param  list<MealEntryData>  $meals
     */
    public function __construct(
        public int $id,
        public ?int $memberId,
        public ?string $memberName,
        public string $title,
        public string $goal,
        public int $dailyCalories,
        public int $proteinGrams,
        public int $carbsGrams,
        public int $fatsGrams,
        public float $waterLiters,
        public bool $isTemplate,
        public ?string $notes,
        public array $meals,
        public ?string $createdAt,
    ) {}
}
