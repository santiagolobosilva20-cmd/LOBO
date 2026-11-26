<?php

declare(strict_types=1);

namespace Modules\Shared\Presentation\Http\Routes;

use Illuminate\Support\Facades\Route;
use Modules\Shared\Presentation\Http\Controllers\HealthCheckController;

Route::get('/healthz', HealthCheckController::class)
    ->name('api.v1.healthz');
