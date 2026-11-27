<?php

declare(strict_types=1);

namespace Modules\Shared\Contracts\Auth;

final readonly class AuthenticatedActorData
{
    public const string REQUEST_ATTRIBUTE = 'lobo.auth.actor';

    public function __construct(
        public int $id,
        public string $name,
        public string $email,
        public string $role,
        public ?int $memberId,
        public ?string $memberName,
    ) {}

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isMember(): bool
    {
        return $this->role === 'member';
    }
}
