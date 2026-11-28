import type { CSSProperties } from 'react';

export function SkeletonBlock({
  className = '',
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`block rounded-[2px] ${dark ? 'lobo-skeleton-dark' : 'lobo-skeleton'} ${className}`}
    />
  );
}

export function staggerStyle(index: number): CSSProperties {
  return { '--stagger-index': index } as CSSProperties;
}

export function AppHydrationSkeleton() {
  return (
    <div
      className="min-h-screen bg-[#f3f4ef]"
      role="status"
      aria-busy="true"
      aria-label="Cargando aplicación LOBO Club"
    >
      <span className="sr-only">Verificando sesión en LOBO Club...</span>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-[218px] border-r border-[#e8e9e3] bg-white px-[18px] pt-[29px] pb-[17px] lg:flex lg:flex-col xl:w-[244px]">
        <div className="flex items-center gap-[11px] px-[9px]">
          <SkeletonBlock className="h-[39px] w-[39px] shrink-0 rounded-none" />
          <div className="space-y-1.5">
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-2 w-24" />
          </div>
        </div>
        <div className="mt-[42px] space-y-2 px-1">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonBlock key={idx} className="h-[40px] w-full rounded-[3px]" />
          ))}
        </div>
        <div className="mt-auto space-y-3 border-t border-[#e8e9e3] pt-3">
          <SkeletonBlock className="h-[54px] w-full rounded-[3px]" />
          <div className="flex items-center gap-2.5">
            <SkeletonBlock className="h-[31px] w-[31px] rounded-full" />
            <div className="flex-1 space-y-1.5">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-2 w-16" />
            </div>
          </div>
        </div>
      </aside>

      <div className="min-h-screen max-w-[1600px] px-[17px] pb-[30px] md:px-[25px] lg:ml-[218px] lg:px-[43px] xl:ml-[244px] 2xl:mr-auto">
        <header className="flex h-[59px] items-center justify-between border-b border-[#e6e7e1] md:h-[71px]">
          <SkeletonBlock className="h-3.5 w-44" />
          <SkeletonBlock className="h-[31px] w-[31px] rounded-full" />
        </header>

        <main className="lobo-view-enter space-y-6 pt-[17px] md:pt-[26px]">
          <div className="min-h-[210px] rounded-[3px] bg-[#22251f] p-7">
            <SkeletonBlock dark className="h-3 w-28" />
            <SkeletonBlock dark className="mt-4 h-9 w-72 max-w-full" />
            <SkeletonBlock dark className="mt-2 h-9 w-56 max-w-full" />
            <SkeletonBlock dark className="mt-4 h-3 w-64 max-w-full" />
          </div>

          <div className="grid grid-cols-2 gap-[12px] xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-[3px] border border-[#e7e8e2] bg-white px-4 pt-[15px] pb-[14px]"
              >
                <div className="flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-[26px] w-[26px] rounded-full" />
                </div>
                <SkeletonBlock className="mt-[15px] mb-2 h-6 w-20" />
                <SkeletonBlock className="h-2.5 w-28" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-[13px] lg:grid-cols-12">
            <div className="rounded-[3px] border border-[#e7e8e2] bg-white p-5 lg:col-span-7">
              <SkeletonBlock className="h-4 w-40" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonBlock key={idx} className="h-10 w-full" />
                ))}
              </div>
            </div>
            <div className="rounded-[3px] border border-[#e7e8e2] bg-white p-5 lg:col-span-5">
              <SkeletonBlock className="h-4 w-36" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonBlock key={idx} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div
      className="w-full overflow-x-auto"
      role="status"
      aria-busy="true"
      aria-label="Cargando registros"
    >
      <span className="sr-only">Cargando tabla...</span>
      <table className="w-full border-collapse text-left">
        <thead className="bg-[#f8f9f5]">
          <tr>
            {Array.from({ length: cols }).map((_, idx) => (
              <th key={idx} className="px-[13px] py-[12px]">
                <SkeletonBlock className="h-2.5 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-[#f0f1ec] last:border-b-0">
              {Array.from({ length: cols }).map((__, colIdx) => (
                <td key={colIdx} className="px-[13px] py-[13px]">
                  {colIdx === 0 ? (
                    <div className="flex items-center gap-2">
                      <SkeletonBlock className="h-[26px] w-[26px] shrink-0 rounded-full" />
                      <SkeletonBlock className="h-3 w-28" />
                    </div>
                  ) : (
                    <SkeletonBlock
                      className={`h-3 ${colIdx === cols - 1 ? 'ml-auto w-14' : 'w-20'}`}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FeaturedSessionsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="px-[17px]" role="status" aria-busy="true" aria-label="Cargando clases">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex min-h-[62px] items-center gap-[10px] border-b border-[#eff0eb] last:border-b-0"
        >
          <div className="w-[39px] space-y-1.5">
            <SkeletonBlock className="h-3 w-8" />
            <SkeletonBlock className="h-2 w-5" />
          </div>
          <SkeletonBlock className="h-[31px] w-[3px] shrink-0 rounded-[5px]" />
          <div className="flex-1 space-y-1.5">
            <SkeletonBlock className="h-3 w-32" />
            <SkeletonBlock className="h-2.5 w-24" />
          </div>
          <SkeletonBlock className="h-3 w-8" />
        </div>
      ))}
    </div>
  );
}

export function MembershipCardSkeleton() {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4"
      role="status"
      aria-busy="true"
      aria-label="Cargando membresía"
    >
      <div className="flex items-start gap-3">
        <SkeletonBlock className="h-10 w-10 shrink-0 rounded-[3px]" />
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="h-3 w-48" />
        </div>
      </div>
      <div className="rounded-[3px] border border-[#eceee7] bg-[#f8f9f5] px-5 py-3">
        <SkeletonBlock className="h-2.5 w-20" />
        <SkeletonBlock className="mt-2 ml-auto h-7 w-12" />
      </div>
    </div>
  );
}

export function DetailCardsGridSkeleton({
  variant,
  count = 2,
}: {
  variant: 'routine' | 'nutrition' | 'schedule' | 'workout' | 'plan';
  count?: number;
}) {
  if (variant === 'plan') {
    return (
      <section
        className="grid grid-cols-1 gap-[14px] lg:grid-cols-3"
        role="status"
        aria-busy="true"
        aria-label="Cargando planes"
      >
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="min-h-[300px] border border-[#e7e8e2] bg-white p-[21px] md:min-h-[332px]"
          >
            <SkeletonBlock className="h-2.5 w-24" />
            <SkeletonBlock className="mt-4 h-[41px] w-[41px] rounded-full" />
            <SkeletonBlock className="mt-4 h-6 w-36" />
            <SkeletonBlock className="mt-2 h-3 w-full" />
            <SkeletonBlock className="mt-5 h-8 w-28" />
            <div className="mt-6 space-y-2.5 border-t border-[#f0f1ec] pt-4">
              <SkeletonBlock className="h-3 w-4/5" />
              <SkeletonBlock className="h-3 w-3/4" />
              <SkeletonBlock className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (variant === 'workout') {
    return (
      <section
        className="grid grid-cols-1 gap-[13px] md:grid-cols-2"
        role="status"
        aria-busy="true"
        aria-label="Cargando disciplinas"
      >
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="flex min-h-[205px] items-end bg-[#181c17] p-[21px] sm:min-h-[226px]"
          >
            <div className="w-full space-y-2.5">
              <SkeletonBlock dark className="h-2.5 w-28" />
              <SkeletonBlock dark className="h-6 w-44" />
              <SkeletonBlock dark className="h-3 w-3/4" />
              <div className="flex gap-2 pt-1">
                <SkeletonBlock dark className="h-5 w-24" />
                <SkeletonBlock dark className="h-5 w-28" />
              </div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (variant === 'schedule') {
    return (
      <section
        className="grid grid-cols-1 gap-[15px] md:grid-cols-2"
        role="status"
        aria-busy="true"
        aria-label="Cargando horarios"
      >
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="rounded-[3px] border border-[#e7e8e2] bg-white p-[18px]">
            <SkeletonBlock className="mb-3 h-5 w-24" />
            <div className="space-y-3 border-t border-[#f0f1ec] pt-3">
              {Array.from({ length: 3 }).map((__, sIdx) => (
                <div key={sIdx} className="flex items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-40" />
                    <SkeletonBlock className="h-2.5 w-52" />
                  </div>
                  <SkeletonBlock className="h-7 w-24 rounded-[3px]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      className="grid grid-cols-1 gap-[15px] lg:grid-cols-2"
      role="status"
      aria-busy="true"
      aria-label={variant === 'routine' ? 'Cargando rutinas' : 'Cargando planes nutricionales'}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <article
          key={idx}
          className="overflow-hidden rounded-[3px] border border-[#e7e8e2] bg-white"
        >
          <div className="border-b border-[#f0f1ec] p-[18px]">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
            <SkeletonBlock className="mt-3 h-6 w-56 max-w-full" />
            <SkeletonBlock className="mt-2 h-3 w-44" />
            {variant === 'nutrition' ? (
              <div className="mt-3 space-y-2">
                <SkeletonBlock className="h-2 w-full" />
                <div className="flex gap-3">
                  <SkeletonBlock className="h-2.5 w-24" />
                  <SkeletonBlock className="h-2.5 w-24" />
                  <SkeletonBlock className="h-2.5 w-20" />
                </div>
              </div>
            ) : null}
          </div>
          <div className="divide-y divide-[#f0f1ec] p-[18px]">
            {Array.from({ length: 4 }).map((__, rowIdx) => (
              <div key={rowIdx} className="flex items-center justify-between gap-3 py-2.5">
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-3 w-44" />
                  <SkeletonBlock className="h-2.5 w-56 max-w-full" />
                </div>
                <SkeletonBlock className="h-3 w-20" />
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

