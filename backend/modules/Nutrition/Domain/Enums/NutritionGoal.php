<?php

declare(strict_types=1);

namespace Modules\Nutrition\Domain\Enums;

enum NutritionGoal: string
{
    case FatLoss = 'fat_loss';
    case Maintenance = 'maintenance';
    case MuscleGain = 'muscle_gain';
    case Performance = 'performance';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
