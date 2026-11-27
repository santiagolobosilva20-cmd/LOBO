<?php

declare(strict_types=1);

namespace Modules\Memberships\Application\Services;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Modules\Billing\Contracts\DTOs\PaymentSummaryData;
use Modules\Members\Contracts\DTOs\MemberSummaryData;
use Modules\Members\Contracts\Queries\MemberLookupInterface;
use Modules\Memberships\Application\DTOs\CreateMembershipData;
use Modules\Memberships\Application\DTOs\ListMembershipsFilterData;
use Modules\Memberships\Contracts\DTOs\MembershipStatsData;
use Modules\Memberships\Contracts\DTOs\MembershipSummaryData;
use Modules\Memberships\Contracts\Queries\MembershipSummaryQueryInterface;
use Modules\Memberships\Domain\Enums\MembershipStatus;
use Modules\Memberships\Domain\Models\Membership;
use Modules\Memberships\Domain\Repositories\MembershipRepositoryInterface;
use Modules\Plans\Contracts\DTOs\PlanSummaryData;
use Modules\Plans\Contracts\Queries\PlanLookupInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Domain\Exceptions\ConflictException;
use Modules\Shared\Domain\Exceptions\ResourceNotFoundException;

final readonly class MembershipService implements MembershipSummaryQueryInterface
{
    public function __construct(
        private MembershipRepositoryInterface $memberships,
        private MemberLookupInterface $memberLookup,
        private PlanLookupInterface $planLookup,
    ) {}

    /**
     * @return PaginatedResult<MembershipSummaryData>
     */
    #[\NoDiscard]
    public function list(ListMembershipsFilterData $filter): PaginatedResult
    {
        $paginated = $this->memberships->paginate(
            query: $filter->pagination,
            search: $filter->search,
            statusFilter: $filter->status,
            memberId: $filter->memberId,
        );

        $today = CarbonImmutable::today();

        return new PaginatedResult(
            items: array_map(
                fn (Membership $membership): MembershipSummaryData => $this->toSummary($membership, $today),
                $paginated->items,
            ),
            currentPage: $paginated->currentPage,
            perPage: $paginated->perPage,
            total: $paginated->total,
            lastPage: $paginated->lastPage,
        );
    }

    public function getStats(): MembershipStatsData
    {
        $breakdown = $this->memberships->getStatusBreakdown(CarbonImmutable::today());

        return new MembershipStatsData(
            activeCount: $breakdown['active'],
            expiringSoonCount: $breakdown['expiring_soon'],
            pausedCount: $breakdown['paused'],
            expiredCount: $breakdown['expired'],
        );
    }

    public function findActiveForMember(int $memberId): ?MembershipSummaryData
    {
        $today = CarbonImmutable::today();
        $membership = $this->memberships->findActiveByMemberId($memberId, $today);

        return $membership !== null ? $this->toSummary($membership, $today) : null;
    }

    #[\NoDiscard]
    public function assign(CreateMembershipData $data): MembershipSummaryData
    {
        $plan = $this->resolveActivePlan($data->planId);
        $member = $this->resolveMember($data->memberId, $data->memberName);
        $today = CarbonImmutable::today();
        $startDate = ($data->startsAt ?? $today)->startOfDay();

        return DB::transaction(function () use ($member, $plan, $startDate, $data, $today): MembershipSummaryData {
            $existing = $this->memberships->findLatestByMemberId($member->id);
            if ($existing !== null && $existing->effectiveStatus($today) === MembershipStatus::Active) {
                $currentEnd = CarbonImmutable::instance($existing->ends_at)->startOfDay();
                $base = $currentEnd->gt($startDate) ? $currentEnd : $startDate;
                $existing->plan_id = $plan->id;
                $existing->plan_name_snapshot = $plan->name;
                $existing->ends_at = $base->addDays(max(1, $plan->durationDays));
                $existing->auto_renew = $data->autoRenew;
                if ($data->notes !== null) {
                    $existing->notes = trim($data->notes);
                }

                return $this->toSummary($this->memberships->save($existing), $today);
            }

            $membership = new Membership([
                'member_id' => $member->id,
                'plan_id' => $plan->id,
                'member_name_snapshot' => $member->fullName,
                'plan_name_snapshot' => $plan->name,
                'starts_at' => $startDate->toDateString(),
                'ends_at' => $startDate->addDays(max(1, $plan->durationDays))->toDateString(),
                'status' => MembershipStatus::Active,
                'auto_renew' => $data->autoRenew,
                'notes' => $data->notes !== null ? trim($data->notes) : null,
            ]);

            return $this->toSummary($this->memberships->save($membership), $today);
        });
    }

    public function activateFromPayment(PaymentSummaryData $payment): void
    {
        $plan = $this->planLookup->findSummaryById($payment->planId);
        if ($plan === null) {
            return;
        }

        $today = CarbonImmutable::today();
        $paidDate = CarbonImmutable::parse($payment->paidAt)->startOfDay();

        DB::transaction(function () use ($payment, $plan, $paidDate, $today): void {
            $existing = $this->memberships->findLatestByMemberId($payment->memberId);

            if ($existing !== null && $existing->effectiveStatus($today) === MembershipStatus::Active) {
                $currentEnd = CarbonImmutable::instance($existing->ends_at)->startOfDay();
                $baseDate = $currentEnd->gt($paidDate) ? $currentEnd : $paidDate;
                $existing->plan_id = $plan->id;
                $existing->plan_name_snapshot = $plan->name;
                $existing->last_payment_id = $payment->id;
                $existing->ends_at = $baseDate->addDays(max(1, $plan->durationDays));
                $this->memberships->save($existing);

                return;
            }

            $membership = new Membership([
                'member_id' => $payment->memberId,
                'plan_id' => $plan->id,
                'last_payment_id' => $payment->id,
                'member_name_snapshot' => $payment->memberName,
                'plan_name_snapshot' => $plan->name,
                'starts_at' => $paidDate->toDateString(),
                'ends_at' => $paidDate->addDays(max(1, $plan->durationDays))->toDateString(),
                'status' => MembershipStatus::Active,
                'auto_renew' => false,
                'notes' => $payment->notes,
            ]);

            $this->memberships->save($membership);
        });
    }

    #[\NoDiscard]
    public function renew(int $membershipId, ?int $planId = null): MembershipSummaryData
    {
        $today = CarbonImmutable::today();

        return DB::transaction(function () use ($membershipId, $planId, $today): MembershipSummaryData {
            $membership = $this->requireMembership($membershipId);
            if ($membership->status === MembershipStatus::Cancelled) {
                throw new ConflictException(
                    message: 'Cannot renew a cancelled membership.',
                    errors: ['status' => ['La membresía cancelada no puede renovarse.']],
                );
            }

            $plan = $this->resolveActivePlan($planId ?? $membership->plan_id);
            $currentEnd = CarbonImmutable::instance($membership->ends_at)->startOfDay();
            $base = $currentEnd->gt($today) ? $currentEnd : $today;

            if ($currentEnd->lt($today)) {
                $membership->starts_at = $today;
            }
            $membership->plan_id = $plan->id;
            $membership->plan_name_snapshot = $plan->name;
            $membership->ends_at = $base->addDays(max(1, $plan->durationDays));
            $membership->status = MembershipStatus::Active;

            return $this->toSummary($this->memberships->save($membership), $today);
        });
    }

    #[\NoDiscard]
    public function pause(int $membershipId): MembershipSummaryData
    {
        $today = CarbonImmutable::today();

        return DB::transaction(function () use ($membershipId, $today): MembershipSummaryData {
            $membership = $this->requireMembership($membershipId);
            if ($membership->status === MembershipStatus::Cancelled) {
                throw new ConflictException(
                    message: 'Cancelled memberships cannot be paused.',
                    errors: ['status' => ['Una membresía cancelada no puede pausarse.']],
                );
            }

            $membership->status = MembershipStatus::Paused;

            return $this->toSummary($this->memberships->save($membership), $today);
        });
    }

    #[\NoDiscard]
    public function resume(int $membershipId): MembershipSummaryData
    {
        $today = CarbonImmutable::today();

        return DB::transaction(function () use ($membershipId, $today): MembershipSummaryData {
            $membership = $this->requireMembership($membershipId);
            if ($membership->status !== MembershipStatus::Paused) {
                throw new ConflictException(
                    message: 'Only paused memberships can be resumed.',
                    errors: ['status' => ['Solo se pueden reanudar membresías en pausa.']],
                );
            }

            $currentEnd = CarbonImmutable::instance($membership->ends_at)->startOfDay();
            $membership->status = $currentEnd->lt($today)
                ? MembershipStatus::Expired
                : MembershipStatus::Active;

            return $this->toSummary($this->memberships->save($membership), $today);
        });
    }

    #[\NoDiscard]
    public function cancel(int $membershipId): MembershipSummaryData
    {
        $today = CarbonImmutable::today();

        return DB::transaction(function () use ($membershipId, $today): MembershipSummaryData {
            $membership = $this->requireMembership($membershipId);
            $membership->status = MembershipStatus::Cancelled;

            return $this->toSummary($this->memberships->save($membership), $today);
        });
    }

    private function requireMembership(int $id): Membership
    {
        $membership = $this->memberships->findById($id);
        if ($membership === null) {
            throw new ResourceNotFoundException('Membership', $id);
        }

        return $membership;
    }

    private function resolveActivePlan(int $planId): PlanSummaryData
    {
        $plan = $this->planLookup->findSummaryById($planId);
        if ($plan === null) {
            throw new ResourceNotFoundException('Plan', $planId);
        }

        if (! $plan->isActive) {
            throw new ConflictException(
                message: sprintf('Selected plan [%s] is inactive.', $plan->name),
                errors: ['plan_id' => ['El plan seleccionado no está activo.']],
            );
        }

        return $plan;
    }

    private function resolveMember(?int $memberId, ?string $memberName): MemberSummaryData
    {
        if ($memberId !== null) {
            $member = $this->memberLookup->findSummaryById($memberId);
            if ($member === null) {
                throw new ResourceNotFoundException('Member', $memberId);
            }

            return $member;
        }

        $trimmed = trim((string) $memberName);
        if ($trimmed === '') {
            throw new ConflictException(
                message: 'A member identifier or member name is required.',
                errors: ['member_name' => ['Debes indicar un socio válido.']],
            );
        }

        return $this->memberLookup->findOrCreateByName($trimmed);
    }

    private function toSummary(Membership $membership, CarbonImmutable $today): MembershipSummaryData
    {
        $effective = $membership->effectiveStatus($today);
        $daysRemaining = $effective === MembershipStatus::Active ? $membership->daysRemaining($today) : 0;

        return new MembershipSummaryData(
            id: $membership->id,
            memberId: $membership->member_id,
            memberName: $membership->member_name_snapshot,
            planId: $membership->plan_id,
            planName: $membership->plan_name_snapshot,
            lastPaymentId: $membership->last_payment_id,
            startsAt: $membership->starts_at->toDateString(),
            endsAt: $membership->ends_at->toDateString(),
            daysRemaining: $daysRemaining,
            isExpiringSoon: $effective === MembershipStatus::Active && $daysRemaining <= 7,
            status: $effective->value,
            autoRenew: $membership->auto_renew,
            notes: $membership->notes,
            createdAt: $membership->created_at?->toIso8601String(),
        );
    }
}
