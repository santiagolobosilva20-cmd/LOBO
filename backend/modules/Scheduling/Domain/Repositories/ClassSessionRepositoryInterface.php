<?php

declare(strict_types=1);

namespace Modules\Scheduling\Domain\Repositories;

use Carbon\CarbonImmutable;
use Modules\Scheduling\Domain\Enums\SessionStatus;
use Modules\Scheduling\Domain\Models\ClassBooking;
use Modules\Scheduling\Domain\Models\ClassSession;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

interface ClassSessionRepositoryInterface
{
    /**
     * @return PaginatedResult<ClassSession>
     */
    public function paginate(
        PaginationQuery $query,
        ?CarbonImmutable $date = null,
        ?SessionStatus $status = null,
    ): PaginatedResult;

    /**
     * @return list<ClassSession>
     */
    public function featuredForDate(CarbonImmutable $date, int $limit = 4): array;

    public function nextUpcoming(CarbonImmutable $from): ?ClassSession;

    public function findById(int $id): ?ClassSession;

    public function findByIdForUpdate(int $id): ?ClassSession;

    public function findBooking(int $sessionId, int $memberId): ?ClassBooking;

    public function saveBooking(ClassBooking $booking): ClassBooking;

    /**
     * @return list<int>
     */
    public function listBookedSessionIdsForMember(int $memberId): array;

    public function save(ClassSession $session): ClassSession;

    public function delete(ClassSession $session): void;
}
