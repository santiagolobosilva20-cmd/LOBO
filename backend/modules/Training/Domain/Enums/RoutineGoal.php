<?php

declare(strict_types=1);

namespace Modules\Training\Domain\Enums;

enum RoutineGoal: string
{
    case Strength = 'strength';
    case Hypertrophy = 'hypertrophy';
    case FatLoss = 'fat_loss';
    case Endurance = 'endurance';
    case Mobility = 'mobility';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
