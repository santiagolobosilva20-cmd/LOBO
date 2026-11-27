<?php

declare(strict_types=1);

namespace Modules\Auth\Presentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Modules\Auth\Application\Services\AuthService;
use Modules\Auth\Domain\Enums\UserRole;
use Modules\Auth\Presentation\Http\Requests\LoginRequest;
use Modules\Auth\Presentation\Http\Requests\RegisterRequest;
use Modules\Auth\Presentation\Http\Resources\AuthUserResource;
use Modules\Shared\Presentation\Http\Requests\RequestActorResolver;

final readonly class AuthController
{
    public function __construct(
        private AuthService $authService,
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $session = $this->authService->login($request->toDto());

        return response()->json([
            'data' => [
                'token' => $session->token,
                'user' => (new AuthUserResource($session->user))->resolve($request),
            ],
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $session = $this->authService->registerMember($request->toDto());

        return response()->json([
            'data' => [
                'token' => $session->token,
                'user' => (new AuthUserResource($session->user))->resolve($request),
            ],
        ], 201);
    }

    public function config(): JsonResponse
    {
        $enabled = app()->environment(['local', 'testing'])
            && (bool) config('auth_lobo.demo_login_enabled', false);

        return response()->json([
            'data' => [
                'demo_login_enabled' => $enabled,
            ],
        ]);
    }

    public function demoLogin(Request $request): JsonResponse
    {
        /** @var array{role: string} $validated */
        $validated = $request->validate([
            'role' => ['required', 'string', Rule::in([UserRole::Admin->value, UserRole::Member->value])],
        ]);

        $session = $this->authService->demoLogin(UserRole::from($validated['role']));

        return response()->json([
            'data' => [
                'token' => $session->token,
                'user' => (new AuthUserResource($session->user))->resolve($request),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $actor = RequestActorResolver::requireActor($request);

        return (new AuthUserResource($actor))->response();
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        if ($token !== null) {
            $this->authService->logout($token);
        }

        return response()->json(status: 204);
    }
}
