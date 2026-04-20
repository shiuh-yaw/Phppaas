import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { EmojiIcon } from "../components/two-tone-icons";
import { usePageTheme } from "../components/theme-utils";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

const FAQ_CATEGORIES = [
  { key: "general", label: "General", emoji: "💡" },
  { key: "account", label: "Account", emoji: "👤" },
  { key: "deposits", label: "Deposits", emoji: "💰" },
  { key: "betting", label: "Betting", emoji: "🎯" },
  { key: "security", label: "Security", emoji: "🔒" },
];

const FAQS: { category: string; q: string; a: string }[] = [
  { category: "general", q: "Ano ang Lucky Taya?", a: "Ang Lucky Taya ay isang prediction market platform kung saan maaari kang tumaya sa mga resulta ng sports, showbiz, economy, weather, at iba pang kategorya. Powered by ForeGate at lisensyado ng PAGCOR." },
  { category: "general", q: "Legal ba ang Lucky Taya sa Pilipinas?", a: "Oo! Ang Lucky Taya ay lisensyado at kinokontrol ng PAGCOR (Philippine Amusement and Gaming Corporation). Sumusunod kami sa lahat ng applicable na batas at regulasyon." },
  { category: "general", q: "Ilang taon dapat ako para gumamit?", a: "Dapat ay 21 taong gulang ka pataas. Kinakailangan ang KYC verification para ma-verify ang iyong edad." },
  { category: "account", q: "Paano mag-sign up?", a: "I-click ang 'Signup' button, i-enter ang phone number mo, gumawa ng password, at i-verify ang number mo gamit ang OTP code na ipapadala namin." },
  { category: "account", q: "Paano mag-KYC verification?", a: "Pumunta sa Profile > KYC Verification. I-upload ang government ID, selfie, at proof of address. Ang review ay karaniwang 1-2 business days." },
  { category: "account", q: "Nakalimutan ko ang password ko. Paano ko ito mababawi?", a: "Sa login page, i-click ang 'Nakalimutan ang password?' link. I-enter ang phone number mo at sundin ang reset code process." },
  { category: "deposits", q: "Ano ang minimum na deposit?", a: "Ang minimum deposit ay ₱100. Ang maximum ay depende sa payment method at KYC level mo." },
  { category: "deposits", q: "Anong payment methods ang tinatanggap?", a: "Tinatanggap namin ang GCash, Maya, Dragonpay, PayMongo, bank transfer, at mga stablecoin (USDT, USDC)." },
  { category: "deposits", q: "Gaano katagal bago ma-process ang withdrawal?", a: "Ang mga withdrawal ay karaniwang na-proseso sa loob ng 1-3 business days. Ang GCash at Maya ay madalas na instant." },
  { category: "deposits", q: "May daily withdrawal limit ba?", a: "Unverified: ₱10,000/araw. KYC Level 1: ₱50,000/araw. KYC Level 2: ₱200,000/araw. KYC Level 3: ₱500,000/transaksyon." },
  { category: "betting", q: "Paano tumaya?", a: "Pumili ng market, piliin ang iyong prediction (Yes/No o specific outcome), i-set ang halaga, at i-confirm ang bet. Kapag naresolba ang market, matatanggap mo ang payout kung tama ang prediction mo." },
  { category: "betting", q: "Ano ang Fast Bet?", a: "Ang Fast Bet ay isang simplified betting mode para sa mga Color Game at iba pang quick-result markets. Mas mabilis ang betting experience." },
  { category: "betting", q: "Maaari ko bang kanselahin ang bet ko?", a: "Hindi. Lahat ng confirmed bets ay final. Siguraduhing tama ang lahat bago mag-confirm." },
  { category: "security", q: "Paano protektado ang account ko?", a: "Gumagamit kami ng AES-256 encryption, Multi-Factor Authentication (MFA), at regular security audits. Maaari mong i-enable ang Phone OTP, Authenticator App, o Email verification sa profile mo para sa dagdag na proteksyon." },
  { category: "security", q: "Paano mag-enable ng MFA?", a: "Pumunta sa Profile > Security > Multi-Factor Authentication. Maaari kang mag-set up ng tatlong MFA methods: Phone OTP (SMS), Authenticator App (Google Authenticator, Authy), at Email Verification. Recommended ang pagkakaroon ng dalawang methods na naka-enable." },
  { category: "security", q: "Paano mag-report ng suspicious activity?", a: "I-contact ang support team namin sa support@luckytaya.ph o gamitin ang in-app Support Tickets feature." },
];

