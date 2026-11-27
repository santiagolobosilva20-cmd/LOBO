<?php

declare(strict_types=1);

namespace Modules\Billing\Presentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Billing\Application\DTOs\ListPaymentsFilterData;
use Modules\Billing\Application\Services\BillingService;
use Modules\Billing\Presentation\Http\Requests\ListPaymentsRequest;
use Modules\Billing\Presentation\Http\Requests\StoreMemberPaymentRequest;
use Modules\Billing\Presentation\Http\Requests\StorePaymentRequest;
use Modules\Billing\Presentation\Http\Resources\PaymentResource;
use Modules\Shared\Application\DTOs\PaginationQuery;
use Modules\Shared\Presentation\Http\Requests\RequestActorResolver;
use Modules\Shared\Presentation\Http\Responses\PaginatedJsonResponse;

final readonly class PaymentController
{
    public function __construct(
        private BillingService $billingService,
    ) {}

    public function index(ListPaymentsRequest $request): JsonResponse
    {
        $result = $this->billingService->list($request->toDto());
        $stats = $this->billingService->getAllTimeStats();

        return response()->json([
            'data' => PaymentResource::collection($result->items)->resolve($request),
            'meta' => [
                'current_page' => $result->currentPage,
                'per_page' => $result->perPage,
                'total' => $result->total,
                'last_page' => $result->lastPage,
            ],
            'stats' => [
                'total_revenue_cents' => $stats->totalRevenueCents,
                'formatted_total_revenue' => $stats->formattedTotalRevenue,
                'distinct_members_count' => $stats->distinctMembersCount,
                'total_payments_count' => $stats->totalPaymentsCount,
                'pending_count' => $this->billingService->countPendingRequests(),
            ],
        ]);
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $payment = $this->billingService->register($request->toDto());

        return (new PaymentResource($payment))
            ->response()
            ->setStatusCode(201);
    }

    public function approve(int $paymentId): JsonResponse
    {
        $payment = $this->billingService->approve($paymentId);

        return (new PaymentResource($payment))->response();
    }

    public function reject(int $paymentId): JsonResponse
    {
        $payment = $this->billingService->reject($paymentId);

        return (new PaymentResource($payment))->response();
    }

    public function destroy(int $paymentId): JsonResponse
    {
        $this->billingService->delete($paymentId);

        return response()->json(status: 204);
    }

    public function memberIndex(Request $request): JsonResponse
    {
        $memberId = RequestActorResolver::requireMemberId($request);
        $page = max(1, $request->integer('page', 1));
        $perPage = max(1, min(100, $request->integer('per_page', 20)));

        return PaginatedJsonResponse::fromResult(
            result: $this->billingService->list(new ListPaymentsFilterData(
                pagination: new PaginationQuery($page, $perPage),
                memberId: $memberId,
            )),
            resourceClass: PaymentResource::class,
            request: $request,
        );
    }

    public function memberRequestPayment(StoreMemberPaymentRequest $request): JsonResponse
    {
        $memberId = RequestActorResolver::requireMemberId($request);
        $payment = $this->billingService->requestMemberPayment(
            memberId: $memberId,
            planId: $request->planId(),
            method: $request->paymentMethod(),
            notes: $request->notes(),
        );

        return (new PaymentResource($payment))
            ->response()
            ->setStatusCode(201);
    }
}
