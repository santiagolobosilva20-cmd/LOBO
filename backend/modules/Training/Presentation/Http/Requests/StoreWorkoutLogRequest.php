<?php

declare(strict_types=1);

namespace Modules\Training\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Training\Application\DTOs\CreateWorkoutLogData;

final class StoreWorkoutLogRequest extends FormRequest
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
            'member_id' => ['required_without:member_name', 'nullable', 'integer', 'min:1'],
            'member_name' => ['required_without:member_id', 'nullable', 'string', 'min:2', 'max:120'],
            'workout_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'routine_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'title' => ['required', 'string', 'min:2', 'max:120'],
            'category' => ['sometimes', 'string', 'min:2', 'max:60'],
            'performed_at' => ['sometimes', 'date'],
            'duration_minutes' => ['sometimes', 'integer', 'min:5', 'max:300'],
            'effort_rpe' => ['sometimes', 'integer', 'min:1', 'max:10'],
            'calories_estimate' => ['sometimes', 'nullable', 'integer', 'min:10', 'max:4000'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    public function toDto(): CreateWorkoutLogData
    {
        /** @var array{member_id?: int|string|null, member_name?: string|null, workout_id?: int|string|null, routine_id?: int|string|null, title: string, category?: string, performed_at?: string, duration_minutes?: int|string, effort_rpe?: int|string, calories_estimate?: int|string|null, notes?: string|null} $validated */
        $validated = $this->validated();

        return new CreateWorkoutLogData(
            title: $validated['title'],
            category: $validated['category'] ?? 'ENTRENAMIENTO',
            memberId: isset($validated['member_id']) ? (int) $validated['member_id'] : null,
            memberName: $validated['member_name'] ?? null,
            workoutId: isset($validated['workout_id']) ? (int) $validated['workout_id'] : null,
            routineId: isset($validated['routine_id']) ? (int) $validated['routine_id'] : null,
            performedAt: $validated['performed_at'] ?? null,
            durationMinutes: isset($validated['duration_minutes']) ? (int) $validated['duration_minutes'] : 45,
            effortRpe: isset($validated['effort_rpe']) ? (int) $validated['effort_rpe'] : 7,
            caloriesEstimate: isset($validated['calories_estimate']) ? (int) $validated['calories_estimate'] : null,
            notes: $validated['notes'] ?? null,
        );
    }
}
