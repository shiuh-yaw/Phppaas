import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { EmojiIcon } from "../components/two-tone-icons";

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
  { category: "security", q: "Paano protektado ang account ko?", a: "Gumagamit kami ng AES-256 encryption, 2FA, at regular security audits. Maaari mo ring i-enable ang biometric login sa profile mo." },
  { category: "security", q: "Paano mag-enable ng 2FA?", a: "Pumunta sa Profile > Security > Two-Factor Authentication at i-on ang toggle. Mag-rereceive ka ng code sa bawat login." },
  { category: "security", q: "Paano mag-report ng suspicious activity?", a: "I-contact ang support team namin sa support@luckytaya.ph o gamitin ang in-app Support Tickets feature." },
];

export default function FaqPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("general");
  const [openQ, setOpenQ] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter(f =>
    (activeCategory === "all" || f.category === activeCategory) &&
    (!search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white" style={pp}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center mb-8">
              <div className="size-16 rounded-2xl bg-[#eff6ff] flex items-center justify-center mx-auto mb-4">
                <EmojiIcon emoji="❓" size={36} />
              </div>
              <h1 className="text-[28px] text-[#070808] mb-2" style={{ fontWeight: 700, ...ss }}>FAQ / Mga Madalas Itanong</h1>
              <p className="text-[14px] text-[#84888c]" style={ss}>Hanapin ang sagot sa iyong mga tanong</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Maghanap ng tanong..."
                className="w-full h-11 px-4 pl-10 rounded-xl border border-[#f0f1f3] bg-[#fafafa] text-[13px] outline-none focus:border-[#ff5222]/40 focus:bg-white transition-all"
                style={ss} />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#b0b3b8]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><path d="M18 18l-4-4" strokeLinecap="round" /></svg>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {FAQ_CATEGORIES.map(c => (
                <button key={c.key} onClick={() => setActiveCategory(c.key)}
                  className="shrink-0 h-9 px-4 rounded-full text-[12px] cursor-pointer transition-all flex items-center gap-1.5"
                  style={{ background: activeCategory === c.key ? "#070808" : "#f5f6f7", color: activeCategory === c.key ? "#fff" : "#84888c", fontWeight: 500, ...ss }}>
                  <EmojiIcon emoji={c.emoji} size={14} /> {c.label}
                </button>
              ))}
            </div>

            {/* FAQ items */}
            <div className="flex flex-col gap-2">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <EmojiIcon emoji="🔍" size={32} />
                  <p className="text-[13px] text-[#84888c] mt-3" style={ss}>Walang nahanap na tanong.</p>
                </div>
              ) : filtered.map((f, i) => (
                <div key={i} className="border border-[#f0f1f3] rounded-xl overflow-hidden">
                  <button onClick={() => setOpenQ(openQ === `${f.category}-${i}` ? null : `${f.category}-${i}`)}
                    className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-[#fafafa] transition-colors text-left">
                    <span className="text-[13px] text-[#070808] flex-1" style={{ fontWeight: 500, ...ss }}>{f.q}</span>
                    <svg className={`size-4 text-[#84888c] shrink-0 transition-transform ${openQ === `${f.category}-${i}` ? "rotate-180" : ""}`} fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><path d="M6 8l4 4 4-4" strokeLinecap="round" /></svg>
                  </button>
                  {openQ === `${f.category}-${i}` && (
                    <div className="px-5 pb-4 border-t border-[#f5f6f7]">
                      <p className="text-[13px] text-[#555] leading-[1.7] pt-3" style={ss}>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-[#fff4ed] border border-[#ffcdb2] rounded-2xl text-center">
              <EmojiIcon emoji="💬" size={24} />
              <p className="text-[14px] text-[#070808] mt-2" style={{ fontWeight: 600, ...ss }}>Hindi mo nahanap ang sagot?</p>
              <p className="text-[12px] text-[#84888c] mt-1" style={ss}>I-contact kami sa support@luckytaya.ph</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
