import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { EmojiIcon } from "../components/two-tone-icons";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

const SECTIONS = [
  { title: "1. Impormasyon na Kinokolekta Namin", items: [
    "Personal na impormasyon: pangalan, email, phone number, birthday, address",
    "Identity documents para sa KYC verification (government ID, selfie, proof of address)",
    "Financial data: deposit/withdrawal history, betting activity, wallet balance",
    "Technical data: IP address, device info, browser type, location (kung pinapayagan)",
    "Usage data: mga page na binisita, oras ng session, mga interaction sa platform",
  ]},
  { title: "2. Paano Namin Ginagamit ang Data", items: [
    "Para magbigay at mapabuti ang aming mga serbisyo",
    "Para sa KYC verification at PAGCOR compliance",
    "Para maiwasan ang fraud, money laundering, at underage gambling",
    "Para ipadala ang mga notifications at updates tungkol sa account mo",
    "Para i-customize ang karanasan mo sa platform",
    "Para sumunod sa mga legal na obligasyon at regulasyon ng PAGCOR",
  ]},
  { title: "3. Pagbabahagi ng Data", items: [
    "PAGCOR at mga government regulatory body (kung kinakailangan ng batas)",
    "Payment processors (GCash, Maya, Dragonpay, PayMongo) para sa mga transaksyon",
    "KYC verification partners para sa identity checks",
    "Law enforcement kung kinakailangan ng legal na proseso",
    "HINDI kami nagbebenta ng personal data sa mga third-party advertiser",
  ]},
  { title: "4. Seguridad ng Data", items: [
    "AES-256 encryption para sa lahat ng data at rest at in transit",
    "Two-factor authentication (2FA) para sa mga admin at user accounts",
    "Regular security audits at penetration testing",
    "SOC 2 Type II compliant infrastructure",
    "Strict access controls at role-based permissions para sa mga admin",
  ]},
  { title: "5. Mga Karapatan Mo", items: [
    "Karapatan na makita ang iyong personal data (Data Access Request)",
    "Karapatan na ipatama ang hindi tamang impormasyon",
    "Karapatan na i-delete ang account mo (subject to regulatory retention periods)",
    "Karapatan na i-opt out sa marketing communications",
    "Karapatan na mag-file ng reklamo sa National Privacy Commission (NPC)",
  ]},
  { title: "6. Data Retention", items: [
    "Account data: hanggang ma-delete ang account + 5 taon (per PAGCOR requirement)",
    "Transaction records: 10 taon (per AML regulations)",
    "KYC documents: 5 taon pagkatapos ng account closure",
    "Betting history: 5 taon (per gaming regulatory requirements)",
    "Cookies at session data: 30 araw",
  ]},
  { title: "7. Cookies at Tracking", items: [
    "Essential cookies: para sa login sessions at security",
    "Analytics cookies: para malaman kung paano ginagamit ang platform",
    "Preference cookies: para matandaan ang language at settings mo",
    "Wala kaming third-party advertising cookies",
  ]},
];

export default function PrivacyPolicyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white" style={pp}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center mb-10">
              <div className="size-16 rounded-2xl bg-[#f3f0ff] flex items-center justify-center mx-auto mb-4">
                <EmojiIcon emoji="🔐" size={36} />
              </div>
              <h1 className="text-[28px] text-[#070808] mb-2" style={{ fontWeight: 700, ...ss }}>Privacy Policy</h1>
              <p className="text-[13px] text-[#84888c]" style={ss}>
                Huling na-update: March 1, 2026 | Lucky Taya (Powered by PrediEx Inc.)
              </p>
            </div>

            <div className="bg-[#eff6ff] border border-blue-200 rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <EmojiIcon emoji="📋" size={18} />
                <span className="text-[13px] text-blue-800" style={{ fontWeight: 600, ...ss }}>Buod</span>
              </div>
              <p className="text-[13px] text-blue-700 leading-[1.7]" style={ss}>
                Pinoprotektahan ng Lucky Taya ang iyong privacy. Kinokolekta lang namin ang data na kailangan para magbigay ng serbisyo, sumunod sa mga regulasyon ng PAGCOR, at maiwasan ang fraud. Hindi namin ibinebenta ang data mo.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {SECTIONS.map((section, i) => (
                <div key={i} className="border border-[#f0f1f3] rounded-2xl p-5">
                  <h3 className="text-[15px] text-[#070808] mb-3" style={{ fontWeight: 600, ...ss }}>{section.title}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <div className="size-1.5 rounded-full bg-[#ff5222] mt-2 shrink-0" />
                        <span className="text-[13px] text-[#555] leading-[1.6]" style={ss}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-[#fafafa] border border-[#f0f1f3] rounded-2xl text-center">
              <p className="text-[13px] text-[#84888c]" style={ss}>
                Para sa mga katanungan tungkol sa privacy, i-contact kami sa <span className="text-[#ff5222]">privacy@luckytaya.ph</span>
              </p>
              <p className="text-[11px] text-[#b0b3b8] mt-2" style={ss}>
                National Privacy Commission: https://privacy.gov.ph | Hotline: (02) 8234-2228
              </p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
