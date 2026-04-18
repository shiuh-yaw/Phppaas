/**
 * UserLayout — Shared wrapper for all user-facing portal routes.
 * Renders the mobile BottomNav below the Outlet.
 * Individual pages still manage their own Header/Sidebar/Footer.
 */
import { Outlet } from "react-router";
import { BottomNav } from "./bottom-nav";

export default function UserLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}
