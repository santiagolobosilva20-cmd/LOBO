<?php

declare(strict_types=1);

namespace Modules\Members\Presentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Members\Application\Services\MemberService;
use Modules\Members\Presentation\Http\Requests\ListMembersRequest;
use Modules\Members\Presentation\Http\Requests\StoreMemberRequest;
use Modules\Members\Presentation\Http\Requests\UpdateMemberRequest;
use Modules\Members\Presentation\Http\Resources\MemberResource;
use Modules\Shared\Presentation\Http\Responses\PaginatedJsonResponse;

final readonly class MemberController
{
    public function __construct(
        private MemberService $memberService,
    ) {}

    public function index(ListMembersRequest $request): JsonResponse
    {
        return PaginatedJsonResponse::fromResult(
            result: $this->memberService->list($request->toDto()),
            resourceClass: MemberResource::class,
            request: $request,
        );
    }

    public function store(StoreMemberRequest $request): JsonResponse
    {
        $member = $this->memberService->create($request->toDto());

        return (new MemberResource($member))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $memberId): JsonResponse
    {
        $member = $this->memberService->getById($memberId);

        return (new MemberResource($member))->response();
    }

    public function update(UpdateMemberRequest $request, int $memberId): JsonResponse
    {
        $member = $this->memberService->update($memberId, $request->toDto());

        return (new MemberResource($member))->response();
    }

    public function destroy(int $memberId): JsonResponse
    {
        $this->memberService->delete($memberId);

        return response()->json(status: 204);
    }
}
