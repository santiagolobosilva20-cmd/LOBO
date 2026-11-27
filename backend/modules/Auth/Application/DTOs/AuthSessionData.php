<?php

declare(strict_types=1);

namespace Modules\Auth\Application\DTOs;

use Modules\Shared\Contracts\Auth\AuthenticatedActorData;

final readonly class AuthSessionData
{
    public function __construct(
        public string $token,
        public AuthenticatedActorData $user,
    ) {}
}
