<?php

declare(strict_types=1);

namespace Modules\Billing\Application\Services;

use Carbon\CarbonImmutable;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\Facades\DB;
use Modules\Billing\Application\DTOs\ListPaymentsFilterData;
use Modules\Billing\Application\DTOs\RegisterPaymentData;
use Modules\Billing\Contracts\DTOs\AllTimeBillingStatsData;
use Modules\Billing\Contracts\DTOs\MonthlyBillingStatsData;
use Modules\Billing\Contracts\DTOs\PaymentSummaryData;
use Modules\Billing\Contracts\Events\PaymentRecorded;
use Modules\Billing\Contracts\Queries\BillingSummaryQueryInterface;
use Modules\Billing\Domain\Models\Payment;
use Modules\Billing\Domain\Repositories\PaymentRepositoryInterface;
use Modules\Members\Contracts\DTOs\MemberSummaryData;
use Modules\Members\Contracts\Queries\MemberLookupInterface;
use Modules\Plans\Contracts\Queries\PlanLookupInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Domain\Exceptions\ConflictException;
use Modules\Shared\Domain\Exceptions\ResourceNotFoundException;
use Modules\Shared\Domain\ValueObjects\Money;

final readonly class BillingService implements BillingSummaryQueryInterface
{
    public function __construct(
        private PaymentRepositoryInterface $payments,
        private MemberLookupInterface $memberLookup,
        private PlanLookupInterface $planLookup,
        private Dispatcher $events,
    ) {}

    /**
     * @return PaginatedResult<PaymentSummaryData>
     */
    #[\NoDiscard]
    public function list(ListPaymentsFilterData $filter): PaginatedResult
    {
        $paginated = $this->payments->paginate(
            query: $filter->pagination,
            search: $filter->search,
            method: $filter->method,
            month: $filter->month,
        );

        return new PaginatedResult(
            items: array_map(
                fn (Payment $payment): PaymentSummaryData => $this->toSummary($payment),
                $paginated->items,
            ),
            currentPage: $paginated->currentPage,
            perPage: $paginated->perPage,
            total: $paginated->total,
            lastPage: $paginated->lastPage,
        );
    }

    public function getMonthlyStats(?CarbonImmutable $month = null): MonthlyBillingStatsData
    {
        $aggregate = $this->payments->getMonthlyAggregate($month ?? CarbonImmutable::now());
        $money = new Money($aggregate['revenue_cents']);

        return new MonthlyBillingStatsData(
            monthlyRevenueCents: $money->amountCents,
            formattedMonthlyRevenue: $money->formatted(),
            monthlyPaymentsCount: $aggregate['count'],
        );
    }

    public function getAllTimeStats(): AllTimeBillingStatsData
    {
        $aggregate = $this->payments->getAllTimeAggregate();
        $money = new Money($aggregate['revenue_cents']);

        return new AllTimeBillingStatsData(
            totalRevenueCents: $money->amountCents,
            formattedTotalRevenue: $money->formatted(),
            distinctMembersCount: $aggregate['distinct_members'],
            totalPaymentsCount: $aggregate['count'],
        );
    }

    /**
     * @return list<PaymentSummaryData>
     */
    public function getRecentPayments(int $limit = 8): array
    {
        return array_map(
            fn (Payment $payment): PaymentSummaryData => $this->toSummary($payment),
            $this->payments->recent(max(1, min(50, $limit))),
        );
    }

    #[\NoDiscard]
    public function register(RegisterPaymentData $data): PaymentSummaryData
    {
        $plan = $this->planLookup->findSummaryById($data->planId);
        if ($plan === null) {
            throw new ResourceNotFoundException('Plan', $data->planId);
        }

        if (! $plan->isActive) {
            throw new ConflictException(
                message: sprintf('Cannot register payment for inactive plan [%s].', $plan->name),
                errors: ['plan_id' => ['Selected plan is currently inactive.']],
            );
        }

        $member = $this->resolveMember($data);
        $money = new Money($data->amountCents ?? $plan->priceCents);

        $summary = DB::transaction(function () use ($member, $plan, $money, $data): PaymentSummaryData {
            $payment = new Payment([
                'member_id' => $member->id,
                'member_name_snapshot' => $member->fullName,
                'plan_id' => $plan->id,
                'plan_name_snapshot' => $plan->name,
                'amount_cents' => $money->amountCents,
                'payment_method' => $data->paymentMethod,
                'paid_at' => $data->paidAt ?? now()->toDateString(),
                'notes' => $data->notes !== null ? trim($data->notes) : null,
            ]);

            return $this->toSummary($this->payments->save($payment));
        });

        $this->events->dispatch(new PaymentRecorded($summary));

        return $summary;
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id): void {
            $payment = $this->payments->findById($id);
            if ($payment === null) {
                throw new ResourceNotFoundException('Payment', $id);
            }

            $this->payments->delete($payment);
        });
    }

    private function resolveMember(RegisterPaymentData $data): MemberSummaryData
    {
        if ($data->memberId !== null) {
            $member = $this->memberLookup->findSummaryById($data->memberId);
            if ($member === null) {
                throw new ResourceNotFoundException('Member', $data->memberId);
            }

            return $member;
        }

        $rawName = trim((string) $data->memberName);
        if ($rawName === '') {
            throw new ConflictException(
                message: 'A member identifier or member name is required.',
                errors: ['member_name' => ['El nombre del socio es obligatorio.']],
            );
        }

        return $this->memberLookup->findOrCreateByName($rawName);
    }

    private function toSummary(Payment $payment): PaymentSummaryData
    {
        return new PaymentSummaryData(
            id: $payment->id,
            memberId: $payment->member_id,
            memberName: $payment->member_name_snapshot,
            planId: $payment->plan_id,
            planName: $payment->plan_name_snapshot,
            amountCents: $payment->amount_cents,
            formattedAmount: (new Money($payment->amount_cents))->formatted(),
            paymentMethod: $payment->payment_method->value,
            paidAt: $payment->paid_at->toDateString(),
            notes: $payment->notes,
            createdAt: $payment->created_at?->toIso8601String(),
        );
    }
}
