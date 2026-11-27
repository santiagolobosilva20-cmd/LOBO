<?php

declare(strict_types=1);

namespace Modules\Auth\Presentation\Http\Middleware;

use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Modules\Shared\Contracts\Auth\AuthenticatedActorData;
use Symfony\Component\HttpFoundation\Response;

final readonly class RequireApiRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $actor = $request->attributes->get(AuthenticatedActorData::REQUEST_ATTRIBUTE);
        if (! $actor instanceof AuthenticatedActorData) {
            throw new AuthenticationException;
        }

        if ($roles !== [] && ! in_array($actor->role, $roles, true)) {
            throw new AuthorizationException('You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
