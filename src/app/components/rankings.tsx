import { useState } from "react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { EmojiIcon } from "./two-tone-icons";

const ss04 = { fontFeatureSettings: "'ss04'" };

const rankAvatars = [
  "https://images.unsplash.com/photo-1642060603505-e716140d45d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1718006915613-bcb972cabdb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1603954698693-b0bcbceb5ad0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1758270705555-015de348a48a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1617089115097-4a5f00f10bf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
  "https://images.unsplash.com/photo-1758600587839-56ba05596c69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100",
];

const topCreators = [
  { name: "Juan Cruz", amount: "+₱4,232,800", badge: "🏀" },
  { name: "Maria Santos", amount: "+₱3,891,500", badge: "🎲" },
  { name: "Carlo Reyes", amount: "+₱2,128,000", badge: "🎲" },
  { name: "Rina Dela Cruz", amount: "+₱1,890,200", badge: "🥊" },
  { name: "Marco Tan", amount: "+₱1,445,600", badge: "🎮" },
  { name: "Angela Lim", amount: "+₱1,102,300", badge: "💯" },
];

const topPlayers = [
  { name: "Paolo Gomez", amount: "+₱892,100", badge: "🥊" },
  { name: "Joy Villanueva", amount: "+₱754,800", badge: "🏀" },
  { name: "Ben Torres", amount: "+₱623,400", badge: "🎲" },
  { name: "Cathy Rivera", amount: "+₱510,200", badge: "🏀" },
  { name: "Mark Aquino", amount: "+₱445,900", badge: "🥊" },
  { name: "Lisa Garcia", amount: "+₱389,100", badge: "🎮" },
];

const hotMarkets = [
  { name: "PBA Finals G7", volume: "₱320k", change: "+42%", emoji: "🏀" },
  { name: "Color Game #8832", volume: "₱48k", change: "+156%", emoji: "🎲" },
  { name: "Pacquiao Fight", volume: "₱890k", change: "+23%", emoji: "🥊" },
  { name: "MLBB M6", volume: "₱320k", change: "+67%", emoji: "🎮" },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-[10px] bg-[#fff8e1] text-[#f5a623] rounded-full size-5 flex items-center justify-center" style={{ fontWeight: 700 }}>1</span>;
  if (rank === 2) return <span className="text-[10px] bg-[#f0f0f0] text-[#84888c] rounded-full size-5 flex items-center justify-center" style={{ fontWeight: 700 }}>2</span>;
  if (rank === 3) return <span className="text-[10px] bg-[#fff0e6] text-[#cd7f32] rounded-full size-5 flex items-center justify-center" style={{ fontWeight: 700 }}>3</span>;
  return <span className="text-[10px] text-[#b0b3b8] size-5 flex items-center justify-center" style={{ fontWeight: 500 }}>{rank}</span>;
}

function RankingSection({ title, items }: { title: string; items: typeof topCreators }) {
  return (
    <div className="rounded-xl border border-[#f0f1f3] w-full bg-white">
      <div className="flex flex-col px-4 pt-3 pb-2 w-full">
        <span className="text-[12px] text-[#84888c] leading-[1.5] mb-1" style={{ fontWeight: 600, ...ss04 }}>{title}</span>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 w-full py-2 hover:bg-[#fafafa] -mx-1 px-1 rounded-lg transition-colors cursor-pointer">
            <RankBadge rank={i + 1} />
            <div className="size-7 rounded-full overflow-hidden shrink-0 ring-1 ring-[#f0f1f3]">
              <ImageWithFallback src={rankAvatars[i % rankAvatars.length]} alt={item.name} className="size-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="text-[12px] text-[#070808] leading-[1.4] truncate" style={{ fontWeight: 500, ...ss04 }}>
                {item.name}
              </span>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-[11px] text-[#00bf85] leading-[1.4]" style={{ fontWeight: 600, ...ss04 }}>
                {item.amount}
              </span>
              <EmojiIcon emoji={item.badge} size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HotMarketsSection() {
  return (
    <div className="rounded-xl border border-[#f0f1f3] w-full bg-white">
      <div className="flex flex-col px-4 pt-3 pb-2 w-full">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[12px] text-[#84888c] leading-[1.5]" style={{ fontWeight: 600, ...ss04 }}>Trending Markets</span>
          <span className="size-1.5 bg-[#ff2222] rounded-full animate-pulse" />
        </div>
        {hotMarkets.map((m, i) => (
          <div key={i} className="flex items-center gap-2.5 w-full py-2 hover:bg-[#fafafa] -mx-1 px-1 rounded-lg transition-colors cursor-pointer">
            <EmojiIcon emoji={m.emoji} size={16} />
            <div className="flex-1 min-w-0">
              <span className="text-[12px] text-[#070808] leading-[1.4] truncate block" style={{ fontWeight: 500, ...ss04 }}>
                {m.name}
              </span>
              <span className="text-[10px] text-[#b0b3b8]" style={ss04}>{m.volume}</span>
            </div>
            <span className="text-[11px] text-[#00bf85]" style={{ fontWeight: 600, ...ss04 }}>{m.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Rankings() {
  const [activeTab, setActiveTab] = useState("Creators");
  const navigate = useNavigate();

  return (
    <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-[#070808] leading-[1.5]" style={{ fontWeight: 600, ...ss04 }}>Rankings</span>
        <span className="text-[12px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 500, ...ss04 }} onClick={() => navigate("/leaderboard")}>Tingnan lahat</span>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-[#f7f8f9] rounded-lg p-0.5">
        {["Creators", "Players"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 h-7 rounded-md text-[11px] transition-all cursor-pointer ${
              activeTab === tab ? "bg-white shadow-sm text-[#070808]" : "text-[#84888c]"
            }`}
            style={{ fontWeight: 500, ...ss04 }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Creators" ? (
        <RankingSection title="Top Creators" items={topCreators} />
      ) : (
        <RankingSection title="Top Players" items={topPlayers} />
      )}

      <HotMarketsSection />
    </div>
  );
}