import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  subtitle: string;
  icon: ReactNode;
  iconBgClass: string;
}

export function KpiCard({ label, value, subtitle, icon, iconBgClass }: KpiCardProps) {
  return (
    <article className="flex items-start justify-between gap-3 rounded-xl border border-[#E6E7E2] bg-white p-5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#6B7280]">{label}</p>
        <p className="tabular-nums mt-2 text-2xl font-bold tracking-tight text-[#17191C]">{value}</p>
        <p className="mt-1.5 text-xs text-[#6B7280]">{subtitle}</p>
      </div>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBgClass}`}
        aria-hidden="true"
      >
        {icon}
      </div>
    </article>
  );
}

