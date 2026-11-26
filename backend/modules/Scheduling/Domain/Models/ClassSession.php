<?php

declare(strict_types=1);

namespace Modules\Scheduling\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Modules\Scheduling\Domain\Enums\SessionStatus;

/**
 * @property int $id
 * @property int $workout_id
 * @property int $day_of_week
 * @property string $room
 * @property string $instructor_name
 * @property Carbon $starts_at
 * @property int $duration_minutes
 * @property int $capacity
 * @property int $enrolled_count
 * @property string $accent_color
 * @property SessionStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Workout|null $workout
 */
#[Table('class_sessions')]
#[Fillable([
    'workout_id',
    'day_of_week',
    'room',
    'instructor_name',
    'starts_at',
    'duration_minutes',
    'capacity',
    'enrolled_count',
    'accent_color',
    'status',
])]
final class ClassSession extends Model
{
    /**
     * @return BelongsTo<Workout, $this>
     */
    public function workout(): BelongsTo
    {
        return $this->belongsTo(Workout::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'workout_id' => 'integer',
            'day_of_week' => 'integer',
            'starts_at' => 'datetime',
            'duration_minutes' => 'integer',
            'capacity' => 'integer',
            'enrolled_count' => 'integer',
            'status' => SessionStatus::class,
        ];
    }
}
