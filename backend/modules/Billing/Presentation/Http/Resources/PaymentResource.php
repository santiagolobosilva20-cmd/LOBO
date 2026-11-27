<?php

declare(strict_types=1);

namespace Modules\Billing\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Billing\Contracts\DTOs\PaymentSummaryData;

/**
 * @mixin PaymentSummaryData
 */
final class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var PaymentSummaryData $payment */
        $payment = $this->resource;

        return [
            'id' => $payment->id,
            'member_id' => $payment->memberId,
            'member_name' => $payment->memberName,
            'plan_id' => $payment->planId,
            'plan_name' => $payment->planName,
            'amount_cents' => $payment->amountCents,
            'formatted_amount' => $payment->formattedAmount,
            'payment_method' => $payment->paymentMethod,
            'status' => $payment->status,
            'paid_at' => $payment->paidAt,
            'notes' => $payment->notes,
            'created_at' => $payment->createdAt,
        ];
    }
}
