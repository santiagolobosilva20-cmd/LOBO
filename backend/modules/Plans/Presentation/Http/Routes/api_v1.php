<?php

declare(strict_types=1);

namespace Modules\Plans\Presentation\Http\Routes;

use Illuminate\Support\Facades\Route;
use Modules\Plans\Presentation\Http\Controllers\PlanController;

Route::prefix('plans')->group(function (): void {
    Route::get('/', [PlanController::class, 'index'])->name('api.v1.plans.index');
    Route::post('/', [PlanController::class, 'store'])->name('api.v1.plans.store');
    Route::get('/{planId}', [PlanController::class, 'show'])->whereNumber('planId')->name('api.v1.plans.show');
    Route::patch('/{planId}', [PlanController::class, 'update'])->whereNumber('planId')->name('api.v1.plans.update');
    Route::delete('/{planId}', [PlanController::class, 'destroy'])->whereNumber('planId')->name('api.v1.plans.destroy');
});
