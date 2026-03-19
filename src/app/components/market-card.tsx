import { useNavigate } from "react-router";
import { FireIcon, HeartIcon, ChatIcon } from "./icons";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { EmojiIcon } from "./two-tone-icons";

const poppins = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

const avatars = [
  "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1718006915613-bcb972cabdb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1603954698693-b0bcbceb5ad0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1758270705555-015de348a48a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1617089115097-4a5f00f10bf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1758600587839-56ba05596c69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
];

/* ---- Shared sub-components ---- */

function LiveBadge() {
  return (
    <span className="flex items-center gap-1 bg-[#ff2222] text-white text-[9px] px-2 py-0.5 rounded-full animate-pulse" style={{ fontWeight: 700 }}>
      <span className="size-1.5 bg-white rounded-full" />
      LIVE
    </span>
  );
}

function TierBadge({ tier }: { tier: 1 | 2 | 3 }) {
  const config = {
    1: { bg: "#ff5222", label: "TIER 1" },
    2: { bg: "#086de0", label: "TIER 2" },
    3: { bg: "#8b5cf6", label: "TIER 3" },
  };
  const c = config[tier];
  return (
    <span className="text-[8px] text-white px-1.5 py-0.5 rounded" style={{ fontWeight: 700, backgroundColor: c.bg }}>
      {c.label}
    </span>
  );
}

function CategoryTag({ label }: { label: string }) {
  return (
    <span className="text-[9px] text-[#84888c] bg-[#f0f1f3] px-1.5 py-0.5 rounded" style={{ fontWeight: 500, ...ss04 }}>
      {label}
    </span>
  );
}

