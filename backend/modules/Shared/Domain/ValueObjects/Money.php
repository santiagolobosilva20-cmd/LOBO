<?php

declare(strict_types=1);

namespace Modules\Shared\Domain\ValueObjects;

use InvalidArgumentException;

final readonly class Money
{
    public int $amountCents;

    public string $currency;

    public function __construct(int $amountCents, string $currency = 'MXN')
    {
        if ($amountCents < 0) {
            throw new InvalidArgumentException('Money amount cannot be negative.');
        }

        $normalizedCurrency = strtoupper(trim($currency));
        if (strlen($normalizedCurrency) !== 3) {
            throw new InvalidArgumentException('Currency must be a 3-letter ISO code.');
        }

        $this->amountCents = $amountCents;
        $this->currency = $normalizedCurrency;
    }

    public static function zero(string $currency = 'MXN'): self
    {
        return new self(0, $currency);
    }

    #[\NoDiscard]
    public function add(self $other): self
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException('Cannot add Money values with different currencies.');
        }

        return clone ($this, [
            'amountCents' => $this->amountCents + $other->amountCents,
        ]);
    }

    public function formatted(): string
    {
        return '$'.number_format($this->amountCents / 100, 2, '.', ',');
    }

    public function formattedWholeOrDecimal(): string
    {
        if ($this->amountCents % 100 === 0) {
            return '$'.number_format((int) ($this->amountCents / 100), 0, '.', ',');
        }

        return $this->formatted();
    }
}
