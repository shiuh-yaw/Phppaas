import CategoryPage, { type CategoryConfig } from "./category";

const config: CategoryConfig = {
  slug: "economy",
  name: "Economy",
  emoji: "📈",
  tagline: "PSEi, USD/PHP, inflation, GDP — Philippine economy predictions!",
  description: "Ang Economy category ay para sa mga interested sa Philippine economy at financial markets! Tumaya sa predictions tungkol sa PSEi index performance, peso-dollar exchange rate, inflation rate, GDP growth, BSP interest rates, at iba pang economic indicators. Gamit ang official data mula sa BSP, PSA, at PSE para sa fair at transparent na resolution ng markets.",
  heroImage: "https://images.unsplash.com/photo-1766218329569-53c9270bb305?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  accentColor: "#059669",
  accentLight: "#ecfdf5",
  stats: { totalBets: "₱3.9M", activeBettors: "2,120", biggestPot: "₱670K", liveNow: 4 },
  subcategories: ["Lahat", "PSEi", "USD/PHP", "Inflation", "GDP", "BSP Rates", "OFW Remittance", "Real Estate"],
  markets: [
    { id: "psei-march", title: "PSEi March Close — Over/Under 7,000", subtitle: "San magsasara ang PSEi index ngayong March?", status: "live", volume: "₱670K", bettors: 1450, endDate: "Mar 31", options: [{ label: "Over 7,000", odds: 0.55, color: "#16a34a" }, { label: "Under 7,000", odds: 0.45, color: "#dc2626" }], hot: true, featured: true },
    { id: "usdphp-q1", title: "USD/PHP Rate End of Q1 2026", subtitle: "Magkano ang palitan ng peso sa dollar?", status: "live", volume: "₱450K", bettors: 890, endDate: "Mar 31", options: [{ label: "Below ₱55", odds: 0.20, color: "#16a34a" }, { label: "₱55-57", odds: 0.45, color: "#2563eb" }, { label: "Above ₱57", odds: 0.35, color: "#dc2626" }], hot: true },
    { id: "inflation-feb", title: "February 2026 Inflation Rate", subtitle: "BSP official inflation data", status: "closing", volume: "₱230K", bettors: 560, endDate: "Mar 14", options: [{ label: "Below 3%", odds: 0.25, color: "#16a34a" }, { label: "3-4%", odds: 0.45, color: "#f59e0b" }, { label: "Above 4%", odds: 0.30, color: "#dc2626" }], featured: true },
    { id: "gdp-q1", title: "Q1 2026 GDP Growth Rate", subtitle: "Philippine economic growth — gaano kabilis?", status: "upcoming", volume: "₱340K", bettors: 670, endDate: "May 2026", options: [{ label: "Above 6%", odds: 0.40, color: "#16a34a" }, { label: "5-6%", odds: 0.35, color: "#2563eb" }, { label: "Below 5%", odds: 0.25, color: "#dc2626" }] },
    { id: "bsp-rate", title: "BSP Interest Rate Decision — March", subtitle: "Mag-hold, cut, o hike ang BSP?", status: "upcoming", volume: "₱560K", bettors: 1200, endDate: "Mar 27", options: [{ label: "Rate Cut (-25bps)", odds: 0.35, color: "#16a34a" }, { label: "Hold (No Change)", odds: 0.50, color: "#2563eb" }, { label: "Rate Hike", odds: 0.15, color: "#dc2626" }], hot: true },
    { id: "ofw-remit", title: "OFW Remittances — 2026 Total Over $38B?", subtitle: "BSP target na remittance inflows", status: "live", volume: "₱180K", bettors: 340, endDate: "Dec 2026", options: [{ label: "Over $38B", odds: 0.58, color: "#16a34a" }, { label: "Under $38B", odds: 0.42, color: "#dc2626" }] },
    { id: "real-estate", title: "Metro Manila Condo Prices — Up or Down?", subtitle: "Average condo price per sqm ngayong Q2 2026", status: "upcoming", volume: "₱290K", bettors: 450, endDate: "Jun 2026", options: [{ label: "Up (price increase)", odds: 0.55, color: "#16a34a" }, { label: "Down (price decrease)", odds: 0.30, color: "#dc2626" }, { label: "Flat (±1%)", odds: 0.15, color: "#84888c" }], featured: true },
    { id: "psei-record", title: "PSEi All-Time High in 2026?", subtitle: "Ma-break ba ang 9,078 record?", status: "live", volume: "₱120K", bettors: 230, endDate: "Dec 2026", options: [{ label: "Oo, new ATH", odds: 0.20, color: "#16a34a" }, { label: "Hindi", odds: 0.80, color: "#dc2626" }] },
  ],
};

export default function EconomyPage() {
  return <CategoryPage config={config} />;
}
