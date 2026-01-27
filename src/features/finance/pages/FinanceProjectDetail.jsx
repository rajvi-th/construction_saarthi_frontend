/**
 * Finance Project Detail Page
 * Static page showing finance overview for a project
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import PageHeader from '../../../components/layout/PageHeader';
import { useAuth } from '../../auth/store';
import { getFinancialSummary } from '../api/financeApi';
import { showError } from '../../../utils/toast';
import balanceIcon from '../../../assets/icons/balance.svg';
import siteIcon from '../../../assets/icons/site.svg';
import pendingIcon from '../../../assets/icons/pending.svg';
import estimatedIcon from '../../../assets/icons/estimated.svg';
import builderIcon from '../../../assets/icons/buider.svg';
import paymentIcon from '../../../assets/icons/payment.svg';
import expensesIcon from '../../../assets/icons/expencis.svg';
import paidIcon from '../../../assets/icons/paid.svg';

import { ChevronRight, ChevronDown } from 'lucide-react';
import downloadIcon from '../../../assets/icons/Download Minimalistic.svg';
import Dropdown from '../../../components/ui/Dropdown';
import { statusBadgeColors } from '../../../components/ui/StatusBadge';

export default function FinanceProjectDetail() {
  const { t } = useTranslation('finance');
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const { selectedWorkspace } = useAuth();
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [financialSummary, setFinancialSummary] = useState({
    balanceReceivable: 0,
    siteInventory: 0,
    pendingExpenses: 0,
    estimatedProfitLoss: 0,
    totalBuilderInvoices: 0,
    totalExpensesPaid: 0,
  });
  const [projectOverview, setProjectOverview] = useState({
    name: '',
    builder: '',
    contract_type: '',
    total_est_budget: '₹0',
    project_duration: '',
    address: '',
    status: 'completed',
  });
  const [status, setStatus] = useState('completed');

  // Project data will be populated from API
  const projectData = useMemo(() => ({
    name: location.state?.projectName || projectOverview.name || t('projectOverview', { defaultValue: 'Project Overview' }),
    builder: projectOverview.builder || '',
    contractType: projectOverview.contract_type || '',
    totalBudget: projectOverview.total_est_budget || '₹0',
    duration: projectOverview.project_duration || '',
    address: projectOverview.address || '',
  }), [projectOverview, location.state, t]);

  const statusOptions = [
    { value: 'completed', label: t('completed', { defaultValue: 'Completed' }) },
    { value: 'inProgress', label: t('inProgress', { defaultValue: 'In Progress' }) },
    { value: 'upcoming', label: t('upcoming', { defaultValue: 'Upcoming' }) },
  ];

  // Format amount with currency symbol
  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  // Memoize financeMetrics to recalculate when financialSummary changes
  const financeMetrics = useMemo(() => [
    {
      icon: balanceIcon,
      label: t('balanceReceivable', { defaultValue: 'Balance Receivable' }),
      amount: formatAmount(financialSummary.balanceReceivable),
      key: 'balanceReceivable'
    },
    {
      icon: siteIcon,
      label: t('siteInventory', { defaultValue: 'Site Inventory' }),
      amount: formatAmount(financialSummary.siteInventory),
      key: 'siteInventory'
    },
    {
      icon: pendingIcon,
      label: t('pendingExpenses', { defaultValue: 'Pending Expenses' }),
      amount: formatAmount(financialSummary.pendingExpenses),
      key: 'pendingExpenses'
    },
    {
      icon: estimatedIcon,
      label: t('estimatedProfitLoss', { defaultValue: 'Estimated Profit/Loss' }),
      amount: formatAmount(financialSummary.estimatedProfitLoss),
      key: 'estimatedProfitLoss'
    },
  ], [financialSummary, t]);

  // Fetch financial summary from API
  useEffect(() => {
    const fetchFinancialSummary = async () => {
      if (!projectId || !selectedWorkspace) {
        return;
      }

      try {
        setIsLoadingSummary(true);
        const response = await getFinancialSummary({
          project_id: projectId,
          workspace_id: selectedWorkspace,
        });

        console.log('Financial summary API response:', response);

        // Handle different response structures
        // Response structure: { data: { financial_summary: { ... }, project_overview: { ... } } }
        const responseData = response?.data || response || {};
        const summaryData = responseData.financial_summary || responseData.financialSummary || {};
        const overviewData = responseData.project_overview || responseData.projectOverview || {};

        console.log('Extracted summary data:', summaryData);
        console.log('Extracted overview data:', overviewData);

        // Set financial summary
        setFinancialSummary({
          balanceReceivable: summaryData.balanceReceivable || 0,
          siteInventory: summaryData.siteInventory || 0,
          pendingExpenses: summaryData.pendingExpenses || 0,
          estimatedProfitLoss: summaryData.estimatedProfitLoss || 0,
          totalBuilderInvoices: summaryData.totalBuilderInvoices || 0,
          totalExpensesPaid: summaryData.totalExpensesPaid || 0,
        });

        // Set project overview
        setProjectOverview({
          name: overviewData.name || overviewData.site_name || '',
          builder: overviewData.builder || '',
          contract_type: overviewData.contract_type || '',
          total_est_budget: overviewData.total_est_budget || '₹0',
          project_duration: overviewData.project_duration || '',
          address: overviewData.address || '',
          status: overviewData.status || 'completed',
        });

        // Update status dropdown
        const statusMap = {
          'in_progress': 'inProgress',
          'completed': 'completed',
          'upcoming': 'upcoming',
        };
        setStatus(statusMap[overviewData.status] || overviewData.status || 'completed');

        console.log('Set financial summary state:', {
          balanceReceivable: summaryData.balanceReceivable || 0,
          siteInventory: summaryData.siteInventory || 0,
          pendingExpenses: summaryData.pendingExpenses || 0,
          estimatedProfitLoss: summaryData.estimatedProfitLoss || 0,
          totalBuilderInvoices: summaryData.totalBuilderInvoices || 0,
          totalExpensesPaid: summaryData.totalExpensesPaid || 0,
        });
      } catch (error) {
        console.error('Error fetching financial summary:', error);
        const errorMessage = error?.response?.data?.message || error?.message || t('failedToLoadFinancialSummary', { defaultValue: 'Failed to load financial summary' });
        showError(errorMessage);
        // Keep default values (0) on error
      } finally {
        setIsLoadingSummary(false);
      }
    };

    fetchFinancialSummary();
  }, [projectId, selectedWorkspace, t]);

  // Format amount for cards (convert to Lakhs/Crores if needed)
  const formatCardAmount = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Convert to Lakhs if >= 100000, otherwise show as is
    if (numAmount >= 100000) {
      const lakhs = (numAmount / 100000).toFixed(1);
      return `₹${lakhs}L`;
    }
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  const financeCards = useMemo(() => [
    {
      icon: builderIcon,
      label: t('builderInvoices', { defaultValue: 'Builder Invoices' }),
      amount: formatCardAmount(financialSummary.totalBuilderInvoices),
      route: ROUTES_FLAT.FINANCE_BUILDER_INVOICES,
    },
    {
      icon: paymentIcon,
      label: t('paymentsReceived', { defaultValue: 'Payments Received' }),
      amount: formatCardAmount(financialSummary.balanceReceivable),
      route: ROUTES_FLAT.FINANCE_PAYMENT_RECEIVED,
    },
    {
      icon: expensesIcon,
      label: t('expensesToPay', { defaultValue: 'Expenses To Pay' }),
      amount: formatCardAmount(financialSummary.pendingExpenses),
      route: ROUTES_FLAT.FINANCE_EXPENSES_TO_PAY,
    },
    {
      icon: paidIcon,
      label: t('expensesPaid', { defaultValue: 'Expenses Paid' }),
      amount: formatCardAmount(financialSummary.totalExpensesPaid),
      route: ROUTES_FLAT.FINANCE_EXPENSES_PAID,
    },
  ], [financialSummary, t]);

  const handleCardClick = (route) => {
    navigate(getRoute(route, { projectId }), {
      state: { projectName: projectData.name }
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={`${t('finance', { defaultValue: 'Finance' })} • ${projectData.name}`}
        onBack={() => navigate(getRoute(ROUTES_FLAT.PROJECT_DETAILS, { id: projectId }), {
          state: { projectName: projectData.name }
        })}
      >
        <button
          onClick={() => {
            // TODO: Implement download functionality
            console.log('Download summary report');
          }}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-secondary cursor-pointer"
        >
          <img src={downloadIcon} alt="Download" className="w-4 h-4" />
          {t('downloadSummaryReport', { defaultValue: 'Download Summary Report' })}
        </button>
      </PageHeader>

      {/* ===== TOP METRIC CARDS (UNCHANGED) ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 cursor-pointer">
        {financeMetrics.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
          >
            <img src={item.icon} alt="" className="w-12 h-12" />
            <div>
              <p className="text-lg font-semibold text-primary">
                {item.amount}
              </p>
              <p className="text-sm text-secondary">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== PROJECT OVERVIEW (ONE FIELD PER ROW) ===== */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-primary px-6 pt-5 pb-3 border-b border-gray-200">
          {t('projectOverview', { defaultValue: 'Project Overview' })}
        </h2>

        <div>
          <OverviewRow label={t('builder', { defaultValue: 'Builder' })} value={projectData.builder} />
          <OverviewRow label={t('contractType', { defaultValue: 'Contract Type' })} value={projectData.contractType} />
          <OverviewRow label={t('totalEstBudget', { defaultValue: 'Total Est. Budget' })} value={projectData.totalBudget} />
          <OverviewRow label={t('projectDuration', { defaultValue: 'Project Duration' })} value={projectData.duration} />
          <OverviewRow label={t('address', { defaultValue: 'Address' })} value={projectData.address} />
          <OverviewRow
            label={t('status', { defaultValue: 'Status' })}
            value={
              <span
                className="px-3 py-1.5 rounded-full flex items-center gap-2 font-medium border inline-flex"
                style={{
                  borderColor: statusBadgeColors[status === 'completed' ? 'green' : status === 'inProgress' ? 'yellow' : 'blue'].border,
                  backgroundColor: statusBadgeColors[status === 'completed' ? 'green' : status === 'inProgress' ? 'yellow' : 'blue'].background,
                  color: statusBadgeColors[status === 'completed' ? 'green' : status === 'inProgress' ? 'yellow' : 'blue'].text,
                }}
              >
                {statusOptions.find(opt => opt.value === status)?.label || 'Completed'}
              </span>
            }
          />
        </div>
      </div>

      {/* ===== BOTTOM FINANCE CARDS (2 PER ROW, IMAGE SIDE) ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {financeCards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(card.route)}
            className="bg-white rounded-xl shadow-sm p-4 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={card.icon} alt="" className="w-15 h-15" />
                <div>
                  <p className="text-md font-medium text-primary">
                    {card.label}
                  </p>
                  <p className="text-sm text-secondary">
                    {card.amount}
                  </p>
                </div>
              </div>

              <ChevronRight className="text-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Reusable Overview Row ===== */
function OverviewRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row px-6 py-2 gap-1 sm:gap-0">

      {/* Label */}
      <div className="sm:w-32 shrink-0">
        <p className="text-sm text-secondary">
          {label}:
        </p>
      </div>

      {/* Value */}
      <div className="flex-1">
        <div className="text-sm font-medium text-primary break-words">
          {value}
        </div>
      </div>
    </div>
  );
}


