<?php

declare(strict_types=1);

namespace Modules\Dashboard\Application\DTOs;

use Modules\Billing\Contracts\DTOs\MonthlyBillingStatsData;
use Modules\Billing\Contracts\DTOs\PaymentSummaryData;
use Modules\Scheduling\Contracts\DTOs\ClassSessionSummaryData;

final readonly class DashboardSummaryData
{
    /**
     * @param  list<PaymentSummaryData>  $recentPayments
     * @param  list<ClassSessionSummaryData>  $featuredSessions
     */
    public function __construct(
        public MonthlyBillingStatsData $billing,
        public int $activeMembersCount,
        public ?ClassSessionSummaryData $nextSession,
        public array $recentPayments,
        public array $featuredSessions,
        public bool $gymIsOpen,
        public string $gymHoursLabel,
    ) {}
}
