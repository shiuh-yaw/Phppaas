import CategoryPage, { type CategoryConfig } from "./category";

const config: CategoryConfig = {
  slug: "showbiz",
  name: "Showbiz",
  emoji: "⭐",
  tagline: "Pinoy showbiz chismis turned into prediction markets!",
  description: "Ang Showbiz category ay para sa mga mahilig sa entertainment at celebrity news! Tumaya sa mga predictions tungkol sa Pinoy showbiz — mula sa TV show ratings, award show winners, celebrity relationships, movie box office performance, hanggang sa mga viral moments. Pure entertainment predictions na pang-good vibes lang!",
  heroImage: "https://images.unsplash.com/photo-1645366188121-2a19e02fcbd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  accentColor: "#ec4899",
  accentLight: "#fdf2f8",
  stats: { totalBets: "₱4.5M", activeBettors: "3,450", biggestPot: "₱560K", liveNow: 4 },
  subcategories: ["Lahat", "TV Shows", "Movies", "Awards", "Celebrity", "Viral Moments", "K-Drama/K-Pop"],
  markets: [
    { id: "bb-pilipinas", title: "Bb. Pilipinas 2026 Winner", subtitle: "Sino ang susunod na queen?", status: "upcoming", volume: "₱560K", bettors: 2100, endDate: "Jul 2026", options: [{ label: "Candidate #7 (Cebu)", odds: 0.22, color: "#ec4899" }, { label: "Candidate #12 (Manila)", odds: 0.18, color: "#f472b6" }, { label: "Candidate #3 (Davao)", odds: 0.15, color: "#a855f7" }, { label: "Others", odds: 0.45, color: "#84888c" }], hot: true, featured: true },
    { id: "mmff-topgross", title: "MMFF 2026 Top Grossing Film", subtitle: "Anong movie ang #1 sa box office?", status: "upcoming", volume: "₱340K", bettors: 1200, endDate: "Dec 2026", options: [{ label: "Vice Ganda Comedy", odds: 0.35, color: "#ec4899" }, { label: "Action Film", odds: 0.25, color: "#dc2626" }, { label: "Romance/Drama", odds: 0.22, color: "#a855f7" }, { label: "Horror", odds: 0.18, color: "#1f2937" }], featured: true },
    { id: "showbiz-ratings", title: "ABS-CBN vs GMA — March Ratings War", subtitle: "Sino ang #1 sa primetime ratings?", status: "live", volume: "₱230K", bettors: 890, endDate: "Mar 31", options: [{ label: "ABS-CBN", odds: 0.48, color: "#dc2626" }, { label: "GMA", odds: 0.45, color: "#16a34a" }, { label: "Tie (within 0.5%)", odds: 0.07, color: "#84888c" }], hot: true },
    { id: "showbiz-viral", title: "Next Pinoy Celebrity Viral Moment", subtitle: "Anong type ng viral moment ang susunod?", status: "live", volume: "₱120K", bettors: 560, endDate: "Mar 20", options: [{ label: "Relationship Reveal", odds: 0.30, color: "#ec4899" }, { label: "Public Feud/Drama", odds: 0.25, color: "#dc2626" }, { label: "Achievement/Award", odds: 0.25, color: "#f59e0b" }, { label: "Comeback/Reunion", odds: 0.20, color: "#2563eb" }] },
    { id: "kpop-concert", title: "Next K-Pop Group Manila Concert", subtitle: "Sino ang susunod na mag-concert sa Manila?", status: "live", volume: "₱180K", bettors: 780, endDate: "Jun 2026", options: [{ label: "BLACKPINK", odds: 0.20, color: "#ec4899" }, { label: "BTS Member Solo", odds: 0.25, color: "#7c3aed" }, { label: "Stray Kids", odds: 0.22, color: "#2563eb" }, { label: "NewJeans", odds: 0.18, color: "#16a34a" }, { label: "Others", odds: 0.15, color: "#84888c" }], hot: true },
    { id: "showbiz-famas", title: "FAMAS 2026 Best Actor", subtitle: "Filipino Academy of Movie Arts and Sciences", status: "upcoming", volume: "₱150K", bettors: 340, endDate: "Jun 2026", options: [{ label: "John Lloyd Cruz", odds: 0.25, color: "#1f2937" }, { label: "Piolo Pascual", odds: 0.22, color: "#2563eb" }, { label: "Coco Martin", odds: 0.20, color: "#ea580c" }, { label: "Others", odds: 0.33, color: "#84888c" }] },
    { id: "showbiz-wedding", title: "Celebrity Wedding ng 2026", subtitle: "Sino ang susunod na celebrity couple na magpapakasal?", status: "live", volume: "₱95K", bettors: 450, endDate: "Dec 2026", options: [{ label: "KathNiel", odds: 0.30, color: "#ec4899" }, { label: "DonBelle", odds: 0.28, color: "#a855f7" }, { label: "Others", odds: 0.42, color: "#84888c" }], featured: true },
  ],
};

export default function ShowbizPage() {
  return <CategoryPage config={config} />;
}
