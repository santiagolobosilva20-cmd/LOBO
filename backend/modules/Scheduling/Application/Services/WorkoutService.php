<?php

declare(strict_types=1);

namespace Modules\Scheduling\Application\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Scheduling\Application\DTOs\CreateWorkoutData;
use Modules\Scheduling\Contracts\DTOs\WorkoutSummaryData;
use Modules\Scheduling\Domain\Models\Workout;
use Modules\Scheduling\Domain\Repositories\WorkoutRepositoryInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;
use Modules\Shared\Domain\Exceptions\ConflictException;
use Modules\Shared\Domain\Exceptions\ResourceNotFoundException;

final readonly class WorkoutService
{
    public function __construct(
        private WorkoutRepositoryInterface $workouts,
    ) {}

    /**
     * @return PaginatedResult<WorkoutSummaryData>
     */
    #[\NoDiscard]
    public function list(PaginationQuery $pagination, ?string $category = null): PaginatedResult
    {
        $paginated = $this->workouts->paginate($pagination, $category);

        return new PaginatedResult(
            items: array_map(
                fn (Workout $workout): WorkoutSummaryData => $this->toSummary($workout),
                $paginated->items,
            ),
            currentPage: $paginated->currentPage,
            perPage: $paginated->perPage,
            total: $paginated->total,
            lastPage: $paginated->lastPage,
        );
    }

    #[\NoDiscard]
    public function create(CreateWorkoutData $data): WorkoutSummaryData
    {
        $normalizedName = trim((string) preg_replace('/\s+/', ' ', $data->name));
        $slug = Str::slug($normalizedName);

        return DB::transaction(function () use ($normalizedName, $slug, $data): WorkoutSummaryData {
            if ($this->workouts->existsBySlug($slug)) {
                throw new ConflictException(
                    message: sprintf('A workout named [%s] already exists.', $normalizedName),
                    errors: ['name' => ['The workout name is already registered.']],
                );
            }

            $workout = new Workout([
                'name' => $normalizedName,
                'slug' => $slug,
                'category' => trim($data->category),
                'level' => $data->level,
                'default_duration_minutes' => $data->defaultDurationMinutes,
                'badge_label' => strtoupper(trim($data->badgeLabel)),
                'image_url' => $data->imageUrl,
                'display_order' => $data->displayOrder,
                'description' => $data->description !== null ? trim($data->description) : null,
            ]);

            return $this->toSummary($this->workouts->save($workout));
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id): void {
            $workout = $this->workouts->findById($id);
            if ($workout === null) {
                throw new ResourceNotFoundException('Workout', $id);
            }

            $this->workouts->delete($workout);
        });
    }

    private function toSummary(Workout $workout): WorkoutSummaryData
    {
        return new WorkoutSummaryData(
            id: $workout->id,
            name: $workout->name,
            slug: $workout->slug,
            category: $workout->category,
            level: $workout->level->value,
            defaultDurationMinutes: $workout->default_duration_minutes,
            badgeLabel: $workout->badge_label,
            imageUrl: $workout->image_url,
            displayOrder: $workout->display_order,
            description: $workout->description,
            createdAt: $workout->created_at?->toIso8601String(),
        );
    }
}
