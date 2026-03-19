import { Component, type ReactNode } from "react";
import { useNavigate, useRouteError } from "react-router";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

/* ==================== ROUTE ERROR ELEMENT ==================== */
/* Used as `errorElement` on routes — catches lazy-load failures etc. */
export function RouteErrorElement() {
  const error = useRouteError() as Error | null;
  const navigate = useNavigate();

  const isChunkError = error?.message?.includes("dynamically imported module") ||
    error?.message?.includes("Failed to fetch") ||
    error?.message?.includes("Loading chunk");

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-4" style={pp}>
      <div className="max-w-[420px] w-full bg-white rounded-2xl border border-[#f0f1f3] p-8 text-center" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
        <div className="w-14 h-14 rounded-2xl bg-[#fff4ed] flex items-center justify-center mx-auto mb-5">
          <svg className="size-7 text-[#ff5222]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-[18px] text-[#070808] mb-2" style={{ fontWeight: 700, ...ss }}>
          {isChunkError ? "Page Failed to Load" : "Something Went Wrong"}
        </h2>
        <p className="text-[13px] text-[#84888c] mb-6 leading-[1.6]" style={ss}>
          {isChunkError
            ? "The page couldn't be loaded. This usually happens due to a network issue or an app update. Try refreshing."
            : "An unexpected error occurred. Please try again or go back to the home page."}
        </p>
        {error && (
          <div className="bg-[#fafafa] border border-[#f0f1f3] rounded-lg px-3 py-2 mb-5 text-left">
            <p className="text-[10px] text-[#b0b3b8] mb-1" style={{ fontWeight: 600, ...ss }}>ERROR DETAILS</p>
            <p className="text-[11px] text-[#84888c] font-mono break-all">{error.message}</p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="h-10 px-5 rounded-xl bg-[#ff5222] text-white text-[13px] cursor-pointer hover:bg-[#e84a1e] transition-colors"
            style={{ fontWeight: 600, ...ss }}
          >
            Refresh Page
          </button>
          <button
            onClick={() => navigate("/")}
            className="h-10 px-5 rounded-xl bg-white border border-[#f0f1f3] text-[#070808] text-[13px] cursor-pointer hover:bg-[#f7f8f9] transition-colors"
            style={{ fontWeight: 500, ...ss }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================== GENERIC ERROR BOUNDARY ==================== */
/* Can wrap any React subtree (not route-specific) */
interface EBProps { children: ReactNode; fallback?: ReactNode }
interface EBState { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex items-center justify-center p-8" style={pp}>
          <div className="text-center">
            <p className="text-[14px] text-[#070808] mb-2" style={{ fontWeight: 600, ...ss }}>Something went wrong</p>
            <p className="text-[12px] text-[#84888c] mb-4" style={ss}>{this.state.error?.message}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); }}
              className="h-8 px-4 bg-[#ff5222] text-white text-[12px] rounded-lg cursor-pointer"
              style={{ fontWeight: 600, ...ss }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ==================== LOADING SPINNER ==================== */
export function RouteLoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center" style={pp}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-10">
          <div className="absolute inset-0 rounded-full border-[2.5px] border-[#f0f1f3]" />
          <div
            className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-[#ff5222]"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
        </div>
        <p className="text-[13px] text-[#84888c]" style={{ fontWeight: 500, ...ss }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
