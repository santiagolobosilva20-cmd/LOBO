import { useQuery } from '@tanstack/react-query';
import { requestJson } from '../../shared/api/http';
import type {
  MemberMembershipsResponse,
  MemberScheduleResponse,
  NutritionPlanItem,
  PaginatedResponse,
  PaymentItem,
  PlanItem,
  RoutineItem,
  WorkoutItem,
  WorkoutLogItem,
} from '../../shared/api/types';

export function useMemberMembershipsQuery() {
  return useQuery({
    queryKey: ['member', 'memberships'],
    queryFn: () => requestJson<MemberMembershipsResponse>('/member/memberships?per_page=20'),
    retry: false,
  });
}

export function useMemberPaymentsQuery() {
  return useQuery({
    queryKey: ['member', 'payments'],
    queryFn: () => requestJson<PaginatedResponse<PaymentItem>>('/member/payments?per_page=20'),
    retry: false,
  });
}

export function useMemberScheduleQuery() {
  return useQuery({
    queryKey: ['member', 'schedule'],
    queryFn: () => requestJson<MemberScheduleResponse>('/member/schedule/sessions?per_page=50'),
    retry: false,
  });
}

export function useMemberRoutinesQuery(scope: 'mine' | 'templates' | 'all' = 'all') {
  return useQuery({
    queryKey: ['member', 'routines', scope],
    queryFn: () =>
      requestJson<PaginatedResponse<RoutineItem>>(
        `/member/routines?per_page=30&scope=${encodeURIComponent(scope)}`,
      ),
    retry: false,
  });
}

export function useMemberNutritionQuery(scope: 'mine' | 'templates' | 'all' = 'all') {
  return useQuery({
    queryKey: ['member', 'nutrition', scope],
    queryFn: () =>
      requestJson<PaginatedResponse<NutritionPlanItem>>(
        `/member/nutrition/plans?per_page=20&scope=${encodeURIComponent(scope)}`,
      ),
    retry: false,
  });
}

export function useMemberWorkoutLogsQuery() {
  return useQuery({
    queryKey: ['member', 'workout-logs'],
    queryFn: () =>
      requestJson<PaginatedResponse<WorkoutLogItem>>('/member/workout-logs?per_page=20'),
    retry: false,
  });
}

export function useClubWorkoutsQuery() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: () => requestJson<PaginatedResponse<WorkoutItem>>('/workouts?per_page=20'),
    retry: false,
  });
}

export function useClubPlansQuery() {
  return useQuery({
    queryKey: ['plans', 'member-catalog'],
    queryFn: () => requestJson<PaginatedResponse<PlanItem>>('/plans?per_page=20&active_only=1'),
    retry: false,
  });
}

