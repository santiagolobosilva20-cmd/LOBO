import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/App';
import { AuthProvider } from '../features/auth/AuthContext';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { MembersPage } from '../features/members/MembersPage';
import { NutritionPage } from '../features/nutrition/NutritionPage';
import { PlansPage } from '../features/plans/PlansPage';
import { RoutinesPage } from '../features/routines/RoutinesPage';
import { ApiError, extractApiError, requestJson, setAuthToken } from '../shared/api/http';
import { KpiCard } from '../shared/components/KpiCard';
import { DetailCardsGridSkeleton, TableSkeleton } from '../shared/components/Skeletons';
import { ToastProvider } from '../shared/components/ToastContext';
import {
  formatCurrencyFromCents,
  getMealSlotLabel,
  getMemberInitials,
  getMembershipStatusLabel,
  getMemberStatusLabel,
  getNutritionGoalLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getRoutineGoalLabel,
} from '../shared/utils/format';

describe('format helpers', () => {
  it('formats cents to currency string and translates domain labels', () => {
    expect(formatCurrencyFromCents(0)).toBe('$0.00');
    expect(formatCurrencyFromCents(89000)).toBe('$890.00');
    expect(getMemberInitials('Alex Rivera')).toBe('AR');
    expect(getPaymentMethodLabel('cash')).toBe('Efectivo');
    expect(getPaymentStatusLabel('pending')).toBe('En revisión');
    expect(getPaymentStatusLabel('paid')).toBe('Pagado');
    expect(getMemberStatusLabel('active')).toBe('Activo');
    expect(getMembershipStatusLabel('active')).toBe('Activa');
    expect(getRoutineGoalLabel('hypertrophy')).toBe('Hipertrofia');
    expect(getNutritionGoalLabel('fat_loss')).toBe('Déficit');
    expect(getMealSlotLabel('breakfast')).toBe('Desayuno');
  });
});

describe('http client', () => {
  it('maps Laravel error envelopes into ApiError', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'resource_conflict',
            message: 'Email already registered.',
            errors: { email: ['The email address is already registered.'] },
          },
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await expect(requestJson('/members', { method: 'POST' }, mockFetch)).rejects.toThrow(ApiError);

    const parsed = extractApiError(
      { error: { code: 'validation_failed', message: 'Invalid', errors: { name: ['Required'] } } },
      422,
    );
    expect(parsed.fieldErrors.name).toBe('Required');
  });
});

