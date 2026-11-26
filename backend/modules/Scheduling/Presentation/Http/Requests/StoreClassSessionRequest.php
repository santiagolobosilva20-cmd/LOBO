<?php

declare(strict_types=1);

namespace Modules\Scheduling\Presentation\Http\Requests;

use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Modules\Scheduling\Application\DTOs\CreateClassSessionData;

final class StoreClassSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'workout_id' => ['required', 'integer', 'min:1'],
            'day_of_week' => ['sometimes', 'integer', 'min:1', 'max:6'],
            'room' => ['required', 'string', 'min:2', 'max:80'],
            'instructor_name' => ['required', 'string', 'min:2', 'max:100'],
            'starts_at' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer', 'min:10', 'max:240'],
            'capacity' => ['required', 'integer', 'min:1', 'max:200'],
            'enrolled_count' => ['sometimes', 'integer', 'min:0', 'max:200'],
            'accent_color' => ['sometimes', 'string', 'max:20'],
        ];
    }

    public function toDto(): CreateClassSessionData
    {
        /** @var array{workout_id: int|string, day_of_week?: int|string, room: string, instructor_name: string, starts_at: string, duration_minutes: int|string, capacity: int|string, enrolled_count?: int|string, accent_color?: string} $validated */
        $validated = $this->validated();

        return new CreateClassSessionData(
            workoutId: (int) $validated['workout_id'],
            room: $validated['room'],
            instructorName: $validated['instructor_name'],
            startsAt: CarbonImmutable::parse($validated['starts_at']),
            durationMinutes: (int) $validated['duration_minutes'],
            capacity: (int) $validated['capacity'],
            dayOfWeek: isset($validated['day_of_week']) ? (int) $validated['day_of_week'] : 1,
            enrolledCount: isset($validated['enrolled_count']) ? (int) $validated['enrolled_count'] : 0,
            accentColor: $validated['accent_color'] ?? '#CEF542',
        );
    }
}
