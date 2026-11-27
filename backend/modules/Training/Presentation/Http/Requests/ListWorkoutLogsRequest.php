<?php

declare(strict_types=1);

namespace Modules\Training\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Shared\Application\DTOs\PaginationQuery;
use Modules\Training\Application\DTOs\ListWorkoutLogsFilterData;

final class ListWorkoutLogsRequest extends FormRequest
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
            'member_id' => ['sometimes', 'integer', 'min:1'],
            'category' => ['sometimes', 'nullable', 'string', 'max:60'],
            'search' => ['sometimes', 'nullable', 'string', 'max:120'],
        ];
    }

    public function toDto(): ListWorkoutLogsFilterData
    {
        /** @var array{page?: int|string, per_page?: int|string, member_id?: int|string, category?: string|null, search?: string|null} $validated */
        $validated = $this->validated();

        $category = isset($validated['category']) ? trim((string) $validated['category']) : '';
        $search = isset($validated['search']) ? trim((string) $validated['search']) : '';

        return new ListWorkoutLogsFilterData(
            pagination: new PaginationQuery(
                page: isset($validated['page']) ? (int) $validated['page'] : 1,
                perPage: isset($validated['per_page']) ? (int) $validated['per_page'] : 20,
            ),
            memberId: isset($validated['member_id']) ? (int) $validated['member_id'] : null,
            category: $category !== '' ? $category : null,
            search: $search !== '' ? $search : null,
        );
    }
}
