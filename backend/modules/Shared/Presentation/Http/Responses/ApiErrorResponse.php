<?php

declare(strict_types=1);

namespace Modules\Shared\Presentation\Http\Responses;

use Illuminate\Http\JsonResponse;

final class ApiErrorResponse
{
    /**
     * @param  array<string, mixed>  $errors
     */
    public static function make(
        string $code,
        string $message,
        int $status,
        array $errors = [],
    ): JsonResponse {
        $payload = [
            'error' => [
                'code' => $code,
                'message' => $message,
                'errors' => $errors,
                'timestamp' => now()->toIso8601String(),
            ],
        ];

        return response()->json($payload, $status);
    }
}
