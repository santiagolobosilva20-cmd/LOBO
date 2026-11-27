<?php

declare(strict_types=1);

namespace Modules\Nutrition\Presentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Nutrition\Application\DTOs\MealEntryInputData;
use Modules\Nutrition\Application\DTOs\SaveNutritionPlanData;
use Modules\Nutrition\Domain\Enums\MealSlot;
use Modules\Nutrition\Domain\Enums\NutritionGoal;

final class SaveNutritionPlanRequest extends FormRequest
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
            'title' => ['required', 'string', 'min:2', 'max:120'],
            'goal' => ['required', 'string', Rule::in(NutritionGoal::values())],
            'daily_calories' => ['required', 'integer', 'min:800', 'max:8000'],
            'protein_grams' => ['required', 'integer', 'min:20', 'max:600'],
            'carbs_grams' => ['required', 'integer', 'min:10', 'max:900'],
            'fats_grams' => ['required', 'integer', 'min:10', 'max:350'],
            'water_liters' => ['sometimes', 'numeric', 'min:0.5', 'max:10'],
            'is_template' => ['sometimes', 'boolean'],
            'member_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'member_name' => ['sometimes', 'nullable', 'string', 'min:2', 'max:120'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'meals' => ['sometimes', 'array', 'max:20'],
            'meals.*.meal_slot' => ['required', 'string', Rule::in(MealSlot::values())],
            'meals.*.title' => ['required', 'string', 'min:1', 'max:120'],
            'meals.*.foods_summary' => ['required', 'string', 'min:1', 'max:1000'],
            'meals.*.calories' => ['sometimes', 'integer', 'min:0', 'max:5000'],
            'meals.*.protein_grams' => ['sometimes', 'integer', 'min:0', 'max:400'],
            'meals.*.carbs_grams' => ['sometimes', 'integer', 'min:0', 'max:500'],
            'meals.*.fats_grams' => ['sometimes', 'integer', 'min:0', 'max:250'],
            'meals.*.sort_order' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ];
    }

    public function toDto(): SaveNutritionPlanData
    {
        /**
         * @var array{
         *   title: string,
         *   goal: string,
         *   daily_calories: int|string,
         *   protein_grams: int|string,
         *   carbs_grams: int|string,
         *   fats_grams: int|string,
         *   water_liters?: float|int|string,
         *   is_template?: bool,
         *   member_id?: int|string|null,
         *   member_name?: string|null,
         *   notes?: string|null,
         *   meals?: list<array{meal_slot: string, title: string, foods_summary: string, calories?: int|string, protein_grams?: int|string, carbs_grams?: int|string, fats_grams?: int|string, sort_order?: int|string}>
         * } $validated
         */
        $validated = $this->validated();

        $meals = [];
        foreach ($validated['meals'] ?? [] as $index => $row) {
            $meals[] = new MealEntryInputData(
                mealSlot: MealSlot::from($row['meal_slot']),
                title: $row['title'],
                foodsSummary: $row['foods_summary'],
                calories: isset($row['calories']) ? (int) $row['calories'] : 0,
                proteinGrams: isset($row['protein_grams']) ? (int) $row['protein_grams'] : 0,
                carbsGrams: isset($row['carbs_grams']) ? (int) $row['carbs_grams'] : 0,
                fatsGrams: isset($row['fats_grams']) ? (int) $row['fats_grams'] : 0,
                sortOrder: isset($row['sort_order']) ? (int) $row['sort_order'] : ($index + 1),
            );
        }

        return new SaveNutritionPlanData(
            title: $validated['title'],
            goal: NutritionGoal::from($validated['goal']),
            dailyCalories: (int) $validated['daily_calories'],
            proteinGrams: (int) $validated['protein_grams'],
            carbsGrams: (int) $validated['carbs_grams'],
            fatsGrams: (int) $validated['fats_grams'],
            waterLiters: isset($validated['water_liters']) ? (float) $validated['water_liters'] : 2.5,
            isTemplate: (bool) ($validated['is_template'] ?? true),
            memberId: isset($validated['member_id']) ? (int) $validated['member_id'] : null,
            memberName: $validated['member_name'] ?? null,
            notes: $validated['notes'] ?? null,
            meals: $meals,
        );
    }
}
