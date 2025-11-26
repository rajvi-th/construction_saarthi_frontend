import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  // TEMPORARY: Allow access for UI testing - Remove this in production
  // For testing UI, you can either:
  // 1. Set a token: localStorage.setItem('token', 'test-token')
  // 2. Or temporarily comment out the redirect below
  const allowTesting = true; // Set to false when ready for production

  if (!isAuthenticated && !allowTesting) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
}
