import CategoryPage, { type CategoryConfig } from "./category";

const config: CategoryConfig = {
  slug: "boxing",
  name: "Boxing",
  emoji: "🥊",
  tagline: "Mula Pacquiao legacy hanggang next-gen Pinoy fighters!",
  description: "Ang Boxing category ay para sa mga mahilig sa combat sports! Tumaya sa mga upcoming fights — mula sa Pinoy boxing pride hanggang sa mga world championship bouts. Sakop ang WBA, WBC, WBO, IBF title fights, undercard bouts, at special exhibition matches. Pwede kang tumaya sa winner, method of victory (KO, TKO, Decision), at round predictions.",
  heroImage: "https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  accentColor: "#b91c1c",
  accentLight: "#fef2f2",
  stats: { totalBets: "₱5.7M", activeBettors: "3,890", biggestPot: "₱1.2M", liveNow: 2 },
  subcategories: ["Lahat", "World Title", "Pinoy Boxers", "Undercard", "Exhibition", "MMA/UFC", "Method of Victory"],
  markets: [
    { id: "boxing-donaire", title: "Donaire vs Martinez — WBC Bantamweight", subtitle: "Nonito 'The Filipino Flash' Donaire's comeback fight", status: "upcoming", volume: "₱1.2M", bettors: 2340, endDate: "Apr 5, 2026", options: [{ label: "Donaire by Decision", odds: 0.30, color: "#dc2626" }, { label: "Donaire by KO/TKO", odds: 0.22, color: "#ea580c" }, { label: "Martinez Wins", odds: 0.35, color: "#2563eb" }, { label: "Draw", odds: 0.13, color: "#84888c" }], hot: true, featured: true },
    { id: "boxing-inoue", title: "Inoue vs Nery — Undisputed Super Bantam", subtitle: "Monster Inoue defends all 4 belts", status: "upcoming", volume: "₱890K", bettors: 1560, endDate: "May 2026", options: [{ label: "Inoue by KO", odds: 0.45, color: "#dc2626" }, { label: "Inoue by Decision", odds: 0.25, color: "#ea580c" }, { label: "Nery Upset", odds: 0.20, color: "#2563eb" }, { label: "Draw", odds: 0.10, color: "#84888c" }], hot: true },
    { id: "boxing-ancajas", title: "Ancajas vs Rodriguez — IBF Super Flyweight", subtitle: "Jerwin Ancajas reclaim title attempt", status: "live", volume: "₱430K", bettors: 890, endDate: "TONIGHT", options: [{ label: "Ancajas", odds: 0.48, color: "#dc2626" }, { label: "Rodriguez", odds: 0.52, color: "#2563eb" }], hot: true },
    { id: "boxing-casimero", title: "Casimero Next Fight — Opponent TBA", subtitle: "John Riel Casimero return to ring", status: "upcoming", volume: "₱210K", bettors: 450, endDate: "TBA", options: [{ label: "Casimero KO Win", odds: 0.35, color: "#dc2626" }, { label: "Casimero Decision", odds: 0.30, color: "#ea580c" }, { label: "Opponent Wins", odds: 0.35, color: "#2563eb" }] },
    { id: "boxing-exhibition", title: "Celebrity Boxing: Vice Ganda vs Vhong?", subtitle: "Charity exhibition match — for fun lang!", status: "upcoming", volume: "₱560K", bettors: 2100, endDate: "Apr 2026", options: [{ label: "Vice Ganda", odds: 0.45, color: "#ec4899" }, { label: "Vhong Navarro", odds: 0.40, color: "#2563eb" }, { label: "Draw (Tie)", odds: 0.15, color: "#84888c" }], featured: true },
    { id: "boxing-fury-usyk", title: "Fury vs Usyk Trilogy", subtitle: "Heavyweight championship trilogy bout", status: "upcoming", volume: "₱1.5M", bettors: 3200, endDate: "Jun 2026", options: [{ label: "Tyson Fury", odds: 0.42, color: "#dc2626" }, { label: "Oleksandr Usyk", odds: 0.48, color: "#2563eb" }, { label: "Draw", odds: 0.10, color: "#84888c" }], hot: true },
  ],
};

export default function BoxingPage() {
  return <CategoryPage config={config} />;
}
