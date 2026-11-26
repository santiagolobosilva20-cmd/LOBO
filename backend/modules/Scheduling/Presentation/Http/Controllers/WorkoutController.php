<?php

declare(strict_types=1);

namespace Modules\Scheduling\Presentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Scheduling\Application\Services\WorkoutService;
use Modules\Scheduling\Presentation\Http\Requests\StoreWorkoutRequest;
use Modules\Scheduling\Presentation\Http\Resources\WorkoutResource;
use Modules\Shared\Application\DTOs\PaginationQuery;
use Modules\Shared\Presentation\Http\Responses\PaginatedJsonResponse;

final readonly class WorkoutController
{
    public function __construct(
        private WorkoutService $workoutService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $page = $request->integer('page', 1);
        $perPage = $request->integer('per_page', 20);
        $category = $request->string('category')->toString();

        return PaginatedJsonResponse::fromResult(
            result: $this->workoutService->list(
                pagination: new PaginationQuery($page, $perPage),
                category: $category !== '' ? $category : null,
            ),
            resourceClass: WorkoutResource::class,
            request: $request,
        );
    }

    public function store(StoreWorkoutRequest $request): JsonResponse
    {
        $workout = $this->workoutService->create($request->toDto());

        return (new WorkoutResource($workout))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(int $workoutId): JsonResponse
    {
        $this->workoutService->delete($workoutId);

        return response()->json(status: 204);
    }
}
