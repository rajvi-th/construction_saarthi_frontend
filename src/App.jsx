import './App.css'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from './context/LanguageContext'
import AppRoutes from './routes/AppRoutes'

// Main App Component - Wraps everything with LanguageProvider and Routes
function App() {
  return (
    <LanguageProvider>
      <Toaster />
      <AppRoutes />
    </LanguageProvider>
  );
}
export default App
