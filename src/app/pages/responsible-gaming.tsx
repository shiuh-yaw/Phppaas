import { useState } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { EmojiIcon } from "../components/two-tone-icons";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

const SECTIONS = [
  { emoji: "🎯", title: "Ano ang Responsible Gaming?", content: "Ang responsible gaming ay ang pagtaya sa loob ng iyong budget at kakayahan. Naniniwala ang Lucky Taya na ang pagtaya ay isang libangan — hindi paraan para kumita. Kung hindi ka na nagtatamasa sa karanasan, oras na para huminto." },
  { emoji: "⏰", title: "Mga Limitasyon sa Oras", content: "I-set ang session time reminders. Magpa-remind ka tuwing 30 minuto, 1 oras, o 2 oras. Makikita mo rin ang total time na nagamit mo sa app ngayong araw." },
  { emoji: "💰", title: "Deposit Limits", content: "Magtakda ng daily, weekly, o monthly deposit limit. Hindi ka makakapag-deposit ng higit pa sa limit na ito. Maaaring ibaba ang limit anumang oras (effective agad), pero ang pagpapalaki ay may 24-hour cooling off period." },
  { emoji: "🚫", title: "Self-Exclusion", content: "Kung kailangan mo ng break, maaari kang mag-self-exclude mula sa platform. Available ang 7 araw, 30 araw, 6 na buwan, 1 taon, o permanenteng self-exclusion. Sa panahon ng self-exclusion, hindi ka makakapag-login, magtaya, o mag-deposit." },
  { emoji: "📊", title: "Activity Summary", content: "I-review ang iyong betting activity anumang oras sa Profile > Preferences. Makikita mo ang total na itinaya, nanalo, at natalo sa nakaraang 7 araw, 30 araw, at lahat ng oras." },
  { emoji: "🆘", title: "Tulong at Suporta", content: "Kung sa tingin mo ay may problema ka sa pagtaya, huwag mag-atubiling humingi ng tulong. Makipag-ugnayan sa PAGCOR Responsible Gaming hotline: (02) 8621-7150 o i-email ang responsible.gaming@pagcor.ph" },
  { emoji: "👶", title: "Underage Protection", content: "Ang Lucky Taya ay para lamang sa mga 21 taong gulang pataas. Gumagamit kami ng KYC verification para matiyak ang edad ng lahat ng user. Kung nalaman naming minor ang isang user, agad na isu-suspend ang account." },
  { emoji: "🔒", title: "PAGCOR Compliance", content: "Ang Lucky Taya ay lisensyado at kinokontrol ng Philippine Amusement and Gaming Corporation (PAGCOR). Sumusunod kami sa lahat ng regulasyon kabilang ang AML (Anti-Money Laundering), KYC requirements, at responsible gaming standards." },
];

const SELF_EXCLUSION_OPTIONS = [
  { label: "7 Araw", value: "7d", description: "Maikling break" },
  { label: "30 Araw", value: "30d", description: "Isang buwan" },
  { label: "6 na Buwan", value: "6m", description: "Mahabang break" },
  { label: "1 Taon", value: "1y", description: "Extended break" },
  { label: "Permanente", value: "permanent", description: "Hindi na mababawi" },
];

