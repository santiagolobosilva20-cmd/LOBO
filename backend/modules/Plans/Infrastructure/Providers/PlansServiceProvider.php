<?php

declare(strict_types=1);

namespace Modules\Plans\Infrastructure\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Modules\Plans\Application\Services\PlanService;
use Modules\Plans\Contracts\Queries\PlanLookupInterface;
use Modules\Plans\Domain\Repositories\PlanRepositoryInterface;
use Modules\Plans\Infrastructure\Persistence\EloquentPlanRepository;

final class PlansServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PlanRepositoryInterface::class, EloquentPlanRepository::class);
        $this->app->bind(PlanLookupInterface::class, PlanService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');

        Route::prefix('api/v1')
            ->middleware('api')
            ->group(__DIR__.'/../../Presentation/Http/Routes/api_v1.php');
    }
}
