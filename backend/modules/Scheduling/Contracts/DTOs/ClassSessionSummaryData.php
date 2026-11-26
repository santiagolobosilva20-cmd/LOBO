<?php

declare(strict_types=1);

namespace Modules\Scheduling\Contracts\DTOs;

final readonly class ClassSessionSummaryData
{
    public function __construct(
        public int $id,
        public int $workoutId,
        public string $workoutName,
        public string $category,
        public int $dayOfWeek,
        public string $dayLabel,
        public string $room,
        public string $instructorName,
        public string $startsAt,
        public string $startTimeLabel,
        public string $shortTimeLabel,
        public int $durationMinutes,
        public int $capacity,
        public int $enrolledCount,
        public string $accentColor,
        public string $status,
    ) {}
}
