<?php

declare(strict_types=1);

namespace Modules\Training\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Training\Contracts\DTOs\RoutineExerciseData;
use Modules\Training\Contracts\DTOs\RoutineSummaryData;

/**
 * @mixin RoutineSummaryData
 */
final class RoutineResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var RoutineSummaryData $routine */
        $routine = $this->resource;

        return [
            'id' => $routine->id,
            'member_id' => $routine->memberId,
            'member_name' => $routine->memberName,
            'title' => $routine->title,
            'goal' => $routine->goal,
            'level' => $routine->level,
            'days_per_week' => $routine->daysPerWeek,
            'estimated_minutes' => $routine->estimatedMinutes,
            'is_template' => $routine->isTemplate,
            'notes' => $routine->notes,
            'exercises' => array_map(
                static fn (RoutineExerciseData $exercise): array => [
                    'id' => $exercise->id,
                    'day_label' => $exercise->dayLabel,
                    'exercise_name' => $exercise->exerciseName,
                    'sets' => $exercise->sets,
                    'reps' => $exercise->reps,
                    'target_weight' => $exercise->targetWeight,
                    'rest_seconds' => $exercise->restSeconds,
                    'sort_order' => $exercise->sortOrder,
                ],
                $routine->exercises,
            ),
            'created_at' => $routine->createdAt,
        ];
    }
}
