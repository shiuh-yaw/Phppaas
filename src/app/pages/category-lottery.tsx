import CategoryPage, { type CategoryConfig } from "./category";

const config: CategoryConfig = {
  slug: "lottery",
  name: "Lottery",
  emoji: "🎰",
  tagline: "6/45, 6/49, 6/55, 6/58 — prediction markets ng lotto!",
  description: "Ang Lottery category ay hindi actual na lotto — ito ay prediction market kung saan tinataya mo ang possible outcomes ng PCSO lotto draws! Tumaya kung anong number range ang lalabas, kung may jackpot winner, kung gaano kalaki ang prize pool, at iba pang exciting predictions tungkol sa Philippine lottery. Legal at regulated under PAGCOR.",
  heroImage: "https://images.unsplash.com/photo-1725378048950-1f0080427781?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  accentColor: "#7c3aed",
  accentLight: "#f5f3ff",
  stats: { totalBets: "₱6.1M", activeBettors: "4,230", biggestPot: "₱780K", liveNow: 3 },
  subcategories: ["Lahat", "6/45 MegaLotto", "6/49 SuperLotto", "6/55 GrandLotto", "6/58 UltraLotto", "EZ2/Swertres", "Predictions"],
  markets: [
    { id: "lotto-645", title: "6/45 MegaLotto — May Jackpot Winner?", subtitle: "Next draw: Monday 9PM — may mananalo kaya?", status: "upcoming", volume: "₱890K", bettors: 2340, endDate: "Mon Mar 16", options: [{ label: "May Jackpot Winner", odds: 0.08, color: "#16a34a" }, { label: "Walang Winner (Rollover)", odds: 0.92, color: "#dc2626" }], hot: true, featured: true },
    { id: "lotto-658", title: "6/58 UltraLotto Jackpot Over ₱300M?", subtitle: "Aabot kaya sa ₱300M ang jackpot?", status: "live", volume: "₱560K", bettors: 1450, endDate: "Fri Mar 14", options: [{ label: "Oo, over ₱300M", odds: 0.62, color: "#7c3aed" }, { label: "Hindi, below ₱300M", odds: 0.38, color: "#84888c" }], hot: true },
    { id: "lotto-649", title: "6/49 SuperLotto — Odd or Even Majority?", subtitle: "Mas marami bang odd o even numbers ang lalabas?", status: "upcoming", volume: "₱120K", bettors: 450, endDate: "Thu Mar 13", options: [{ label: "Majority Odd", odds: 0.48, color: "#2563eb" }, { label: "Majority Even", odds: 0.42, color: "#ea580c" }, { label: "Equal (3-3)", odds: 0.10, color: "#84888c" }] },
    { id: "lotto-655", title: "6/55 GrandLotto — Highest Number Over 45?", subtitle: "Ang pinakamataas na number ba ay 45+?", status: "upcoming", volume: "₱95K", bettors: 320, endDate: "Sat Mar 15", options: [{ label: "Oo, over 45", odds: 0.73, color: "#16a34a" }, { label: "Hindi, 45 or below", odds: 0.27, color: "#dc2626" }] },
    { id: "lotto-yearly", title: "2026 Total Jackpot Winners — Over/Under 24", subtitle: "Ilang jackpot winners ang magkakaroon ngayong 2026?", status: "live", volume: "₱340K", bettors: 890, endDate: "Dec 31, 2026", options: [{ label: "Over 24 winners", odds: 0.45, color: "#16a34a" }, { label: "Under 24 winners", odds: 0.55, color: "#dc2626" }], featured: true },
    { id: "lotto-swertres", title: "Swertres — Today's Draw Prediction", subtitle: "Range ng result ng 3-digit Swertres", status: "live", volume: "₱45K", bettors: 230, endDate: "Today 9PM", options: [{ label: "000-333", odds: 0.33, color: "#dc2626" }, { label: "334-666", odds: 0.33, color: "#2563eb" }, { label: "667-999", odds: 0.34, color: "#16a34a" }], hot: true },
    { id: "lotto-biggest", title: "Biggest 2026 Jackpot — Over ₱500M?", subtitle: "May jackpot prize ba na aabot sa ₱500M ngayong taon?", status: "live", volume: "₱210K", bettors: 670, endDate: "Dec 2026", options: [{ label: "Oo, ₱500M+", odds: 0.30, color: "#7c3aed" }, { label: "Hindi", odds: 0.70, color: "#84888c" }] },
  ],
};

export default function LotteryPage() {
  return <CategoryPage config={config} />;
}
