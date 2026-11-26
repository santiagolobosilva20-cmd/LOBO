<?php

declare(strict_types=1);

namespace Modules\Billing\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Modules\Billing\Domain\Enums\PaymentMethod;

/**
 * @property int $id
 * @property int $member_id
 * @property string $member_name_snapshot
 * @property int $plan_id
 * @property string $plan_name_snapshot
 * @property int $amount_cents
 * @property PaymentMethod $payment_method
 * @property Carbon $paid_at
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Table('payments')]
#[Fillable([
    'member_id',
    'member_name_snapshot',
    'plan_id',
    'plan_name_snapshot',
    'amount_cents',
    'payment_method',
    'paid_at',
    'notes',
])]
final class Payment extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'member_id' => 'integer',
            'plan_id' => 'integer',
            'amount_cents' => 'integer',
            'payment_method' => PaymentMethod::class,
            'paid_at' => 'date',
        ];
    }
}
