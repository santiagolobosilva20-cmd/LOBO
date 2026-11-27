<?php

declare(strict_types=1);

namespace Modules\Nutrition\Infrastructure\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Modules\Nutrition\Domain\Repositories\NutritionPlanRepositoryInterface;
use Modules\Nutrition\Infrastructure\Persistence\EloquentNutritionPlanRepository;

final class NutritionServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(NutritionPlanRepositoryInterface::class, EloquentNutritionPlanRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');

        Route::prefix('api/v1')
            ->middleware('api')
            ->group(__DIR__.'/../../Presentation/Http/Routes/api_v1.php');
    }
}
