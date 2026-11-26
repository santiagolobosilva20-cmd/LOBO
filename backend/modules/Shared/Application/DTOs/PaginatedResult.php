<?php

declare(strict_types=1);

namespace Modules\Shared\Application\DTOs;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * @template TItem
 */
final readonly class PaginatedResult
{
    /**
     * @param  list<TItem>  $items
     */
    public function __construct(
        public array $items,
        public int $currentPage,
        public int $perPage,
        public int $total,
        public int $lastPage,
    ) {}

    /**
     * @template TModel
     *
     * @param  LengthAwarePaginator<int, TModel>  $paginator
     * @param  callable(TModel): TItem  $mapper
     * @return self<TItem>
     */
    public static function fromPaginator(LengthAwarePaginator $paginator, callable $mapper): self
    {
        $mapped = [];
        foreach ($paginator->items() as $item) {
            $mapped[] = $mapper($item);
        }

        return new self(
            items: $mapped,
            currentPage: $paginator->currentPage(),
            perPage: $paginator->perPage(),
            total: $paginator->total(),
            lastPage: max(1, $paginator->lastPage()),
        );
    }
}
