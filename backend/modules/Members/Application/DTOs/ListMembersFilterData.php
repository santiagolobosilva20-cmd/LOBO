<?php

declare(strict_types=1);

namespace Modules\Members\Application\DTOs;

use Modules\Members\Domain\Enums\MemberStatus;
use Modules\Shared\Application\DTOs\PaginationQuery;

final readonly class ListMembersFilterData
{
    public function __construct(
        public PaginationQuery $pagination,
        public ?string $search = null,
        public ?MemberStatus $status = null,
    ) {}
}
