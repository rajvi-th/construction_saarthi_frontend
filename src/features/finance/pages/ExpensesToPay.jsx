/**
 * Expenses To Pay Page
 * Shows list of sections for expenses to pay
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import { useAuth } from '../../../features/auth/store/authStore';
import PageHeader from '../../../components/layout/PageHeader';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import CreateSectionModal from '../../../components/ui/CreateSectionModal';
import { useExpenseSections } from '../hooks/useExpenseSections';
import emptyStateIcon from '../../../assets/icons/EmptyState.svg';
import { Plus, ChevronRight } from 'lucide-react';

export default function ExpensesToPay() {
  const { t } = useTranslation('finance');
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { selectedWorkspace } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateSectionModalOpen, setIsCreateSectionModalOpen] = useState(false);

  // Use API hook for expense sections
  const { sections, isLoading, isCreating, createSection } = useExpenseSections(projectId);

  // Handle create section
  const handleCreateSection = async (sectionName) => {
    if (!selectedWorkspace) {
      console.error('Workspace ID is required');
      return;
    }
    const newSection = await createSection(sectionName, selectedWorkspace);
    if (newSection) {
      setIsCreateSectionModalOpen(false);
    }
  };

  // Handle section click - navigate to payable bills page
  const handleSectionClick = (section) => {
    navigate(
      `/finance/projects/${projectId}/expenses-to-pay/sections/${section.id}`,
      {
        state: { sectionName: section.name },
      }
    );
  };

  // Filter sections based on search
  const filteredSections = (sections || []).filter((section) =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t('expensesToPay', { defaultValue: 'Expenses To Pay' })}
        onBack={() => navigate(getRoute(ROUTES_FLAT.FINANCE_PROJECT_DETAILS, { projectId }))}
      >
        {!isLoading && sections.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <SearchBar
              placeholder={t('searchSections', { defaultValue: 'Search sections' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[260px]"
            />
            <Button
              onClick={() => setIsCreateSectionModalOpen(true)}
              disabled={isCreating}
              className="flex items-center gap-2 whitespace-nowrap w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 text-accent bg-white rounded-full p-1 font-bold" />
              {t('createSection', { defaultValue: 'Create Section' })}
            </Button>
          </div>
        ) : null}
      </PageHeader>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-secondary">{t('loading', { defaultValue: 'Loading...' })}</p>
        </div>
      ) : (
        <>
          {/* Sections List or Empty State */}
          {filteredSections.length > 0 ? (
            <div className="space-y-3">
              {filteredSections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-xl shadow-sm p-4 cursor-pointer border border-gray-50"
                  onClick={() => handleSectionClick(section)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-primary">
                      {section.name}
                    </span>
                    <ChevronRight className="w-5 h-5 text-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-full max-w-[430px] mb-6">
                <img src={emptyStateIcon} alt="Empty State" className="w-full" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-primary mb-2">
                {t('noSectionsCreated', { defaultValue: 'No Sections Created' })}
              </h3>
              <p className="text-md sm:text-base text-secondary text-center mb-6 max-w-md">
                {t('createProjectSectionsPayables', {
                  defaultValue:
                    'Create your project sections to manage payables more efficiently.',
                })}
              </p>
              <Button
                onClick={() => setIsCreateSectionModalOpen(true)}
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                  <Plus className="w-3 h-3 text-accent" strokeWidth={3} />
                </div>
                {t('createSection', { defaultValue: 'Create Section' })}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Section Modal */}
      <CreateSectionModal
        isOpen={isCreateSectionModalOpen}
        onClose={() => setIsCreateSectionModalOpen(false)}
        onCreate={handleCreateSection}
      />
    </div>
  );
}

