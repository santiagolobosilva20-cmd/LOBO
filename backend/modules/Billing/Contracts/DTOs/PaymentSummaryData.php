<?php

declare(strict_types=1);

namespace Modules\Billing\Contracts\DTOs;

final readonly class PaymentSummaryData
{
    public function __construct(
        public int $id,
        public int $memberId,
        public string $memberName,
        public int $planId,
        public string $planName,
        public int $amountCents,
        public string $formattedAmount,
        public string $paymentMethod,
        public string $paidAt,
        public ?string $notes,
        public ?string $createdAt,
        public string $status = 'paid',
    ) {}
}
