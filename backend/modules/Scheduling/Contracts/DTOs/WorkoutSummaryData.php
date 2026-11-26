<?php

declare(strict_types=1);

namespace Modules\Scheduling\Contracts\DTOs;

final readonly class WorkoutSummaryData
{
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public string $category,
        public string $level,
        public int $defaultDurationMinutes,
        public string $badgeLabel,
        public ?string $imageUrl,
        public int $displayOrder,
        public ?string $description,
        public ?string $createdAt,
    ) {}
}
