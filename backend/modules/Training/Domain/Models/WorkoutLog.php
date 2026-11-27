<?php

declare(strict_types=1);

namespace Modules\Training\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $member_id
 * @property string $member_name_snapshot
 * @property int|null $workout_id
 * @property int|null $routine_id
 * @property string $title
 * @property string $category
 * @property Carbon $performed_at
 * @property int $duration_minutes
 * @property int $effort_rpe
 * @property int|null $calories_estimate
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Table('workout_logs')]
#[Fillable([
    'member_id',
    'member_name_snapshot',
    'workout_id',
    'routine_id',
    'title',
    'category',
    'performed_at',
    'duration_minutes',
    'effort_rpe',
    'calories_estimate',
    'notes',
])]
final class WorkoutLog extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'member_id' => 'integer',
            'workout_id' => 'integer',
            'routine_id' => 'integer',
            'performed_at' => 'date',
            'duration_minutes' => 'integer',
            'effort_rpe' => 'integer',
            'calories_estimate' => 'integer',
        ];
    }
}
