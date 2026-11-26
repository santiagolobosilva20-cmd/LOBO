<?php

declare(strict_types=1);

namespace Modules\Billing\Contracts\Queries;

use Carbon\CarbonImmutable;
use Modules\Billing\Contracts\DTOs\AllTimeBillingStatsData;
use Modules\Billing\Contracts\DTOs\MonthlyBillingStatsData;
use Modules\Billing\Contracts\DTOs\PaymentSummaryData;

interface BillingSummaryQueryInterface
{
    public function getMonthlyStats(?CarbonImmutable $month = null): MonthlyBillingStatsData;

    public function getAllTimeStats(): AllTimeBillingStatsData;

    /**
     * @return list<PaymentSummaryData>
     */
    public function getRecentPayments(int $limit = 8): array;
}
