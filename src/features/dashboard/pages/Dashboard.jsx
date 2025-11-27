import { useTranslation } from 'react-i18next';

/**
 * Dashboard Page
 * Main dashboard page for authenticated users
 */
const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">
          {t('dashboard.title', { ns: 'common', defaultValue: 'Dashboard' })}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard content will be added here */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-secondary">
              {t('dashboard.welcome', { ns: 'common', defaultValue: 'Welcome to Dashboard' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

