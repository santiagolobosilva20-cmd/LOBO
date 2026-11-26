<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Modules\Members\Application\DTOs\CreateMemberData;
use Modules\Members\Application\Services\MemberService;
use Modules\Members\Domain\Enums\MemberStatus;
use Modules\Members\Domain\Models\Member;
use Modules\Members\Domain\Repositories\MemberRepositoryInterface;
use Modules\Shared\Domain\Exceptions\ConflictException;
use Modules\Shared\Domain\Exceptions\ResourceNotFoundException;

it('normalizes member name and email before persisting', function (): void {
    DB::shouldReceive('transaction')
        ->once()
        ->andReturnUsing(static fn (Closure $callback): mixed => $callback());

    $repository = Mockery::mock(MemberRepositoryInterface::class);
    $repository->shouldReceive('existsByEmail')->once()->with('juan@lobo.club')->andReturn(false);
    $repository->shouldReceive('save')
        ->once()
        ->withArgs(static fn (Member $member): bool => $member->full_name === 'Juan Pérez'
            && $member->email === 'juan@lobo.club'
            && $member->status === MemberStatus::Active)
        ->andReturnUsing(static function (Member $member): Member {
            $member->id = 10;

            return $member;
        });

    $service = new MemberService($repository);
    $created = $service->create(new CreateMemberData(
        fullName: '  Juan   Pérez  ',
        email: '  JUAN@LOBO.CLUB ',
        joinedAt: '2026-11-26',
    ));

    expect($created->id)->toBe(10)
        ->and($created->fullName)->toBe('Juan Pérez')
        ->and($created->email)->toBe('juan@lobo.club');
});

it('rejects duplicate member email with ConflictException', function (): void {
    DB::shouldReceive('transaction')
        ->once()
        ->andReturnUsing(static fn (Closure $callback): mixed => $callback());

    $repository = Mockery::mock(MemberRepositoryInterface::class);
    $repository->shouldReceive('existsByEmail')->once()->with('dup@lobo.club')->andReturn(true);

    $service = new MemberService($repository);

    expect(fn () => $service->create(new CreateMemberData(
        fullName: 'Ana Gómez',
        email: 'dup@lobo.club',
    )))->toThrow(ConflictException::class);
});

it('throws ResourceNotFoundException when member id is missing', function (): void {
    $repository = Mockery::mock(MemberRepositoryInterface::class);
    $repository->shouldReceive('findById')->once()->with(404)->andReturn(null);

    $service = new MemberService($repository);

    expect(fn () => $service->getById(404))->toThrow(ResourceNotFoundException::class);
});
