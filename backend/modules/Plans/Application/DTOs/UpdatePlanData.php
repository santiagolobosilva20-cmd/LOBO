<?php

declare(strict_types=1);

namespace Modules\Plans\Application\DTOs;

final readonly class UpdatePlanData
{
    public function __construct(
        public ?string $name = null,
        public ?int $priceCents = null,
        public ?int $durationDays = null,
        public ?string $description = null,
        public bool $hasDescription = false,
        public ?bool $isActive = null,
    ) {}
}
