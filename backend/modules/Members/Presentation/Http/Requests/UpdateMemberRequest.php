<?php

declare(strict_types=1);

namespace Modules\Members\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Members\Application\DTOs\UpdateMemberData;
use Modules\Members\Domain\Enums\MemberStatus;

final class UpdateMemberRequest extends FormRequest
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
            'full_name' => ['sometimes', 'string', 'min:2', 'max:120'],
            'email' => ['sometimes', 'string', 'email', 'max:160'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:40'],
            'document_number' => ['sometimes', 'nullable', 'string', 'max:40'],
            'status' => ['sometimes', 'string', Rule::in(MemberStatus::values())],
        ];
    }

    public function toDto(): UpdateMemberData
    {
        /** @var array{full_name?: string, email?: string, phone?: string|null, document_number?: string|null, status?: string} $validated */
        $validated = $this->validated();

        return new UpdateMemberData(
            fullName: $validated['full_name'] ?? null,
            email: $validated['email'] ?? null,
            phone: $validated['phone'] ?? null,
            hasPhone: array_key_exists('phone', $validated),
            documentNumber: $validated['document_number'] ?? null,
            hasDocumentNumber: array_key_exists('document_number', $validated),
            status: isset($validated['status']) ? MemberStatus::from($validated['status']) : null,
        );
    }
}
