<?php

declare(strict_types=1);

namespace Modules\Memberships\Domain\Repositories;

use Carbon\CarbonImmutable;
use Modules\Memberships\Domain\Models\Membership;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

interface MembershipRepositoryInterface
{
    /**
     * @return PaginatedResult<Membership>
     */
    public function paginate(
        PaginationQuery $query,
        ?string $search = null,
        ?string $statusFilter = null,
        ?int $memberId = null,
    ): PaginatedResult;

    public function findById(int $id): ?Membership;

    public function findLatestByMemberId(int $memberId): ?Membership;

    public function findActiveByMemberId(int $memberId, CarbonImmutable $today): ?Membership;

    /**
     * @return array{active: int, expiring_soon: int, paused: int, expired: int}
     */
    public function getStatusBreakdown(CarbonImmutable $today): array;

    public function save(Membership $membership): Membership;
}
