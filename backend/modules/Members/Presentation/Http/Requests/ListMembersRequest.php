<?php

declare(strict_types=1);

namespace Modules\Members\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Members\Application\DTOs\ListMembersFilterData;
use Modules\Members\Domain\Enums\MemberStatus;
use Modules\Shared\Application\DTOs\PaginationQuery;

final class ListMembersRequest extends FormRequest
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
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'search' => ['sometimes', 'nullable', 'string', 'max:120'],
            'status' => ['sometimes', 'nullable', 'string', Rule::in(MemberStatus::values())],
        ];
    }

    public function toDto(): ListMembersFilterData
    {
        /** @var array{page?: int|string, per_page?: int|string, search?: string|null, status?: string|null} $validated */
        $validated = $this->validated();

        return new ListMembersFilterData(
            pagination: new PaginationQuery(
                page: isset($validated['page']) ? (int) $validated['page'] : 1,
                perPage: isset($validated['per_page']) ? (int) $validated['per_page'] : 15,
            ),
            search: $validated['search'] ?? null,
            status: isset($validated['status']) && $validated['status'] !== ''
                ? MemberStatus::from($validated['status'])
                : null,
        );
    }
}
