<?php

declare(strict_types=1);

namespace Modules\Scheduling\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Scheduling\Contracts\DTOs\ClassSessionSummaryData;

/**
 * @mixin ClassSessionSummaryData
 */
final class ClassSessionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var ClassSessionSummaryData $session */
        $session = $this->resource;

        return [
            'id' => $session->id,
            'workout_id' => $session->workoutId,
            'workout_name' => $session->workoutName,
            'category' => $session->category,
            'day_of_week' => $session->dayOfWeek,
            'day_label' => $session->dayLabel,
            'room' => $session->room,
            'instructor_name' => $session->instructorName,
            'starts_at' => $session->startsAt,
            'start_time_label' => $session->startTimeLabel,
            'short_time_label' => $session->shortTimeLabel,
            'duration_minutes' => $session->durationMinutes,
            'capacity' => $session->capacity,
            'enrolled_count' => $session->enrolledCount,
            'accent_color' => $session->accentColor,
            'status' => $session->status,
        ];
    }
}
