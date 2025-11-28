import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  Building2,
  Crown,
  ChartLine,
  BanknoteArrowDown,
  Plus,
  FileText,
  Users,
  ClipboardList,
  IndianRupee,
  Mic
} from 'lucide-react';
import { ROUTES_FLAT } from '../../../constants/routes';
import { useAuth } from '../../auth/store';
import { useProjects } from '../hooks';
import calculatorIcon from '../../../assets/icons/CalculatorMinimalistic.svg';
import aiIcon from '../../../assets/icons/AI.svg';
import DashboardBanner from '../components/DashboardBanner';
import StatisticsCards from '../components/StatisticsCards';
import ActionCards from '../components/ActionCards';
import MyProjects from '../components/MyProjects';
import QuickActions from '../components/QuickActions';

const Dashboard = () => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();
  const { projects, isLoadingProjects } = useProjects(selectedWorkspace);

  // Statistics data - dynamic based on projects
  const statistics = useMemo(() => [
    {
      icon: Building2,
      value: projects.length.toString(),
      label: t('stats.totalProjects'),
      color: 'blue',
    },
    {
      icon: Building,
      value: '12',
      label: t('stats.runningProjects'),
      color: 'yellow',
    },
    {
      icon: Crown,
      value: '1,890',
      label: t('stats.activeSubscriptions'),
      color: 'orange',
    },
    {
      icon: ChartLine,
      value: '105 Cr',
      label: t('stats.totalRevenue'),
      color: 'purple',
    },
    {
      icon: BanknoteArrowDown,
      value: '50 Lakhs',
      label: t('stats.totalExpenses'),
      color: 'orange',
    },
  ], [projects.length, t]);

  // Action cards data
  const actionCards = [
    {
      icon: calculatorIcon,
      isSvg: true,
      badge: t('actions.aiPowered'),
      badgeIcon: aiIcon,
      title: t('actions.constructionCalculator'),
      description: t('actions.calculatorDescription'),
      onClick: () => { },
    },
    {
      icon: Plus,
      title: t('actions.addUsage'),
      description: t('actions.addUsageDescription'),
      onClick: () => { },
    },
  ];

  // Quick actions data
  const quickActions = [
    {
      icon: Building2,
      label: t('quickActions.myProjects'),
      onClick: () => navigate(ROUTES_FLAT.PROJECTS),
    },
    {
      icon: IndianRupee,
      label: t('quickActions.finance'),
      onClick: () => { },
    },
    {
      icon: ClipboardList,
      label: t('quickActions.siteInventory'),
      onClick: () => { },
    },
    {
      icon: FileText,
      label: t('quickActions.documents'),
      badgeIcon: aiIcon,
      onClick: () => { },
    },
    {
      icon: Users,
      label: t('quickActions.labourSheet'),
      onClick: () => { },
    },
    {
      icon: Mic,
      label: t('quickActions.notes'),
      onClick: () => { },
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <DashboardBanner onTryItNow={() => { }} />

        <StatisticsCards statistics={statistics} />

        <ActionCards actionCards={actionCards} />

        <MyProjects
          projects={projects}
          onCreateProject={() => { }}
        />

        <QuickActions quickActions={quickActions} />
      </div>
    </div>
  );
};

export default Dashboard;
