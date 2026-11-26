<?php

declare(strict_types=1);

namespace Modules\Members\Presentation\Http\Routes;

use Illuminate\Support\Facades\Route;
use Modules\Members\Presentation\Http\Controllers\MemberController;

Route::prefix('members')->group(function (): void {
    Route::get('/', [MemberController::class, 'index'])->name('api.v1.members.index');
    Route::post('/', [MemberController::class, 'store'])->name('api.v1.members.store');
    Route::get('/{memberId}', [MemberController::class, 'show'])->whereNumber('memberId')->name('api.v1.members.show');
    Route::patch('/{memberId}', [MemberController::class, 'update'])->whereNumber('memberId')->name('api.v1.members.update');
    Route::delete('/{memberId}', [MemberController::class, 'destroy'])->whereNumber('memberId')->name('api.v1.members.destroy');
});
