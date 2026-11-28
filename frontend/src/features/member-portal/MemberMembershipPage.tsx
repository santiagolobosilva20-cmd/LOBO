import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, CreditCard } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ApiError, requestJson } from '../../shared/api/http';
import type { PaymentItem, PaymentMethod, SingleResponse } from '../../shared/api/types';
import { MembershipCardSkeleton, TableSkeleton } from '../../shared/components/Skeletons';
import { useToast } from '../../shared/components/ToastContext';
import { getMembershipStatusLabel } from '../../shared/utils/format';
import { PaymentsTable } from '../billing/PaymentsTable';
import {
  useClubPlansQuery,
  useMemberMembershipsQuery,
  useMemberPaymentsQuery,
} from './memberQueries';

export function MemberMembershipPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const membershipsQuery = useMemberMembershipsQuery();
  const paymentsQuery = useMemberPaymentsQuery();
  const plansQuery = useClubPlansQuery();

  const [requestOpen, setRequestOpen] = useState(false);
  const [planId, setPlanId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const defaultPlan = plansQuery.data?.data?.[1] ?? plansQuery.data?.data?.[0];
    if (defaultPlan && planId === '') {
      setPlanId(String(defaultPlan.id));
    }
  }, [plansQuery.data, planId]);

  const requestPaymentMutation = useMutation({
    mutationFn: () =>
      requestJson<SingleResponse<PaymentItem>>('/member/payment-requests', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: Number(planId),
          payment_method: paymentMethod,
          notes: notes.trim() || null,
        }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['member', 'payments'] }),
        queryClient.invalidateQueries({ queryKey: ['member', 'memberships'] }),
      ]);
      showToast('Solicitud de pago enviada a revisión.');
      setNotes('');
      setFormError('');
      setRequestOpen(false);
    },
    onError: (err) => {
      setFormError(
        err instanceof ApiError ? err.message : 'No se pudo enviar tu solicitud de pago.',
      );
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    if (!planId) {
      setFormError('Selecciona un plan disponible.');
      return;
    }
    requestPaymentMutation.mutate();
  }

  const memberships = membershipsQuery.data?.data ?? [];
  const activeMembership = membershipsQuery.data?.active_membership ?? memberships[0] ?? null;
  const payments = paymentsQuery.data?.data ?? [];
  const plans = plansQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="block text-[9px] font-bold tracking-[0.02em] text-[#8b8e84] uppercase">
            CUENTA DEL SOCIO
          </span>
          <h1 className="font-display mt-[7px] text-[24px] leading-[1.08] font-bold text-[#22251f] sm:text-[26px]">
            Mi membresía y pagos
          </h1>
          <p className="mt-1.5 text-[11px] text-[#6d7067]">
            Vigencia de tu plan actual, días restantes y solicitudes de renovación.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRequestOpen(true)}
          className="lobo-pressable inline-flex min-h-[39px] items-center justify-center gap-2 rounded-[3px] bg-[#d3f36b] px-4 text-[10px] font-bold text-[#22251f] hover:bg-[#c8eb55]"
        >
          <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
          Solicitar renovación / pago
        </button>
      </div>

      <section className="lobo-stagger-item rounded-[3px] border border-[#e7e8e2] bg-white p-5">
        {membershipsQuery.isLoading ? (
          <MembershipCardSkeleton />
        ) : activeMembership ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[3px] bg-[#d3f36b] text-[#22251f]">
                <Award className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#22251f] px-2 py-0.5 text-[8px] font-bold text-[#d3f36b] uppercase">
                    {getMembershipStatusLabel(activeMembership.status)}
                  </span>
                  {activeMembership.is_expiring_soon ? (
                    <span className="bg-[#ffe0d8] px-2 py-0.5 text-[8px] font-bold text-[#9b2c1a] uppercase">
                      Por vencer pronto
                    </span>
                  ) : null}
                </div>
                <h2 className="font-display mt-1.5 text-[20px] font-semibold text-[#22251f]">
                  {activeMembership.plan_name}
                </h2>
                <p className="tabular-nums mt-0.5 text-[11px] text-[#686b63]">
                  Vigencia del {activeMembership.starts_at} al {activeMembership.ends_at}
                </p>
              </div>
            </div>

            <div className="rounded-[3px] border border-[#eceee7] bg-[#f8f9f5] px-5 py-3 text-right">
              <span className="block text-[8px] font-bold text-[#8b8e84] uppercase">
                DÍAS RESTANTES
              </span>
              <strong className="font-display tabular-nums text-[28px] leading-none font-bold text-[#22251f]">
                {activeMembership.days_remaining}
              </strong>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-[#73756e]">
            <strong className="font-display block text-[15px] font-semibold text-[#22251f]">
              Aún no tienes una membresía activa
            </strong>
            <p className="mt-1 text-[10px]">
              Envía una solicitud de pago para que administración active tu acceso.
            </p>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-[3px] border border-[#e7e8e2] bg-white">
        <div className="border-b border-[#f0f1ec] px-[18px] py-[14px]">
          <span className="block text-[8px] font-bold text-[#8b8e84] uppercase">
            HISTORIAL PERSONAL
          </span>
          <h2 className="font-display mt-0.5 text-[16px] font-semibold text-[#22251f]">
            Mis pagos y solicitudes
          </h2>
        </div>

        {paymentsQuery.isLoading ? (
          <TableSkeleton rows={3} cols={6} />
        ) : (
          <>
            <PaymentsTable payments={payments} />
            {payments.length === 0 ? (
              <p className="py-10 text-center text-[10px] text-[#73756e]">
                No tienes pagos ni solicitudes registradas.
              </p>
            ) : null}
          </>
        )}
      </section>

      {requestOpen
        ? createPortal(
            <div
              className="lobo-backdrop-enter fixed inset-0 z-50 flex items-center justify-center bg-[#1c201b]/75 p-3.5 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              onClick={(e) => {
                if (e.target === e.currentTarget) setRequestOpen(false);
              }}
            >
              <div className="lobo-modal-enter w-[min(430px,100%)] rounded-[4px] bg-white p-6 shadow-[0_20px_70px_rgba(23,26,22,0.44)]">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
                      SOLICITUD DE PAGO
                    </span>
                    <h2 className="font-display mt-1 text-[21px] font-semibold text-[#22251f]">
                      Reportar o solicitar renovación
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequestOpen(false)}
                    aria-label="Cerrar"
                    className="grid h-[31px] w-[31px] place-items-center rounded-[3px] border border-[#e8e9e3] text-[20px]"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                      Plan a renovar o adquirir
                    </label>
                    <select
                      value={planId}
                      onChange={(e) => setPlanId(e.target.value)}
                      className="min-h-[39px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-2.5 text-[11px]"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name} ({p.formatted_price} / {p.billing_period_label})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                      Método de pago
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="min-h-[39px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-2.5 text-[11px]"
                    >
                      <option value="transfer">Transferencia / comprobante</option>
                      <option value="card">Tarjeta</option>
                      <option value="cash">Pagar en recepción (Efectivo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                      Referencia o nota (opcional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej. Referencia transferencia #4821"
                      className="min-h-[39px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                    />
                  </div>

                  {formError ? (
                    <p role="alert" className="text-[10px] text-[#b42318]">
                      {formError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={requestPaymentMutation.isPending}
                    className="min-h-[41px] w-full rounded-[3px] bg-[#22251f] px-4 text-[11px] font-bold text-white hover:bg-[#3b4037] disabled:opacity-60"
                  >
                    {requestPaymentMutation.isPending ? 'Enviando...' : 'Enviar solicitud'}
                  </button>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

