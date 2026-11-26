<?php

declare(strict_types=1);

namespace Modules\Shared\Application\DTOs;

final readonly class PaginationQuery
{
    public int $page;

    public int $perPage;

    public function __construct(int $page = 1, int $perPage = 15)
    {
        $this->page = max(1, $page);
        $this->perPage = max(1, min(100, $perPage));
    }

    public function withPerPage(int $perPage): self
    {
        return clone ($this, [
            'perPage' => max(1, min(100, $perPage)),
        ]);
    }
}
