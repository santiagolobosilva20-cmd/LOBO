<?php

declare(strict_types=1);

namespace Modules\Members\Contracts\Queries;

use Modules\Members\Contracts\DTOs\MemberSummaryData;

interface MemberLookupInterface
{
    public function findSummaryById(int $memberId): ?MemberSummaryData;

    public function findOrCreateByName(string $fullName): MemberSummaryData;

    public function countActive(): int;
}
