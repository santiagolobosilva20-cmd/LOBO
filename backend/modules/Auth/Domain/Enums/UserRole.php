<?php

declare(strict_types=1);

namespace Modules\Auth\Domain\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Member = 'member';
}
