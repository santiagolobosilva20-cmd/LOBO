<?php

declare(strict_types=1);

namespace Modules\Training\Application\DTOs;

final readonly class CreateWorkoutLogData
{
    public function __construct(
        public string $title,
        public string $category = 'ENTRENAMIENTO',
        public ?int $memberId = null,
        public ?string $memberName = null,
        public ?int $workoutId = null,
        public ?int $routineId = null,
        public ?string $performedAt = null,
        public int $durationMinutes = 45,
        public int $effortRpe = 7,
        public ?int $caloriesEstimate = null,
        public ?string $notes = null,
    ) {}
}
