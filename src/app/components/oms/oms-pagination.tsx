import { type Dispatch, type SetStateAction } from "react";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

interface OmsPaginationProps {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
  totalItems: number;
  pageSizeOptions?: number[];
}

export function OmsPagination({ page, setPage, pageSize, setPageSize, totalItems, pageSizeOptions = [10, 25, 50] }: OmsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeP = Math.min(page, totalPages);
  const start = (safeP - 1) * pageSize + 1;
  const end = Math.min(safeP * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#1f2937] flex-wrap gap-2" style={pp}>
      <div className="flex items-center gap-2">
        <span className="text-[#6b7280] text-[11px]" style={{ ...ss04, fontWeight: 500 }}>
          {totalItems > 0 ? `${start}–${end} of ${totalItems}` : "No results"}
        </span>
        <select
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="h-6 px-1.5 bg-[#0a0e1a] border border-[#1f2937] rounded text-[#9ca3af] text-[10px] outline-none cursor-pointer"
        >
          {pageSizeOptions.map(n => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(1)}
          disabled={safeP <= 1}
          className="h-6 px-1.5 rounded bg-[#0a0e1a] border border-[#1f2937] text-[#9ca3af] text-[10px] disabled:opacity-30 cursor-pointer disabled:cursor-default hover:bg-[#1f2937] transition-colors"
          style={{ fontWeight: 600, ...ss04 }}
        >
          {"<<"}
        </button>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={safeP <= 1}
          className="h-6 px-1.5 rounded bg-[#0a0e1a] border border-[#1f2937] text-[#9ca3af] text-[10px] disabled:opacity-30 cursor-pointer disabled:cursor-default hover:bg-[#1f2937] transition-colors"
          style={{ fontWeight: 600, ...ss04 }}
        >
          {"<"}
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - safeP) <= 1)
          .reduce<(number | "...")[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1]) > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((item, idx) =>
            item === "..." ? (
              <span key={`dots-${idx}`} className="text-[#6b7280] text-[10px] px-1">...</span>
            ) : (
              <button
                key={item}
                onClick={() => setPage(item as number)}
                className={`h-6 min-w-[24px] px-1.5 rounded text-[10px] cursor-pointer transition-colors ${
                  item === safeP ? "bg-[#ff5222] text-white" : "bg-[#0a0e1a] border border-[#1f2937] text-[#9ca3af] hover:bg-[#1f2937]"
                }`}
                style={{ fontWeight: 600, ...ss04 }}
              >
                {item}
              </button>
            )
          )
        }
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={safeP >= totalPages}
          className="h-6 px-1.5 rounded bg-[#0a0e1a] border border-[#1f2937] text-[#9ca3af] text-[10px] disabled:opacity-30 cursor-pointer disabled:cursor-default hover:bg-[#1f2937] transition-colors"
          style={{ fontWeight: 600, ...ss04 }}
        >
          {">"}
        </button>
        <button
          onClick={() => setPage(totalPages)}
          disabled={safeP >= totalPages}
          className="h-6 px-1.5 rounded bg-[#0a0e1a] border border-[#1f2937] text-[#9ca3af] text-[10px] disabled:opacity-30 cursor-pointer disabled:cursor-default hover:bg-[#1f2937] transition-colors"
          style={{ fontWeight: 600, ...ss04 }}
        >
          {">>"}
        </button>
      </div>
    </div>
  );
}

/** Slice an array for the current page */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
