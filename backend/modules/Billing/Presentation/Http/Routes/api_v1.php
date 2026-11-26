<?php

declare(strict_types=1);

namespace Modules\Billing\Presentation\Http\Routes;

use Illuminate\Support\Facades\Route;
use Modules\Billing\Presentation\Http\Controllers\PaymentController;

Route::prefix('payments')->group(function (): void {
    Route::get('/', [PaymentController::class, 'index'])->name('api.v1.payments.index');
    Route::post('/', [PaymentController::class, 'store'])->name('api.v1.payments.store');
    Route::delete('/{paymentId}', [PaymentController::class, 'destroy'])->whereNumber('paymentId')->name('api.v1.payments.destroy');
});
