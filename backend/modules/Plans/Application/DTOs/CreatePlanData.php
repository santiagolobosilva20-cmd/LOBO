<?php

declare(strict_types=1);

namespace Modules\Plans\Application\DTOs;

final readonly class CreatePlanData
{
    /**
     * @param  list<string>  $features
     */
    public function __construct(
        public string $name,
        public int $priceCents,
        public int $durationDays,
        public ?string $tagline = null,
        public string $billingPeriodLabel = 'mes',
        public ?string $description = null,
        public array $features = [],
        public bool $isFeatured = false,
        public bool $isActive = true,
    ) {}
}
