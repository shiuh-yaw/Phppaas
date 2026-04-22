import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { EmojiIcon } from "../components/two-tone-icons";
import { usePageTheme } from "../components/theme-utils";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

const STATS = [
  { value: "450K+", label: "Registered Users", emoji: "👥" },
  { value: "₱78M+", label: "Monthly Volume", emoji: "📊" },
  { value: "9", label: "Market Categories", emoji: "🎯" },
  { value: "24/7", label: "Platform Uptime", emoji: "⚡" },
];

const TEAM = [
  { name: "Carlos Reyes", role: "CEO & Co-Founder", emoji: "👨‍💼" },
  { name: "Maria Santos", role: "CTO & Co-Founder", emoji: "👩‍💻" },
  { name: "Jose Garcia", role: "Head of Operations", emoji: "👨‍🔧" },
  { name: "Ana Villanueva", role: "Head of Compliance", emoji: "👩‍⚖️" },
];

const VALUES = [
  { emoji: "🛡️", title: "Transparency", desc: "Lahat ng market ay may malinaw na rules at resolution criteria." },
  { emoji: "🎮", title: "Fun First", desc: "Ang pagtaya ay isang libangan — pinoprotektahan namin ang mga users." },
  { emoji: "🏛️", title: "Compliance", desc: "Fully PAGCOR-licensed at sumusunod sa lahat ng regulasyon." },
  { emoji: "🌏", title: "Filipino-First", desc: "Dinisenyo para sa mga Pilipino, ng mga Pilipino." },
];

export default function AboutPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = usePageTheme();

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ ...pp, background: theme.bg }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto" style={{ background: theme.bg }}>
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="size-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: theme.orangeBg }}>
                <EmojiIcon emoji="🏠" size={36} />
              </div>
              <h1 className="text-[28px] mb-3" style={{ fontWeight: 700, ...ss, color: theme.text }}>Tungkol Sa Lucky Taya</h1>
              <p className="text-[14px] max-w-[550px] mx-auto leading-[1.7]" style={{ ...ss, color: theme.textSec }}>
                Ang Lucky Taya, powered by PrediEx Inc., ay ang kauna-unahang "Social Predict Lab" sa Pilipinas — isang prediction market platform kung saan maaari kang tumaya sa mga resulta ng sports, showbiz, economy, at iba pa.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {STATS.map(s => (
                <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: theme.inputBg, border: `1px solid ${theme.cardBorder}` }}>
                  <EmojiIcon emoji={s.emoji} size={24} />
                  <p className="text-[22px] mt-2" style={{ fontWeight: 700, ...ss, color: theme.text }}>{s.value}</p>
                  <p className="text-[11px] mt-0.5" style={{ ...ss, color: theme.textSec }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Mission */}
            <div className="rounded-2xl p-6 mb-8" style={{ background: theme.isDark ? 'rgba(255,82,34,0.08)' : '#fff4ed', border: `1px solid ${theme.isDark ? 'rgba(255,82,34,0.2)' : '#ffcdb2'}` }}>
              <h2 className="text-[18px] mb-3" style={{ fontWeight: 700, ...ss, color: theme.text }}>Ang Misyon Namin</h2>
              <p className="text-[14px] leading-[1.8]" style={{ ...ss, color: theme.textSec }}>
                Gawing accessible, masaya, at safe ang prediction markets para sa bawat Pilipino. Naniniwala kami na ang kahit sino ay may kakayahang mag-predict — at dapat may paraan para maipakita ito nang responsable at transparent.
              </p>
            </div>

            {/* Values */}
            <h2 className="text-[18px] mb-4" style={{ fontWeight: 700, ...ss, color: theme.text }}>Mga Core Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {VALUES.map(v => (
                <div key={v.title} className="rounded-2xl p-5 flex items-start gap-3" style={{ border: `1px solid ${theme.cardBorder}`, background: theme.card }}>
                  <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: theme.orangeBg }}>
                    <EmojiIcon emoji={v.emoji} size={22} />
                  </div>
                  <div>
                    <p className="text-[14px]" style={{ fontWeight: 600, ...ss, color: theme.text }}>{v.title}</p>
                    <p className="text-[12px] mt-0.5 leading-[1.5]" style={{ ...ss, color: theme.textSec }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Team */}
            <h2 className="text-[18px] mb-4" style={{ fontWeight: 700, ...ss, color: theme.text }}>Leadership Team</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {TEAM.map(t => (
                <div key={t.name} className="rounded-2xl p-4 text-center" style={{ border: `1px solid ${theme.cardBorder}`, background: theme.card }}>
                  <div className="size-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: theme.inputBg }}>
                    <EmojiIcon emoji={t.emoji} size={24} />
                  </div>
                  <p className="text-[13px]" style={{ fontWeight: 600, ...ss, color: theme.text }}>{t.name}</p>
                  <p className="text-[11px]" style={{ ...ss, color: theme.textSec }}>{t.role}</p>
                </div>
              ))}
            </div>

            {/* License */}
            <div className="rounded-2xl p-6 text-center" style={{ background: theme.isDark ? 'rgba(37,99,235,0.1)' : '#eff6ff', border: `1px solid ${theme.isDark ? 'rgba(37,99,235,0.25)' : '#bfdbfe'}` }}>
              <EmojiIcon emoji="🏛️" size={28} />
              <h3 className="text-[16px] mt-3 mb-2" style={{ fontWeight: 700, ...ss, color: theme.isDark ? '#60a5fa' : '#1e40af' }}>PAGCOR Licensed</h3>
              <p className="text-[13px] leading-[1.6]" style={{ ...ss, color: theme.isDark ? '#93bbfd' : '#2563eb' }}>
                Lucky Taya (PrediEx Inc.) ay lisensyado at kinokontrol ng Philippine Amusement and Gaming Corporation (PAGCOR). License No: OGL-26-0042.
              </p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}