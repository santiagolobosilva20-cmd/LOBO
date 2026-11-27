<?php

declare(strict_types=1);

namespace Modules\Memberships\Contracts\DTOs;

final readonly class MembershipSummaryData
{
    public function __construct(
        public int $id,
        public int $memberId,
        public string $memberName,
        public int $planId,
        public string $planName,
        public ?int $lastPaymentId,
        public string $startsAt,
        public string $endsAt,
        public int $daysRemaining,
        public bool $isExpiringSoon,
        public string $status,
        public bool $autoRenew,
        public ?string $notes,
        public ?string $createdAt,
    ) {}
}
