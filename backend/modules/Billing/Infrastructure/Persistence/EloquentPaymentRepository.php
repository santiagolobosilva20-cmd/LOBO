<?php

declare(strict_types=1);

namespace Modules\Billing\Infrastructure\Persistence;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Modules\Billing\Domain\Enums\PaymentMethod;
use Modules\Billing\Domain\Enums\PaymentStatus;
use Modules\Billing\Domain\Models\Payment;
use Modules\Billing\Domain\Repositories\PaymentRepositoryInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

final class EloquentPaymentRepository implements PaymentRepositoryInterface
{
    private const array COLUMNS = [
        'id',
        'member_id',
        'member_name_snapshot',
        'plan_id',
        'plan_name_snapshot',
        'amount_cents',
        'payment_method',
        'status',
        'paid_at',
        'notes',
        'created_at',
        'updated_at',
    ];

    public function paginate(
        PaginationQuery $query,
        ?string $search = null,
        ?PaymentMethod $method = null,
        ?CarbonImmutable $month = null,
        ?int $memberId = null,
        ?PaymentStatus $status = null,
    ): PaginatedResult {
        $builder = Payment::query()->select(self::COLUMNS);

        if ($search !== null && trim($search) !== '') {
            $term = '%'.trim($search).'%';
            $builder->where(static function (Builder $nested) use ($term): void {
                $nested->whereLike('member_name_snapshot', $term)
                    ->orWhereLike('plan_name_snapshot', $term);
            });
        }

        if ($method !== null) {
            $builder->where('payment_method', $method->value);
        }

        if ($memberId !== null) {
            $builder->where('member_id', $memberId);
        }

        if ($status !== null) {
            $builder->where('status', $status->value);
        }

        if ($month !== null) {
            $builder->whereBetween('paid_at', [
                $month->startOfMonth()->toDateString(),
                $month->endOfMonth()->toDateString(),
            ]);
        }

        $paginator = $builder
            ->orderByDesc('paid_at')
            ->orderByDesc('id')
            ->paginate(perPage: $query->perPage, page: $query->page);

        return PaginatedResult::fromPaginator(
            paginator: $paginator,
            mapper: static fn (Payment $payment): Payment => $payment,
        );
    }

    public function recent(int $limit = 8): array
    {
        /** @var list<Payment> $items */
        $items = Payment::query()
            ->select(self::COLUMNS)
            ->where('status', PaymentStatus::Paid->value)
            ->orderByDesc('paid_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->all();

        return $items;
    }

    public function getMonthlyAggregate(CarbonImmutable $month): array
    {
        $row = Payment::query()
            ->where('status', PaymentStatus::Paid->value)
            ->whereBetween('paid_at', [
                $month->startOfMonth()->toDateString(),
                $month->endOfMonth()->toDateString(),
            ])
            ->selectRaw('COALESCE(SUM(amount_cents), 0) AS revenue_cents, COUNT(*) AS payments_count')
            ->first();

        return [
            'revenue_cents' => (int) ($row?->getAttribute('revenue_cents') ?? 0),
            'count' => (int) ($row?->getAttribute('payments_count') ?? 0),
        ];
    }

    public function getAllTimeAggregate(): array
    {
        $row = Payment::query()
            ->where('status', PaymentStatus::Paid->value)
            ->selectRaw('COALESCE(SUM(amount_cents), 0) AS revenue_cents, COUNT(DISTINCT member_id) AS distinct_members, COUNT(*) AS payments_count')
            ->first();

        return [
            'revenue_cents' => (int) ($row?->getAttribute('revenue_cents') ?? 0),
            'distinct_members' => (int) ($row?->getAttribute('distinct_members') ?? 0),
            'count' => (int) ($row?->getAttribute('payments_count') ?? 0),
        ];
    }

    public function countPending(): int
    {
        return Payment::query()
            ->where('status', PaymentStatus::Pending->value)
            ->count();
    }

    public function findById(int $id): ?Payment
    {
        return Payment::query()->select(self::COLUMNS)->find($id);
    }

    public function save(Payment $payment): Payment
    {
        $payment->save();

        return $payment->refresh();
    }

    public function delete(Payment $payment): void
    {
        $payment->delete();
    }
}
