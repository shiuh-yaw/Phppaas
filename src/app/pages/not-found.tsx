import { useNavigate } from "react-router";
import { useT } from "../i18n/useT";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { useState } from "react";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

export default function NotFoundPage() {
  const navigate = useNavigate();
  const t = useT();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f7f8fa] overflow-hidden" style={pp}>
      <Sidebar onDeposit={() => {}} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onDeposit={() => {}} onMenuToggle={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
          <div className="max-w-[480px] w-full text-center">
            {/* Large 404 */}
            <div className="relative mb-6">
              <p className="text-[120px] text-[#f0f1f3] select-none" style={{ fontWeight: 900, lineHeight: 1, ...ss }}>404</p>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[#fff4ed] flex items-center justify-center" style={{ boxShadow: "0 4px 15px rgba(255,82,34,0.15)" }}>
                  <svg className="size-8 text-[#ff5222]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-[22px] text-[#070808] mb-2" style={{ fontWeight: 700, ...ss }}>
              {t("notFound.title")}
            </h1>
            <p className="text-[14px] text-[#84888c] mb-8 leading-[1.6]" style={ss}>
              {t("notFound.desc")}
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <button
                onClick={() => navigate("/")}
                className="h-11 px-6 rounded-xl bg-[#ff5222] text-white text-[13px] cursor-pointer hover:bg-[#e84a1e] transition-colors"
                style={{ fontWeight: 600, ...ss }}
              >
                {t("notFound.cta")}
              </button>
              <button
                onClick={() => navigate("/markets")}
                className="h-11 px-6 rounded-xl bg-white border border-[#f0f1f3] text-[#070808] text-[13px] cursor-pointer hover:bg-[#f7f8f9] transition-colors"
                style={{ fontWeight: 500, ...ss }}
              >
                {t("nav.markets")}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="h-11 px-6 rounded-xl bg-white border border-[#f0f1f3] text-[#84888c] text-[13px] cursor-pointer hover:bg-[#f7f8f9] transition-colors"
                style={{ fontWeight: 500, ...ss }}
              >
                {t("common.back")}
              </button>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-xl border border-[#f0f1f3] p-5">
              <p className="text-[11px] text-[#b0b3b8] mb-3" style={{ fontWeight: 600, ...ss }}>POPULAR NA PAGES</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { label: "Basketball", emoji: "\u{1F3C0}", path: "/category/basketball" },
                  { label: "Color Game", emoji: "\u{1F3B2}", path: "/category/color-game" },
                  { label: "Boxing", emoji: "\u{1F94A}", path: "/category/boxing" },
                  { label: "Leaderboard", emoji: "\u{1F3C6}", path: "/leaderboard" },
                  { label: "Portfolio", emoji: "\u{1F4CA}", path: "/portfolio" },
                  { label: "Rewards", emoji: "\u{1F381}", path: "/rewards" },
                ].map(link => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-1.5 h-8 px-3.5 rounded-full border border-[#f0f1f3] bg-[#fafafa] hover:border-[#ff5222]/30 hover:bg-[#ff5222]/5 transition-all cursor-pointer"
                  >
                    <span className="text-[13px]">{link.emoji}</span>
                    <span className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss }}>{link.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}