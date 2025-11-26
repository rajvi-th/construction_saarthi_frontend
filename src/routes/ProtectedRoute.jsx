/**
 * ProtectedRoute Component
 * Validates authentication (token + user) before rendering protected content
 * Redirects to login if not authenticated
 */

import { Navigate } from "react-router-dom";
import { ROUTES_FLAT } from "../constants/routes";
import { useAuth } from "../features/auth/store";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES_FLAT.LOGIN} replace />;
  }

  return <>{children}</>;
}
