<?php

declare(strict_types=1);

namespace Modules\Scheduling\Domain\Enums;

enum WorkoutLevel: string
{
    case AllLevels = 'all_levels';
    case Beginner = 'beginner';
    case Intermediate = 'intermediate';
    case Advanced = 'advanced';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $level): string => $level->value,
            self::cases(),
        );
    }
}
