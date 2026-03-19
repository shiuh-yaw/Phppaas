import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { generateCommandEntries, type CommandEntry } from "../../data/oms-mock";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

const CATEGORY_META: Record<string, { label: string; icon: JSX.Element; color: string }> = {
  page: {
    label: "Pages",
    icon: <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2" /><path d="M2 6h12" /></svg>,
    color: "text-blue-500",
  },
  user: {
    label: "Users",
    icon: <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3" /><path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" /></svg>,
    color: "text-emerald-500",
  },
  market: {
    label: "Markets",
    icon: <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 12l4-4 3 3 5-7" /></svg>,
    color: "text-purple-500",
  },
  action: {
    label: "Actions",
    icon: <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M13.5 7.5L8 2 2.5 7.5" /><path d="M8 2v12" /></svg>,
    color: "text-amber-500",
  },
};

const RECENT_SEARCHES_KEY = "oms_recent_searches";
const MAX_RECENT = 5;

function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveRecentSearch(query: string) {
  if (!query.trim()) return;
  try {
    const recent = loadRecentSearches().filter(q => q !== query);
    recent.unshift(query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {}
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allEntries = useMemo(() => generateCommandEntries(), []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allEntries.slice(0, 20);
    const q = query.toLowerCase();
    return allEntries
      .map(entry => {
        let score = 0;
        if (entry.label.toLowerCase().includes(q)) score += 10;
        if (entry.label.toLowerCase().startsWith(q)) score += 5;
        if (entry.description.toLowerCase().includes(q)) score += 3;
        for (const kw of entry.keywords) {
          if (kw.includes(q)) score += 2;
        }
        return { entry, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map(r => r.entry);
  }, [query, allEntries]);

  // Group by category for rendering
  const grouped = useMemo(() => {
    const groups: Record<string, CommandEntry[]> = {};
    for (const entry of filtered) {
      if (!groups[entry.category]) groups[entry.category] = [];
      groups[entry.category].push(entry);
    }
    return groups;
  }, [filtered]);

  // Flat list for keyboard nav
  const flatList = useMemo(() => filtered, [filtered]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setRecentSearches(loadRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleSelect = useCallback((entry: CommandEntry) => {
    if (query.trim()) saveRecentSearch(query.trim());
    navigate(entry.path);
    onClose();
  }, [navigate, onClose, query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatList[selectedIdx]) {
      e.preventDefault();
      handleSelect(flatList[selectedIdx]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [flatList, selectedIdx, handleSelect, onClose]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  // Global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          // Parent should set open=true; this is a fallback
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  let flatIdx = 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]" style={pp}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[560px] mx-4 bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 h-[52px] border-b border-[#f0f1f3]">
          <svg className="size-4 text-[#b0b3b8] flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[#070808] text-[14px] outline-none placeholder-[#b0b3b8]"
            placeholder="Search pages, users, markets, actions..."
            style={ss04}
          />
          <kbd className="hidden sm:inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-[#f0f1f3] text-[#b0b3b8] border border-[#e5e7eb]" style={{ fontWeight: 500, ...ss04 }}>ESC</kbd>
        </div>

        {/* Recent searches — shown when query is empty */}
        {!query.trim() && recentSearches.length > 0 && (
          <div className="px-4 pt-2 pb-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[#b0b3b8] text-[10px] tracking-[0.06em]" style={{ fontWeight: 600, ...ss04 }}>RECENT SEARCHES</span>
              <button
                onClick={() => { localStorage.removeItem(RECENT_SEARCHES_KEY); setRecentSearches([]); }}
                className="text-[#b0b3b8] text-[9px] hover:text-[#ff5222] cursor-pointer"
                style={{ fontWeight: 500, ...ss04 }}
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map(q => (
                <button
                  key={q}
                  onClick={() => setQuery(q)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#f5f6f8] text-[#84888c] hover:text-[#070808] hover:bg-[#e5e7eb] cursor-pointer transition-colors"
                  style={{ fontWeight: 500, ...ss04 }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto py-2">
          {flatList.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[#b0b3b8] text-[13px]" style={ss04}>No results for "<span className="text-[#070808]">{query}</span>"</p>
            </div>
          ) : (
            Object.entries(grouped).map(([cat, entries]) => {
              const meta = CATEGORY_META[cat];
              return (
                <div key={cat}>
                  <div className="px-4 pt-2 pb-1 flex items-center gap-1.5">
                    <span className={meta.color}>{meta.icon}</span>
                    <span className="text-[#b0b3b8] text-[10px] tracking-[0.06em]" style={{ fontWeight: 600, ...ss04 }}>{meta.label.toUpperCase()}</span>
                  </div>
                  {entries.map(entry => {
                    const idx = flatIdx++;
                    const isSelected = idx === selectedIdx;
                    return (
                      <button
                        key={entry.id}
                        data-idx={idx}
                        onClick={() => handleSelect(entry)}
                        onMouseEnter={() => setSelectedIdx(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left cursor-pointer transition-colors ${isSelected ? "bg-[#fff4ed]" : "hover:bg-[#f9f9fa]"}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-[#ff5222]/10" : "bg-[#f0f1f3]"}`}>
                          <span className={isSelected ? "text-[#ff5222]" : meta.color}>{meta.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] truncate ${isSelected ? "text-[#ff5222]" : "text-[#070808]"}`} style={{ fontWeight: 500, ...ss04 }}>{entry.label}</p>
                          <p className="text-[#b0b3b8] text-[10px] truncate" style={ss04}>{entry.description}</p>
                        </div>
                        {isSelected && (
                          <span className="text-[#ff5222] text-[10px] flex-shrink-0" style={{ fontWeight: 500, ...ss04 }}>
                            Enter
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#f0f1f3] bg-[#f9fafb]">
          <div className="flex items-center gap-3">
            {[
              { keys: ["↑", "↓"], label: "Navigate" },
              { keys: ["Enter"], label: "Open" },
              { keys: ["Esc"], label: "Close" },
            ].map(h => (
              <div key={h.label} className="flex items-center gap-1">
                {h.keys.map(k => (
                  <kbd key={k} className="text-[9px] px-1 py-0.5 rounded bg-white text-[#84888c] border border-[#e5e7eb]" style={{ fontWeight: 500, ...ss04 }}>{k}</kbd>
                ))}
                <span className="text-[#b0b3b8] text-[9px] ml-0.5" style={ss04}>{h.label}</span>
              </div>
            ))}
          </div>
          <span className="text-[#b0b3b8] text-[9px]" style={ss04}>{flatList.length} results</span>
        </div>
      </div>
    </div>
  );
}