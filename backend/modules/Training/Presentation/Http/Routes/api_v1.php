<?php

declare(strict_types=1);

namespace Modules\Training\Presentation\Http\Routes;

use Illuminate\Support\Facades\Route;
use Modules\Training\Presentation\Http\Controllers\RoutineController;
use Modules\Training\Presentation\Http\Controllers\WorkoutLogController;

Route::middleware(['auth.token', 'role:admin'])->group(function (): void {
    Route::prefix('routines')->group(function (): void {
        Route::get('/', [RoutineController::class, 'index'])->name('api.v1.routines.index');
        Route::post('/', [RoutineController::class, 'store'])->name('api.v1.routines.store');
        Route::patch('/{routineId}', [RoutineController::class, 'update'])->whereNumber('routineId')->name('api.v1.routines.update');
        Route::post('/{routineId}/assign', [RoutineController::class, 'assign'])->whereNumber('routineId')->name('api.v1.routines.assign');
        Route::delete('/{routineId}', [RoutineController::class, 'destroy'])->whereNumber('routineId')->name('api.v1.routines.destroy');
    });

    Route::prefix('workout-logs')->group(function (): void {
        Route::get('/', [WorkoutLogController::class, 'index'])->name('api.v1.workout-logs.index');
        Route::post('/', [WorkoutLogController::class, 'store'])->name('api.v1.workout-logs.store');
        Route::delete('/{logId}', [WorkoutLogController::class, 'destroy'])->whereNumber('logId')->name('api.v1.workout-logs.destroy');
    });
});

Route::middleware(['auth.token', 'role:member,admin'])
    ->prefix('member')
    ->group(function (): void {
        Route::get('/routines', [RoutineController::class, 'memberIndex'])->name('api.v1.member.routines.index');
        Route::get('/workout-logs', [WorkoutLogController::class, 'memberIndex'])->name('api.v1.member.workout-logs.index');
        Route::post('/workout-logs', [WorkoutLogController::class, 'memberStore'])->name('api.v1.member.workout-logs.store');
        Route::delete('/workout-logs/{logId}', [WorkoutLogController::class, 'memberDestroy'])->whereNumber('logId')->name('api.v1.member.workout-logs.destroy');
    });
