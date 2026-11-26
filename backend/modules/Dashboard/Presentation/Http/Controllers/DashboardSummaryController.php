<?php

declare(strict_types=1);

namespace Modules\Dashboard\Presentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Dashboard\Application\Services\GetDashboardSummaryService;
use Modules\Dashboard\Presentation\Http\Resources\DashboardSummaryResource;

final readonly class DashboardSummaryController
{
    public function __construct(
        private GetDashboardSummaryService $summaryService,
    ) {}

    public function __invoke(): JsonResponse
    {
        $summary = $this->summaryService->execute();

        return (new DashboardSummaryResource($summary))->response();
    }
}
