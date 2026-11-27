import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ApiError, requestJson } from '../../shared/api/http';
import type {
  PaginatedResponse,
  PaymentItem,
  PaymentMethod,
  PlanItem,
  SingleResponse,
} from '../../shared/api/types';
import { useToast } from '../../shared/components/ToastContext';

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
  const { showToast } = useToast();
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
    onSuccess: async (res) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
        queryClient.invalidateQueries({ queryKey: ['members'] }),
        queryClient.invalidateQueries({ queryKey: ['memberships'] }),
      ]);
      showToast(
        `Ingreso de ${res.data.formatted_amount} registrado para ${res.data.member_name}.`,
      );
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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c201b]/75 p-3.5 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-[min(440px,100%)] rounded-[4px] bg-white p-6 shadow-[0_20px_70px_rgba(23,26,22,0.44)]">
        <div className="mb-[21px] flex items-start justify-between">
          <div>
            <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">CAJA LOBO</span>
            <h2
              id="dialog-title"
              className="font-display mt-[5px] text-[23px] leading-tight font-semibold text-[#22251f]"
            >
              Registrar ingreso
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-[31px] w-[31px] place-items-center rounded-[3px] border border-[#e8e9e3] bg-white text-[22px] leading-none text-[#22251f] hover:bg-[#f5f6f1]"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="pay-member-name" className="mb-[6px] block text-[9px] font-bold text-[#5f6259]">
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
            className="mb-[14px] min-h-[39px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-[10px] text-[11px] text-[#22251f] outline-none focus:border-[#97bd42] focus:shadow-[0_0_0_2px_rgba(211,243,107,0.38)]"
          />

          <div className="grid grid-cols-2 gap-[11px]">
            <div>
              <label htmlFor="pay-plan" className="mb-[6px] block text-[9px] font-bold text-[#5f6259]">
                Plan
              </label>
              <select
                id="pay-plan"
                value={planId}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="mb-[14px] min-h-[39px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-[10px] text-[11px] text-[#22251f] outline-none focus:border-[#97bd42] focus:shadow-[0_0_0_2px_rgba(211,243,107,0.38)]"
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pay-amount" className="mb-[6px] block text-[9px] font-bold text-[#5f6259]">
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
                className="tabular-nums mb-[14px] min-h-[39px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-[10px] text-[11px] text-[#22251f] outline-none focus:border-[#97bd42] focus:shadow-[0_0_0_2px_rgba(211,243,107,0.38)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[11px]">
            <div>
              <label htmlFor="pay-method" className="mb-[6px] block text-[9px] font-bold text-[#5f6259]">
                Método de pago
              </label>
              <select
                id="pay-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="mb-[14px] min-h-[39px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-[10px] text-[11px] text-[#22251f] outline-none focus:border-[#97bd42] focus:shadow-[0_0_0_2px_rgba(211,243,107,0.38)]"
              >
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>

            <div>
              <label htmlFor="pay-date" className="mb-[6px] block text-[9px] font-bold text-[#5f6259]">
                Fecha
              </label>
              <input
                id="pay-date"
                type="date"
                required
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                className="mb-[14px] min-h-[39px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-[10px] text-[11px] text-[#22251f] outline-none focus:border-[#97bd42] focus:shadow-[0_0_0_2px_rgba(211,243,107,0.38)]"
              />
            </div>
          </div>

          {errorMsg ? <p className="mb-3 text-[11px] font-medium text-red-600">{errorMsg}</p> : null}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-1 flex min-h-[39px] w-full items-center rounded-[3px] bg-[#22251f] px-[15px] text-[10px] font-bold text-white transition-all hover:-translate-y-px hover:bg-[#3b4037] disabled:opacity-50"
          >
            <span>{mutation.isPending ? 'Guardando ingreso...' : 'Guardar ingreso'}</span>
            <span className="ml-auto text-[15px] leading-none">→</span>
          </button>

          <p className="mt-[11px] text-center text-[8px] text-[#92948c]">
            El ingreso quedará asociado al socio y se guardará en PostgreSQL vía Laravel API.
          </p>
        </form>
      </div>
    </div>,
    document.body,
  );
}
