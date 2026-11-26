<?php

declare(strict_types=1);

namespace Modules\Scheduling\Contracts\Queries;

use Modules\Scheduling\Contracts\DTOs\ClassSessionSummaryData;

interface ScheduleSummaryQueryInterface
{
    public function getNextUpcoming(): ?ClassSessionSummaryData;

    /**
     * @return list<ClassSessionSummaryData>
     */
    public function getFeaturedToday(int $limit = 4): array;
}
