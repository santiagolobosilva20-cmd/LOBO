<?php

declare(strict_types=1);

namespace Modules\Scheduling\Infrastructure\Persistence;

use Modules\Scheduling\Domain\Models\Workout;
use Modules\Scheduling\Domain\Repositories\WorkoutRepositoryInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Application\DTOs\PaginationQuery;

final class EloquentWorkoutRepository implements WorkoutRepositoryInterface
{
    private const array COLUMNS = [
        'id',
        'name',
        'slug',
        'category',
        'level',
        'default_duration_minutes',
        'badge_label',
        'image_url',
        'display_order',
        'description',
        'created_at',
        'updated_at',
    ];

    public function paginate(PaginationQuery $query, ?string $category = null): PaginatedResult
    {
        $builder = Workout::query()->select(self::COLUMNS);

        if ($category !== null && trim($category) !== '') {
            $builder->where('category', trim($category));
        }

        $paginator = $builder
            ->orderBy('display_order')
            ->orderBy('id')
            ->paginate(perPage: $query->perPage, page: $query->page);

        return PaginatedResult::fromPaginator(
            paginator: $paginator,
            mapper: static fn (Workout $workout): Workout => $workout,
        );
    }

    public function findById(int $id): ?Workout
    {
        return Workout::query()->select(self::COLUMNS)->find($id);
    }

    public function existsBySlug(string $slug, ?int $excludeId = null): bool
    {
        $builder = Workout::query()->where('slug', $slug);
        if ($excludeId !== null) {
            $builder->whereKeyNot($excludeId);
        }

        return $builder->exists();
    }

    public function save(Workout $workout): Workout
    {
        $workout->save();

        return $workout->refresh();
    }

    public function delete(Workout $workout): void
    {
        $workout->delete();
    }
}
