<?php

declare(strict_types=1);

namespace Modules\Plans\Application\DTOs;

use Modules\Shared\Application\DTOs\PaginationQuery;

final readonly class ListPlansFilterData
{
    public function __construct(
        public PaginationQuery $pagination,
        public ?bool $activeOnly = null,
    ) {}
}
