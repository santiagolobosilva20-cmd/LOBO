<?php

declare(strict_types=1);

namespace Modules\Billing\Presentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Billing\Application\Services\BillingService;
use Modules\Billing\Presentation\Http\Requests\ListPaymentsRequest;
use Modules\Billing\Presentation\Http\Requests\StorePaymentRequest;
use Modules\Billing\Presentation\Http\Resources\PaymentResource;

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

    public function destroy(int $paymentId): JsonResponse
    {
        $this->billingService->delete($paymentId);

        return response()->json(status: 204);
    }
}
