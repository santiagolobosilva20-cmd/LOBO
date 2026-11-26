<?php

declare(strict_types=1);

namespace Modules\Scheduling\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Scheduling\Application\DTOs\CreateWorkoutData;
use Modules\Scheduling\Domain\Enums\WorkoutLevel;

final class StoreWorkoutRequest extends FormRequest
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
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'category' => ['required', 'string', 'min:2', 'max:60'],
            'level' => ['sometimes', 'string', Rule::in(WorkoutLevel::values())],
            'default_duration_minutes' => ['sometimes', 'integer', 'min:10', 'max:240'],
            'badge_label' => ['sometimes', 'string', 'max:60'],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:255'],
            'display_order' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    public function toDto(): CreateWorkoutData
    {
        /** @var array{name: string, category: string, level?: string, default_duration_minutes?: int|string, badge_label?: string, image_url?: string|null, display_order?: int|string, description?: string|null} $validated */
        $validated = $this->validated();

        return new CreateWorkoutData(
            name: $validated['name'],
            category: $validated['category'],
            level: isset($validated['level']) ? WorkoutLevel::from($validated['level']) : WorkoutLevel::AllLevels,
            defaultDurationMinutes: isset($validated['default_duration_minutes'])
                ? (int) $validated['default_duration_minutes']
                : 45,
            badgeLabel: $validated['badge_label'] ?? 'TODOS LOS NIVELES',
            imageUrl: $validated['image_url'] ?? null,
            displayOrder: isset($validated['display_order']) ? (int) $validated['display_order'] : 1,
            description: $validated['description'] ?? null,
        );
    }
}
