<?php

declare(strict_types=1);

namespace Modules\Billing\Contracts\DTOs;

final readonly class MonthlyBillingStatsData
{
    public function __construct(
        public int $monthlyRevenueCents,
        public string $formattedMonthlyRevenue,
        public int $monthlyPaymentsCount,
    ) {}
}
