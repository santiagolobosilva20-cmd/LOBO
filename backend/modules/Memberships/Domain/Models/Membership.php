<?php

declare(strict_types=1);

namespace Modules\Memberships\Domain\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Modules\Memberships\Domain\Enums\MembershipStatus;

/**
 * @property int $id
 * @property int $member_id
 * @property int $plan_id
 * @property int|null $last_payment_id
 * @property string $member_name_snapshot
 * @property string $plan_name_snapshot
 * @property CarbonImmutable $starts_at
 * @property CarbonImmutable $ends_at
 * @property MembershipStatus $status
 * @property bool $auto_renew
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Table('memberships')]
#[Fillable([
    'member_id',
    'plan_id',
    'last_payment_id',
    'member_name_snapshot',
    'plan_name_snapshot',
    'starts_at',
    'ends_at',
    'status',
    'auto_renew',
    'notes',
])]
final class Membership extends Model
{
    public function effectiveStatus(?CarbonImmutable $today = null): MembershipStatus
    {
        $reference = ($today ?? CarbonImmutable::today())->startOfDay();
        $endDate = $this->ends_at->startOfDay();

        if ($this->status === MembershipStatus::Active && $endDate->lt($reference)) {
            return MembershipStatus::Expired;
        }

        return $this->status;
    }

    public function daysRemaining(?CarbonImmutable $today = null): int
    {
        $reference = ($today ?? CarbonImmutable::today())->startOfDay();
        $endDate = $this->ends_at->startOfDay();

        if ($endDate->lt($reference)) {
            return 0;
        }

        return (int) $reference->diffInDays($endDate);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'member_id' => 'integer',
            'plan_id' => 'integer',
            'last_payment_id' => 'integer',
            'starts_at' => 'immutable_date',
            'ends_at' => 'immutable_date',
            'status' => MembershipStatus::class,
            'auto_renew' => 'boolean',
        ];
    }
}
