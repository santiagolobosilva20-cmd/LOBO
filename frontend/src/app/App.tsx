import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../features/auth/AuthContext';
import { AuthPage } from '../features/auth/AuthPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { MemberMembershipPage } from '../features/member-portal/MemberMembershipPage';
import { MemberNutritionPage } from '../features/member-portal/MemberNutritionPage';
import { MemberOverviewPage } from '../features/member-portal/MemberOverviewPage';
import { MemberRoutinePage } from '../features/member-portal/MemberRoutinePage';
import { MemberSchedulePage } from '../features/member-portal/MemberSchedulePage';
import { MemberWorkoutsPage } from '../features/member-portal/MemberWorkoutsPage';
import { MembersPage } from '../features/members/MembersPage';
import { NutritionPage } from '../features/nutrition/NutritionPage';
import { PlansPage } from '../features/plans/PlansPage';
import { RoutinesPage } from '../features/routines/RoutinesPage';
import { SchedulePage } from '../features/schedule/SchedulePage';
import { WorkoutsPage } from '../features/workouts/WorkoutsPage';
import { ToastProvider } from '../shared/components/ToastContext';
import { AppShell } from './layouts/AppShell';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppRoutes() {
  const { user, isHydrating } = useAuth();

  if (isHydrating) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f3f4ef] text-[11px] font-semibold text-[#686b63]">
        Verificando sesión en LOBO Club...
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (user.role === 'member') {
    return (
      <AppShell>
        <Routes>
          <Route path="/mi-espacio" element={<MemberOverviewPage />} />
          <Route path="/mi-espacio/membresia" element={<MemberMembershipPage />} />
          <Route path="/mi-espacio/horarios" element={<MemberSchedulePage />} />
          <Route path="/mi-espacio/rutina" element={<MemberRoutinePage />} />
          <Route path="/mi-espacio/entrenamientos" element={<MemberWorkoutsPage />} />
          <Route path="/mi-espacio/alimentacion" element={<MemberNutritionPage />} />
          <Route path="*" element={<Navigate to="/mi-espacio" replace />} />
        </Routes>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/socios" element={<MembersPage />} />
        <Route path="/horarios" element={<SchedulePage />} />
        <Route path="/planes" element={<PlansPage />} />
        <Route path="/rutinas" element={<RoutinesPage />} />
        <Route path="/entrenamientos" element={<WorkoutsPage />} />
        <Route path="/alimentacion" element={<NutritionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
