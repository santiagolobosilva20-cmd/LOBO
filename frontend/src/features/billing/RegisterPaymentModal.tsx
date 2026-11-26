import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, requestJson } from '../../shared/api/http';
import type {
  PaginatedResponse,
  PaymentItem,
  PaymentMethod,
  PlanItem,
  SingleResponse,
} from '../../shared/api/types';

interface RegisterPaymentModalProps {
  open: boolean;
  defaultPlanId?: number | null;
  onClose: () => void;
}

const FALLBACK_PLANS: Array<{ id: number; name: string; price_cents: number }> = [
  { id: 1, name: 'Pase diario', price_cents: 12000 },
  { id: 2, name: 'Mensualidad', price_cents: 89000 },
  { id: 3, name: 'Trimestral', price_cents: 235000 },
];

export function RegisterPaymentModal({
  open,
  defaultPlanId = null,
  onClose,
}: RegisterPaymentModalProps) {
  const queryClient = useQueryClient();
  const [memberName, setMemberName] = useState<string>('');
  const [planId, setPlanId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountInput, setAmountInput] = useState<string>('890');
  const [paidAt, setPaidAt] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [errorMsg, setErrorMsg] = useState<string>('');

  const plansQuery = useQuery({
    queryKey: ['plans', 'active-select'],
    queryFn: () => requestJson<PaginatedResponse<PlanItem>>('/plans?per_page=50&active_only=1'),
    enabled: open,
    retry: false,
  });

  const plans = plansQuery.data?.data?.length ? plansQuery.data.data : FALLBACK_PLANS;

  useEffect(() => {
    if (!open) {
      return;
    }

    const preferred =
      (defaultPlanId !== null
        ? plans.find((plan) => plan.id === defaultPlanId)
        : plans.find((plan) => plan.name.toLowerCase().includes('mensualidad'))) ?? plans[0];

    if (preferred) {
      setPlanId(String(preferred.id));
      setAmountInput(String(Math.round(preferred.price_cents / 100)));
    }
  }, [open, defaultPlanId, plansQuery.data]);

  const mutation = useMutation({
    mutationFn: () => {
      const parsedAmount = Number.parseFloat(amountInput);
      const amountCents = Number.isFinite(parsedAmount) ? Math.round(parsedAmount * 100) : undefined;

      return requestJson<SingleResponse<PaymentItem>>('/payments', {
        method: 'POST',
        body: JSON.stringify({
          member_name: memberName.trim(),
          plan_id: Number(planId),
          payment_method: paymentMethod,
          amount_cents: amountCents,
          paid_at: paidAt,
        }),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
        queryClient.invalidateQueries({ queryKey: ['members'] }),
      ]);
      setMemberName('');
      setErrorMsg('');
      onClose();
    },
    onError: (err) => {
      setErrorMsg(
        err instanceof ApiError
          ? err.message
          : 'No se pudo guardar el ingreso. Verifica la conexión con PostgreSQL.',
      );
    },
  });

  if (!open) {
    return null;
  }

  const handlePlanChange = (nextPlanId: string) => {
    setPlanId(nextPlanId);
    const selected = plans.find((plan) => String(plan.id) === nextPlanId);
    if (selected) {
      const whole = selected.price_cents % 100 === 0;
      setAmountInput(whole ? String(selected.price_cents / 100) : (selected.price_cents / 100).toFixed(2));
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    if (memberName.trim().length < 2) {
      setErrorMsg('Ingresa el nombre del socio (mínimo 2 caracteres).');
      return;
    }
    mutation.mutate();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="flex h-full w-full max-w-[400px] flex-col justify-between bg-white p-6 shadow-2xl">
        <div>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                Caja LOBO
              </p>
              <h2 id="drawer-title" className="mt-1 text-xl font-bold text-[#17191C]">
                Registrar ingreso
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-lg p-1.5 text-[#6B7280] hover:bg-[#F5F5F0] hover:text-[#17191C]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pay-member-name" className="mb-1.5 block text-xs font-medium text-[#374151]">
                Nombre del socio
              </label>
              <input
                id="pay-member-name"
                type="text"
                autoFocus
                required
                maxLength={120}
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Ej. Alex Rivera"
                className="w-full rounded-lg border border-[#E6E7E2] px-3 py-2.5 text-sm text-[#17191C] outline-none focus:border-[#A3E635] focus:ring-2 focus:ring-[#CEF542]/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pay-plan" className="mb-1.5 block text-xs font-medium text-[#374151]">
                  Plan
                </label>
                <select
                  id="pay-plan"
                  value={planId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full rounded-lg border border-[#E6E7E2] bg-white px-3 py-2.5 text-sm text-[#17191C] outline-none focus:border-[#A3E635]"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="pay-amount" className="mb-1.5 block text-xs font-medium text-[#374151]">
                  Importe (MXN)
                </label>
                <input
                  id="pay-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="tabular-nums w-full rounded-lg border border-[#E6E7E2] px-3 py-2.5 text-sm text-[#17191C] outline-none focus:border-[#A3E635]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pay-method" className="mb-1.5 block text-xs font-medium text-[#374151]">
                  Método de pago
                </label>
                <select
                  id="pay-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-lg border border-[#E6E7E2] bg-white px-3 py-2.5 text-sm text-[#17191C] outline-none focus:border-[#A3E635]"
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>

              <div>
                <label htmlFor="pay-date" className="mb-1.5 block text-xs font-medium text-[#374151]">
                  Fecha
                </label>
                <input
                  id="pay-date"
                  type="date"
                  required
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  className="w-full rounded-lg border border-[#E6E7E2] px-3 py-2.5 text-sm text-[#17191C] outline-none focus:border-[#A3E635]"
                />
              </div>
            </div>

            {errorMsg ? <p className="text-xs font-medium text-red-600">{errorMsg}</p> : null}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-2 flex w-full items-center justify-between rounded-lg bg-[#17191C] px-4 py-3 text-xs font-bold text-white hover:bg-black disabled:opacity-50"
            >
              <span>{mutation.isPending ? 'Guardando ingreso...' : 'Guardar ingreso'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-center text-[11px] text-[#9CA3AF]">
              El ingreso quedará asociado al socio y se guardará en PostgreSQL vía Laravel API.
            </p>
          </form>
        </div>
      </div>

      <button
        type="button"
        aria-label="Cerrar panel de registro"
        className="flex-1 cursor-default"
        onClick={onClose}
      />
    </div>
  );
}
