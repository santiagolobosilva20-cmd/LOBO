<?php

declare(strict_types=1);

namespace Modules\Billing\Contracts\DTOs;

final readonly class AllTimeBillingStatsData
{
    public function __construct(
        public int $totalRevenueCents,
        public string $formattedTotalRevenue,
        public int $distinctMembersCount,
        public int $totalPaymentsCount,
    ) {}
}
