/**
 * Shared dark mode theme utilities for PredictEx user-facing pages.
 * All pages should import `usePageTheme()` to get dark-mode-aware colors
 * that sync with the global `useAuth().darkMode` toggle.
 */
import { useAuth } from "./auth-context";
import type { ModalTheme } from "./deposit-withdraw-modal";

export interface PageTheme {
  bg: string;
  card: string;
  cardBorder: string;
  text: string;
  textSec: string;
  textMut: string;
  textFaint: string;
  inputBg: string;
  inputBorder: string;
  greenBg: string;
  greenText: string;
  orangeBg: string;
  orangeText: string;
  isDark: boolean;
}

const LIGHT: PageTheme = {
  bg: "#f7f8fa",
  card: "#ffffff",
  cardBorder: "#f0f1f3",
  text: "#070808",
  textSec: "#84888c",
  textMut: "#a0a3a7",
  textFaint: "#dfe0e2",
  inputBg: "#fafafa",
  inputBorder: "#f5f6f7",
  greenBg: "#e6fff3",
  greenText: "#00bf85",
  orangeBg: "#fff4ed",
  orangeText: "#ff5222",
  isDark: false,
};

const DARK: PageTheme = {
  bg: "#0d0e10",
  card: "#16171a",
  cardBorder: "#26282c",
  text: "#f0f0f2",
  textSec: "#9fa3a8",
  textMut: "#6b6f74",
  textFaint: "#3a3d42",
  inputBg: "#1a1b1f",
  inputBorder: "#26282c",
  greenBg: "rgba(0,191,133,0.12)",
  greenText: "#00bf85",
  orangeBg: "rgba(255,82,34,0.10)",
  orangeText: "#ff5222",
  isDark: true,
};

export function usePageTheme(): PageTheme {
  const { darkMode } = useAuth();
  return darkMode ? DARK : LIGHT;
}

export function toModalTheme(pt: PageTheme): ModalTheme {
  return {
    bg: pt.card,
    card: pt.card,
    cardBorder: pt.cardBorder,
    text: pt.text,
    textSec: pt.textSec,
    textMut: pt.textMut,
    textFaint: pt.textFaint,
    inputBg: pt.inputBg,
    inputBorder: pt.inputBorder,
    greenBg: pt.greenBg,
    greenText: pt.greenText,
    orangeBg: pt.orangeBg,
    orangeText: pt.orangeText,
    isDark: pt.isDark,
  };
}
