import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useOmsAuth, isPlatformUser, generatePassword, type Merchant } from "../../components/oms/oms-auth";
import { OmsModal, OmsField, OmsInput, OmsTextarea, OmsSelect, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { downloadCSV } from "../../components/oms/oms-csv-export";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== TYPES ==================== */
type KybStatus = "draft" | "submitted" | "under_review" | "needs_info" | "approved" | "rejected" | "credentials_sent";

interface KybDocument {
  id: string;
  name: string;
  type: "sec_registration" | "dti_permit" | "bir_cor" | "mayor_permit" | "valid_id" | "board_resolution" | "aml_policy" | "gis" | "other";
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: "pending" | "verified" | "rejected" | "needs_reupload";
  reviewNote?: string;
  expiryDate?: string;
}

interface KybApplication {
  id: string;
  merchantName: string;
  merchantSlug: string;
  businessType: "corporation" | "partnership" | "sole_proprietor" | "cooperative";
  registrationNumber: string;
  taxId: string;
  businessAddress: string;
  city: string;
  province: string;
  country: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  status: KybStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewStartedAt?: string;
  completedAt?: string;
  documents: KybDocument[];
  notes: KybNote[];
  plan: "starter" | "growth" | "enterprise" | "custom";
  estimatedMonthlyGGR: string;
  targetLaunchDate: string;
  credentialsSentAt?: string;
  credentialEmail?: string;
  generatedPassword?: string;
}

interface KybNote {
  id: string;
  author: string;
  authorRole: string;
  text: string;
  timestamp: string;
  type: "internal" | "merchant_visible";
}

/* ==================== DOCUMENT TYPE LABELS ==================== */
const DOC_TYPE_LABELS: Record<KybDocument["type"], string> = {
  sec_registration: "SEC Registration",
  dti_permit: "DTI Business Permit",
  bir_cor: "BIR Certificate of Registration",
  mayor_permit: "Mayor's Permit / Business License",
  valid_id: "Valid Government ID (Authorized Rep)",
  board_resolution: "Board Resolution / Secretary's Certificate",
  aml_policy: "AML/KYC Policy Document",
  gis: "General Information Sheet (GIS)",
  other: "Other Supporting Document",
};

const REQUIRED_DOC_TYPES: KybDocument["type"][] = [
  "sec_registration", "dti_permit", "bir_cor", "mayor_permit", "valid_id", "board_resolution",
];

/* ==================== MOCK DATA ==================== */
const INITIAL_APPLICATIONS: KybApplication[] = [
  {
    id: "KYB-2026-001",
    merchantName: "PinoyBets",
    merchantSlug: "pinoy-bets",
    businessType: "corporation",
    registrationNumber: "CS202600123",
    taxId: "123-456-789-000",
    businessAddress: "Unit 2301, Ayala Tower One, Ayala Avenue",
    city: "Makati City",
    province: "Metro Manila",
    country: "Philippines",
    contactPerson: "Juan Miguel Dela Cruz",
    contactEmail: "juan@pinoybets.com",
    contactPhone: "+63 917 123 4567",
    website: "pinoybets.com",
    status: "submitted",
    submittedAt: "2026-03-10T08:30:00Z",
    plan: "starter",
    estimatedMonthlyGGR: "PHP 5,000,000",
    targetLaunchDate: "2026-05-01",
    documents: [
      { id: "D001", name: "SEC Registration Certificate", type: "sec_registration", fileName: "pinoybets_sec_cert.pdf", fileSize: "2.4 MB", uploadedAt: "2026-03-10T08:20:00Z", status: "pending" },
      { id: "D002", name: "DTI Business Name Registration", type: "dti_permit", fileName: "pinoybets_dti.pdf", fileSize: "1.1 MB", uploadedAt: "2026-03-10T08:22:00Z", status: "pending", expiryDate: "2027-03-10" },
      { id: "D003", name: "BIR COR Form 2303", type: "bir_cor", fileName: "pinoybets_bir_2303.pdf", fileSize: "856 KB", uploadedAt: "2026-03-10T08:23:00Z", status: "pending", expiryDate: "2026-12-31" },
      { id: "D004", name: "Makati City Business Permit 2026", type: "mayor_permit", fileName: "pinoybets_mayor_permit.pdf", fileSize: "3.2 MB", uploadedAt: "2026-03-10T08:25:00Z", status: "pending", expiryDate: "2026-12-31" },
      { id: "D005", name: "Juan Dela Cruz - Philippine Passport", type: "valid_id", fileName: "jdc_passport.jpg", fileSize: "1.8 MB", uploadedAt: "2026-03-10T08:27:00Z", status: "pending", expiryDate: "2031-03-10" },
      { id: "D006", name: "Board Resolution - Platform Operations", type: "board_resolution", fileName: "pinoybets_board_res.pdf", fileSize: "420 KB", uploadedAt: "2026-03-10T08:28:00Z", status: "pending" },
    ],
    notes: [
      { id: "N001", author: "Juan Miguel Dela Cruz", authorRole: "Applicant", text: "We are a newly registered corporation looking to launch a prediction market platform focused on PBA and UAAP events.", timestamp: "2026-03-10T08:30:00Z", type: "merchant_visible" },
    ],
  },
  {
    id: "KYB-2026-002",
    merchantName: "BetCebu",
    merchantSlug: "bet-cebu",
    businessType: "corporation",
    registrationNumber: "CS202600456",
    taxId: "987-654-321-000",
    businessAddress: "Level 8, Cebu IT Park Tower 2, Salinas Drive",
    city: "Cebu City",
    province: "Cebu",
    country: "Philippines",
    contactPerson: "Maria Isabel Fernandez",
    contactEmail: "maria@betcebu.ph",
    contactPhone: "+63 922 987 6543",
    website: "betcebu.ph",
    status: "under_review",
    submittedAt: "2026-03-05T10:15:00Z",
    reviewedBy: "Carlos Reyes",
    reviewStartedAt: "2026-03-07T09:00:00Z",
    plan: "growth",
    estimatedMonthlyGGR: "PHP 15,000,000",
    targetLaunchDate: "2026-04-15",
    documents: [
      { id: "D101", name: "SEC Registration", type: "sec_registration", fileName: "betcebu_sec.pdf", fileSize: "2.1 MB", uploadedAt: "2026-03-05T10:00:00Z", status: "verified" },
      { id: "D102", name: "DTI Certificate", type: "dti_permit", fileName: "betcebu_dti.pdf", fileSize: "980 KB", uploadedAt: "2026-03-05T10:02:00Z", status: "verified", expiryDate: "2027-03-05" },
      { id: "D103", name: "BIR COR", type: "bir_cor", fileName: "betcebu_bir.pdf", fileSize: "1.2 MB", uploadedAt: "2026-03-05T10:04:00Z", status: "verified", expiryDate: "2026-12-31" },
      { id: "D104", name: "Cebu City Business Permit", type: "mayor_permit", fileName: "betcebu_permit.pdf", fileSize: "2.8 MB", uploadedAt: "2026-03-05T10:06:00Z", status: "pending", expiryDate: "2026-12-31" },
      { id: "D105", name: "Maria Fernandez - Driver's License", type: "valid_id", fileName: "mif_license.jpg", fileSize: "1.4 MB", uploadedAt: "2026-03-05T10:08:00Z", status: "verified", expiryDate: "2030-06-15" },
      { id: "D106", name: "Secretary's Certificate", type: "board_resolution", fileName: "betcebu_sec_cert.pdf", fileSize: "350 KB", uploadedAt: "2026-03-05T10:10:00Z", status: "verified" },
      { id: "D107", name: "AML/KYC Compliance Manual", type: "aml_policy", fileName: "betcebu_aml.pdf", fileSize: "4.5 MB", uploadedAt: "2026-03-05T10:12:00Z", status: "pending" },
      { id: "D108", name: "GIS 2026", type: "gis", fileName: "betcebu_gis.pdf", fileSize: "1.8 MB", uploadedAt: "2026-03-05T10:14:00Z", status: "verified", expiryDate: "2027-04-15" },
    ],
    notes: [
      { id: "N101", author: "Maria Isabel Fernandez", authorRole: "Applicant", text: "Established Cebu-based gaming company expanding into prediction markets. We have existing PAGCOR e-Games license.", timestamp: "2026-03-05T10:15:00Z", type: "merchant_visible" },
      { id: "N102", author: "Carlos Reyes", authorRole: "Platform Admin", text: "Strong application. SEC docs verified against SEC Express Online. AML policy and mayor's permit still under review.", timestamp: "2026-03-07T09:30:00Z", type: "internal" },
    ],
  },
  {
    id: "KYB-2026-003",
    merchantName: "DavaoWager",
    merchantSlug: "davao-wager",
    businessType: "partnership",
    registrationNumber: "CS202600789",
    taxId: "456-789-012-000",
    businessAddress: "Door 5, Felcris Building, J.P. Laurel Avenue",
    city: "Davao City",
    province: "Davao del Sur",
    country: "Philippines",
    contactPerson: "Roberto Aquino",
    contactEmail: "roberto@davaowager.com",
    contactPhone: "+63 935 456 7890",
    website: "davaowager.com",
    status: "needs_info",
    submittedAt: "2026-02-28T14:00:00Z",
    reviewedBy: "Carlos Reyes",
    reviewStartedAt: "2026-03-02T11:00:00Z",
    plan: "starter",
    estimatedMonthlyGGR: "PHP 3,000,000",
    targetLaunchDate: "2026-06-01",
    documents: [
      { id: "D201", name: "SEC Partnership Registration", type: "sec_registration", fileName: "davaowager_sec.pdf", fileSize: "1.9 MB", uploadedAt: "2026-02-28T13:40:00Z", status: "verified" },
      { id: "D202", name: "DTI Permit", type: "dti_permit", fileName: "davaowager_dti.pdf", fileSize: "750 KB", uploadedAt: "2026-02-28T13:42:00Z", status: "verified", expiryDate: "2027-02-28" },
      { id: "D203", name: "BIR COR", type: "bir_cor", fileName: "davaowager_bir.pdf", fileSize: "1.0 MB", uploadedAt: "2026-02-28T13:44:00Z", status: "rejected", reviewNote: "Document expired. Please upload current year BIR COR.", expiryDate: "2024-12-31" },
      { id: "D204", name: "Davao City Permit", type: "mayor_permit", fileName: "davaowager_permit.pdf", fileSize: "2.5 MB", uploadedAt: "2026-02-28T13:46:00Z", status: "needs_reupload", reviewNote: "Image is blurry/unreadable. Please re-scan at higher resolution.", expiryDate: "2025-12-31" },
      { id: "D205", name: "Roberto Aquino - PhilSys ID", type: "valid_id", fileName: "ra_philsys.jpg", fileSize: "1.2 MB", uploadedAt: "2026-02-28T13:48:00Z", status: "verified" },
      { id: "D206", name: "Articles of Partnership", type: "board_resolution", fileName: "davaowager_aop.pdf", fileSize: "600 KB", uploadedAt: "2026-02-28T13:50:00Z", status: "verified" },
    ],
    notes: [
      { id: "N201", author: "Roberto Aquino", authorRole: "Applicant", text: "Partnership of 3 Davao-based entrepreneurs targeting local sports prediction market.", timestamp: "2026-02-28T14:00:00Z", type: "merchant_visible" },
      { id: "N202", author: "Carlos Reyes", authorRole: "Platform Admin", text: "BIR COR is from 2024 - needs current year. Mayor's permit scan quality is insufficient. Requesting re-upload of both.", timestamp: "2026-03-02T11:30:00Z", type: "internal" },
      { id: "N203", author: "Carlos Reyes", authorRole: "Platform Admin", text: "Sent request for updated BIR COR (must be 2025/2026) and a clearer scan of the business permit.", timestamp: "2026-03-02T11:35:00Z", type: "merchant_visible" },
    ],
  },
  {
    id: "KYB-2026-004",
    merchantName: "MegaStakes PH",
    merchantSlug: "megastakes-ph",
    businessType: "corporation",
    registrationNumber: "CS202500234",
    taxId: "321-654-987-000",
    businessAddress: "22/F Robinsons Equitable Tower, ADB Avenue",
    city: "Pasig City",
    province: "Metro Manila",
    country: "Philippines",
    contactPerson: "Elena Villanueva",
    contactEmail: "elena@megastakes.ph",
    contactPhone: "+63 918 765 4321",
    website: "megastakes.ph",
    status: "approved",
    submittedAt: "2026-02-15T09:00:00Z",
    reviewedBy: "Carlos Reyes",
    reviewStartedAt: "2026-02-16T08:00:00Z",
    completedAt: "2026-02-20T15:00:00Z",
    plan: "enterprise",
    estimatedMonthlyGGR: "PHP 50,000,000",
    targetLaunchDate: "2026-04-01",
    documents: [
      { id: "D301", name: "SEC Registration", type: "sec_registration", fileName: "megastakes_sec.pdf", fileSize: "2.6 MB", uploadedAt: "2026-02-15T08:30:00Z", status: "verified" },
      { id: "D302", name: "DTI Certificate", type: "dti_permit", fileName: "megastakes_dti.pdf", fileSize: "1.3 MB", uploadedAt: "2026-02-15T08:32:00Z", status: "verified", expiryDate: "2027-02-15" },
      { id: "D303", name: "BIR COR", type: "bir_cor", fileName: "megastakes_bir.pdf", fileSize: "1.1 MB", uploadedAt: "2026-02-15T08:34:00Z", status: "verified", expiryDate: "2026-12-31" },
      { id: "D304", name: "Pasig City Business Permit", type: "mayor_permit", fileName: "megastakes_permit.pdf", fileSize: "2.9 MB", uploadedAt: "2026-02-15T08:36:00Z", status: "verified", expiryDate: "2026-12-31" },
      { id: "D305", name: "Elena Villanueva - Passport", type: "valid_id", fileName: "ev_passport.jpg", fileSize: "1.5 MB", uploadedAt: "2026-02-15T08:38:00Z", status: "verified", expiryDate: "2032-08-20" },
      { id: "D306", name: "Board Resolution", type: "board_resolution", fileName: "megastakes_board.pdf", fileSize: "500 KB", uploadedAt: "2026-02-15T08:40:00Z", status: "verified" },
      { id: "D307", name: "AML Policy", type: "aml_policy", fileName: "megastakes_aml.pdf", fileSize: "5.2 MB", uploadedAt: "2026-02-15T08:42:00Z", status: "verified" },
      { id: "D308", name: "GIS 2025", type: "gis", fileName: "megastakes_gis.pdf", fileSize: "2.0 MB", uploadedAt: "2026-02-15T08:44:00Z", status: "verified", expiryDate: "2026-04-15" },
    ],
    notes: [
      { id: "N301", author: "Elena Villanueva", authorRole: "Applicant", text: "Large-scale prediction market operator. We have existing PAGCOR license and PSE-listed parent company.", timestamp: "2026-02-15T09:00:00Z", type: "merchant_visible" },
      { id: "N302", author: "Carlos Reyes", authorRole: "Platform Admin", text: "All documents verified. Enterprise-grade applicant with strong compliance background. Recommend fast-track approval.", timestamp: "2026-02-18T10:00:00Z", type: "internal" },
      { id: "N303", author: "Carlos Reyes", authorRole: "Platform Admin", text: "KYB approved. All documents verified. You will receive your first-login credentials shortly.", timestamp: "2026-02-20T15:00:00Z", type: "merchant_visible" },
    ],
  },
  {
    id: "KYB-2026-005",
    merchantName: "QuickTustos",
    merchantSlug: "quick-tustos",
    businessType: "sole_proprietor",
    registrationNumber: "DTI-2026-00567",
    taxId: "111-222-333-000",
    businessAddress: "123 Rizal Street, Barangay San Antonio",
    city: "Quezon City",
    province: "Metro Manila",
    country: "Philippines",
    contactPerson: "Mark Anthony Reyes",
    contactEmail: "mark@quicktustos.ph",
    contactPhone: "+63 920 111 2233",
    website: "quicktustos.ph",
    status: "credentials_sent",
    submittedAt: "2026-02-01T11:00:00Z",
    reviewedBy: "Ana Dela Cruz",
    reviewStartedAt: "2026-02-03T08:00:00Z",
    completedAt: "2026-02-08T14:00:00Z",
    credentialsSentAt: "2026-02-08T14:30:00Z",
    credentialEmail: "admin@quicktustos.ph",
    plan: "starter",
    estimatedMonthlyGGR: "PHP 1,500,000",
    targetLaunchDate: "2026-03-15",
    documents: [
      { id: "D401", name: "DTI Business Name Registration", type: "sec_registration", fileName: "quicktustos_dti.pdf", fileSize: "900 KB", uploadedAt: "2026-02-01T10:30:00Z", status: "verified" },
      { id: "D402", name: "DTI Permit", type: "dti_permit", fileName: "quicktustos_dti_permit.pdf", fileSize: "800 KB", uploadedAt: "2026-02-01T10:32:00Z", status: "verified", expiryDate: "2027-02-01" },
      { id: "D403", name: "BIR COR", type: "bir_cor", fileName: "quicktustos_bir.pdf", fileSize: "750 KB", uploadedAt: "2026-02-01T10:34:00Z", status: "verified", expiryDate: "2026-12-31" },
      { id: "D404", name: "QC Business Permit", type: "mayor_permit", fileName: "quicktustos_permit.pdf", fileSize: "1.8 MB", uploadedAt: "2026-02-01T10:36:00Z", status: "verified", expiryDate: "2026-12-31" },
      { id: "D405", name: "Mark Reyes - PhilSys ID", type: "valid_id", fileName: "mr_philsys.jpg", fileSize: "1.0 MB", uploadedAt: "2026-02-01T10:38:00Z", status: "verified" },
      { id: "D406", name: "Affidavit of Sole Proprietorship", type: "board_resolution", fileName: "quicktustos_affidavit.pdf", fileSize: "300 KB", uploadedAt: "2026-02-01T10:40:00Z", status: "verified" },
    ],
    notes: [
      { id: "N401", author: "Mark Anthony Reyes", authorRole: "Applicant", text: "Small-scale prediction market for local community events.", timestamp: "2026-02-01T11:00:00Z", type: "merchant_visible" },
      { id: "N402", author: "Ana Dela Cruz", authorRole: "Platform Ops", text: "Simple sole-prop application. All docs check out.", timestamp: "2026-02-05T09:00:00Z", type: "internal" },
      { id: "N403", author: "Ana Dela Cruz", authorRole: "Platform Ops", text: "Approved and credentials sent to admin@quicktustos.ph", timestamp: "2026-02-08T14:30:00Z", type: "merchant_visible" },
    ],
  },
  {
    id: "KYB-2026-006",
    merchantName: "VistaWager",
    merchantSlug: "vista-wager",
    businessType: "corporation",
    registrationNumber: "CS202600999",
    taxId: "999-888-777-000",
    businessAddress: "5/F Vista Hub, McKinley West",
    city: "Taguig City",
    province: "Metro Manila",
    country: "Philippines",
    contactPerson: "David Chua",
    contactEmail: "david@vistawager.com",
    contactPhone: "+63 917 999 8888",
    website: "vistawager.com",
    status: "rejected",
    submittedAt: "2026-02-20T16:00:00Z",
    reviewedBy: "Carlos Reyes",
    reviewStartedAt: "2026-02-22T09:00:00Z",
    completedAt: "2026-02-25T11:00:00Z",
    plan: "growth",
    estimatedMonthlyGGR: "PHP 10,000,000",
    targetLaunchDate: "2026-05-15",
    documents: [
      { id: "D501", name: "SEC Registration", type: "sec_registration", fileName: "vistawager_sec.pdf", fileSize: "2.0 MB", uploadedAt: "2026-02-20T15:30:00Z", status: "rejected", reviewNote: "SEC registration number does not match database records. Possible fraudulent document." },
      { id: "D502", name: "DTI Permit", type: "dti_permit", fileName: "vistawager_dti.pdf", fileSize: "1.0 MB", uploadedAt: "2026-02-20T15:32:00Z", status: "rejected", reviewNote: "Business name mismatch with SEC records." },
      { id: "D503", name: "BIR COR", type: "bir_cor", fileName: "vistawager_bir.pdf", fileSize: "900 KB", uploadedAt: "2026-02-20T15:34:00Z", status: "pending" },
      { id: "D504", name: "Business Permit", type: "mayor_permit", fileName: "vistawager_permit.pdf", fileSize: "2.2 MB", uploadedAt: "2026-02-20T15:36:00Z", status: "pending" },
      { id: "D505", name: "David Chua - ID", type: "valid_id", fileName: "dc_id.jpg", fileSize: "1.3 MB", uploadedAt: "2026-02-20T15:38:00Z", status: "pending" },
      { id: "D506", name: "Board Resolution", type: "board_resolution", fileName: "vistawager_board.pdf", fileSize: "400 KB", uploadedAt: "2026-02-20T15:40:00Z", status: "pending" },
    ],
    notes: [
      { id: "N501", author: "David Chua", authorRole: "Applicant", text: "New gaming startup backed by Vista Land.", timestamp: "2026-02-20T16:00:00Z", type: "merchant_visible" },
      { id: "N502", author: "Carlos Reyes", authorRole: "Platform Admin", text: "SEC registration CS202600999 returns no results in SEC Express. DTI business name 'VistaWager Inc.' does not match submitted SEC cert showing 'Vista Gaming Corp'. High risk - recommend rejection.", timestamp: "2026-02-23T10:00:00Z", type: "internal" },
      { id: "N503", author: "Carlos Reyes", authorRole: "Platform Admin", text: "Your KYB application has been rejected due to discrepancies in your business registration documents. The SEC registration number could not be verified and the business name does not match across documents. You may reapply with corrected documentation.", timestamp: "2026-02-25T11:00:00Z", type: "merchant_visible" },
    ],
  },
];

/* ==================== STATUS CONFIG ==================== */
const STATUS_CONFIG: Record<KybStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "DRAFT", color: "text-[#84888c]", bg: "bg-[#f0f1f3]" },
  submitted: { label: "SUBMITTED", color: "text-blue-600", bg: "bg-blue-50" },
  under_review: { label: "UNDER REVIEW", color: "text-amber-600", bg: "bg-amber-50" },
  needs_info: { label: "NEEDS INFO", color: "text-orange-600", bg: "bg-orange-50" },
  approved: { label: "APPROVED", color: "text-emerald-600", bg: "bg-emerald-50" },
  rejected: { label: "REJECTED", color: "text-red-500", bg: "bg-red-50" },
  credentials_sent: { label: "LIVE", color: "text-purple-600", bg: "bg-purple-50" },
};

