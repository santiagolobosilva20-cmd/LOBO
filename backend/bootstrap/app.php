<?php

declare(strict_types=1);

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Modules\Shared\Domain\Exceptions\DomainException;
use Modules\Shared\Presentation\Http\Responses\ApiErrorResponse;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            static fn (Request $request): bool => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(static function (DomainException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return ApiErrorResponse::make(
                code: $exception->errorCode,
                message: $exception->getMessage(),
                status: $exception->httpStatus,
                errors: $exception->errors,
            );
        });

        $exceptions->render(static function (ValidationException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return ApiErrorResponse::make(
                code: 'validation_failed',
                message: $exception->getMessage(),
                status: $exception->status,
                errors: $exception->errors(),
            );
        });

        $exceptions->render(static function (AuthenticationException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return ApiErrorResponse::make(
                code: 'unauthenticated',
                message: 'Authentication is required to access this resource.',
                status: 401,
            );
        });

        $exceptions->render(static function (AuthorizationException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return ApiErrorResponse::make(
                code: 'forbidden',
                message: 'You do not have permission to perform this action.',
                status: 403,
            );
        });

        $exceptions->render(static function (ModelNotFoundException|NotFoundHttpException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return ApiErrorResponse::make(
                code: 'not_found',
                message: 'The requested endpoint or resource was not found.',
                status: 404,
            );
        });

        $exceptions->render(static function (HttpExceptionInterface $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return ApiErrorResponse::make(
                code: 'http_error',
                message: $exception->getMessage() !== '' ? $exception->getMessage() : 'HTTP request failed.',
                status: $exception->getStatusCode(),
            );
        });

        $exceptions->render(static function (Throwable $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            Log::error('Unhandled API exception.', [
                'exception' => $exception::class,
                'path' => $request->path(),
            ]);

            return ApiErrorResponse::make(
                code: 'internal_server_error',
                message: 'An unexpected error occurred.',
                status: 500,
            );
        });
    })->create();
