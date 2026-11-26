<?php

declare(strict_types=1);

namespace Modules\Members\Application\DTOs;

use Modules\Members\Domain\Enums\MemberStatus;

final readonly class UpdateMemberData
{
    public function __construct(
        public ?string $fullName = null,
        public ?string $email = null,
        public ?string $phone = null,
        public bool $hasPhone = false,
        public ?string $documentNumber = null,
        public bool $hasDocumentNumber = false,
        public ?MemberStatus $status = null,
    ) {}
}
