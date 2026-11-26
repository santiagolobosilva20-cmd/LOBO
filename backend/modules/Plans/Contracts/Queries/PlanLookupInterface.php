<?php

declare(strict_types=1);

namespace Modules\Plans\Contracts\Queries;

use Modules\Plans\Contracts\DTOs\PlanSummaryData;

interface PlanLookupInterface
{
    public function findSummaryById(int $planId): ?PlanSummaryData;
}
