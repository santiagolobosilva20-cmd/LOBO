<?php

declare(strict_types=1);

namespace Modules\Members\Infrastructure\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Modules\Members\Application\Services\MemberService;
use Modules\Members\Contracts\Queries\MemberLookupInterface;
use Modules\Members\Domain\Repositories\MemberRepositoryInterface;
use Modules\Members\Infrastructure\Persistence\EloquentMemberRepository;

final class MembersServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(MemberRepositoryInterface::class, EloquentMemberRepository::class);
        $this->app->bind(MemberLookupInterface::class, MemberService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');

        Route::prefix('api/v1')
            ->middleware('api')
            ->group(__DIR__.'/../../Presentation/Http/Routes/api_v1.php');
    }
}
