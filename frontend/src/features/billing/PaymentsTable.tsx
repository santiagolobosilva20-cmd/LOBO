import type { PaymentItem } from '../../shared/api/types';
import { getMemberInitials, getPaymentMethodLabel } from '../../shared/utils/format';

interface PaymentsTableProps {
  payments: PaymentItem[];
}

const AVATAR_COLORS = [
  'bg-[#d9ef9f]',
  'bg-[#ffd3c8]',
  'bg-[#cbe4f3]',
  'bg-[#ebd8f1]',
  'bg-[#f2e3b5]',
] as const;

export function PaymentsTable({ payments }: PaymentsTableProps) {
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
            <th className="px-[13px] py-[10px] text-right text-[8px] font-bold whitespace-nowrap text-[#92948c] uppercase">
              Importe
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
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
              <td className="tabular-nums px-[13px] py-[11px] text-right text-[10px] font-bold whitespace-nowrap text-[#22251f]">
                {payment.formatted_amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
