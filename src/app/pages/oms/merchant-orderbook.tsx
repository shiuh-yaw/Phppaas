import { useState } from "react";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

type QuoteSide = "YES" | "NO";
type QuoteAction = "Bid" | "Ask";
type QuoteStatus = "active" | "partial" | "filled" | "cancelled";

interface MerchantQuote {
  id: string;
  marketId: string;
  marketTitle: string;
  side: QuoteSide;
  action: QuoteAction;
  price: number;
  size: number;
  filled: number;
  status: QuoteStatus;
  pnl: number;
  placedAt: string;
}

interface MarketBook {
  id: string;
  title: string;
  category: string;
  yesBid: number;
  yesAsk: number;
  spread: number;
  myDepthYes: number;
  myDepthNo: number;
  exposure: number;
  fills24h: number;
  pnl24h: number;
}

const INITIAL_BOOKS: MarketBook[] = [
  { id: "btc-200k", title: "Bitcoin reaches $200,000 by Dec 31, 2026?", category: "Crypto", yesBid: 60, yesAsk: 63, spread: 3, myDepthYes: 12500, myDepthNo: 8200, exposure: 18400, fills24h: 142, pnl24h: 2340 },
  { id: "ph-gilas-fiba", title: "Gilas Pilipinas — Top 2 sa FIBA 2027 Asian Qualifiers?", category: "Basketball", yesBid: 72, yesAsk: 76, spread: 4, myDepthYes: 9200, myDepthNo: 4100, exposure: 11800, fills24h: 88, pnl24h: -420 },
  { id: "bbm-sona-2026", title: "Will BBM mention 'inflation' >5x in SONA 2026?", category: "Politics", yesBid: 45, yesAsk: 49, spread: 4, myDepthYes: 3800, myDepthNo: 5500, exposure: 6200, fills24h: 34, pnl24h: 180 },
  { id: "pba-finals-2026", title: "Ginebra wins PBA Philippine Cup 2026?", category: "Basketball", yesBid: 38, yesAsk: 41, spread: 3, myDepthYes: 5400, myDepthNo: 7800, exposure: 9100, fills24h: 56, pnl24h: 690 },
];

const INITIAL_QUOTES: MerchantQuote[] = [
  { id: "Q-9821", marketId: "btc-200k", marketTitle: "Bitcoin → $200K by Dec 2026", side: "YES", action: "Bid", price: 60, size: 5000, filled: 1200, status: "partial", pnl: 240, placedAt: "8 min ago" },
  { id: "Q-9820", marketId: "btc-200k", marketTitle: "Bitcoin → $200K by Dec 2026", side: "YES", action: "Ask", price: 63, size: 5000, filled: 0, status: "active", pnl: 0, placedAt: "8 min ago" },
  { id: "Q-9818", marketId: "ph-gilas-fiba", marketTitle: "Gilas Top 2 — FIBA Qualifiers", side: "NO", action: "Bid", price: 24, size: 3000, filled: 3000, status: "filled", pnl: 480, placedAt: "1h ago" },
  { id: "Q-9815", marketId: "pba-finals-2026", marketTitle: "Ginebra wins PBA 2026", side: "YES", action: "Ask", price: 41, size: 2000, filled: 250, status: "partial", pnl: 60, placedAt: "2h ago" },
  { id: "Q-9810", marketId: "bbm-sona-2026", marketTitle: "BBM mentions 'inflation' >5x", side: "YES", action: "Bid", price: 45, size: 1500, filled: 0, status: "cancelled", pnl: 0, placedAt: "5h ago" },
];

function StatusBadge({ status }: { status: QuoteStatus }) {
  const map: Record<QuoteStatus, string> = {
    active: "bg-emerald-500/15 text-emerald-400",
    partial: "bg-amber-500/15 text-amber-400",
    filled: "bg-blue-500/15 text-blue-400",
    cancelled: "bg-gray-500/15 text-gray-400",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status]}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

