<?php

declare(strict_types=1);

namespace Modules\Memberships\Presentation\Http\Routes;

use Illuminate\Support\Facades\Route;
use Modules\Memberships\Presentation\Http\Controllers\MembershipController;

Route::prefix('memberships')->group(function (): void {
    Route::get('/', [MembershipController::class, 'index'])->name('api.v1.memberships.index');
    Route::post('/', [MembershipController::class, 'store'])->name('api.v1.memberships.store');
    Route::post('/{membershipId}/renew', [MembershipController::class, 'renew'])->whereNumber('membershipId')->name('api.v1.memberships.renew');
    Route::post('/{membershipId}/pause', [MembershipController::class, 'pause'])->whereNumber('membershipId')->name('api.v1.memberships.pause');
    Route::post('/{membershipId}/resume', [MembershipController::class, 'resume'])->whereNumber('membershipId')->name('api.v1.memberships.resume');
    Route::post('/{membershipId}/cancel', [MembershipController::class, 'cancel'])->whereNumber('membershipId')->name('api.v1.memberships.cancel');
});
