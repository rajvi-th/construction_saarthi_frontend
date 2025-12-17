/**
 * Daily Progress Report Main Page
 * Displays list of projects for DPR
 * Currently using mock data - API integration pending
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchBar from '../../../components/ui/SearchBar';
import Filter from '../../../components/ui/Filter';
import PageHeader from '../../../components/layout/PageHeader';
import { ProjectCard } from '../components';
import { ROUTES, getRoute } from '../../../constants/routes';

// Mock data - will be replaced with API integration later
const MOCK_PROJECTS = [
  {
    id: 1,
    site_name: 'Shiv Residency, Bopal',
    name: 'Shiv Residency, Bopal',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  },
  {
    id: 2,
    site_name: 'Nirmaan Homes, Surat',
    name: 'Nirmaan Homes, Surat',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
  },
  {
    id: 3,
    site_name: 'Shivaay Homes, Rajasthan',
    name: 'Shivaay Homes, Rajasthan',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
  },
  {
    id: 4,
    site_name: 'Shree Villa, Surat',
    name: 'Shree Villa, Surat',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400',
  },
  {
    id: 5,
    site_name: 'Shiv Residency, Bopal',
    name: 'Shiv Residency, Bopal',
    address: '86, Veer Nariman Road, Churchgate, Mumbai',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
  },
];

export default function DailyProgressReport() {
  const { t } = useTranslation('dpr');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const STATUS_OPTIONS = [
    { value: '', label: t('filter.all') },
    { value: 'completed', label: t('filter.completed') },
    { value: 'in_progress', label: t('filter.inProgress') },
    { value: 'upcoming', label: t('filter.upcoming') },
  ];

  const handleProjectClick = (project) => {
    navigate(getRoute(ROUTES.DPR.PROJECT_REPORTS, { projectId: project.id }), {
      state: {
        projectName: project.site_name || project.name,
        projectId: project.id,
      },
    });
  };

  // Filter projects based on search and status - using mock data
  const filteredProjectsList = useMemo(() => {
    return MOCK_PROJECTS.filter((project) => {
      const matchesSearch =
        !searchQuery ||
        (project.site_name || project.name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (project.address || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Status filter - mock projects don't have status, so we'll skip this for now
      // const matchesStatus =
      //   !statusFilter ||
      //   (project.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch; // && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        {/* Header Section */}
        <div className="mb-6">
          <PageHeader title={t('header.title')}>
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
            </div>
          </PageHeader>
        </div>

        {/* Projects List */}
        {filteredProjectsList.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-secondary text-lg mb-2">{t('emptyState.noProjects')}</p>
              <p className="text-secondary text-sm">
                {searchQuery || statusFilter
                  ? t('emptyState.adjustSearch')
                  : t('emptyState.getStarted')}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProjectsList.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>
        )}
      </div>
  );
}

