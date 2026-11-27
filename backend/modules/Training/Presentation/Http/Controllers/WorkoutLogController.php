<?php

declare(strict_types=1);

namespace Modules\Training\Presentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Shared\Presentation\Http\Responses\PaginatedJsonResponse;
use Modules\Training\Application\Services\WorkoutLogService;
use Modules\Training\Presentation\Http\Requests\ListWorkoutLogsRequest;
use Modules\Training\Presentation\Http\Requests\StoreWorkoutLogRequest;
use Modules\Training\Presentation\Http\Resources\WorkoutLogResource;

final readonly class WorkoutLogController
{
    public function __construct(
        private WorkoutLogService $workoutLogService,
    ) {}

    public function index(ListWorkoutLogsRequest $request): JsonResponse
    {
        return PaginatedJsonResponse::fromResult(
            result: $this->workoutLogService->list($request->toDto()),
            resourceClass: WorkoutLogResource::class,
            request: $request,
        );
    }

    public function store(StoreWorkoutLogRequest $request): JsonResponse
    {
        $log = $this->workoutLogService->record($request->toDto());

        return (new WorkoutLogResource($log))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(int $logId): JsonResponse
    {
        $this->workoutLogService->delete($logId);

        return response()->json(status: 204);
    }
}
