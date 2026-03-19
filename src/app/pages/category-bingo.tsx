import CategoryPage, { type CategoryConfig } from "./category";

const config: CategoryConfig = {
  slug: "bingo",
  name: "Bingo",
  emoji: "💯",
  tagline: "B-I-N-G-O! Ang classic na laro, digital na ngayon!",
  description: "Ang Bingo category ay ang paborito ng mga tita at tito — pero pati mga bata naglalaro na rin! Sa Lucky Taya, puwede kang sumali sa digital bingo games na may real-time number draws, auto-daub feature, at special pattern games. May regular bingo, speed bingo, jackpot bingo, at special themed rounds. Mas madami ang players, mas malaki ang pot!",
  heroImage: "https://images.unsplash.com/photo-1651359729278-7fadd8d93152?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  accentColor: "#0891b2",
  accentLight: "#ecfeff",
  stats: { totalBets: "₱3.4M", activeBettors: "2,890", biggestPot: "₱320K", liveNow: 4 },
  subcategories: ["Lahat", "Classic 75-Ball", "Speed Bingo", "Jackpot Bingo", "Pattern Bingo", "Mega Bingo", "VIP Room"],
  markets: [
    { id: "bingo-classic-1", title: "Classic 75-Ball Bingo — Room A", subtitle: "Standard bingo, unang mag-BINGO panalo!", status: "live", volume: "₱45K", bettors: 120, endDate: "Every 10 mins", options: [{ label: "Buy 1 Card (₱50)", odds: 0.08, color: "#0891b2" }, { label: "Buy 3 Cards (₱120)", odds: 0.22, color: "#2563eb" }, { label: "Buy 5 Cards (₱180)", odds: 0.35, color: "#16a34a" }], hot: true, featured: true },
    { id: "bingo-speed", title: "Speed Bingo — 30 Number Draw", subtitle: "Mabilis! 30 numbers lang, 2-minute rounds", status: "live", volume: "₱32K", bettors: 200, endDate: "Non-stop", options: [{ label: "Join Round", odds: 0.15, color: "#0891b2" }, { label: "View Results", odds: 0.85, color: "#84888c" }], hot: true },
    { id: "bingo-jackpot", title: "Jackpot Bingo — ₱500K Prize Pool", subtitle: "Blackout sa unang 45 numbers = JACKPOT!", status: "live", volume: "₱500K", bettors: 890, endDate: "Every 30 mins", options: [{ label: "₱100 Entry", odds: 0.02, color: "#dc2626" }, { label: "₱500 Entry (5x cards)", odds: 0.08, color: "#ea580c" }], featured: true },
    { id: "bingo-pattern", title: "Pattern Bingo — Letter L", subtitle: "Bumuo ng Letter L pattern para manalo!", status: "live", volume: "₱28K", bettors: 150, endDate: "Every 15 mins", options: [{ label: "1 Card", odds: 0.10, color: "#0891b2" }, { label: "3 Cards", odds: 0.28, color: "#2563eb" }] },
    { id: "bingo-mega", title: "Mega Bingo Night — Saturday Special", subtitle: "₱1M prize pool, special prizes every hour!", status: "upcoming", volume: "₱1M", bettors: 2300, endDate: "Sat Mar 15", options: [{ label: "Reserve Seat", odds: 0.50, color: "#7c3aed" }, { label: "VIP Entry", odds: 0.50, color: "#0891b2" }], hot: true },
    { id: "bingo-prediction", title: "Bingo Number Prediction — Next 5 Numbers", subtitle: "Hulaan ang susunod na 5 numbers na lalabas!", status: "live", volume: "₱15K", bettors: 80, endDate: "Next draw 3:00", options: [{ label: "Low (1-25)", odds: 0.34, color: "#16a34a" }, { label: "Mid (26-50)", odds: 0.33, color: "#2563eb" }, { label: "High (51-75)", odds: 0.33, color: "#dc2626" }] },
  ],
};

export default function BingoPage() {
  return <CategoryPage config={config} />;
}
