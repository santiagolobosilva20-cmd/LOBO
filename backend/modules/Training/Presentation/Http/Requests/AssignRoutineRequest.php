<?php

declare(strict_types=1);

namespace Modules\Training\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class AssignRoutineRequest extends FormRequest
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
        ];
    }

    public function memberId(): ?int
    {
        /** @var array{member_id?: int|string|null} $validated */
        $validated = $this->validated();

        return isset($validated['member_id']) ? (int) $validated['member_id'] : null;
    }

    public function memberName(): ?string
    {
        /** @var array{member_name?: string|null} $validated */
        $validated = $this->validated();

        return $validated['member_name'] ?? null;
    }
}
