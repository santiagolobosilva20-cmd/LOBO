<?php

declare(strict_types=1);

namespace Modules\Billing\Presentation\Http\Requests;

use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Billing\Application\DTOs\ListPaymentsFilterData;
use Modules\Billing\Domain\Enums\PaymentMethod;
use Modules\Shared\Application\DTOs\PaginationQuery;

final class ListPaymentsRequest extends FormRequest
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
            'method' => ['sometimes', 'nullable', 'string', Rule::in(PaymentMethod::values())],
            'month' => ['sometimes', 'nullable', 'date_format:Y-m'],
        ];
    }

    public function toDto(): ListPaymentsFilterData
    {
        /** @var array{page?: int|string, per_page?: int|string, search?: string|null, method?: string|null, month?: string|null} $validated */
        $validated = $this->validated();

        return new ListPaymentsFilterData(
            pagination: new PaginationQuery(
                page: isset($validated['page']) ? (int) $validated['page'] : 1,
                perPage: isset($validated['per_page']) ? (int) $validated['per_page'] : 15,
            ),
            search: $validated['search'] ?? null,
            method: isset($validated['method']) && $validated['method'] !== ''
                ? PaymentMethod::from($validated['method'])
                : null,
            month: isset($validated['month']) && $validated['month'] !== ''
                ? CarbonImmutable::createFromFormat('Y-m', $validated['month'])?->startOfMonth()
                : null,
        );
    }
}
