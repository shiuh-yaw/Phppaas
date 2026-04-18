import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { showOmsToast } from "../../components/oms/oms-modal";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== TYPES ==================== */
type BusinessType = "corporation" | "partnership" | "sole_proprietor" | "cooperative";
type Plan = "starter" | "growth" | "enterprise" | "custom";

interface DocUpload {
  id: string;
  type: string;
  label: string;
  required: boolean;
  file: File | null;
  fileName: string;
  fileSize: string;
}

const BIZ_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "sole_proprietor", label: "Sole Proprietor" },
  { value: "cooperative", label: "Cooperative" },
];

const PLAN_OPTIONS: { value: Plan; label: string; desc: string; price: string }[] = [
  { value: "starter", label: "Starter", desc: "Up to 10K users, 10 markets", price: "₱25,000/mo" },
  { value: "growth", label: "Growth", desc: "Up to 100K users, 50 markets", price: "₱75,000/mo" },
  { value: "enterprise", label: "Enterprise", desc: "Unlimited users & markets", price: "₱200,000/mo" },
  { value: "custom", label: "Custom", desc: "Tailored to your needs", price: "Contact us" },
];

const REQUIRED_DOCS = [
  { type: "sec_registration", label: "SEC Registration Certificate", hint: "For corporations/partnerships. DTI for sole proprietors." },
  { type: "dti_permit", label: "DTI Business Permit / Name Registration", hint: "Department of Trade & Industry registration." },
  { type: "bir_cor", label: "BIR Certificate of Registration (Form 2303)", hint: "Must be current year." },
  { type: "mayor_permit", label: "Mayor's Permit / Business License", hint: "LGU-issued permit for the current year." },
  { type: "valid_id", label: "Valid Government ID (Authorized Rep)", hint: "PhilSys, passport, driver's license, etc." },
  { type: "board_resolution", label: "Board Resolution / Secretary's Certificate", hint: "Or Affidavit of Sole Proprietorship for sole props." },
];

const OPTIONAL_DOCS = [
  { type: "aml_policy", label: "AML/KYC Compliance Policy", hint: "Internal compliance manual." },
  { type: "gis", label: "General Information Sheet (GIS)", hint: "SEC-filed GIS for the current year." },
  { type: "other", label: "Other Supporting Document", hint: "PAGCOR license, company profile, etc." },
];

