<?php

declare(strict_types=1);

namespace Modules\Training\Application\DTOs;

final readonly class RoutineExerciseInputData
{
    public function __construct(
        public string $dayLabel,
        public string $exerciseName,
        public int $sets,
        public string $reps,
        public ?string $targetWeight = null,
        public int $restSeconds = 60,
        public int $sortOrder = 1,
    ) {}
}
