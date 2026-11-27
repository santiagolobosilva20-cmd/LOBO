<?php

declare(strict_types=1);

use Carbon\CarbonImmutable;
use Modules\Memberships\Domain\Enums\MembershipStatus;
use Modules\Memberships\Domain\Models\Membership;

it('computes effective expired status and zero remaining days past ends_at', function (): void {
    $today = CarbonImmutable::parse('2026-11-27');

    $membership = new Membership([
        'starts_at' => '2026-10-01',
        'ends_at' => '2026-10-31',
        'status' => MembershipStatus::Active,
    ]);

    expect($membership->effectiveStatus($today))->toBe(MembershipStatus::Expired)
        ->and($membership->daysRemaining($today))->toBe(0);
});

it('keeps active status and positive remaining days before ends_at', function (): void {
    $today = CarbonImmutable::parse('2026-11-27');

    $membership = new Membership([
        'starts_at' => '2026-11-20',
        'ends_at' => '2026-12-02',
        'status' => MembershipStatus::Active,
    ]);

    expect($membership->effectiveStatus($today))->toBe(MembershipStatus::Active)
        ->and($membership->daysRemaining($today))->toBe(5);
});
