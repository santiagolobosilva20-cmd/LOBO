<?php

declare(strict_types=1);

namespace Modules\Plans\Application\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Plans\Application\DTOs\CreatePlanData;
use Modules\Plans\Application\DTOs\ListPlansFilterData;
use Modules\Plans\Application\DTOs\UpdatePlanData;
use Modules\Plans\Contracts\DTOs\PlanSummaryData;
use Modules\Plans\Contracts\Queries\PlanLookupInterface;
use Modules\Plans\Domain\Models\Plan;
use Modules\Plans\Domain\Repositories\PlanRepositoryInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Domain\Exceptions\ConflictException;
use Modules\Shared\Domain\Exceptions\ResourceNotFoundException;
use Modules\Shared\Domain\ValueObjects\Money;

final readonly class PlanService implements PlanLookupInterface
{
    public function __construct(
        private PlanRepositoryInterface $plans,
    ) {}

    /**
     * @return PaginatedResult<PlanSummaryData>
     */
    #[\NoDiscard]
    public function list(ListPlansFilterData $filter): PaginatedResult
    {
        $paginated = $this->plans->paginate(
            query: $filter->pagination,
            activeOnly: $filter->activeOnly,
        );

        return new PaginatedResult(
            items: array_map(
                fn (Plan $plan): PlanSummaryData => $this->toSummary($plan),
                $paginated->items,
            ),
            currentPage: $paginated->currentPage,
            perPage: $paginated->perPage,
            total: $paginated->total,
            lastPage: $paginated->lastPage,
        );
    }

    #[\NoDiscard]
    public function getById(int $id): PlanSummaryData
    {
        $plan = $this->plans->findById($id);
        if ($plan === null) {
            throw new ResourceNotFoundException('Plan', $id);
        }

        return $this->toSummary($plan);
    }

    public function findSummaryById(int $planId): ?PlanSummaryData
    {
        $plan = $this->plans->findById($planId);

        return $plan !== null ? $this->toSummary($plan) : null;
    }

    #[\NoDiscard]
    public function create(CreatePlanData $data): PlanSummaryData
    {
        $normalizedName = trim((string) preg_replace('/\s+/', ' ', $data->name));
        $slug = Str::slug($normalizedName);
        $money = new Money($data->priceCents);

        return DB::transaction(function () use ($normalizedName, $slug, $money, $data): PlanSummaryData {
            if ($this->plans->existsBySlug($slug)) {
                throw new ConflictException(
                    message: sprintf('A plan named [%s] already exists.', $normalizedName),
                    errors: ['name' => ['The plan name is already registered.']],
                );
            }

            $plan = new Plan([
                'name' => $normalizedName,
                'slug' => $slug,
                'tagline' => $data->tagline,
                'price_cents' => $money->amountCents,
                'duration_days' => $data->durationDays,
                'billing_period_label' => trim($data->billingPeriodLabel),
                'description' => $data->description !== null ? trim($data->description) : null,
                'features' => $data->features,
                'is_featured' => $data->isFeatured,
                'is_active' => $data->isActive,
            ]);

            return $this->toSummary($this->plans->save($plan));
        });
    }

    #[\NoDiscard]
    public function update(int $id, UpdatePlanData $data): PlanSummaryData
    {
        return DB::transaction(function () use ($id, $data): PlanSummaryData {
            $plan = $this->plans->findById($id);
            if ($plan === null) {
                throw new ResourceNotFoundException('Plan', $id);
            }

            if ($data->name !== null) {
                $normalizedName = trim((string) preg_replace('/\s+/', ' ', $data->name));
                $slug = Str::slug($normalizedName);

                if ($this->plans->existsBySlug($slug, excludeId: $plan->id)) {
                    throw new ConflictException(
                        message: sprintf('A plan named [%s] already exists.', $normalizedName),
                        errors: ['name' => ['The plan name is already registered.']],
                    );
                }

                $plan->name = $normalizedName;
                $plan->slug = $slug;
            }

            if ($data->priceCents !== null) {
                $plan->price_cents = (new Money($data->priceCents))->amountCents;
            }

            if ($data->durationDays !== null) {
                $plan->duration_days = $data->durationDays;
            }

            if ($data->hasDescription) {
                $plan->description = $data->description !== null ? trim($data->description) : null;
            }

            if ($data->isActive !== null) {
                $plan->is_active = $data->isActive;
            }

            return $this->toSummary($this->plans->save($plan));
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id): void {
            $plan = $this->plans->findById($id);
            if ($plan === null) {
                throw new ResourceNotFoundException('Plan', $id);
            }

            $this->plans->delete($plan);
        });
    }

    private function toSummary(Plan $plan): PlanSummaryData
    {
        /** @var list<string> $features */
        $features = is_array($plan->features) ? array_values($plan->features) : [];

        return new PlanSummaryData(
            id: $plan->id,
            name: $plan->name,
            slug: $plan->slug,
            tagline: $plan->tagline,
            priceCents: $plan->price_cents,
            formattedPrice: (new Money($plan->price_cents))->formattedWholeOrDecimal(),
            durationDays: $plan->duration_days,
            billingPeriodLabel: $plan->billing_period_label,
            description: $plan->description,
            features: $features,
            isFeatured: $plan->is_featured,
            isActive: $plan->is_active,
            createdAt: $plan->created_at?->toIso8601String(),
            updatedAt: $plan->updated_at?->toIso8601String(),
        );
    }
}
