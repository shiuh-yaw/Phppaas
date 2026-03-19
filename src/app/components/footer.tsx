import { ForeGateLogoIcon } from "./icons";
import { useNavigate } from "react-router";
import imgSocial1 from "figma:asset/25dbcb8ad8ded9235624ea97ee8e5cbb11aaaca7.png";
import imgSocial2 from "figma:asset/a559a779c1a92ac0e37facf8108ceebd1b453f82.png";
import imgSocial3 from "figma:asset/0ddc9c7edd7206a36d599985612e3900ae176445.png";
import imgSocial4 from "figma:asset/d4c843aed426073dacb7759d859c3402750eec89.png";
import imgSocial5 from "figma:asset/44dfb0552c824795764dfbb799c442fc9a7e36c9.png";

const ss04 = { fontFeatureSettings: "'ss04'" };

const footerColumns = [
  { title: "Games", links: [
    { label: "Basketball", route: "/category/basketball" },
    { label: "Color Game", route: "/category/color-game" },
    { label: "Boxing", route: "/category/boxing" },
    { label: "Esports", route: "/category/esports" },
    { label: "Bingo", route: "/category/bingo" },
  ]},
  { title: "Markets", links: [
    { label: "Lottery", route: "/category/lottery" },
    { label: "Showbiz", route: "/category/showbiz" },
    { label: "Weather", route: "/category/weather" },
    { label: "Economy", route: "/category/economy" },
  ]},
  { title: "Suporta", links: [
    { label: "Mga Tutorial", route: "/faq" },
    { label: "User Support", route: "/faq" },
    { label: "FAQ", route: "/faq" },
    { label: "Responsible Gaming", route: "/responsible-gaming" },
  ]},
  { title: "Tungkol", links: [
    { label: "Tungkol Sa Amin", route: "/about" },
    { label: "Blog", route: "/about" },
    { label: "Sumali", route: "/about" },
    { label: "PAGCOR License", route: "/responsible-gaming" },
    { label: "Privacy Policy", route: "/privacy-policy" },
  ]},
];

export function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="w-full bg-[#fafbfc]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Main Footer */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start px-4 md:px-6 py-10 md:py-12 max-w-[1400px] mx-auto">
        {/* Brand */}
        <div className="w-full md:flex-1 flex flex-col gap-5 md:gap-6 md:max-w-[320px]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <ForeGateLogoIcon />
              <span className="text-[20px] md:text-[22px] text-[#ff5222] leading-[20px]" style={{ fontWeight: 700 }}>Lucky Taya</span>
            </div>
            <p className="text-[12px] text-[#84888c] leading-[1.5]" style={{ fontWeight: 500, ...ss04 }}>
              Powered by ForeGate - The First Social Predict Lab
            </p>
            <p className="text-[11px] text-[#b0b3b8] leading-[1.5] mt-1" style={ss04}>
              Licensed and regulated by PAGCOR. Responsible gaming advocate.
            </p>
          </div>
          <div className="flex gap-2.5 items-center">
            {[imgSocial1, imgSocial2, imgSocial3, imgSocial4, imgSocial5].map((src, i) => (
              <div key={i} className="size-6 shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
                <img src={src} alt="" className="size-full object-cover" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#84888c]" style={{ fontWeight: 500 }}>Deposit Methods</span>
            <div className="flex gap-2 items-center flex-wrap">
              <span className="bg-[#007dfe] text-white text-[10px] px-2.5 py-1 rounded" style={{ fontWeight: 600 }}>GCash</span>
              <span className="bg-[#00b274] text-white text-[10px] px-2.5 py-1 rounded" style={{ fontWeight: 600 }}>Maya</span>
              <span className="bg-[#1a1a2e] text-white text-[10px] px-2.5 py-1 rounded" style={{ fontWeight: 600 }}>Dragonpay</span>
              <span className="bg-[#5b21b6] text-white text-[10px] px-2.5 py-1 rounded" style={{ fontWeight: 600 }}>PayMongo</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="w-full md:flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-4">
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col">
              <div className="pb-3">
                <span className="text-[13px] text-[#070808] leading-[1.5]" style={{ fontWeight: 600, ...ss04 }}>
                  {col.title}
                </span>
              </div>
              {col.links.map((link) => (
                <div key={link.label} className="py-1.5">
                  <button
                    onClick={() => {
                      if (link.route.startsWith("#")) {
                        // Coming soon — no navigation
                      } else if (link.route) {
                        navigate(link.route);
                      }
                    }}
                    className={`text-[13px] leading-[1.5] transition-colors cursor-pointer bg-transparent border-none p-0 ${link.route.startsWith("#") ? "text-[#b0b3b8] hover:text-[#84888c]" : "text-[#84888c] hover:text-[#ff5222]"}`}
                    style={ss04}
                    title={link.route.startsWith("#") ? "Coming soon" : undefined}
                  >
                    {link.label}{link.route.startsWith("#") ? "" : ""}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#eef0f2] px-4 md:px-6 py-4 md:py-5">
        <div className="flex flex-col gap-1 items-center">
          <p className="text-[10px] md:text-[11px] text-[#b0b3b8] leading-[1.5] text-center" style={ss04}>
            Lucky Taya (Powered by ForeGate Inc.) © 2025 · PAGCOR Licensed
          </p>
          <div className="flex gap-2 items-center text-[10px] md:text-[11px] text-[#b0b3b8] leading-[1.5] flex-wrap justify-center" style={ss04}>
            <span className="hover:text-[#84888c] cursor-pointer" onClick={() => navigate("/privacy-policy")}>Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-[#84888c] cursor-pointer" onClick={() => navigate("/terms")}>Terms of Service</span>
            <span>·</span>
            <span className="hover:text-[#84888c] cursor-pointer" onClick={() => navigate("/responsible-gaming")}>Responsible Gaming</span>
            <span>·</span>
            <span>v1.2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}