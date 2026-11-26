<?php

declare(strict_types=1);

namespace Modules\Members\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Members\Application\DTOs\CreateMemberData;
use Modules\Members\Domain\Enums\MemberStatus;

final class StoreMemberRequest extends FormRequest
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
            'full_name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['sometimes', 'nullable', 'string', 'email', 'max:160'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:40'],
            'document_number' => ['sometimes', 'nullable', 'string', 'max:40'],
            'status' => ['sometimes', 'string', Rule::in(MemberStatus::values())],
            'joined_at' => ['sometimes', 'date'],
        ];
    }

    public function toDto(): CreateMemberData
    {
        /** @var array{full_name: string, email?: string|null, phone?: string|null, document_number?: string|null, status?: string, joined_at?: string} $validated */
        $validated = $this->validated();

        return new CreateMemberData(
            fullName: $validated['full_name'],
            email: $validated['email'] ?? null,
            phone: $validated['phone'] ?? null,
            documentNumber: $validated['document_number'] ?? null,
            status: isset($validated['status'])
                ? MemberStatus::from($validated['status'])
                : MemberStatus::Active,
            joinedAt: $validated['joined_at'] ?? null,
        );
    }
}
