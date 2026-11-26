<?php

declare(strict_types=1);

namespace Modules\Shared\Presentation\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Shared\Application\DTOs\PaginatedResult;

final class PaginatedJsonResponse
{
    /**
     * @template TItem
     *
     * @param  PaginatedResult<TItem>  $result
     * @param  class-string<JsonResource>  $resourceClass
     */
    public static function fromResult(
        PaginatedResult $result,
        string $resourceClass,
        Request $request,
    ): JsonResponse {
        return response()->json([
            'data' => $resourceClass::collection($result->items)->resolve($request),
            'meta' => [
                'current_page' => $result->currentPage,
                'per_page' => $result->perPage,
                'total' => $result->total,
                'last_page' => $result->lastPage,
            ],
        ]);
    }
}
