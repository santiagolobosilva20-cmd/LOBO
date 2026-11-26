<?php

declare(strict_types=1);

namespace Modules\Billing\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Billing\Application\DTOs\RegisterPaymentData;
use Modules\Billing\Domain\Enums\PaymentMethod;

final class StorePaymentRequest extends FormRequest
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
            'plan_id' => ['required', 'integer', 'min:1'],
            'payment_method' => ['required', 'string', Rule::in(PaymentMethod::values())],
            'amount_cents' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100000000'],
            'paid_at' => ['sometimes', 'nullable', 'date'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }

    public function toDto(): RegisterPaymentData
    {
        /** @var array{member_id?: int|string|null, member_name?: string|null, plan_id: int|string, payment_method: string, amount_cents?: int|string|null, paid_at?: string|null, notes?: string|null} $validated */
        $validated = $this->validated();

        return new RegisterPaymentData(
            planId: (int) $validated['plan_id'],
            paymentMethod: PaymentMethod::from($validated['payment_method']),
            memberId: isset($validated['member_id']) ? (int) $validated['member_id'] : null,
            memberName: $validated['member_name'] ?? null,
            amountCents: isset($validated['amount_cents']) ? (int) $validated['amount_cents'] : null,
            paidAt: $validated['paid_at'] ?? null,
            notes: $validated['notes'] ?? null,
        );
    }
}
