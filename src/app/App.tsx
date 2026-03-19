import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./components/auth-context";
import { OmsAuthProvider } from "./components/oms/oms-auth";
import { RouteLoadingSpinner } from "./components/route-error-boundary";

export default function App() {
  return (
    <AuthProvider>
      <OmsAuthProvider>
        <Suspense fallback={<RouteLoadingSpinner />}>
          <RouterProvider router={router} />
        </Suspense>
      </OmsAuthProvider>
    </AuthProvider>
  );
}
