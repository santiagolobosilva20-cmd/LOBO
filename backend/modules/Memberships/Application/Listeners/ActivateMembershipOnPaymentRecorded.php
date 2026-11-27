<?php

declare(strict_types=1);

namespace Modules\Memberships\Application\Listeners;

use Modules\Billing\Contracts\Events\PaymentRecorded;
use Modules\Memberships\Application\Services\MembershipService;

final readonly class ActivateMembershipOnPaymentRecorded
{
    public function __construct(
        private MembershipService $membershipService,
    ) {}

    public function handle(PaymentRecorded $event): void
    {
        $this->membershipService->activateFromPayment($event->payment);
    }
}
