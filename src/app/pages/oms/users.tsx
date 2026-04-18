import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useOmsAuth, isPlatformUser } from "../../components/oms/oms-auth";
import { useTenantConfig, mapAdminToTenantRole } from "../../components/oms/oms-tenant-config";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { logAudit } from "../../components/oms/oms-audit-log";
import { MOCK_USER_RECORDS, type OmsUserRecord, type OmsUserType, type OmsChannel, type OmsSource, type OmsTradeRecord, type OmsAssetInfo } from "../../data/oms-mock";
import { getKycByUserId, type KycStatus } from "../../data/oms-mock";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

/* ==================== TYPE ALIASES ==================== */
type UserType = OmsUserType;
type Channel = OmsChannel;
type Source = OmsSource;
type TradeRecord = OmsTradeRecord;
type AssetInfo = OmsAssetInfo;
type UserRecord = OmsUserRecord;

/* ==================== BADGE COMPONENTS ==================== */
function TypeBadge({ type }: { type: UserType }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full ${type === "creator" ? "bg-purple-50 text-purple-500" : "bg-blue-50 text-blue-500"}`} style={{ fontWeight: 600, ...ss04 }}>
      {type.toUpperCase()}
    </span>
  );
}

function ChannelBadge({ channel }: { channel: Channel }) {
  const map: Record<Channel, string> = {
    FG: "bg-[#ff5222]/10 text-[#ff5222]",
    organic: "bg-emerald-50 text-emerald-600",
    agent: "bg-amber-50 text-amber-600",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[channel]}`} style={{ fontWeight: 600, ...ss04 }}>
      {channel.toUpperCase()}
    </span>
  );
}

/* ==================== KYC STATUS BADGE ==================== */
function KycBadge({ userId }: { userId: string }) {
  const kyc = getKycByUserId(userId);
  if (!kyc) return <span className="text-[10px] text-[#d1d5db]" style={ss04}>--</span>;
  const map: Record<KycStatus, string> = {
    not_started: "bg-gray-100 text-gray-500",
    pending: "bg-amber-50 text-amber-600",
    in_review: "bg-blue-50 text-blue-600",
    verified: "bg-emerald-50 text-emerald-600",
    rejected: "bg-red-50 text-red-500",
    expired: "bg-orange-50 text-orange-600",
  };
  const labels: Record<KycStatus, string> = {
    not_started: "NONE", pending: "PENDING", in_review: "REVIEW",
    verified: "VERIFIED", rejected: "REJECTED", expired: "EXPIRED",
  };
  return <span className={`text-[10px] px-1.5 py-0.5 rounded ${map[kyc.status]}`} style={{ fontWeight: 600, ...ss04 }}>{labels[kyc.status]}</span>;
}

/* ==================== COPY HELPER ==================== */
function copyText(text: string) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showOmsToast("Copied to clipboard", "success");
  } catch { showOmsToast("Copy failed", "error"); }
}

