<?php

declare(strict_types=1);

namespace Modules\Scheduling\Presentation\Http\Controllers;

use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Scheduling\Application\Services\ScheduleService;
use Modules\Scheduling\Domain\Enums\SessionStatus;
use Modules\Scheduling\Presentation\Http\Requests\StoreClassSessionRequest;
use Modules\Scheduling\Presentation\Http\Resources\ClassSessionResource;
use Modules\Shared\Application\DTOs\PaginationQuery;
use Modules\Shared\Presentation\Http\Requests\RequestActorResolver;
use Modules\Shared\Presentation\Http\Responses\PaginatedJsonResponse;

final readonly class ClassSessionController
{
    public function __construct(
        private ScheduleService $scheduleService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $page = $request->integer('page', 1);
        $perPage = $request->integer('per_page', 20);
        $dateParam = $request->string('date')->toString();
        $statusParam = $request->string('status')->toString();

        return PaginatedJsonResponse::fromResult(
            result: $this->scheduleService->list(
                pagination: new PaginationQuery($page, $perPage),
                date: $dateParam !== '' ? CarbonImmutable::parse($dateParam) : null,
                status: $statusParam !== '' ? SessionStatus::tryFrom($statusParam) : null,
            ),
            resourceClass: ClassSessionResource::class,
            request: $request,
        );
    }

    public function store(StoreClassSessionRequest $request): JsonResponse
    {
        $session = $this->scheduleService->create($request->toDto());

        return (new ClassSessionResource($session))
            ->response()
            ->setStatusCode(201);
    }

    public function enroll(int $sessionId): JsonResponse
    {
        $session = $this->scheduleService->enroll($sessionId);

        return (new ClassSessionResource($session))->response();
    }

    public function destroy(int $sessionId): JsonResponse
    {
        $this->scheduleService->delete($sessionId);

        return response()->json(status: 204);
    }

    public function memberIndex(Request $request): JsonResponse
    {
        $memberId = RequestActorResolver::requireMemberId($request);
        $page = max(1, $request->integer('page', 1));
        $perPage = max(1, min(100, $request->integer('per_page', 30)));
        $statusParam = $request->string('status')->toString();

        $result = $this->scheduleService->list(
            pagination: new PaginationQuery($page, $perPage),
            status: $statusParam !== '' ? SessionStatus::tryFrom($statusParam) : null,
        );

        return response()->json([
            'data' => ClassSessionResource::collection($result->items)->resolve($request),
            'meta' => [
                'current_page' => $result->currentPage,
                'per_page' => $result->perPage,
                'total' => $result->total,
                'last_page' => $result->lastPage,
            ],
            'booked_session_ids' => $this->scheduleService->listBookedSessionIdsForMember($memberId),
        ]);
    }

    public function memberBook(Request $request, int $sessionId): JsonResponse
    {
        $actor = RequestActorResolver::requireActor($request);
        $memberId = RequestActorResolver::requireMemberId($request);

        $session = $this->scheduleService->bookForMember(
            sessionId: $sessionId,
            memberId: $memberId,
            memberName: $actor->memberName ?? $actor->name,
        );

        return (new ClassSessionResource($session))->response();
    }

    public function memberCancelBooking(Request $request, int $sessionId): JsonResponse
    {
        $memberId = RequestActorResolver::requireMemberId($request);
        $session = $this->scheduleService->cancelForMember($sessionId, $memberId);

        return (new ClassSessionResource($session))->response();
    }
}
