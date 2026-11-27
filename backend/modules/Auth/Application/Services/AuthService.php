<?php

declare(strict_types=1);

namespace Modules\Auth\Application\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Auth\Application\DTOs\AuthSessionData;
use Modules\Auth\Application\DTOs\LoginData;
use Modules\Auth\Application\DTOs\RegisterMemberData;
use Modules\Auth\Domain\Enums\UserRole;
use Modules\Auth\Domain\Models\AccountUser;
use Modules\Auth\Domain\Models\ApiToken;
use Modules\Auth\Domain\Repositories\AuthRepositoryInterface;
use Modules\Members\Contracts\Queries\MemberLookupInterface;
use Modules\Shared\Contracts\Auth\AuthenticatedActorData;
use Modules\Shared\Domain\Exceptions\ConflictException;
use Modules\Shared\Domain\Exceptions\UnauthorizedException;

final readonly class AuthService
{
    public function __construct(
        private AuthRepositoryInterface $authRepository,
        private MemberLookupInterface $memberLookup,
    ) {}

    #[\NoDiscard]
    public function registerMember(RegisterMemberData $data): AuthSessionData
    {
        $email = mb_strtolower(trim($data->email));
        $name = trim((string) preg_replace('/\s+/', ' ', $data->name));

        return DB::transaction(function () use ($email, $name, $data): AuthSessionData {
            if ($this->authRepository->findUserByEmail($email) !== null) {
                throw new ConflictException(
                    message: 'Ya existe una cuenta registrada con este correo.',
                    errors: ['email' => ['Ya existe una cuenta registrada con este correo.']],
                );
            }

            $member = $this->memberLookup->findOrCreateByEmailAndName($email, $name);

            $user = $this->authRepository->saveUser(new AccountUser([
                'name' => $member->fullName,
                'email' => $email,
                'role' => UserRole::Member,
                'member_id' => $member->id,
                'password' => $data->password,
            ]));

            return $this->issueSession($user, $data->deviceName);
        });
    }

    #[\NoDiscard]
    public function login(LoginData $data): AuthSessionData
    {
        $user = $this->authRepository->findUserByEmail($data->email);
        if ($user === null || ! Hash::check($data->password, $user->password)) {
            throw new UnauthorizedException('El correo o la contraseña no son correctos.');
        }

        return DB::transaction(fn (): AuthSessionData => $this->issueSession($user, $data->deviceName));
    }

    #[\NoDiscard]
    public function demoLogin(UserRole $role, string $deviceName = 'web-demo'): AuthSessionData
    {
        if (! app()->environment(['local', 'testing']) || ! (bool) config('auth_lobo.demo_login_enabled', false)) {
            throw new UnauthorizedException('El acceso rápido demo está deshabilitado.', 'demo_login_disabled');
        }

        $email = $role === UserRole::Admin
            ? (string) config('auth_lobo.demo_admin_email', 'admin@loboclub.com')
            : (string) config('auth_lobo.demo_member_email', 'alex.rivera@loboclub.com');

        $user = $this->authRepository->findUserByEmail($email);
        if ($user === null || $user->role !== $role) {
            throw new UnauthorizedException('La cuenta demo solicitada no está disponible.');
        }

        return DB::transaction(fn (): AuthSessionData => $this->issueSession($user, $deviceName));
    }

    public function authenticateToken(string $plainToken): ?AuthenticatedActorData
    {
        $trimmed = trim($plainToken);
        if ($trimmed === '') {
            return null;
        }

        $tokenHash = hash('sha256', $trimmed);
        $token = $this->authRepository->findActiveTokenByHash($tokenHash);
        if ($token === null) {
            return null;
        }

        if ($token->last_used_at === null || $token->last_used_at->lt(now()->subMinutes(5))) {
            $this->authRepository->touchToken($token);
        }

        return $this->toActor($token->user);
    }

    public function logout(string $plainToken): void
    {
        $trimmed = trim($plainToken);
        if ($trimmed !== '') {
            $this->authRepository->deleteTokenByHash(hash('sha256', $trimmed));
        }
    }

    #[\NoDiscard]
    public function issueTokenForUser(AccountUser $user, string $deviceName = 'web'): string
    {
        return $this->issueSession($user, $deviceName)->token;
    }

    private function issueSession(AccountUser $user, string $deviceName): AuthSessionData
    {
        $plainToken = Str::random(64);

        $this->authRepository->createToken(new ApiToken([
            'user_id' => $user->id,
            'name' => trim($deviceName) !== '' ? trim($deviceName) : 'web',
            'token_hash' => hash('sha256', $plainToken),
            'last_used_at' => now(),
            'expires_at' => now()->addDays(7),
        ]));

        return new AuthSessionData(
            token: $plainToken,
            user: $this->toActor($user),
        );
    }

    private function toActor(AccountUser $user): AuthenticatedActorData
    {
        $memberName = null;
        if ($user->member_id !== null) {
            $member = $this->memberLookup->findSummaryById($user->member_id);
            $memberName = $member?->fullName;
        }

        return new AuthenticatedActorData(
            id: $user->id,
            name: $user->name,
            email: $user->email,
            role: $user->role->value,
            memberId: $user->member_id,
            memberName: $memberName ?? ($user->role === UserRole::Member ? $user->name : null),
        );
    }
}
