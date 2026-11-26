<?php

declare(strict_types=1);

namespace Modules\Shared\Presentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Shared\Application\Services\DatabaseHealthService;

final readonly class HealthCheckController
{
    public function __construct(
        private DatabaseHealthService $healthService,
    ) {}

    public function __invoke(): JsonResponse
    {
        $health = $this->healthService->check();

        return response()->json([
            'data' => [
                'status' => $health->status,
                'database' => $health->database,
                'timestamp' => now()->toIso8601String(),
            ],
        ], $health->httpStatus);
    }
}
