import { useQuery } from '@tanstack/react-query';
import { DollarSign, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { requestJson } from '../../shared/api/http';
import type { PaymentsListResponse } from '../../shared/api/types';
import { KpiCard } from '../../shared/components/KpiCard';
import { getPaymentMethodLabel } from '../../shared/utils/format';
import { RegisterPaymentModal } from '../billing/RegisterPaymentModal';

export function MembersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const paymentsQuery = useQuery({
    queryKey: ['payments', { page, search }],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: '12' });
      if (search.trim() !== '') params.set('search', search.trim());
      return requestJson<PaymentsListResponse>(`/payments?${params.toString()}`);
    },
    retry: false,
  });

  const payments = paymentsQuery.data?.data ?? [];
  const meta = paymentsQuery.data?.meta;
  const stats = paymentsQuery.data?.stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
            Comunidad LOBO
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#17191C] sm:text-3xl">
            Socios e ingresos
          </h1>
          <p className="mt-1 text-xs text-[#6B7280] sm:text-sm">
            Consulta quién entra contigo y cada pago registrado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPaymentModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#17191C] px-4 py-2.5 text-xs font-bold text-white hover:bg-black"
        >
          <Plus className="h-4 w-4" />
          Registrar ingreso
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-xl">
        <KpiCard
          label="Socios registrados"
          value={stats?.distinct_members_count ?? 0}
          subtitle="Con al menos un registro"
          icon={<Users className="h-4 w-4 text-rose-700" />}
          iconBgClass="bg-rose-50"
        />
        <KpiCard
          label="Ingresos acumulados"
          value={stats?.formatted_total_revenue ?? '$0.00'}
          subtitle="Todos los movimientos"
          icon={<DollarSign className="h-4 w-4 text-[#17191C]" />}
          iconBgClass="bg-[#CEF542]"
        />
      </div>

      <div>
        <div className="rounded-xl border border-[#E6E7E2] bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                Registro completo
              </p>
              <h2 className="text-base font-bold text-[#17191C]">Historial de pagos</h2>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[#9CA3AF]" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar socio..."
                aria-label="Buscar socio"
                className="w-full rounded-lg border border-[#E6E7E2] py-2 pr-3 pl-9 text-xs text-[#17191C] outline-none focus:border-[#17191C]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6E7E2] bg-[#FAFBF9] text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                  <th className="px-3 py-2.5">Socio</th>
                  <th className="px-3 py-2.5">Plan</th>
                  <th className="px-3 py-2.5">Fecha</th>
                  <th className="px-3 py-2.5">Método</th>
                  <th className="px-3 py-2.5 text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-[#F2F3EE] last:border-0">
                    <td className="px-3 py-3 font-semibold text-[#17191C]">{payment.member_name}</td>
                    <td className="px-3 py-3 text-[#4B5563]">{payment.plan_name}</td>
                    <td className="tabular-nums px-3 py-3 text-[#6B7280]">{payment.paid_at}</td>
                    <td className="px-3 py-3 text-[#4B5563]">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </td>
                    <td className="tabular-nums px-3 py-3 text-right font-bold text-[#17191C]">
                      {payment.formatted_amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paymentsQuery.isLoading ? (
            <p className="py-10 text-center text-xs text-[#6B7280]">Consultando historial...</p>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-[#17191C]">No hay resultados</p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Prueba con otro nombre o registra un nuevo ingreso.
              </p>
            </div>
          ) : null}

          {meta && meta.last_page > 1 ? (
            <div className="mt-4 flex items-center justify-between border-t border-[#E6E7E2] pt-3 text-xs">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[#E6E7E2] px-3 py-1 font-semibold disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="tabular-nums text-[#6B7280]">
                Página {meta.current_page} de {meta.last_page}
              </span>
              <button
                type="button"
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[#E6E7E2] px-3 py-1 font-semibold disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </div>

        <p className="mt-2.5 px-1 text-[11px] text-[#9CA3AF]">
          Los registros se guardan en PostgreSQL vía Laravel API.
        </p>
      </div>

      <RegisterPaymentModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
    </div>
  );
}
