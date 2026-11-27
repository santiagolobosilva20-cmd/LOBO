<?php

declare(strict_types=1);

namespace Modules\Training\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Training\Application\DTOs\RoutineExerciseInputData;
use Modules\Training\Application\DTOs\SaveRoutineData;
use Modules\Training\Domain\Enums\RoutineGoal;

final class SaveRoutineRequest extends FormRequest
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
            'title' => ['required', 'string', 'min:2', 'max:120'],
            'goal' => ['required', 'string', Rule::in(RoutineGoal::values())],
            'level' => ['sometimes', 'string', Rule::in(['all_levels', 'beginner', 'intermediate', 'advanced'])],
            'days_per_week' => ['sometimes', 'integer', 'min:1', 'max:7'],
            'estimated_minutes' => ['sometimes', 'integer', 'min:10', 'max:240'],
            'is_template' => ['sometimes', 'boolean'],
            'member_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'member_name' => ['sometimes', 'nullable', 'string', 'min:2', 'max:120'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'exercises' => ['sometimes', 'array', 'max:40'],
            'exercises.*.day_label' => ['required', 'string', 'min:1', 'max:60'],
            'exercises.*.exercise_name' => ['required', 'string', 'min:1', 'max:120'],
            'exercises.*.sets' => ['required', 'integer', 'min:1', 'max:20'],
            'exercises.*.reps' => ['required', 'string', 'min:1', 'max:30'],
            'exercises.*.target_weight' => ['sometimes', 'nullable', 'string', 'max:40'],
            'exercises.*.rest_seconds' => ['sometimes', 'integer', 'min:0', 'max:600'],
            'exercises.*.sort_order' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function toDto(): SaveRoutineData
    {
        /**
         * @var array{
         *   title: string,
         *   goal: string,
         *   level?: string,
         *   days_per_week?: int|string,
         *   estimated_minutes?: int|string,
         *   is_template?: bool,
         *   member_id?: int|string|null,
         *   member_name?: string|null,
         *   notes?: string|null,
         *   exercises?: list<array{day_label: string, exercise_name: string, sets: int|string, reps: string, target_weight?: string|null, rest_seconds?: int|string, sort_order?: int|string}>
         * } $validated
         */
        $validated = $this->validated();

        $exercises = [];
        foreach ($validated['exercises'] ?? [] as $index => $row) {
            $exercises[] = new RoutineExerciseInputData(
                dayLabel: $row['day_label'],
                exerciseName: $row['exercise_name'],
                sets: (int) $row['sets'],
                reps: $row['reps'],
                targetWeight: $row['target_weight'] ?? null,
                restSeconds: isset($row['rest_seconds']) ? (int) $row['rest_seconds'] : 60,
                sortOrder: isset($row['sort_order']) ? (int) $row['sort_order'] : ($index + 1),
            );
        }

        return new SaveRoutineData(
            title: $validated['title'],
            goal: RoutineGoal::from($validated['goal']),
            level: $validated['level'] ?? 'all_levels',
            daysPerWeek: isset($validated['days_per_week']) ? (int) $validated['days_per_week'] : 4,
            estimatedMinutes: isset($validated['estimated_minutes']) ? (int) $validated['estimated_minutes'] : 50,
            isTemplate: (bool) ($validated['is_template'] ?? true),
            memberId: isset($validated['member_id']) ? (int) $validated['member_id'] : null,
            memberName: $validated['member_name'] ?? null,
            notes: $validated['notes'] ?? null,
            exercises: $exercises,
        );
    }
}
