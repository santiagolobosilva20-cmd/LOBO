<?php

declare(strict_types=1);

namespace Modules\Shared\Application\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\Shared\Application\DTOs\HealthStatusData;
use Throwable;

final readonly class DatabaseHealthService
{
    #[\NoDiscard]
    public function check(): HealthStatusData
    {
        try {
            DB::select('SELECT 1');

            return new HealthStatusData(
                status: 'ok',
                database: 'connected',
                httpStatus: 200,
            );
        } catch (Throwable $exception) {
            Log::warning('Health check database probe failed.', [
                'exception' => $exception::class,
            ]);

            return new HealthStatusData(
                status: 'degraded',
                database: 'disconnected',
                httpStatus: 503,
            );
        }
    }
}
