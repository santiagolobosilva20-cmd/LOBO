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
}
