<?php

declare(strict_types=1);

namespace Modules\Nutrition\Presentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Nutrition\Application\DTOs\ListNutritionPlansFilterData;
use Modules\Nutrition\Application\Services\NutritionService;
use Modules\Nutrition\Presentation\Http\Requests\AssignNutritionPlanRequest;
use Modules\Nutrition\Presentation\Http\Requests\ListNutritionPlansRequest;
use Modules\Nutrition\Presentation\Http\Requests\SaveNutritionPlanRequest;
use Modules\Nutrition\Presentation\Http\Resources\NutritionPlanResource;
use Modules\Shared\Presentation\Http\Requests\RequestActorResolver;
use Modules\Shared\Presentation\Http\Responses\PaginatedJsonResponse;

final readonly class NutritionPlanController
{
    public function __construct(
        private NutritionService $nutritionService,
    ) {}

    public function index(ListNutritionPlansRequest $request): JsonResponse
    {
        return PaginatedJsonResponse::fromResult(
            result: $this->nutritionService->list($request->toDto()),
            resourceClass: NutritionPlanResource::class,
            request: $request,
        );
    }

    public function store(SaveNutritionPlanRequest $request): JsonResponse
    {
        $plan = $this->nutritionService->create($request->toDto());

        return (new NutritionPlanResource($plan))
            ->response()
            ->setStatusCode(201);
    }

    public function update(SaveNutritionPlanRequest $request, int $planId): JsonResponse
    {
        $plan = $this->nutritionService->update($planId, $request->toDto());

        return (new NutritionPlanResource($plan))->response();
    }

    public function assign(AssignNutritionPlanRequest $request, int $planId): JsonResponse
    {
        $plan = $this->nutritionService->assignToMember(
            planId: $planId,
            memberId: $request->memberId(),
            memberName: $request->memberName(),
        );

        return (new NutritionPlanResource($plan))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(int $planId): JsonResponse
    {
        $this->nutritionService->delete($planId);

        return response()->json(status: 204);
    }

    public function memberIndex(ListNutritionPlansRequest $request): JsonResponse
    {
        $memberId = RequestActorResolver::requireMemberId($request);
        $base = $request->toDto();
        $scope = $request->string('scope')->toString();

        $filter = match ($scope) {
            'mine' => new ListNutritionPlansFilterData(
                pagination: $base->pagination,
                goal: $base->goal,
                isTemplate: false,
                memberId: $memberId,
                search: $base->search,
                includeTemplates: false,
            ),
            'templates' => new ListNutritionPlansFilterData(
                pagination: $base->pagination,
                goal: $base->goal,
                isTemplate: true,
                memberId: null,
                search: $base->search,
                includeTemplates: false,
            ),
            default => new ListNutritionPlansFilterData(
                pagination: $base->pagination,
                goal: $base->goal,
                isTemplate: null,
                memberId: $memberId,
                search: $base->search,
                includeTemplates: true,
            ),
        };

        return PaginatedJsonResponse::fromResult(
            result: $this->nutritionService->list($filter),
            resourceClass: NutritionPlanResource::class,
            request: $request,
        );
    }
}
