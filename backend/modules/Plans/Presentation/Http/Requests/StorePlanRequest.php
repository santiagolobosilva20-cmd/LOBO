<?php

declare(strict_types=1);

namespace Modules\Plans\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Plans\Application\DTOs\CreatePlanData;

final class StorePlanRequest extends FormRequest
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
            'tagline' => ['sometimes', 'nullable', 'string', 'max:80'],
            'price_cents' => ['required', 'integer', 'min:0', 'max:100000000'],
            'duration_days' => ['required', 'integer', 'min:1', 'max:3650'],
            'billing_period_label' => ['sometimes', 'string', 'min:1', 'max:40'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'features' => ['sometimes', 'array', 'max:10'],
            'features.*' => ['string', 'max:120'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function toDto(): CreatePlanData
    {
        /** @var array{name: string, tagline?: string|null, price_cents: int|string, duration_days: int|string, billing_period_label?: string, description?: string|null, features?: list<string>, is_featured?: bool, is_active?: bool} $validated */
        $validated = $this->validated();

        return new CreatePlanData(
            name: $validated['name'],
            priceCents: (int) $validated['price_cents'],
            durationDays: (int) $validated['duration_days'],
            tagline: $validated['tagline'] ?? null,
            billingPeriodLabel: $validated['billing_period_label'] ?? 'mes',
            description: $validated['description'] ?? null,
            features: $validated['features'] ?? [],
            isFeatured: (bool) ($validated['is_featured'] ?? false),
            isActive: (bool) ($validated['is_active'] ?? true),
        );
    }
}
