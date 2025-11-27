  /**
   * App Routes Configuration
   * Centralized routing for 400+ screen project
   * Uses lazy loading for better performance
   */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { ROUTES_FLAT , ROUTES } from '../constants/routes';
import ProtectedRoute from '../routes/ProtectedRoute';
import Layout from '../components/layout/Layout';
import Projects from '../pages/Projects';
import Settings from '../pages/Settings';

  // Lazy load components for better performance (important for 400+ screens)
  // Auth Routes
  const Login = lazy(() => import('../features/auth/pages/Login'));
  const Register = lazy(() => import('../features/auth/pages/Register'));
  const VerifyOTP = lazy(() => import('../features/auth/pages/VerifyOTP'));
  const LanguageSelection = lazy(() => import('../features/auth/pages/LanguageSelection'));
  const WorkspaceSelection = lazy(() => import('../features/auth/pages/WorkspaceSelection'));
  const CreateWorkspace = lazy(() => import('../features/auth/pages/CreateWorkspace'));
  const AddNewMember = lazy(() => import('../features/auth/pages/AddNewMember'));
  const EditMember = lazy(() => import('../features/auth/pages/EditMember'));

  // Dashboard
  const Dashboard = lazy(() => import('../features/dashboard/pages/Dashboard'));

  // Projects (will be created later)
  // const Projects = lazy(() => import('../features/projects/pages/Projects'));
  // const ProjectDetails = lazy(() => import('../features/projects/pages/ProjectDetails'));

  // Bookings (will be created later)
  // const Bookings = lazy(() => import('../features/bookings/pages/Bookings'));

  // Workers (will be created later)
  // const Workers = lazy(() => import('../features/workers/pages/Workers'));

  // Vendors (will be created later)
  // const Vendors = lazy(() => import('../features/vendors/pages/Vendors'));

  // Materials (will be created later)
  // const Materials = lazy(() => import('../features/materials/pages/Materials'));

  // Payments (will be created later)
  // const Payments = lazy(() => import('../features/payments/pages/Payments'));

  // Profile (will be created later)
  // const Profile = lazy(() => import('../features/profile/pages/Profile'));

  // Chat (will be created later)
  // const Chat = lazy(() => import('../features/chat/pages/Chat'));

  // Loading Component for Suspense fallback
  const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );

  function AppRoutes() {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes - Auth */}
          <Route path={ROUTES_FLAT.LOGIN} element={<Login />} />
          <Route path={ROUTES_FLAT.REGISTER} element={<Register />} />
          <Route path={ROUTES_FLAT.VERIFY_OTP} element={<VerifyOTP />} />
          <Route path={ROUTES_FLAT.LANGUAGE_SELECTION} element={<LanguageSelection />} />
          <Route path={ROUTES_FLAT.WORKSPACE_SELECTION} element={<WorkspaceSelection />} />
          <Route path={ROUTES_FLAT.CREATE_WORKSPACE} element={<CreateWorkspace />} />
          <Route path={ROUTES_FLAT.ADD_NEW_MEMBER} element={<AddNewMember />} />
          <Route path={ROUTES_FLAT.EDIT_MEMBER} element={<EditMember />} />

        {/* Protected Routes - Will be added as features are developed */}

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
    
           {/* 
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/workers"
          element={
            <ProtectedRoute>
              <Workers />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/vendors"
          element={
            <ProtectedRoute>
              <Vendors />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/materials"
          element={
            <ProtectedRoute>
              <Materials />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        */}

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={ROUTES_FLAT.LOGIN} replace />} />

        {/* 404 - Not Found */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
                <p className="text-secondary mb-4">Page not found</p>
                <Link to={ROUTES_FLAT.LOGIN} className="text-accent hover:underline">
                  Go to Login
                </Link>
              </div>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}

  export default AppRoutes;
