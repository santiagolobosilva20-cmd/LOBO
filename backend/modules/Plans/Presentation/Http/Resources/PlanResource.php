<?php

declare(strict_types=1);

namespace Modules\Plans\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Plans\Contracts\DTOs\PlanSummaryData;

/**
 * @mixin PlanSummaryData
 */
final class PlanResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var PlanSummaryData $plan */
        $plan = $this->resource;

        return [
            'id' => $plan->id,
            'name' => $plan->name,
            'slug' => $plan->slug,
            'tagline' => $plan->tagline,
            'price_cents' => $plan->priceCents,
            'formatted_price' => $plan->formattedPrice,
            'duration_days' => $plan->durationDays,
            'billing_period_label' => $plan->billingPeriodLabel,
            'description' => $plan->description,
            'features' => $plan->features,
            'is_featured' => $plan->isFeatured,
            'is_active' => $plan->isActive,
            'created_at' => $plan->createdAt,
            'updated_at' => $plan->updatedAt,
        ];
    }
}
