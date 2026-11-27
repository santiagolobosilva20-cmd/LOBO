<?php

declare(strict_types=1);

namespace Modules\Memberships\Application\DTOs;

use Carbon\CarbonImmutable;

final readonly class CreateMembershipData
{
    public function __construct(
        public int $planId,
        public ?int $memberId = null,
        public ?string $memberName = null,
        public ?CarbonImmutable $startsAt = null,
        public bool $autoRenew = false,
        public ?string $notes = null,
    ) {}
}
