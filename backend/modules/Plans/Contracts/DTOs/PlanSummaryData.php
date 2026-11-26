<?php

declare(strict_types=1);

namespace Modules\Plans\Contracts\DTOs;

final readonly class PlanSummaryData
{
    /**
     * @param  list<string>  $features
     */
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public ?string $tagline,
        public int $priceCents,
        public string $formattedPrice,
        public int $durationDays,
        public string $billingPeriodLabel,
        public ?string $description,
        public array $features,
        public bool $isFeatured,
        public bool $isActive,
        public ?string $createdAt,
        public ?string $updatedAt,
    ) {}
}