export default function FaqPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("general");
  const [openQ, setOpenQ] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const theme = usePageTheme();

  const filtered = FAQS.filter(f =>
    (activeCategory === "all" || f.category === activeCategory) &&
    (!search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ ...pp, background: theme.bg }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto" style={{ background: theme.bg }}>
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center mb-8">
              <div className="size-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: theme.isDark ? 'rgba(37,99,235,0.1)' : '#eff6ff' }}>
                <EmojiIcon emoji="❓" size={36} />
              </div>
              <h1 className="text-[28px] mb-2" style={{ fontWeight: 700, ...ss, color: theme.text }}>FAQ / Mga Madalas Itanong</h1>
              <p className="text-[14px]" style={{ ...ss, color: theme.textSec }}>Hanapin ang sagot sa iyong mga tanong</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Maghanap ng tanong..."
                className="w-full h-11 px-4 pl-10 rounded-xl text-[13px] outline-none transition-all"
                style={{ ...ss, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text }} />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: theme.textMut }} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><path d="M18 18l-4-4" strokeLinecap="round" /></svg>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {FAQ_CATEGORIES.map(c => (
                <button key={c.key} onClick={() => setActiveCategory(c.key)}
                  className="shrink-0 h-9 px-4 rounded-full text-[12px] cursor-pointer transition-all flex items-center gap-1.5"
                  style={{ background: activeCategory === c.key ? (theme.isDark ? '#f0f0f2' : '#070808') : (theme.isDark ? '#26282c' : '#f5f6f7'), color: activeCategory === c.key ? (theme.isDark ? '#070808' : '#fff') : theme.textSec, fontWeight: 500, ...ss }}>
                  <EmojiIcon emoji={c.emoji} size={14} /> {c.label}
                </button>
              ))}
            </div>

            {/* FAQ items */}
            <div className="flex flex-col gap-2">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <EmojiIcon emoji="🔍" size={32} />
                  <p className="text-[13px] mt-3" style={{ ...ss, color: theme.textSec }}>Walang nahanap na tanong.</p>
                </div>
              ) : filtered.map((f, i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.cardBorder}`, background: theme.card }}>
                  <button onClick={() => setOpenQ(openQ === `${f.category}-${i}` ? null : `${f.category}-${i}`)}
                    className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors text-left"
                    style={{ background: 'transparent' }}>
                    <span className="text-[13px] flex-1" style={{ fontWeight: 500, ...ss, color: theme.text }}>{f.q}</span>
                    <svg className={`size-4 shrink-0 transition-transform ${openQ === `${f.category}-${i}` ? "rotate-180" : ""}`} style={{ color: theme.textSec }} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><path d="M6 8l4 4 4-4" strokeLinecap="round" /></svg>
                  </button>
                  {openQ === `${f.category}-${i}` && (
                    <div className="px-5 pb-4" style={{ borderTop: `1px solid ${theme.cardBorder}` }}>
                      <p className="text-[13px] leading-[1.7] pt-3" style={{ ...ss, color: theme.textSec }}>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 rounded-2xl text-center" style={{ background: theme.isDark ? 'rgba(255,82,34,0.08)' : '#fff4ed', border: `1px solid ${theme.isDark ? 'rgba(255,82,34,0.2)' : '#ffcdb2'}` }}>
              <EmojiIcon emoji="💬" size={24} />
              <p className="text-[14px] mt-2" style={{ fontWeight: 600, ...ss, color: theme.text }}>Hindi mo nahanap ang sagot?</p>
              <p className="text-[12px] mt-1" style={{ ...ss, color: theme.textSec }}>I-contact kami sa support@luckytaya.ph</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}