<?php

declare(strict_types=1);

namespace Modules\Scheduling\Application\DTOs;

use Carbon\CarbonImmutable;
use Modules\Scheduling\Domain\Enums\SessionStatus;

final readonly class CreateClassSessionData
{
    public function __construct(
        public int $workoutId,
        public string $room,
        public string $instructorName,
        public CarbonImmutable $startsAt,
        public int $durationMinutes,
        public int $capacity,
        public int $dayOfWeek = 1,
        public int $enrolledCount = 0,
        public string $accentColor = '#CEF542',
        public SessionStatus $status = SessionStatus::Scheduled,
    ) {}
}