function CardFooter({ volume = "₱64k Vol", likes = 23, bettors }: { volume?: string; likes?: number; bettors?: number }) {
  return (
    <div className="flex items-center justify-between w-full pt-2 border-t border-[#f5f6f7]">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#84888c] leading-[1.5]" style={ss04}>{volume}</span>
        {bettors != null && bettors > 0 && (
          <span className="text-[10px] text-[#b0b3b8] leading-[1.5]" style={ss04}>{bettors} bettors</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <FireIcon />
          <span className="text-[11px] text-[#84888c] leading-[1.5]" style={ss04}>{likes}</span>
        </div>
        <button className="cursor-pointer"><HeartIcon /></button>
        <button className="cursor-pointer"><ChatIcon /></button>
      </div>
    </div>
  );
}

function CardHeader({
  author,
  endTime,
  avatarIdx = 0,
  isLive = false,
  tier,
  category,
}: {
  author: string;
  endTime: string;
  avatarIdx?: number;
  isLive?: boolean;
  tier?: 1 | 2 | 3;
  category?: string;
}) {
  return (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="size-6 rounded-full overflow-hidden shrink-0 ring-1 ring-[#f0f1f3]">
          <ImageWithFallback src={avatars[avatarIdx % avatars.length]} alt={author} className="size-full object-cover" />
        </div>
        <span className="text-[12px] text-[#070808] leading-[1.5] truncate" style={{ fontWeight: 500, ...ss04 }}>
          {author}
        </span>
        {tier && <TierBadge tier={tier} />}
        {category && <CategoryTag label={category} />}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {isLive && <LiveBadge />}
        <span className="text-[11px] text-[#84888c] leading-[1.5] whitespace-nowrap" style={ss04}>{endTime}</span>
      </div>
    </div>
  );
}

/* ========== CARD TYPES ========== */

/* 1. Yes/No (Oo/Hindi) */
export function YesNoCard({
  author = "Juan",
  question = "Mananalo ba ang Ginebra sa PBA Finals?",
  chance = 83,
  endTime = "2D 2h 23m",
  volume = "₱64k Vol",
  image = "",
  avatarIdx = 0,
  isLive = false,
  tier,
  category,
  bettors,
}: {
  author?: string;
  question?: string;
  chance?: number;
  endTime?: string;
  volume?: string;
  image?: string;
  avatarIdx?: number;
  isLive?: boolean;
  tier?: 1 | 2 | 3;
  category?: string;
  bettors?: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-[0px_2px_20px_0px_rgba(0,0,0,0.04)] border border-[#f5f6f7] flex-1 min-w-0 flex flex-col justify-between p-4 h-full hover:shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer" style={poppins}>
      <div className="flex flex-col gap-3 w-full">
        <CardHeader author={author} endTime={endTime} avatarIdx={avatarIdx} isLive={isLive} tier={tier} category={category} />
        <div className="flex gap-2.5 items-start w-full">
          {image && (
            <div className="size-10 rounded-lg shrink-0 overflow-hidden">
              <ImageWithFallback src={image} alt="" className="size-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0 text-[13px] text-[#070808] leading-[1.45]" style={{ fontWeight: 500, ...ss04 }}>
            <p>{question}</p>
          </div>
          <div className="flex flex-col items-center shrink-0">
            <span className="text-[20px] text-[#00bf85] leading-[22px]" style={{ fontWeight: 700, ...ss04 }}>{chance}%</span>
            <span className="text-[10px] text-[#070808] opacity-60 leading-[1.5]">Chance</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 w-full mt-3">
        <div className="flex gap-2.5 w-full">
          <button className="bg-[#e6fff3] hover:bg-[#ccf5e4] flex-1 h-11 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
            <span className="text-[15px] text-[#00bf85]" style={{ fontWeight: 600, ...ss04 }}>Oo</span>
          </button>
          <button className="bg-[#fff4ed] hover:bg-[#ffe8da] flex-1 h-11 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
            <span className="text-[15px] text-[#ff5222]" style={{ fontWeight: 600, ...ss04 }}>Hindi</span>
          </button>
        </div>
        <CardFooter volume={volume} />
      </div>
    </div>
  );
}

/* 2. Fast Bets — wired to /fast-bet */
export function FastBetCard({
  author = "Carlo",
  question = "USD/PHP exchange rate sa Dec 2026?",
  endTime = "5D 12h 45m",
  volume = "₱128k Vol",
  image = "",
  outcomes = [
    { label: "₱60+", pct: "5%" },
    { label: "₱58-60", pct: "28%" },
    { label: "₱55-58", pct: "42%" },
  ],
  avatarIdx = 2,
  tier,
  category,
}: {
  author?: string;
  question?: string;
  endTime?: string;
  volume?: string;
  image?: string;
  outcomes?: { label: string; pct: string }[];
  avatarIdx?: number;
  tier?: 1 | 2 | 3;
  category?: string;
}) {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white rounded-xl shadow-[0px_2px_20px_0px_rgba(0,0,0,0.04)] border border-[#f5f6f7] flex-1 min-w-0 flex flex-col gap-3 p-4 hover:shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer"
      style={poppins}
      onClick={() => navigate("/fast-bet")}
    >
      {/* Header with Fast Bets badge */}
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="size-6 rounded-full overflow-hidden shrink-0 ring-1 ring-[#f0f1f3]">
            <ImageWithFallback src={avatars[avatarIdx % avatars.length]} alt={author} className="size-full object-cover" />
          </div>
          <span className="text-[12px] text-[#070808] leading-[1.5] truncate" style={{ fontWeight: 500, ...ss04 }}>
            {author}
          </span>
          {tier && <TierBadge tier={tier} />}
          {category && <CategoryTag label={category} />}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-center gap-1 bg-[#ff5222]/10 text-[#ff5222] text-[9px] px-2 py-0.5 rounded-full" style={{ fontWeight: 700, ...ss04 }}>
            ⚡ Fast Bets
          </span>
          <span className="text-[11px] text-[#84888c] leading-[1.5] whitespace-nowrap" style={ss04}>{endTime}</span>
        </div>
      </div>
      <div className="flex gap-2.5 items-center w-full">
        {image && (
          <div className="size-10 rounded-lg shrink-0 overflow-hidden">
            <ImageWithFallback src={image} alt="" className="size-full object-cover" />
          </div>
        )}
        <p className="flex-1 text-[13px] text-[#070808] leading-[1.45]" style={{ fontWeight: 500, ...ss04 }}>{question}</p>
      </div>
      <div className="flex flex-col gap-2 max-h-[78px] overflow-hidden w-full">
        {outcomes.map((o, i) => (
          <div key={i} className="flex items-center gap-2.5 w-full">
            <span className="w-14 text-[12px] text-[#84888c] leading-[1.5]" style={ss04}>{o.label}</span>
            <span className="w-10 text-[12px] text-[#84888c] leading-[1.5] text-right" style={ss04}>{o.pct}</span>
            <div className="flex gap-1 ml-auto">
              <button className="bg-[#e6fff3] hover:bg-[#ccf5e4] h-6 w-14 rounded flex items-center justify-center transition-colors cursor-pointer">
                <span className="text-[11px] text-[#00bf85]" style={{ fontWeight: 600, ...ss04 }}>Taas ▲</span>
              </button>
              <button className="bg-[#fff4ed] hover:bg-[#ffe8da] h-6 w-14 rounded flex items-center justify-center transition-colors cursor-pointer">
                <span className="text-[11px] text-[#ff5222]" style={{ fontWeight: 600, ...ss04 }}>Baba ▼</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Footer with Fast Bet link */}
      <div className="flex items-center justify-between w-full pt-2 border-t border-[#f5f6f7]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#84888c] leading-[1.5]" style={ss04}>{volume}</span>
        </div>
        <span className="text-[11px] text-[#ff5222] leading-[1.5]" style={{ fontWeight: 600, ...ss04 }}>
          Tumaya sa Fast Bets →
        </span>
      </div>
    </div>
  );
}

/* 3. Buy / Multi-option with Tumaya */
export function BuyCard({
  author = "Rina",
  question = "Sino mananalo?",
  endTime = "10D 8h",
  volume = "₱95k Vol",
  image = "",
  options = [{ label: "Option A" }, { label: "Option B" }, { label: "Option C" }],
  avatarIdx = 3,
  tier,
  category,
}: {
  author?: string;
  question?: string;
  endTime?: string;
  volume?: string;
  image?: string;
  options?: { label: string }[];
  avatarIdx?: number;
  tier?: 1 | 2 | 3;
  category?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-[0px_2px_20px_0px_rgba(0,0,0,0.04)] border border-[#f5f6f7] flex-1 min-w-0 flex flex-col justify-between p-4 h-full hover:shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer" style={poppins}>
      <div className="flex flex-col gap-3 w-full">
        <CardHeader author={author} endTime={endTime} avatarIdx={avatarIdx} tier={tier} category={category} />
        <div className="flex gap-2.5 items-center w-full">
          {image && (
            <div className="size-10 rounded-lg shrink-0 overflow-hidden">
              <ImageWithFallback src={image} alt="" className="size-full object-cover" />
            </div>
          )}
          <p className="flex-1 text-[13px] text-[#070808] leading-[1.45]" style={{ fontWeight: 500, ...ss04 }}>{question}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 max-h-[78px] overflow-hidden w-full">
        {options.map((o, i) => (
          <div key={i} className="flex items-center gap-2.5 w-full">
            <span className="flex-1 text-[12px] text-[#84888c] leading-[1.5]" style={ss04}>{o.label}</span>
              <button className="bg-[#e6fff3] hover:bg-[#ccf5e4] h-6 w-16 rounded flex items-center justify-center transition-colors cursor-pointer">
                <span className="text-[11px] text-[#00bf85]" style={{ fontWeight: 600, ...ss04 }}>Tumaya</span>
              </button>
          </div>
        ))}
      </div>
      <CardFooter volume={volume} />
    </div>
  );
}

/* 4. Multi-option tag card */
const tagColors = [
  { bg: "#e6fff3", text: "#00bf85" },
  { bg: "#fff4ed", text: "#ff5222" },
  { bg: "#e6f6ff", text: "#086de0" },
  { bg: "#e6fffb", text: "#13c2c2" },
  { bg: "#fff1f0", text: "#f5222d" },
  { bg: "#f3edff", text: "#3f1ff6" },
];

export function MultiOptionCard({
  author = "Maria",
  question = "Sino ang next PBA MVP?",
  endTime = "7D 3h",
  volume = "₱230k Vol",
  image = "",
  options = ["Brownlee 0.34", "CJ Perez 0.28", "Bolick 0.18", "Parks 0.12", "Lee 0.05", "Iba pa 0.03"],
  avatarIdx = 1,
  tier,
  category,
}: {
  author?: string;
  question?: string;
  endTime?: string;
  volume?: string;
  image?: string;
  options?: string[];
  avatarIdx?: number;
  tier?: 1 | 2 | 3;
  category?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-[0px_2px_20px_0px_rgba(0,0,0,0.04)] border border-[#f5f6f7] flex-1 min-w-0 flex flex-col gap-3 p-4 hover:shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer" style={poppins}>
      <CardHeader author={author} endTime={endTime} avatarIdx={avatarIdx} tier={tier} category={category} />
      <div className="flex gap-2.5 items-start w-full">
        {image && (
          <div className="size-10 rounded-lg shrink-0 overflow-hidden">
            <ImageWithFallback src={image} alt="" className="size-full object-cover" />
          </div>
        )}
        <p className="flex-1 text-[13px] text-[#070808] leading-[1.45]" style={{ fontWeight: 500, ...ss04 }}>{question}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-[56px] overflow-hidden w-full">
        {options.map((opt, i) => {
          const color = tagColors[i % tagColors.length];
          return (
            <button
              key={i}
              className="h-6 px-2.5 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
              style={{ backgroundColor: color.bg }}
            >
              <span className="text-[11px] whitespace-nowrap" style={{ fontWeight: 600, color: color.text, ...ss04 }}>{opt}</span>
            </button>
          );
        })}
      </div>
      <CardFooter volume={volume} />
    </div>
  );
}

/* ====== NEW: COLOR GAME (Perya) CARD ====== */
const diceColors = [
  { name: "Pula", color: "#dc2626", bg: "#fef2f2" },
  { name: "Asul", color: "#2563eb", bg: "#eff6ff" },
  { name: "Berde", color: "#16a34a", bg: "#f0fdf4" },
  { name: "Dilaw", color: "#ca8a04", bg: "#fefce8" },
  { name: "Puti", color: "#374151", bg: "#f9fafb" },
  { name: "Pink", color: "#db2777", bg: "#fdf2f8" },
];

export function ColorGameCard({
  roundId = "Round #8832",
  timeLeft = "0:42",
  lastResults = ["Pula", "Asul", "Berde"],
  totalPool = "₱48,200",
  bettors = 128,
  status = "live" as "live" | "rolling" | "result",
}: {
  roundId?: string;
  timeLeft?: string;
  lastResults?: string[];
  totalPool?: string;
  bettors?: number;
  status?: "live" | "rolling" | "result";
}) {
  return (
    <div className="bg-white rounded-xl shadow-[0px_2px_20px_0px_rgba(0,0,0,0.04)] border border-[#f5f6f7] flex-1 min-w-0 flex flex-col justify-between p-4 h-full hover:shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer" style={poppins}>
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <EmojiIcon emoji="🎲" size={18} />
          <span className="text-[12px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>{roundId}</span>
          <TierBadge tier={1} />
          <CategoryTag label="Color Game" />
        </div>
        <div className="flex items-center gap-1.5">
          {status === "live" && <LiveBadge />}
          {status === "rolling" && (
            <span className="text-[9px] text-[#f5a623] bg-[#fff8e1] px-2 py-0.5 rounded-full animate-pulse" style={{ fontWeight: 700 }}>
              ROLLING...
            </span>
          )}
          <span className="text-[11px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>{timeLeft}</span>
        </div>
      </div>

      {/* Last Results */}
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] text-[#b0b3b8]" style={ss04}>Huling resulta:</span>
        {lastResults.map((r, i) => {
          const c = diceColors.find((d) => d.name === r);
          return (
            <span key={i} className="size-4 rounded" style={{ backgroundColor: c?.color || "#ccc" }} />
          );
        })}
      </div>

      {/* Color Grid - 3x2 */}
      <div className="grid grid-cols-3 gap-1.5 mt-3 w-full">
        {diceColors.map((dc) => (
          <button
            key={dc.name}
            className="h-11 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-105 cursor-pointer border"
            style={{ backgroundColor: dc.bg, borderColor: dc.color + "30" }}
          >
            <div className="size-3.5 rounded" style={{ backgroundColor: dc.color }} />
            <span className="text-[9px]" style={{ fontWeight: 600, color: dc.color, ...ss04 }}>{dc.name}</span>
          </button>
        ))}
      </div>

      {/* Payout info */}
      <div className="flex items-center gap-3 mt-2.5 w-full">
        <div className="flex-1 text-center">
          <span className="text-[10px] text-[#b0b3b8] block" style={ss04}>1 kulay</span>
          <span className="text-[12px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>x2</span>
        </div>
        <div className="w-px h-5 bg-[#f0f1f3]" />
        <div className="flex-1 text-center">
          <span className="text-[10px] text-[#b0b3b8] block" style={ss04}>2 kulay</span>
          <span className="text-[12px] text-[#00bf85]" style={{ fontWeight: 600, ...ss04 }}>x3</span>
        </div>
        <div className="w-px h-5 bg-[#f0f1f3]" />
        <div className="flex-1 text-center">
          <span className="text-[10px] text-[#b0b3b8] block" style={ss04}>3 kulay</span>
          <span className="text-[12px] text-[#ff5222]" style={{ fontWeight: 600, ...ss04 }}>x6</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between w-full pt-2 mt-1 border-t border-[#f5f6f7]">
        <span className="text-[11px] text-[#84888c]" style={ss04}>Pool: {totalPool}</span>
        <span className="text-[10px] text-[#b0b3b8]" style={ss04}>{bettors} players</span>
      </div>
    </div>
  );
}

/* ====== NEW: SPORTS MATCHUP CARD (Basketball, Boxing) ====== */
export function MatchupCard({
  sport = "Basketball",
  league = "PBA Philippine Cup",
  teamA = "Ginebra",
  teamB = "San Miguel",
  scoreA,
  scoreB,
  oddsA = 1.65,
  oddsDraw,
  oddsB = 2.35,
  endTime = "Q3 4:23",
  isLive = true,
  volume = "₱320k Vol",
  bettors = 1240,
  spreadLine,
  ouTotal,
}: {
  sport?: string;
  league?: string;
  teamA?: string;
  teamB?: string;
  scoreA?: number;
  scoreB?: number;
  oddsA?: number;
  oddsDraw?: number;
  oddsB?: number;
  endTime?: string;
  isLive?: boolean;
  volume?: string;
  bettors?: number;
  spreadLine?: string;
  ouTotal?: string;
}) {
  const emoji = sport === "Basketball" ? "🏀" : sport === "Boxing" ? "🥊" : "🏆";
  return (
    <div className="bg-white rounded-xl shadow-[0px_2px_20px_0px_rgba(0,0,0,0.04)] border border-[#f5f6f7] flex-1 min-w-0 flex flex-col justify-between p-4 h-full hover:shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer" style={poppins}>
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <EmojiIcon emoji={emoji} size={16} />
          <span className="text-[11px] text-[#84888c]" style={{ fontWeight: 500, ...ss04 }}>{league}</span>
          <TierBadge tier={sport === "Basketball" ? 1 : 2} />
          <CategoryTag label={sport} />
        </div>
        <div className="flex items-center gap-1.5">
          {isLive && <LiveBadge />}
          <span className="text-[11px] text-[#84888c]" style={ss04}>{endTime}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center w-full mt-3 gap-3">
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[14px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>{teamA}</span>
          {scoreA !== undefined && (
            <span className="text-[22px] text-[#070808]" style={{ fontWeight: 700, ...ss04 }}>{scoreA}</span>
          )}
        </div>
        <span className="text-[12px] text-[#b0b3b8]" style={{ fontWeight: 600 }}>VS</span>
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[14px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>{teamB}</span>
          {scoreB !== undefined && (
            <span className="text-[22px] text-[#070808]" style={{ fontWeight: 700, ...ss04 }}>{scoreB}</span>
          )}
        </div>
      </div>

      {/* Odds buttons */}
      <div className="flex gap-2 w-full mt-3">
        <button className="bg-[#f7f8f9] hover:bg-[#eef0f2] flex-1 h-10 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer">
          <span className="text-[10px] text-[#84888c]" style={ss04}>{teamA}</span>
          <span className="text-[13px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>x{oddsA.toFixed(2)}</span>
        </button>
        {oddsDraw !== undefined && (
          <button className="bg-[#f7f8f9] hover:bg-[#eef0f2] flex-1 h-10 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer">
            <span className="text-[10px] text-[#84888c]" style={ss04}>Draw</span>
            <span className="text-[13px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>x{oddsDraw.toFixed(2)}</span>
          </button>
        )}
        <button className="bg-[#f7f8f9] hover:bg-[#eef0f2] flex-1 h-10 rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer">
          <span className="text-[10px] text-[#84888c]" style={ss04}>{teamB}</span>
          <span className="text-[13px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>x{oddsB.toFixed(2)}</span>
        </button>
      </div>

      {/* Spread / O/U */}
      {(spreadLine || ouTotal) && (
        <div className="flex gap-2 w-full mt-1.5">
          {spreadLine && (
            <div className="flex-1 bg-[#f7f8f9] rounded-md px-2 py-1.5 text-center">
              <span className="text-[9px] text-[#b0b3b8] block" style={ss04}>Spread</span>
              <span className="text-[11px] text-[#070808]" style={{ fontWeight: 500, ...ss04 }}>{spreadLine}</span>
            </div>
          )}
          {ouTotal && (
            <div className="flex-1 bg-[#f7f8f9] rounded-md px-2 py-1.5 text-center">
              <span className="text-[9px] text-[#b0b3b8] block" style={ss04}>O/U</span>
              <span className="text-[11px] text-[#070808]" style={{ fontWeight: 500, ...ss04 }}>{ouTotal}</span>
            </div>
          )}
        </div>
      )}

      <CardFooter volume={volume} bettors={bettors} />
    </div>
  );
}

/* ====== NEW: BINGO / NUMBER PREDICTION CARD ====== */
export function BingoCard({
  roundId = "Bingo Round #445",
  nextDraw = "0:15",
  ranges = [
    { range: "1-15", multiplier: "x5.2", hot: true },
    { range: "16-30", multiplier: "x4.8", hot: false },
    { range: "31-45", multiplier: "x4.1", hot: false },
    { range: "46-60", multiplier: "x6.3", hot: true },
    { range: "61-75", multiplier: "x3.9", hot: false },
  ],
  totalPool = "₱28,100",
  players = 86,
}: {
  roundId?: string;
  nextDraw?: string;
  ranges?: { range: string; multiplier: string; hot: boolean }[];
  totalPool?: string;
  players?: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-[0px_2px_20px_0px_rgba(0,0,0,0.04)] border border-[#f5f6f7] flex-1 min-w-0 flex flex-col justify-between p-4 h-full hover:shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer" style={poppins}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <EmojiIcon emoji="💯" size={16} />
          <span className="text-[12px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>{roundId}</span>
          <TierBadge tier={2} />
          <CategoryTag label="Bingo" />
        </div>
        <div className="flex items-center gap-1.5">
          <LiveBadge />
          <span className="text-[11px] text-[#070808]" style={{ fontWeight: 600, ...ss04 }}>{nextDraw}</span>
        </div>
      </div>

      <p className="text-[12px] text-[#84888c] mt-2" style={{ fontWeight: 500, ...ss04 }}>
        Piliin ang number range — saan babagsak ang susunod na bola?
      </p>

      <div className="flex flex-col gap-1.5 mt-3 w-full">
        {ranges.map((r, i) => (
          <button
            key={i}
            className="flex items-center justify-between w-full h-8 px-3 rounded-lg bg-[#f7f8f9] hover:bg-[#eef0f2] transition-colors cursor-pointer"
          >
            <span className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss04 }}>{r.range}</span>
            <div className="flex items-center gap-1.5">
              {r.hot && <span className="text-[8px] text-[#ff5222] bg-[#fff4ed] px-1 rounded" style={{ fontWeight: 600 }}>HOT</span>}
              <span className="text-[12px] text-[#00bf85]" style={{ fontWeight: 600, ...ss04 }}>{r.multiplier}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between w-full pt-2 mt-2 border-t border-[#f5f6f7]">
        <span className="text-[11px] text-[#84888c]" style={ss04}>Pool: {totalPool}</span>
        <span className="text-[10px] text-[#b0b3b8]" style={ss04}>{players} players</span>
      </div>
    </div>
  );
}

/* ====== NEW: FOREX CARD ====== */
export function ForexCard({
  author = "Luis",
  question = "USD/PHP exchange rate sa Dec 2026?",
  endTime = "1Y 10M 5D",
  volume = "₱150k Vol",
  image = "",
  avatarIdx = 4,
  tier,
  category,
}: {
  author?: string;
  question?: string;
  endTime?: string;
  volume?: string;
  image?: string;
  avatarIdx?: number;
  tier?: 1 | 2 | 3;
  category?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-[0px_2px_20px_0px_rgba(0,0,0,0.04)] border border-[#f5f6f7] flex-1 min-w-0 flex flex-col justify-between p-4 h-full hover:shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer" style={poppins}>
      <div className="flex flex-col gap-3 w-full">
        <CardHeader author={author} endTime={endTime} avatarIdx={avatarIdx} tier={tier} category={category} />
        <div className="flex gap-2.5 items-start w-full">
          {image && (
            <div className="size-10 rounded-lg shrink-0 overflow-hidden">
              <ImageWithFallback src={image} alt="" className="size-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0 text-[13px] text-[#070808] leading-[1.45]" style={{ fontWeight: 500, ...ss04 }}>
            <p>{question}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 w-full mt-3">
        <div className="flex gap-2.5 w-full">
          <button className="bg-[#e6fff3] hover:bg-[#ccf5e4] flex-1 h-11 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
            <span className="text-[15px] text-[#00bf85]" style={{ fontWeight: 600, ...ss04 }}>Oo</span>
          </button>
          <button className="bg-[#fff4ed] hover:bg-[#ffe8da] flex-1 h-11 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
            <span className="text-[15px] text-[#ff5222]" style={{ fontWeight: 600, ...ss04 }}>Hindi</span>
          </button>
        </div>
        <CardFooter volume={volume} />
      </div>
    </div>
  );
}