import CategoryPage, { type CategoryConfig } from "./category";

const config: CategoryConfig = {
  slug: "esports",
  name: "Esports",
  emoji: "🎮",
  tagline: "MLBB, Valorant, Dota 2, LoL — Pinoy esports pride!",
  description: "Ang Esports category ay para sa mga gamers at esports fans! Sakop nito ang pinakamalaking esports tournaments sa Pilipinas at sa buong mundo — mula sa Mobile Legends M-Series, Valorant Champions Tour, Dota 2 The International, hanggang sa League of Legends Worlds. Tumaya sa match outcomes, tournament winners, MVP awards, at special in-game predictions.",
  heroImage: "https://images.unsplash.com/photo-1772587003187-65b32c91df91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  accentColor: "#6366f1",
  accentLight: "#eef2ff",
  stats: { totalBets: "₱7.2M", activeBettors: "5,670", biggestPot: "₱680K", liveNow: 6 },
  subcategories: ["Lahat", "Mobile Legends", "Valorant", "Dota 2", "League of Legends", "PUBG Mobile", "Call of Duty", "Wild Rift"],
  markets: [
    { id: "mlbb-m6", title: "M6 World Championship Winner", subtitle: "Mobile Legends Bang Bang — pinakamalaking ML tournament!", status: "live", volume: "₱1.8M", bettors: 4500, endDate: "Mar 2026", options: [{ label: "🇵🇭 ECHO PH", odds: 0.22, color: "#dc2626" }, { label: "🇮🇩 ONIC ID", odds: 0.20, color: "#ea580c" }, { label: "🇵🇭 Blacklist Intl", odds: 0.18, color: "#2563eb" }, { label: "Others", odds: 0.40, color: "#84888c" }], hot: true, featured: true },
    { id: "vct-pacific", title: "VCT Pacific: Pinoy Team Top 4?", subtitle: "Valorant Champions Tour Pacific League", status: "live", volume: "₱450K", bettors: 1200, endDate: "Apr 2026", options: [{ label: "Oo, may PH team sa Top 4", odds: 0.35, color: "#16a34a" }, { label: "Wala", odds: 0.65, color: "#dc2626" }], hot: true },
    { id: "dota2-ti", title: "The International 2026 Winner", subtitle: "Dota 2 pinakamataas na prize pool na tournament", status: "upcoming", volume: "₱980K", bettors: 1890, endDate: "Aug 2026", options: [{ label: "Team Spirit", odds: 0.18, color: "#2563eb" }, { label: "Tundra", odds: 0.15, color: "#7c3aed" }, { label: "OG", odds: 0.14, color: "#16a34a" }, { label: "Others", odds: 0.53, color: "#84888c" }] },
    { id: "mlbb-mpl-ph", title: "MPL PH Season 14 Champion", subtitle: "Mobile Legends Pro League Philippines", status: "live", volume: "₱670K", bettors: 2100, endDate: "Apr 2026", options: [{ label: "ECHO", odds: 0.28, color: "#dc2626" }, { label: "Blacklist", odds: 0.25, color: "#2563eb" }, { label: "TNC", odds: 0.20, color: "#ea580c" }, { label: "Others", odds: 0.27, color: "#84888c" }], featured: true },
    { id: "lol-worlds", title: "LoL Worlds 2026 Champion", subtitle: "League of Legends World Championship", status: "upcoming", volume: "₱890K", bettors: 1450, endDate: "Oct 2026", options: [{ label: "T1 (Korea)", odds: 0.25, color: "#dc2626" }, { label: "Gen.G", odds: 0.20, color: "#f59e0b" }, { label: "BLG (China)", odds: 0.22, color: "#ea580c" }, { label: "Others", odds: 0.33, color: "#84888c" }], hot: true },
    { id: "pubgm-tournament", title: "PUBG Mobile Philippine Championship", subtitle: "Top Pinoy PUBG Mobile teams", status: "live", volume: "₱230K", bettors: 670, endDate: "Mar 20", options: [{ label: "SRG", odds: 0.30, color: "#dc2626" }, { label: "Nova", odds: 0.28, color: "#2563eb" }, { label: "Others", odds: 0.42, color: "#84888c" }] },
    { id: "mlbb-mvp", title: "MPL PH Season 14 MVP", subtitle: "Sino ang standout player ngayong season?", status: "live", volume: "₱180K", bettors: 560, endDate: "Apr 2026", options: [{ label: "KarlTzy", odds: 0.25, color: "#7c3aed" }, { label: "Kelra", odds: 0.22, color: "#2563eb" }, { label: "Hadji", odds: 0.20, color: "#ea580c" }, { label: "Others", odds: 0.33, color: "#84888c" }] },
    { id: "codm-worlds", title: "Call of Duty Mobile World Championship", subtitle: "Global CODM tournament", status: "upcoming", volume: "₱150K", bettors: 340, endDate: "Jul 2026", options: [{ label: "PH Team Wins", odds: 0.15, color: "#dc2626" }, { label: "Others Win", odds: 0.85, color: "#84888c" }] },
  ],
};

export default function EsportsPage() {
  return <CategoryPage config={config} />;
}
