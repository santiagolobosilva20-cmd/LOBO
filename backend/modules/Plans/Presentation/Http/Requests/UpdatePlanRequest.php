<?php

declare(strict_types=1);

namespace Modules\Plans\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Plans\Application\DTOs\UpdatePlanData;

final class UpdatePlanRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'min:2', 'max:100'],
            'price_cents' => ['sometimes', 'integer', 'min:0', 'max:100000000'],
            'duration_days' => ['sometimes', 'integer', 'min:1', 'max:3650'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function toDto(): UpdatePlanData
    {
        /** @var array{name?: string, price_cents?: int|string, duration_days?: int|string, description?: string|null, is_active?: bool} $validated */
        $validated = $this->validated();

        return new UpdatePlanData(
            name: $validated['name'] ?? null,
            priceCents: isset($validated['price_cents']) ? (int) $validated['price_cents'] : null,
            durationDays: isset($validated['duration_days']) ? (int) $validated['duration_days'] : null,
            description: $validated['description'] ?? null,
            hasDescription: array_key_exists('description', $validated),
            isActive: array_key_exists('is_active', $validated) ? (bool) $validated['is_active'] : null,
        );
    }
}
