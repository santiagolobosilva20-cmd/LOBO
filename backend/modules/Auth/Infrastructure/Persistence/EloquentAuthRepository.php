<?php

declare(strict_types=1);

namespace Modules\Auth\Infrastructure\Persistence;

use Modules\Auth\Domain\Models\AccountUser;
use Modules\Auth\Domain\Models\ApiToken;
use Modules\Auth\Domain\Repositories\AuthRepositoryInterface;

final class EloquentAuthRepository implements AuthRepositoryInterface
{
    public function findUserByEmail(string $email): ?AccountUser
    {
        return AccountUser::query()
            ->whereRaw('LOWER(email) = ?', [mb_strtolower(trim($email))])
            ->first();
    }

    public function saveUser(AccountUser $user): AccountUser
    {
        $user->save();

        return $user->refresh();
    }

    public function createToken(ApiToken $token): ApiToken
    {
        $token->save();

        return $token->refresh();
    }

    public function findActiveTokenByHash(string $tokenHash): ?ApiToken
    {
        return ApiToken::query()
            ->with('user')
            ->where('token_hash', $tokenHash)
            ->where(static function ($query): void {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();
    }

    public function touchToken(ApiToken $token): void
    {
        $token->last_used_at = now();
        $token->save();
    }

    public function deleteTokenByHash(string $tokenHash): void
    {
        ApiToken::query()->where('token_hash', $tokenHash)->delete();
    }
}
