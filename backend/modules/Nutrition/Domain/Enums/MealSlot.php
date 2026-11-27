<?php

declare(strict_types=1);

namespace Modules\Nutrition\Domain\Enums;

enum MealSlot: string
{
    case Breakfast = 'breakfast';
    case MidMorning = 'mid_morning';
    case Lunch = 'lunch';
    case Snack = 'snack';
    case Dinner = 'dinner';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
