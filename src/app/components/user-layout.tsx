/**
 * UserLayout — Shared wrapper for all user-facing portal routes.
 * Renders the mobile BottomNav below the Outlet.
 * Individual pages still manage their own Header/Sidebar/Footer.
 */
import { Outlet } from "react-router";
import { BottomNav } from "./bottom-nav";
import { useAuth } from "./auth-context";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function UserLayout() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Force MFA setup for logged-in users who haven't configured MFA
  useEffect(() => {
    if (isLoggedIn && user && user.mfaConfigured === false) {
      navigate("/mfa-setup", { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}