/**
 * Project Reports Page
 * Displays list of reports for a specific project
 */

import { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchBar from '../../../components/ui/SearchBar';
import Filter from '../../../components/ui/Filter';
import PageHeader from '../../../components/layout/PageHeader';
import { ReportCard } from '../components';
import { ROUTES, getRoute } from '../../../constants/routes';
import { useWorkspaceRole } from '../../dashboard/hooks';
import addCircleIcon from '../../../assets/icons/Add Circle.svg';

export default function ProjectReports() {
  const { t } = useTranslation('dpr');
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const projectName = location.state?.projectName || 'Project';
  const currentUserRole = useWorkspaceRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Check if user can add reports (builder role cannot add)
  const canAddReport = currentUserRole?.toLowerCase() !== 'builder';

  // Mock data - will be replaced with API integration later
  const MOCK_REPORTS = [
    {
      id: 1,
      title: 'Slab Shuttering Completed, RCC...',
      date: '2025-06-12',
      status: 'completed',
    },
    {
      id: 2,
      title: 'Plinth Completed and Flooring St...',
      date: '2025-06-12',
      status: 'completed',
    },
    {
      id: 3,
      title: 'Slab Shuttering Completed, RCC...',
      date: '2025-06-12',
      status: 'completed',
    },
    {
      id: 4,
      title: 'Plinth Completed and Flooring St...',
      date: '2025-06-12',
      status: 'completed',
    },
    {
      id: 5,
      title: 'Slab Shuttering Completed, RCC...',
      date: '2025-06-12',
      status: 'completed',
    },
    {
      id: 6,
      title: 'Plinth Completed and Flooring St...',
      date: '2025-06-12',
      status: 'completed',
    },
    {
      id: 7,
      title: 'Slab Shuttering Completed, RCC...',
      date: '2025-06-12',
      status: 'completed',
    },
  ];

  const STATUS_OPTIONS = [
    { value: '', label: t('filter.all') },
    { value: 'completed', label: t('filter.completed') },
    { value: 'in_progress', label: t('filter.inProgress') },
    { value: 'upcoming', label: t('filter.upcoming') },
  ];

  const handleReportClick = (report) => {
    navigate(
      getRoute(ROUTES.DPR.REPORT_DETAILS, { projectId, reportId: report.id }),
      {
        state: {
          report,
          projectName,
          projectId,
        },
      }
    );
  };

  const handleAddReport = () => {
    navigate(getRoute(ROUTES.DPR.ADD_REPORT, { projectId }), {
      state: {
        projectName,
        projectId,
      },
    });
  };

  // Filter reports based on search and status - using mock data
  const filteredReports = useMemo(() => {
    return MOCK_REPORTS.filter((report) => {
      const matchesSearch =
        !searchQuery ||
        (report.title || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (report.description || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        (report.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <PageHeader title={projectName}
          showBackButton={true}
          backTo={ROUTES.DPR.LIST}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-3 flex-1 w-full lg:justify-end">
              <SearchBar
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-auto sm:min-w-[260px]"
              />

              <Filter
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder={t('filter.label')}
                className="w-full sm:w-[140px] flex-shrink-0"
              />

              {canAddReport && (
                <button
                  type="button"
                  onClick={handleAddReport}
                  className="flex items-center justify-center sm:justify-start gap-2 text-accent font-medium whitespace-normal sm:whitespace-nowrap flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity w-full sm:w-auto"
                >
                  <img 
                    src={addCircleIcon} 
                    alt="Add" 
                    className="w-5 h-5 flex-shrink-0"
                  />
                  <span className="text-sm sm:text-base">{t('actions.addReport')}</span>
                </button>
              )}
            </div>
          </PageHeader>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-secondary text-lg mb-2">{t('emptyState.noReports')}</p>
              <p className="text-secondary text-sm">
                {searchQuery || statusFilter
                  ? t('emptyState.adjustSearch')
                  : t('emptyState.getStarted')}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => handleReportClick(report)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

