import { useState } from "react";
import { OmsModal, OmsField, OmsInput, OmsSelect, OmsTextarea, OmsBtn, OmsButtonRow, OmsConfirmContent, showOmsToast } from "../../components/oms/oms-modal";
import { useI18n } from "../../components/oms/oms-i18n";
import { OmsTableSkeleton } from "../../components/oms/oms-table-skeleton";
import { logAudit } from "../../components/oms/oms-audit-log";
import { useOmsAuth } from "../../components/oms/oms-auth";
import { useTenantConfig } from "../../components/oms/oms-tenant-config";

const pp = { fontFamily: "'Poppins', sans-serif" };
const ss04 = { fontFeatureSettings: "'ss04'" };

interface GameConfig {
  id: string;
  name: string;
  type: "color-game" | "pba-quick" | "nba-quick" | "boxing-quick" | "esports-quick" | "bingo-quick" | "lottery-quick";
  status: "active" | "paused" | "scheduled" | "ended";
  roundDuration: number;
  cooldownSec: number;
  minBet: number;
  maxBet: number;
  maxPayout: number;
  houseEdge: number;
  totalRoundsToday: number;
  activeRound: string | null;
  activeBettors: number;
  todayVolume: number;
  options: { label: string; multiplier: number; color: string }[];
}

