import CategoryPage, { type CategoryConfig } from "./category";

const config: CategoryConfig = {
  slug: "basketball",
  name: "Basketball",
  emoji: "🏀",
  tagline: "PBA, NBA, UAAP, at NCAA — tumaya sa paborito mong koponan!",
  description: "Ang Basketball category ay sakop ang lahat ng major basketball leagues sa Pilipinas at buong mundo. Mula sa PBA Philippine Cup hanggang NBA Finals, UAAP Season, at NCAA — puwede kang tumaya sa outcomes ng laro, MVP awards, playoff matchups, at iba pa. Ang basketball ang #1 sport sa Pilipinas kaya asahan ang pinakamaraming bettors at pinakamalaking pots dito sa Lucky Taya!",
  heroImage: "https://images.unsplash.com/photo-1640862101983-9f7ef7fd7cc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  accentColor: "#ea580c",
  accentLight: "#fff7ed",
  stats: { totalBets: "₱12.4M", activeBettors: "8,234", biggestPot: "₱890K", liveNow: 5 },
  subcategories: ["Lahat", "PBA", "NBA", "UAAP", "NCAA", "FIBA", "EuroLeague", "MVP Race"],
  markets: [
    { id: "pba-finals", title: "PBA Philippine Cup Finals: Ginebra vs SMB", subtitle: "Sino mananalo sa Best-of-7 series?", status: "live", volume: "₱2.3M", bettors: 3420, endDate: "Game 5 · Mar 15", options: [{ label: "Ginebra Gin Kings", odds: 0.58, color: "#ea580c" }, { label: "San Miguel Beermen", odds: 0.42, color: "#2563eb" }], hot: true, featured: true },
    { id: "nba-finals", title: "NBA Finals 2026 Champion", subtitle: "Sino mananalo ng Larry O'Brien Trophy?", status: "live", volume: "₱1.8M", bettors: 2100, endDate: "Jun 2026", options: [{ label: "Boston Celtics", odds: 0.35, color: "#16a34a" }, { label: "OKC Thunder", odds: 0.28, color: "#2563eb" }, { label: "Others", odds: 0.37, color: "#84888c" }], hot: true },
    { id: "uaap-finals", title: "UAAP Season 88 Basketball Champion", subtitle: "College basketball — sino ang babagsak?", status: "upcoming", volume: "₱780K", bettors: 1250, endDate: "Apr 2026", options: [{ label: "Ateneo Blue Eagles", odds: 0.32, color: "#2563eb" }, { label: "La Salle Green Archers", odds: 0.30, color: "#16a34a" }, { label: "UP Maroons", odds: 0.22, color: "#7c2d12" }, { label: "Others", odds: 0.16, color: "#84888c" }] },
    { id: "pba-mvp", title: "PBA Season 49 MVP Award", subtitle: "Sino ang magiging MVP ngayong season?", status: "live", volume: "₱450K", bettors: 890, endDate: "May 2026", options: [{ label: "June Mar Fajardo", odds: 0.30, color: "#ea580c" }, { label: "Scottie Thompson", odds: 0.25, color: "#dc2626" }, { label: "Justin Brownlee", odds: 0.28, color: "#7c3aed" }, { label: "Others", odds: 0.17, color: "#84888c" }], featured: true },
    { id: "ginebra-smb-g3", title: "PBA Finals Game 3: Over/Under 195.5", subtitle: "Total points ng dalawang team", status: "live", volume: "₱320K", bettors: 780, endDate: "Tonight 7PM", options: [{ label: "Over 195.5", odds: 0.52, color: "#16a34a" }, { label: "Under 195.5", odds: 0.48, color: "#dc2626" }], hot: true },
    { id: "nba-mvp-2026", title: "NBA MVP 2025-26 Season", subtitle: "Regular season MVP award", status: "upcoming", volume: "₱560K", bettors: 670, endDate: "Apr 2026", options: [{ label: "Nikola Jokic", odds: 0.28, color: "#1e40af" }, { label: "Shai Gilgeous-Alexander", odds: 0.30, color: "#ea580c" }, { label: "Luka Doncic", odds: 0.20, color: "#2563eb" }, { label: "Others", odds: 0.22, color: "#84888c" }] },
    { id: "ncaa-champion", title: "NCAA Season 100 Basketball Finals", subtitle: "Centennial season — sino ang champion?", status: "upcoming", volume: "₱210K", bettors: 450, endDate: "Mar 2026", options: [{ label: "Letran Knights", odds: 0.35, color: "#dc2626" }, { label: "San Beda Red Lions", odds: 0.32, color: "#b91c1c" }, { label: "Others", odds: 0.33, color: "#84888c" }] },
    { id: "fiba-asia-ph", title: "FIBA Asia Cup: Gilas Pilipinas Top 4?", subtitle: "Makakapasok ba ang Pilipinas sa semis?", status: "closing", volume: "₱380K", bettors: 920, endDate: "Mar 20", options: [{ label: "Oo, Top 4", odds: 0.40, color: "#16a34a" }, { label: "Hindi", odds: 0.60, color: "#dc2626" }] },
  ],
};

export default function BasketballPage() {
  return <CategoryPage config={config} />;
}
