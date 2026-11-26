<?php

declare(strict_types=1);

namespace Modules\Scheduling\Application\DTOs;

use Modules\Scheduling\Domain\Enums\WorkoutLevel;

final readonly class CreateWorkoutData
{
    public function __construct(
        public string $name,
        public string $category,
        public WorkoutLevel $level = WorkoutLevel::AllLevels,
        public int $defaultDurationMinutes = 45,
        public string $badgeLabel = 'TODOS LOS NIVELES',
        public ?string $imageUrl = null,
        public int $displayOrder = 1,
        public ?string $description = null,
    ) {}
}
