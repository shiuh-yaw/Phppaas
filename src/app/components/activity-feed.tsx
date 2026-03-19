import { ImageWithFallback } from "./figma/ImageWithFallback";
import { EmojiIcon } from "./two-tone-icons";

const ss04 = { fontFeatureSettings: "'ss04'" };

const feedItems = [
  {
    img: "https://images.unsplash.com/photo-1659367527460-92759bf33263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    title: "PBA Finals: Ginebra vs SMB Game 7",
    buyer: "Juan",
    action: "OO",
    emoji: "🏀",
    price: "₱500",
    badge: "Basketball",
  },
  {
    img: "https://images.unsplash.com/photo-1647005526978-d9608d2fe274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    title: "PBA Finals Game 7 - Ginebra vs San Miguel",
    buyer: "Carlo",
    action: "GINEBRA",
    emoji: "🏀",
    price: "₱1,200",
    badge: "Basketball",
    isLive: true,
  },
  {
    img: "https://images.unsplash.com/photo-1561467586-c2b59497d468?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    title: "Color Game Round #8832 - Berde",
    buyer: "Rina",
    action: "BERDE",
    emoji: "🎲",
    price: "₱300",
    badge: "Color Game",
    isLive: true,
  },
  {
    img: "https://images.unsplash.com/photo-1542720046-1e772598ea39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    title: "Pacquiao comeback fight 2026?",
    buyer: "Maria",
    action: "OO",
    emoji: "🥊",
    price: "₱750",
    badge: "Boxing",
  },
  {
    img: "https://images.unsplash.com/photo-1772587003187-65b32c91df91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    title: "MLBB M6 World Championship - PH team",
    buyer: "Marco",
    action: "OO",
    emoji: "🎮",
    price: "₱420",
    badge: "Esports",
  },
  {
    img: "https://images.unsplash.com/photo-1725378048950-1f0080427781?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    title: "Bingo Round #445 - Range 46-60",
    buyer: "Angela",
    action: "46-60",
    emoji: "💯",
    price: "₱200",
    badge: "Bingo",
    isLive: true,
  },
];

const actionColorMap: Record<string, string> = {
  OO: "#00bf85",
  HINDI: "#ff5222",
  PULA: "#dc2626",
  ASUL: "#2563eb",
  BERDE: "#16a34a",
  "46-60": "#8b5cf6",
};

export function ActivityFeed() {
  return (
    <div className="flex flex-col gap-2 py-4 w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#84888c]" style={{ fontWeight: 500, ...ss04 }}>Pinakabagong Trades</span>
          <span className="bg-[#ff5222] text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse" style={{ fontWeight: 700 }}>
            LIVE
          </span>
        </div>
        <span className="text-[12px] text-[#ff5222] cursor-pointer hover:underline" style={{ fontWeight: 500, ...ss04 }}>Tingnan lahat</span>
      </div>
      <div className="flex gap-3 w-full overflow-x-auto pb-1">
        {feedItems.map((item, i) => (
          <div
            key={i}
            className="shrink-0 w-[280px] rounded-xl border border-[#f0f1f3] flex items-center gap-2.5 p-2.5 hover:shadow-sm transition-shadow cursor-pointer bg-white"
          >
            <div className="size-[44px] rounded-lg shrink-0 overflow-hidden relative">
              <ImageWithFallback src={item.img} alt="" className="size-full object-cover" />
              {item.isLive && (
                <div className="absolute top-0 right-0 size-2 bg-[#ff2222] rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <EmojiIcon emoji={item.emoji} size={12} />
                <span className="text-[9px] text-[#b0b3b8] bg-[#f7f8f9] px-1 rounded" style={{ fontWeight: 500, ...ss04 }}>{item.badge}</span>
              </div>
              <p className="text-[12px] text-[#070808] leading-[1.35] line-clamp-1" style={{ fontWeight: 500, ...ss04 }}>
                {item.title}
              </p>
              <p className="text-[10px] text-[#84888c] leading-[1.5]" style={ss04}>
                {item.buyer} bumili ng{" "}
                <span style={{ fontWeight: 600, color: actionColorMap[item.action] || "#00bf85" }}>
                  {item.action}
                </span>{" "}
                · {item.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}