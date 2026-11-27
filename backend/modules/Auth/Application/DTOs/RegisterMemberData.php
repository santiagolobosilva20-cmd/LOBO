<?php

declare(strict_types=1);

namespace Modules\Auth\Application\DTOs;

final readonly class RegisterMemberData
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public string $deviceName = 'web',
    ) {}
}
