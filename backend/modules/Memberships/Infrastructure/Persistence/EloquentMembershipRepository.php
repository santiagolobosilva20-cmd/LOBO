<?php

declare(strict_types=1);

namespace Modules\Memberships\Infrastructure\Persistence;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Modules\Memberships\Domain\Enums\MembershipStatus;
use Modules\Memberships\Domain\Models\Membership;
use Modules\Memberships\Domain\Repositories\MembershipRepositoryInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

final class EloquentMembershipRepository implements MembershipRepositoryInterface
{
    public function paginate(
        PaginationQuery $query,
        ?string $search = null,
        ?string $statusFilter = null,
        ?int $memberId = null,
    ): PaginatedResult {
        $today = CarbonImmutable::today();

        /** @var Builder<Membership> $builder */
        $builder = Membership::query()->orderByDesc('ends_at')->orderByDesc('id');

        if ($memberId !== null) {
            $builder->where('member_id', $memberId);
        }

        if ($search !== null && trim($search) !== '') {
            $needle = '%'.mb_strtolower(trim($search)).'%';
            $builder->where(static function (Builder $sub) use ($needle): void {
                $sub->whereRaw('LOWER(member_name_snapshot) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(plan_name_snapshot) LIKE ?', [$needle]);
            });
        }

        $this->applyStatusFilter($builder, $statusFilter, $today);

        $paginator = $builder->paginate(perPage: $query->perPage, page: $query->page);

        return PaginatedResult::fromPaginator(
            paginator: $paginator,
            mapper: static fn (Membership $membership): Membership => $membership,
        );
    }

    public function findById(int $id): ?Membership
    {
        return Membership::query()->find($id);
    }

    public function findLatestByMemberId(int $memberId): ?Membership
    {
        return Membership::query()
            ->where('member_id', $memberId)
            ->orderByDesc('ends_at')
            ->orderByDesc('id')
            ->first();
    }

    public function findActiveByMemberId(int $memberId, CarbonImmutable $today): ?Membership
    {
        return Membership::query()
            ->where('member_id', $memberId)
            ->where('status', MembershipStatus::Active->value)
            ->whereDate('ends_at', '>=', $today->toDateString())
            ->orderByDesc('ends_at')
            ->first();
    }

    public function getStatusBreakdown(CarbonImmutable $today): array
    {
        $todayStr = $today->toDateString();
        $soonStr = $today->addDays(7)->toDateString();

        $active = Membership::query()
            ->where('status', MembershipStatus::Active->value)
            ->whereDate('ends_at', '>=', $todayStr)
            ->count();

        $expiringSoon = Membership::query()
            ->where('status', MembershipStatus::Active->value)
            ->whereDate('ends_at', '>=', $todayStr)
            ->whereDate('ends_at', '<=', $soonStr)
            ->count();

        $paused = Membership::query()
            ->where('status', MembershipStatus::Paused->value)
            ->count();

        $expired = Membership::query()
            ->where(static function (Builder $sub) use ($todayStr): void {
                $sub->where('status', MembershipStatus::Expired->value)
                    ->orWhere(static function (Builder $nested) use ($todayStr): void {
                        $nested->where('status', MembershipStatus::Active->value)
                            ->whereDate('ends_at', '<', $todayStr);
                    });
            })
            ->count();

        return [
            'active' => $active,
            'expiring_soon' => $expiringSoon,
            'paused' => $paused,
            'expired' => $expired,
        ];
    }

    public function save(Membership $membership): Membership
    {
        $membership->save();

        return $membership;
    }

    /**
     * @param  Builder<Membership>  $builder
     */
    private function applyStatusFilter(Builder $builder, ?string $statusFilter, CarbonImmutable $today): void
    {
        if ($statusFilter === null || $statusFilter === '') {
            return;
        }

        $todayStr = $today->toDateString();

        if ($statusFilter === 'expiring_soon') {
            $builder->where('status', MembershipStatus::Active->value)
                ->whereDate('ends_at', '>=', $todayStr)
                ->whereDate('ends_at', '<=', $today->addDays(7)->toDateString());

            return;
        }

        if ($statusFilter === MembershipStatus::Active->value) {
            $builder->where('status', MembershipStatus::Active->value)
                ->whereDate('ends_at', '>=', $todayStr);

            return;
        }

        if ($statusFilter === MembershipStatus::Expired->value) {
            $builder->where(static function (Builder $sub) use ($todayStr): void {
                $sub->where('status', MembershipStatus::Expired->value)
                    ->orWhere(static function (Builder $nested) use ($todayStr): void {
                        $nested->where('status', MembershipStatus::Active->value)
                            ->whereDate('ends_at', '<', $todayStr);
                    });
            });

            return;
        }

        $builder->where('status', $statusFilter);
    }
}
