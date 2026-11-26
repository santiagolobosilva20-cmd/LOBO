<?php

declare(strict_types=1);

namespace Modules\Billing\Domain\Repositories;

use Carbon\CarbonImmutable;
use Modules\Billing\Domain\Enums\PaymentMethod;
use Modules\Billing\Domain\Models\Payment;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

interface PaymentRepositoryInterface
{
    /**
     * @return PaginatedResult<Payment>
     */
    public function paginate(
        PaginationQuery $query,
        ?string $search = null,
        ?PaymentMethod $method = null,
        ?CarbonImmutable $month = null,
    ): PaginatedResult;

    /**
     * @return list<Payment>
     */
    public function recent(int $limit = 8): array;

    /**
     * @return array{revenue_cents: int, count: int}
     */
    public function getMonthlyAggregate(CarbonImmutable $month): array;

    /**
     * @return array{revenue_cents: int, distinct_members: int, count: int}
     */
    public function getAllTimeAggregate(): array;

    public function findById(int $id): ?Payment;

    public function save(Payment $payment): Payment;

    public function delete(Payment $payment): void;
}