const DOC_STATUS_CONFIG: Record<KybDocument["status"], { label: string; color: string; bg: string }> = {
  pending: { label: "PENDING", color: "text-[#84888c]", bg: "bg-[#f0f1f3]" },
  verified: { label: "VERIFIED", color: "text-emerald-600", bg: "bg-emerald-50" },
  rejected: { label: "REJECTED", color: "text-red-500", bg: "bg-red-50" },
  needs_reupload: { label: "REUPLOAD", color: "text-orange-600", bg: "bg-orange-50" },
};

const BIZ_TYPE_LABELS: Record<KybApplication["businessType"], string> = {
  corporation: "Corporation",
  partnership: "Partnership",
  sole_proprietor: "Sole Proprietor",
  cooperative: "Cooperative",
};

/* ==================== SUB-COMPONENTS ==================== */
function StatusBadge({ status }: { status: KybStatus }) {
  const c = STATUS_CONFIG[status];
  return <span className={`text-[9px] px-2 py-0.5 rounded-full ${c.bg} ${c.color}`} style={{ fontWeight: 600, ...ss04 }}>{c.label}</span>;
}

function DocStatusBadge({ status }: { status: KybDocument["status"] }) {
  const c = DOC_STATUS_CONFIG[status];
  return <span className={`text-[9px] px-1.5 py-0.5 rounded ${c.bg} ${c.color}`} style={{ fontWeight: 600, ...ss04 }}>{c.label}</span>;
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl p-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
      <p className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>{label}</p>
      <p className={`text-[18px] ${color}`} style={{ fontWeight: 700, ...ss04 }}>{value}</p>
    </div>
  );
}

