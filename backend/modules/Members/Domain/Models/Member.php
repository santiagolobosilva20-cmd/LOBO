<?php

declare(strict_types=1);

namespace Modules\Members\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Modules\Members\Domain\Enums\MemberStatus;

/**
 * @property int $id
 * @property string $full_name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $document_number
 * @property MemberStatus $status
 * @property Carbon $joined_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Table('members')]
#[Fillable(['full_name', 'email', 'phone', 'document_number', 'status', 'joined_at'])]
final class Member extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => MemberStatus::class,
            'joined_at' => 'date',
        ];
    }
}
