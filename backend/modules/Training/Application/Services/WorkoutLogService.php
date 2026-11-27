<?php

declare(strict_types=1);

namespace Modules\Training\Application\Services;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Modules\Members\Contracts\DTOs\MemberSummaryData;
use Modules\Members\Contracts\Queries\MemberLookupInterface;
use Modules\Shared\Application\DTOs\PaginatedResult;
use Modules\Shared\Domain\Exceptions\ConflictException;
use Modules\Shared\Domain\Exceptions\ResourceNotFoundException;
use Modules\Training\Application\DTOs\CreateWorkoutLogData;
use Modules\Training\Application\DTOs\ListWorkoutLogsFilterData;
use Modules\Training\Contracts\DTOs\WorkoutLogSummaryData;
use Modules\Training\Domain\Models\WorkoutLog;
use Modules\Training\Domain\Repositories\WorkoutLogRepositoryInterface;

final readonly class WorkoutLogService
{
    public function __construct(
        private WorkoutLogRepositoryInterface $logs,
        private MemberLookupInterface $memberLookup,
    ) {}

    /**
     * @return PaginatedResult<WorkoutLogSummaryData>
     */
    #[\NoDiscard]
    public function list(ListWorkoutLogsFilterData $filter): PaginatedResult
    {
        $paginated = $this->logs->paginate(
            query: $filter->pagination,
            memberId: $filter->memberId,
            category: $filter->category,
            search: $filter->search,
        );

        return new PaginatedResult(
            items: array_map(
                fn (WorkoutLog $log): WorkoutLogSummaryData => $this->toSummary($log),
                $paginated->items,
            ),
            currentPage: $paginated->currentPage,
            perPage: $paginated->perPage,
            total: $paginated->total,
            lastPage: $paginated->lastPage,
        );
    }

    #[\NoDiscard]
    public function record(CreateWorkoutLogData $data): WorkoutLogSummaryData
    {
        $member = $this->resolveMember($data->memberId, $data->memberName);

        return DB::transaction(function () use ($member, $data): WorkoutLogSummaryData {
            $log = new WorkoutLog([
                'member_id' => $member->id,
                'member_name_snapshot' => $member->fullName,
                'workout_id' => $data->workoutId,
                'routine_id' => $data->routineId,
                'title' => trim($data->title),
                'category' => strtoupper(trim($data->category)),
                'performed_at' => $data->performedAt ?? now()->toDateString(),
                'duration_minutes' => max(5, min(300, $data->durationMinutes)),
                'effort_rpe' => max(1, min(10, $data->effortRpe)),
                'calories_estimate' => $data->caloriesEstimate,
                'notes' => $data->notes !== null && trim($data->notes) !== '' ? trim($data->notes) : null,
            ]);

            return $this->toSummary($this->logs->save($log));
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id): void {
            $log = $this->logs->findById($id);
            if ($log === null) {
                throw new ResourceNotFoundException('WorkoutLog', $id);
            }
            $this->logs->delete($log);
        });
    }

    public function deleteOwned(int $id, int $memberId): void
    {
        DB::transaction(function () use ($id, $memberId): void {
            $log = $this->logs->findById($id);
            if ($log === null) {
                throw new ResourceNotFoundException('WorkoutLog', $id);
            }

            if ($log->member_id !== $memberId) {
                throw new AuthorizationException('No puedes eliminar entrenamientos de otro socio.');
            }

            $this->logs->delete($log);
        });
    }

    private function resolveMember(?int $memberId, ?string $memberName): MemberSummaryData
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
                errors: ['member_name' => ['Debes indicar el socio de la sesión.']],
            );
        }

        return $this->memberLookup->findOrCreateByName($trimmed);
    }

    private function toSummary(WorkoutLog $log): WorkoutLogSummaryData
    {
        return new WorkoutLogSummaryData(
            id: $log->id,
            memberId: $log->member_id,
            memberName: $log->member_name_snapshot,
            workoutId: $log->workout_id,
            routineId: $log->routine_id,
            title: $log->title,
            category: $log->category,
            performedAt: $log->performed_at->toDateString(),
            durationMinutes: $log->duration_minutes,
            effortRpe: $log->effort_rpe,
            caloriesEstimate: $log->calories_estimate,
            notes: $log->notes,
            createdAt: $log->created_at?->toIso8601String(),
        );
    }
}
