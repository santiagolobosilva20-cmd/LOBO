<?php

declare(strict_types=1);

namespace Modules\Training\Application\DTOs;

use Modules\Shared\Application\DTOs\PaginationQuery;

final readonly class ListWorkoutLogsFilterData
{
    public function __construct(
        public PaginationQuery $pagination,
        public ?int $memberId = null,
        public ?string $category = null,
        public ?string $search = null,
    ) {}
}