export default function ResponsibleGamingPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selfExclusionOpen, setSelfExclusionOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [confirmText, setConfirmText] = useState("");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white" style={pp}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="size-16 rounded-2xl bg-[#fff4ed] flex items-center justify-center mx-auto mb-4">
                <EmojiIcon emoji="🛡️" size={36} />
              </div>
              <h1 className="text-[28px] text-[#070808] mb-2" style={{ fontWeight: 700, ...ss }}>Responsible Gaming</h1>
              <p className="text-[14px] text-[#84888c] max-w-[500px] mx-auto leading-[1.7]" style={ss}>
                Ang Lucky Taya ay naniniwala sa ligtas at responsableng pagtaya. Narito ang mga tool at impormasyon para matulungan ka.
              </p>
            </div>

            {/* Sections */}
            <div className="flex flex-col gap-4 mb-10">
              {SECTIONS.map((s, i) => (
                <div key={i} className="bg-white border border-[#f0f1f3] rounded-2xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-[#fff4ed] flex items-center justify-center shrink-0 mt-0.5">
                      <EmojiIcon emoji={s.emoji} size={22} />
                    </div>
                    <div>
                      <h3 className="text-[15px] text-[#070808] mb-1.5" style={{ fontWeight: 600, ...ss }}>{s.title}</h3>
                      <p className="text-[13px] text-[#84888c] leading-[1.7]" style={ss}>{s.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Self-Exclusion Tool */}
            <div className="bg-[#fef2f2] border border-red-200 rounded-2xl p-6 mb-10">
              <div className="flex items-center gap-3 mb-4">
                <EmojiIcon emoji="🚫" size={24} />
                <h3 className="text-[16px] text-red-700" style={{ fontWeight: 700, ...ss }}>Self-Exclusion Tool</h3>
              </div>
              <p className="text-[13px] text-red-600 mb-4 leading-[1.6]" style={ss}>
                Kung gusto mong i-limit ang sarili mo, gamitin ang self-exclusion tool sa ibaba. Hindi ito mababawi sa panahon ng napiling duration (maliban sa permanent na hindi na talaga mababawi).
              </p>
              {!selfExclusionOpen ? (
                <button onClick={() => setSelfExclusionOpen(true)} className="h-10 px-5 rounded-xl text-[13px] bg-red-600 text-white cursor-pointer hover:bg-red-700 transition-colors" style={{ fontWeight: 600, ...ss }}>
                  I-request ang Self-Exclusion
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {SELF_EXCLUSION_OPTIONS.map(o => (
                      <button key={o.value} onClick={() => setSelectedPeriod(o.value)}
                        className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${selectedPeriod === o.value ? "border-red-500 bg-red-50" : "border-[#f0f1f3] bg-white hover:border-red-300"}`}>
                        <p className="text-[13px] text-[#070808]" style={{ fontWeight: 600, ...ss }}>{o.label}</p>
                        <p className="text-[10px] text-[#84888c] mt-0.5" style={ss}>{o.description}</p>
                      </button>
                    ))}
                  </div>
                  {selectedPeriod && (
                    <div className="mt-2">
                      <label className="text-[12px] text-red-600 mb-1 block" style={{ fontWeight: 500, ...ss }}>I-type "SELF-EXCLUDE" para ma-confirm:</label>
                      <input value={confirmText} onChange={e => setConfirmText(e.target.value)}
                        placeholder="SELF-EXCLUDE"
                        className="h-10 px-3 rounded-lg border border-red-300 text-[13px] w-full outline-none focus:border-red-500"
                        style={ss} />
                      <button
                        disabled={confirmText !== "SELF-EXCLUDE"}
                        onClick={() => { alert(`Self-exclusion for ${selectedPeriod} activated (demo). In production, this would lock your account.`); setSelfExclusionOpen(false); setSelectedPeriod(""); setConfirmText(""); }}
                        className="mt-3 h-10 px-5 rounded-xl text-[13px] bg-red-600 text-white cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ fontWeight: 600, ...ss }}>
                        I-confirm ang Self-Exclusion
                      </button>
                    </div>
                  )}
                  <button onClick={() => { setSelfExclusionOpen(false); setSelectedPeriod(""); setConfirmText(""); }}
                    className="text-[12px] text-[#84888c] cursor-pointer hover:text-[#070808] self-start" style={ss}>
                    Kanselahin
                  </button>
                </div>
              )}
            </div>

            {/* Hotline */}
            <div className="bg-[#eff6ff] border border-blue-200 rounded-2xl p-6 text-center">
              <EmojiIcon emoji="📞" size={28} />
              <h3 className="text-[16px] text-blue-800 mt-3 mb-2" style={{ fontWeight: 700, ...ss }}>Kailangan ng Tulong?</h3>
              <p className="text-[13px] text-blue-600 mb-1" style={ss}>PAGCOR Responsible Gaming Hotline</p>
              <p className="text-[18px] text-blue-800" style={{ fontWeight: 700, ...ss }}>(02) 8621-7150</p>
              <p className="text-[12px] text-blue-500 mt-2" style={ss}>responsible.gaming@pagcor.ph | Available 24/7</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
