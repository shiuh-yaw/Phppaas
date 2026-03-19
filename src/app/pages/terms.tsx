import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { EmojiIcon } from "../components/two-tone-icons";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

const SECTIONS = [
  { num: "1", title: "Pagtanggap sa mga Tuntunin", content: "Sa paggamit ng Lucky Taya platform (\"Serbisyo\"), sumasang-ayon ka sa mga Terms of Service na ito. Kung hindi ka sumasang-ayon, huwag gamitin ang platform. Ang Lucky Taya ay pinapatakbo ng ForeGate Inc. at lisensyado ng PAGCOR." },
  { num: "2", title: "Eligibility", content: "Dapat ay 21 taong gulang ka pataas para gumamit ng Lucky Taya. Kinakailangan ang valid government-issued ID para sa KYC verification. Ang mga residente ng mga lugar kung saan ipinagbabawal ang online gaming ay hindi maaaring gumamit ng serbisyo." },
  { num: "3", title: "Account Registration", content: "Responsable ka sa pagtago ng iyong login credentials. Isang account lang bawat tao. Ang paggawa ng multiple accounts ay magreresulta sa permanent ban. Dapat tumpak ang lahat ng impormasyong ibinigay mo." },
  { num: "4", title: "Deposits at Withdrawals", content: "Ang minimum deposit ay ₱100 at ang minimum withdrawal ay ₱200. Ang mga withdrawal ay naproseso sa loob ng 1-3 business days. Ang mga unverified account ay may daily withdrawal limit na ₱10,000. Ang KYC-verified accounts ay may limit na ₱500,000 per transaction." },
  { num: "5", title: "Betting Rules", content: "Lahat ng bets ay final kapag na-confirm na. Ang mga market ay nireresolba batay sa opisyal na resulta. Kung may hindi pagkakasundo, ang desisyon ng Lucky Taya ay final. Ang mga suspicious betting patterns ay maaaring mag-trigger ng manual review." },
  { num: "6", title: "Bawal na Aktibidad", content: "Kasama sa mga ipinagbabawal: multi-accounting, bonus abuse, collusion, paggamit ng bots o automated software, money laundering, at anumang aktibidad na labag sa batas ng Pilipinas o regulasyon ng PAGCOR." },
  { num: "7", title: "Intellectual Property", content: "Lahat ng content, design, at software sa Lucky Taya ay pagmamay-ari ng ForeGate Inc. Hindi maaaring kopyahin, i-distribute, o i-modify ang anumang bahagi ng platform nang walang nakasulat na pahintulot." },
  { num: "8", title: "Limitasyon ng Pananagutan", content: "Ang Lucky Taya ay hindi mananagot sa mga pagkalugi mula sa pagtaya, technical issues, o mga pangyayaring hindi namin kontrolado. Ang maximum na pananagutan ay limitado sa halaga ng deposito sa iyong account." },
  { num: "9", title: "Pagbabago sa mga Tuntunin", content: "Maaari naming baguhin ang mga Terms na ito anumang oras. Maa-notify ka 30 araw bago mag-apply ang mga pagbabago. Ang patuloy na paggamit ng platform pagkatapos ng notification period ay nangangahulugang pagtanggap sa bagong terms." },
  { num: "10", title: "Applicable Law", content: "Ang mga Terms na ito ay napapailalim sa batas ng Republika ng Pilipinas. Ang anumang hindi pagkakasundo ay maaaring iresolba sa pamamagitan ng arbitration sa Metro Manila, sa ilalim ng mga patakaran ng PAGCOR." },
];

export default function TermsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white" style={pp}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center mb-10">
              <div className="size-16 rounded-2xl bg-[#e6fff3] flex items-center justify-center mx-auto mb-4">
                <EmojiIcon emoji="📜" size={36} />
              </div>
              <h1 className="text-[28px] text-[#070808] mb-2" style={{ fontWeight: 700, ...ss }}>Terms of Service</h1>
              <p className="text-[13px] text-[#84888c]" style={ss}>
                Huling na-update: March 1, 2026 | Lucky Taya (Powered by ForeGate Inc.)
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {SECTIONS.map(s => (
                <div key={s.num} className="border border-[#f0f1f3] rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-8 rounded-lg bg-[#ff5222]/10 flex items-center justify-center shrink-0">
                      <span className="text-[13px] text-[#ff5222]" style={{ fontWeight: 700, ...ss }}>{s.num}</span>
                    </div>
                    <h3 className="text-[15px] text-[#070808]" style={{ fontWeight: 600, ...ss }}>{s.title}</h3>
                  </div>
                  <p className="text-[13px] text-[#555] leading-[1.7] ml-11" style={ss}>{s.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-[#fafafa] border border-[#f0f1f3] rounded-2xl text-center">
              <p className="text-[13px] text-[#84888c]" style={ss}>
                Kung may katanungan, i-contact kami sa <span className="text-[#ff5222]">legal@luckytaya.ph</span>
              </p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
