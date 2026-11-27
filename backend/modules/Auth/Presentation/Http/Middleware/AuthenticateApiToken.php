<?php

declare(strict_types=1);

namespace Modules\Auth\Presentation\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Modules\Auth\Application\Services\AuthService;
use Modules\Shared\Contracts\Auth\AuthenticatedActorData;
use Symfony\Component\HttpFoundation\Response;

final readonly class AuthenticateApiToken
{
    public function __construct(
        private AuthService $authService,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        if ($token === null || trim($token) === '') {
            throw new AuthenticationException;
        }

        $actor = $this->authService->authenticateToken($token);
        if ($actor === null) {
            throw new AuthenticationException;
        }

        $request->attributes->set(AuthenticatedActorData::REQUEST_ATTRIBUTE, $actor);

        return $next($request);
    }
}
