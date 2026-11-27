<?php

declare(strict_types=1);

namespace Modules\Billing\Application\DTOs;

use Carbon\CarbonImmutable;
use Modules\Billing\Domain\Enums\PaymentMethod;
use Modules\Billing\Domain\Enums\PaymentStatus;
use Modules\Shared\Application\DTOs\PaginationQuery;

final readonly class ListPaymentsFilterData
{
    public function __construct(
        public PaginationQuery $pagination,
        public ?string $search = null,
        public ?PaymentMethod $method = null,
        public ?CarbonImmutable $month = null,
        public ?int $memberId = null,
        public ?PaymentStatus $status = null,
    ) {}
}
