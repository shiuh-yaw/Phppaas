import { useState } from "react";
import { CaretDownIcon, SearchIcon } from "./icons";
import { EmojiIcon } from "./two-tone-icons";

const ss04 = { fontFeatureSettings: "'ss04'" };

const categories = [
  { label: "Trending", emoji: "🔥" },
  { label: "Basketball", emoji: "🏀" },
  { label: "Color Game", emoji: "🎲" },
  { label: "Boxing", emoji: "🥊" },
  { label: "Economy", emoji: "📈" },
];

export function Filters() {
  const [activeTab, setActiveTab] = useState("Events");
  const [activeCategory, setActiveCategory] = useState("Trending");

  return (
    <div className="w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Events / Fast Bet Tabs */}
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-5 h-10">
          {["Events", "Fast Bet"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative text-[14px] cursor-pointer transition-colors"
              style={{
                color: activeTab === tab ? "#070808" : "#84888c",
                fontWeight: 500,
                ...ss04,
              }}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-[#ff5222] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs (scrollable) + Filters */}
      <div className="flex items-center justify-between pb-4 w-full gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1 min-w-0">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`h-8 px-3 rounded-full flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 ${
                activeCategory === cat.label
                  ? "bg-[#ff5222] text-white"
                  : "bg-[#f7f8f9] text-[#84888c] hover:bg-[#eef0f2]"
              }`}
            >
              <EmojiIcon emoji={cat.emoji} size={14} />
              <span className="text-[12px] leading-[1.5] whitespace-nowrap" style={{ fontWeight: 500, ...ss04 }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Filter Select */}
          <div className="bg-[#f7f8f9] h-9 w-[130px] rounded-lg flex items-center px-3 gap-2 cursor-pointer hover:bg-[#eef0f2] transition-colors">
            <span className="flex-1 text-[12px] text-[#84888c] leading-[1.5]" style={ss04}>Lahat</span>
            <CaretDownIcon />
          </div>

          {/* Search */}
          <div className="bg-[#f7f8f9] h-9 w-[180px] rounded-lg flex items-center px-3 gap-2 overflow-hidden">
            <SearchIcon />
            <input
              type="text"
              placeholder="Maghanap..."
              className="flex-1 text-[12px] text-[#070808] leading-[1.5] bg-transparent outline-none placeholder:text-[#b0b3b8]"
              style={ss04}
            />
          </div>
        </div>
      </div>
    </div>
  );
}