import { useQuery } from '@tanstack/react-query';
import { DollarSign, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { requestJson } from '../../shared/api/http';
import type { PaymentsListResponse } from '../../shared/api/types';
import { KpiCard } from '../../shared/components/KpiCard';
import { PaymentsTable } from '../billing/PaymentsTable';
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
    <div>
      <div className="mt-[9px] mb-[19px] flex flex-wrap items-end justify-between gap-[18px] md:mt-3 md:mb-6">
        <div>
          <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
            COMUNIDAD LOBO
          </span>
          <h1 className="font-display mt-[7px] text-[25px] leading-[1.15] font-semibold text-[#22251f] sm:text-[29px]">
            Socios e ingresos
          </h1>
          <p className="mt-[7px] max-w-[240px] text-[11px] leading-normal text-[#83857d] sm:max-w-none">
            Consulta quién entrena contigo y cada pago registrado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPaymentModalOpen(true)}
          className="inline-flex min-h-[39px] items-center justify-center gap-[9px] rounded-[3px] bg-[#22251f] px-[15px] text-[10px] font-bold text-white transition-all hover:-translate-y-px hover:bg-[#3b4037]"
        >
          <span className="text-[15px] leading-none">＋</span> Registrar ingreso
        </button>
      </div>

      <div className="mb-[14px] grid grid-cols-2 gap-[12px] sm:max-w-[452px]">
        <KpiCard
          label="Socios registrados"
          value={stats?.distinct_members_count ?? 0}
          subtitle="Con al menos un registro"
          icon={<Users className="h-[13px] w-[13px] stroke-[1.9] text-[#22251f]" />}
          iconBgClass="bg-[#ffe0d8]"
        />
        <KpiCard
          label="Ingresos acumulados"
          value={stats?.formatted_total_revenue ?? '$0.00'}
          subtitle="Todos los movimientos"
          icon={<DollarSign className="h-[13px] w-[13px] stroke-[2.1] text-[#22251f]" />}
          iconBgClass="bg-[#d3f36b]"
        />
      </div>

      <div>
        <div className="min-w-0 overflow-hidden rounded-[3px] border border-[#e7e8e2] bg-white">
          <div className="flex min-h-[79px] flex-wrap items-center justify-between gap-3 px-[18px] py-[14px]">
            <div>
              <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
                REGISTRO COMPLETO
              </span>
              <h2 className="font-display mt-1 text-[15px] leading-[1.2] font-semibold text-[#22251f]">
                Historial de pagos
              </h2>
            </div>

            <label className="flex h-[34px] w-full items-center gap-[7px] rounded-[3px] border border-[#e7e8e2] px-[10px] text-[#898b83] focus-within:border-[#97bd42] sm:w-[min(230px,48%)]">
              <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar socio..."
                aria-label="Buscar socio"
                className="w-full min-w-0 border-0 bg-transparent text-[10px] text-[#22251f] outline-none placeholder:text-[#898b83]"
              />
            </label>
          </div>

          <PaymentsTable payments={payments} />

          {paymentsQuery.isLoading ? (
            <p className="py-10 text-center text-[10px] text-[#73756e]">Consultando historial...</p>
          ) : payments.length === 0 ? (
            <div className="px-5 py-[35px] text-center text-[#73756e]">
              <strong className="font-display block text-[14px] font-semibold text-[#22251f]">
                No hay resultados
              </strong>
              <p className="mt-1.5 text-[10px]">
                Prueba con otro nombre o registra un nuevo ingreso.
              </p>
            </div>
          ) : null}

          {meta && meta.last_page > 1 ? (
            <div className="flex items-center justify-between border-t border-[#e8e9e3] px-[18px] py-3 text-[10px]">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-[3px] border border-[#e8e9e3] px-3 py-1 font-semibold text-[#22251f] disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="tabular-nums text-[#85877f]">
                Página {meta.current_page} de {meta.last_page}
              </span>
              <button
                type="button"
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-[3px] border border-[#e8e9e3] px-3 py-1 font-semibold text-[#22251f] disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </div>

        <p className="mt-[13px] text-[9px] text-[#999b93]">
          Los registros se guardan en PostgreSQL vía Laravel API.
        </p>
      </div>

      <RegisterPaymentModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
    </div>
  );
}