describe('LOBO Gym Views', () => {
  it('renders LOBO Resumen KPIs, empty payments state and featured classes from API summary', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            kpis: {
              monthly_revenue_cents: 0,
              formatted_monthly_revenue: '$0.00',
              active_members_count: 0,
              active_memberships_count: 0,
              monthly_payments_count: 0,
              next_session: {
                id: 1,
                workout_id: 1,
                workout_name: 'Fuerza funcional',
                category: 'FUERZA',
                day_of_week: 1,
                day_label: 'Lunes',
                room: 'Sala Norte',
                instructor_name: 'Carlos Méndez',
                starts_at: '2026-11-26T07:00:00-05:00',
                start_time_label: '07:00 AM',
                short_time_label: '07:00',
                duration_minutes: 45,
                capacity: 12,
                enrolled_count: 8,
                accent_color: '#CEF542',
                status: 'scheduled',
              },
            },
            recent_payments: [],
            featured_sessions: [
              {
                id: 1,
                workout_id: 1,
                workout_name: 'Fuerza funcional',
                category: 'FUERZA',
                day_of_week: 1,
                day_label: 'Lunes',
                room: 'Sala Norte',
                instructor_name: 'Carlos Méndez',
                starts_at: '2026-11-26T07:00:00-05:00',
                start_time_label: '07:00 AM',
                short_time_label: '07:00',
                duration_minutes: 45,
                capacity: 12,
                enrolled_count: 8,
                accent_color: '#CEF542',
                status: 'scheduled',
              },
            ],
            club_status: { is_open: true, hours: 'Lun a sáb · 06:00–22:00' },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Tu gimnasio, al día')).toBeInTheDocument();
      expect(screen.getByText('Aún no hay ingresos')).toBeInTheDocument();
      expect(screen.getByText('Fuerza funcional')).toBeInTheDocument();
      expect(screen.getByText('8/12')).toBeInTheDocument();
    });

    fetchSpy.mockRestore();
  });

  it('renders Pase diario, Mensualidad and Trimestral plans', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [], meta: { current_page: 1, per_page: 50, total: 0, last_page: 1 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <PlansPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Pase diario')).toBeInTheDocument();
      expect(screen.getByText('Mensualidad')).toBeInTheDocument();
      expect(screen.getByText('Trimestral')).toBeInTheDocument();
      expect(screen.getByText('$890')).toBeInTheDocument();
    });

    fetchSpy.mockRestore();
  });

  it('renders active memberships, routines and nutrition plans from API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('/memberships')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [
                {
                  id: 1,
                  member_id: 1,
                  member_name: 'Alex Rivera',
                  plan_id: 2,
                  plan_name: 'Mensualidad',
                  last_payment_id: 1,
                  starts_at: '2026-11-27',
                  ends_at: '2026-12-27',
                  days_remaining: 30,
                  is_expiring_soon: false,
                  status: 'active',
                  auto_renew: false,
                  notes: null,
                  created_at: null,
                },
              ],
              meta: { current_page: 1, per_page: 12, total: 1, last_page: 1 },
              stats: { active_count: 1, expiring_soon_count: 0, paused_count: 0, expired_count: 0 },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      if (url.includes('/payments')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [],
              meta: { current_page: 1, per_page: 12, total: 0, last_page: 1 },
              stats: {
                total_revenue_cents: 89000,
                formatted_total_revenue: '$890.00',
                distinct_members_count: 1,
                total_payments_count: 1,
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      if (url.includes('/routines')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [
                {
                  id: 1,
                  member_id: null,
                  member_name: null,
                  title: 'Fuerza e Hipertrofia · 4 días',
                  goal: 'hypertrophy',
                  level: 'intermediate',
                  days_per_week: 4,
                  estimated_minutes: 60,
                  is_template: true,
                  notes: null,
                  exercises: [
                    {
                      id: 1,
                      day_label: 'Día 1 · Empuje',
                      exercise_name: 'Press de banca',
                      sets: 4,
                      reps: '6-8',
                      target_weight: '70 kg',
                      rest_seconds: 120,
                      sort_order: 1,
                    },
                  ],
                  created_at: null,
                },
              ],
              meta: { current_page: 1, per_page: 50, total: 1, last_page: 1 },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: [
              {
                id: 1,
                member_id: null,
                member_name: null,
                title: 'Definición Limpia · 1,900 kcal',
                goal: 'fat_loss',
                daily_calories: 1900,
                protein_grams: 155,
                carbs_grams: 175,
                fats_grams: 62,
                water_liters: 3.0,
                is_template: true,
                notes: null,
                meals: [
                  {
                    id: 1,
                    meal_slot: 'breakfast',
                    title: 'Claras y avena',
                    foods_summary: '2 huevos + avena',
                    calories: 430,
                    protein_grams: 32,
                    carbs_grams: 46,
                    fats_grams: 13,
                    sort_order: 1,
                  },
                ],
                created_at: null,
              },
            ],
            meta: { current_page: 1, per_page: 50, total: 1, last_page: 1 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <MembersPage />
          <RoutinesPage />
          <NutritionPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('30 d')).toBeInTheDocument();
      expect(screen.getByText('Fuerza e Hipertrofia · 4 días')).toBeInTheDocument();
      expect(screen.getByText('Press de banca')).toBeInTheDocument();
      expect(screen.getByText('Definición Limpia · 1,900 kcal')).toBeInTheDocument();
      expect(screen.getByText('Claras y avena')).toBeInTheDocument();
    });

    fetchSpy.mockRestore();
  });

  it('redirects unauthenticated user to /login and renders demo login options when enabled', async () => {
    setAuthToken(null);

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { demo_login_enabled: true } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Ingresa a tu cuenta')).toBeInTheDocument();
      expect(screen.getByText('Socio · Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('Administrador LOBO')).toBeInTheDocument();
    });

    fetchSpy.mockRestore();
  });

  it('renders Member Portal navigation and overview when authenticated as member', async () => {
    setAuthToken('member-token-test');

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('/auth/me')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                id: 2,
                name: 'Alex Rivera',
                email: 'alex.rivera@loboclub.com',
                role: 'member',
                member_id: 1,
                member_name: 'Alex Rivera',
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      if (url.includes('/member/memberships')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [],
              meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 },
              active_membership: {
                id: 1,
                member_id: 1,
                member_name: 'Alex Rivera',
                plan_id: 2,
                plan_name: 'Mensualidad',
                last_payment_id: 1,
                starts_at: '2026-11-27',
                ends_at: '2026-12-27',
                days_remaining: 30,
                is_expiring_soon: false,
                status: 'active',
                auto_renew: false,
                notes: null,
                created_at: null,
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      if (url.includes('/member/schedule')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [],
              meta: { current_page: 1, per_page: 50, total: 0, last_page: 1 },
              booked_session_ids: [],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      if (url.includes('/healthz')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: { status: 'ok', database: 'connected', timestamp: '2026-11-27T00:00:00Z' },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: [],
            meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Tu resumen personal')).toBeInTheDocument();
      expect(screen.getByText('Mi membresía')).toBeInTheDocument();
      expect(screen.getByText('Horarios y reservas')).toBeInTheDocument();
      expect(screen.queryByText('Planes y precios')).not.toBeInTheDocument();
    });

    setAuthToken(null);
    fetchSpy.mockRestore();
  });

  it('renders structural AppHydrationSkeleton while session hydration is pending and then renders the view', async () => {
    setAuthToken('pending-session-token');

    let resolveAuthMe!: (response: Response) => void;
    const authMePromise = new Promise<Response>((resolve) => {
      resolveAuthMe = resolve;
    });

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/auth/me')) {
        return authMePromise;
      }

      if (url.includes('/auth/config')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                demo_quick_login_enabled: true,
                demo_accounts: [],
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: [],
            meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const hydrationSkeleton = screen.getByRole('status', { name: 'Cargando aplicación LOBO Club' });
    expect(hydrationSkeleton).toHaveAttribute('aria-busy', 'true');

    resolveAuthMe(
      new Response(
        JSON.stringify({
          error: { code: 'unauthenticated', message: 'Token expired.' },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'Cargando aplicación LOBO Club' })).not.toBeInTheDocument();
      expect(screen.getByText('Tu progreso, tu rutina y tu club en un solo lugar.')).toBeInTheDocument();
    });

    setAuthToken(null);
    fetchSpy.mockRestore();
  });

  it('renders accessible loading skeletons for KpiCard, TableSkeleton, DetailCardsGridSkeleton and pending DashboardPage', () => {
    const neverEndingFetch = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { rerender } = render(
      <div>
        <KpiCard
          loading
          label="Ingresos del mes"
          value="$0.00"
          subtitle="Pagos de este mes"
          icon={<span>$</span>}
          iconBgClass="bg-[#d3f36b]"
          index={0}
        />
        <TableSkeleton rows={3} cols={4} />
        <DetailCardsGridSkeleton variant="routine" count={2} />
      </div>,
    );

    expect(screen.getByRole('status', { name: 'Cargando Ingresos del mes' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByRole('status', { name: 'Cargando registros' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status', { name: 'Cargando rutinas' })).toHaveAttribute('aria-busy', 'true');

    rerender(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ToastProvider>
            <DashboardPage />
          </ToastProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('status', { name: 'Cargando registros' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status', { name: 'Cargando clases' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Cargando movimientos...')).not.toBeInTheDocument();

    neverEndingFetch.mockRestore();
  });
});
