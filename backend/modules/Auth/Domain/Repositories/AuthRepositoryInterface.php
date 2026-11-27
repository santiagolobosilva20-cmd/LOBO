<?php

declare(strict_types=1);

namespace Modules\Auth\Domain\Repositories;

use Modules\Auth\Domain\Models\AccountUser;
use Modules\Auth\Domain\Models\ApiToken;

interface AuthRepositoryInterface
{
    public function findUserByEmail(string $email): ?AccountUser;

    public function saveUser(AccountUser $user): AccountUser;

    public function createToken(ApiToken $token): ApiToken;

    public function findActiveTokenByHash(string $tokenHash): ?ApiToken;

    public function touchToken(ApiToken $token): void;

    public function deleteTokenByHash(string $tokenHash): void;
}
