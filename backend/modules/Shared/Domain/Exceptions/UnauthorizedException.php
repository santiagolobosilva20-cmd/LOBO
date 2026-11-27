<?php

declare(strict_types=1);

namespace Modules\Shared\Domain\Exceptions;

final class UnauthorizedException extends DomainException
{
    public function __construct(
        string $message = 'Las credenciales ingresadas no son válidas.',
        string $errorCode = 'invalid_credentials',
    ) {
        parent::__construct(
            message: $message,
            errorCode: $errorCode,
            httpStatus: 401,
        );
    }
}
