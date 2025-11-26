import './App.css'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './features/auth/store'
import { ErrorBoundary } from './components/shared'
import AppRoutes from './routes/AppRoutes'

// Main App Component - Wraps everything with ErrorBoundary, LanguageProvider, AuthProvider and Routes
function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
export default App
