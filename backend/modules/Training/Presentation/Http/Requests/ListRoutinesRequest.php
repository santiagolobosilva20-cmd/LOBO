<?php

declare(strict_types=1);

namespace Modules\Training\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Shared\Application\DTOs\PaginationQuery;
use Modules\Training\Application\DTOs\ListRoutinesFilterData;
use Modules\Training\Domain\Enums\RoutineGoal;

final class ListRoutinesRequest extends FormRequest
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
            'goal' => ['sometimes', 'nullable', 'string', Rule::in(RoutineGoal::values())],
            'is_template' => ['sometimes', 'nullable', 'boolean'],
            'member_id' => ['sometimes', 'integer', 'min:1'],
            'search' => ['sometimes', 'nullable', 'string', 'max:120'],
        ];
    }

    public function toDto(): ListRoutinesFilterData
    {
        /** @var array{page?: int|string, per_page?: int|string, goal?: string|null, is_template?: bool|int|string|null, member_id?: int|string, search?: string|null} $validated */
        $validated = $this->validated();

        $goal = isset($validated['goal']) ? trim((string) $validated['goal']) : '';
        $search = isset($validated['search']) ? trim((string) $validated['search']) : '';

        return new ListRoutinesFilterData(
            pagination: new PaginationQuery(
                page: isset($validated['page']) ? (int) $validated['page'] : 1,
                perPage: isset($validated['per_page']) ? (int) $validated['per_page'] : 20,
            ),
            goal: $goal !== '' ? $goal : null,
            isTemplate: array_key_exists('is_template', $validated) && $validated['is_template'] !== null
                ? filter_var($validated['is_template'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
                : null,
            memberId: isset($validated['member_id']) ? (int) $validated['member_id'] : null,
            search: $search !== '' ? $search : null,
        );
    }
}
