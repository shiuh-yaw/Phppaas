/**
 * AuthGate — Wraps protected user-facing pages.
 * When the user is not logged in, shows a gentle prompt overlay
 * instead of blocking the page entirely (keeps the UI browsable).
 */
import { useNavigate } from "react-router";
import { useAuth } from "./auth-context";
import { EmojiIcon } from "./two-tone-icons";

const ss = { fontFeatureSettings: "'ss04'" };
const pp = { fontFamily: "'Poppins', sans-serif" };

interface AuthGateProps {
  children: React.ReactNode;
  /** If true, the gate completely blocks content. If false (default), shows overlay. */
  strict?: boolean;
  /** Page name shown in the prompt */
  pageName?: string;
}

export function AuthGate({ children, strict = false, pageName = "page" }: AuthGateProps) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (isLoggedIn) return <>{children}</>;

  if (strict) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f7f8fa] p-4" style={pp}>
        <div className="max-w-[400px] w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#fff4ed] flex items-center justify-center mx-auto mb-5">
            <EmojiIcon emoji="🔒" size={28} />
          </div>
          <h2 className="text-[18px] text-[#070808] mb-2" style={{ fontWeight: 700, ...ss }}>
            Mag-login muna
          </h2>
          <p className="text-[13px] text-[#84888c] mb-6 leading-[1.6]" style={ss}>
            Kailangan mong mag-login para ma-access ang {pageName}. I-create ang account mo para magsimula!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="h-10 px-5 rounded-xl bg-[#ff5222] text-white text-[13px] cursor-pointer hover:bg-[#e84a1e] transition-colors"
              style={{ fontWeight: 600, ...ss }}
            >
              Mag-login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="h-10 px-5 rounded-xl bg-white border border-[#f0f1f3] text-[#070808] text-[13px] cursor-pointer hover:bg-[#f7f8f9] transition-colors"
              style={{ fontWeight: 500, ...ss }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Non-strict: show content with a sticky banner
  return (
    <>
      {children}
      {/* Floating login prompt banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
        <div
          className="max-w-[480px] mx-auto bg-white border border-[#f0f1f3] rounded-2xl px-5 py-3.5 flex items-center gap-4 pointer-events-auto"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12)", ...pp }}
        >
          <div className="shrink-0">
            <EmojiIcon emoji="👋" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-[#070808]" style={{ fontWeight: 600, ...ss }}>
              Mag-login para ma-access ang lahat ng features
            </p>
            <p className="text-[10px] text-[#84888c] mt-0.5" style={ss}>
              Tumaya, mag-track ng portfolio, at mag-claim ng rewards!
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => navigate("/login")}
              className="h-8 px-3 rounded-lg bg-[#ff5222] text-white text-[11px] cursor-pointer hover:bg-[#e84a1e] transition-colors"
              style={{ fontWeight: 600, ...ss }}
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="h-8 px-3 rounded-lg bg-[#f5f6f8] text-[#070808] text-[11px] cursor-pointer hover:bg-[#e5e7eb] transition-colors"
              style={{ fontWeight: 500, ...ss }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
