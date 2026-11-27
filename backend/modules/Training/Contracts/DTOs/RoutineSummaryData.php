<?php

declare(strict_types=1);

namespace Modules\Training\Contracts\DTOs;

final readonly class RoutineSummaryData
{
    /**
     * @param  list<RoutineExerciseData>  $exercises
     */
    public function __construct(
        public int $id,
        public ?int $memberId,
        public ?string $memberName,
        public string $title,
        public string $goal,
        public string $level,
        public int $daysPerWeek,
        public int $estimatedMinutes,
        public bool $isTemplate,
        public ?string $notes,
        public array $exercises,
        public ?string $createdAt,
    ) {}
}
