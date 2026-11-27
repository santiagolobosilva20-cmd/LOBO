<?php

declare(strict_types=1);

namespace Modules\Nutrition\Application\DTOs;

use Modules\Nutrition\Domain\Enums\MealSlot;

final readonly class MealEntryInputData
{
    public function __construct(
        public MealSlot $mealSlot,
        public string $title,
        public string $foodsSummary,
        public int $calories = 0,
        public int $proteinGrams = 0,
        public int $carbsGrams = 0,
        public int $fatsGrams = 0,
        public int $sortOrder = 1,
    ) {}
}
