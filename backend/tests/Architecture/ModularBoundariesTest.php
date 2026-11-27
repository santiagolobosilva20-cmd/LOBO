<?php

declare(strict_types=1);

arch('all module classes declare strict types')
    ->expect('Modules')
    ->toUseStrictTypes();

arch('shared module does not depend on business modules')
    ->expect('Modules\Shared')
    ->not->toUse([
        'Modules\Auth',
        'Modules\Members',
        'Modules\Plans',
        'Modules\Billing',
        'Modules\Memberships',
        'Modules\Scheduling',
        'Modules\Training',
        'Modules\Nutrition',
        'Modules\Dashboard',
    ]);

arch('auth only consumes members contracts')
    ->expect('Modules\Auth')
    ->not->toUse([
        'Modules\Members\Domain',
        'Modules\Members\Application',
        'Modules\Members\Infrastructure',
        'Modules\Members\Presentation',
        'Modules\Plans',
        'Modules\Billing',
        'Modules\Memberships',
        'Modules\Scheduling',
        'Modules\Training',
        'Modules\Nutrition',
        'Modules\Dashboard',
    ]);

arch('members module is isolated from peer business modules')
    ->expect('Modules\Members')
    ->not->toUse([
        'Modules\Auth',
        'Modules\Plans',
        'Modules\Billing',
        'Modules\Memberships',
        'Modules\Scheduling',
        'Modules\Training',
        'Modules\Nutrition',
        'Modules\Dashboard',
    ]);

arch('plans module is isolated from peer business modules')
    ->expect('Modules\Plans')
    ->not->toUse([
        'Modules\Auth',
        'Modules\Members',
        'Modules\Billing',
        'Modules\Memberships',
        'Modules\Scheduling',
        'Modules\Training',
        'Modules\Nutrition',
        'Modules\Dashboard',
    ]);

arch('scheduling module is isolated from peer business modules')
    ->expect('Modules\Scheduling')
    ->not->toUse([
        'Modules\Auth',
        'Modules\Members',
        'Modules\Plans',
        'Modules\Billing',
        'Modules\Memberships',
        'Modules\Training',
        'Modules\Nutrition',
        'Modules\Dashboard',
    ]);

arch('billing only consumes members and plans contracts')
    ->expect('Modules\Billing')
    ->not->toUse([
        'Modules\Auth',
        'Modules\Members\Domain',
        'Modules\Members\Application',
        'Modules\Members\Infrastructure',
        'Modules\Members\Presentation',
        'Modules\Plans\Domain',
        'Modules\Plans\Application',
        'Modules\Plans\Infrastructure',
        'Modules\Plans\Presentation',
        'Modules\Memberships',
        'Modules\Scheduling',
        'Modules\Training',
        'Modules\Nutrition',
        'Modules\Dashboard',
    ]);

arch('memberships only consumes members, plans and billing contracts')
    ->expect('Modules\Memberships')
    ->not->toUse([
        'Modules\Auth',
        'Modules\Members\Domain',
        'Modules\Members\Application',
        'Modules\Members\Infrastructure',
        'Modules\Members\Presentation',
        'Modules\Plans\Domain',
        'Modules\Plans\Application',
        'Modules\Plans\Infrastructure',
        'Modules\Plans\Presentation',
        'Modules\Billing\Domain',
        'Modules\Billing\Application',
        'Modules\Billing\Infrastructure',
        'Modules\Billing\Presentation',
        'Modules\Scheduling',
        'Modules\Training',
        'Modules\Nutrition',
        'Modules\Dashboard',
    ]);

arch('training only consumes members contracts')
    ->expect('Modules\Training')
    ->not->toUse([
        'Modules\Auth',
        'Modules\Members\Domain',
        'Modules\Members\Application',
        'Modules\Members\Infrastructure',
        'Modules\Members\Presentation',
        'Modules\Plans',
        'Modules\Billing',
        'Modules\Memberships',
        'Modules\Scheduling',
        'Modules\Nutrition',
        'Modules\Dashboard',
    ]);

arch('nutrition only consumes members contracts')
    ->expect('Modules\Nutrition')
    ->not->toUse([
        'Modules\Auth',
        'Modules\Members\Domain',
        'Modules\Members\Application',
        'Modules\Members\Infrastructure',
        'Modules\Members\Presentation',
        'Modules\Plans',
        'Modules\Billing',
        'Modules\Memberships',
        'Modules\Scheduling',
        'Modules\Training',
        'Modules\Dashboard',
    ]);

arch('dashboard only consumes contracts from other modules')
    ->expect('Modules\Dashboard')
    ->not->toUse([
        'Modules\Auth',
        'Modules\Members\Domain',
        'Modules\Members\Application',
        'Modules\Members\Infrastructure',
        'Modules\Members\Presentation',
        'Modules\Plans',
        'Modules\Billing\Domain',
        'Modules\Billing\Application',
        'Modules\Billing\Infrastructure',
        'Modules\Billing\Presentation',
        'Modules\Memberships\Domain',
        'Modules\Memberships\Application',
        'Modules\Memberships\Infrastructure',
        'Modules\Memberships\Presentation',
        'Modules\Scheduling\Domain',
        'Modules\Scheduling\Application',
        'Modules\Scheduling\Infrastructure',
        'Modules\Scheduling\Presentation',
        'Modules\Training',
        'Modules\Nutrition',
    ]);

arch('controllers do not use DB facade or domain models directly')
    ->expect('Modules\*\Presentation\Http\Controllers')
    ->not->toUse([
        'Illuminate\Support\Facades\DB',
        'Modules\*\Domain\Models',
    ]);

arch('domain layers do not depend on presentation or infrastructure')
    ->expect('Modules\*\Domain')
    ->not->toUse([
        'Modules\*\Presentation',
        'Modules\*\Infrastructure',
    ]);