const MOCK_GAMES: GameConfig[] = [
  {
    id: "FG001", name: "Color Game", type: "color-game", status: "active", roundDuration: 60, cooldownSec: 15, minBet: 50, maxBet: 10000, maxPayout: 60000, houseEdge: 5.5,
    totalRoundsToday: 432, activeRound: "#8901", activeBettors: 89, todayVolume: 1800000,
    options: [
      { label: "Red", multiplier: 2.0, color: "#ef4444" },
      { label: "Blue", multiplier: 2.0, color: "#3b82f6" },
      { label: "Green", multiplier: 3.0, color: "#22c55e" },
      { label: "Yellow", multiplier: 3.0, color: "#eab308" },
      { label: "White", multiplier: 5.0, color: "#e5e7eb" },
      { label: "Pink", multiplier: 5.0, color: "#ec4899" },
    ],
  },
  {
    id: "FG002", name: "PBA Quick Bet", type: "pba-quick", status: "active", roundDuration: 300, cooldownSec: 30, minBet: 100, maxBet: 50000, maxPayout: 100000, houseEdge: 4.8,
    totalRoundsToday: 28, activeRound: "#PBA-045", activeBettors: 234, todayVolume: 3200000,
    options: [
      { label: "Home Win", multiplier: 1.8, color: "#ff5222" },
      { label: "Away Win", multiplier: 2.2, color: "#6366f1" },
    ],
  },
  {
    id: "FG003", name: "NBA Quick Bet", type: "nba-quick", status: "active", roundDuration: 300, cooldownSec: 30, minBet: 100, maxBet: 50000, maxPayout: 100000, houseEdge: 4.5,
    totalRoundsToday: 18, activeRound: "#NBA-012", activeBettors: 156, todayVolume: 2100000,
    options: [
      { label: "Home Win", multiplier: 1.9, color: "#ff5222" },
      { label: "Away Win", multiplier: 1.9, color: "#6366f1" },
    ],
  },
  {
    id: "FG004", name: "Boxing Quick Bet", type: "boxing-quick", status: "paused", roundDuration: 600, cooldownSec: 60, minBet: 200, maxBet: 100000, maxPayout: 200000, houseEdge: 5.0,
    totalRoundsToday: 0, activeRound: null, activeBettors: 0, todayVolume: 0,
    options: [
      { label: "Fighter A", multiplier: 1.7, color: "#ef4444" },
      { label: "Fighter B", multiplier: 2.3, color: "#3b82f6" },
      { label: "Draw", multiplier: 8.0, color: "#6b7280" },
    ],
  },
  {
    id: "FG005", name: "Esports Quick Bet", type: "esports-quick", status: "active", roundDuration: 180, cooldownSec: 20, minBet: 50, maxBet: 25000, maxPayout: 50000, houseEdge: 4.2,
    totalRoundsToday: 64, activeRound: "#ESP-089", activeBettors: 78, todayVolume: 980000,
    options: [
      { label: "Team A", multiplier: 1.85, color: "#8b5cf6" },
      { label: "Team B", multiplier: 1.95, color: "#06b6d4" },
    ],
  },
  {
    id: "FG006", name: "Bingo Quick Bet", type: "bingo-quick", status: "scheduled", roundDuration: 120, cooldownSec: 30, minBet: 20, maxBet: 5000, maxPayout: 25000, houseEdge: 8.0,
    totalRoundsToday: 0, activeRound: null, activeBettors: 0, todayVolume: 0,
    options: [
      { label: "Bingo!", multiplier: 5.0, color: "#f59e0b" },
    ],
  },
  {
    id: "FG007", name: "Lottery Quick Pick", type: "lottery-quick", status: "active", roundDuration: 900, cooldownSec: 60, minBet: 20, maxBet: 1000, maxPayout: 100000, houseEdge: 12.0,
    totalRoundsToday: 12, activeRound: "#LOT-006", activeBettors: 420, todayVolume: 2100000,
    options: [
      { label: "Match 3", multiplier: 10.0, color: "#22c55e" },
      { label: "Match 4", multiplier: 50.0, color: "#f59e0b" },
      { label: "Match 5", multiplier: 500.0, color: "#ef4444" },
      { label: "Jackpot", multiplier: 10000.0, color: "#ff5222" },
    ],
  },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400",
    paused: "bg-amber-500/15 text-amber-400",
    scheduled: "bg-blue-500/15 text-blue-400",
    ended: "bg-gray-500/15 text-gray-400",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || ""}`} style={{ fontWeight: 600 }}>{status.toUpperCase()}</span>;
}

export default function OmsFastBetConfig() {
  const [games, setGames] = useState(MOCK_GAMES);
  const [modalType, setModalType] = useState<"detail" | "edit" | "pause" | "resume" | "create" | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameConfig | null>(null);

  // Edit form state
  const [editRoundDuration, setEditRoundDuration] = useState("");
  const [editCooldown, setEditCooldown] = useState("");
  const [editMinBet, setEditMinBet] = useState("");
  const [editMaxBet, setEditMaxBet] = useState("");
  const [editMaxPayout, setEditMaxPayout] = useState("");
  const [editHouseEdge, setEditHouseEdge] = useState("");

  // Create form
  const [createName, setCreateName] = useState("");
  const [createType, setCreateType] = useState("color-game");
  const [createDuration, setCreateDuration] = useState("60");
  const [createCooldown, setCreateCooldown] = useState("15");
  const [createMinBet, setCreateMinBet] = useState("50");
  const [createMaxBet, setCreateMaxBet] = useState("10000");

  const openEdit = (g: GameConfig) => {
    setSelectedGame(g);
    setEditRoundDuration(String(g.roundDuration));
    setEditCooldown(String(g.cooldownSec));
    setEditMinBet(String(g.minBet));
    setEditMaxBet(String(g.maxBet));
    setEditMaxPayout(String(g.maxPayout));
    setEditHouseEdge(String(g.houseEdge));
    setModalType("edit");
  };

  const totalVolume = games.reduce((s, g) => s + g.todayVolume, 0);
  const totalBettors = games.reduce((s, g) => s + g.activeBettors, 0);
  const activeGames = games.filter(g => g.status === "active").length;

  const { t } = useI18n();
  const { admin } = useOmsAuth();
  const { hasPermission } = useTenantConfig();
  const role = admin?.role || "merchant_ops";
  const [loading, setLoading] = useState(true);
  useState(() => { setTimeout(() => setLoading(false), 500); });

  const doAudit = (target: string, detail: string) => {
    if (!admin) return;
    logAudit({ adminEmail: admin.email, adminRole: admin.role, action: "config_save", target, detail });
  };

  return (
    <div className="space-y-4" style={pp}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Games", value: String(activeGames), color: "text-emerald-400" },
          { label: "Live Bettors", value: totalBettors.toLocaleString(), color: "text-[#ff5222]" },
          { label: "Today's Volume", value: `₱${(totalVolume / 1000000).toFixed(1)}M`, color: "text-white" },
          { label: "Avg House Edge", value: `${(games.filter(g => g.status === "active").reduce((s, g) => s + g.houseEdge, 0) / activeGames).toFixed(1)}%`, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#111827] border border-[#1f2937] rounded-xl p-3">
            <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className={`text-[20px] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex justify-end">
        <button onClick={() => { setCreateName(""); setCreateType("color-game"); setCreateDuration("60"); setCreateCooldown("15"); setCreateMinBet("50"); setCreateMaxBet("10000"); setModalType("create"); }} className="h-8 px-4 bg-[#ff5222] hover:bg-[#e8491f] text-white text-[12px] rounded-lg cursor-pointer transition-colors" style={{ fontWeight: 600 }}>
          + New Game Type
        </button>
      </div>

      {/* Game cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {games.map(g => (
          <div key={g.id} className={`bg-[#111827] border rounded-xl p-4 ${g.status === "active" ? "border-emerald-500/20" : "border-[#1f2937]"}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white text-[14px]" style={{ fontWeight: 600 }}>{g.name}</h3>
                  <StatusBadge status={g.status} />
                </div>
                {g.activeRound && (
                  <p className="text-[#ff5222] text-[11px]" style={{ fontWeight: 500 }}>Round {g.activeRound} · {g.activeBettors} bettors</p>
                )}
              </div>
            </div>

            {/* Options preview */}
            <div className="flex gap-1 mb-3 flex-wrap">
              {g.options.map(o => (
                <div key={o.label} className="flex items-center gap-1 bg-[#0a0e1a] px-2 py-1 rounded-md">
                  <div className="w-2 h-2 rounded-full" style={{ background: o.color }} />
                  <span className="text-[#9ca3af] text-[10px]">{o.label}</span>
                  <span className="text-white text-[10px]" style={{ fontWeight: 600 }}>{o.multiplier}x</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-[#0a0e1a] rounded-lg p-2 text-center">
                <p className="text-[#6b7280] text-[9px]">Round</p>
                <p className="text-white text-[12px]" style={{ fontWeight: 600 }}>{g.roundDuration}s</p>
              </div>
              <div className="bg-[#0a0e1a] rounded-lg p-2 text-center">
                <p className="text-[#6b7280] text-[9px]">House Edge</p>
                <p className="text-amber-400 text-[12px]" style={{ fontWeight: 600 }}>{g.houseEdge}%</p>
              </div>
              <div className="bg-[#0a0e1a] rounded-lg p-2 text-center">
                <p className="text-[#6b7280] text-[9px]">Today</p>
                <p className="text-white text-[12px]" style={{ fontWeight: 600 }}>{g.totalRoundsToday} rds</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#6b7280] mb-3">
              <span>Bet: ₱{g.minBet.toLocaleString()} — ₱{g.maxBet.toLocaleString()}</span>
              <span>Vol: ₱{(g.todayVolume / 1000000).toFixed(1)}M</span>
            </div>

            {/* Actions */}
            <div className="flex gap-1.5">
              <button onClick={() => { setSelectedGame(g); setModalType("detail"); }} className="flex-1 text-[10px] text-[#9ca3af] hover:text-white py-1.5 rounded bg-[#1f2937] hover:bg-[#374151] cursor-pointer transition-colors text-center" style={{ fontWeight: 500 }}>Detail</button>
              <button onClick={() => openEdit(g)} className="flex-1 text-[10px] text-[#ff5222] py-1.5 rounded bg-[#ff5222]/10 hover:bg-[#ff5222]/20 cursor-pointer transition-colors text-center" style={{ fontWeight: 500 }}>Configure</button>
              {g.status === "active" ? (
                <button onClick={() => { setSelectedGame(g); setModalType("pause"); }} className="flex-1 text-[10px] text-amber-400 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer transition-colors text-center" style={{ fontWeight: 500 }}>Pause</button>
              ) : g.status !== "ended" ? (
                <button onClick={() => { setSelectedGame(g); setModalType("resume"); }} className="flex-1 text-[10px] text-emerald-400 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer transition-colors text-center" style={{ fontWeight: 500 }}>Resume</button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <OmsModal open={modalType === "detail" && !!selectedGame} onClose={() => setModalType(null)} title="Game Configuration Detail" subtitle={selectedGame?.name} width="max-w-[560px]">
        {selectedGame && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Round Duration", value: `${selectedGame.roundDuration}s` },
                { label: "Cooldown", value: `${selectedGame.cooldownSec}s` },
                { label: "Min Bet", value: `₱${selectedGame.minBet.toLocaleString()}` },
                { label: "Max Bet", value: `₱${selectedGame.maxBet.toLocaleString()}` },
                { label: "Max Payout", value: `₱${selectedGame.maxPayout.toLocaleString()}` },
                { label: "House Edge", value: `${selectedGame.houseEdge}%` },
                { label: "Today's Rounds", value: String(selectedGame.totalRoundsToday) },
                { label: "Today's Volume", value: `₱${selectedGame.todayVolume.toLocaleString()}` },
              ].map(d => (
                <div key={d.label} className="bg-[#0a0e1a] border border-[#1f2937] rounded-lg p-3">
                  <p className="text-[#6b7280] text-[10px]" style={{ fontWeight: 500 }}>{d.label}</p>
                  <p className="text-white text-[13px]" style={{ fontWeight: 600 }}>{d.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[#9ca3af] text-[11px] mb-2" style={{ fontWeight: 500 }}>Payout Options</p>
              <div className="space-y-1.5">
                {selectedGame.options.map(o => (
                  <div key={o.label} className="flex items-center justify-between bg-[#0a0e1a] border border-[#1f2937] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: o.color }} />
                      <span className="text-white text-[12px]" style={{ fontWeight: 500 }}>{o.label}</span>
                    </div>
                    <span className="text-[#ff5222] text-[12px]" style={{ fontWeight: 600 }}>{o.multiplier}x</span>
                  </div>
                ))}
              </div>
            </div>
            <OmsButtonRow>
              <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Close</OmsBtn>
              <OmsBtn variant="primary" onClick={() => openEdit(selectedGame)}>Configure</OmsBtn>
            </OmsButtonRow>
          </div>
        )}
      </OmsModal>

      {/* Edit Modal */}
      <OmsModal open={modalType === "edit" && !!selectedGame} onClose={() => setModalType(null)} title="Configure Game" subtitle={selectedGame?.name}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Round Duration (sec)" required>
              <OmsInput value={editRoundDuration} onChange={setEditRoundDuration} type="number" />
            </OmsField>
            <OmsField label="Cooldown (sec)" required>
              <OmsInput value={editCooldown} onChange={setEditCooldown} type="number" />
            </OmsField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Min Bet (₱)" required>
              <OmsInput value={editMinBet} onChange={setEditMinBet} type="number" />
            </OmsField>
            <OmsField label="Max Bet (₱)" required>
              <OmsInput value={editMaxBet} onChange={setEditMaxBet} type="number" />
            </OmsField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Max Payout (₱)" required>
              <OmsInput value={editMaxPayout} onChange={setEditMaxPayout} type="number" />
            </OmsField>
            <OmsField label="House Edge (%)" required>
              <OmsInput value={editHouseEdge} onChange={setEditHouseEdge} type="number" />
            </OmsField>
          </div>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              setGames(prev => prev.map(g => g.id === selectedGame!.id ? { ...g, roundDuration: Number(editRoundDuration), cooldownSec: Number(editCooldown), minBet: Number(editMinBet), maxBet: Number(editMaxBet), maxPayout: Number(editMaxPayout), houseEdge: Number(editHouseEdge) } : g));
              setModalType(null);
              showOmsToast(`${selectedGame!.name} configuration updated`);
              doAudit(selectedGame!.name, `Updated configuration: Round Duration=${editRoundDuration}s, Cooldown=${editCooldown}s, Min Bet=${editMinBet}₱, Max Bet=${editMaxBet}₱, Max Payout=${editMaxPayout}₱, House Edge=${editHouseEdge}%`);
            }}>Save Changes</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>

      {/* Pause Modal */}
      <OmsModal open={modalType === "pause" && !!selectedGame} onClose={() => setModalType(null)} title="Pause Game">
        <OmsConfirmContent icon="warning" iconColor="#f59e0b" iconBg="#f59e0b" message={`Pause ${selectedGame?.name}? No new rounds will start. Current round (if any) will complete normally.`} details={[
          { label: "Active Bettors", value: String(selectedGame?.activeBettors || 0) },
          { label: "Current Round", value: selectedGame?.activeRound || "None" },
        ]} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="danger" onClick={() => { setGames(prev => prev.map(g => g.id === selectedGame!.id ? { ...g, status: "paused" as const, activeRound: null, activeBettors: 0 } : g)); setModalType(null); showOmsToast(`${selectedGame!.name} paused`); doAudit(selectedGame!.name, "Paused game"); }}>Pause Game</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Resume Modal */}
      <OmsModal open={modalType === "resume" && !!selectedGame} onClose={() => setModalType(null)} title="Resume Game">
        <OmsConfirmContent icon="success" iconColor="#10b981" iconBg="#10b981" message={`Resume ${selectedGame?.name}? A new round will start after the cooldown period.`} />
        <OmsButtonRow>
          <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
          <OmsBtn variant="success" onClick={() => { setGames(prev => prev.map(g => g.id === selectedGame!.id ? { ...g, status: "active" as const } : g)); setModalType(null); showOmsToast(`${selectedGame!.name} resumed`); doAudit(selectedGame!.name, "Resumed game"); }}>Resume Game</OmsBtn>
        </OmsButtonRow>
      </OmsModal>

      {/* Create Modal */}
      <OmsModal open={modalType === "create"} onClose={() => setModalType(null)} title="Create New Game Type">
        <div className="space-y-3">
          <OmsField label="Game Name" required>
            <OmsInput value={createName} onChange={setCreateName} placeholder="e.g. Cockfight Quick Bet" />
          </OmsField>
          <OmsField label="Game Type" required>
            <OmsSelect value={createType} onChange={setCreateType} options={[
              { value: "color-game", label: "Color Game" },
              { value: "pba-quick", label: "PBA Quick Bet" },
              { value: "nba-quick", label: "NBA Quick Bet" },
              { value: "boxing-quick", label: "Boxing Quick Bet" },
              { value: "esports-quick", label: "Esports Quick Bet" },
              { value: "bingo-quick", label: "Bingo Quick Bet" },
              { value: "lottery-quick", label: "Lottery Quick Pick" },
            ]} />
          </OmsField>
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Round Duration (sec)">
              <OmsInput value={createDuration} onChange={setCreateDuration} type="number" />
            </OmsField>
            <OmsField label="Cooldown (sec)">
              <OmsInput value={createCooldown} onChange={setCreateCooldown} type="number" />
            </OmsField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <OmsField label="Min Bet (₱)">
              <OmsInput value={createMinBet} onChange={setCreateMinBet} type="number" />
            </OmsField>
            <OmsField label="Max Bet (₱)">
              <OmsInput value={createMaxBet} onChange={setCreateMaxBet} type="number" />
            </OmsField>
          </div>
          <OmsButtonRow>
            <OmsBtn variant="secondary" onClick={() => setModalType(null)}>Cancel</OmsBtn>
            <OmsBtn variant="primary" onClick={() => {
              if (!createName) { showOmsToast("Game name is required", "error"); return; }
              const newGame: GameConfig = {
                id: `FG${String(games.length + 1).padStart(3, "0")}`,
                name: createName, type: createType as any, status: "scheduled",
                roundDuration: Number(createDuration), cooldownSec: Number(createCooldown),
                minBet: Number(createMinBet), maxBet: Number(createMaxBet), maxPayout: Number(createMaxBet) * 5,
                houseEdge: 5.0, totalRoundsToday: 0, activeRound: null, activeBettors: 0, todayVolume: 0,
                options: [{ label: "Option A", multiplier: 2.0, color: "#ff5222" }, { label: "Option B", multiplier: 2.0, color: "#6366f1" }],
              };
              setGames(prev => [...prev, newGame]);
              setModalType(null);
              showOmsToast(`${createName} game type created`);
              doAudit(createName, `Created new game type: Round Duration=${createDuration}s, Cooldown=${createCooldown}s, Min Bet=${createMinBet}₱, Max Bet=${createMaxBet}₱, Max Payout=${Number(createMaxBet) * 5}₱, House Edge=5.0%`);
            }}>Create Game</OmsBtn>
          </OmsButtonRow>
        </div>
      </OmsModal>
    </div>
  );
}