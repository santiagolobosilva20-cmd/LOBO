<?php

declare(strict_types=1);

namespace Modules\Billing\Infrastructure\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Modules\Billing\Application\Services\BillingService;
use Modules\Billing\Contracts\Queries\BillingSummaryQueryInterface;
use Modules\Billing\Domain\Repositories\PaymentRepositoryInterface;
use Modules\Billing\Infrastructure\Persistence\EloquentPaymentRepository;

final class BillingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PaymentRepositoryInterface::class, EloquentPaymentRepository::class);
        $this->app->bind(BillingSummaryQueryInterface::class, BillingService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');

        Route::prefix('api/v1')
            ->middleware('api')
            ->group(__DIR__.'/../../Presentation/Http/Routes/api_v1.php');
    }
}
