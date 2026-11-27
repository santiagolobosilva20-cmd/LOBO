import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/DashboardPage';
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

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
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
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
