import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { PlansPage } from '../features/plans/PlansPage';
import { ApiError, extractApiError, requestJson } from '../shared/api/http';
import {
  formatCurrencyFromCents,
  getMemberStatusLabel,
  getPaymentMethodLabel,
} from '../shared/utils/format';

describe('format helpers', () => {
  it('formats cents to currency string and translates domain labels', () => {
    expect(formatCurrencyFromCents(0)).toBe('$0.00');
    expect(formatCurrencyFromCents(89000)).toBe('$890.00');
    expect(getPaymentMethodLabel('cash')).toBe('Efectivo');
    expect(getMemberStatusLabel('active')).toBe('Activo');
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

describe('DashboardPage & PlansPage', () => {
  it('renders LOBO Resumen KPIs, empty payments state and featured classes from API summary', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            kpis: {
              monthly_revenue_cents: 0,
              formatted_monthly_revenue: '$0.00',
              active_members_count: 0,
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
});
