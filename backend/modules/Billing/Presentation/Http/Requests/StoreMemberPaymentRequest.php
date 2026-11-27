<?php

declare(strict_types=1);

namespace Modules\Billing\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Billing\Domain\Enums\PaymentMethod;

final class StoreMemberPaymentRequest extends FormRequest
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
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
            'payment_method' => ['required', 'string', Rule::in(PaymentMethod::values())],
            'notes' => ['nullable', 'string', 'max:400'],
        ];
    }

    public function planId(): int
    {
        return $this->integer('plan_id');
    }

    public function paymentMethod(): PaymentMethod
    {
        return PaymentMethod::from($this->string('payment_method')->toString());
    }

    public function notes(): ?string
    {
        $notes = $this->string('notes')->toString();

        return $notes !== '' ? $notes : null;
    }
}
