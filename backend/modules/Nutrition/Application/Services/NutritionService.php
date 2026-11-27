<?php

declare(strict_types=1);

namespace Modules\Nutrition\Application\Services;

use Illuminate\Support\Facades\DB;
use Modules\Members\Contracts\DTOs\MemberSummaryData;
use Modules\Members\Contracts\Queries\MemberLookupInterface;
use Modules\Nutrition\Application\DTOs\ListNutritionPlansFilterData;
use Modules\Nutrition\Application\DTOs\MealEntryInputData;
use Modules\Nutrition\Application\DTOs\SaveNutritionPlanData;
use Modules\Nutrition\Contracts\DTOs\MealEntryData;
use Modules\Nutrition\Contracts\DTOs\NutritionPlanSummaryData;
use Modules\Nutrition\Domain\Models\MealEntry;
use Modules\Nutrition\Domain\Models\NutritionPlan;
use Modules\Nutrition\Domain\Repositories\NutritionPlanRepositoryInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Domain\Exceptions\ConflictException;
use Modules\Shared\Domain\Exceptions\ResourceNotFoundException;

final readonly class NutritionService
{
    public function __construct(
        private NutritionPlanRepositoryInterface $plans,
        private MemberLookupInterface $memberLookup,
    ) {}

    /**
     * @return PaginatedResult<NutritionPlanSummaryData>
     */
    #[\NoDiscard]
    public function list(ListNutritionPlansFilterData $filter): PaginatedResult
    {
        $paginated = $this->plans->paginate(
            query: $filter->pagination,
            goal: $filter->goal,
            isTemplate: $filter->isTemplate,
            memberId: $filter->memberId,
            search: $filter->search,
        );

        return new PaginatedResult(
            items: array_map(
                fn (NutritionPlan $plan): NutritionPlanSummaryData => $this->toSummary($plan),
                $paginated->items,
            ),
            currentPage: $paginated->currentPage,
            perPage: $paginated->perPage,
            total: $paginated->total,
            lastPage: $paginated->lastPage,
        );
    }

    #[\NoDiscard]
    public function create(SaveNutritionPlanData $data): NutritionPlanSummaryData
    {
        return DB::transaction(function () use ($data): NutritionPlanSummaryData {
            $member = $this->resolveOptionalMember($data->memberId, $data->memberName);
            $plan = new NutritionPlan;
            $this->fillPlan($plan, $data, $member);

            return $this->toSummary($this->plans->saveWithMeals($plan, $this->normalizeMeals($data->meals)));
        });
    }

    #[\NoDiscard]
    public function update(int $id, SaveNutritionPlanData $data): NutritionPlanSummaryData
    {
        return DB::transaction(function () use ($id, $data): NutritionPlanSummaryData {
            $plan = $this->requirePlan($id);
            $member = $this->resolveOptionalMember($data->memberId, $data->memberName);
            $this->fillPlan($plan, $data, $member);

            return $this->toSummary($this->plans->saveWithMeals($plan, $this->normalizeMeals($data->meals)));
        });
    }

    #[\NoDiscard]
    public function assignToMember(int $planId, ?int $memberId, ?string $memberName): NutritionPlanSummaryData
    {
        return DB::transaction(function () use ($planId, $memberId, $memberName): NutritionPlanSummaryData {
            $source = $this->requirePlan($planId);
            $member = $this->resolveRequiredMember($memberId, $memberName);

            $assigned = new NutritionPlan([
                'member_id' => $member->id,
                'member_name_snapshot' => $member->fullName,
                'title' => $source->title,
                'goal' => $source->goal,
                'daily_calories' => $source->daily_calories,
                'protein_grams' => $source->protein_grams,
                'carbs_grams' => $source->carbs_grams,
                'fats_grams' => $source->fats_grams,
                'water_liters' => $source->water_liters,
                'is_template' => false,
                'notes' => $source->notes,
            ]);

            $mealRows = [];
            foreach ($source->meals as $idx => $meal) {
                $mealRows[] = [
                    'meal_slot' => $meal->meal_slot->value,
                    'title' => $meal->title,
                    'foods_summary' => $meal->foods_summary,
                    'calories' => $meal->calories,
                    'protein_grams' => $meal->protein_grams,
                    'carbs_grams' => $meal->carbs_grams,
                    'fats_grams' => $meal->fats_grams,
                    'sort_order' => $idx + 1,
                ];
            }

            return $this->toSummary($this->plans->saveWithMeals($assigned, $mealRows));
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id): void {
            $this->plans->delete($this->requirePlan($id));
        });
    }

    private function requirePlan(int $id): NutritionPlan
    {
        $plan = $this->plans->findByIdWithMeals($id);
        if ($plan === null) {
            throw new ResourceNotFoundException('NutritionPlan', $id);
        }

        return $plan;
    }

    private function fillPlan(NutritionPlan $plan, SaveNutritionPlanData $data, ?MemberSummaryData $member): void
    {
        $plan->fill([
            'member_id' => $member?->id,
            'member_name_snapshot' => $member?->fullName,
            'title' => trim($data->title),
            'goal' => $data->goal,
            'daily_calories' => max(800, min(8000, $data->dailyCalories)),
            'protein_grams' => max(20, min(600, $data->proteinGrams)),
            'carbs_grams' => max(10, min(900, $data->carbsGrams)),
            'fats_grams' => max(10, min(350, $data->fatsGrams)),
            'water_liters' => max(0.5, min(10.0, $data->waterLiters)),
            'is_template' => $member === null && $data->isTemplate,
            'notes' => $data->notes !== null && trim($data->notes) !== '' ? trim($data->notes) : null,
        ]);
    }

    /**
     * @param  list<MealEntryInputData>  $meals
     * @return list<array{meal_slot: string, title: string, foods_summary: string, calories: int, protein_grams: int, carbs_grams: int, fats_grams: int, sort_order: int}>
     */
    private function normalizeMeals(array $meals): array
    {
        $rows = [];
        foreach ($meals as $idx => $item) {
            $rows[] = [
                'meal_slot' => $item->mealSlot->value,
                'title' => trim($item->title),
                'foods_summary' => trim($item->foodsSummary),
                'calories' => max(0, $item->calories),
                'protein_grams' => max(0, $item->proteinGrams),
                'carbs_grams' => max(0, $item->carbsGrams),
                'fats_grams' => max(0, $item->fatsGrams),
                'sort_order' => $item->sortOrder > 0 ? $item->sortOrder : ($idx + 1),
            ];
        }

        return $rows;
    }

    private function resolveOptionalMember(?int $memberId, ?string $memberName): ?MemberSummaryData
    {
        if ($memberId === null && ($memberName === null || trim($memberName) === '')) {
            return null;
        }

        return $this->resolveRequiredMember($memberId, $memberName);
    }

    private function resolveRequiredMember(?int $memberId, ?string $memberName): MemberSummaryData
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
                errors: ['member_name' => ['Debes indicar el nombre o ID del socio.']],
            );
        }

        return $this->memberLookup->findOrCreateByName($trimmed);
    }

    private function toSummary(NutritionPlan $plan): NutritionPlanSummaryData
    {
        $meals = [];
        foreach ($plan->meals as $meal) {
            /** @var MealEntry $meal */
            $meals[] = new MealEntryData(
                id: $meal->id,
                mealSlot: $meal->meal_slot->value,
                title: $meal->title,
                foodsSummary: $meal->foods_summary,
                calories: $meal->calories,
                proteinGrams: $meal->protein_grams,
                carbsGrams: $meal->carbs_grams,
                fatsGrams: $meal->fats_grams,
                sortOrder: $meal->sort_order,
            );
        }

        return new NutritionPlanSummaryData(
            id: $plan->id,
            memberId: $plan->member_id,
            memberName: $plan->member_name_snapshot,
            title: $plan->title,
            goal: $plan->goal->value,
            dailyCalories: $plan->daily_calories,
            proteinGrams: $plan->protein_grams,
            carbsGrams: $plan->carbs_grams,
            fatsGrams: $plan->fats_grams,
            waterLiters: $plan->water_liters,
            isTemplate: $plan->is_template,
            notes: $plan->notes,
            meals: $meals,
            createdAt: $plan->created_at?->toIso8601String(),
        );
    }
}
