<?php

declare(strict_types=1);

namespace Modules\Training\Contracts\DTOs;

final readonly class WorkoutLogSummaryData
{
    public function __construct(
        public int $id,
        public int $memberId,
        public string $memberName,
        public ?int $workoutId,
        public ?int $routineId,
        public string $title,
        public string $category,
        public string $performedAt,
        public int $durationMinutes,
        public int $effortRpe,
        public ?int $caloriesEstimate,
        public ?string $notes,
        public ?string $createdAt,
    ) {}
}
