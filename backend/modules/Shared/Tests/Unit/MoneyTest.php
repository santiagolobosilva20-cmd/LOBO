<?php

declare(strict_types=1);

use Modules\Shared\Domain\ValueObjects\Money;

it('adds Money values immutably using php 8.5 clone with', function (): void {
    $a = new Money(89000);
    $b = new Money(12000);

    $sum = $a->add($b);

    expect($a->amountCents)->toBe(89000)
        ->and($sum->amountCents)->toBe(101000)
        ->and($sum->formatted())->toBe('$1,010.00')
        ->and($a->formattedWholeOrDecimal())->toBe('$890');
});

it('rejects negative amounts or mismatched currencies', function (): void {
    expect(fn (): Money => new Money(-1))->toThrow(InvalidArgumentException::class);

    $mxn = new Money(1000, 'MXN');
    $usd = new Money(1000, 'USD');

    expect(fn (): Money => $mxn->add($usd))->toThrow(InvalidArgumentException::class);
});
