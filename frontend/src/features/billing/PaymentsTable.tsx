import type { PaymentItem } from '../../shared/api/types';
import {
  getMemberInitials,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '../../shared/utils/format';

interface PaymentsTableProps {
  payments: PaymentItem[];
  onApprove?: (paymentId: number) => void;
  onReject?: (paymentId: number) => void;
  busyPaymentId?: number | null;
}

const AVATAR_COLORS = [
  'bg-[#d9ef9f]',
  'bg-[#ffd3c8]',
  'bg-[#cbe4f3]',
  'bg-[#ebd8f1]',
  'bg-[#f2e3b5]',
] as const;

export function PaymentsTable({
  payments,
  onApprove,
  onReject,
  busyPaymentId = null,
}: PaymentsTableProps) {
  const showActions = Boolean(onApprove || onReject);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="bg-[#f8f9f5]">
          <tr>
            <th className="px-[13px] py-[10px] text-[8px] font-bold whitespace-nowrap text-[#92948c] uppercase">
              Socio
            </th>
            <th className="px-[13px] py-[10px] text-[8px] font-bold whitespace-nowrap text-[#92948c] uppercase">
              Plan
            </th>
            <th className="px-[13px] py-[10px] text-[8px] font-bold whitespace-nowrap text-[#92948c] uppercase">
              Fecha
            </th>
            <th className="px-[13px] py-[10px] text-[8px] font-bold whitespace-nowrap text-[#92948c] uppercase">
              Método
            </th>
            <th className="px-[13px] py-[10px] text-[8px] font-bold whitespace-nowrap text-[#92948c] uppercase">
              Estado
            </th>
            <th className="px-[13px] py-[10px] text-[8px] font-bold whitespace-nowrap text-[#92948c] uppercase text-right">
              Importe
            </th>
            {showActions ? (
              <th className="px-[13px] py-[10px] text-[8px] font-bold whitespace-nowrap text-[#92948c] uppercase text-right">
                Revisión
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => {
            const status = payment.status ?? 'paid';
            const badgeClass =
              status === 'paid'
                ? 'bg-[#e6f7bd] text-[#22251f]'
                : status === 'pending'
                  ? 'bg-[#dceefa] text-[#184c6b]'
                  : 'bg-[#ffe0d8] text-[#9b2c1a]';

            return (
              <tr key={payment.id} className="border-b border-[#f0f1ec] last:border-b-0">
                <td className="px-[13px] py-[11px] text-[10px] whitespace-nowrap text-[#22251f]">
                  <span className="flex items-center gap-2 font-semibold text-[#22251f]">
                    <span
                      className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full text-[8px] font-bold text-[#262820] ${
                        AVATAR_COLORS[index % AVATAR_COLORS.length]
                      }`}
                      aria-hidden="true"
                    >
                      {getMemberInitials(payment.member_name)}
                    </span>
                    {payment.member_name}
                  </span>
                </td>
                <td className="px-[13px] py-[11px] text-[10px] whitespace-nowrap text-[#666960]">
                  {payment.plan_name}
                </td>
                <td className="tabular-nums px-[13px] py-[11px] text-[10px] whitespace-nowrap text-[#666960]">
                  {payment.paid_at}
                </td>
                <td className="px-[13px] py-[11px] text-[10px] whitespace-nowrap text-[#666960]">
                  {getPaymentMethodLabel(payment.payment_method)}
                </td>
                <td className="px-[13px] py-[11px] whitespace-nowrap">
                  <span
                    className={`inline-block rounded-[2px] px-2 py-0.5 text-[8px] font-bold uppercase ${badgeClass}`}
                  >
                    {getPaymentStatusLabel(status)}
                  </span>
                </td>
                <td className="tabular-nums px-[13px] py-[11px] text-right text-[10px] font-bold whitespace-nowrap text-[#22251f]">
                  {payment.formatted_amount}
                </td>
                {showActions ? (
                  <td className="px-[13px] py-[11px] text-right whitespace-nowrap">
                    {status === 'pending' ? (
                      <div className="inline-flex items-center gap-1.5">
                        {onApprove ? (
                          <button
                            type="button"
                            disabled={busyPaymentId === payment.id}
                            onClick={() => onApprove(payment.id)}
                            className="rounded-[3px] bg-[#d3f36b] px-2.5 py-1 text-[9px] font-bold text-[#22251f] hover:bg-[#c5ea52] disabled:opacity-50"
                          >
                            Aprobar
                          </button>
                        ) : null}
                        {onReject ? (
                          <button
                            type="button"
                            disabled={busyPaymentId === payment.id}
                            onClick={() => onReject(payment.id)}
                            className="rounded-[3px] border border-[#e7e8e2] px-2 py-1 text-[9px] font-semibold text-[#9b2c1a] hover:bg-red-50 disabled:opacity-50"
                          >
                            Rechazar
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-[9px] text-[#9b9e95]">—</span>
                    )}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
