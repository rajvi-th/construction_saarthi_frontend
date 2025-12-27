import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import SearchBar from '../../../components/ui/SearchBar';
import Dropdown from '../../../components/ui/Dropdown';
import Loader from '../../../components/ui/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import EmptyStateSvg from '../../../assets/icons/EmptyState.svg';
import { GalleryProjectCard } from '../components';
import { useProjects } from '../../projects/hooks';
import { useAuth } from '../../../hooks/useAuth';

export default function ProjectGallery() {
  const { t } = useTranslation('projectGallery');
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();

  const {
    filteredProjects,
    isLoading,
    isFetchingProjects,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = useProjects(selectedWorkspace);

  // Status filter options
  const statusOptions = [
    { value: '', label: t('filterOptions.all', { defaultValue: 'All' }) },
    { value: 'in_progress', label: t('filterOptions.inProcess', { defaultValue: 'In Process' }) },
    { value: 'completed', label: t('filterOptions.completed', { defaultValue: 'Completed' }) },
    { value: 'upcoming', label: t('filterOptions.upcoming', { defaultValue: 'Upcoming' }) },
  ];

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value || '');
  };

  return (
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <PageHeader
          title={t('title', { defaultValue: 'Projects Gallery' })}
          showBackButton={false}
          className="capitalize!"
        >
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <SearchBar
              placeholder={t('searchPlaceholder', { defaultValue: 'Search projects' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[260px]"
            />
            <Dropdown
              options={statusOptions}
              value={statusFilter || ''}
              onChange={handleStatusFilterChange}
              placeholder={t('filter', { defaultValue: 'Filter' })}
              className="w-full sm:w-[180px]"
            />
          </div>
        </PageHeader>

        {/* Projects List */}
        {isFetchingProjects || isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            image={EmptyStateSvg}
            title={t('emptyState.noProjects', { defaultValue: 'No projects found' })}
            message={
              searchQuery || statusFilter
                ? t('emptyState.adjustSearch', { defaultValue: 'Try adjusting your search or filter' })
                : t('emptyState.getStarted', { defaultValue: 'Get started by adding a project' })
            }
            padding="lg"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.map((project) => (
              <GalleryProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
  );
}
