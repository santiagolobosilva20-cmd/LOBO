<?php

declare(strict_types=1);

namespace Modules\Billing\Contracts\Events;

use Modules\Billing\Contracts\DTOs\PaymentSummaryData;

final readonly class PaymentRecorded
{
    public function __construct(
        public PaymentSummaryData $payment,
    ) {}
}
