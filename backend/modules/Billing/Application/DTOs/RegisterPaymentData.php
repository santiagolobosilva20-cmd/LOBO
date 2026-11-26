<?php

declare(strict_types=1);

namespace Modules\Billing\Application\DTOs;

use Modules\Billing\Domain\Enums\PaymentMethod;

final readonly class RegisterPaymentData
{
    public function __construct(
        public int $planId,
        public PaymentMethod $paymentMethod,
        public ?int $memberId = null,
        public ?string $memberName = null,
        public ?int $amountCents = null,
        public ?string $paidAt = null,
        public ?string $notes = null,
    ) {}
}
