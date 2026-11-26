<?php

declare(strict_types=1);

namespace Modules\Scheduling\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Modules\Scheduling\Domain\Enums\WorkoutLevel;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $category
 * @property WorkoutLevel $level
 * @property int $default_duration_minutes
 * @property string $badge_label
 * @property string|null $image_url
 * @property int $display_order
 * @property string|null $description
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Table('workouts')]
#[Fillable([
    'name',
    'slug',
    'category',
    'level',
    'default_duration_minutes',
    'badge_label',
    'image_url',
    'display_order',
    'description',
])]
final class Workout extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'level' => WorkoutLevel::class,
            'default_duration_minutes' => 'integer',
            'display_order' => 'integer',
        ];
    }
}