/* ==================== STEP INDICATOR ==================== */
function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-1">
          <div className={`flex items-center gap-2 flex-1 ${i <= current ? "" : "opacity-40"}`}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] flex-shrink-0 transition-colors ${
                i < current ? "bg-emerald-500 text-white" : i === current ? "bg-[#ff5222] text-white" : "bg-[#e5e7eb] text-[#84888c]"
              }`}
              style={{ fontWeight: 700, ...ss04 }}
            >
              {i < current ? (
                <svg className="size-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2.5"><path d="M3 7l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-[11px] hidden sm:block ${i <= current ? "text-[#070808]" : "text-[#b0b3b8]"}`} style={{ fontWeight: i === current ? 600 : 500, ...ss04 }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-shrink-0 w-8 h-px mx-1 ${i < current ? "bg-emerald-400" : "bg-[#e5e7eb]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ==================== FORM FIELD ==================== */
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[#070808] text-[12px] mb-1" style={{ fontWeight: 600, ...ss04 }}>
        {label} {required && <span className="text-[#ff5222]">*</span>}
      </label>
      {children}
      {hint && <p className="text-[#b0b3b8] text-[10px] mt-0.5" style={ss04}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-9 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#ff5222] transition-colors placeholder-[#b0b3b8]"
      style={{ ...pp, ...ss04 }}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-9 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#ff5222] cursor-pointer"
      style={{ ...pp, ...ss04 }}
    >
      <option value="">Select...</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/* ==================== MAIN PAGE ==================== */
export default function KybApply() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [appId, setAppId] = useState("");

  // Step 1: Business info
  const [merchantName, setMerchantName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | "">("");
  const [regNumber, setRegNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");

  // Step 2: Contact
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");

  // Step 3: Plan
  const [plan, setPlan] = useState<Plan | "">("");
  const [estimatedGGR, setEstimatedGGR] = useState("");
  const [targetLaunch, setTargetLaunch] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Step 4: Documents
  const [docUploads, setDocUploads] = useState<DocUpload[]>([
    ...REQUIRED_DOCS.map((d, i) => ({ id: `RD${i}`, type: d.type, label: d.label, required: true, file: null, fileName: "", fileSize: "" })),
    ...OPTIONAL_DOCS.map((d, i) => ({ id: `OD${i}`, type: d.type, label: d.label, required: false, file: null, fileName: "", fileSize: "" })),
  ]);

  const handleFileSelect = useCallback((docId: string, file: File | null) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showOmsToast("File exceeds 10 MB limit", "error");
      return;
    }
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      showOmsToast("Only PDF, JPG, and PNG files are accepted", "error");
      return;
    }
    setDocUploads(prev => prev.map(d =>
      d.id === docId ? { ...d, file, fileName: file.name, fileSize: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB` } : d
    ));
  }, []);

  const removeFile = useCallback((docId: string) => {
    setDocUploads(prev => prev.map(d => d.id === docId ? { ...d, file: null, fileName: "", fileSize: "" } : d));
  }, []);

  // Validation
  const validateStep = (s: number): string | null => {
    if (s === 0) {
      if (!merchantName.trim()) return "Business name is required";
      if (!businessType) return "Business type is required";
      if (!regNumber.trim()) return "Registration number is required";
      if (!taxId.trim()) return "Tax ID (TIN) is required";
      if (!address.trim()) return "Business address is required";
      if (!city.trim()) return "City is required";
      if (!province.trim()) return "Province is required";
    } else if (s === 1) {
      if (!contactPerson.trim()) return "Contact person name is required";
      if (!contactEmail.trim()) return "Contact email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return "Invalid email format";
      if (!contactPhone.trim()) return "Contact phone is required";
    } else if (s === 2) {
      if (!plan) return "Please select a plan";
    } else if (s === 3) {
      const missingRequired = docUploads.filter(d => d.required && !d.file);
      if (missingRequired.length > 0) return `Missing required document: ${missingRequired[0].label}`;
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) { showOmsToast(err, "error"); return; }
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    const err = validateStep(3);
    if (err) { showOmsToast(err, "error"); return; }

    // Simulate submission — generate a KYB ID
    const id = `KYB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    setAppId(id);
    setSubmitted(true);
    setStep(4);
    showOmsToast(`KYB Application ${id} submitted successfully!`);
  };

  if (submitted && step === 4) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center p-4" style={pp}>
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 max-w-[520px] w-full text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="size-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2 className="text-[#070808] text-[20px] mb-2" style={{ fontWeight: 700, ...ss04 }}>Application Submitted!</h2>
          <p className="text-[#84888c] text-[13px] mb-4" style={ss04}>
            Your KYB application has been received and is pending review. Our team will verify your documents and notify you via email.
          </p>

          <div className="bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl p-4 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#b0b3b8] text-[11px]" style={ss04}>Application ID</span>
                <span className="text-[#ff5222] text-[12px]" style={{ fontWeight: 700, ...ss04 }}>{appId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b0b3b8] text-[11px]" style={ss04}>Business Name</span>
                <span className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{merchantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b0b3b8] text-[11px]" style={ss04}>Contact Email</span>
                <span className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{contactEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b0b3b8] text-[11px]" style={ss04}>Plan</span>
                <span className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{plan?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b0b3b8] text-[11px]" style={ss04}>Documents</span>
                <span className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{docUploads.filter(d => d.file).length} uploaded</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-left">
            <p className="text-blue-600 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
              <strong>What happens next?</strong> Our compliance team will review your documents within 3-5 business days. You'll receive email updates at <strong>{contactEmail}</strong> as your application progresses through review.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/oms/kyb-apply")}
              className="flex-1 h-10 bg-[#f5f6f8] hover:bg-[#e5e7eb] text-[#070808] text-[12px] rounded-lg cursor-pointer transition-colors border border-[#e5e7eb]"
              style={{ fontWeight: 600, ...ss04 }}
            >
              Submit Another
            </button>
            <button
              onClick={() => navigate("/oms")}
              className="flex-1 h-10 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors"
              style={{ fontWeight: 600, ...ss04 }}
            >
              Go to OMS Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const STEPS = ["Business Info", "Contact Details", "Plan Selection", "Documents", "Review & Submit"];

  return (
    <div className="min-h-screen bg-[#f5f6f8]" style={pp}>
      {/* Header bar */}
      <div className="bg-white border-b border-[#e5e7eb] px-4 py-3">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ff5222] flex items-center justify-center">
              <span className="text-white text-[11px]" style={{ fontWeight: 800 }}>FG</span>
            </div>
            <div>
              <p className="text-[#070808] text-[14px]" style={{ fontWeight: 700, ...ss04 }}>PredictEx KYB Application</p>
              <p className="text-[#b0b3b8] text-[10px]" style={ss04}>Merchant Know-Your-Business Verification</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/oms")}
            className="text-[11px] text-[#84888c] hover:text-[#070808] cursor-pointer transition-colors"
            style={{ fontWeight: 500, ...ss04 }}
          >
            Already a merchant? Log in →
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[800px] mx-auto px-4 py-6">
        <StepIndicator current={step} steps={STEPS} />

        <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          {/* Step 0: Business Info */}
          {step === 0 && (
            <div className="p-6">
              <h3 className="text-[#070808] text-[16px] mb-1" style={{ fontWeight: 700, ...ss04 }}>Business Information</h3>
              <p className="text-[#84888c] text-[12px] mb-5" style={ss04}>Provide your company's legal business details as registered with Philippine government agencies.</p>

              <div className="space-y-4">
                <Field label="Business / Merchant Name" required hint="As registered with SEC/DTI">
                  <Input value={merchantName} onChange={setMerchantName} placeholder="e.g. PinoyBets Inc." />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Business Type" required>
                    <Select value={businessType} onChange={v => setBusinessType(v as BusinessType)} options={BIZ_TYPE_OPTIONS} />
                  </Field>
                  <Field label="Registration Number" required hint="SEC/DTI registration no.">
                    <Input value={regNumber} onChange={setRegNumber} placeholder="e.g. CS202600123" />
                  </Field>
                </div>

                <Field label="Tax Identification Number (TIN)" required>
                  <Input value={taxId} onChange={setTaxId} placeholder="e.g. 123-456-789-000" />
                </Field>

                <Field label="Business Address" required>
                  <Input value={address} onChange={setAddress} placeholder="e.g. Unit 2301, Ayala Tower One, Ayala Avenue" />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="City / Municipality" required>
                    <Input value={city} onChange={setCity} placeholder="e.g. Makati City" />
                  </Field>
                  <Field label="Province / Region" required>
                    <Input value={province} onChange={setProvince} placeholder="e.g. Metro Manila" />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Contact */}
          {step === 1 && (
            <div className="p-6">
              <h3 className="text-[#070808] text-[16px] mb-1" style={{ fontWeight: 700, ...ss04 }}>Contact Details</h3>
              <p className="text-[#84888c] text-[12px] mb-5" style={ss04}>Primary contact person for this KYB application. This person will receive login credentials upon approval.</p>

              <div className="space-y-4">
                <Field label="Contact Person (Full Name)" required hint="Authorized representative who will manage the merchant account">
                  <Input value={contactPerson} onChange={setContactPerson} placeholder="e.g. Juan Miguel Dela Cruz" />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email Address" required hint="Credentials will be sent here">
                    <Input value={contactEmail} onChange={setContactEmail} placeholder="e.g. juan@pinoybets.com" type="email" />
                  </Field>
                  <Field label="Phone Number" required>
                    <Input value={contactPhone} onChange={setContactPhone} placeholder="e.g. +63 917 123 4567" type="tel" />
                  </Field>
                </div>

                <Field label="Company Website" hint="Optional, but helps verify legitimacy">
                  <Input value={website} onChange={setWebsite} placeholder="e.g. pinoybets.com" />
                </Field>
              </div>
            </div>
          )}

          {/* Step 2: Plan */}
          {step === 2 && (
            <div className="p-6">
              <h3 className="text-[#070808] text-[16px] mb-1" style={{ fontWeight: 700, ...ss04 }}>Select Your Plan</h3>
              <p className="text-[#84888c] text-[12px] mb-5" style={ss04}>Choose a platform plan. You can upgrade or customize after onboarding.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {PLAN_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPlan(p.value)}
                    className={`p-4 border rounded-xl text-left cursor-pointer transition-all ${
                      plan === p.value
                        ? "border-[#ff5222] bg-[#ff5222]/5 ring-1 ring-[#ff5222]"
                        : "border-[#e5e7eb] hover:border-[#b0b3b8]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#070808] text-[13px]" style={{ fontWeight: 700, ...ss04 }}>{p.label}</span>
                      <span className={`text-[11px] ${plan === p.value ? "text-[#ff5222]" : "text-[#84888c]"}`} style={{ fontWeight: 600, ...ss04 }}>{p.price}</span>
                    </div>
                    <p className="text-[#84888c] text-[11px]" style={ss04}>{p.desc}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Estimated Monthly GGR" hint="Gross Gaming Revenue projection">
                  <Input value={estimatedGGR} onChange={setEstimatedGGR} placeholder="e.g. PHP 5,000,000" />
                </Field>
                <Field label="Target Launch Date">
                  <Input value={targetLaunch} onChange={setTargetLaunch} placeholder="e.g. 2026-06-01" type="date" />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Additional Notes" hint="Anything else you'd like us to know about your business">
                  <textarea
                    value={additionalNotes}
                    onChange={e => setAdditionalNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#ff5222] transition-colors resize-none placeholder-[#b0b3b8]"
                    placeholder="e.g. We have an existing PAGCOR license and plan to focus on PBA/UAAP prediction markets..."
                    style={{ ...pp, ...ss04 }}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="p-6">
              <h3 className="text-[#070808] text-[16px] mb-1" style={{ fontWeight: 700, ...ss04 }}>Upload Documents</h3>
              <p className="text-[#84888c] text-[12px] mb-1" style={ss04}>Upload scanned copies of your business documents. PDF, JPG, or PNG format. Max 10 MB each.</p>

              <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl mb-5">
                <svg className="size-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5" /><path d="M8 5v3m0 2.5h.01" strokeLinecap="round" /></svg>
                <p className="text-amber-600 text-[10px]" style={{ fontWeight: 500, ...ss04 }}>
                  All required documents marked with <span className="text-[#ff5222]">*</span> must be uploaded. Make sure documents are legible and match your business registration.
                </p>
              </div>

              <div className="space-y-2.5">
                <p className="text-[#070808] text-[12px]" style={{ fontWeight: 700, ...ss04 }}>Required Documents</p>
                {docUploads.filter(d => d.required).map(doc => {
                  const meta = REQUIRED_DOCS.find(r => r.type === doc.type);
                  return (
                    <div key={doc.id} className={`p-3 border rounded-xl transition-colors ${doc.file ? "bg-emerald-50/30 border-emerald-200" : "bg-white border-[#e5e7eb]"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{doc.label} <span className="text-[#ff5222]">*</span></p>
                            {doc.file && (
                              <svg className="size-4 text-emerald-500" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><path d="M5.5 8l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            )}
                          </div>
                          {meta && <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{meta.hint}</p>}
                          {doc.file && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[#84888c] text-[10px] bg-[#f5f6f8] px-2 py-0.5 rounded" style={ss04}>{doc.fileName}</span>
                              <span className="text-[#b0b3b8] text-[9px]" style={ss04}>{doc.fileSize}</span>
                              <button onClick={() => removeFile(doc.id)} className="text-red-400 hover:text-red-600 cursor-pointer ml-1">
                                <svg className="size-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                        <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-[11px] flex-shrink-0 ${
                          doc.file ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" : "bg-[#ff5222] text-white hover:bg-[#e8491f]"
                        }`} style={{ fontWeight: 600, ...ss04 }}>
                          <svg className="size-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8"><path d="M7 2v8M4 5l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 10v1.5a1 1 0 001 1h8a1 1 0 001-1V10" strokeLinecap="round" /></svg>
                          {doc.file ? "Replace" : "Upload"}
                          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileSelect(doc.id, e.target.files?.[0] || null)} />
                        </label>
                      </div>
                    </div>
                  );
                })}

                <p className="text-[#070808] text-[12px] mt-4" style={{ fontWeight: 700, ...ss04 }}>Optional Documents</p>
                {docUploads.filter(d => !d.required).map(doc => {
                  const meta = OPTIONAL_DOCS.find(r => r.type === doc.type);
                  return (
                    <div key={doc.id} className={`p-3 border rounded-xl transition-colors ${doc.file ? "bg-emerald-50/30 border-emerald-200" : "bg-[#f9fafb] border-[#f0f1f3]"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{doc.label}</p>
                            {doc.file && (
                              <svg className="size-4 text-emerald-500" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><path d="M5.5 8l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            )}
                          </div>
                          {meta && <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{meta.hint}</p>}
                          {doc.file && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[#84888c] text-[10px] bg-[#f5f6f8] px-2 py-0.5 rounded" style={ss04}>{doc.fileName}</span>
                              <span className="text-[#b0b3b8] text-[9px]" style={ss04}>{doc.fileSize}</span>
                              <button onClick={() => removeFile(doc.id)} className="text-red-400 hover:text-red-600 cursor-pointer ml-1">
                                <svg className="size-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                        <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-[11px] flex-shrink-0 ${
                          doc.file ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" : "bg-[#f5f6f8] text-[#84888c] hover:bg-[#e5e7eb]"
                        }`} style={{ fontWeight: 600, ...ss04 }}>
                          <svg className="size-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8"><path d="M7 2v8M4 5l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 10v1.5a1 1 0 001 1h8a1 1 0 001-1V10" strokeLinecap="round" /></svg>
                          {doc.file ? "Replace" : "Upload"}
                          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileSelect(doc.id, e.target.files?.[0] || null)} />
                        </label>
                      </div>
                    </div>
                  );
                })}

                {/* Progress */}
                <div className="p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>Upload Progress</p>
                    <span className="text-[#84888c] text-[10px]" style={ss04}>
                      {docUploads.filter(d => d.file).length} of {docUploads.length} uploaded ({docUploads.filter(d => d.required && d.file).length}/{docUploads.filter(d => d.required).length} required)
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round((docUploads.filter(d => d.required && d.file).length / docUploads.filter(d => d.required).length) * 100)}%`,
                        background: docUploads.filter(d => d.required).every(d => d.file) ? "#10b981" : "#ff5222",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="p-6">
              <h3 className="text-[#070808] text-[16px] mb-1" style={{ fontWeight: 700, ...ss04 }}>Review & Submit</h3>
              <p className="text-[#84888c] text-[12px] mb-5" style={ss04}>Please review all information before submitting your KYB application.</p>

              <div className="space-y-4">
                {/* Business Info Summary */}
                <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#f5f6f8] border-b border-[#e5e7eb] flex items-center justify-between">
                    <span className="text-[#070808] text-[12px]" style={{ fontWeight: 700, ...ss04 }}>Business Information</span>
                    <button onClick={() => setStep(0)} className="text-[#ff5222] text-[10px] cursor-pointer hover:underline" style={{ fontWeight: 600, ...ss04 }}>Edit</button>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {[
                      { l: "Business Name", v: merchantName },
                      { l: "Business Type", v: BIZ_TYPE_OPTIONS.find(o => o.value === businessType)?.label || "" },
                      { l: "Reg. Number", v: regNumber },
                      { l: "TIN", v: taxId },
                    ].map(x => (
                      <div key={x.l}>
                        <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{x.l}</p>
                        <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{x.v}</p>
                      </div>
                    ))}
                    <div className="col-span-2">
                      <p className="text-[#b0b3b8] text-[10px]" style={ss04}>Address</p>
                      <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{address}, {city}, {province}, Philippines</p>
                    </div>
                  </div>
                </div>

                {/* Contact Summary */}
                <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#f5f6f8] border-b border-[#e5e7eb] flex items-center justify-between">
                    <span className="text-[#070808] text-[12px]" style={{ fontWeight: 700, ...ss04 }}>Contact Details</span>
                    <button onClick={() => setStep(1)} className="text-[#ff5222] text-[10px] cursor-pointer hover:underline" style={{ fontWeight: 600, ...ss04 }}>Edit</button>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {[
                      { l: "Contact Person", v: contactPerson },
                      { l: "Email", v: contactEmail },
                      { l: "Phone", v: contactPhone },
                      { l: "Website", v: website || "—" },
                    ].map(x => (
                      <div key={x.l}>
                        <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{x.l}</p>
                        <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{x.v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Summary */}
                <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#f5f6f8] border-b border-[#e5e7eb] flex items-center justify-between">
                    <span className="text-[#070808] text-[12px]" style={{ fontWeight: 700, ...ss04 }}>Plan & Details</span>
                    <button onClick={() => setStep(2)} className="text-[#ff5222] text-[10px] cursor-pointer hover:underline" style={{ fontWeight: 600, ...ss04 }}>Edit</button>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {[
                      { l: "Plan", v: plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "—" },
                      { l: "Est. Monthly GGR", v: estimatedGGR || "—" },
                      { l: "Target Launch", v: targetLaunch || "—" },
                    ].map(x => (
                      <div key={x.l}>
                        <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{x.l}</p>
                        <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{x.v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents Summary */}
                <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#f5f6f8] border-b border-[#e5e7eb] flex items-center justify-between">
                    <span className="text-[#070808] text-[12px]" style={{ fontWeight: 700, ...ss04 }}>Documents ({docUploads.filter(d => d.file).length} uploaded)</span>
                    <button onClick={() => setStep(3)} className="text-[#ff5222] text-[10px] cursor-pointer hover:underline" style={{ fontWeight: 600, ...ss04 }}>Edit</button>
                  </div>
                  <div className="p-4 space-y-1.5">
                    {docUploads.filter(d => d.file).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <svg className="size-3.5 text-emerald-500" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="5.5" /><path d="M5 7l1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          <span className="text-[#070808] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{doc.label}</span>
                        </div>
                        <span className="text-[#b0b3b8] text-[10px]" style={ss04}>{doc.fileName} ({doc.fileSize})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-700 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                    By submitting this application, you certify that all information provided is true and correct. PredictEx reserves the right to verify all documents against Philippine government databases. Misrepresentation may result in permanent denial of platform access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className="h-9 px-4 bg-[#f5f6f8] hover:bg-[#e5e7eb] text-[#070808] text-[12px] rounded-lg cursor-pointer transition-colors border border-[#e5e7eb] disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontWeight: 600, ...ss04 }}
            >
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Step {step + 1} of {STEPS.length}</span>
            </div>
            {step < 4 ? (
              <button
                onClick={nextStep}
                className="h-9 px-5 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors"
                style={{ fontWeight: 600, ...ss04 }}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="h-9 px-5 bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] rounded-lg cursor-pointer transition-colors"
                style={{ fontWeight: 600, ...ss04 }}
              >
                Submit Application ✓
              </button>
            )}
          </div>
        </div>

        {/* Info footer */}
        <div className="mt-4 p-3 bg-white border border-[#e5e7eb] rounded-xl">
          <p className="text-[#b0b3b8] text-[10px] text-center" style={ss04}>
            Need help? Contact our merchant onboarding team at <span className="text-[#ff5222]" style={{ fontWeight: 600 }}>onboarding@predictex.ph</span> or call <span className="text-[#ff5222]" style={{ fontWeight: 600 }}>+63 2 8888 GATE (4283)</span>
          </p>
        </div>
      </div>
    </div>
  );
}
