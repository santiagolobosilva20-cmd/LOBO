<?php

declare(strict_types=1);

namespace Modules\Training\Contracts\DTOs;

final readonly class RoutineExerciseData
{
    public function __construct(
        public int $id,
        public string $dayLabel,
        public string $exerciseName,
        public int $sets,
        public string $reps,
        public ?string $targetWeight,
        public int $restSeconds,
        public int $sortOrder,
    ) {}
}
