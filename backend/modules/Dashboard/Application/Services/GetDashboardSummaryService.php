<?php

declare(strict_types=1);

namespace Modules\Dashboard\Application\Services;

use Modules\Billing\Contracts\Queries\BillingSummaryQueryInterface;
use Modules\Dashboard\Application\DTOs\DashboardSummaryData;
use Modules\Members\Contracts\Queries\MemberLookupInterface;
use Modules\Memberships\Contracts\Queries\MembershipSummaryQueryInterface;
use Modules\Scheduling\Contracts\Queries\ScheduleSummaryQueryInterface;
use Modules\Shared\Domain\ValueObjects\GymOperatingHours;

final readonly class GetDashboardSummaryService
{
    public function __construct(
        private BillingSummaryQueryInterface $billingSummary,
        private MemberLookupInterface $memberLookup,
        private MembershipSummaryQueryInterface $membershipSummary,
        private ScheduleSummaryQueryInterface $scheduleSummary,
    ) {}

    #[\NoDiscard]
    public function execute(): DashboardSummaryData
    {
        $hours = new GymOperatingHours;

        return new DashboardSummaryData(
            billing: $this->billingSummary->getMonthlyStats(),
            activeMembersCount: $this->memberLookup->countActive(),
            membershipStats: $this->membershipSummary->getStats(),
            nextSession: $this->scheduleSummary->getNextUpcoming(),
            recentPayments: $this->billingSummary->getRecentPayments(limit: 8),
            featuredSessions: $this->scheduleSummary->getFeaturedToday(limit: 4),
            gymIsOpen: $hours->isOpenAt(),
            gymHoursLabel: $hours->label(),
        );
    }
}
