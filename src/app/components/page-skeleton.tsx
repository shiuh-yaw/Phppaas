/**
 * Skeleton placeholders for Profile and Portfolio pages
 * when user is not authenticated.
 */

const pp = { fontFamily: "'Poppins', sans-serif" };

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-lg bg-[#f0f1f3] animate-pulse ${className ?? ""}`}
      style={style}
    />
  );
}

/* ==================== PROFILE SKELETON ==================== */
export function ProfileSkeleton() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6" style={pp}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
        <Shimmer className="size-20 sm:size-24 !rounded-2xl flex-shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <Shimmer className="h-6 w-40" />
          <Shimmer className="h-4 w-28" />
          <div className="flex items-center gap-3 mt-1">
            <Shimmer className="h-5 w-20 !rounded-full" />
            <Shimmer className="h-3 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Shimmer className="h-9 w-24 !rounded-lg" />
          <Shimmer className="h-9 w-24 !rounded-lg" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="p-3 bg-white border border-[#f0f1f3] rounded-xl flex flex-col gap-2">
            <Shimmer className="size-5 !rounded-md" />
            <Shimmer className="h-3 w-16 mt-1" />
            <Shimmer className="h-6 w-24" />
          </div>
        ))}
      </div>

      {/* KYC Banner placeholder */}
      <Shimmer className="h-[72px] w-full !rounded-2xl" />

      {/* Tabs */}
      <div className="flex items-center gap-5 h-10">
        {[80, 72, 88].map((w, i) => (
          <Shimmer key={i} className="h-4" style={{ width: w }} />
        ))}
      </div>

      {/* Section Cards */}
      {[0, 1, 2].map(i => (
        <div key={i} className="bg-white border border-[#f0f1f3] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#f5f6f7]">
            <Shimmer className="size-5 !rounded-md" />
            <Shimmer className="h-4 w-36" />
          </div>
          <div className="px-5 py-4 space-y-3">
            {[0, 1, 2, 3].map(j => (
              <div key={j} className="flex items-center justify-between py-2">
                <Shimmer className="h-3 w-20" />
                <Shimmer className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==================== PORTFOLIO SKELETON ==================== */
export function PortfolioSkeleton() {
  return (
    <div className="px-4 md:px-6 py-5 space-y-5" style={pp}>
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Shimmer className="size-6 !rounded-md" />
          <Shimmer className="h-6 w-40" />
        </div>
        <Shimmer className="h-3.5 w-56 mt-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 border border-[#f0f1f3]">
            <div className="flex items-center gap-2 mb-2">
              <Shimmer className="size-5 !rounded-md" />
              <Shimmer className="h-3 w-20" />
            </div>
            <Shimmer className="h-7 w-28 mt-1" />
            <Shimmer className="h-3 w-20 mt-2" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-5 border border-[#f0f1f3]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shimmer className="size-5 !rounded-md" />
            <Shimmer className="h-4 w-44" />
          </div>
          <Shimmer className="h-3.5 w-28" />
        </div>
        <Shimmer className="h-[200px] w-full !rounded-xl" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#f0f1f3] pb-0">
        {[90, 60, 50, 50, 65].map((w, i) => (
          <div key={i} className="px-4 py-2.5">
            <Shimmer className="h-3.5" style={{ width: w }} />
          </div>
        ))}
      </div>

      {/* Position Rows */}
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#f0f1f3]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Shimmer className="size-5 !rounded-md" />
                <Shimmer className="h-4 w-52" />
              </div>
              <div className="flex items-center gap-2">
                <Shimmer className="h-3 w-16" />
                <Shimmer className="h-3 w-24" />
                <Shimmer className="h-3 w-28" />
              </div>
            </div>
            <Shimmer className="h-8 w-16 !rounded-full hidden sm:block" />
            <Shimmer className="h-5 w-16 !rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================== CREATOR SKELETON ==================== */
export function CreatorSkeleton() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6" style={pp}>
      {/* Navigation pills */}
      <div className="flex items-center gap-2">
        {[130, 120, 150].map((w, i) => (
          <Shimmer key={i} className="h-9 !rounded-lg" style={{ width: w }} />
        ))}
        <div className="ml-auto">
          <Shimmer className="size-8 !rounded-lg" />
        </div>
      </div>

      {/* Title + Create button */}
      <div className="flex items-center justify-between">
        <Shimmer className="h-8 w-48" />
        <Shimmer className="h-10 w-40 !rounded-lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border border-[#f0f1f3] p-4 flex flex-col gap-2">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-6 w-28" />
          </div>
        ))}
      </div>

      {/* Tabs + filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {[40, 55, 70].map((w, i) => (
            <Shimmer key={i} className="h-4" style={{ width: w }} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Shimmer className="h-9 w-[180px] !rounded-lg" />
          <Shimmer className="h-9 w-20 !rounded-lg" />
        </div>
      </div>

      {/* Table Header */}
      <div className="flex items-center gap-2 py-3 border-b border-[#f0f1f3]">
        <Shimmer className="h-3 w-[280px]" />
        <Shimmer className="h-3 w-[90px]" />
        <Shimmer className="h-3 w-[80px]" />
        <Shimmer className="h-3 w-[70px]" />
        <Shimmer className="h-3 w-[90px]" />
        <Shimmer className="h-3 w-[90px]" />
        <Shimmer className="h-3 w-[90px]" />
      </div>

      {/* Table Rows */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-2 py-3.5 border-b border-[#f5f6f7]">
          <div className="w-[280px] shrink-0 flex items-center gap-2">
            <Shimmer className="size-10 !rounded-lg flex-shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Shimmer className="h-3.5 w-48" />
              <Shimmer className="h-2.5 w-20" />
            </div>
          </div>
          <Shimmer className="h-3 w-[70px]" />
          <Shimmer className="h-3 w-[60px]" />
          <Shimmer className="h-3 w-[50px]" />
          <Shimmer className="h-3 w-[70px]" />
          <Shimmer className="h-3 w-[60px]" />
          <Shimmer className="h-3 w-[70px]" />
          <div className="flex-1 flex justify-end">
            <Shimmer className="h-3 w-14" />
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-1 py-4">
        {[0, 1, 2, 3, 4].map(i => (
          <Shimmer key={i} className="size-8 !rounded" />
        ))}
      </div>
    </div>
  );
}