import { useParams, useNavigate } from "react-router";
import { lazy, Suspense, useEffect } from "react";

/* =============================================
 * Dynamic /category/:slug route.
 * Each category module is lazy-loaded (code-split).
 * Invalid slugs redirect to 404.
 * ============================================= */

const CATEGORY_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  basketball: lazy(() => import("./category-basketball")),
  "color-game": lazy(() => import("./category-color-game")),
  boxing: lazy(() => import("./category-boxing")),
  esports: lazy(() => import("./category-esports")),
  bingo: lazy(() => import("./category-bingo")),
  lottery: lazy(() => import("./category-lottery")),
  showbiz: lazy(() => import("./category-showbiz")),
  weather: lazy(() => import("./category-weather")),
  economy: lazy(() => import("./category-economy")),
};

export const VALID_CATEGORY_SLUGS = Object.keys(CATEGORY_COMPONENTS);

export default function CategoryDynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug && !CATEGORY_COMPONENTS[slug]) {
      navigate("/not-found", { replace: true });
    }
  }, [slug, navigate]);

  if (!slug || !CATEGORY_COMPONENTS[slug]) {
    return null;
  }

  const CategoryComponent = CATEGORY_COMPONENTS[slug];

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-10">
            <div className="absolute inset-0 rounded-full border-[2.5px] border-[#f0f1f3]" />
            <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-[#ff5222]" style={{ animation: "spin 0.8s linear infinite" }} />
          </div>
          <p className="text-[13px] text-[#84888c]" style={{ fontWeight: 500, fontFeatureSettings: "'ss04'" }}>Loading category...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    }>
      <CategoryComponent />
    </Suspense>
  );
}
