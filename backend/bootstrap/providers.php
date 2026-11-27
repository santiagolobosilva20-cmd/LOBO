<?php

declare(strict_types=1);

use App\Providers\AppServiceProvider;
use Modules\Auth\Infrastructure\Providers\AuthServiceProvider;
use Modules\Billing\Infrastructure\Providers\BillingServiceProvider;
use Modules\Dashboard\Infrastructure\Providers\DashboardServiceProvider;
use Modules\Members\Infrastructure\Providers\MembersServiceProvider;
use Modules\Memberships\Infrastructure\Providers\MembershipsServiceProvider;
use Modules\Nutrition\Infrastructure\Providers\NutritionServiceProvider;
use Modules\Plans\Infrastructure\Providers\PlansServiceProvider;
use Modules\Scheduling\Infrastructure\Providers\SchedulingServiceProvider;
use Modules\Shared\Infrastructure\Providers\SharedServiceProvider;
use Modules\Training\Infrastructure\Providers\TrainingServiceProvider;

return [
    AppServiceProvider::class,
    SharedServiceProvider::class,
    MembersServiceProvider::class,
    AuthServiceProvider::class,
    PlansServiceProvider::class,
    BillingServiceProvider::class,
    MembershipsServiceProvider::class,
    SchedulingServiceProvider::class,
    TrainingServiceProvider::class,
    NutritionServiceProvider::class,
    DashboardServiceProvider::class,
];
