<?php

declare(strict_types=1);

namespace Modules\Shared\Domain\Exceptions;

final class ResourceNotFoundException extends DomainException
{
    public function __construct(string $resource, int|string $identifier)
    {
        parent::__construct(
            message: sprintf('%s with identifier [%s] was not found.', $resource, (string) $identifier),
            errorCode: 'resource_not_found',
            httpStatus: 404,
        );
    }
}
