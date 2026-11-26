<?php

declare(strict_types=1);

arch('all module classes declare strict types')
    ->expect('Modules')
    ->toUseStrictTypes();

arch('shared module does not depend on business modules')
    ->expect('Modules\Shared')
    ->not->toUse([
        'Modules\Members',
        'Modules\Plans',
        'Modules\Billing',
        'Modules\Scheduling',
        'Modules\Dashboard',
    ]);

arch('members module is isolated from peer business modules')
    ->expect('Modules\Members')
    ->not->toUse([
        'Modules\Plans',
        'Modules\Billing',
        'Modules\Scheduling',
        'Modules\Dashboard',
    ]);

arch('plans module is isolated from peer business modules')
    ->expect('Modules\Plans')
    ->not->toUse([
        'Modules\Members',
        'Modules\Billing',
        'Modules\Scheduling',
        'Modules\Dashboard',
    ]);

arch('scheduling module is isolated from peer business modules')
    ->expect('Modules\Scheduling')
    ->not->toUse([
        'Modules\Members',
        'Modules\Plans',
        'Modules\Billing',
        'Modules\Dashboard',
    ]);

arch('billing only consumes members and plans contracts')
    ->expect('Modules\Billing')
    ->not->toUse([
        'Modules\Members\Domain',
        'Modules\Members\Application',
        'Modules\Members\Infrastructure',
        'Modules\Members\Presentation',
        'Modules\Plans\Domain',
        'Modules\Plans\Application',
        'Modules\Plans\Infrastructure',
        'Modules\Plans\Presentation',
        'Modules\Scheduling',
        'Modules\Dashboard',
    ]);

arch('dashboard only consumes contracts from other modules')
    ->expect('Modules\Dashboard')
    ->not->toUse([
        'Modules\Members\Domain',
        'Modules\Members\Application',
        'Modules\Members\Infrastructure',
        'Modules\Members\Presentation',
        'Modules\Plans',
        'Modules\Billing\Domain',
        'Modules\Billing\Application',
        'Modules\Billing\Infrastructure',
        'Modules\Billing\Presentation',
        'Modules\Scheduling\Domain',
        'Modules\Scheduling\Application',
        'Modules\Scheduling\Infrastructure',
        'Modules\Scheduling\Presentation',
    ]);

arch('controllers do not use DB facade or domain models directly')
    ->expect('Modules\*\Presentation\Http\Controllers')
    ->not->toUse([
        'Illuminate\Support\Facades\DB',
        'Modules\*\Domain\Models',
    ]);

arch('domain and application layers do not depend on presentation or infrastructure')
    ->expect('Modules\*\Domain')
    ->not->toUse([
        'Modules\*\Presentation',
        'Modules\*\Infrastructure',
    ]);
