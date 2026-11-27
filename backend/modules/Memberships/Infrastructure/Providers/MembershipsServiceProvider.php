<?php

declare(strict_types=1);

namespace Modules\Memberships\Infrastructure\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Modules\Billing\Contracts\Events\PaymentRecorded;
use Modules\Memberships\Application\Listeners\ActivateMembershipOnPaymentRecorded;
use Modules\Memberships\Application\Services\MembershipService;
use Modules\Memberships\Contracts\Queries\MembershipSummaryQueryInterface;
use Modules\Memberships\Domain\Repositories\MembershipRepositoryInterface;
use Modules\Memberships\Infrastructure\Persistence\EloquentMembershipRepository;

final class MembershipsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(MembershipRepositoryInterface::class, EloquentMembershipRepository::class);
        $this->app->bind(MembershipSummaryQueryInterface::class, MembershipService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');

        Event::listen(PaymentRecorded::class, ActivateMembershipOnPaymentRecorded::class);

        Route::prefix('api/v1')
            ->middleware('api')
            ->group(__DIR__.'/../../Presentation/Http/Routes/api_v1.php');
    }
}
