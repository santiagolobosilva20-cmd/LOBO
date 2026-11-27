<?php

declare(strict_types=1);

namespace Modules\Training\Infrastructure\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Modules\Training\Domain\Repositories\RoutineRepositoryInterface;
use Modules\Training\Domain\Repositories\WorkoutLogRepositoryInterface;
use Modules\Training\Infrastructure\Persistence\EloquentRoutineRepository;
use Modules\Training\Infrastructure\Persistence\EloquentWorkoutLogRepository;

final class TrainingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(RoutineRepositoryInterface::class, EloquentRoutineRepository::class);
        $this->app->bind(WorkoutLogRepositoryInterface::class, EloquentWorkoutLogRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');

        Route::prefix('api/v1')
            ->middleware('api')
            ->group(__DIR__.'/../../Presentation/Http/Routes/api_v1.php');
    }
}
