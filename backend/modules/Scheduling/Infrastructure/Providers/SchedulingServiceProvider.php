<?php

declare(strict_types=1);

namespace Modules\Scheduling\Infrastructure\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Modules\Scheduling\Application\Services\ScheduleService;
use Modules\Scheduling\Contracts\Queries\ScheduleSummaryQueryInterface;
use Modules\Scheduling\Domain\Repositories\ClassSessionRepositoryInterface;
use Modules\Scheduling\Domain\Repositories\WorkoutRepositoryInterface;
use Modules\Scheduling\Infrastructure\Persistence\EloquentClassSessionRepository;
use Modules\Scheduling\Infrastructure\Persistence\EloquentWorkoutRepository;

final class SchedulingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(WorkoutRepositoryInterface::class, EloquentWorkoutRepository::class);
        $this->app->bind(ClassSessionRepositoryInterface::class, EloquentClassSessionRepository::class);
        $this->app->bind(ScheduleSummaryQueryInterface::class, ScheduleService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');

        Route::prefix('api/v1')
            ->middleware('api')
            ->group(__DIR__.'/../../Presentation/Http/Routes/api_v1.php');
    }
}
