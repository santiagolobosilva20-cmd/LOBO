<?php

declare(strict_types=1);

use App\Providers\AppServiceProvider;
use Modules\Billing\Infrastructure\Providers\BillingServiceProvider;
use Modules\Dashboard\Infrastructure\Providers\DashboardServiceProvider;
use Modules\Members\Infrastructure\Providers\MembersServiceProvider;
use Modules\Plans\Infrastructure\Providers\PlansServiceProvider;
use Modules\Scheduling\Infrastructure\Providers\SchedulingServiceProvider;
use Modules\Shared\Infrastructure\Providers\SharedServiceProvider;

return [
    AppServiceProvider::class,
    SharedServiceProvider::class,
    MembersServiceProvider::class,
    PlansServiceProvider::class,
    BillingServiceProvider::class,
    SchedulingServiceProvider::class,
    DashboardServiceProvider::class,
];
