/**
 * CreatorLanding — Introduction page shown to unauthenticated users
 * on the Creator Center route. Based on the Figma "WebCreatorLight" frame.
 */
import { useNavigate } from "react-router";
import svgPaths from "../../imports/svg-lr9wlumazi";
import imgFrame2087325367 from "figma:asset/aa22ee141c47adc40b93dee89db917612452e751.png";
import imgImage83 from "figma:asset/dee6f729e475d64d963a4837560306f0452751ae.png";
import imgImageRemovebgPreview2 from "figma:asset/fb86db7f372adc95f0fa8dc7e325d0f9df0f0aae.png";
import img6635Af32177436Be411551D99993A5891 from "figma:asset/6ad41ebbce75f652e9e5a43449f306219197fb9b.png";
import imgImage88 from "figma:asset/1e290c63b258bd35929af641699498449aecfc9f.png";
import imgImage86 from "figma:asset/d916ae5aef8f2200080400a657a30dc21b327b64.png";
import imgImage87 from "figma:asset/94541990772ff608febf3bcf1e46e7340faa4cc5.png";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

export function CreatorLanding() {
  const navigate = useNavigate();

  const openAuth = (mode: "login" | "signup") => {
    navigate(mode === "login" ? "/login" : "/signup");
  };

  return (
    <div className="w-full" style={pp}>
      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden" style={{ minHeight: 480 }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 lg:py-24 flex items-center justify-between relative z-10">
          <div className="max-w-[560px] flex flex-col gap-7">
            <div className="flex flex-col gap-3">
              <h1 className="text-[48px] lg:text-[56px] leading-[1.15]" style={{ color: "#070808", fontWeight: 600, ...ss }}>
                Gawing Kita ang Iyong Opinyon!
              </h1>
              <p className="text-[14px] leading-[1.6]" style={{ color: "#84888c", ...ss }}>
                Gamitin ang iyong impluwensya para kumita ng totoo. Lumikha at mag-predict ng kahit ano.
              </p>
            </div>
            <button
              onClick={() => openAuth("signup")}
              className="h-12 w-[180px] rounded-lg text-[16px] text-white cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: "#070808", fontWeight: 500, ...ss }}
            >
              Sumali na
            </button>
          </div>

          {/* Hero illustration */}
          <div className="hidden lg:block relative w-[400px] h-[350px] shrink-0">
            <img
              src={imgImage83}
              alt=""
              className="absolute w-[277px] h-[277px] object-cover"
              style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
            />
            <img
              src={imgImageRemovebgPreview2}
              alt=""
              className="absolute w-[170px] h-[170px] object-cover"
              style={{ right: 20, bottom: 20, transform: "scaleY(-1) rotate(180deg)", mixBlendMode: "exclusion" }}
            />
          </div>
        </div>
      </div>

      {/* ===== WHAT IS FOREGATE ===== */}
      <div className="bg-[#fafafa] relative">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-20 lg:py-[120px] flex flex-col gap-6 items-center">
          <div className="flex items-center gap-1">
            <h2 className="text-[32px] lg:text-[40px] text-center leading-[1.3]" style={{ color: "#070808", fontWeight: 600, ...ss }}>
              Ano ang ForeGate
            </h2>
            {/* Gradient question mark */}
            <svg className="w-[24px] h-[38px] ml-1" viewBox="0 0 32 50.71" fill="none" style={{ transform: "rotate(20deg)" }}>
              <path d={svgPaths.p3ec36380} fill="url(#qmark_grad)" />
              <defs>
                <linearGradient id="qmark_grad" x1="16.28" y1="-15.86" x2="16.28" y2="67.61" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF5222" />
                  <stop offset="1" stopColor="#EB2F96" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <p className="text-[14px] lg:text-[16px] text-center leading-[1.6] max-w-[900px]" style={{ color: "#84888c", ...ss }}>
            Sa ForeGate, kahit sino ay pwedeng gawing prediction market ang kanilang opinyon. Content creator ka man, community leader, o may matapang na hot take — ngayon ay may paraan ka nang kumita mula sa iyong impluwensya. Ang aming mga plug-in tools ay ginagawang madali ang pag-engage ng iyong audience at kumita mula sa iyong influence.
          </p>
        </div>
      </div>

      {/* ===== WHY JOIN AS A CREATOR ===== */}
      <div className="bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-20 lg:py-[120px] flex flex-col gap-12">
          <h2 className="text-[32px] lg:text-[40px] text-center leading-[1.3]" style={{ color: "#070808", fontWeight: 600, ...ss }}>
            Bakit Dapat Maging Creator?
          </h2>
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Benefits list */}
            <div className="flex-1 flex flex-col gap-12">
              {[
                {
                  icon: (
                    <svg className="size-[56px] shrink-0" viewBox="0 0 56 56" fill="none">
                      <path d={svgPaths.p3b564a00} fill="#070808" />
                      <path d={svgPaths.p6d13b80} fill="#FF5222" />
                    </svg>
                  ),
                  title: "Mataas na Kita",
                  desc: "Hanggang 70% fee share, dagdag na token rewards, at garantisadong kita para sa mga unang creator.",
                },
                {
                  icon: (
                    <svg className="size-[56px] shrink-0" viewBox="0 0 56 56" fill="none">
                      <path d={svgPaths.p19b1dbc0} fill="#070808" />
                      <path d={svgPaths.p30572f80} fill="#FF5222" />
                    </svg>
                  ),
                  title: "Madaling Magsimula",
                  desc: "Mabilis na paglago — kahit sino ay pwedeng maging creator. Instant exposure, data dashboards, at opisyal na suporta.",
                },
                {
                  icon: (
                    <svg className="size-[56px] shrink-0" viewBox="0 0 56 56" fill="none">
                      <path d={svgPaths.p3e1e2400} fill="#070808" />
                      <path d={svgPaths.p3e1e2400} fill="#070808" />
                      <path d={svgPaths.pc190000} fill="#FF5222" fillRule="evenodd" clipRule="evenodd" />
                    </svg>
                  ),
                  title: "Mababang Effort",
                  desc: "Buong suporta — one-click market creation, ready-to-use na banners at templates, 1-on-1 onboarding, at automated growth tools.",
                },
              ].map((b, i) => (
                <div key={i} className="flex gap-5 items-start">
                  {b.icon}
                  <div className="flex flex-col gap-2">
                    <span className="text-[20px] lg:text-[24px] leading-[1.3]" style={{ color: "#070808", fontWeight: 600, ...ss }}>{b.title}</span>
                    <span className="text-[14px] leading-[1.6]" style={{ color: "#84888c", ...ss }}>{b.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Right illustration */}
            <div className="hidden lg:block w-[460px] h-[340px] overflow-hidden shrink-0">
              <img src={img6635Af32177436Be411551D99993A5891} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== WHO SHOULD APPLY ===== */}
      <div className="bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-20 lg:py-[120px] flex flex-col gap-12 items-center">
          <h2 className="text-[32px] lg:text-[40px] text-center leading-[1.3]" style={{ color: "#070808", fontWeight: 600, ...ss }}>
            Sino ang Dapat Mag-apply?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            {[
              { img: imgImage88, text: "Mga KOL, analyst, content creator, at community leader" },
              { img: imgImage86, text: "Kahit sino na may followers o passion sa pagbabahagi ng insights" },
              { img: imgImage87, text: "Mga team o indibidwal na gustong kumita mula sa engagement at impluwensya" },
            ].map((card, i) => (
              <div key={i} className="relative h-[200px] rounded-xl overflow-hidden">
                <img src={card.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-end p-4 lg:p-6">
                  <p className="text-[16px] lg:text-[20px] text-white leading-[1.35]" style={{ fontWeight: 500, ...ss }}>
                    {card.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== HOW TO GET STARTED ===== */}
      <div className="bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-20 lg:py-[120px] flex flex-col gap-12">
          <h2 className="text-[32px] lg:text-[40px] text-center leading-[1.3]" style={{ color: "#070808", fontWeight: 600, ...ss }}>
            Paano Magsimula
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {[
              { num: "01", text: "Mag-apply bilang ForeGate Creator", cta: true },
              { num: "02", text: "I-launch ang iyong unang prediction market sa ilang minuto", cta: false },
              { num: "03", text: "I-share sa iyong audience at magsimulang kumita", cta: false },
              { num: "04", text: "Ma-access ang opisyal na suporta, exclusive incentives, at growth tools", cta: false },
            ].map((step, i) => (
              <div key={i} className="flex flex-col gap-2">
                <span className="text-[36px] lg:text-[40px] leading-[1.3]" style={{ color: "#070808", fontWeight: 600, ...ss }}>{step.num}</span>
                {/* Dashed connector line (desktop only) */}
                <span className="text-[16px] lg:text-[20px] leading-[1.35]" style={{ color: "#070808", fontWeight: 600, ...ss }}>{step.text}</span>
                {step.cta && (
                  <button
                    onClick={() => openAuth("signup")}
                    className="h-9 w-fit px-4 mt-1 rounded-md text-[14px] text-white cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ background: "#070808", fontWeight: 500, ...ss }}
                  >
                    Sumali na
                  </button>
                )}
              </div>
            ))}
            {/* Dashed connector lines (desktop) */}
            <div className="hidden lg:block absolute top-[25px] left-[80px]" style={{ width: "calc(100% - 160px)" }}>
              <div className="flex gap-0">
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex-1 border-t-[1.5px] border-dashed border-[#84888c]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== READY CTA ===== */}
      <div className="bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-20 lg:py-[120px] flex flex-col gap-10">
          <h2 className="text-[32px] lg:text-[40px] leading-[1.3]" style={{ color: "#070808", fontWeight: 600, ...ss }}>
            Handa ka na bang gawing kita ang iyong kaalaman?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Apply card */}
            <div className="rounded-xl border border-[#dfe0e2] p-8 flex flex-col justify-between gap-6 min-h-[160px]">
              <span className="text-[18px] lg:text-[20px] leading-[1.35]" style={{ color: "#070808", fontWeight: 600, ...ss }}>
                Mag-apply bilang ForeGate Creator
              </span>
              <button
                onClick={() => openAuth("signup")}
                className="h-12 w-fit px-6 rounded-lg text-[16px] text-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: "#070808", fontWeight: 500, ...ss }}
              >
                Sumali na
              </button>
            </div>

            {/* Contact card */}
            <div className="rounded-xl border border-[#dfe0e2] p-8 flex flex-col gap-5">
              <span className="text-[18px] lg:text-[20px] leading-[1.35]" style={{ color: "#070808", fontWeight: 600, ...ss }}>
                Makipag-ugnayan sa Amin
              </span>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <div className="flex items-center gap-3">
                  <svg className="size-5 shrink-0" viewBox="0 0 16.875 13.125" fill="none">
                    <path d={svgPaths.p1695aa00} fill="#ff5222" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[14px]" style={{ color: "#070808", fontWeight: 500, ...ss }}>Email</span>
                    <span className="text-[12px]" style={{ color: "#070808", ...ss }}>business@foregate.com</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="size-5 shrink-0" viewBox="0 0 18.1 16.216" fill="none">
                    <path d={svgPaths.p1bbcf00} fill="#ff5222" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[14px]" style={{ color: "#070808", fontWeight: 500, ...ss }}>Telegram</span>
                    <span className="text-[12px]" style={{ color: "#070808", ...ss }}>t.me/ForeGate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline footer removed — shared <Footer /> is rendered by the page wrapper */}

    </div>
  );
}