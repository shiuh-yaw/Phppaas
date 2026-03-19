/**
 * OmsTableSkeleton — Loading skeleton for OMS data tables.
 * Displays animated placeholder rows matching the OMS dark theme.
 */

const pp = { fontFamily: "'Poppins', sans-serif" };

interface OmsTableSkeletonProps {
  /** Number of columns */
  columns?: number;
  /** Number of rows to display */
  rows?: number;
  /** Whether to show a header row */
  showHeader?: boolean;
  /** Whether to show stat cards above the table */
  showStats?: number;
}

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-[#1f2937] ${className}`}
    />
  );
}

export function OmsTableSkeleton({
  columns = 6,
  rows = 8,
  showHeader = true,
  showStats = 0,
}: OmsTableSkeletonProps) {
  return (
    <div className="space-y-4" style={pp}>
      {/* Stat cards skeleton */}
      {showStats > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: showStats }).map((_, i) => (
            <div
              key={`stat-${i}`}
              className="p-4 rounded-lg border border-[#1f2937] bg-[#0a0e1a]"
            >
              <Shimmer className="h-3 w-20 mb-3" />
              <Shimmer className="h-6 w-24 mb-1" />
              <Shimmer className="h-2.5 w-14 mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Search bar skeleton */}
      <div className="flex items-center gap-3">
        <Shimmer className="h-8 flex-1 max-w-[280px]" />
        <Shimmer className="h-8 w-20" />
        <Shimmer className="h-8 w-20" />
      </div>

      {/* Table skeleton */}
      <div className="border border-[#1f2937] rounded-lg overflow-hidden">
        {showHeader && (
          <div className="flex items-center gap-4 px-4 py-2.5 bg-[#0a0e1a] border-b border-[#1f2937]">
            {Array.from({ length: columns }).map((_, i) => (
              <Shimmer
                key={`hdr-${i}`}
                className="h-3"
                style={{ width: i === 0 ? "15%" : i === columns - 1 ? "8%" : `${60 / (columns - 2)}%` } as React.CSSProperties}
              />
            ))}
          </div>
        )}
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={`row-${r}`}
            className="flex items-center gap-4 px-4 py-3 border-b border-[#1f2937] last:border-0"
          >
            {Array.from({ length: columns }).map((_, c) => (
              <Shimmer
                key={`cell-${r}-${c}`}
                className="h-3"
                style={{ width: c === 0 ? "15%" : c === columns - 1 ? "8%" : `${60 / (columns - 2)}%` } as React.CSSProperties}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <Shimmer className="h-3 w-28" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={`pg-${i}`} className="h-6 w-6" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * OmsStatsSkeleton — Loading skeleton for stat cards only
 */
export function OmsStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={pp}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border border-[#1f2937] bg-[#0a0e1a]">
          <Shimmer className="h-3 w-20 mb-3" />
          <Shimmer className="h-6 w-24 mb-1" />
          <Shimmer className="h-2.5 w-14 mt-2" />
        </div>
      ))}
    </div>
  );
}
