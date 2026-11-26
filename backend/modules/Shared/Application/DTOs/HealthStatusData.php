<?php

declare(strict_types=1);

namespace Modules\Shared\Application\DTOs;

final readonly class HealthStatusData
{
    public function __construct(
        public string $status,
        public string $database,
        public int $httpStatus,
    ) {}
}
