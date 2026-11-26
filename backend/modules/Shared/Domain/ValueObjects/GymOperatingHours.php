<?php

declare(strict_types=1);

namespace Modules\Shared\Domain\ValueObjects;

use Carbon\CarbonImmutable;

final readonly class GymOperatingHours
{
    public function __construct(
        public string $openingTime = '06:00',
        public string $closingTime = '22:00',
        public string $daysLabel = 'Lun a sáb',
    ) {}

    public function isOpenAt(?CarbonImmutable $moment = null): bool
    {
        $now = $moment ?? CarbonImmutable::now();
        if ($now->isSunday()) {
            return false;
        }

        $current = $now->format('H:i');

        return $current >= $this->openingTime && $current <= $this->closingTime;
    }

    public function label(): string
    {
        return "{$this->daysLabel} · {$this->openingTime}–{$this->closingTime}";
    }
}
