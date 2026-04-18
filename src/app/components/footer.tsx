import { PredictExLogoIcon } from "./icons";
import { useNavigate } from "react-router";
import { useT } from "../i18n/useT";

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
  const t = useT();

  const footerColumnsLocalized = [
    { title: t("footer.games"), links: [
      { label: t("cat.basketball"), route: "/category/basketball" },
      { label: t("cat.colorGame"), route: "/category/color-game" },
      { label: t("cat.boxing"), route: "/category/boxing" },
      { label: t("cat.esports"), route: "/category/esports" },
      { label: t("cat.bingo"), route: "/category/bingo" },
    ]},
    { title: t("footer.markets"), links: [
      { label: t("cat.lottery"), route: "/category/lottery" },
      { label: t("cat.showbiz"), route: "/category/showbiz" },
      { label: t("cat.weather"), route: "/category/weather" },
      { label: t("cat.economy"), route: "/category/economy" },
    ]},
    { title: t("footer.support"), links: [
      { label: t("footer.tutorials"), route: "/faq" },
      { label: t("footer.userSupport"), route: "/faq" },
      { label: t("footer.faq"), route: "/faq" },
      { label: t("footer.responsibleGaming"), route: "/responsible-gaming" },
    ]},
    { title: t("footer.about"), links: [
      { label: t("footer.aboutUs"), route: "/about" },
      { label: t("footer.blog"), route: "/about" },
      { label: t("footer.join"), route: "/about" },
      { label: t("footer.pagcorLicense"), route: "/responsible-gaming" },
      { label: t("footer.privacyPolicy"), route: "/privacy-policy" },
    ]},
  ];

  return (
    <footer className="w-full bg-[#fafbfc] dark:bg-[#0f1117] hidden md:block" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Main Footer */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start px-4 md:px-6 py-10 md:py-12 max-w-[1400px] mx-auto">
        {/* Brand */}
        <div className="w-full md:flex-1 flex flex-col gap-5 md:gap-6 md:max-w-[320px]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <PredictExLogoIcon />
              <span className="text-[20px] md:text-[22px] text-[#ff5222] leading-[20px]" style={{ fontWeight: 700 }}>PredictEx</span>
            </div>
            <p className="text-[12px] text-[#84888c] leading-[1.5]" style={{ fontWeight: 500, ...ss04 }}>
              {t("footer.tagline")}
            </p>
            <p className="text-[11px] text-[#b0b3b8] leading-[1.5] mt-1" style={ss04}>
              {t("footer.license")}
            </p>
          </div>
          <div className="flex gap-2.5 items-center">
            {[
              { label: "Facebook", path: "M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.33l-.53 3.49h-2.8v8.44C19.61 23.08 24 18.09 24 12.07z" },
              { label: "Twitter", path: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z" },
              { label: "Instagram", path: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.86 3.9 2.31 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.63-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" },
              { label: "Telegram", path: "M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.5 8.14l-1.82 8.57c-.14.62-.5.77-.99.48l-2.74-2.02-1.32 1.27c-.15.15-.27.27-.55.27l.2-2.78 5.06-4.57c.22-.2-.05-.3-.34-.12l-6.25 3.94-2.69-.84c-.58-.18-.6-.58.12-.86l10.52-4.05c.49-.18.92.12.76.86z" },
              { label: "TikTok", path: "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 3.44.01 6.88-.02 10.32-.09 1.57-.65 3.13-1.66 4.36a8.09 8.09 0 01-5.41 3.04c-1.4.19-2.85.02-4.16-.49a8.07 8.07 0 01-4.94-6.32c-.06-.64-.07-1.28-.03-1.91.23-2.37 1.43-4.58 3.26-6.02 2.04-1.62 4.8-2.26 7.37-1.73.03 1.5-.04 3.01-.04 4.51-1.07-.34-2.3-.27-3.28.24-1.28.63-2.11 2.05-2.04 3.47.01.75.29 1.49.77 2.08a3.6 3.6 0 003.54 1.23c.82-.2 1.54-.72 2.02-1.39.24-.35.39-.76.48-1.17.13-.95.1-1.91.1-2.87V.02h3.26z" },
            ].map((social) => (
              <div key={social.label} className="size-6 shrink-0 cursor-pointer hover:opacity-70 transition-opacity flex items-center justify-center">
                <svg className="size-4 text-[#84888c] dark:text-[#9ca3af]" viewBox="0 0 24 24" fill="currentColor"><path d={social.path} /></svg>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#84888c]" style={{ fontWeight: 500 }}>{t("footer.depositMethods")}</span>
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
          {footerColumnsLocalized.map((col) => (
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
      <div className="border-t border-[#eef0f2] dark:border-[#2a2d3a] px-4 md:px-6 py-4 md:py-5">
        <div className="flex flex-col gap-1 items-center">
          <p className="text-[10px] md:text-[11px] text-[#b0b3b8] leading-[1.5] text-center" style={ss04}>
            PredictEx © 2025 · PAGCOR Licensed
          </p>
          <div className="flex gap-2 items-center text-[10px] md:text-[11px] text-[#b0b3b8] leading-[1.5] flex-wrap justify-center" style={ss04}>
            <span className="hover:text-[#84888c] cursor-pointer" onClick={() => navigate("/privacy-policy")}>{t("footer.privacyPolicy")}</span>
            <span>·</span>
            <span className="hover:text-[#84888c] cursor-pointer" onClick={() => navigate("/terms")}>{t("terms.title")}</span>
            <span>·</span>
            <span className="hover:text-[#84888c] cursor-pointer" onClick={() => navigate("/responsible-gaming")}>{t("footer.responsibleGaming")}</span>
            <span>·</span>
            <span>v1.2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}