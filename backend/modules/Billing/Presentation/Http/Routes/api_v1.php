<?php

declare(strict_types=1);

namespace Modules\Billing\Presentation\Http\Routes;

use Illuminate\Support\Facades\Route;
use Modules\Billing\Presentation\Http\Controllers\PaymentController;

Route::middleware(['auth.token', 'role:admin'])
    ->prefix('payments')
    ->group(function (): void {
        Route::get('/', [PaymentController::class, 'index'])->name('api.v1.payments.index');
        Route::post('/', [PaymentController::class, 'store'])->name('api.v1.payments.store');
        Route::post('/{paymentId}/approve', [PaymentController::class, 'approve'])->whereNumber('paymentId')->name('api.v1.payments.approve');
        Route::post('/{paymentId}/reject', [PaymentController::class, 'reject'])->whereNumber('paymentId')->name('api.v1.payments.reject');
        Route::delete('/{paymentId}', [PaymentController::class, 'destroy'])->whereNumber('paymentId')->name('api.v1.payments.destroy');
    });

Route::middleware(['auth.token', 'role:member,admin'])
    ->prefix('member')
    ->group(function (): void {
        Route::get('/payments', [PaymentController::class, 'memberIndex'])->name('api.v1.member.payments.index');
        Route::post('/payment-requests', [PaymentController::class, 'memberRequestPayment'])->name('api.v1.member.payments.request');
    });
