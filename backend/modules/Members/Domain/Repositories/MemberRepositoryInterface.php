<?php

declare(strict_types=1);

namespace Modules\Members\Domain\Repositories;

use Modules\Members\Domain\Enums\MemberStatus;
use Modules\Members\Domain\Models\Member;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

interface MemberRepositoryInterface
{
    /**
     * @return PaginatedResult<Member>
     */
    public function paginate(
        PaginationQuery $query,
        ?string $search = null,
        ?MemberStatus $status = null,
    ): PaginatedResult;

    public function findById(int $id): ?Member;

    public function findByNormalizedName(string $fullName): ?Member;

    public function existsByEmail(string $email, ?int $excludeId = null): bool;

    public function countActive(): int;

    public function save(Member $member): Member;

    public function delete(Member $member): void;
}