/* ==================== TRADING MODAL ==================== */
function TradingModal({ user, open, onClose }: { user: UserRecord; open: boolean; onClose: () => void }) {
  const [currencyFilter, setCurrencyFilter] = useState<"all" | "FGUSD" | "USDT" | "USDC">("all");
  const [tradePage, setTradePage] = useState(1);
  const [tab, setTab] = useState<"trading" | "settings">("trading");
  const perPage = 5;

  const filteredTrades = user.trades.filter(t => currencyFilter === "all" || t.currency === currencyFilter);
  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / perPage));
  const paged = filteredTrades.slice((tradePage - 1) * perPage, tradePage * perPage);

  // Currency-specific aggregation
  const aggTrades = currencyFilter === "all" ? user.totalTrades : filteredTrades.length;
  const aggVolume = currencyFilter === "all" ? user.totalVolume : filteredTrades.reduce((s, t) => s + t.tradeVolume, 0);
  const aggPNL = currencyFilter === "all" ? user.settledPNL : Math.round(user.settledPNL * (filteredTrades.length / Math.max(1, user.trades.length)));

  return (
    <OmsModal open={open} onClose={onClose} title="Trading Information" subtitle={`${user.nickname} (${user.uid})`} width="max-w-[720px]">
      {/* Tab header */}
      <div className="flex gap-1 mb-4 bg-[#f5f6f8] rounded-lg p-0.5">
        {(["trading", "settings"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 h-8 rounded-md text-[12px] cursor-pointer transition-colors ${tab === t ? "bg-white text-[#070808] shadow-sm" : "text-[#84888c] hover:text-[#070808]"}`}
            style={{ fontWeight: tab === t ? 600 : 500, ...ss04 }}
          >
            {t === "trading" ? "Trading" : "User Settings"}
          </button>
        ))}
      </div>

      {tab === "trading" ? (
        <>
          {/* Currency selector */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>Currency:</span>
            {(["all", "FGUSD", "USDT", "USDC"] as const).map(c => (
              <button
                key={c}
                onClick={() => { setCurrencyFilter(c); setTradePage(1); }}
                className={`h-7 px-3 rounded-lg text-[11px] cursor-pointer transition-colors ${currencyFilter === c ? "bg-[#ff5222] text-white" : "bg-[#f5f6f8] text-[#84888c] hover:bg-[#e5e7eb]"}`}
                style={{ fontWeight: 600, ...ss04 }}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Total Trades", value: aggTrades.toLocaleString() },
              { label: "Total Volume", value: `$${aggVolume.toLocaleString()}` },
              { label: "Settled PNL", value: `${aggPNL >= 0 ? "+" : ""}$${aggPNL.toLocaleString()}`, color: aggPNL >= 0 ? "text-emerald-600" : "text-red-500" },
            ].map(s => (
              <div key={s.label} className="bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl p-3">
                <p className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>{s.label}</p>
                <p className={`text-[18px] ${s.color || "text-[#070808]"}`} style={{ fontWeight: 700, ...ss04 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Trade table */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                    {["Market", "Side", "Outcome", "Qty", "Volume", "Currency", "Time"].map(h => (
                      <th key={h} className="text-[#b0b3b8] text-[10px] px-3 py-2 text-left" style={{ fontWeight: 600, ...ss04 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-[#b0b3b8] text-[12px]" style={ss04}>No trades found</td></tr>
                  ) : paged.map(t => (
                    <tr key={t.id} className="border-b border-[#f0f1f3] last:border-0 hover:bg-[#f9fafb] transition-colors">
                      <td className="px-3 py-2 text-[#070808] text-[11px] max-w-[180px] truncate" style={{ fontWeight: 500, ...ss04 }}>{t.marketName}</td>
                      <td className="px-3 py-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.side === "Buy" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`} style={{ fontWeight: 600, ...ss04 }}>{t.side}</span>
                      </td>
                      <td className="px-3 py-2 text-[#84888c] text-[11px]" style={ss04}>{t.outcome}</td>
                      <td className="px-3 py-2 text-[#070808] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{t.quantity}</td>
                      <td className="px-3 py-2 text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>${t.tradeVolume.toLocaleString()}</td>
                      <td className="px-3 py-2 text-[#84888c] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>{t.currency}</td>
                      <td className="px-3 py-2 text-[#b0b3b8] text-[10px]" style={ss04}>{t.tradeTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-[#e5e7eb] bg-[#f9fafb]">
              <p className="text-[#b0b3b8] text-[10px]" style={ss04}>
                {filteredTrades.length} trade{filteredTrades.length !== 1 ? "s" : ""} total
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setTradePage(p => Math.max(1, p - 1))}
                  disabled={tradePage === 1}
                  className="w-7 h-7 rounded-md text-[11px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[#84888c] hover:bg-[#e5e7eb] transition-colors"
                  style={{ fontWeight: 600 }}
                >&#8249;</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setTradePage(p)}
                    className={`w-7 h-7 rounded-md text-[11px] cursor-pointer transition-colors ${p === tradePage ? "bg-[#ff5222] text-white" : "text-[#84888c] hover:bg-[#e5e7eb]"}`}
                    style={{ fontWeight: 600, ...ss04 }}
                  >{p}</button>
                ))}
                <button
                  onClick={() => setTradePage(p => Math.min(totalPages, p + 1))}
                  disabled={tradePage === totalPages}
                  className="w-7 h-7 rounded-md text-[11px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-[#84888c] hover:bg-[#e5e7eb] transition-colors"
                  style={{ fontWeight: 600 }}
                >&#8250;</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* User Settings tab -- read only */
        <div className="space-y-3">
          {[
            { label: "Language", value: user.language },
            { label: "Timezone", value: user.timezone },
            { label: "Two-Factor Auth", value: user.twoFactorEnabled ? "Enabled" : "Disabled" },
            { label: "Email Notifications", value: user.emailNotifications ? "Enabled" : "Disabled" },
            { label: "Wallet Address", value: user.walletAddress },
            { label: "Email", value: user.email },
            { label: "Nickname", value: user.nickname },
            { label: "User Type", value: user.userType },
            { label: "Channel", value: user.channel },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-[#f0f1f3] last:border-0">
              <span className="text-[#b0b3b8] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{item.label}</span>
              <span className="text-[#070808] text-[11px] text-right" style={{ fontWeight: 500, ...ss04 }}>{item.value}</span>
            </div>
          ))}
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-600 text-[11px]" style={{ fontWeight: 500, ...ss04 }}>
              Warning: User settings are read-only. Changes must be made by the user.
            </p>
          </div>
        </div>
      )}
    </OmsModal>
  );
}

