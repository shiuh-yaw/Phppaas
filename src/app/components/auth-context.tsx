import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const STORAGE_KEY = "fg_auth_user_v1";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity
const LAST_ACTIVITY_KEY = "fg_auth_last_activity";

export interface User {
  name: string;
  handle: string;
  avatar: string;
  balance: number;
  portfolio: number;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  signup: (user: User) => void;
  logout: () => void;
  locale: "en" | "fil";
  setLocale: (l: "en" | "fil") => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const lastActivity = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || "0", 10);
    if (Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      return null;
    }
    return JSON.parse(raw) as User;
  } catch { return null; }
}

function saveUser(u: User | null) {
  try {
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    }
  } catch {}
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  signup: () => {},
  logout: () => {},
  locale: "fil",
  setLocale: () => {},
  darkMode: false,
  toggleDarkMode: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const [locale, setLocaleState] = useState<"en" | "fil">(() => {
    try { return (localStorage.getItem("fg_locale") as "en" | "fil") || "fil"; } catch { return "fil"; }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("fg_dark_mode") === "true"; } catch { return false; }
  });

  const login = useCallback((u: User) => { setUser(u); saveUser(u); }, []);
  const signup = useCallback((u: User) => { setUser(u); saveUser(u); }, []);
  const logout = useCallback(() => { setUser(null); saveUser(null); }, []);

  const setLocale = useCallback((l: "en" | "fil") => {
    setLocaleState(l);
    try { localStorage.setItem("fg_locale", l); } catch {}
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem("fg_dark_mode", String(next)); } catch {}
      return next;
    });
  }, []);

  // Activity tracker — refresh timeout on user interaction
  useEffect(() => {
    if (!user) return;
    const refresh = () => {
      try { localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now())); } catch {}
    };
    const events = ["mousedown", "keydown", "scroll", "touchstart"] as const;
    events.forEach(e => window.addEventListener(e, refresh, { passive: true }));
    // Check session timeout periodically
    const interval = setInterval(() => {
      const last = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || "0", 10);
      if (Date.now() - last > SESSION_TIMEOUT_MS) {
        logout();
      }
    }, 60_000);
    return () => {
      events.forEach(e => window.removeEventListener(e, refresh));
      clearInterval(interval);
    };
  }, [user, logout]);

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout, locale, setLocale, darkMode, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
