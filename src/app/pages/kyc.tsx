import { useState } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { AuthGate } from "../components/auth-gate";
import { Footer } from "../components/footer";
import { usePageTheme } from "../components/theme-utils";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss = { fontFeatureSettings: "'ss04'" };

type KycStatus = "unverified" | "step1" | "step2" | "step3" | "pending" | "verified" | "rejected";

interface KycDocument {
  name: string;
  uploadedAt: string;
  status: "uploaded" | "verified" | "rejected";
}

const STEPS = [
  { key: "id", label: "Government ID", icon: "🪪", description: "Upload a valid government-issued ID" },
  { key: "selfie", label: "Selfie Verification", icon: "🤳", description: "Take a photo holding your ID" },
  { key: "address", label: "Proof of Address", icon: "🏠", description: "Upload a recent utility bill or bank statement" },
  { key: "review", label: "Under Review", icon: "⏳", description: "We're verifying your documents" },
];

const ID_TYPES = ["Philippine Passport", "Driver's License", "National ID (PhilSys)", "SSS ID", "PRC ID", "Voter's ID"];

export default function KycPage() {
  const navigate = useNavigate();
  const theme = usePageTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatus>("unverified");
  const [currentStep, setCurrentStep] = useState(0);
  const [idType, setIdType] = useState("");
  const [idFile, setIdFile] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<string | null>(null);
  const [addressFile, setAddressFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw">("deposit");

  const openDeposit = () => { setModalMode("deposit"); setModalOpen(true); };

  const stepIndex = kycStatus === "verified" ? 4 : kycStatus === "pending" ? 3 : kycStatus === "rejected" ? -1 : currentStep;

  const handleFileSelect = (setter: (v: string) => void) => {
    // Simulated file selection
    setUploading(true);
    setTimeout(() => {
      setter("document_" + Date.now() + ".jpg");
      setUploading(false);
    }, 1200);
  };

  const handleNextStep = () => {
    if (currentStep === 0 && idFile && idType) {
      setDocuments(prev => [...prev, { name: `${idType} — ${idFile}`, uploadedAt: "Just now", status: "uploaded" }]);
      setCurrentStep(1);
      setKycStatus("step2");
    } else if (currentStep === 1 && selfieFile) {
      setDocuments(prev => [...prev, { name: `Selfie — ${selfieFile}`, uploadedAt: "Just now", status: "uploaded" }]);
      setCurrentStep(2);
      setKycStatus("step3");
    } else if (currentStep === 2 && addressFile) {
      setDocuments(prev => [...prev, { name: `Proof of Address — ${addressFile}`, uploadedAt: "Just now", status: "uploaded" }]);
      setCurrentStep(3);
      setKycStatus("pending");
    }
  };

  const simulateVerify = () => {
    setKycStatus("verified");
    setDocuments(prev => prev.map(d => ({ ...d, status: "verified" as const })));
  };

  const simulateReject = () => {
    setKycStatus("rejected");
  };

  const resetKyc = () => {
    setKycStatus("unverified");
    setCurrentStep(0);
    setIdType("");
    setIdFile(null);
    setSelfieFile(null);
    setAddressFile(null);
    setDocuments([]);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ ...pp, background: theme.bg }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onDeposit={openDeposit} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header onDeposit={openDeposit} onMenuToggle={() => setSidebarOpen(true)} />

        <AuthGate pageName="KYC Verification">
        <div className="flex-1 overflow-y-auto" style={{ background: theme.bg }}>
          <main className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-24 pt-6">
            {/* Back button */}
            <button onClick={() => navigate("/portfolio")} className="flex items-center gap-1.5 text-[12px] mb-6 cursor-pointer transition-colors" style={{ fontWeight: 500, color: theme.textSec }}>
              <svg className="size-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M10 12L6 8l4-4" /></svg>
              Back to Portfolio
            </button>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#ff5222]/10 flex items-center justify-center">
                  <svg className="size-5 text-[#ff5222]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div>
                  <h1 className="text-[22px]" style={{ fontWeight: 700, color: theme.text, ...ss }}>KYC Verification</h1>
                  <p className="text-[13px]" style={{ color: theme.textSec, ...ss }}>Complete your identity verification to unlock full features</p>
                </div>
              </div>

              {/* Status banner */}
              {kycStatus === "verified" && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="size-5 text-emerald-600" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <p className="text-emerald-700 text-[13px]" style={{ fontWeight: 600, ...ss }}>Identity Verified</p>
                    <p className="text-emerald-600/70 text-[11px]" style={ss}>Your identity has been verified. You have full access to all features including unlimited withdrawals.</p>
                  </div>
                </div>
              )}
              {kycStatus === "pending" && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <svg className="size-5 text-amber-600" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="8" /><path d="M10 6v4l2 2" strokeLinecap="round" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-amber-700 text-[13px]" style={{ fontWeight: 600, ...ss }}>Under Review</p>
                    <p className="text-amber-600/70 text-[11px]" style={ss}>Your documents are being reviewed. This usually takes 1-2 business days.</p>
                  </div>
                  {/* Demo controls */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={simulateVerify} className="h-7 px-2.5 rounded-lg text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer transition-colors" style={{ fontWeight: 600 }}>Demo: Approve</button>
                    <button onClick={simulateReject} className="h-7 px-2.5 rounded-lg text-[10px] bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer transition-colors" style={{ fontWeight: 600 }}>Demo: Reject</button>
                  </div>
                </div>
              )}
              {kycStatus === "rejected" && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="size-5 text-red-500" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-600 text-[13px]" style={{ fontWeight: 600, ...ss }}>Verification Rejected</p>
                    <p className="text-red-500/70 text-[11px]" style={ss}>Your verification was rejected. Please resubmit with valid documents.</p>
                  </div>
                  <button onClick={resetKyc} className="h-8 px-4 rounded-xl text-[11px] bg-[#ff5222] hover:bg-[#e8491f] text-white cursor-pointer transition-colors flex-shrink-0" style={{ fontWeight: 600 }}>
                    Resubmit
                  </button>
                </div>
              )}
            </div>

            {/* Progress stepper */}
            {kycStatus !== "verified" && kycStatus !== "rejected" && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  {STEPS.map((step, i) => (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[16px] transition-colors ${
                          i < currentStep ? "bg-emerald-100 ring-2 ring-emerald-300" :
                          i === currentStep ? "bg-[#ff5222]/10 ring-2 ring-[#ff5222]/30" :
                          ""
                        }`} style={i >= currentStep && i !== currentStep ? { background: theme.inputBg, boxShadow: `inset 0 0 0 1px ${theme.cardBorder}` } : undefined}>
                          {i < currentStep ? (
                            <svg className="size-5 text-emerald-600" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          ) : (
                            <span>{step.icon}</span>
                          )}
                        </div>
                        <p className="text-[10px] mt-1.5 text-center max-w-[80px]" style={{ color: i <= currentStep ? theme.text : theme.textMut, fontWeight: i === currentStep ? 600 : 400, ...ss }}>{step.label}</p>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-2 rounded-full mt-[-20px] ${i < currentStep ? "bg-emerald-300" : ""}`} style={i >= currentStep ? { background: theme.cardBorder } : undefined} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step content */}
            {kycStatus !== "verified" && kycStatus !== "rejected" && kycStatus !== "pending" && (
              <div className="rounded-2xl p-6 shadow-sm" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
                {/* Step 1: Government ID */}
                {currentStep === 0 && (
                  <div>
                    <h3 className="text-[16px] mb-1" style={{ fontWeight: 600, color: theme.text, ...ss }}>Upload Government ID</h3>
                    <p className="text-[12px] mb-6" style={{ color: theme.textSec, ...ss }}>Please upload a clear photo of your valid government-issued ID</p>

                    {/* ID Type selector */}
                    <div className="mb-4">
                      <label className="text-[11px] mb-2 block" style={{ fontWeight: 500, color: theme.textSec, ...ss }}>Select ID Type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ID_TYPES.map(type => (
                          <button
                            key={type}
                            onClick={() => setIdType(type)}
                            className="h-10 px-3 rounded-xl text-[11px] cursor-pointer transition-all"
                            style={{
                              background: idType === type ? "rgba(255,82,34,0.1)" : theme.inputBg,
                              border: `1px solid ${idType === type ? "rgba(255,82,34,0.4)" : theme.inputBorder}`,
                              color: idType === type ? "#ff5222" : theme.textSec,
                              fontWeight: idType === type ? 600 : 400, ...ss,
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Upload area */}
                    <div
                      onClick={() => !uploading && handleFileSelect(setIdFile)}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        idFile ? "border-emerald-300 bg-emerald-50" : ""
                      }`}
                      style={!idFile ? { borderColor: theme.textMut, background: "transparent" } : undefined}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-[#ff5222] border-t-transparent rounded-full animate-spin" />
                          <p className="text-[12px]" style={{ color: theme.textSec, ...ss }}>Uploading...</p>
                        </div>
                      ) : idFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="size-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          <p className="text-emerald-600 text-[12px]" style={{ fontWeight: 600, ...ss }}>{idFile}</p>
                          <p className="text-[10px]" style={{ color: theme.textSec, ...ss }}>Click to replace</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="size-8" style={{ color: theme.textMut }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          <p className="text-[12px]" style={{ fontWeight: 500, color: theme.textSec, ...ss }}>Click to upload your ID</p>
                          <p className="text-[10px]" style={{ color: theme.textMut, ...ss }}>JPG, PNG up to 10MB. Make sure all corners are visible.</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-3 rounded-xl" style={{ background: theme.inputBg, border: `1px solid ${theme.cardBorder}` }}>
                      <p className="text-[10px]" style={{ fontWeight: 500, color: theme.textSec, ...ss }}>Requirements:</p>
                      <ul className="mt-1.5 space-y-1">
                        {["Photo must be clear and not blurry", "All 4 corners of the ID must be visible", "No glare or shadows covering text", "ID must not be expired"].map(r => (
                          <li key={r} className="flex items-center gap-2 text-[11px]" style={{ color: theme.textSec, ...ss }}>
                            <div className="w-1 h-1 rounded-full" style={{ background: theme.textMut }} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Step 2: Selfie */}
                {currentStep === 1 && (
                  <div>
                    <h3 className="text-[16px] mb-1" style={{ fontWeight: 600, color: theme.text, ...ss }}>Selfie Verification</h3>
                    <p className="text-[12px] mb-6" style={{ color: theme.textSec, ...ss }}>Take a clear photo of yourself holding your ID next to your face</p>

                    <div
                      onClick={() => !uploading && handleFileSelect(setSelfieFile)}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        selfieFile ? "border-emerald-300 bg-emerald-50" : ""
                      }`}
                      style={!selfieFile ? { borderColor: theme.textMut, background: "transparent" } : undefined}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-[#ff5222] border-t-transparent rounded-full animate-spin" />
                          <p className="text-[12px]" style={{ color: theme.textSec, ...ss }}>Processing...</p>
                        </div>
                      ) : selfieFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="size-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          <p className="text-emerald-600 text-[12px]" style={{ fontWeight: 600, ...ss }}>{selfieFile}</p>
                          <p className="text-[10px]" style={{ color: theme.textSec, ...ss }}>Click to retake</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center" style={{ borderColor: theme.textMut }}>
                            <svg className="size-10" style={{ color: theme.textMut }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="9" r="3.5" /><path d="M5.5 21a6.5 6.5 0 0113 0" /></svg>
                          </div>
                          <p className="text-[12px]" style={{ fontWeight: 500, color: theme.textSec, ...ss }}>Click to take a selfie</p>
                          <p className="text-[10px]" style={{ color: theme.textMut, ...ss }}>Hold your ID next to your face. Make sure both are clearly visible.</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-3 rounded-xl" style={{ background: theme.inputBg, border: `1px solid ${theme.cardBorder}` }}>
                      <p className="text-[10px]" style={{ fontWeight: 500, color: theme.textSec, ...ss }}>Tips for a good selfie:</p>
                      <ul className="mt-1.5 space-y-1">
                        {["Face the camera directly with good lighting", "Hold your ID beside your face at chin level", "Both your face and ID should be clearly visible", "Do not wear sunglasses or hats"].map(r => (
                          <li key={r} className="flex items-center gap-2 text-[11px]" style={{ color: theme.textSec, ...ss }}>
                            <div className="w-1 h-1 rounded-full" style={{ background: theme.textMut }} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Step 3: Proof of Address */}
                {currentStep === 2 && (
                  <div>
                    <h3 className="text-[16px] mb-1" style={{ fontWeight: 600, color: theme.text, ...ss }}>Proof of Address</h3>
                    <p className="text-[12px] mb-6" style={{ color: theme.textSec, ...ss }}>Upload a recent document that shows your full name and residential address</p>

                    <div
                      onClick={() => !uploading && handleFileSelect(setAddressFile)}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        addressFile ? "border-emerald-300 bg-emerald-50" : ""
                      }`}
                      style={!addressFile ? { borderColor: theme.textMut, background: "transparent" } : undefined}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-[#ff5222] border-t-transparent rounded-full animate-spin" />
                          <p className="text-[12px]" style={{ color: theme.textSec, ...ss }}>Uploading...</p>
                        </div>
                      ) : addressFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="size-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          <p className="text-emerald-600 text-[12px]" style={{ fontWeight: 600, ...ss }}>{addressFile}</p>
                          <p className="text-[10px]" style={{ color: theme.textSec, ...ss }}>Click to replace</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="size-8" style={{ color: theme.textMut }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          <p className="text-[12px]" style={{ fontWeight: 500, color: theme.textSec, ...ss }}>Click to upload proof of address</p>
                          <p className="text-[10px]" style={{ color: theme.textMut, ...ss }}>Utility bill, bank statement, or government correspondence (within 3 months)</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-3 rounded-xl" style={{ background: theme.inputBg, border: `1px solid ${theme.cardBorder}` }}>
                      <p className="text-[10px]" style={{ fontWeight: 500, color: theme.textSec, ...ss }}>Accepted documents:</p>
                      <ul className="mt-1.5 space-y-1">
                        {["Meralco / Manila Water / Maynilad utility bill", "Bank statement or credit card statement", "Barangay certificate or cedula", "Government-issued mail (BIR, SSS, PhilHealth)"].map(r => (
                          <li key={r} className="flex items-center gap-2 text-[11px]" style={{ color: theme.textSec, ...ss }}>
                            <div className="w-1 h-1 rounded-full" style={{ background: theme.textMut }} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: `1px solid ${theme.cardBorder}` }}>
                  <button
                    onClick={() => { if (currentStep > 0) setCurrentStep(currentStep - 1); }}
                    disabled={currentStep === 0}
                    className="h-10 px-5 rounded-xl text-[12px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    style={{ fontWeight: 500, background: theme.inputBg, color: theme.textSec, ...ss }}
                  >
                    Back
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]" style={{ color: theme.textMut, ...ss }}>Step {currentStep + 1} of 3</span>
                    <button
                      onClick={handleNextStep}
                      disabled={
                        (currentStep === 0 && (!idFile || !idType)) ||
                        (currentStep === 1 && !selfieFile) ||
                        (currentStep === 2 && !addressFile)
                      }
                      className="h-10 px-6 rounded-xl text-[12px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-[#ff5222] hover:bg-[#e8491f] text-white transition-colors"
                      style={{ fontWeight: 600, ...ss }}
                    >
                      {currentStep === 2 ? "Submit for Verification" : "Continue"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Uploaded documents list */}
            {documents.length > 0 && (
              <div className="mt-6 rounded-2xl p-5 shadow-sm" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
                <h3 className="text-[14px] mb-4" style={{ fontWeight: 600, color: theme.text, ...ss }}>Submitted Documents</h3>
                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: theme.inputBg, border: `1px solid ${theme.cardBorder}` }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.status === "verified" ? "bg-emerald-100" : doc.status === "rejected" ? "bg-red-100" : ""}`} style={doc.status === "uploaded" ? { background: theme.inputBg } : undefined}>
                          {doc.status === "verified" ? (
                            <svg className="size-4 text-emerald-600" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><path d="M4 8l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          ) : doc.status === "rejected" ? (
                            <svg className="size-4 text-red-500" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><path d="M5 5l6 6M11 5l-6 6" strokeLinecap="round" /></svg>
                          ) : (
                            <svg className="size-4" style={{ color: theme.textSec }} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M3 10v2a2 2 0 002 2h6a2 2 0 002-2v-2M5 6l3-3m0 0l3 3M8 3v8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          )}
                        </div>
                        <div>
                          <p className="text-[12px]" style={{ fontWeight: 500, color: theme.text, ...ss }}>{doc.name}</p>
                          <p className="text-[10px]" style={{ color: theme.textMut, ...ss }}>Uploaded: {doc.uploadedAt}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        doc.status === "verified" ? "bg-emerald-100 text-emerald-700" :
                        doc.status === "rejected" ? "bg-red-100 text-red-600" :
                        "bg-amber-100 text-amber-700"
                      }`} style={{ fontWeight: 600 }}>
                        {doc.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KYC Benefits card */}
            <div className="mt-6 rounded-2xl p-5 shadow-sm" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
              <h3 className="text-[14px] mb-4" style={{ fontWeight: 600, color: theme.text, ...ss }}>Why Verify?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: "\ud83d\udcb0", title: "Unlimited Withdrawals", desc: "Remove the \u20b150K daily withdrawal limit" },
                  { icon: "\ud83c\udfaf", title: "Higher Bet Limits", desc: "Access \u20b1500K+ single bet limits" },
                  { icon: "\ud83c\udfc6", title: "Creator Eligibility", desc: "Create your own prediction markets" },
                ].map(b => (
                  <div key={b.title} className="p-3 rounded-xl" style={{ background: theme.inputBg, border: `1px solid ${theme.cardBorder}` }}>
                    <span className="text-[20px]">{b.icon}</span>
                    <p className="text-[12px] mt-2" style={{ fontWeight: 600, color: theme.text, ...ss }}>{b.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: theme.textSec, ...ss }}>{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
        </AuthGate>
      </div>
    </div>
  );
}