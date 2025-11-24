import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
}
