<?php

declare(strict_types=1);

namespace Modules\Training\Application\Services;

use Illuminate\Support\Facades\DB;
use Modules\Members\Contracts\DTOs\MemberSummaryData;
use Modules\Members\Contracts\Queries\MemberLookupInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Domain\Exceptions\ConflictException;
use Modules\Shared\Domain\Exceptions\ResourceNotFoundException;
use Modules\Training\Application\DTOs\ListRoutinesFilterData;
use Modules\Training\Application\DTOs\RoutineExerciseInputData;
use Modules\Training\Application\DTOs\SaveRoutineData;
use Modules\Training\Contracts\DTOs\RoutineExerciseData;
use Modules\Training\Contracts\DTOs\RoutineSummaryData;
use Modules\Training\Domain\Models\Routine;
use Modules\Training\Domain\Models\RoutineExercise;
use Modules\Training\Domain\Repositories\RoutineRepositoryInterface;

final readonly class RoutineService
{
    public function __construct(
        private RoutineRepositoryInterface $routines,
        private MemberLookupInterface $memberLookup,
    ) {}

    /**
     * @return PaginatedResult<RoutineSummaryData>
     */
    #[\NoDiscard]
    public function list(ListRoutinesFilterData $filter): PaginatedResult
    {
        $paginated = $this->routines->paginate(
            query: $filter->pagination,
            goal: $filter->goal,
            isTemplate: $filter->isTemplate,
            memberId: $filter->memberId,
            search: $filter->search,
            includeTemplates: $filter->includeTemplates,
        );

        return new PaginatedResult(
            items: array_map(
                fn (Routine $routine): RoutineSummaryData => $this->toSummary($routine),
                $paginated->items,
            ),
            currentPage: $paginated->currentPage,
            perPage: $paginated->perPage,
            total: $paginated->total,
            lastPage: $paginated->lastPage,
        );
    }

    #[\NoDiscard]
    public function create(SaveRoutineData $data): RoutineSummaryData
    {
        return DB::transaction(function () use ($data): RoutineSummaryData {
            $member = $this->resolveOptionalMember($data->memberId, $data->memberName);
            $routine = new Routine;
            $this->fillRoutine($routine, $data, $member);

            $saved = $this->routines->saveWithExercises($routine, $this->normalizeExercises($data->exercises));

            return $this->toSummary($saved);
        });
    }

    #[\NoDiscard]
    public function update(int $id, SaveRoutineData $data): RoutineSummaryData
    {
        return DB::transaction(function () use ($id, $data): RoutineSummaryData {
            $routine = $this->requireRoutine($id);
            $member = $this->resolveOptionalMember($data->memberId, $data->memberName);
            $this->fillRoutine($routine, $data, $member);

            $saved = $this->routines->saveWithExercises($routine, $this->normalizeExercises($data->exercises));

            return $this->toSummary($saved);
        });
    }

    #[\NoDiscard]
    public function assignToMember(int $routineId, ?int $memberId, ?string $memberName): RoutineSummaryData
    {
        return DB::transaction(function () use ($routineId, $memberId, $memberName): RoutineSummaryData {
            $source = $this->requireRoutine($routineId);
            $member = $this->resolveRequiredMember($memberId, $memberName);

            $assigned = new Routine([
                'member_id' => $member->id,
                'member_name_snapshot' => $member->fullName,
                'title' => $source->title,
                'goal' => $source->goal,
                'level' => $source->level,
                'days_per_week' => $source->days_per_week,
                'estimated_minutes' => $source->estimated_minutes,
                'is_template' => false,
                'notes' => $source->notes,
            ]);

            $exerciseRows = [];
            foreach ($source->exercises as $idx => $ex) {
                $exerciseRows[] = [
                    'day_label' => $ex->day_label,
                    'exercise_name' => $ex->exercise_name,
                    'sets' => $ex->sets,
                    'reps' => $ex->reps,
                    'target_weight' => $ex->target_weight,
                    'rest_seconds' => $ex->rest_seconds,
                    'sort_order' => $idx + 1,
                ];
            }

            return $this->toSummary($this->routines->saveWithExercises($assigned, $exerciseRows));
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id): void {
            $routine = $this->requireRoutine($id);
            $this->routines->delete($routine);
        });
    }

    private function requireRoutine(int $id): Routine
    {
        $routine = $this->routines->findByIdWithExercises($id);
        if ($routine === null) {
            throw new ResourceNotFoundException('Routine', $id);
        }

        return $routine;
    }

    private function fillRoutine(Routine $routine, SaveRoutineData $data, ?MemberSummaryData $member): void
    {
        $routine->fill([
            'member_id' => $member?->id,
            'member_name_snapshot' => $member?->fullName,
            'title' => trim($data->title),
            'goal' => $data->goal,
            'level' => trim($data->level),
            'days_per_week' => max(1, min(7, $data->daysPerWeek)),
            'estimated_minutes' => max(10, min(240, $data->estimatedMinutes)),
            'is_template' => $member === null && $data->isTemplate,
            'notes' => $data->notes !== null && trim($data->notes) !== '' ? trim($data->notes) : null,
        ]);
    }

    /**
     * @param  list<RoutineExerciseInputData>  $exercises
     * @return list<array{day_label: string, exercise_name: string, sets: int, reps: string, target_weight: ?string, rest_seconds: int, sort_order: int}>
     */
    private function normalizeExercises(array $exercises): array
    {
        $rows = [];
        foreach ($exercises as $idx => $item) {
            $rows[] = [
                'day_label' => trim($item->dayLabel),
                'exercise_name' => trim($item->exerciseName),
                'sets' => max(1, min(20, $item->sets)),
                'reps' => trim($item->reps),
                'target_weight' => $item->targetWeight !== null && trim($item->targetWeight) !== ''
                    ? trim($item->targetWeight)
                    : null,
                'rest_seconds' => max(0, min(600, $item->restSeconds)),
                'sort_order' => $item->sortOrder > 0 ? $item->sortOrder : ($idx + 1),
            ];
        }

        return $rows;
    }

    private function resolveOptionalMember(?int $memberId, ?string $memberName): ?MemberSummaryData
    {
        if ($memberId === null && ($memberName === null || trim($memberName) === '')) {
            return null;
        }

        return $this->resolveRequiredMember($memberId, $memberName);
    }

    private function resolveRequiredMember(?int $memberId, ?string $memberName): MemberSummaryData
    {
        if ($memberId !== null) {
            $member = $this->memberLookup->findSummaryById($memberId);
            if ($member === null) {
                throw new ResourceNotFoundException('Member', $memberId);
            }

            return $member;
        }

        $trimmed = trim((string) $memberName);
        if ($trimmed === '') {
            throw new ConflictException(
                message: 'A member identifier or member name is required.',
                errors: ['member_name' => ['Debes indicar el nombre o ID del socio.']],
            );
        }

        return $this->memberLookup->findOrCreateByName($trimmed);
    }

    private function toSummary(Routine $routine): RoutineSummaryData
    {
        $exercises = [];
        foreach ($routine->exercises as $ex) {
            /** @var RoutineExercise $ex */
            $exercises[] = new RoutineExerciseData(
                id: $ex->id,
                dayLabel: $ex->day_label,
                exerciseName: $ex->exercise_name,
                sets: $ex->sets,
                reps: $ex->reps,
                targetWeight: $ex->target_weight,
                restSeconds: $ex->rest_seconds,
                sortOrder: $ex->sort_order,
            );
        }

        return new RoutineSummaryData(
            id: $routine->id,
            memberId: $routine->member_id,
            memberName: $routine->member_name_snapshot,
            title: $routine->title,
            goal: $routine->goal->value,
            level: $routine->level,
            daysPerWeek: $routine->days_per_week,
            estimatedMinutes: $routine->estimated_minutes,
            isTemplate: $routine->is_template,
            notes: $routine->notes,
            exercises: $exercises,
            createdAt: $routine->created_at?->toIso8601String(),
        );
    }
}
