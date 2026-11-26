<?php

declare(strict_types=1);

use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\Facades\DB;
use Modules\Billing\Application\DTOs\RegisterPaymentData;
use Modules\Billing\Application\Services\BillingService;
use Modules\Billing\Contracts\Events\PaymentRecorded;
use Modules\Billing\Domain\Enums\PaymentMethod;
use Modules\Billing\Domain\Models\Payment;
use Modules\Billing\Domain\Repositories\PaymentRepositoryInterface;
use Modules\Members\Contracts\DTOs\MemberSummaryData;
use Modules\Members\Contracts\Queries\MemberLookupInterface;
use Modules\Plans\Contracts\DTOs\PlanSummaryData;
use Modules\Plans\Contracts\Queries\PlanLookupInterface;
use Modules\Shared\Domain\Exceptions\ConflictException;

it('registers payment by member name using member and plan contracts and dispatches PaymentRecorded', function (): void {
    DB::shouldReceive('transaction')
        ->once()
        ->andReturnUsing(static fn (Closure $callback): mixed => $callback());

    $memberLookup = Mockery::mock(MemberLookupInterface::class);
    $memberLookup->shouldReceive('findOrCreateByName')
        ->once()
        ->with('Alex Rivera')
        ->andReturn(new MemberSummaryData(
            id: 1,
            fullName: 'Alex Rivera',
            email: null,
            phone: null,
            documentNumber: null,
            status: 'active',
            joinedAt: '2026-11-26',
            createdAt: null,
            updatedAt: null,
        ));

    $planLookup = Mockery::mock(PlanLookupInterface::class);
    $planLookup->shouldReceive('findSummaryById')
        ->once()
        ->with(2)
        ->andReturn(new PlanSummaryData(
            id: 2,
            name: 'Mensualidad',
            slug: 'mensualidad',
            tagline: '02 / FAVORITO LOBO',
            priceCents: 89000,
            formattedPrice: '$890',
            durationDays: 30,
            billingPeriodLabel: 'mes',
            description: null,
            features: ['Acceso ilimitado'],
            isFeatured: true,
            isActive: true,
            createdAt: null,
            updatedAt: null,
        ));

    $repository = Mockery::mock(PaymentRepositoryInterface::class);
    $repository->shouldReceive('save')
        ->once()
        ->withArgs(static fn (Payment $payment): bool => $payment->member_name_snapshot === 'Alex Rivera'
            && $payment->plan_name_snapshot === 'Mensualidad'
            && $payment->amount_cents === 89000
            && $payment->payment_method === PaymentMethod::Cash)
        ->andReturnUsing(static function (Payment $payment): Payment {
            $payment->id = 99;

            return $payment;
        });

    $events = Mockery::mock(Dispatcher::class);
    $events->shouldReceive('dispatch')
        ->once()
        ->withArgs(static fn (object $event): bool => $event instanceof PaymentRecorded && $event->payment->id === 99);

    $service = new BillingService($repository, $memberLookup, $planLookup, $events);

    $result = $service->register(new RegisterPaymentData(
        planId: 2,
        paymentMethod: PaymentMethod::Cash,
        memberName: 'Alex Rivera',
        paidAt: '2026-11-26',
    ));

    expect($result->id)->toBe(99)
        ->and($result->formattedAmount)->toBe('$890.00')
        ->and($result->memberName)->toBe('Alex Rivera')
        ->and($result->planName)->toBe('Mensualidad');
});

it('rejects payment for inactive plan with ConflictException', function (): void {
    $memberLookup = Mockery::mock(MemberLookupInterface::class);

    $planLookup = Mockery::mock(PlanLookupInterface::class);
    $planLookup->shouldReceive('findSummaryById')->once()->with(3)->andReturn(
        new PlanSummaryData(
            id: 3,
            name: 'Legacy',
            slug: 'legacy',
            tagline: null,
            priceCents: 30000,
            formattedPrice: '$300',
            durationDays: 30,
            billingPeriodLabel: 'mes',
            description: null,
            features: [],
            isFeatured: false,
            isActive: false,
            createdAt: null,
            updatedAt: null,
        ),
    );

    $repository = Mockery::mock(PaymentRepositoryInterface::class);
    $events = Mockery::mock(Dispatcher::class);

    $service = new BillingService($repository, $memberLookup, $planLookup, $events);

    expect(fn () => $service->register(new RegisterPaymentData(
        planId: 3,
        paymentMethod: PaymentMethod::Cash,
        memberName: 'Alex Rivera',
    )))->toThrow(ConflictException::class);
});