export default function MerchantOrderbook() {
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [postOpen, setPostOpen] = useState(false);
  const [postForm, setPostForm] = useState({ marketId: INITIAL_BOOKS[0].id, side: "YES" as QuoteSide, action: "Bid" as QuoteAction, price: "", size: "" });

  const filtered = quotes.filter(q =>
    (statusFilter === "all" || q.status === statusFilter) &&
    (marketFilter === "all" || q.marketId === marketFilter)
  );

  const totalDepth = INITIAL_BOOKS.reduce((s, b) => s + b.myDepthYes + b.myDepthNo, 0);
  const totalExposure = INITIAL_BOOKS.reduce((s, b) => s + b.exposure, 0);
  const totalFills = INITIAL_BOOKS.reduce((s, b) => s + b.fills24h, 0);
  const totalPnl = INITIAL_BOOKS.reduce((s, b) => s + b.pnl24h, 0);
  const activeQuotes = quotes.filter(q => q.status === "active" || q.status === "partial").length;

  const handleCancel = (id: string) => {
    setQuotes(q => q.map(o => o.id === id ? { ...o, status: "cancelled" as QuoteStatus } : o));
  };

  const handlePost = () => {
    const market = INITIAL_BOOKS.find(b => b.id === postForm.marketId)!;
    const newQuote: MerchantQuote = {
      id: `Q-${9900 + quotes.length}`,
      marketId: market.id,
      marketTitle: market.title,
      side: postForm.side,
      action: postForm.action,
      price: parseFloat(postForm.price) || 0,
      size: parseFloat(postForm.size) || 0,
      filled: 0,
      status: "active",
      pnl: 0,
      placedAt: "just now",
    };
    setQuotes([newQuote, ...quotes]);
    setPostOpen(false);
    setPostForm({ marketId: INITIAL_BOOKS[0].id, side: "YES", action: "Bid", price: "", size: "" });
  };

  const handleKill = () => {
    setQuotes(q => q.map(o => (o.status === "active" || o.status === "partial") ? { ...o, status: "cancelled" as QuoteStatus } : o));
  };

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Active Quotes", value: activeQuotes.toString(), color: "text-emerald-400" },
          { label: "My Depth", value: `${(totalDepth / 1000).toFixed(1)}K`, color: "text-white" },
          { label: "Exposure", value: `₱${(totalExposure / 1000).toFixed(1)}K`, color: "text-amber-400" },
          { label: "Fills (24h)", value: totalFills.toString(), color: "text-blue-400" },
          { label: "P&L (24h)", value: `${totalPnl >= 0 ? "+" : ""}₱${totalPnl.toLocaleString()}`, color: totalPnl >= 0 ? "text-emerald-400" : "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700, ...ss04 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Markets Book Overview */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl">
        <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
          <div>
            <h2 className="text-white text-[14px]" style={{ fontWeight: 700 }}>My Markets</h2>
            <p className="text-[#6b7280] text-[11px]" style={{ fontWeight: 500 }}>Liquidity I'm providing across orderbook markets</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPostOpen(true)} className="h-8 px-4 bg-[#ff5222] text-white text-[11px] rounded-lg cursor-pointer hover:bg-[#e8491f] transition-colors" style={{ fontWeight: 600 }}>
              + Post Quote
            </button>
            <button onClick={handleKill} className="h-8 px-4 bg-red-500/15 text-red-400 text-[11px] rounded-lg cursor-pointer hover:bg-red-500/25 transition-colors" style={{ fontWeight: 600 }}>
              Kill All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#1f2937]">
                {["Market", "Category", "Bid / Ask", "Spread", "My YES Depth", "My NO Depth", "Exposure", "Fills 24h", "P&L 24h"].map(h => (
                  <th key={h} className="text-[#6b7280] text-[10px] px-4 py-2.5 text-left" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INITIAL_BOOKS.map(b => (
                <tr key={b.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="text-white text-[12px] max-w-[260px] truncate block" style={{ fontWeight: 500 }}>{b.title}</span>
                  </td>
                  <td className="px-4 py-2.5"><span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1f2937] text-[#9ca3af]" style={{ fontWeight: 500 }}>{b.category}</span></td>
                  <td className="px-4 py-2.5 text-[12px]" style={{ ...ss04 }}>
                    <span className="text-emerald-400" style={{ fontWeight: 600 }}>{b.yesBid}¢</span>
                    <span className="text-[#6b7280]"> / </span>
                    <span className="text-red-400" style={{ fontWeight: 600 }}>{b.yesAsk}¢</span>
                  </td>
                  <td className="px-4 py-2.5 text-[#9ca3af] text-[12px]" style={{ ...ss04 }}>{b.spread}¢</td>
                  <td className="px-4 py-2.5 text-white text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{b.myDepthYes.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-white text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{b.myDepthNo.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-amber-400 text-[12px]" style={{ fontWeight: 600, ...ss04 }}>₱{b.exposure.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-[#9ca3af] text-[12px]" style={{ ...ss04 }}>{b.fills24h}</td>
                  <td className={`px-4 py-2.5 text-[12px] ${b.pnl24h >= 0 ? "text-emerald-400" : "text-red-400"}`} style={{ fontWeight: 600, ...ss04 }}>
                    {b.pnl24h >= 0 ? "+" : ""}₱{b.pnl24h.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl">
        <div className="p-4 border-b border-[#1f2937] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-white text-[14px]" style={{ fontWeight: 700 }}>My Quotes</h2>
            <p className="text-[#6b7280] text-[11px]" style={{ fontWeight: 500 }}>Bids & asks I've posted to the orderbook</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="h-8 px-2.5 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="partial">Partial</option>
              <option value="filled">Filled</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={marketFilter} onChange={e => setMarketFilter(e.target.value)} className="h-8 px-2.5 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-[#9ca3af] text-[11px] outline-none cursor-pointer">
              <option value="all">All Markets</option>
              {INITIAL_BOOKS.map(b => <option key={b.id} value={b.id}>{b.title.slice(0, 36)}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#1f2937]">
                {["Quote ID", "Market", "Side", "Action", "Price", "Size", "Filled", "Status", "P&L", "Placed", "Actions"].map(h => (
                  <th key={h} className="text-[#6b7280] text-[10px] px-4 py-2.5 text-left" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const fillPct = q.size > 0 ? Math.round((q.filled / q.size) * 100) : 0;
                return (
                  <tr key={q.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30 transition-colors">
                    <td className="px-4 py-2.5 text-[#6b7280] text-[11px]" style={{ ...ss04 }}>{q.id}</td>
                    <td className="px-4 py-2.5 text-white text-[12px] max-w-[220px] truncate">{q.marketTitle}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${q.side === "YES" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`} style={{ fontWeight: 700 }}>{q.side}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${q.action === "Bid" ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400"}`} style={{ fontWeight: 700 }}>{q.action}</span>
                    </td>
                    <td className="px-4 py-2.5 text-white text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{q.price}¢</td>
                    <td className="px-4 py-2.5 text-[#9ca3af] text-[12px]" style={{ ...ss04 }}>{q.size.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-[#9ca3af] text-[12px]" style={{ ...ss04 }}>{q.filled.toLocaleString()} <span className="text-[#6b7280]">({fillPct}%)</span></td>
                    <td className="px-4 py-2.5"><StatusBadge status={q.status} /></td>
                    <td className={`px-4 py-2.5 text-[12px] ${q.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`} style={{ fontWeight: 600, ...ss04 }}>
                      {q.pnl >= 0 ? "+" : ""}₱{q.pnl.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-[#6b7280] text-[11px]">{q.placedAt}</td>
                    <td className="px-4 py-2.5">
                      {(q.status === "active" || q.status === "partial") ? (
                        <button onClick={() => handleCancel(q.id)} className="h-6 px-2 bg-red-500/15 text-red-400 text-[10px] rounded cursor-pointer hover:bg-red-500/25" style={{ fontWeight: 600 }}>Cancel</button>
                      ) : (
                        <span className="text-[#6b7280] text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Quote Modal */}
      {postOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPostOpen(false)}>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl w-full max-w-[440px] p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-white text-[16px] mb-4" style={{ fontWeight: 700 }}>Post New Quote</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[#9ca3af] text-[11px] block mb-1.5" style={{ fontWeight: 500 }}>Market</label>
                <select value={postForm.marketId} onChange={e => setPostForm({ ...postForm, marketId: e.target.value })} className="w-full h-9 px-3 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-white text-[12px] outline-none">
                  {INITIAL_BOOKS.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9ca3af] text-[11px] block mb-1.5" style={{ fontWeight: 500 }}>Side</label>
                  <div className="flex gap-2">
                    {(["YES", "NO"] as const).map(s => (
                      <button key={s} onClick={() => setPostForm({ ...postForm, side: s })} className={`flex-1 h-9 rounded-lg text-[12px] cursor-pointer transition-colors ${postForm.side === s ? (s === "YES" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-red-500/20 text-red-400 border border-red-500/40") : "bg-[#0a0e1a] text-[#9ca3af] border border-[#1f2937]"}`} style={{ fontWeight: 700 }}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[#9ca3af] text-[11px] block mb-1.5" style={{ fontWeight: 500 }}>Action</label>
                  <div className="flex gap-2">
                    {(["Bid", "Ask"] as const).map(a => (
                      <button key={a} onClick={() => setPostForm({ ...postForm, action: a })} className={`flex-1 h-9 rounded-lg text-[12px] cursor-pointer transition-colors ${postForm.action === a ? "bg-[#ff5222]/20 text-[#ff5222] border border-[#ff5222]/40" : "bg-[#0a0e1a] text-[#9ca3af] border border-[#1f2937]"}`} style={{ fontWeight: 700 }}>{a}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9ca3af] text-[11px] block mb-1.5" style={{ fontWeight: 500 }}>Price (¢)</label>
                  <input value={postForm.price} onChange={e => setPostForm({ ...postForm, price: e.target.value })} type="number" min={1} max={99} className="w-full h-9 px-3 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-white text-[12px] outline-none" placeholder="0–99" />
                </div>
                <div>
                  <label className="text-[#9ca3af] text-[11px] block mb-1.5" style={{ fontWeight: 500 }}>Size (shares)</label>
                  <input value={postForm.size} onChange={e => setPostForm({ ...postForm, size: e.target.value })} type="number" className="w-full h-9 px-3 bg-[#0a0e1a] border border-[#1f2937] rounded-lg text-white text-[12px] outline-none" placeholder="0" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setPostOpen(false)} className="flex-1 h-9 bg-[#0a0e1a] border border-[#1f2937] text-[#9ca3af] text-[12px] rounded-lg cursor-pointer hover:bg-[#1f2937]" style={{ fontWeight: 600 }}>Cancel</button>
              <button onClick={handlePost} disabled={!postForm.price || !postForm.size} className="flex-1 h-9 bg-[#ff5222] text-white text-[12px] rounded-lg cursor-pointer hover:bg-[#e8491f] disabled:opacity-40 disabled:cursor-not-allowed" style={{ fontWeight: 600 }}>Post Quote</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
