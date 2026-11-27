<?php

declare(strict_types=1);

namespace Modules\Training\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Modules\Training\Domain\Enums\RoutineGoal;

/**
 * @property int $id
 * @property int|null $member_id
 * @property string|null $member_name_snapshot
 * @property string $title
 * @property RoutineGoal $goal
 * @property string $level
 * @property int $days_per_week
 * @property int $estimated_minutes
 * @property bool $is_template
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, RoutineExercise> $exercises
 */
#[Table('routines')]
#[Fillable([
    'member_id',
    'member_name_snapshot',
    'title',
    'goal',
    'level',
    'days_per_week',
    'estimated_minutes',
    'is_template',
    'notes',
])]
final class Routine extends Model
{
    /**
     * @return HasMany<RoutineExercise, $this>
     */
    public function exercises(): HasMany
    {
        return $this->hasMany(RoutineExercise::class, 'routine_id')
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'member_id' => 'integer',
            'goal' => RoutineGoal::class,
            'days_per_week' => 'integer',
            'estimated_minutes' => 'integer',
            'is_template' => 'boolean',
        ];
    }
}
