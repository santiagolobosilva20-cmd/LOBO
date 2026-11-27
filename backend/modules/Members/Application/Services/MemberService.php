<?php

declare(strict_types=1);

namespace Modules\Members\Application\Services;

use Illuminate\Support\Facades\DB;
use Modules\Members\Application\DTOs\CreateMemberData;
use Modules\Members\Application\DTOs\ListMembersFilterData;
use Modules\Members\Application\DTOs\UpdateMemberData;
use Modules\Members\Contracts\DTOs\MemberSummaryData;
use Modules\Members\Contracts\Queries\MemberLookupInterface;
use Modules\Members\Domain\Enums\MemberStatus;
use Modules\Members\Domain\Models\Member;
use Modules\Members\Domain\Repositories\MemberRepositoryInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Domain\Exceptions\ConflictException;
use Modules\Shared\Domain\Exceptions\ResourceNotFoundException;

final readonly class MemberService implements MemberLookupInterface
{
    public function __construct(
        private MemberRepositoryInterface $members,
    ) {}

    /**
     * @return PaginatedResult<MemberSummaryData>
     */
    #[\NoDiscard]
    public function list(ListMembersFilterData $filter): PaginatedResult
    {
        $paginated = $this->members->paginate(
            query: $filter->pagination,
            search: $filter->search,
            status: $filter->status,
        );

        return new PaginatedResult(
            items: array_map(
                fn (Member $member): MemberSummaryData => $this->toSummary($member),
                $paginated->items,
            ),
            currentPage: $paginated->currentPage,
            perPage: $paginated->perPage,
            total: $paginated->total,
            lastPage: $paginated->lastPage,
        );
    }

    #[\NoDiscard]
    public function getById(int $id): MemberSummaryData
    {
        $member = $this->members->findById($id);
        if ($member === null) {
            throw new ResourceNotFoundException('Member', $id);
        }

        return $this->toSummary($member);
    }

    public function findSummaryById(int $memberId): ?MemberSummaryData
    {
        $member = $this->members->findById($memberId);

        return $member !== null ? $this->toSummary($member) : null;
    }

    public function findOrCreateByName(string $fullName): MemberSummaryData
    {
        $normalizedName = $this->normalizeName($fullName);

        return DB::transaction(function () use ($normalizedName): MemberSummaryData {
            $existing = $this->members->findByNormalizedName($normalizedName);
            if ($existing !== null) {
                return $this->toSummary($existing);
            }

            $member = new Member([
                'full_name' => $normalizedName,
                'email' => null,
                'phone' => null,
                'document_number' => null,
                'status' => MemberStatus::Active,
                'joined_at' => now()->toDateString(),
            ]);

            return $this->toSummary($this->members->save($member));
        });
    }

    public function findOrCreateByEmailAndName(string $email, string $fullName): MemberSummaryData
    {
        $normalizedEmail = mb_strtolower(trim($email));
        $normalizedName = $this->normalizeName($fullName);

        return DB::transaction(function () use ($normalizedEmail, $normalizedName): MemberSummaryData {
            $byEmail = $this->members->findByEmail($normalizedEmail);
            if ($byEmail !== null) {
                return $this->toSummary($byEmail);
            }

            $byName = $this->members->findByNormalizedName($normalizedName);
            if ($byName !== null && $byName->email === null) {
                $byName->email = $normalizedEmail;

                return $this->toSummary($this->members->save($byName));
            }

            $member = new Member([
                'full_name' => $normalizedName,
                'email' => $normalizedEmail,
                'phone' => null,
                'document_number' => null,
                'status' => MemberStatus::Active,
                'joined_at' => now()->toDateString(),
            ]);

            return $this->toSummary($this->members->save($member));
        });
    }

    public function countActive(): int
    {
        return $this->members->countActive();
    }

    #[\NoDiscard]
    public function create(CreateMemberData $data): MemberSummaryData
    {
        $normalizedName = $this->normalizeName($data->fullName);
        $normalizedEmail = $data->email !== null && trim($data->email) !== ''
            ? strtolower(trim($data->email))
            : null;

        return DB::transaction(function () use ($normalizedName, $normalizedEmail, $data): MemberSummaryData {
            if ($normalizedEmail !== null && $this->members->existsByEmail($normalizedEmail)) {
                throw new ConflictException(
                    message: sprintf('A member with email [%s] already exists.', $normalizedEmail),
                    errors: ['email' => ['The email address is already registered.']],
                );
            }

            $member = new Member([
                'full_name' => $normalizedName,
                'email' => $normalizedEmail,
                'phone' => $data->phone !== null ? trim($data->phone) : null,
                'document_number' => $data->documentNumber !== null ? trim($data->documentNumber) : null,
                'status' => $data->status,
                'joined_at' => $data->joinedAt ?? now()->toDateString(),
            ]);

            return $this->toSummary($this->members->save($member));
        });
    }

    #[\NoDiscard]
    public function update(int $id, UpdateMemberData $data): MemberSummaryData
    {
        return DB::transaction(function () use ($id, $data): MemberSummaryData {
            $member = $this->members->findById($id);
            if ($member === null) {
                throw new ResourceNotFoundException('Member', $id);
            }

            if ($data->fullName !== null) {
                $member->full_name = $this->normalizeName($data->fullName);
            }

            if ($data->email !== null) {
                $normalizedEmail = strtolower(trim($data->email));
                if ($this->members->existsByEmail($normalizedEmail, excludeId: $member->id)) {
                    throw new ConflictException(
                        message: sprintf('A member with email [%s] already exists.', $normalizedEmail),
                        errors: ['email' => ['The email address is already registered.']],
                    );
                }
                $member->email = $normalizedEmail;
            }

            if ($data->hasPhone) {
                $member->phone = $data->phone !== null ? trim($data->phone) : null;
            }

            if ($data->hasDocumentNumber) {
                $member->document_number = $data->documentNumber !== null ? trim($data->documentNumber) : null;
            }

            if ($data->status !== null) {
                $member->status = $data->status;
            }

            return $this->toSummary($this->members->save($member));
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id): void {
            $member = $this->members->findById($id);
            if ($member === null) {
                throw new ResourceNotFoundException('Member', $id);
            }

            $this->members->delete($member);
        });
    }

    private function normalizeName(string $rawName): string
    {
        return $rawName
            |> trim(...)
            |> (static fn (string $text): string => (string) preg_replace('/\s+/', ' ', $text));
    }

    private function toSummary(Member $member): MemberSummaryData
    {
        return new MemberSummaryData(
            id: $member->id,
            fullName: $member->full_name,
            email: $member->email,
            phone: $member->phone,
            documentNumber: $member->document_number,
            status: $member->status->value,
            joinedAt: $member->joined_at->toDateString(),
            createdAt: $member->created_at?->toIso8601String(),
            updatedAt: $member->updated_at?->toIso8601String(),
        );
    }
}
