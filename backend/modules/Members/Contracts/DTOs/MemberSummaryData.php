<?php

declare(strict_types=1);

namespace Modules\Members\Contracts\DTOs;

final readonly class MemberSummaryData
{
    public function __construct(
        public int $id,
        public string $fullName,
        public ?string $email,
        public ?string $phone,
        public ?string $documentNumber,
        public string $status,
        public string $joinedAt,
        public ?string $createdAt,
        public ?string $updatedAt,
    ) {}
}
