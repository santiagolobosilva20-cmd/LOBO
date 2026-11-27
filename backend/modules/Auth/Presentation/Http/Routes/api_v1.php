<?php

declare(strict_types=1);

namespace Modules\Auth\Presentation\Http\Routes;

use Illuminate\Support\Facades\Route;
use Modules\Auth\Presentation\Http\Controllers\AuthController;

Route::prefix('auth')->group(function (): void {
    Route::get('/config', [AuthController::class, 'config'])->name('api.v1.auth.config');
    Route::post('/login', [AuthController::class, 'login'])->name('api.v1.auth.login');
    Route::post('/register', [AuthController::class, 'register'])->name('api.v1.auth.register');
    Route::post('/demo-login', [AuthController::class, 'demoLogin'])->name('api.v1.auth.demo-login');

    Route::middleware('auth.token')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me'])->name('api.v1.auth.me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.v1.auth.logout');
    });
});
