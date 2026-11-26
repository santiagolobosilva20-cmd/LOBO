<?php

declare(strict_types=1);

namespace Modules\Members\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Members\Contracts\DTOs\MemberSummaryData;

/**
 * @mixin MemberSummaryData
 */
final class MemberResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var MemberSummaryData $member */
        $member = $this->resource;

        return [
            'id' => $member->id,
            'full_name' => $member->fullName,
            'email' => $member->email,
            'phone' => $member->phone,
            'document_number' => $member->documentNumber,
            'status' => $member->status,
            'joined_at' => $member->joinedAt,
            'created_at' => $member->createdAt,
            'updated_at' => $member->updatedAt,
        ];
    }
}
