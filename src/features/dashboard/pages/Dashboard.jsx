import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  Mic,
} from "lucide-react";
import { ROUTES_FLAT } from "../../../constants/routes";
import { PROJECT_ROUTES } from "../../projects/constants";
import { useAuth } from "../../auth/store";
import { useProjects, useRestrictedRole, useWorkspaceRole } from "../hooks";
import calculatorIcon from "../../../assets/icons/CalculatorMinimalistic.svg";
import aiIcon from "../../../assets/icons/AI.svg";
import DashboardBanner from "../components/DashboardBanner";
import StatisticsCards from "../components/StatisticsCards";
import ActionCards from "../components/ActionCards";
import MyProjects from "../components/MyProjects";
import QuickActions from "../components/QuickActions";

const Dashboard = () => {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();
  const { projects, isLoadingProjects } = useProjects(selectedWorkspace);
  
  // Check if user has restricted role (supervisor, builder, contractor)
  const isRestricted = useRestrictedRole();
  const currentUserRole = useWorkspaceRole();

  // Statistics data - dynamic based on projects
  const statistics = useMemo(
    () => [
      {
        icon: Building2,
        value: projects.length.toString(),
        label: t("stats.totalProjects"),
        color: "blue",
      },
      {
        icon: Building,
        value: "12",
        label: t("stats.runningProjects"),
        color: "yellow",
      },
      {
        icon: Crown,
        value: "1,890",
        label: t("stats.activeSubscriptions"),
        color: "orange",
      },
      {
        icon: ChartLine,
        value: "105 Cr",
        label: t("stats.totalRevenue"),
        color: "purple",
      },
      {
        icon: BanknoteArrowDown,
        value: "50 Lakhs",
        label: t("stats.totalExpenses"),
        color: "orange",
      },
    ],
    [projects.length, t]
  );

  // Action cards data
  const actionCards = [
    {
      icon: calculatorIcon,
      isSvg: true,
      badge: t("actions.aiPowered"),
      badgeIcon: aiIcon,
      title: t("actions.constructionCalculator"),
      description: t("actions.calculatorDescription"),
      onClick: () => {},
    },
    {
      icon: Plus,
      title: t("actions.addUsage"),
      description: t("actions.addUsageDescription"),
      onClick: () => {},
    },
  ];

  // Quick actions data - filter Documents for restricted roles
  const quickActions = useMemo(() => {
    const allActions = [
      {
        icon: Building2,
        label: t("quickActions.myProjects"),
        onClick: () => navigate(ROUTES_FLAT.PROJECTS),
      },
      {
        icon: IndianRupee,
        label: t("quickActions.finance"),
        onClick: () => navigate(ROUTES_FLAT.FINANCE),
      },
      {
        icon: ClipboardList,
        label: t("quickActions.siteInventory"),
        onClick: () => {},
      },
      {
        icon: FileText,
        label: t("quickActions.documents"),
        badgeIcon: aiIcon,
        onClick: () => navigate(ROUTES_FLAT.DOCUMENTS),
      },
      {
        icon: Users,
        label: t("quickActions.labourSheet"),
        onClick: () => navigate(ROUTES_FLAT.LABOUR_ATTENDANCE),
      },
      {
        icon: Mic,
        label: t("quickActions.notes"),
        onClick: () => navigate(ROUTES_FLAT.NOTES),
      },
    ];
    
    // Filter actions based on role
    let filteredActions = allActions;
    
    // Hide Documents for restricted roles (supervisor, builder, contractor)
    if (isRestricted) {
      filteredActions = filteredActions.filter((action) => action.label !== t("quickActions.documents"));
    }
    
    // Hide Finance for supervisor role
    if (currentUserRole?.toLowerCase() === 'supervisor') {
      filteredActions = filteredActions.filter((action) => action.label !== t("quickActions.finance"));
    }
    
    return filteredActions;
  }, [t, navigate, isRestricted, currentUserRole]);

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <DashboardBanner onTryItNow={() => {}} />

        {!isRestricted && <StatisticsCards statistics={statistics} />}

        <ActionCards actionCards={actionCards} />

        <MyProjects
          projects={projects}
          onCreateProject={() => navigate(PROJECT_ROUTES.ADD_NEW_PROJECT)}
        />

        <QuickActions quickActions={quickActions} />
      </div>
    </>
  );
};

export default Dashboard;
