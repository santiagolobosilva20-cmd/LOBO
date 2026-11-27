<?php

declare(strict_types=1);

namespace Modules\Training\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $routine_id
 * @property string $day_label
 * @property string $exercise_name
 * @property int $sets
 * @property string $reps
 * @property string|null $target_weight
 * @property int $rest_seconds
 * @property int $sort_order
 */
#[Table('routine_exercises')]
#[Fillable([
    'routine_id',
    'day_label',
    'exercise_name',
    'sets',
    'reps',
    'target_weight',
    'rest_seconds',
    'sort_order',
])]
final class RoutineExercise extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'routine_id' => 'integer',
            'sets' => 'integer',
            'rest_seconds' => 'integer',
            'sort_order' => 'integer',
        ];
    }
}
