import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../shared/components/ToastContext';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { MembersPage } from '../features/members/MembersPage';
import { PlansPage } from '../features/plans/PlansPage';
import { SchedulePage } from '../features/schedule/SchedulePage';
import { WorkoutsPage } from '../features/workouts/WorkoutsPage';
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
              <Route path="/entrenamientos" element={<WorkoutsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
