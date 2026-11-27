<?php

declare(strict_types=1);

namespace Modules\Training\Presentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Shared\Presentation\Http\Responses\PaginatedJsonResponse;
use Modules\Training\Application\Services\RoutineService;
use Modules\Training\Presentation\Http\Requests\AssignRoutineRequest;
use Modules\Training\Presentation\Http\Requests\ListRoutinesRequest;
use Modules\Training\Presentation\Http\Requests\SaveRoutineRequest;
use Modules\Training\Presentation\Http\Resources\RoutineResource;

final readonly class RoutineController
{
    public function __construct(
        private RoutineService $routineService,
    ) {}

    public function index(ListRoutinesRequest $request): JsonResponse
    {
        return PaginatedJsonResponse::fromResult(
            result: $this->routineService->list($request->toDto()),
            resourceClass: RoutineResource::class,
            request: $request,
        );
    }

    public function store(SaveRoutineRequest $request): JsonResponse
    {
        $routine = $this->routineService->create($request->toDto());

        return (new RoutineResource($routine))
            ->response()
            ->setStatusCode(201);
    }

    public function update(SaveRoutineRequest $request, int $routineId): JsonResponse
    {
        $routine = $this->routineService->update($routineId, $request->toDto());

        return (new RoutineResource($routine))->response();
    }

    public function assign(AssignRoutineRequest $request, int $routineId): JsonResponse
    {
        $routine = $this->routineService->assignToMember(
            routineId: $routineId,
            memberId: $request->memberId(),
            memberName: $request->memberName(),
        );

        return (new RoutineResource($routine))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(int $routineId): JsonResponse
    {
        $this->routineService->delete($routineId);

        return response()->json(status: 204);
    }
}
