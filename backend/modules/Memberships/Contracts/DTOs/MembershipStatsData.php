<?php

declare(strict_types=1);

namespace Modules\Memberships\Contracts\DTOs;

final readonly class MembershipStatsData
{
    public function __construct(
        public int $activeCount,
        public int $expiringSoonCount,
        public int $pausedCount,
        public int $expiredCount,
    ) {}
}
