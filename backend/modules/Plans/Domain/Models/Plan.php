<?php

declare(strict_types=1);

namespace Modules\Plans\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $tagline
 * @property int $price_cents
 * @property int $duration_days
 * @property string $billing_period_label
 * @property string|null $description
 * @property array<int, string>|null $features
 * @property bool $is_featured
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Table('plans')]
#[Fillable([
    'name',
    'slug',
    'tagline',
    'price_cents',
    'duration_days',
    'billing_period_label',
    'description',
    'features',
    'is_featured',
    'is_active',
])]
final class Plan extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_cents' => 'integer',
            'duration_days' => 'integer',
            'features' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
