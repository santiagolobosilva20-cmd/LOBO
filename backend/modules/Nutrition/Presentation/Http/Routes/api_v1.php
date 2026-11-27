<?php

declare(strict_types=1);

namespace Modules\Nutrition\Presentation\Http\Routes;

use Illuminate\Support\Facades\Route;
use Modules\Nutrition\Presentation\Http\Controllers\NutritionPlanController;

Route::prefix('nutrition/plans')->group(function (): void {
    Route::get('/', [NutritionPlanController::class, 'index'])->name('api.v1.nutrition.plans.index');
    Route::post('/', [NutritionPlanController::class, 'store'])->name('api.v1.nutrition.plans.store');
    Route::patch('/{planId}', [NutritionPlanController::class, 'update'])->whereNumber('planId')->name('api.v1.nutrition.plans.update');
    Route::post('/{planId}/assign', [NutritionPlanController::class, 'assign'])->whereNumber('planId')->name('api.v1.nutrition.plans.assign');
    Route::delete('/{planId}', [NutritionPlanController::class, 'destroy'])->whereNumber('planId')->name('api.v1.nutrition.plans.destroy');
});
