<?php

declare(strict_types=1);

namespace Modules\Plans\Presentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Plans\Application\Services\PlanService;
use Modules\Plans\Presentation\Http\Requests\ListPlansRequest;
use Modules\Plans\Presentation\Http\Requests\StorePlanRequest;
use Modules\Plans\Presentation\Http\Requests\UpdatePlanRequest;
use Modules\Plans\Presentation\Http\Resources\PlanResource;
use Modules\Shared\Presentation\Http\Responses\PaginatedJsonResponse;

final readonly class PlanController
{
    public function __construct(
        private PlanService $planService,
    ) {}

    public function index(ListPlansRequest $request): JsonResponse
    {
        return PaginatedJsonResponse::fromResult(
            result: $this->planService->list($request->toDto()),
            resourceClass: PlanResource::class,
            request: $request,
        );
    }

    public function store(StorePlanRequest $request): JsonResponse
    {
        $plan = $this->planService->create($request->toDto());

        return (new PlanResource($plan))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $planId): JsonResponse
    {
        $plan = $this->planService->getById($planId);

        return (new PlanResource($plan))->response();
    }

    public function update(UpdatePlanRequest $request, int $planId): JsonResponse
    {
        $plan = $this->planService->update($planId, $request->toDto());

        return (new PlanResource($plan))->response();
    }

    public function destroy(int $planId): JsonResponse
    {
        $this->planService->delete($planId);

        return response()->json(status: 204);
    }
}
