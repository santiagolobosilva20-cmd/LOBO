<?php

declare(strict_types=1);

use Modules\Billing\Contracts\DTOs\MonthlyBillingStatsData;
use Modules\Billing\Contracts\Queries\BillingSummaryQueryInterface;
use Modules\Dashboard\Application\Services\GetDashboardSummaryService;
use Modules\Members\Contracts\Queries\MemberLookupInterface;
use Modules\Memberships\Contracts\DTOs\MembershipStatsData;
use Modules\Memberships\Contracts\Queries\MembershipSummaryQueryInterface;
use Modules\Scheduling\Contracts\DTOs\ClassSessionSummaryData;
use Modules\Scheduling\Contracts\Queries\ScheduleSummaryQueryInterface;

it('aggregates kpis, memberships, recent payments and featured sessions from module contracts', function (): void {
    $billingQuery = Mockery::mock(BillingSummaryQueryInterface::class);
    $billingQuery->shouldReceive('getMonthlyStats')->once()->andReturn(
        new MonthlyBillingStatsData(89000, '$890.00', 1),
    );
    $billingQuery->shouldReceive('getRecentPayments')->once()->with(8)->andReturn([]);

    $memberLookup = Mockery::mock(MemberLookupInterface::class);
    $memberLookup->shouldReceive('countActive')->once()->andReturn(1);

    $membershipQuery = Mockery::mock(MembershipSummaryQueryInterface::class);
    $membershipQuery->shouldReceive('getStats')->once()->andReturn(
        new MembershipStatsData(activeCount: 1, expiringSoonCount: 0, pausedCount: 0, expiredCount: 0),
    );

    $nextSession = new ClassSessionSummaryData(
        id: 1,
        workoutId: 1,
        workoutName: 'Fuerza funcional',
        category: 'FUERZA',
        dayOfWeek: 1,
        dayLabel: 'Lunes',
        room: 'Sala Norte',
        instructorName: 'Carlos Méndez',
        startsAt: '2026-11-26T07:00:00-05:00',
        startTimeLabel: '07:00 AM',
        shortTimeLabel: '07:00',
        durationMinutes: 45,
        capacity: 12,
        enrolledCount: 8,
        accentColor: '#CEF542',
        status: 'scheduled',
    );

    $scheduleQuery = Mockery::mock(ScheduleSummaryQueryInterface::class);
    $scheduleQuery->shouldReceive('getNextUpcoming')->once()->andReturn($nextSession);
    $scheduleQuery->shouldReceive('getFeaturedToday')->once()->with(4)->andReturn([$nextSession]);

    $service = new GetDashboardSummaryService($billingQuery, $memberLookup, $membershipQuery, $scheduleQuery);
    $summary = $service->execute();

    expect($summary->billing->formattedMonthlyRevenue)->toBe('$890.00')
        ->and($summary->activeMembersCount)->toBe(1)
        ->and($summary->membershipStats->activeCount)->toBe(1)
        ->and($summary->nextSession?->workoutName)->toBe('Fuerza funcional')
        ->and($summary->gymHoursLabel)->toBe('Lun a sáb · 06:00–22:00');
});
