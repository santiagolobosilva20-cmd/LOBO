<?php

declare(strict_types=1);

namespace Modules\Dashboard\Infrastructure\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

final class DashboardServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Route::prefix('api/v1')
            ->middleware('api')
            ->group(__DIR__.'/../../Presentation/Http/Routes/api_v1.php');
    }
}
