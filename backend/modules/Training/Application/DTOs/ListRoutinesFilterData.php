<?php

declare(strict_types=1);

namespace Modules\Training\Application\DTOs;

use Modules\Shared\Application\DTOs\PaginationQuery;

final readonly class ListRoutinesFilterData
{
    public function __construct(
        public PaginationQuery $pagination,
        public ?string $goal = null,
        public ?bool $isTemplate = null,
        public ?int $memberId = null,
        public ?string $search = null,
        public bool $includeTemplates = false,
    ) {}
}
