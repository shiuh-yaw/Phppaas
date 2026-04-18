import type { OBMarket } from "./orderbook-market";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

interface Props {
  market: OBMarket;
  isDark: boolean;
  t: { card: string; cardBorder: string; text: string; textSec: string; textMut: string };
}

export function MarketDepthChart({ market, isDark, t }: Props) {
  const totalBidVol = market.bids.reduce((s, b) => s + b.shares, 0);
  const totalAskVol = market.asks.reduce((s, a) => s + a.shares, 0);
  const maxVol = Math.max(totalBidVol, totalAskVol) || 1;
  const bestBid = Math.max(...market.bids.map(b => b.price));
  const bestAsk = Math.min(...market.asks.map(a => a.price));
  const spread = bestAsk - bestBid;
  const yesRatio = totalBidVol + totalAskVol > 0
    ? (totalBidVol / (totalBidVol + totalAskVol)) * 100
    : 50;

  // ── SVG depth chart geometry ──────────────────────────────
  const W = 560; const H = 160;
  const PL = 40; const PR = 10; const PT = 20; const PB = 22;
  const cW = W - PL - PR;
  const cH = H - PT - PB;

  const bidsAsc = [...market.bids].sort((a, b) => a.price - b.price);   // low→high
  const asksAsc = [...market.asks].sort((a, b) => a.price - b.price);   // low→high

  const allPrices = [...bidsAsc.map(b => b.price), ...asksAsc.map(a => a.price)];
  const minP = Math.min(...allPrices) - 2;
  const maxP = Math.max(...allPrices) + 2;
  const pRange = maxP - minP || 1;

  const scX = (p: number) => PL + ((p - minP) / pRange) * cW;
  const scY = (v: number) => PT + cH - (v / maxVol) * cH;
  const base = PT + cH;

  // Bid curve: cumulative builds RIGHT→LEFT (highest bid on right, lowest on left)
  // Process bids ascending so we add cumulative volume as price increases (right side)
  const bidSegs: string[] = [];
  let cumB = 0;
  // Start at bottom-left corner
  bidSegs.push(`M ${scX(bidsAsc[0].price).toFixed(1)},${base.toFixed(1)}`);
  bidsAsc.forEach(b => {
    // horizontal to this price at current cumulative vol
    bidSegs.push(`L ${scX(b.price).toFixed(1)},${scY(cumB).toFixed(1)}`);
    cumB += b.shares;
    // vertical up to new cumulative vol
    bidSegs.push(`L ${scX(b.price).toFixed(1)},${scY(cumB).toFixed(1)}`);
  });
  // extend to right edge and close area
  const bidRightX = scX(bidsAsc[bidsAsc.length - 1].price + 0.5).toFixed(1);
  bidSegs.push(`L ${bidRightX},${scY(cumB).toFixed(1)}`);
  bidSegs.push(`L ${bidRightX},${base.toFixed(1)}`);
  bidSegs.push("Z");
  const bidAreaPath = bidSegs.join(" ");
  const bidLinePath = bidAreaPath; // same path, just stroke

  // Ask curve: cumulative builds LEFT→RIGHT (lowest ask on left)
  const askSegs: string[] = [];
  let cumA = 0;
  const askLeftX = scX(asksAsc[0].price - 0.5).toFixed(1);
  askSegs.push(`M ${askLeftX},${base.toFixed(1)}`);
  askSegs.push(`L ${askLeftX},${scY(0).toFixed(1)}`);
  asksAsc.forEach(a => {
    // horizontal from previous position to this price
    askSegs.push(`L ${scX(a.price).toFixed(1)},${scY(cumA).toFixed(1)}`);
    cumA += a.shares;
    // vertical up
    askSegs.push(`L ${scX(a.price).toFixed(1)},${scY(cumA).toFixed(1)}`);
  });
  const askRightX = scX(asksAsc[asksAsc.length - 1].price + 0.5).toFixed(1);
  askSegs.push(`L ${askRightX},${scY(cumA).toFixed(1)}`);
  askSegs.push(`L ${askRightX},${base.toFixed(1)}`);
  askSegs.push("Z");
  const askAreaPath = askSegs.join(" ");

  const yTicks = [0, Math.round(maxVol * 0.5), maxVol];

  const border1 = `1px solid ${t.cardBorder}`;

  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: border1, background: t.card }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: border1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text, ...ss, ...pp }}>Market Depth</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: isDark ? "rgba(255,255,255,0.07)" : "#f3f4f6", color: t.textMut, ...ss }}>
            Spread {spread}¢
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {(["YES Bids", "NO Asks"] as const).map((label) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: label === "YES Bids" ? "#22c55e" : "#ef4444" }} />
              <span style={{ fontSize: 11, color: t.textMut, ...ss }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SVG Chart ────────────────────────────────────────── */}
      <div style={{ padding: "12px 10px 0" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          <defs>
            <linearGradient id="gbid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="gask" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* grid lines + Y labels */}
          {yTicks.map((v) => (
            <g key={`ytick-${v}`}>
              <line x1={PL} y1={scY(v)} x2={W - PR} y2={scY(v)}
                stroke={isDark ? "rgba(255,255,255,0.05)" : "#f0f1f3"} strokeWidth="1" />
              <text x={PL - 4} y={scY(v) + 3.5} textAnchor="end" fontSize="9" fill={t.textMut}>
                {v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)}
              </text>
            </g>
          ))}

          {/* baseline */}
          <line x1={PL} y1={base} x2={W - PR} y2={base}
            stroke={isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"} strokeWidth="1" />

          {/* best-bid / best-ask verticals */}
          <line x1={scX(bestBid)} y1={PT} x2={scX(bestBid)} y2={base}
            stroke="#22c55e" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.7" />
          <line x1={scX(bestAsk)} y1={PT} x2={scX(bestAsk)} y2={base}
            stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.7" />
          <text x={scX(bestBid)} y={PT - 4} textAnchor="middle" fontSize="9" fill="#22c55e">{bestBid}¢</text>
          <text x={scX(bestAsk)} y={PT - 4} textAnchor="middle" fontSize="9" fill="#ef4444">{bestAsk}¢</text>

          {/* areas */}
          <path d={bidAreaPath} fill="url(#gbid)" />
          <path d={askAreaPath} fill="url(#gask)" />

          {/* outline strokes */}
          <path d={bidLinePath} fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={askAreaPath} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />

          {/* X labels — deduplicate prices that appear in both bids and asks */}
          {[...new Set(allPrices)].sort((a, b) => a - b).map((p) => (
            <text key={`xtick-${p}`} x={scX(p)} y={base + 14} textAnchor="middle" fontSize="9" fill={t.textMut}>{p}¢</text>
          ))}
        </svg>
      </div>

      {/* ── YES / NO balance bar ──────────────────────────────── */}
      <div style={{ padding: "8px 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, ...ss }}>YES {yesRatio.toFixed(1)}%</span>
          <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600, ...ss }}>NO {(100 - yesRatio).toFixed(1)}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 99, overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${yesRatio}%`, background: "linear-gradient(90deg,#22c55e,#16a34a)" }} />
          <div style={{ flex: 1, background: "linear-gradient(90deg,#dc2626,#ef4444)" }} />
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 14px 14px" }}>
        {/* YES */}
        <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.14)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2, ...ss }}>YES · Bids</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: t.text, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>{totalBidVol.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: t.textMut, marginTop: 1, ...ss }}>{market.bids.length} price levels</div>
          <div style={{ fontSize: 10, color: t.textMut, marginTop: 5, ...ss }}>
            Best bid: <span style={{ color: "#22c55e", fontWeight: 700 }}>{bestBid}¢</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, overflow: "hidden", marginTop: 6, background: isDark ? "rgba(255,255,255,0.06)" : "#dcfce7" }}>
            <div style={{ height: "100%", width: `${(totalBidVol / maxVol) * 100}%`, background: "#22c55e", borderRadius: 99 }} />
          </div>
        </div>
        {/* NO */}
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.14)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2, ...ss }}>NO · Asks</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: t.text, fontVariantNumeric: "tabular-nums", ...ss, ...pp }}>{totalAskVol.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: t.textMut, marginTop: 1, ...ss }}>{market.asks.length} price levels</div>
          <div style={{ fontSize: 10, color: t.textMut, marginTop: 5, ...ss }}>
            Best ask: <span style={{ color: "#ef4444", fontWeight: 700 }}>{bestAsk}¢</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, overflow: "hidden", marginTop: 6, background: isDark ? "rgba(255,255,255,0.06)" : "#fee2e2" }}>
            <div style={{ height: "100%", width: `${(totalAskVol / maxVol) * 100}%`, background: "#ef4444", borderRadius: 99 }} />
          </div>
        </div>
      </div>

      {/* ── Volume by price level ─────────────────────────────── */}
      <div style={{ borderTop: border1, padding: "10px 14px 14px" }}>
        <div style={{ fontSize: 11, color: t.textMut, fontWeight: 500, marginBottom: 8, ...ss }}>Volume by Price Level</div>
        <div style={{ display: "flex", gap: 10 }}>
          {/* YES bids — bars grow from right */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "#22c55e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5, ...ss }}>YES Bids</div>
            {[...market.bids].sort((a, b) => b.price - a.price).slice(0, 6).map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 10, width: 28, textAlign: "right", color: "#22c55e", fontWeight: 600, flexShrink: 0, fontVariantNumeric: "tabular-nums", ...ss }}>{b.price}¢</span>
                <div style={{ flex: 1, height: 12, borderRadius: 3, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.05)" : "#f0fdf4", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: `${b.depth}%`, background: "rgba(34,197,94,0.55)", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, width: 32, textAlign: "right", color: t.textMut, flexShrink: 0, fontVariantNumeric: "tabular-nums", ...ss }}>{(b.shares / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
          <div style={{ width: 1, background: t.cardBorder, flexShrink: 0 }} />
          {/* NO asks — bars grow from left */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5, ...ss }}>NO Asks</div>
            {[...market.asks].sort((a, b) => a.price - b.price).slice(0, 6).map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 10, width: 28, color: "#ef4444", fontWeight: 600, flexShrink: 0, fontVariantNumeric: "tabular-nums", ...ss }}>{a.price}¢</span>
                <div style={{ flex: 1, height: 12, borderRadius: 3, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.05)" : "#fff1f2", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${a.depth}%`, background: "rgba(239,68,68,0.55)", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, width: 32, textAlign: "right", color: t.textMut, flexShrink: 0, fontVariantNumeric: "tabular-nums", ...ss }}>{(a.shares / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
