<?php

declare(strict_types=1);

namespace Modules\Memberships\Contracts\Queries;

use Modules\Memberships\Contracts\DTOs\MembershipStatsData;
use Modules\Memberships\Contracts\DTOs\MembershipSummaryData;

interface MembershipSummaryQueryInterface
{
    public function getStats(): MembershipStatsData;

    public function findActiveForMember(int $memberId): ?MembershipSummaryData;
}
