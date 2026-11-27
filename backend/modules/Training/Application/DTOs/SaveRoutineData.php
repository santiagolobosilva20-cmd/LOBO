<?php

declare(strict_types=1);

namespace Modules\Training\Application\DTOs;

use Modules\Training\Domain\Enums\RoutineGoal;

final readonly class SaveRoutineData
{
    /**
     * @param  list<RoutineExerciseInputData>  $exercises
     */
    public function __construct(
        public string $title,
        public RoutineGoal $goal,
        public string $level,
        public int $daysPerWeek,
        public int $estimatedMinutes,
        public bool $isTemplate,
        public ?int $memberId = null,
        public ?string $memberName = null,
        public ?string $notes = null,
        public array $exercises = [],
    ) {}
}
