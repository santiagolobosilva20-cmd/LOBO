<?php

declare(strict_types=1);

namespace Modules\Memberships\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Memberships\Contracts\DTOs\MembershipSummaryData;

/**
 * @mixin MembershipSummaryData
 */
final class MembershipResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var MembershipSummaryData $membership */
        $membership = $this->resource;

        return [
            'id' => $membership->id,
            'member_id' => $membership->memberId,
            'member_name' => $membership->memberName,
            'plan_id' => $membership->planId,
            'plan_name' => $membership->planName,
            'last_payment_id' => $membership->lastPaymentId,
            'starts_at' => $membership->startsAt,
            'ends_at' => $membership->endsAt,
            'days_remaining' => $membership->daysRemaining,
            'is_expiring_soon' => $membership->isExpiringSoon,
            'status' => $membership->status,
            'auto_renew' => $membership->autoRenew,
            'notes' => $membership->notes,
            'created_at' => $membership->createdAt,
        ];
    }
}
