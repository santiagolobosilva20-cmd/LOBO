<?php

declare(strict_types=1);

namespace Modules\Auth\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Shared\Contracts\Auth\AuthenticatedActorData;

/**
 * @mixin AuthenticatedActorData
 */
final class AuthUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var AuthenticatedActorData $actor */
        $actor = $this->resource;

        return [
            'id' => $actor->id,
            'name' => $actor->name,
            'email' => $actor->email,
            'role' => $actor->role,
            'member_id' => $actor->memberId,
            'member_name' => $actor->memberName,
        ];
    }
}
