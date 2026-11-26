<?php

declare(strict_types=1);

namespace Modules\Shared\Domain\Exceptions;

final class ConflictException extends DomainException
{
    /**
     * @param  array<string, mixed>  $errors
     */
    public function __construct(string $message, array $errors = [])
    {
        parent::__construct(
            message: $message,
            errorCode: 'resource_conflict',
            httpStatus: 409,
            errors: $errors,
        );
    }
}
