<?php

declare(strict_types=1);

namespace Modules\Memberships\Application\DTOs;

use Modules\Shared\Application\DTOs\PaginationQuery;

final readonly class ListMembershipsFilterData
{
    public function __construct(
        public PaginationQuery $pagination,
        public ?string $search = null,
        public ?string $status = null,
        public ?int $memberId = null,
    ) {}
}
