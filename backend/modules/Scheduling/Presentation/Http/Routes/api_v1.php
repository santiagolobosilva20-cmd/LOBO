<?php

declare(strict_types=1);

namespace Modules\Scheduling\Presentation\Http\Routes;

use Illuminate\Support\Facades\Route;
use Modules\Scheduling\Presentation\Http\Controllers\ClassSessionController;
use Modules\Scheduling\Presentation\Http\Controllers\WorkoutController;

Route::prefix('workouts')->group(function (): void {
    Route::get('/', [WorkoutController::class, 'index'])->name('api.v1.workouts.index');
    Route::post('/', [WorkoutController::class, 'store'])->name('api.v1.workouts.store');
    Route::patch('/{workoutId}', [WorkoutController::class, 'update'])->whereNumber('workoutId')->name('api.v1.workouts.update');
    Route::delete('/{workoutId}', [WorkoutController::class, 'destroy'])->whereNumber('workoutId')->name('api.v1.workouts.destroy');
});

Route::prefix('schedule/sessions')->group(function (): void {
    Route::get('/', [ClassSessionController::class, 'index'])->name('api.v1.schedule.sessions.index');
    Route::post('/', [ClassSessionController::class, 'store'])->name('api.v1.schedule.sessions.store');
    Route::post('/{sessionId}/enroll', [ClassSessionController::class, 'enroll'])->whereNumber('sessionId')->name('api.v1.schedule.sessions.enroll');
    Route::delete('/{sessionId}', [ClassSessionController::class, 'destroy'])->whereNumber('sessionId')->name('api.v1.schedule.sessions.destroy');
});
