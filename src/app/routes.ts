import { createBrowserRouter } from "react-router";
import { createElement } from "react";
import { RouteErrorElement } from "./components/route-error-boundary";

/**
 * Routes use React Router's `lazy` property to load page modules on-demand.
 * Each lazy() call returns { Component: module.default } which React Router
 * uses to render the route component.
 *
 * The root route includes:
 * - HydrateFallback: suppresses flash during SSR hydration
 * - errorElement: catches lazy-load failures and renders a recovery UI
 */
const lazy = (loader: () => Promise<{ default: React.ComponentType<any> }>) =>
  () => loader().then(m => ({ Component: m.default }));

// Named export wrapper for OmsLayout (not a default export)
const lazyOmsLayout = () =>
  import("./components/oms/oms-layout").then(m => ({ Component: m.OmsLayout }));

export const router = createBrowserRouter([
  {
    HydrateFallback: () => null,
    errorElement: createElement(RouteErrorElement),
    children: [
      { path: "/", lazy: lazy(() => import("./pages/home")) },
      { path: "/login", lazy: lazy(() => import("./pages/login")) },
      { path: "/signup", lazy: lazy(() => import("./pages/signup")) },
      { path: "/markets", lazy: lazy(() => import("./pages/markets")) },
      { path: "/market/:id", lazy: lazy(() => import("./pages/market-detail")) },
      { path: "/portfolio", lazy: lazy(() => import("./pages/portfolio")) },
      { path: "/profile", lazy: lazy(() => import("./pages/profile")) },
      { path: "/creator", lazy: lazy(() => import("./pages/creator")) },
      { path: "/creator/apply", lazy: lazy(() => import("./pages/creator")) },
      { path: "/creator/create", lazy: lazy(() => import("./pages/creator")) },
      { path: "/rewards", lazy: lazy(() => import("./pages/rewards")) },
      { path: "/fast-bet", lazy: lazy(() => import("./pages/fast-bet")) },
      { path: "/leaderboard", lazy: lazy(() => import("./pages/leaderboard")) },
      { path: "/affiliate", lazy: lazy(() => import("./pages/affiliate")) },
      { path: "/notifications", lazy: lazy(() => import("./pages/notifications")) },
      { path: "/kyc", lazy: lazy(() => import("./pages/kyc")) },
      // Compliance & Info Pages
      { path: "/responsible-gaming", lazy: lazy(() => import("./pages/responsible-gaming")) },
      { path: "/privacy-policy", lazy: lazy(() => import("./pages/privacy-policy")) },
      { path: "/terms", lazy: lazy(() => import("./pages/terms")) },
      { path: "/faq", lazy: lazy(() => import("./pages/faq")) },
      { path: "/about", lazy: lazy(() => import("./pages/about")) },
      { path: "/transactions", lazy: lazy(() => import("./pages/transaction-history")) },
      // Dynamic Category Route — resolves :slug to the correct category page
      { path: "/category/:slug", lazy: lazy(() => import("./pages/category-dynamic")) },
      // OMS Routes — Multi-Tenant SaaS Platform
      {
        path: "/oms",
        lazy: lazyOmsLayout,
        children: [
          // Platform-level (all merchants view)
          { index: true, lazy: lazy(() => import("./pages/oms/platform-overview")) },
          { path: "merchants", lazy: lazy(() => import("./pages/oms/merchants")) },
          { path: "merchants/:id", lazy: lazy(() => import("./pages/oms/merchant-detail")) },
          { path: "billing", lazy: lazy(() => import("./pages/oms/billing")) },
          // Merchant-scoped operations
          { path: "dashboard", lazy: lazy(() => import("./pages/oms/dashboard")) },
          { path: "users", lazy: lazy(() => import("./pages/oms/users")) },
          { path: "markets", lazy: lazy(() => import("./pages/oms/markets-mgmt")) },
          { path: "bets", lazy: lazy(() => import("./pages/oms/bets")) },
          { path: "finance", lazy: lazy(() => import("./pages/oms/finance")) },
          { path: "risk", lazy: lazy(() => import("./pages/oms/risk")) },
          { path: "wallet", lazy: lazy(() => import("./pages/oms/wallet")) },
          { path: "fast-bet", lazy: lazy(() => import("./pages/oms/fast-bet-config")) },
          { path: "odds", lazy: lazy(() => import("./pages/oms/odds")) },
          { path: "creators", lazy: lazy(() => import("./pages/oms/creators")) },
          { path: "rewards", lazy: lazy(() => import("./pages/oms/rewards-mgmt")) },
          { path: "affiliates", lazy: lazy(() => import("./pages/oms/affiliates-mgmt")) },
          { path: "leaderboard", lazy: lazy(() => import("./pages/oms/leaderboard-mgmt")) },
          { path: "promos", lazy: lazy(() => import("./pages/oms/promos")) },
          { path: "content", lazy: lazy(() => import("./pages/oms/content")) },
          { path: "notif-mgmt", lazy: lazy(() => import("./pages/oms/notifications-mgmt")) },
          { path: "reports", lazy: lazy(() => import("./pages/oms/reports")) },
          { path: "audit", lazy: lazy(() => import("./pages/oms/audit")) },
          { path: "support", lazy: lazy(() => import("./pages/oms/support")) },
          { path: "settings", lazy: lazy(() => import("./pages/oms/settings")) },
          { path: "paas-config", lazy: lazy(() => import("./pages/oms/paas-config")) },
          { path: "paas-merchant", lazy: lazy(() => import("./pages/oms/paas-merchant")) },
          { path: "payment-methods", lazy: lazy(() => import("./pages/oms/payment-methods")) },
          { path: "payment-providers", lazy: lazy(() => import("./pages/oms/payment-providers")) },
          { path: "admin-users", lazy: lazy(() => import("./pages/oms/oms-admin-users")) },
          { path: "kyb", lazy: lazy(() => import("./pages/oms/kyb")) },
        ],
      },
      // Merchant-facing KYB application form (standalone, no OMS layout required)
      { path: "/oms/kyb-apply", lazy: lazy(() => import("./pages/oms/kyb-apply")) },
      // 404 — proper not-found page
      { path: "/not-found", lazy: lazy(() => import("./pages/not-found")) },
      { path: "*", lazy: lazy(() => import("./pages/not-found")) },
    ],
  },
]);