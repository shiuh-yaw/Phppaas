import CategoryPage, { type CategoryConfig } from "./category";

const config: CategoryConfig = {
  slug: "weather",
  name: "Weather",
  emoji: "🌪",
  tagline: "Typhoon predictions, temperature bets, at weather forecasts!",
  description: "Ang Weather category ay unique sa Lucky Taya — tumaya sa weather-related predictions para sa Pilipinas! Mula sa typhoon landfall locations, bilang ng bagyo sa isang season, temperature records, rainfall amounts, hanggang sa PAGASA signal warnings. Data-driven predictions gamit ang official PAGASA at international weather data. Perfect para sa mga weather enthusiasts!",
  heroImage: "https://images.unsplash.com/photo-1642989739927-f099ad27701a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  accentColor: "#0284c7",
  accentLight: "#e0f2fe",
  stats: { totalBets: "₱2.8M", activeBettors: "1,890", biggestPot: "₱450K", liveNow: 3 },
  subcategories: ["Lahat", "Typhoon", "Temperature", "Rainfall", "PAGASA Signals", "El Nino/La Nina", "Climate"],
  markets: [
    { id: "typhoon-march", title: "March 2026 Typhoon — May bagyo ba?", subtitle: "May papasok bang typhoon sa PAR ngayong March?", status: "live", volume: "₱340K", bettors: 890, endDate: "Mar 31", options: [{ label: "Oo, may typhoon", odds: 0.35, color: "#dc2626" }, { label: "Wala", odds: 0.65, color: "#16a34a" }], hot: true, featured: true },
    { id: "typhoon-2026-total", title: "2026 Total Typhoons — Over/Under 20", subtitle: "Ilang typhoon ang papasok sa PAR ngayong 2026?", status: "live", volume: "₱450K", bettors: 1200, endDate: "Dec 2026", options: [{ label: "Over 20 typhoons", odds: 0.55, color: "#dc2626" }, { label: "Under 20 typhoons", odds: 0.45, color: "#16a34a" }], featured: true },
    { id: "weather-temp-record", title: "Philippines Temperature Record 2026", subtitle: "Ma-break ba ang 42.2°C record ng Tuguegarao?", status: "upcoming", volume: "₱120K", bettors: 340, endDate: "May 2026", options: [{ label: "Oo, new record", odds: 0.15, color: "#dc2626" }, { label: "Hindi", odds: 0.85, color: "#16a34a" }] },
    { id: "weather-manila-rain", title: "Manila Rainfall — March Over 100mm?", subtitle: "Total rainfall ng Metro Manila ngayong March", status: "live", volume: "₱85K", bettors: 230, endDate: "Mar 31", options: [{ label: "Over 100mm", odds: 0.30, color: "#2563eb" }, { label: "Under 100mm", odds: 0.70, color: "#f59e0b" }], hot: true },
    { id: "weather-signal3", title: "Signal #3 sa Metro Manila — 2026", subtitle: "May Signal #3 ba sa Metro Manila ngayong taon?", status: "live", volume: "₱210K", bettors: 560, endDate: "Dec 2026", options: [{ label: "Oo", odds: 0.60, color: "#dc2626" }, { label: "Wala", odds: 0.40, color: "#16a34a" }] },
    { id: "weather-elnino", title: "El Nino or La Nina — 2nd Half 2026", subtitle: "Anong climate pattern ang dominant?", status: "upcoming", volume: "₱180K", bettors: 450, endDate: "Jul 2026", options: [{ label: "El Nino (Dry)", odds: 0.35, color: "#f59e0b" }, { label: "La Nina (Wet)", odds: 0.40, color: "#2563eb" }, { label: "Neutral", odds: 0.25, color: "#84888c" }] },
    { id: "weather-strongest", title: "Strongest 2026 Typhoon — Category 5?", subtitle: "May super typhoon ba ngayong 2026?", status: "upcoming", volume: "₱290K", bettors: 670, endDate: "Dec 2026", options: [{ label: "Oo, Cat 5 Super Typhoon", odds: 0.45, color: "#dc2626" }, { label: "Max Cat 4", odds: 0.35, color: "#ea580c" }, { label: "Max Cat 3 or below", odds: 0.20, color: "#16a34a" }], hot: true },
  ],
};

export default function WeatherPage() {
  return <CategoryPage config={config} />;
}
