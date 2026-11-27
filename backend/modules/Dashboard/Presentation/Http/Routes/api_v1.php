<?php

declare(strict_types=1);

namespace Modules\Dashboard\Presentation\Http\Routes;

use Illuminate\Support\Facades\Route;
use Modules\Dashboard\Presentation\Http\Controllers\DashboardSummaryController;

Route::middleware(['auth.token', 'role:admin'])->group(function (): void {
    Route::get('/dashboard/summary', DashboardSummaryController::class)
        ->name('api.v1.dashboard.summary');
});
