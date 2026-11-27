<?php

declare(strict_types=1);

namespace Modules\Training\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Training\Contracts\DTOs\WorkoutLogSummaryData;

/**
 * @mixin WorkoutLogSummaryData
 */
final class WorkoutLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var WorkoutLogSummaryData $log */
        $log = $this->resource;

        return [
            'id' => $log->id,
            'member_id' => $log->memberId,
            'member_name' => $log->memberName,
            'workout_id' => $log->workoutId,
            'routine_id' => $log->routineId,
            'title' => $log->title,
            'category' => $log->category,
            'performed_at' => $log->performedAt,
            'duration_minutes' => $log->durationMinutes,
            'effort_rpe' => $log->effortRpe,
            'calories_estimate' => $log->caloriesEstimate,
            'notes' => $log->notes,
            'created_at' => $log->createdAt,
        ];
    }
}
