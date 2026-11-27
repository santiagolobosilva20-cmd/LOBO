<?php

declare(strict_types=1);

namespace Modules\Memberships\Presentation\Http\Requests;

use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Modules\Memberships\Application\DTOs\CreateMembershipData;

final class StoreMembershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'member_id' => ['required_without:member_name', 'nullable', 'integer', 'min:1'],
            'member_name' => ['required_without:member_id', 'nullable', 'string', 'min:2', 'max:120'],
            'plan_id' => ['required', 'integer', 'min:1'],
            'starts_at' => ['sometimes', 'nullable', 'date'],
            'auto_renew' => ['sometimes', 'boolean'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }

    public function toDto(): CreateMembershipData
    {
        /** @var array{member_id?: int|string|null, member_name?: string|null, plan_id: int|string, starts_at?: string|null, auto_renew?: bool, notes?: string|null} $validated */
        $validated = $this->validated();

        return new CreateMembershipData(
            planId: (int) $validated['plan_id'],
            memberId: isset($validated['member_id']) ? (int) $validated['member_id'] : null,
            memberName: $validated['member_name'] ?? null,
            startsAt: isset($validated['starts_at']) && $validated['starts_at'] !== ''
                ? CarbonImmutable::parse($validated['starts_at'])
                : null,
            autoRenew: (bool) ($validated['auto_renew'] ?? false),
            notes: $validated['notes'] ?? null,
        );
    }
}
