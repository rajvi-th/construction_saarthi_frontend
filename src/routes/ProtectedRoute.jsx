/**
 * ProtectedRoute Component
 * Validates authentication (token + user) before rendering protected content
 * Redirects to login if not authenticated
 * Uses Outlet for nested routes
 */

import { Navigate, Outlet } from "react-router-dom";
import { ROUTES_FLAT } from "../constants/routes";
import { useAuth } from "../features/auth/store";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to={ROUTES_FLAT.LOGIN} replace />;
  }

  return <Outlet />;
}
