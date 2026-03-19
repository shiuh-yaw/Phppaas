import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { MOCK_NOTIFICATIONS, type OmsNotification, type NotifType, type NotifPriority } from "../../data/oms-mock";

const ss04 = { fontFeatureSettings: "'ss04'" };

const TYPE_STYLE: Record<NotifType, { icon: JSX.Element; bg: string; color: string }> = {
  alert: {
    icon: <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2l6 10H2L8 2z" /><path d="M8 7v2" /><circle cx="8" cy="11" r="0.5" fill="currentColor" /></svg>,
    bg: "bg-red-50", color: "text-red-500",
  },
  warning: {
    icon: <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="6" /><path d="M8 5v3" /><circle cx="8" cy="11" r="0.5" fill="currentColor" /></svg>,
    bg: "bg-amber-50", color: "text-amber-500",
  },
  info: {
    icon: <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="6" /><path d="M8 7v4" /><circle cx="8" cy="5" r="0.5" fill="currentColor" /></svg>,
    bg: "bg-blue-50", color: "text-blue-500",
  },
  success: {
    icon: <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="6" /><path d="M5.5 8l2 2 3-3.5" /></svg>,
    bg: "bg-emerald-50", color: "text-emerald-500",
  },
  system: {
    icon: <svg className="size-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="12" height="10" rx="2" /><path d="M5 14h6" /><path d="M8 13v1" /></svg>,
    bg: "bg-gray-50", color: "text-gray-500",
  },
};

const PRIORITY_BADGE: Record<NotifPriority, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-amber-100 text-amber-600",
  medium: "bg-blue-50 text-blue-500",
  low: "bg-gray-100 text-gray-400",
};

const NOTIF_STORAGE_KEY = "oms_notif_read_ids";

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function persistReadIds(ids: Set<string>) {
  try { localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify([...ids])); } catch {}
}

export function NotificationCenter() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<OmsNotification[]>(() => {
    const readIds = loadReadIds();
    return MOCK_NOTIFICATIONS.map(n => ({ ...n, read: readIds.has(n.id) ? true : n.read }));
  });
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      const readIds = new Set(next.filter(n => n.read).map(n => n.id));
      persistReadIds(readIds);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      const readIds = new Set(next.map(n => n.id));
      persistReadIds(readIds);
      return next;
    });
  }, []);

  const handleClick = useCallback((notif: OmsNotification) => {
    markRead(notif.id);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
      setOpen(false);
    }
  }, [markRead, navigate]);

  const displayed = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#f5f6f8] transition-colors cursor-pointer"
      >
        <svg className="size-4 text-[#84888c]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M8 1.5a4 4 0 014 4v2.5l1.5 2.5H2.5L4 8V5.5a4 4 0 014-4z" />
          <path d="M6 12.5a2 2 0 004 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ff5222] text-white text-[8px] rounded-full flex items-center justify-center" style={{ fontWeight: 700, ...ss04 }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="fixed right-2 top-[60px] w-[calc(100vw-1rem)] sm:absolute sm:right-0 sm:top-[42px] sm:w-[380px] max-h-[520px] bg-white border border-[#e5e7eb] rounded-2xl z-[80] overflow-hidden flex flex-col"
          style={{ boxShadow: "0 16px 50px rgba(0,0,0,0.14)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f1f3]">
            <div className="flex items-center gap-2">
              <h3 className="text-[#070808] text-[14px]" style={{ fontWeight: 600, ...ss04 }}>Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#ff5222] text-white" style={{ fontWeight: 600, ...ss04 }}>{unreadCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[#ff5222] text-[10px] hover:underline cursor-pointer" style={{ fontWeight: 500, ...ss04 }}>
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-[#f0f1f3]">
            {(["all", "unread"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[11px] px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${filter === f ? "bg-[#fff4ed] text-[#ff5222]" : "text-[#84888c] hover:bg-[#f5f6f8]"}`}
                style={{ fontWeight: filter === f ? 600 : 500, ...ss04 }}
              >
                {f === "all" ? "All" : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-[#b0b3b8] text-[12px]" style={ss04}>
                  {filter === "unread" ? "All caught up!" : "No notifications"}
                </p>
              </div>
            ) : (
              displayed.map(notif => {
                const style = TYPE_STYLE[notif.type];
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left cursor-pointer transition-colors border-b border-[#f5f6f8] last:border-0 ${!notif.read ? "bg-[#fafbfc]" : ""} hover:bg-[#f5f6f8]`}
                  >
                    {/* Icon */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${style.bg}`}>
                      <span className={style.color}>{style.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-[#ff5222] flex-shrink-0" />}
                        <p className={`text-[12px] truncate ${!notif.read ? "text-[#070808]" : "text-[#84888c]"}`} style={{ fontWeight: !notif.read ? 600 : 500, ...ss04 }}>
                          {notif.title}
                        </p>
                      </div>
                      <p className="text-[#b0b3b8] text-[10px] line-clamp-2" style={ss04}>{notif.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#b0b3b8] text-[9px]" style={ss04}>{notif.timestamp}</span>
                        <span className="text-[#d1d5db]">·</span>
                        <span className="text-[#b0b3b8] text-[9px]" style={ss04}>{notif.source}</span>
                        <span className={`text-[8px] px-1 py-0.5 rounded ${PRIORITY_BADGE[notif.priority]}`} style={{ fontWeight: 600, ...ss04 }}>
                          {notif.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    {notif.actionUrl && (
                      <svg className="size-3 text-[#d1d5db] flex-shrink-0 mt-2" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4.5 2l4 4-4 4" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-[#f0f1f3] bg-[#f9fafb]">
            <button
              onClick={() => { navigate("/oms/notif-mgmt"); setOpen(false); }}
              className="w-full text-center text-[#ff5222] text-[11px] hover:underline cursor-pointer"
              style={{ fontWeight: 500, ...ss04 }}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}