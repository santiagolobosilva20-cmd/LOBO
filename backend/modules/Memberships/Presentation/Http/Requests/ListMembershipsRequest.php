<?php

declare(strict_types=1);

namespace Modules\Memberships\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Memberships\Application\DTOs\ListMembershipsFilterData;
use Modules\Memberships\Domain\Enums\MembershipStatus;
use Modules\Shared\Application\DTOs\PaginationQuery;

final class ListMembershipsRequest extends FormRequest
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
        $allowedStatuses = [...MembershipStatus::values(), 'expiring_soon'];

        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'search' => ['sometimes', 'nullable', 'string', 'max:120'],
            'status' => ['sometimes', 'nullable', 'string', Rule::in($allowedStatuses)],
            'member_id' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function toDto(): ListMembershipsFilterData
    {
        /** @var array{page?: int|string, per_page?: int|string, search?: string|null, status?: string|null, member_id?: int|string} $validated */
        $validated = $this->validated();

        $search = isset($validated['search']) ? trim((string) $validated['search']) : '';
        $status = isset($validated['status']) ? trim((string) $validated['status']) : '';

        return new ListMembershipsFilterData(
            pagination: new PaginationQuery(
                page: isset($validated['page']) ? (int) $validated['page'] : 1,
                perPage: isset($validated['per_page']) ? (int) $validated['per_page'] : 15,
            ),
            search: $search !== '' ? $search : null,
            status: $status !== '' ? $status : null,
            memberId: isset($validated['member_id']) ? (int) $validated['member_id'] : null,
        );
    }
}
