import CategoryPage, { type CategoryConfig } from "./category";

const config: CategoryConfig = {
  slug: "color-game",
  name: "Color Game",
  emoji: "🎲",
  tagline: "Ang paboritong perya game ng Pinoy — digital na version!",
  description: "Ang Color Game ay ang iconic na Filipino perya game na naging digital! Pumili ng kulay — Pula, Asul, Berde, Dilaw, Puti, o Rosas — at tumaya. Tatlong dice ang i-roroll at kung lumabas ang kulay mo, panalo ka! Simple, mabilis, at nakakaexcite. Sa Lucky Taya, may special rounds, jackpot multipliers, at live results para sa pinakamasayang betting experience.",
  heroImage: "https://images.unsplash.com/photo-1596687909057-dfac2b25b891?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  accentColor: "#dc2626",
  accentLight: "#fef2f2",
  stats: { totalBets: "₱8.9M", activeBettors: "6,120", biggestPot: "₱450K", liveNow: 8 },
  subcategories: ["Lahat", "Classic 3-Dice", "Super Color", "Jackpot Rounds", "Speed Color", "VIP Table", "Tournament"],
  markets: [
    { id: "color-classic-1", title: "Classic Color Game — Round 247", subtitle: "3-dice roll, pumili ng panalo mong kulay", status: "live", volume: "₱85K", bettors: 340, endDate: "Rolling in 2:00", options: [{ label: "🔴 Pula", odds: 0.18, color: "#dc2626" }, { label: "🔵 Asul", odds: 0.16, color: "#2563eb" }, { label: "🟢 Berde", odds: 0.17, color: "#16a34a" }], hot: true, featured: true },
    { id: "color-super-1", title: "Super Color Game — Triple Chance", subtitle: "3x multiplier kung triple color lumabas!", status: "live", volume: "₱120K", bettors: 560, endDate: "Next roll 1:30", options: [{ label: "🟡 Dilaw", odds: 0.16, color: "#ca8a04" }, { label: "⚪ Puti", odds: 0.17, color: "#6b7280" }, { label: "🩷 Rosas", odds: 0.16, color: "#ec4899" }], hot: true },
    { id: "color-jackpot", title: "Jackpot Color — All Same Color Wins ₱100K", subtitle: "Kung tatlong dice pare-pareho ang kulay, JACKPOT!", status: "live", volume: "₱350K", bettors: 1200, endDate: "Every 5 mins", options: [{ label: "Triple Pula 🔴🔴🔴", odds: 0.028, color: "#dc2626" }, { label: "Triple Asul 🔵🔵🔵", odds: 0.028, color: "#2563eb" }, { label: "Any Triple", odds: 0.17, color: "#7c3aed" }], featured: true },
    { id: "color-speed", title: "Speed Color — 30 Second Rounds", subtitle: "Mabilis na round para sa mabilisang bettor!", status: "live", volume: "₱45K", bettors: 280, endDate: "Non-stop", options: [{ label: "🔴 Pula", odds: 0.18, color: "#dc2626" }, { label: "🔵 Asul", odds: 0.17, color: "#2563eb" }], hot: true },
    { id: "color-streak", title: "Color Streak Challenge — 5 Wins in a Row", subtitle: "Ma-hit mo ba ang 5 consecutive wins? 10x payout!", status: "live", volume: "₱180K", bettors: 890, endDate: "Ongoing", options: [{ label: "Start Streak", odds: 0.10, color: "#ea580c" }, { label: "Current Streak Leaders", odds: 0.90, color: "#16a34a" }] },
    { id: "color-tournament", title: "Weekly Color Game Tournament", subtitle: "Top 10 bettors may bonus ₱50K prize pool", status: "upcoming", volume: "₱500K", bettors: 1500, endDate: "Sun Mar 15", options: [{ label: "Join Tournament", odds: 0.50, color: "#7c3aed" }, { label: "View Leaderboard", odds: 0.50, color: "#2563eb" }] },
    { id: "color-vip", title: "VIP Color Table — High Roller", subtitle: "Minimum ₱1,000 bet, maximum ₱50,000", status: "live", volume: "₱780K", bettors: 120, endDate: "24/7", options: [{ label: "🔴 Pula", odds: 0.18, color: "#dc2626" }, { label: "🔵 Asul", odds: 0.16, color: "#2563eb" }, { label: "🟢 Berde", odds: 0.17, color: "#16a34a" }, { label: "🟡 Dilaw", odds: 0.16, color: "#ca8a04" }] },
    { id: "color-prediction", title: "Anong dominant color bukas?", subtitle: "Prediction market — anong kulay ang pinaka-maraming wins bukas?", status: "upcoming", volume: "₱90K", bettors: 340, endDate: "Mar 13", options: [{ label: "🔴 Pula", odds: 0.20, color: "#dc2626" }, { label: "🔵 Asul", odds: 0.22, color: "#2563eb" }, { label: "🟢 Berde", odds: 0.18, color: "#16a34a" }] },
  ],
};

export default function ColorGamePage() {
  return <CategoryPage config={config} />;
}
