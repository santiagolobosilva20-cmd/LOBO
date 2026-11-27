<?php

declare(strict_types=1);

namespace Modules\Auth\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Carbon;
use Modules\Auth\Domain\Enums\UserRole;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property UserRole $role
 * @property int|null $member_id
 * @property string $password
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Table('users')]
#[Fillable([
    'name',
    'email',
    'role',
    'member_id',
    'password',
])]
#[Hidden([
    'password',
    'remember_token',
])]
final class AccountUser extends Authenticatable
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'member_id' => 'integer',
            'password' => 'hashed',
            'email_verified_at' => 'datetime',
        ];
    }
}
