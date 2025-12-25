/**
 * Finance Project Detail Page
 * Static page showing finance overview for a project
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import PageHeader from '../../../components/layout/PageHeader';
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
  const { projectId } = useParams();
  const [status, setStatus] = useState('completed');

  const projectData = {
    name: 'Shivaay Residency ',
    builder: 'Mr. Anil Shah',
    contractType: 'Labour + Material',
    totalBudget: '₹1.2 Cr',
    duration: 'Mar 2025 - Mar 2026',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
  };

  const statusOptions = [
    { value: 'completed', label: t('completed', { defaultValue: 'Completed' }) },
    { value: 'inProgress', label: t('inProgress', { defaultValue: 'In Progress' }) },
    { value: 'upcoming', label: t('upcoming', { defaultValue: 'Upcoming' }) },
  ];

  const financeMetrics = [
    { icon: balanceIcon, label: t('balanceReceivable', { defaultValue: 'Balance Receivable' }), amount: '₹90,00,000' },
    { icon: siteIcon, label: t('siteInventory', { defaultValue: 'Site Inventory' }), amount: '₹200,00,000' },
    { icon: pendingIcon, label: t('pendingExpenses', { defaultValue: 'Pending Expenses' }), amount: '₹60,00,000' },
    { icon: estimatedIcon, label: t('estimatedProfitLoss', { defaultValue: 'Estimated Profit/Loss' }), amount: '₹15,00,000' },
  ];

  const financeCards = [
    {
      icon: builderIcon,
      label: t('builderInvoices', { defaultValue: 'Builder Invoices' }),
      amount: '₹60.0L',
      route: ROUTES_FLAT.FINANCE_BUILDER_INVOICES,
    },
    {
      icon: paymentIcon,
      label: t('paymentsReceived', { defaultValue: 'Payments Received' }),
      amount: '₹45.0L',
      route: ROUTES_FLAT.FINANCE_PAYMENT_RECEIVED,
    },
    {
      icon: expensesIcon,
      label: t('expensesToPay', { defaultValue: 'Expenses To Pay' }),
      amount: '₹35.0L',
      route: ROUTES_FLAT.FINANCE_EXPENSES_TO_PAY,
    },
    {
      icon: paidIcon,
      label: t('expensesPaid', { defaultValue: 'Expenses Paid' }),
      amount: '₹30.0L',
      route: ROUTES_FLAT.FINANCE_EXPENSES_PAID,
    },
  ];

  const handleCardClick = (route) => {
    navigate(getRoute(route, { projectId }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={`${t('finance', { defaultValue: 'Finance' })} • ${projectData.name}`}
        onBack={() => navigate(-1)}
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
              <Dropdown
                options={statusOptions}
                value={status}
                onChange={setStatus}
                className="w-40"
                customButton={(isOpen, setIsOpen) => {
                  const selectedOption = statusOptions.find(opt => opt.value === status);
                  let colors;
                  if (status === 'completed') {
                    colors = statusBadgeColors.green;
                  } else if (status === 'inProgress') {
                    colors = statusBadgeColors.yellow;
                  } else if (status === 'upcoming') {
                    colors = statusBadgeColors.blue;
                  } else {
                    colors = statusBadgeColors.green; // default
                  }
                  return (
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className="px-3 py-1.5 rounded-full flex items-center gap-2 font-medium border transition-colors cursor-pointer"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text,
                      }}
                    >
                      <span>{selectedOption?.label || 'Completed'}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        style={{ color: colors.text }}
                      />
                    </button>
                  );
                }}
              />
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


