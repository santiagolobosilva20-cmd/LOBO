<?php

declare(strict_types=1);

namespace Modules\Members\Infrastructure\Persistence;

use Illuminate\Database\Eloquent\Builder;
use Modules\Members\Domain\Enums\MemberStatus;
use Modules\Members\Domain\Models\Member;
use Modules\Members\Domain\Repositories\MemberRepositoryInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

final class EloquentMemberRepository implements MemberRepositoryInterface
{
    private const array COLUMNS = [
        'id',
        'full_name',
        'email',
        'phone',
        'document_number',
        'status',
        'joined_at',
        'created_at',
        'updated_at',
    ];

    public function paginate(
        PaginationQuery $query,
        ?string $search = null,
        ?MemberStatus $status = null,
    ): PaginatedResult {
        $builder = Member::query()->select(self::COLUMNS);

        if ($search !== null && trim($search) !== '') {
            $term = '%'.trim($search).'%';
            $builder->where(static function (Builder $nested) use ($term): void {
                $nested->whereLike('full_name', $term)
                    ->orWhereLike('email', $term)
                    ->orWhereLike('document_number', $term);
            });
        }

        if ($status !== null) {
            $builder->where('status', $status->value);
        }

        $paginator = $builder
            ->orderByDesc('id')
            ->paginate(perPage: $query->perPage, page: $query->page);

        return PaginatedResult::fromPaginator(
            paginator: $paginator,
            mapper: static fn (Member $member): Member => $member,
        );
    }

    public function findById(int $id): ?Member
    {
        return Member::query()->select(self::COLUMNS)->find($id);
    }

    public function findByNormalizedName(string $fullName): ?Member
    {
        return Member::query()
            ->select(self::COLUMNS)
            ->whereRaw('LOWER(full_name) = ?', [mb_strtolower($fullName)])
            ->first();
    }

    public function existsByEmail(string $email, ?int $excludeId = null): bool
    {
        $builder = Member::query()->where('email', $email);
        if ($excludeId !== null) {
            $builder->whereKeyNot($excludeId);
        }

        return $builder->exists();
    }

    public function countActive(): int
    {
        return Member::query()
            ->where('status', MemberStatus::Active->value)
            ->count();
    }

    public function save(Member $member): Member
    {
        $member->save();

        return $member->refresh();
    }

    public function delete(Member $member): void
    {
        $member->delete();
    }
}
