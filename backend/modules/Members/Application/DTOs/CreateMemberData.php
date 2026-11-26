<?php

declare(strict_types=1);

namespace Modules\Members\Application\DTOs;

use Modules\Members\Domain\Enums\MemberStatus;

final readonly class CreateMemberData
{
    public function __construct(
        public string $fullName,
        public ?string $email = null,
        public ?string $phone = null,
        public ?string $documentNumber = null,
        public MemberStatus $status = MemberStatus::Active,
        public ?string $joinedAt = null,
    ) {}
}
