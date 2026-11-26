<?php

declare(strict_types=1);

namespace Modules\Scheduling\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Scheduling\Contracts\DTOs\WorkoutSummaryData;

/**
 * @mixin WorkoutSummaryData
 */
final class WorkoutResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var WorkoutSummaryData $workout */
        $workout = $this->resource;

        return [
            'id' => $workout->id,
            'name' => $workout->name,
            'slug' => $workout->slug,
            'category' => $workout->category,
            'level' => $workout->level,
            'default_duration_minutes' => $workout->defaultDurationMinutes,
            'badge_label' => $workout->badgeLabel,
            'image_url' => $workout->imageUrl,
            'display_order' => $workout->displayOrder,
            'description' => $workout->description,
            'created_at' => $workout->createdAt,
        ];
    }
}
