<?php

declare(strict_types=1);

namespace Modules\Scheduling\Presentation\Http\Routes;

use Illuminate\Support\Facades\Route;
use Modules\Scheduling\Presentation\Http\Controllers\ClassSessionController;
use Modules\Scheduling\Presentation\Http\Controllers\WorkoutController;

Route::prefix('workouts')->middleware('auth.token')->group(function (): void {
    Route::get('/', [WorkoutController::class, 'index'])->name('api.v1.workouts.index');

    Route::middleware('role:admin')->group(function (): void {
        Route::post('/', [WorkoutController::class, 'store'])->name('api.v1.workouts.store');
        Route::patch('/{workoutId}', [WorkoutController::class, 'update'])->whereNumber('workoutId')->name('api.v1.workouts.update');
        Route::delete('/{workoutId}', [WorkoutController::class, 'destroy'])->whereNumber('workoutId')->name('api.v1.workouts.destroy');
    });
});

Route::prefix('schedule/sessions')->middleware('auth.token')->group(function (): void {
    Route::get('/', [ClassSessionController::class, 'index'])->name('api.v1.schedule.sessions.index');

    Route::middleware('role:admin')->group(function (): void {
        Route::post('/', [ClassSessionController::class, 'store'])->name('api.v1.schedule.sessions.store');
        Route::post('/{sessionId}/enroll', [ClassSessionController::class, 'enroll'])->whereNumber('sessionId')->name('api.v1.schedule.sessions.enroll');
        Route::delete('/{sessionId}', [ClassSessionController::class, 'destroy'])->whereNumber('sessionId')->name('api.v1.schedule.sessions.destroy');
    });
});

Route::middleware(['auth.token', 'role:member,admin'])
    ->prefix('member/schedule/sessions')
    ->group(function (): void {
        Route::get('/', [ClassSessionController::class, 'memberIndex'])->name('api.v1.member.schedule.index');
        Route::post('/{sessionId}/book', [ClassSessionController::class, 'memberBook'])->whereNumber('sessionId')->name('api.v1.member.schedule.book');
        Route::delete('/{sessionId}/book', [ClassSessionController::class, 'memberCancelBooking'])->whereNumber('sessionId')->name('api.v1.member.schedule.cancel');
    });