function SectionCard({ title, subtitle, badge, children }: { title: string; subtitle?: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="px-5 py-4 border-b border-[#f0f1f3] flex items-center gap-2.5">
        <h3 className="text-[#070808] text-[14px]" style={{ fontWeight: 600, ...ss04 }}>{title}</h3>
        {badge && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f5f6f8] text-[#84888c]" style={{ fontWeight: 600, ...ss04 }}>{badge}</span>}
      </div>
      {subtitle && (
        <div className="px-5 py-2.5 bg-[#f9fafb] border-b border-[#f0f1f3]">
          <p className="text-[#84888c] text-[11px]" style={{ fontWeight: 400, ...ss04 }}>{subtitle}</p>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#f0f1f3] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct === 100 ? "#10b981" : "#ff5222" }} />
      </div>
      <span className="text-[10px] text-[#84888c] flex-shrink-0" style={{ fontWeight: 600, ...ss04 }}>{completed}/{total}</span>
    </div>
  );
}

/* ==================== MAIN PAGE ==================== */
export default function OmsKyb() {
  const navigate = useNavigate();
  const { admin, addMerchant, createAdminAccount } = useOmsAuth();
  const isPlat = admin ? isPlatformUser(admin.role) : false;

  const [applications, setApplications] = useState<KybApplication[]>(INITIAL_APPLICATIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<KybStatus | "all">("all");
  const [tab, setTab] = useState<"applications" | "checklist" | "renewals">("applications");

  // Modal states
  const [selectedApp, setSelectedApp] = useState<KybApplication | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "documents" | "notes" | "credentials">("overview");
  const [showModal, setShowModal] = useState(false);

  // Review actions
  const [actionModal, setActionModal] = useState<"approve" | "reject" | "request_info" | "send_credentials" | "verify_doc" | "reject_doc" | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<KybDocument | null>(null);
  const [credentialEmail, setCredentialEmail] = useState("");
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<"internal" | "merchant_visible">("internal");

  // Filters
  const filtered = applications.filter(a => {
    if (search) {
      const q = search.toLowerCase();
      if (!a.merchantName.toLowerCase().includes(q) && !a.id.toLowerCase().includes(q) && !a.contactPerson.toLowerCase().includes(q) && !a.contactEmail.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  // Stats
  const counts = {
    total: applications.length,
    submitted: applications.filter(a => a.status === "submitted").length,
    under_review: applications.filter(a => a.status === "under_review").length,
    needs_info: applications.filter(a => a.status === "needs_info").length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length,
    live: applications.filter(a => a.status === "credentials_sent").length,
  };

  const openDetail = (app: KybApplication) => {
    setSelectedApp(app);
    setDetailTab("overview");
    setShowModal(true);
    setCredentialEmail(app.contactEmail);
  };

  const doAudit = (action: "kyb_submit" | "kyb_review_start" | "kyb_approve" | "kyb_reject" | "kyb_request_info" | "kyb_credential_sent", target: string, detail?: string) => {
    if (!admin) return;
    logAudit({ adminEmail: admin.email, adminRole: admin.role, action, target, detail, merchantId: selectedApp?.merchantSlug });
  };

  /* ---- Review Actions ---- */
  const startReview = (app: KybApplication) => {
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "under_review" as KybStatus, reviewedBy: admin?.name || "", reviewStartedAt: new Date().toISOString() } : a));
    const updated = { ...app, status: "under_review" as KybStatus, reviewedBy: admin?.name || "", reviewStartedAt: new Date().toISOString() };
    setSelectedApp(updated);
    doAudit("kyb_review_start", app.id, `Started review of ${app.merchantName}`);
    showOmsToast(`Review started for ${app.merchantName}`);
  };

  const handleApprove = () => {
    if (!selectedApp) return;
    const note: KybNote = {
      id: `N${Date.now()}`,
      author: admin?.name || "System",
      authorRole: admin?.role || "",
      text: actionNote || "KYB application approved. All documents verified successfully.",
      timestamp: new Date().toISOString(),
      type: "merchant_visible",
    };
    setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: "approved" as KybStatus, completedAt: new Date().toISOString(), notes: [...a.notes, note] } : a));
    setSelectedApp(prev => prev ? { ...prev, status: "approved", completedAt: new Date().toISOString(), notes: [...prev.notes, note] } : null);
    doAudit("kyb_approve", selectedApp.id, `Approved KYB for ${selectedApp.merchantName}`);
    showOmsToast(`${selectedApp.merchantName} KYB approved`);
    setActionModal(null);
    setActionNote("");
  };

  const handleReject = () => {
    if (!selectedApp || !actionNote.trim()) { showOmsToast("Rejection reason is required", "error"); return; }
    const note: KybNote = {
      id: `N${Date.now()}`,
      author: admin?.name || "System",
      authorRole: admin?.role || "",
      text: actionNote,
      timestamp: new Date().toISOString(),
      type: "merchant_visible",
    };
    setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: "rejected" as KybStatus, completedAt: new Date().toISOString(), notes: [...a.notes, note] } : a));
    setSelectedApp(prev => prev ? { ...prev, status: "rejected", completedAt: new Date().toISOString(), notes: [...prev.notes, note] } : null);
    doAudit("kyb_reject", selectedApp.id, actionNote);
    showOmsToast(`${selectedApp.merchantName} KYB rejected`);
    setActionModal(null);
    setActionNote("");
  };

  const handleRequestInfo = () => {
    if (!selectedApp || !actionNote.trim()) { showOmsToast("Please specify what information is needed", "error"); return; }
    const note: KybNote = {
      id: `N${Date.now()}`,
      author: admin?.name || "System",
      authorRole: admin?.role || "",
      text: actionNote,
      timestamp: new Date().toISOString(),
      type: "merchant_visible",
    };
    setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: "needs_info" as KybStatus, notes: [...a.notes, note] } : a));
    setSelectedApp(prev => prev ? { ...prev, status: "needs_info", notes: [...prev.notes, note] } : null);
    doAudit("kyb_request_info", selectedApp.id, actionNote);
    showOmsToast(`Info request sent to ${selectedApp.merchantName}`);
    setActionModal(null);
    setActionNote("");
  };

  const handleSendCredentials = () => {
    if (!selectedApp || !credentialEmail.trim()) { showOmsToast("Credential email is required", "error"); return; }
    const pw = generatePassword();

    // Auto-create merchant record in the platform
    const merchantId = `MCH${String(Date.now()).slice(-4)}`;
    const newMerchant: Merchant = {
      id: merchantId,
      name: selectedApp.merchantName,
      slug: selectedApp.merchantSlug,
      logo: selectedApp.merchantName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      primaryDomain: selectedApp.website,
      status: "onboarding",
      plan: selectedApp.plan,
      country: selectedApp.country,
      currency: "PHP",
      createdAt: new Date().toISOString().split("T")[0],
      ggr: 0,
      users: 0,
      markets: 0,
    };
    addMerchant(newMerchant);

    // Create first-login admin account for the merchant
    createAdminAccount({
      email: credentialEmail,
      password: pw,
      name: selectedApp.contactPerson,
      role: "merchant_admin",
      merchantId: merchantId,
      tenantName: selectedApp.merchantName,
    });

    const note: KybNote = {
      id: `N${Date.now()}`,
      author: admin?.name || "System",
      authorRole: admin?.role || "",
      text: `First-login credentials sent to ${credentialEmail}. Merchant record ${merchantId} auto-created (status: onboarding). Admin account provisioned with first-login password.`,
      timestamp: new Date().toISOString(),
      type: "merchant_visible",
    };
    setApplications(prev => prev.map(a => a.id === selectedApp.id ? {
      ...a,
      status: "credentials_sent" as KybStatus,
      credentialsSentAt: new Date().toISOString(),
      credentialEmail: credentialEmail,
      generatedPassword: pw,
      notes: [...a.notes, note],
    } : a));
    setSelectedApp(prev => prev ? {
      ...prev,
      status: "credentials_sent",
      credentialsSentAt: new Date().toISOString(),
      credentialEmail: credentialEmail,
      generatedPassword: pw,
      notes: [...prev.notes, note],
    } : null);
    doAudit("kyb_credential_sent", selectedApp.id, `Credentials sent to ${credentialEmail}. Merchant ${merchantId} auto-created.`);
    showOmsToast(`Credentials sent & merchant ${selectedApp.merchantName} created`);
    setActionModal(null);
  };

  const handleDocAction = (status: "verified" | "rejected" | "needs_reupload") => {
    if (!selectedApp || !selectedDoc) return;
    const reviewNote = status !== "verified" ? actionNote : undefined;
    if (status !== "verified" && !actionNote.trim()) { showOmsToast("Please provide a review note", "error"); return; }
    const updatedDocs = selectedApp.documents.map(d => d.id === selectedDoc.id ? { ...d, status, reviewNote } : d);
    setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, documents: updatedDocs } : a));
    setSelectedApp(prev => prev ? { ...prev, documents: updatedDocs } : null);
    showOmsToast(`Document ${status === "verified" ? "verified" : status === "rejected" ? "rejected" : "flagged for reupload"}`);
    setActionModal(null);
    setActionNote("");
    setSelectedDoc(null);
  };

  const addNote = () => {
    if (!selectedApp || !newNote.trim()) return;
    const note: KybNote = {
      id: `N${Date.now()}`,
      author: admin?.name || "System",
      authorRole: admin?.role || "",
      text: newNote,
      timestamp: new Date().toISOString(),
      type: noteType,
    };
    setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, notes: [...a.notes, note] } : a));
    setSelectedApp(prev => prev ? { ...prev, notes: [...prev.notes, note] } : null);
    setNewNote("");
    showOmsToast("Note added");
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4" style={pp}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff5222]" />
            <span className="text-[9px] tracking-[0.1em] text-[#ff5222]" style={{ fontWeight: 700, ...ss04 }}>MERCHANT KYB</span>
          </div>
          <h2 className="text-[#070808] text-[18px]" style={{ fontWeight: 700, ...ss04 }}>Know Your Business Verification</h2>
          <p className="text-[#b0b3b8] text-[12px] mt-0.5" style={ss04}>Review and verify merchant business documentation before granting platform access</p>
        </div>
        <button
          onClick={() => navigate("/oms/kyb-apply")}
          className="h-8 px-4 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors flex items-center gap-2 flex-shrink-0"
          style={{ fontWeight: 600, ...ss04 }}
        >
          <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M14 8H2M8 2v12" strokeLinecap="round" /></svg>
          Merchant Application Form
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
        <StatCard label="Total Applications" value={counts.total} color="text-[#070808]" />
        <StatCard label="Submitted" value={counts.submitted} color="text-blue-600" />
        <StatCard label="Under Review" value={counts.under_review} color="text-amber-600" />
        <StatCard label="Needs Info" value={counts.needs_info} color="text-orange-600" />
        <StatCard label="Approved" value={counts.approved} color="text-emerald-600" />
        <StatCard label="Rejected" value={counts.rejected} color="text-red-500" />
        <StatCard label="Live" value={counts.live} color="text-purple-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#e5e7eb]">
        {([
          { key: "applications" as const, label: "Applications" },
          { key: "renewals" as const, label: "Expiry & Renewals" },
          { key: "checklist" as const, label: "Required Documents Checklist" },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="pb-2.5 cursor-pointer transition-colors relative"
            style={ss04}
          >
            <span className={`text-[13px] ${tab === t.key ? "text-[#070808]" : "text-[#84888c] hover:text-[#070808]"}`} style={{ fontWeight: tab === t.key ? 600 : 500 }}>{t.label}</span>
            {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5222] rounded-full" />}
          </button>
        ))}
      </div>

      {tab === "applications" && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white border border-[#e5e7eb] rounded-lg px-3 h-8 max-w-[280px]">
                <svg className="size-3.5 text-[#b0b3b8]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M14 14l-3-3" /></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-[#070808] text-[12px] outline-none flex-1 placeholder-[#b0b3b8]" placeholder="Search applications..." style={ss04} />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="h-8 px-2.5 bg-white border border-[#e5e7eb] rounded-lg text-[#070808] text-[11px] outline-none cursor-pointer" style={ss04}>
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="needs_info">Needs Info</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="credentials_sent">Live</option>
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#f0f1f3]">
                    {["Application ID", "Merchant", "Business Type", "Contact", "Plan", "Submitted", "Documents", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left text-[#84888c] text-[10px] px-4 py-3" style={{ fontWeight: 600, ...ss04 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(app => {
                    const verifiedDocs = app.documents.filter(d => d.status === "verified").length;
                    return (
                      <tr key={app.id} className="border-b border-[#f0f1f3] hover:bg-[#f9fafb] transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-[#ff5222] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>{app.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{app.merchantName}</p>
                          <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{app.website}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[#070808] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{BIZ_TYPE_LABELS[app.businessType]}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[#070808] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{app.contactPerson}</p>
                          <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{app.contactEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f5f6f8] text-[#84888c]" style={{ fontWeight: 600, ...ss04 }}>{app.plan.toUpperCase()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[#84888c] text-[11px]" style={ss04}>{formatDate(app.submittedAt)}</span>
                        </td>
                        <td className="px-4 py-3 w-[120px]">
                          <ProgressBar completed={verifiedDocs} total={app.documents.length} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => openDetail(app)} className="text-[10px] px-2.5 py-1 rounded bg-[#f5f6f8] hover:bg-[#e5e7eb] text-[#070808] cursor-pointer transition-colors" style={{ fontWeight: 500, ...ss04 }}>Review</button>
                            {app.status === "submitted" && isPlat && (
                              <button onClick={() => { openDetail(app); startReview(app); }} className="text-[10px] px-2.5 py-1 rounded bg-[#ff5222] hover:bg-[#e8491f] text-white cursor-pointer transition-colors" style={{ fontWeight: 500, ...ss04 }}>Start</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-[#b0b3b8] text-[13px]" style={ss04}>No applications found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "renewals" && (() => {
        const now = new Date("2026-03-15");
        const EXPIRY_WARN_DAYS = 90;
        // Collect all docs with expiry dates from approved/live merchants
        const trackableApps = applications.filter(a => a.status === "approved" || a.status === "credentials_sent" || a.status === "under_review" || a.status === "needs_info");
        const allExpDocs: { app: typeof trackableApps[0]; doc: KybDocument; daysUntilExpiry: number; status: "expired" | "critical" | "warning" | "ok" }[] = [];
        trackableApps.forEach(app => {
          app.documents.forEach(doc => {
            if (!doc.expiryDate) return;
            const exp = new Date(doc.expiryDate);
            const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            let st: "expired" | "critical" | "warning" | "ok" = "ok";
            if (diff < 0) st = "expired";
            else if (diff <= 30) st = "critical";
            else if (diff <= EXPIRY_WARN_DAYS) st = "warning";
            allExpDocs.push({ app, doc, daysUntilExpiry: diff, status: st });
          });
        });
        allExpDocs.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

        const expired = allExpDocs.filter(d => d.status === "expired");
        const critical = allExpDocs.filter(d => d.status === "critical");
        const warning = allExpDocs.filter(d => d.status === "warning");
        const ok = allExpDocs.filter(d => d.status === "ok");

        const ExpiryBadge = ({ st, days }: { st: string; days: number }) => {
          const map: Record<string, { label: string; cls: string }> = {
            expired: { label: `EXPIRED (${Math.abs(days)}d ago)`, cls: "bg-red-50 text-red-500" },
            critical: { label: `${days}d LEFT`, cls: "bg-red-50 text-red-500" },
            warning: { label: `${days}d LEFT`, cls: "bg-amber-50 text-amber-600" },
            ok: { label: `${days}d`, cls: "bg-emerald-50 text-emerald-600" },
          };
          const c = map[st] || map.ok;
          return <span className={`text-[9px] px-1.5 py-0.5 rounded ${c.cls}`} style={{ fontWeight: 600, ...ss04 }}>{c.label}</span>;
        };

        return (
          <div className="space-y-4">
            {/* Renewal summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Expired Documents" value={expired.length} color={expired.length > 0 ? "text-red-500" : "text-[#070808]"} />
              <StatCard label="Expiring ≤30 Days" value={critical.length} color={critical.length > 0 ? "text-red-500" : "text-[#070808]"} />
              <StatCard label="Expiring ≤90 Days" value={warning.length} color={warning.length > 0 ? "text-amber-600" : "text-[#070808]"} />
              <StatCard label="Up to Date" value={ok.length} color="text-emerald-600" />
            </div>

            {/* Info banner */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <svg className="size-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5" /><path d="M8 5v3m0 2.5h.01" strokeLinecap="round" /></svg>
              <p className="text-blue-600 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                Philippine business permits (Mayor's Permit) and BIR COR expire annually on Dec 31. GIS filings are due within 30 days of the annual meeting. Track upcoming expirations here to ensure merchants maintain compliance.
              </p>
            </div>

            {/* Expired docs — urgent */}
            {expired.length > 0 && (
              <SectionCard title="Expired Documents" subtitle="These documents have passed their expiry date and require immediate renewal" badge={`${expired.length} EXPIRED`}>
                <div className="space-y-2">
                  {expired.map(({ app, doc, daysUntilExpiry, status: st }) => (
                    <div key={`${app.id}-${doc.id}`} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <svg className="size-4 text-red-500" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M8 1.5l6.5 11.25H1.5L8 1.5z" /><path d="M8 6.5v2.5m0 1.5h.01" strokeLinecap="round" /></svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#070808] text-[12px] truncate" style={{ fontWeight: 600, ...ss04 }}>{doc.name}</p>
                          <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{app.merchantName} &middot; {DOC_TYPE_LABELS[doc.type]} &middot; Expired: {formatDate(doc.expiryDate || "")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ExpiryBadge st={st} days={daysUntilExpiry} />
                        <StatusBadge status={app.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Critical — ≤30 days */}
            {critical.length > 0 && (
              <SectionCard title="Expiring Within 30 Days" subtitle="Documents approaching expiry — contact merchants to begin renewal" badge={`${critical.length}`}>
                <div className="space-y-2">
                  {critical.map(({ app, doc, daysUntilExpiry, status: st }) => (
                    <div key={`${app.id}-${doc.id}`} className="flex items-center justify-between p-3 bg-orange-50/30 border border-orange-200 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <svg className="size-4 text-orange-500" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5" /><path d="M8 5v3m0 2.5h.01" strokeLinecap="round" /></svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#070808] text-[12px] truncate" style={{ fontWeight: 600, ...ss04 }}>{doc.name}</p>
                          <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{app.merchantName} &middot; {DOC_TYPE_LABELS[doc.type]} &middot; Expires: {formatDate(doc.expiryDate || "")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ExpiryBadge st={st} days={daysUntilExpiry} />
                        <StatusBadge status={app.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Warning — ≤90 days */}
            {warning.length > 0 && (
              <SectionCard title="Expiring Within 90 Days" subtitle="Upcoming expirations — plan ahead for document renewals" badge={`${warning.length}`}>
                <div className="space-y-2">
                  {warning.map(({ app, doc, daysUntilExpiry, status: st }) => (
                    <div key={`${app.id}-${doc.id}`} className="flex items-center justify-between p-3 bg-amber-50/30 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                          <svg className="size-4 text-amber-500" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5" /><path d="M8 5v3" strokeLinecap="round" /><circle cx="8" cy="10.5" r="0.5" fill="currentColor" /></svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#070808] text-[12px] truncate" style={{ fontWeight: 600, ...ss04 }}>{doc.name}</p>
                          <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{app.merchantName} &middot; {DOC_TYPE_LABELS[doc.type]} &middot; Expires: {formatDate(doc.expiryDate || "")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ExpiryBadge st={st} days={daysUntilExpiry} />
                        <StatusBadge status={app.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Up to date */}
            {ok.length > 0 && (
              <SectionCard title="Up to Date" subtitle="Documents valid for more than 90 days" badge={`${ok.length}`}>
                <div className="space-y-1.5">
                  {ok.map(({ app, doc, daysUntilExpiry, status: st }) => (
                    <div key={`${app.id}-${doc.id}`} className="flex items-center justify-between p-2.5 bg-[#f9fafb] border border-[#f0f1f3] rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <svg className="size-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><path d="M5.5 8l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <div className="min-w-0">
                          <p className="text-[#070808] text-[11px] truncate" style={{ fontWeight: 500, ...ss04 }}>{doc.name}</p>
                          <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{app.merchantName} &middot; Expires: {formatDate(doc.expiryDate || "")}</p>
                        </div>
                      </div>
                      <ExpiryBadge st={st} days={daysUntilExpiry} />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {allExpDocs.length === 0 && (
              <div className="p-8 text-center bg-white border border-[#e5e7eb] rounded-2xl">
                <p className="text-[#b0b3b8] text-[13px]" style={ss04}>No documents with expiry dates to track</p>
              </div>
            )}

            {/* Annual renewal calendar */}
            <SectionCard title="Philippine Document Renewal Calendar" subtitle="Standard annual renewal schedule for key business documents">
              <div className="space-y-2">
                {[
                  { doc: "Mayor's Permit / Business License", deadline: "January 20 (or within 20 days of the new year)", note: "Must be renewed annually with the LGU. Late renewal incurs surcharges." },
                  { doc: "BIR Certificate of Registration", deadline: "Annual — renew before Dec 31", note: "BIR COR (Form 2303) must be current. Annual registration fee due on or before Jan 31." },
                  { doc: "SEC General Information Sheet (GIS)", deadline: "Within 30 days of annual stockholders' meeting", note: "Corporations must file annually with the SEC." },
                  { doc: "DTI Business Name Registration", deadline: "Every 5 years from initial registration", note: "Sole proprietors must renew DTI registration before expiry." },
                  { doc: "PAGCOR License (if applicable)", deadline: "As per license terms", note: "Gaming operators must maintain valid PAGCOR authorization." },
                ].map(item => (
                  <div key={item.doc} className="p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{item.doc}</p>
                        <p className="text-[#b0b3b8] text-[10px] mt-0.5" style={ss04}>{item.note}</p>
                      </div>
                      <span className="text-[#ff5222] text-[10px] flex-shrink-0 bg-[#ff5222]/5 px-2 py-0.5 rounded" style={{ fontWeight: 600, ...ss04 }}>{item.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        );
      })()}

      {tab === "checklist" && (
        <SectionCard title="KYB Document Requirements" subtitle="Documents required for merchant onboarding verification in the Philippines">
          <div className="space-y-2">
            {REQUIRED_DOC_TYPES.map((type, i) => (
              <div key={type} className="flex items-center justify-between p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#ff5222]/10 flex items-center justify-center text-[#ff5222] text-[11px]" style={{ fontWeight: 700, ...ss04 }}>{i + 1}</div>
                  <div>
                    <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>{DOC_TYPE_LABELS[type]}</p>
                    <p className="text-[#b0b3b8] text-[10px]" style={ss04}>
                      {type === "sec_registration" && "Securities & Exchange Commission registration certificate"}
                      {type === "dti_permit" && "Department of Trade & Industry business name registration"}
                      {type === "bir_cor" && "Bureau of Internal Revenue certificate (Form 2303)"}
                      {type === "mayor_permit" && "LGU-issued business license for the current year"}
                      {type === "valid_id" && "Government-issued photo ID of authorized representative"}
                      {type === "board_resolution" && "Corporate resolution authorizing platform operations"}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 flex-shrink-0" style={{ fontWeight: 600, ...ss04 }}>REQUIRED</span>
              </div>
            ))}
            {(["aml_policy", "gis", "other"] as KybDocument["type"][]).map(type => (
              <div key={type} className="flex items-center justify-between p-3 bg-[#f9fafb] border border-[#f0f1f3] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#f0f1f3] flex items-center justify-center text-[#84888c] text-[11px]" style={{ fontWeight: 700, ...ss04 }}>+</div>
                  <div>
                    <p className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{DOC_TYPE_LABELS[type]}</p>
                    <p className="text-[#b0b3b8] text-[10px]" style={ss04}>
                      {type === "aml_policy" && "Internal AML/KYC compliance policy document"}
                      {type === "gis" && "SEC General Information Sheet for the current year"}
                      {type === "other" && "Any additional supporting documentation"}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f0f1f3] text-[#84888c] flex-shrink-0" style={{ fontWeight: 600, ...ss04 }}>OPTIONAL</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-600 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
              All documents must be in PDF, JPG, or PNG format. Maximum file size: 10 MB per document. Documents are verified against government databases where possible (SEC Express, BIR eServices).
            </p>
          </div>
        </SectionCard>
      )}

      {/* ==================== DETAIL MODAL ==================== */}
      <OmsModal open={showModal && !!selectedApp} onClose={() => { setShowModal(false); setSelectedApp(null); }} title="KYB Application Review" subtitle={selectedApp?.id} width="max-w-[800px]">
        {selectedApp && (
          <div className="space-y-4">
            {/* Application header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#ff5222]/10 flex items-center justify-center text-[#ff5222] text-[16px] flex-shrink-0" style={{ fontWeight: 800, ...ss04 }}>
                  {selectedApp.merchantName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-[#070808] text-[15px]" style={{ fontWeight: 700, ...ss04 }}>{selectedApp.merchantName}</p>
                  <p className="text-[#b0b3b8] text-[11px]" style={ss04}>{selectedApp.website} &middot; {BIZ_TYPE_LABELS[selectedApp.businessType]}</p>
                </div>
              </div>
              <StatusBadge status={selectedApp.status} />
            </div>

            {/* Detail tabs */}
            <div className="flex gap-5 border-b border-[#f0f1f3]">
              {([
                { key: "overview" as const, label: "Overview" },
                { key: "documents" as const, label: `Documents (${selectedApp.documents.length})` },
                { key: "notes" as const, label: `Notes (${selectedApp.notes.length})` },
                ...(selectedApp.status === "approved" || selectedApp.status === "credentials_sent" ? [{ key: "credentials" as const, label: "Credentials" }] : []),
              ]).map(t => (
                <button
                  key={t.key}
                  onClick={() => setDetailTab(t.key)}
                  className="pb-2 cursor-pointer transition-colors relative"
                  style={ss04}
                >
                  <span className={`text-[12px] ${detailTab === t.key ? "text-[#070808]" : "text-[#84888c]"}`} style={{ fontWeight: detailTab === t.key ? 600 : 500 }}>{t.label}</span>
                  {detailTab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5222] rounded-full" />}
                </button>
              ))}
            </div>

            {/* Overview */}
            {detailTab === "overview" && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Registration No.", value: selectedApp.registrationNumber },
                  { label: "Tax ID (TIN)", value: selectedApp.taxId },
                  { label: "Contact Person", value: selectedApp.contactPerson },
                  { label: "Email", value: selectedApp.contactEmail },
                  { label: "Phone", value: selectedApp.contactPhone },
                  { label: "Plan", value: selectedApp.plan.toUpperCase() },
                  { label: "Est. Monthly GGR", value: selectedApp.estimatedMonthlyGGR },
                  { label: "Target Launch", value: formatDate(selectedApp.targetLaunchDate) },
                  { label: "Submitted", value: formatDateTime(selectedApp.submittedAt) },
                  { label: "Reviewed By", value: selectedApp.reviewedBy || "—" },
                ].map(item => (
                  <div key={item.label} className="p-2.5 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
                    <p className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>{item.label}</p>
                    <p className="text-[#070808] text-[12px] mt-0.5" style={{ fontWeight: 500, ...ss04 }}>{item.value}</p>
                  </div>
                ))}
                <div className="col-span-2 p-2.5 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
                  <p className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>Business Address</p>
                  <p className="text-[#070808] text-[12px] mt-0.5" style={{ fontWeight: 500, ...ss04 }}>{selectedApp.businessAddress}, {selectedApp.city}, {selectedApp.province}, {selectedApp.country}</p>
                </div>
              </div>
            )}

            {/* Documents */}
            {detailTab === "documents" && (
              <div className="space-y-2">
                {selectedApp.documents.map(doc => (
                  <div key={doc.id} className={`p-3 border rounded-xl transition-colors ${doc.status === "verified" ? "bg-emerald-50/30 border-emerald-200" : doc.status === "rejected" ? "bg-red-50/30 border-red-200" : doc.status === "needs_reupload" ? "bg-orange-50/30 border-orange-200" : "bg-white border-[#e5e7eb]"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#f5f6f8] border border-[#e5e7eb] flex items-center justify-center flex-shrink-0">
                          <svg className="size-4 text-[#84888c]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4 2h6l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
                            <path d="M10 2v4h4" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#070808] text-[12px] truncate" style={{ fontWeight: 600, ...ss04 }}>{doc.name}</p>
                          <p className="text-[#b0b3b8] text-[10px]" style={ss04}>{DOC_TYPE_LABELS[doc.type]} &middot; {doc.fileName} &middot; {doc.fileSize}</p>
                          <p className="text-[#b0b3b8] text-[10px]" style={ss04}>Uploaded: {formatDateTime(doc.uploadedAt)}{doc.expiryDate && <> &middot; Expires: <span className={(() => { if (!doc.expiryDate) return ""; const d = Math.ceil((new Date(doc.expiryDate).getTime() - new Date("2026-03-15").getTime()) / 86400000); return d < 0 ? "text-red-500" : d <= 90 ? "text-amber-600" : "text-emerald-600"; })()} style={{ fontWeight: 600 }}>{formatDate(doc.expiryDate)}</span></>}</p>
                          {doc.reviewNote && (
                            <div className="mt-1.5 p-2 bg-[#f9fafb] border border-[#f0f1f3] rounded-lg">
                              <p className="text-[#84888c] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>Review Note: <span className="text-[#070808]">{doc.reviewNote}</span></p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <DocStatusBadge status={doc.status} />
                        {isPlat && (selectedApp.status === "under_review" || selectedApp.status === "needs_info") && doc.status === "pending" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => { setSelectedDoc(doc); handleDocAction("verified"); }}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer transition-colors"
                              style={{ fontWeight: 600 }}
                            >
                              <svg className="size-3 inline" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2"><path d="M3 6l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                            <button
                              onClick={() => { setSelectedDoc(doc); setActionNote(""); setActionModal("reject_doc"); }}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer transition-colors"
                              style={{ fontWeight: 600 }}
                            >
                              <svg className="size-3 inline" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2"><path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Document completeness summary */}
                <div className="p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>Verification Progress</p>
                    <span className="text-[#84888c] text-[10px]" style={ss04}>
                      {selectedApp.documents.filter(d => d.status === "verified").length} of {selectedApp.documents.length} verified
                    </span>
                  </div>
                  <ProgressBar completed={selectedApp.documents.filter(d => d.status === "verified").length} total={selectedApp.documents.length} />
                  {/* Check required docs */}
                  {(() => {
                    const submittedTypes = new Set(selectedApp.documents.map(d => d.type));
                    const missing = REQUIRED_DOC_TYPES.filter(t => !submittedTypes.has(t));
                    if (missing.length === 0) return null;
                    return (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-600 text-[10px]" style={{ fontWeight: 500, ...ss04 }}>Missing required documents: {missing.map(t => DOC_TYPE_LABELS[t]).join(", ")}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Notes */}
            {detailTab === "notes" && (
              <div className="space-y-3">
                {selectedApp.notes.map(note => (
                  <div key={note.id} className={`p-3 border rounded-xl ${note.type === "internal" ? "bg-amber-50/30 border-amber-200" : "bg-white border-[#e5e7eb]"}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>{note.author}</span>
                        <span className="text-[#b0b3b8] text-[9px]" style={ss04}>{note.authorRole}</span>
                        {note.type === "internal" && (
                          <span className="text-[8px] px-1 py-0.5 rounded bg-amber-100 text-amber-600" style={{ fontWeight: 600 }}>INTERNAL</span>
                        )}
                      </div>
                      <span className="text-[#b0b3b8] text-[10px]" style={ss04}>{formatDateTime(note.timestamp)}</span>
                    </div>
                    <p className="text-[#555] text-[12px] leading-relaxed" style={ss04}>{note.text}</p>
                  </div>
                ))}

                {/* Add note */}
                {isPlat && (
                  <div className="p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>Add Note</p>
                      <select value={noteType} onChange={e => setNoteType(e.target.value as any)} className="h-6 px-2 bg-white border border-[#e5e7eb] rounded text-[10px] text-[#070808] outline-none cursor-pointer" style={ss04}>
                        <option value="internal">Internal Only</option>
                        <option value="merchant_visible">Visible to Merchant</option>
                      </select>
                    </div>
                    <textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px] outline-none focus:border-[#ff5222] transition-colors resize-none placeholder-[#b0b3b8]"
                      placeholder="Type your note..."
                      style={{ ...pp, ...ss04 }}
                    />
                    <div className="flex justify-end mt-2">
                      <button onClick={addNote} disabled={!newNote.trim()} className="text-[11px] px-3 py-1.5 rounded-lg bg-[#ff5222] hover:bg-[#e8491f] text-white cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed" style={{ fontWeight: 600, ...ss04 }}>Add Note</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Credentials */}
            {detailTab === "credentials" && (
              <div className="space-y-3">
                {selectedApp.status === "credentials_sent" ? (
                  <>
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="size-5 text-emerald-600" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="8" /><path d="M7 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <p className="text-emerald-600 text-[13px]" style={{ fontWeight: 600, ...ss04 }}>Credentials Sent</p>
                      </div>
                      <p className="text-emerald-700 text-[11px]" style={ss04}>First-login credentials were sent on {formatDateTime(selectedApp.credentialsSentAt || "")}.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
                        <p className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>Credential Email</p>
                        <p className="text-[#070808] text-[12px] mt-0.5" style={{ fontWeight: 600, ...ss04 }}>{selectedApp.credentialEmail}</p>
                      </div>
                      <div className="p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
                        <p className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>Sent At</p>
                        <p className="text-[#070808] text-[12px] mt-0.5" style={{ fontWeight: 600, ...ss04 }}>{formatDateTime(selectedApp.credentialsSentAt || "")}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                      <p className="text-emerald-700 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                        Merchant record auto-created on the platform (status: onboarding). The merchant admin can log into the OMS with the credentials sent and will be prompted to change their password on first login.
                      </p>
                    </div>
                    {selectedApp.generatedPassword && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-amber-600 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
                          Demo only: The auto-generated password was <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">{selectedApp.generatedPassword}</span> — In production, this would be emailed securely and never displayed in the admin panel. The merchant can log in at <span className="font-mono">/oms</span> using this email + password.
                        </p>
                      </div>
                    )}
                  </>
                ) : selectedApp.status === "approved" ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#ff5222]/10 flex items-center justify-center mx-auto mb-3">
                      <svg className="size-6 text-[#ff5222]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-[#070808] text-[14px] mb-1" style={{ fontWeight: 600, ...ss04 }}>Ready to Send Credentials</p>
                    <p className="text-[#84888c] text-[12px] mb-4" style={ss04}>Generate first-login credentials and send to the merchant admin.</p>
                    <button
                      onClick={() => { setCredentialEmail(selectedApp.contactEmail); setActionModal("send_credentials"); }}
                      className="h-9 px-5 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors"
                      style={{ fontWeight: 600, ...ss04 }}
                    >
                      Send First-Login Credentials
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            {/* Action buttons */}
            {isPlat && (
              <OmsButtonRow>
                <OmsBtn variant="secondary" onClick={() => { setShowModal(false); setSelectedApp(null); }}>Close</OmsBtn>
                {selectedApp.status === "submitted" && (
                  <OmsBtn variant="primary" onClick={() => startReview(selectedApp)}>Start Review</OmsBtn>
                )}
                {(selectedApp.status === "under_review" || selectedApp.status === "needs_info") && (
                  <>
                    <OmsBtn variant="success" onClick={() => { setActionNote(""); setActionModal("approve"); }}>Approve</OmsBtn>
                    <OmsBtn variant="danger" onClick={() => { setActionNote(""); setActionModal("reject"); }}>Reject</OmsBtn>
                    <OmsBtn variant="secondary" onClick={() => { setActionNote(""); setActionModal("request_info"); }}>Request Info</OmsBtn>
                  </>
                )}
                {selectedApp.status === "approved" && (
                  <OmsBtn variant="primary" onClick={() => { setCredentialEmail(selectedApp.contactEmail); setActionModal("send_credentials"); }}>Send Credentials</OmsBtn>
                )}
              </OmsButtonRow>
            )}
          </div>
        )}
      </OmsModal>

      {/* ==================== ACTION MODALS ==================== */}

      {/* Approve */}
      <OmsModal open={actionModal === "approve"} onClose={() => setActionModal(null)} title="Approve KYB Application" subtitle={selectedApp?.merchantName}>
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Approve ${selectedApp?.merchantName}'s KYB application? This will allow you to generate and send first-login credentials.`} details={[
          { label: "Merchant", value: selectedApp?.merchantName || "" },
          { label: "Documents Verified", value: `${selectedApp?.documents.filter(d => d.status === "verified").length || 0}/${selectedApp?.documents.length || 0}` },
          { label: "Plan", value: selectedApp?.plan.toUpperCase() || "" },
        ]} />
        <OmsField label="Approval Note (optional)">
          <OmsTextarea value={actionNote} onChange={setActionNote} placeholder="Add an approval note visible to the merchant..." rows={2} />
        </OmsField>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setActionModal(null)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={handleApprove}>Approve Application</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Reject */}
      <OmsModal open={actionModal === "reject"} onClose={() => setActionModal(null)} title="Reject KYB Application" subtitle={selectedApp?.merchantName}>
        <OmsConfirmContent icon="danger" iconColor="#ef4444" iconBg="#ef4444" message={`Reject ${selectedApp?.merchantName}'s KYB application? The merchant will be notified with your reason.`} />
        <OmsField label="Rejection Reason" required>
          <OmsTextarea value={actionNote} onChange={setActionNote} placeholder="Explain why this application is being rejected..." rows={3} />
        </OmsField>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setActionModal(null)}>Cancel</OmsBtn>
          <OmsBtn variant="danger" onClick={handleReject}>Reject Application</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Request Info */}
      <OmsModal open={actionModal === "request_info"} onClose={() => setActionModal(null)} title="Request Additional Information" subtitle={selectedApp?.merchantName}>
        <OmsConfirmContent icon="info" iconColor="#f97316" iconBg="#f97316" message={`Send a request for additional information to ${selectedApp?.merchantName}. The application will be put on hold.`} />
        <OmsField label="What information is needed?" required>
          <OmsTextarea value={actionNote} onChange={setActionNote} placeholder="Describe what documents or information the merchant needs to provide..." rows={3} />
        </OmsField>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setActionModal(null)}>Cancel</OmsBtn>
          <OmsBtn variant="primary" onClick={handleRequestInfo}>Send Request</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Send Credentials */}
      <OmsModal open={actionModal === "send_credentials"} onClose={() => setActionModal(null)} title="Send First-Login Credentials" subtitle={selectedApp?.merchantName}>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-600 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
              This will automatically: (1) create the merchant record on the platform in "onboarding" status, (2) provision a merchant admin account with a first-login password, and (3) send credentials to the email below.
            </p>
          </div>
          <OmsField label="Credential Email" required>
            <OmsInput value={credentialEmail} onChange={setCredentialEmail} placeholder="admin@merchant.com" />
          </OmsField>
          <div className="p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl">
            <p className="text-[#070808] text-[11px] mb-2" style={{ fontWeight: 600, ...ss04 }}>What happens on send:</p>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Merchant Record</span>
                <span className="text-emerald-600 text-[11px]" style={{ fontWeight: 600, ...ss04 }}>Auto-created (onboarding)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Account Role</span>
                <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>Merchant Admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Password Policy</span>
                <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>Auto-generated, must change on first login</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Plan</span>
                <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>{selectedApp?.plan.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Merchant</span>
                <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>{selectedApp?.merchantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b0b3b8] text-[10px]" style={ss04}>Domain</span>
                <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>{selectedApp?.website}</span>
              </div>
            </div>
          </div>
        </div>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setActionModal(null)}>Cancel</OmsBtn>
          <OmsBtn variant="primary" onClick={handleSendCredentials}>Create Merchant &amp; Send Credentials</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Reject Document */}
      <OmsModal open={actionModal === "reject_doc" && !!selectedDoc} onClose={() => { setActionModal(null); setSelectedDoc(null); }} title="Document Review" subtitle={selectedDoc?.name}>
        <div className="space-y-3">
          <OmsField label="Review Note" required>
            <OmsTextarea value={actionNote} onChange={setActionNote} placeholder="Explain the issue with this document..." rows={2} />
          </OmsField>
        </div>
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => { setActionModal(null); setSelectedDoc(null); }}>Cancel</OmsBtn>
          <OmsBtn variant="danger" onClick={() => handleDocAction("rejected")}>Reject Document</OmsBtn>
          <OmsBtn variant="secondary" onClick={() => handleDocAction("needs_reupload")}>Request Reupload</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Non-platform notice */}
      {!isPlat && (
        <div className="p-4 bg-[#f5f6f8] border border-[#e5e7eb] rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="size-4 text-blue-500" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="8" /><path d="M10 7v3m0 3h.01" strokeLinecap="round" /></svg>
            </div>
            <div>
              <p className="text-[#070808] text-[12px]" style={{ fontWeight: 600, ...ss04 }}>Platform Admin Access Required</p>
              <p className="text-[#84888c] text-[11px] mt-0.5" style={ss04}>
                KYB application review and approval requires Platform Admin or Platform Ops access. Contact your ForeGate account manager for access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
