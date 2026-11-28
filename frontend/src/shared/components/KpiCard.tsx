import type { ReactNode } from 'react';
import { SkeletonBlock, staggerStyle } from './Skeletons';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  subtitle: string;
  icon: ReactNode;
  iconBgClass: string;
  loading?: boolean;
  index?: number;
}

export function KpiCard({
  label,
  value,
  subtitle,
  icon,
  iconBgClass,
  loading = false,
  index,
}: KpiCardProps) {
  return (
    <article className="min-w-0 rounded-[3px] border border-[#e7e8e2] bg-white px-4 pt-[15px] pb-[14px]">
      <div className="flex items-center justify-between gap-1.5 text-[10px] text-[#777971]">
        <span>{label}</span>
        <span
          className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full ${iconBgClass}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      {loading ? (
        <div role="status" aria-busy="true" aria-label={`Cargando ${label}`}>
          <SkeletonBlock className="mt-[13px] mb-2 h-[23px] w-24" />
          <SkeletonBlock className="h-2.5 w-28" />
        </div>
      ) : (
        <div
          style={index !== undefined ? staggerStyle(index) : undefined}
          className={index !== undefined ? 'lobo-stagger-item' : undefined}
        >
          <strong className="font-display tabular-nums mt-[13px] mb-1 block truncate text-[25px] leading-none font-semibold text-[#22251f]">
            {value}
          </strong>
          <span className="block text-[9px] text-[#9a9c94]">{subtitle}</span>
        </div>
      )}
    </article>
  );
}
