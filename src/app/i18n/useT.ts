/**
 * useT — Translation Hook for the User Platform
 * ================================================
 * Usage:
 *   const t = useT();
 *   t("nav.home")          → "Home" (en) or "Home" (fil)
 *   t("home.hero.title1")  → "Feeling Lucky," (en) or "Swerte Mo Na," (fil)
 */
import { useAuth } from "../components/auth-context";
import { translations, type Locale } from "./translations";

export function useT() {
  const { locale } = useAuth();
  const dict = translations[locale as Locale] ?? translations.fil;

  return function t(key: string): string {
    return dict[key] ?? translations.en[key] ?? key;
  };
}
