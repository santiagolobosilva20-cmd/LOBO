<?php

declare(strict_types=1);

namespace Modules\Memberships\Presentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Memberships\Application\Services\MembershipService;
use Modules\Memberships\Presentation\Http\Requests\ListMembershipsRequest;
use Modules\Memberships\Presentation\Http\Requests\RenewMembershipRequest;
use Modules\Memberships\Presentation\Http\Requests\StoreMembershipRequest;
use Modules\Memberships\Presentation\Http\Resources\MembershipResource;

final readonly class MembershipController
{
    public function __construct(
        private MembershipService $membershipService,
    ) {}

    public function index(ListMembershipsRequest $request): JsonResponse
    {
        $result = $this->membershipService->list($request->toDto());
        $stats = $this->membershipService->getStats();

        return response()->json([
            'data' => MembershipResource::collection($result->items)->resolve($request),
            'meta' => [
                'current_page' => $result->currentPage,
                'per_page' => $result->perPage,
                'total' => $result->total,
                'last_page' => $result->lastPage,
            ],
            'stats' => [
                'active_count' => $stats->activeCount,
                'expiring_soon_count' => $stats->expiringSoonCount,
                'paused_count' => $stats->pausedCount,
                'expired_count' => $stats->expiredCount,
            ],
        ]);
    }

    public function store(StoreMembershipRequest $request): JsonResponse
    {
        $membership = $this->membershipService->assign($request->toDto());

        return (new MembershipResource($membership))
            ->response()
            ->setStatusCode(201);
    }

    public function renew(RenewMembershipRequest $request, int $membershipId): JsonResponse
    {
        $membership = $this->membershipService->renew($membershipId, $request->planId());

        return (new MembershipResource($membership))->response();
    }

    public function pause(int $membershipId): JsonResponse
    {
        $membership = $this->membershipService->pause($membershipId);

        return (new MembershipResource($membership))->response();
    }

    public function resume(int $membershipId): JsonResponse
    {
        $membership = $this->membershipService->resume($membershipId);

        return (new MembershipResource($membership))->response();
    }

    public function cancel(int $membershipId): JsonResponse
    {
        $membership = $this->membershipService->cancel($membershipId);

        return (new MembershipResource($membership))->response();
    }
}
