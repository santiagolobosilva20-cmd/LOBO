<?php

declare(strict_types=1);

namespace Modules\Scheduling\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $class_session_id
 * @property int $member_id
 * @property string $member_name_snapshot
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Table('class_bookings')]
#[Fillable([
    'class_session_id',
    'member_id',
    'member_name_snapshot',
    'status',
])]
final class ClassBooking extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'class_session_id' => 'integer',
            'member_id' => 'integer',
        ];
    }
}
