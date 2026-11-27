<?php

declare(strict_types=1);

namespace Modules\Shared\Presentation\Http\Requests;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Modules\Shared\Contracts\Auth\AuthenticatedActorData;

final class RequestActorResolver
{
    public static function requireActor(Request $request): AuthenticatedActorData
    {
        $actor = $request->attributes->get(AuthenticatedActorData::REQUEST_ATTRIBUTE);
        if (! $actor instanceof AuthenticatedActorData) {
            throw new AuthenticationException;
        }

        return $actor;
    }

    public static function requireMemberId(Request $request): int
    {
        $actor = self::requireActor($request);
        if ($actor->memberId === null) {
            throw new AuthorizationException('This account is not linked to a gym member profile.');
        }

        return $actor->memberId;
    }
}
