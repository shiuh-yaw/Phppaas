import { useState } from "react";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsTextarea, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useI18n } from "../../components/oms/oms-i18n";
import { MOCK_WALLETS as INITIAL_WALLETS, MOCK_WALLET_TX, type OmsWallet, type OmsWalletTx } from "../../data/oms-mock";
import { OmsPagination, paginate } from "../../components/oms/oms-pagination";
import { downloadCSV } from "../../components/oms/oms-csv-export";
import { useRBAC, RBACGuard } from "../../components/oms/oms-rbac";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

type UserWallet = OmsWallet;
type WalletTx = OmsWalletTx;

function WalletStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { active: "bg-emerald-500/15 text-emerald-400", frozen: "bg-blue-500/15 text-blue-400", restricted: "bg-red-500/15 text-red-400" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || ""}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

function TxTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    credit: "bg-emerald-500/15 text-emerald-400",
    debit: "bg-red-500/15 text-red-400",
    deposit: "bg-blue-500/15 text-blue-400",
    withdrawal: "bg-amber-500/15 text-amber-400",
    bet_win: "bg-emerald-500/15 text-emerald-400",
    bet_loss: "bg-red-500/15 text-red-400",
    promo: "bg-purple-500/15 text-purple-400",
    refund: "bg-cyan-500/15 text-cyan-400",
    correction: "bg-gray-500/15 text-gray-400",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[type] || ""}`} style={{ fontWeight: 600 }}>{type.replace("_", " ").toUpperCase()}</span>;
}

export default function OmsWallet() {
  const [search, setSearch] = useState("");
  const [wallets, setWallets] = useState(INITIAL_WALLETS);
  const [selectedUser, setSelectedUser] = useState<UserWallet | null>(null);
  const [modalType, setModalType] = useState<"portfolio" | "credit" | "debit" | "freeze" | "unfreeze" | null>(null);
  const { hasPermission, canSeeField, canModifyControl } = useTenantConfig();
  const { admin } = useOmsAuth();
  const { t } = useI18n();
  const role = admin?.role || "merchant_ops";
  // Tenant-config gating
  const canViewAssets = hasPermission("view_assets", role);
  const canSeeBalance = canSeeField("total_asset", role);
  const canSeePnl = canSeeField("settled_pnl", role);
  const canSuspendTrading = canModifyControl("suspend_trading", role);

  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustType, setAdjustType] = useState("compensation");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = wallets.filter(w =>
    !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.email.toLowerCase().includes(search.toLowerCase()) || w.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const totalHold = wallets.reduce((s, w) => s + w.holdBalance, 0);

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t("wallet.total_balances"), value: `₱${(totalBalance / 1000).toFixed(0)}K`, color: "text-white" },
          { label: t("wallet.on_hold"), value: `₱${(totalHold / 1000).toFixed(0)}K`, color: "text-amber-400" },
          { label: t("wallet.frozen_accounts"), value: String(wallets.filter(w => w.status === "frozen").length), color: "text-blue-400" },
          { label: t("wallet.restricted_accounts"), value: String(wallets.filter(w => w.status === "restricted").length), color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] rounded-lg px-3 h-9 max-w-[320px]">
        <svg className="size-3.5 text-[#6b7280] flex-shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M14 14l-3-3" /></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-white text-[12px] outline-none flex-1 placeholder-[#4b5563]" placeholder={t("wallet.search_users")} />
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#1f2937] text-[#6b7280] text-[10px]" style={{ fontWeight: 600 }}>
                <th className="px-4 py-3">{t("common.user")}</th>
                {canSeeBalance && <th className="px-3 py-3">{t("wallet.balance")}</th>}
                {canSeeBalance && <th className="px-3 py-3">{t("wallet.hold")}</th>}
                {canSeePnl && <th className="px-3 py-3">{t("wallet.pnl")}</th>}
                <th className="px-3 py-3">{t("wallet.active_bets")}</th>
                <th className="px-3 py-3">{t("common.status")}</th>
                {canViewAssets && <th className="px-3 py-3">{t("common.actions")}</th>}
              </tr>
            </thead>
            <tbody>
              {paginate(filtered, page, pageSize).map(w => (
                <tr key={w.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white text-[12px]" style={{ fontWeight: 500 }}>{w.name}</p>
                    <p className="text-[#6b7280] text-[10px]">{w.id} · {w.email}</p>
                  </td>
                  {canSeeBalance && <td className="px-3 py-3 text-white" style={{ fontWeight: 600 }}>₱{w.balance.toLocaleString()}</td>}
                  {canSeeBalance && <td className="px-3 py-3 text-amber-400">₱{w.holdBalance.toLocaleString()}</td>}
                  {canSeePnl && (
                  <td className={`px-3 py-3 ${w.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`} style={{ fontWeight: 600 }}>
                    {w.pnl >= 0 ? "+" : ""}₱{w.pnl.toLocaleString()}
                  </td>
                  )}
                  <td className="px-3 py-3 text-[#9ca3af]">{w.activeBets}</td>
                  <td className="px-3 py-3"><WalletStatusBadge status={w.status} /></td>
                  {canViewAssets && (
                  <td className="px-3 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => { setSelectedUser(w); setModalType("portfolio"); }} className="text-[10px] text-[#9ca3af] hover:text-white px-2 py-1 rounded bg-[#1f2937] hover:bg-[#374151] cursor-pointer transition-colors" style={{ fontWeight: 500 }}>{t("wallet.portfolio")}</button>
                      <button onClick={() => { setSelectedUser(w); setAdjustAmount(""); setAdjustReason(""); setAdjustType("compensation"); setModalType("credit"); }} className="text-[10px] text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>{t("wallet.credit")}</button>
                      <button onClick={() => { setSelectedUser(w); setAdjustAmount(""); setAdjustReason(""); setAdjustType("correction"); setModalType("debit"); }} className="text-[10px] text-red-400 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>{t("wallet.debit")}</button>
                      {canSuspendTrading && (
                        w.status === "active" ? (
                          <button onClick={() => { setSelectedUser(w); setModalType("freeze"); }} className="text-[10px] text-blue-400 px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>{t("wallet.freeze")}</button>
                        ) : (
                          <button onClick={() => { setSelectedUser(w); setModalType("unfreeze"); }} className="text-[10px] text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer transition-colors" style={{ fontWeight: 500 }}>{t("wallet.unfreeze")}</button>
                        )
                      )}
                    </div>
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <OmsPagination page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} totalItems={filtered.length} />
      </div>

      {/* Portfolio Modal */}
      <OmsModal open={modalType === "portfolio" && !!selectedUser} onClose={() => setModalType(null)} title={t("wallet.user_portfolio")} subtitle={`${selectedUser?.name} (${selectedUser?.id})`} width="max-w-[680px]">
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Balance", value: `₱${selectedUser.balance.toLocaleString()}` },
                { label: "On Hold", value: `₱${selectedUser.holdBalance.toLocaleString()}` },
                { label: "Total Deposits", value: `₱${selectedUser.totalDeposits.toLocaleString()}` },
                { label: "Total Withdrawals", value: `₱${selectedUser.totalWithdrawals.toLocaleString()}` },
                { label: "Total Winnings", value: `₱${selectedUser.totalWinnings.toLocaleString()}` },
                { label: "Total Losses", value: `₱${selectedUser.totalLosses.toLocaleString()}` },
              ].map(d => (
                <div key={d.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{d.label}</p>
                  <p className="text-white text-[13px]" style={{ fontWeight: 600 }}>{d.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
              <p className="text-[#6b7280] text-[10px] mb-1" style={{ fontWeight: 500 }}>Net P&L</p>
              <p className={`text-[22px] ${selectedUser.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`} style={{ fontWeight: 700 }}>
                {selectedUser.pnl >= 0 ? "+" : ""}₱{selectedUser.pnl.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-white text-[13px] mb-2" style={{ fontWeight: 600 }}>{t("wallet.recent_transactions")}</p>
              <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                {MOCK_WALLET_TX.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-2 px-3 bg-[#0a0e1a] border border-[#1f2937] rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <TxTypeBadge type={tx.type} />
                      <div>
                        <p className="text-white text-[11px]" style={{ fontWeight: 500 }}>{tx.reason}</p>
                        <p className="text-[#4b5563] text-[10px]">{tx.time} · by {tx.admin}</p>
                      </div>
                    </div>
                    <span className={`text-[12px] ${tx.amount >= 0 ? "text-emerald-400" : "text-red-400"}`} style={{ fontWeight: 600 }}>
                      {tx.amount >= 0 ? "+" : ""}₱{Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>{t("common.close")}</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* Credit Modal */}
      <OmsModal open={modalType === "credit" && !!selectedUser} onClose={() => setModalType(null)} title={t("wallet.credit_wallet")} subtitle={`${selectedUser?.name} — Current: ₱${selectedUser?.balance.toLocaleString()}`}>
        <div className="space-y-3">
          <OmsField label="Credit Type" required>
            <OmsSelect value={adjustType} onChange={setAdjustType} options={[
              { value: "compensation", label: "Customer Compensation" },
              { value: "promo", label: "Promotional Credit" },
              { value: "refund", label: "Bet Refund" },
              { value: "correction", label: "Balance Correction" },
              { value: "bonus", label: "Manual Bonus" },
            ]} />
          </OmsField>
          <OmsField label="Amount (₱)" required>
            <OmsInput value={adjustAmount} onChange={setAdjustAmount} placeholder="e.g. 500" type="number" />
          </OmsField>
          <OmsField label="Reason / Notes" required>
            <OmsTextarea value={adjustReason} onChange={setAdjustReason} placeholder="Explain the reason for this credit..." />
          </OmsField>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>{t("common.cancel")}</OmsBtn>
            <OmsBtn variant="success" onClick={() => {
              const amt = Number(adjustAmount);
              if (!amt || !adjustReason) { showOmsToast("Fill all required fields", "error"); return; }
              setWallets(prev => prev.map(w => w.id === selectedUser!.id ? { ...w, balance: w.balance + amt } : w));
              logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "wallet_credit", target: `${selectedUser!.name} (${selectedUser!.id})`, detail: `Credited ₱${amt.toLocaleString()} — ${adjustType}: ${adjustReason}` });
              setModalType(null);
              showOmsToast(`Credited ₱${amt.toLocaleString()} to ${selectedUser!.name}`);
            }}>{ t("wallet.confirm_credit")}</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Debit Modal */}
      <OmsModal open={modalType === "debit" && !!selectedUser} onClose={() => setModalType(null)} title={t("wallet.debit_wallet")} subtitle={`${selectedUser?.name} — Current: ₱${selectedUser?.balance.toLocaleString()}`}>
        <div className="space-y-3">
          <OmsField label="Debit Type" required>
            <OmsSelect value={adjustType} onChange={setAdjustType} options={[
              { value: "correction", label: "Balance Correction" },
              { value: "penalty", label: "Rule Violation Penalty" },
              { value: "chargeback", label: "Payment Chargeback" },
              { value: "fraud", label: "Fraud Recovery" },
            ]} />
          </OmsField>
          <OmsField label="Amount (₱)" required>
            <OmsInput value={adjustAmount} onChange={setAdjustAmount} placeholder="e.g. 200" type="number" />
          </OmsField>
          <OmsField label="Reason / Notes" required>
            <OmsTextarea value={adjustReason} onChange={setAdjustReason} placeholder="Explain the reason for this debit..." />
          </OmsField>
          {Number(adjustAmount) > (selectedUser?.balance || 0) && (
            <p className="text-red-400 text-[11px]">Warning: Debit amount exceeds user balance. This will create a negative balance.</p>
          )}
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>{t("common.cancel")}</OmsBtn>
            <OmsBtn variant="danger" onClick={() => {
              const amt = Number(adjustAmount);
              if (!amt || !adjustReason) { showOmsToast("Fill all required fields", "error"); return; }
              setWallets(prev => prev.map(w => w.id === selectedUser!.id ? { ...w, balance: w.balance - amt } : w));
              logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "wallet_debit", target: `${selectedUser!.name} (${selectedUser!.id})`, detail: `Debited ₱${amt.toLocaleString()} — ${adjustType}: ${adjustReason}` });
              setModalType(null);
              showOmsToast(`Debited ₱${amt.toLocaleString()} from ${selectedUser!.name}`);
            }}>{t("wallet.confirm_debit")}</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Freeze Modal */}
      <OmsModal open={modalType === "freeze" && !!selectedUser} onClose={() => setModalType(null)} title={t("wallet.freeze_wallet")}>
        <OmsConfirmContent icon="warning" iconColor="#3b82f6" iconBg="#3b82f6" message={`Freeze ${selectedUser?.name}'s wallet? They won't be able to deposit, withdraw, or place bets until unfrozen.`} details={[
          { label: "User", value: selectedUser?.name || "" },
          { label: "Current Balance", value: `₱${selectedUser?.balance.toLocaleString()}` },
          { label: "Active Bets", value: String(selectedUser?.activeBets) },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>{t("common.cancel")}</OmsBtn>
          <OmsBtn variant="danger" onClick={() => { setWallets(prev => prev.map(w => w.id === selectedUser!.id ? { ...w, status: "frozen" as const } : w)); logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "wallet_freeze", target: `${selectedUser!.name} (${selectedUser!.id})`, detail: `Froze wallet — balance: ₱${selectedUser!.balance.toLocaleString()}, active bets: ${selectedUser!.activeBets}` }); setModalType(null); showOmsToast(`${selectedUser!.name}'s wallet frozen`); }}>{t("wallet.freeze_wallet")}</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Unfreeze Modal */}
      <OmsModal open={modalType === "unfreeze" && !!selectedUser} onClose={() => setModalType(null)} title={t("wallet.unfreeze_wallet")}>
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Unfreeze ${selectedUser?.name}'s wallet? They will regain full access to their funds.`} details={[
          { label: "User", value: selectedUser?.name || "" },
          { label: "Current Balance", value: `₱${selectedUser?.balance.toLocaleString()}` },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>{t("common.cancel")}</OmsBtn>
          <OmsBtn variant="success" onClick={() => { setWallets(prev => prev.map(w => w.id === selectedUser!.id ? { ...w, status: "active" as const } : w)); logAudit({ adminEmail: admin?.email || "", adminRole: role, action: "wallet_unfreeze", target: `${selectedUser!.name} (${selectedUser!.id})`, detail: `Unfroze wallet — balance: ₱${selectedUser!.balance.toLocaleString()}` }); setModalType(null); showOmsToast(`${selectedUser!.name}'s wallet unfrozen`); }}>{t("wallet.unfreeze_wallet")}</OmsBtn>
        </OmsButtonRow>
      </OmsModal>
    </div>
  );
}