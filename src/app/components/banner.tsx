import { ImageWithFallback } from "./figma/ImageWithFallback";
import { EmojiIcon } from "./two-tone-icons";

const ss04 = { fontFeatureSettings: "'ss04'" };

const highlights = [
  { emoji: "🏀", label: "PBA", sub: "Live Now" },
  { emoji: "🎲", label: "Color Game", sub: "Every 1min" },
  { emoji: "🥊", label: "Boxing", sub: "Main Event" },
];

export function Banner() {
  return (
    <div className="w-full rounded-2xl overflow-hidden relative h-[150px] bg-gradient-to-r from-[#ff5222] via-[#ff6b3d] to-[#ff8f5a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Background image — man celebrating victory */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1697289478257-cc6c01c3800f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
          alt=""
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff5222]/90 via-[#ff6b3d]/85 to-[#ff8f5a]/80" />
      </div>

      <div className="relative flex items-center justify-between h-full px-4 md:px-7">
        <div className="flex flex-col gap-2.5 max-w-[60%] md:max-w-[55%]">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full" style={{ fontWeight: 600, ...ss04 }}>
              LUCKY TAYA
            </span>
            <span className="bg-white/15 text-white/90 text-[10px] px-2 py-0.5 rounded-full" style={{ fontWeight: 500, ...ss04 }}>
              PAGCOR Licensed
            </span>
          </div>
          <h2 className="text-white text-[20px] leading-tight" style={{ fontWeight: 700 }}>
            Tumaya sa pinakapopular na games ng Pilipinas!
          </h2>
          <p className="text-white/80 text-[12px] leading-[1.4]" style={ss04}>
            Basketball, Color Game, Boxing, Esports at iba pa. Mag-deposit via GCash o Maya.
          </p>
        </div>

        {/* Highlight chips */}
        <div className="flex flex-col gap-2 shrink-0">
          {highlights.map((h) => (
            <div key={h.label} className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-1.5 backdrop-blur-sm hover:bg-white/25 transition-colors cursor-pointer">
              <EmojiIcon emoji={h.emoji} size={18} />
              <div className="flex flex-col">
                <span className="text-white text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{h.label}</span>
                <span className="text-white/60 text-[9px]" style={ss04}>{h.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}