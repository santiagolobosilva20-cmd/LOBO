<?php

declare(strict_types=1);

namespace Modules\Nutrition\Application\DTOs;

use Modules\Shared\Application\DTOs\PaginationQuery;

final readonly class ListNutritionPlansFilterData
{
    public function __construct(
        public PaginationQuery $pagination,
        public ?string $goal = null,
        public ?bool $isTemplate = null,
        public ?int $memberId = null,
        public ?string $search = null,
    ) {}
}
