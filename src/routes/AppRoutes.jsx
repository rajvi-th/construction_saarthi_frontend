  /**
   * App Routes Configuration
   * Centralized routing for 400+ screen project
   * Uses lazy loading for better performance
   */

  import { lazy, Suspense } from 'react';
  import { Routes, Route, Navigate, Link } from 'react-router-dom';
  import Loader from '../components/ui/Loader';
  import { ROUTES, ROUTES_FLAT } from '../constants/routes';
  import ProtectedRoute from './ProtectedRoute';

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

  // Dashboard (will be created later)
  // const Dashboard = lazy(() => import('../features/dashboard/pages/Dashboard'));

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
          {/* 
          <Route
            path={ROUTES_FLAT.DASHBOARD}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path={ROUTES_FLAT.PROJECTS}
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          
          <Route
            path={ROUTES.PROJECTS.DETAILS}
            element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            }
          />
          
          <Route
            path={ROUTES.BOOKINGS.LIST}
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          
          <Route
            path={ROUTES.WORKERS.LIST}
            element={
              <ProtectedRoute>
                <Workers />
              </ProtectedRoute>
            }
          />
          
          <Route
            path={ROUTES.VENDORS.LIST}
            element={
              <ProtectedRoute>
                <Vendors />
              </ProtectedRoute>
            }
          />
          
          <Route
            path={ROUTES.MATERIALS.LIST}
            element={
              <ProtectedRoute>
                <Materials />
              </ProtectedRoute>
            }
          />
          
          <Route
            path={ROUTES.PAYMENTS.LIST}
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          
          <Route
            path={ROUTES.PROFILE.VIEW}
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          <Route
            path={ROUTES.CHAT.HOME}
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
                  <Link to={ROUTES_FLAT.LOGIN} className="text-accent">
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
