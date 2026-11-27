<?php

declare(strict_types=1);

namespace Modules\Memberships\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class RenewMembershipRequest extends FormRequest
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
            'plan_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
        ];
    }

    public function planId(): ?int
    {
        /** @var array{plan_id?: int|string|null} $validated */
        $validated = $this->validated();

        return isset($validated['plan_id']) ? (int) $validated['plan_id'] : null;
    }
}
