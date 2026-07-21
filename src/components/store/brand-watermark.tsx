/** Diagonal “confidential”-style watermark for thekerala.store. */
export function BrandWatermark({ className = '' }: { className?: string }) {
  const rows = Array.from({ length: 14 }, (_, i) => i);
  const cols = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-[1] overflow-hidden select-none ${className}`}
    >
      <div className="absolute left-1/2 top-1/2 flex w-[220%] -translate-x-1/2 -translate-y-1/2 -rotate-45 flex-col gap-10 opacity-[0.035]">
        {rows.map((row) => (
          <div
            key={row}
            className="flex whitespace-nowrap"
            style={{ marginLeft: row % 2 === 0 ? '0' : '4.5rem' }}
          >
            {cols.map((col) => (
              <span
                key={`${row}-${col}`}
                className="px-6 font-serif text-[20px] font-medium tracking-[-0.02em] text-[#3d6b58]"
              >
                thekerala.store
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