/* ==================== ASSET MODAL ==================== */
function AssetModal({ user, open, onClose, canModify }: { user: UserRecord; open: boolean; onClose: () => void; canModify: (key: string) => boolean }) {
  const [assetCurrency, setAssetCurrency] = useState<"FGUSD" | "USDT" | "USDC">("FGUSD");
  const a = user.asset;

  return (
    <OmsModal open={open} onClose={onClose} title="Asset Information" subtitle={`${user.nickname} (${user.uid})`} width="max-w-[640px]">
      {/* Currency tag selector */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>Display in:</span>
        {(["FGUSD", "USDT", "USDC"] as const).map(c => (
          <button
            key={c}
            onClick={() => setAssetCurrency(c)}
            className={`h-7 px-3 rounded-lg text-[11px] cursor-pointer transition-colors ${assetCurrency === c ? "bg-[#ff5222] text-white" : "bg-[#f5f6f8] text-[#84888c] hover:bg-[#e5e7eb]"}`}
            style={{ fontWeight: 600, ...ss04 }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Asset summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total Asset", value: a.totalAsset, desc: "Sum of all assets" },
          { label: "Available", value: a.available, desc: "Available balance" },
          { label: "Position Value", value: a.positionValue, desc: "Open positions value" },
          { label: "Locked Balance", value: a.lockedBalance, desc: "Open orders + Pending + Challenge" },
        ].map(s => (
          <div key={s.label} className="bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl p-3" title={s.desc}>
            <p className="text-[#b0b3b8] text-[9px]" style={{ fontWeight: 500, ...ss04 }}>{s.label}</p>
            <p className="text-[#070808] text-[16px]" style={{ fontWeight: 700, ...ss04 }}>${s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Controls -- view only for merchant/agent */}
      <div className="mb-4">
        <h4 className="text-[#070808] text-[12px] mb-3" style={{ fontWeight: 600, ...ss04 }}>Account Controls</h4>
        <div className="bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl p-4 space-y-3">
          {/* Toggle switches -- editable only when canModify resolves true */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Suspend Trading", value: a.suspendTrading, policyKey: "suspend_trading" },
              { label: "Suspend Deposit", value: a.suspendDeposit, policyKey: "suspend_deposit" },
              { label: "Suspend Withdraw", value: a.suspendWithdraw, policyKey: "suspend_withdraw" },
            ].map(ctrl => {
              const editable = canModify(ctrl.policyKey);
              return (
                <div key={ctrl.label} className={`flex items-center justify-between bg-white border rounded-lg px-3 py-2 ${editable ? "border-[#ff5222]/30" : "border-[#e5e7eb]"}`}>
                  <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{ctrl.label}</span>
                  <div className="flex items-center gap-1.5">
                    {editable && <span className="text-[8px] text-[#ff5222]" style={{ fontWeight: 600, ...ss04 }}>EDIT</span>}
                    <div className={`w-8 h-[18px] rounded-full flex items-center px-0.5 transition-colors ${ctrl.value ? "bg-red-400 justify-end" : "bg-[#d1d5db] justify-start"} ${editable ? "cursor-pointer" : ""}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Numeric limits */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Withdraw Fee (%)", value: a.withdrawFee },
              { label: "Daily Withdraw Limit", value: `$${a.dailyWithdrawLimit.toLocaleString()}` },
              { label: "Single Withdraw Min", value: `$${a.singleWithdrawMin.toLocaleString()}` },
              { label: "Single Withdraw Max", value: `$${a.singleWithdrawMax.toLocaleString()}` },
              { label: "Annual Withdrawal", value: `$${a.totalAnnualWithdrawal.toLocaleString()}` },
              { label: "Whitelist", value: a.whitelist ? "Yes" : "No" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-[#f0f1f3] last:border-0">
                <span className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>{item.label}</span>
                <span className="text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>{typeof item.value === "number" ? item.value : item.value}</span>
              </div>
            ))}
          </div>

          <div className={`mt-2 p-2.5 rounded-lg border ${canModify("suspend_trading") ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"}`}>
            <p className={`text-[10px] ${canModify("suspend_trading") ? "text-emerald-600" : "text-blue-600"}`} style={{ fontWeight: 500, ...ss04 }}>
              {canModify("suspend_trading")
                ? "You have permission to modify account controls (via PaaS Config delegation)."
                : "Only FG official admins can modify account controls. Merchant/Agent view is read-only."}
            </p>
          </div>
        </div>
      </div>

      {/* On-chain transactions */}
      {a.transactions.length > 0 && (
        <div>
          <h4 className="text-[#070808] text-[12px] mb-2" style={{ fontWeight: 600, ...ss04 }}>Recent Transactions</h4>
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                  {["Tx Hash", "Type", "Amount", "Chain", "Time"].map(h => (
                    <th key={h} className="text-[#b0b3b8] text-[10px] px-3 py-2 text-left" style={{ fontWeight: 600, ...ss04 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {a.transactions.map(tx => (
                  <tr key={tx.hash} className="border-b border-[#f0f1f3] last:border-0 hover:bg-[#f9fafb] transition-colors">
                    <td className="px-3 py-2">
                      <button
                        onClick={() => {
                          const url = tx.chain === "Ethereum"
                            ? `https://etherscan.io/tx/${tx.hash}`
                            : `https://polygonscan.com/tx/${tx.hash}`;
                          window.open(url, "_blank");
                        }}
                        className="text-[#ff5222] text-[11px] cursor-pointer hover:underline"
                        style={{ fontWeight: 500, ...ss04 }}
                      >
                        {tx.hash}
                        <svg className="inline-block size-3 ml-1 -mt-0.5" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 8L8 4M8 4H5M8 4v3" /></svg>
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${tx.type === "Deposit" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`} style={{ fontWeight: 600, ...ss04 }}>{tx.type}</span>
                    </td>
                    <td className="px-3 py-2 text-[#070808] text-[11px]" style={{ fontWeight: 600, ...ss04 }}>${tx.amount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-[#84888c] text-[10px]" style={ss04}>{tx.chain}</td>
                    <td className="px-3 py-2 text-[#b0b3b8] text-[10px]" style={ss04}>{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </OmsModal>
  );
}

/* ==================== ROLE MODAL ==================== */
function RoleModal({ user, open, onClose, onSave, canChangeRole = true, canEditContact = true }: { user: UserRecord; open: boolean; onClose: () => void; onSave: (uid: string, role: UserType, social: string, phone: string, telegram: string, whatsapp: string) => void; canChangeRole?: boolean; canEditContact?: boolean }) {
  const [role, setRole] = useState<UserType>(user.userType);
  const [social, setSocial] = useState(user.socialChannel);
  const [phone, setPhone] = useState(user.contactPhone);
  const [telegram, setTelegram] = useState(user.contactTelegram);
  const [whatsapp, setWhatsApp] = useState(user.contactWhatsApp);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave(user.id, role, social, phone, telegram, whatsapp);
      setSaving(false);
      onClose();
    }, 600);
  };

  return (
    <OmsModal open={open} onClose={onClose} title="User Role Management" subtitle={`${user.nickname} (${user.uid})`}>
      <div className="mb-4">
        <div className="flex items-center gap-3 p-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl mb-4">
          <div className="w-10 h-10 rounded-full bg-[#f0f1f3] flex items-center justify-center text-[#ff5222] text-[13px]" style={{ fontWeight: 700, ...ss04 }}>
            {user.nickname.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-[#070808] text-[13px]" style={{ fontWeight: 600, ...ss04 }}>{user.nickname}</p>
            <p className="text-[#b0b3b8] text-[11px]" style={ss04}>{user.email} &middot; {user.walletAddress}</p>
          </div>
        </div>
      </div>

      <OmsField label="Role" required>
        <div className="flex gap-2">
          {(["user", "creator"] as const).map(r => (
            <button
              key={r}
              onClick={() => canChangeRole && setRole(r)}
              disabled={!canChangeRole}
              className={`flex-1 h-10 rounded-xl text-[12px] transition-all border ${!canChangeRole ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${role === r
                ? r === "creator"
                  ? "bg-purple-50 border-purple-300 text-purple-600"
                  : "bg-blue-50 border-blue-300 text-blue-600"
                : "bg-white border-[#e5e7eb] text-[#84888c] hover:border-[#b0b3b8]"
                }`}
              style={{ fontWeight: 600, ...ss04 }}
            >
              {r === "creator" ? "Creator" : "User"}
            </button>
          ))}
        </div>
        {!canChangeRole && <p className="text-[#b0b3b8] text-[10px] mt-1.5" style={ss04}>Role change requires elevated permissions (modify_role).</p>}
      </OmsField>

      <div className="mt-4 pt-3 border-t border-[#f0f1f3]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>Contact Details (optional)</p>
          {!canEditContact && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f0f1f3] text-[#b0b3b8]" style={{ fontWeight: 600, ...ss04 }}>READ-ONLY</span>}
        </div>

        <OmsField label="Social Channel">
          {canEditContact ? (
            <OmsSelect value={social} onChange={setSocial} options={[{ value: "", label: "-- Select --" },{ value: "Twitter", label: "Twitter / X" },{ value: "Facebook", label: "Facebook" },{ value: "YouTube", label: "YouTube" },{ value: "Twitch", label: "Twitch" },{ value: "TikTok", label: "TikTok" },{ value: "Instagram", label: "Instagram" }]} />
          ) : (
            <div className="h-9 flex items-center px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px]" style={{ ...pp, ...ss04 }}>{social || "--"}</div>
          )}
        </OmsField>

        <OmsField label="Phone Number">
          {canEditContact ? <OmsInput value={phone} onChange={setPhone} placeholder="+63 9XX XXX XXXX" /> : <div className="h-9 flex items-center px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px]" style={{ ...pp, ...ss04 }}>{phone || "--"}</div>}
        </OmsField>

        <OmsField label="Telegram">
          {canEditContact ? <OmsInput value={telegram} onChange={setTelegram} placeholder="@username" /> : <div className="h-9 flex items-center px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px]" style={{ ...pp, ...ss04 }}>{telegram || "--"}</div>}
        </OmsField>

        <OmsField label="WhatsApp">
          {canEditContact ? <OmsInput value={whatsapp} onChange={setWhatsApp} placeholder="+63 9XX XXX XXXX" /> : <div className="h-9 flex items-center px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-lg text-[#070808] text-[12px]" style={{ ...pp, ...ss04 }}>{whatsapp || "--"}</div>}
        </OmsField>
      </div>

      <OmsButtonRow>
        <OmsBtn variant="secondary" onClick={onClose}>Cancel</OmsBtn>
        {(canChangeRole || canEditContact) ? (
          <OmsBtn variant="primary" onClick={handleSave} disabled={saving} fullWidth>{saving ? "Saving..." : "Save Changes"}</OmsBtn>
        ) : (
          <OmsBtn variant="secondary" onClick={onClose} fullWidth>Close (View Only)</OmsBtn>
        )}
      </OmsButtonRow>
    </OmsModal>
  );
}

/* ==================== COLUMN DEFINITION ==================== */
interface ColumnDef {
  key: string;       // matches field visibility key in PaaS Config
  header: string;
  render: (u: UserRecord) => React.ReactNode;
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: "wallet_address", header: "User Address", render: u => <button onClick={() => copyText(u.walletAddress)} className="text-[#ff5222] text-[11px] cursor-pointer hover:underline font-mono" style={{ fontWeight: 500 }}>{u.walletAddress}</button> },
  { key: "uid", header: "UID", render: u => <span className="text-[#84888c] text-[11px] font-mono" style={ss04}>{u.uid}</span> },
  { key: "nickname", header: "Nickname", render: u => <span className="text-[#070808] text-[12px]" style={{ fontWeight: 500, ...ss04 }}>{u.nickname}</span> },
  { key: "email", header: "Email", render: u => <span className="text-[#84888c] text-[11px]" style={ss04}>{u.email}</span> },
  { key: "user_type", header: "Type", render: u => <TypeBadge type={u.userType} /> },
  { key: "channel", header: "Channel", render: u => <ChannelBadge channel={u.channel} /> },
  { key: "recent_ip", header: "Recent IP", render: u => <span className="text-[#b0b3b8] text-[10px] font-mono">{u.recentIP}</span> },
  { key: "recent_geo", header: "Geo", render: u => <span className="text-[#84888c] text-[11px]" style={ss04}>{u.recentGeo}</span> },
  { key: "last_login", header: "Last Login", render: u => <span className="text-[#b0b3b8] text-[10px]" style={ss04}>{u.lastLoginTime}</span> },
  { key: "source", header: "Source", render: u => u.source === "agent" ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600" style={{ fontWeight: 600, ...ss04 }}>Agent</span> : <span className="text-[#d1d5db] text-[10px]" style={ss04}>--</span> },
  { key: "agent_name", header: "Agent", render: u => <span className="text-[#84888c] text-[11px]" style={{ fontWeight: 500, ...ss04 }}>{u.agentName || "--"}</span> },
  { key: "kyc_status", header: "KYC Status", render: u => <KycBadge userId={u.id} /> },
];

/* ==================== MAIN PAGE ==================== */
export default function OmsUsers() {
  const [users, setUsers] = useState(MOCK_USER_RECORDS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<UserType | "all">("all");
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");
  const [kycFilter, setKycFilter] = useState<KycStatus | "no_kyc" | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // PaaS Config integration
  const { admin } = useOmsAuth();
  const { canSeeField, hasPermission, canModifyControl } = useTenantConfig();
  const { t } = useI18n();
  const role = admin?.role || "merchant_support";
  const isPlat = admin ? isPlatformUser(admin.role) : false;

  // Dynamic column visibility from PaaS Config
  const visibleColumns = ALL_COLUMNS.filter(col => canSeeField(col.key, role));

  // CTA permissions
  const canViewTrading = hasPermission("view_trading", role);
  const canViewAssets = hasPermission("view_assets", role);
  const canViewRole = hasPermission("view_role", role);
  const canChangeRole = hasPermission("modify_role", role);
  const canEditContact = hasPermission("modify_contact", role);
  const canExport = hasPermission("export_users", role);
  const hasAnyCTA = canViewTrading || canViewAssets || canViewRole || true; // always show KYC link
  const navigate = useNavigate();

  // Modal states
  const [tradingUser, setTradingUser] = useState<UserRecord | null>(null);
  const [assetUser, setAssetUser] = useState<UserRecord | null>(null);
  const [roleUser, setRoleUser] = useState<UserRecord | null>(null);

  const filtered = users.filter(u => {
    if (search) {
      const q = search.toLowerCase();
      if (!u.nickname.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.uid.includes(q) && !u.walletAddress.toLowerCase().includes(q)) return false;
    }
    if (typeFilter !== "all" && u.userType !== typeFilter) return false;
    if (channelFilter !== "all" && u.channel !== channelFilter) return false;
    if (kycFilter !== "all") {
      const kyc = getKycByUserId(u.id);
      if (!kyc) return kycFilter === "no_kyc";
      return kyc.status === kycFilter;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleRoleSave = (uid: string, role: UserType, social: string, phone: string, telegram: string, whatsapp: string) => {
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, userType: role, socialChannel: social, contactPhone: phone, contactTelegram: telegram, contactWhatsApp: whatsapp } : u));
    showOmsToast(`Role updated to ${role} for ${uid}`, "success");
    if (admin) {
      logAudit({ adminEmail: admin.email, adminRole: admin.role, action: "user_role_change", target: uid, detail: `Role updated to ${role}` });
    }
  };

  const stats = {
    total: users.length,
    creators: users.filter(u => u.userType === "creator").length,
    usersOnly: users.filter(u => u.userType === "user").length,
    fg: users.filter(u => u.channel === "FG").length,
    organic: users.filter(u => u.channel === "organic").length,
    agent: users.filter(u => u.channel === "agent").length,
  };

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: t("users.total_users"), value: stats.total.toLocaleString(), color: "text-[#070808]" },
          { label: t("creators.creators", "Creators"), value: stats.creators.toLocaleString(), color: "text-purple-500" },
          { label: t("common.users", "Users"), value: stats.usersOnly.toLocaleString(), color: "text-blue-500" },
          { label: "FG Channel", value: stats.fg.toLocaleString(), color: "text-[#ff5222]" },
          { label: "Organic", value: stats.organic.toLocaleString(), color: "text-emerald-600" },
          { label: "Agent", value: stats.agent.toLocaleString(), color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#e5e7eb] rounded-2xl p-3">
            <p className="text-[#b0b3b8] text-[10px]" style={{ fontWeight: 500, ...ss04 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700, ...ss04 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl">
        <div className="p-4 border-b border-[#f0f1f3] flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl px-3 h-9 flex-1 sm:max-w-[320px]">
            <svg className="size-3.5 text-[#b0b3b8] flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M14 14l-3-3" /></svg>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent text-[#070808] text-[12px] outline-none flex-1 placeholder-[#b0b3b8]"
              placeholder="Search by nickname, email, UID, wallet..."
              style={{ ...pp, ...ss04 }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as any); setPage(1); }}
              className="h-9 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#84888c] text-[11px] outline-none cursor-pointer"
              style={{ ...pp, ...ss04 }}
            >
              <option value="all">Type: All</option>
              <option value="user">User</option>
              <option value="creator">Creator</option>
            </select>
            <select
              value={channelFilter}
              onChange={e => { setChannelFilter(e.target.value as any); setPage(1); }}
              className="h-9 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#84888c] text-[11px] outline-none cursor-pointer"
              style={{ ...pp, ...ss04 }}
            >
              <option value="all">Channel: All</option>
              <option value="FG">FG</option>
              <option value="organic">Organic</option>
              <option value="agent">Agent</option>
            </select>
            <select
              value={kycFilter}
              onChange={e => { setKycFilter(e.target.value as any); setPage(1); }}
              className="h-9 px-3 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#84888c] text-[11px] outline-none cursor-pointer"
              style={{ ...pp, ...ss04 }}
            >
              <option value="all">KYC Status: All</option>
              <option value="not_started">None</option>
              <option value="pending">Pending</option>
              <option value="in_review">Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="no_kyc">No KYC</option>
            </select>
            {canExport && (
              <button onClick={() => { showOmsToast("Exporting user data...", "info"); if (admin) { logAudit({ adminEmail: admin.email, adminRole: admin.role, action: "admin_export_csv", target: "users", detail: `Exported ${filtered.length} users` }); } }} className="h-9 px-4 bg-[#f5f6f8] border border-[#e5e7eb] rounded-xl text-[#84888c] text-[11px] cursor-pointer hover:bg-[#e5e7eb] transition-colors" style={{ fontWeight: 600, ...pp, ...ss04 }}>Export CSV</button>
            )}
          </div>
        </div>

        {/* Config-aware indicator for non-platform users */}
        {!isPlat && (
          <div className="px-4 py-2 border-b border-[#f0f1f3] bg-[#f9fafb]">
            <p className="text-[#b0b3b8] text-[10px]" style={ss04}>
              Showing {visibleColumns.length}/{ALL_COLUMNS.length} columns &middot; CTAs: {[canViewTrading && "Trading", canViewAssets && "Asset", canViewRole && "Role"].filter(Boolean).join(", ") || "None"} &middot; Config source: PaaS Admin
            </p>
          </div>
        )}

        {/* Table -- dynamic columns from PaaS Config */}
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: Math.max(600, visibleColumns.length * 100 + (hasAnyCTA ? 160 : 0)) }}>
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                {visibleColumns.map(col => (
                  <th key={col.key} className="text-[#b0b3b8] text-[10px] px-3 py-2.5 text-left whitespace-nowrap" style={{ fontWeight: 600, ...ss04 }}>{col.header}</th>
                ))}
                {hasAnyCTA && <th className="text-[#b0b3b8] text-[10px] px-3 py-2.5 text-left whitespace-nowrap" style={{ fontWeight: 600, ...ss04 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={visibleColumns.length + (hasAnyCTA ? 1 : 0)} className="text-center py-12 text-[#b0b3b8] text-[13px]" style={ss04}>No users found</td></tr>
              ) : paged.map(u => (
                <tr key={u.id} className="border-b border-[#f0f1f3] last:border-0 hover:bg-[#f9fafb] transition-colors">
                  {visibleColumns.map(col => (
                    <td key={col.key} className="px-3 py-2.5">{col.render(u)}</td>
                  ))}
                  {hasAnyCTA && (
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1.5">
                        {canViewTrading && <button onClick={() => setTradingUser(u)} className="h-6 px-2 rounded-md text-[10px] cursor-pointer bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" style={{ fontWeight: 600, ...ss04 }}>Trading</button>}
                        {canViewAssets && <button onClick={() => setAssetUser(u)} className="h-6 px-2 rounded-md text-[10px] cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" style={{ fontWeight: 600, ...ss04 }}>Asset</button>}
                        {canViewRole && <button onClick={() => setRoleUser(u)} className="h-6 px-2 rounded-md text-[10px] cursor-pointer bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors" style={{ fontWeight: 600, ...ss04 }}>Role</button>}
                        {getKycByUserId(u.id) && <button onClick={() => navigate("/oms/kyc")} className="h-6 px-2 rounded-md text-[10px] cursor-pointer bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors" style={{ fontWeight: 600, ...ss04 }}>KYC</button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <OmsPagination page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} totalItems={filtered.length} />
      </div>

      {/* Modals */}
      {tradingUser && <TradingModal user={tradingUser} open={!!tradingUser} onClose={() => setTradingUser(null)} />}
      {assetUser && <AssetModal user={assetUser} open={!!assetUser} onClose={() => setAssetUser(null)} canModify={(key) => canModifyControl(key, role)} />}
      {roleUser && <RoleModal user={roleUser} open={!!roleUser} onClose={() => setRoleUser(null)} onSave={handleRoleSave} canChangeRole={canChangeRole} canEditContact={canEditContact} />}
    </div>
  );
}