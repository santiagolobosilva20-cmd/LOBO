<?php

declare(strict_types=1);

namespace Modules\Nutrition\Contracts\DTOs;

final readonly class MealEntryData
{
    public function __construct(
        public int $id,
        public string $mealSlot,
        public string $title,
        public string $foodsSummary,
        public int $calories,
        public int $proteinGrams,
        public int $carbsGrams,
        public int $fatsGrams,
        public int $sortOrder,
    ) {}
}
