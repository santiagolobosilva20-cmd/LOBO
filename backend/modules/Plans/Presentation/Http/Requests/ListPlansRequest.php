<?php

declare(strict_types=1);

namespace Modules\Plans\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Plans\Application\DTOs\ListPlansFilterData;
use Modules\Shared\Application\DTOs\PaginationQuery;

final class ListPlansRequest extends FormRequest
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
            'active_only' => ['sometimes', 'boolean'],
        ];
    }

    public function toDto(): ListPlansFilterData
    {
        /** @var array{page?: int|string, per_page?: int|string, active_only?: bool|string|int} $validated */
        $validated = $this->validated();

        return new ListPlansFilterData(
            pagination: new PaginationQuery(
                page: isset($validated['page']) ? (int) $validated['page'] : 1,
                perPage: isset($validated['per_page']) ? (int) $validated['per_page'] : 20,
            ),
            activeOnly: isset($validated['active_only'])
                ? filter_var($validated['active_only'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
                : null,
        );
    }
}
