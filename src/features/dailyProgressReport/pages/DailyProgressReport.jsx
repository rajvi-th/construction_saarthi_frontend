/**
 * Daily Progress Report Main Page
 * Displays list of projects for DPR
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchBar from '../../../components/ui/SearchBar';
import Filter from '../../../components/ui/Filter';
import PageHeader from '../../../components/layout/PageHeader';
import { ProjectCard } from '../components';
import { ROUTES, getRoute } from '../../../constants/routes';
import { getAllProjects } from '../../projects/api/projectApi';
import { useAuth } from '../../auth/store';
import { showError } from '../../../utils/toast';

export default function DailyProgressReport() {
  const { t } = useTranslation('dpr');
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const isFetchingRef = useRef(false); // Prevent duplicate API calls

  const STATUS_OPTIONS = [
    { value: '', label: t('filter.all') },
    { value: 'completed', label: t('filter.completed') },
    { value: 'in_progress', label: t('filter.inProgress') },
    { value: 'upcoming', label: t('filter.upcoming') },
  ];

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedWorkspace) {
        setProjects([]);
        return;
      }

      // Prevent duplicate calls
      if (isFetchingRef.current) {
        return;
      }

      try {
        isFetchingRef.current = true;
        setIsLoadingProjects(true);
        const response = await getAllProjects(selectedWorkspace);
        
        // Transform API response to match component structure
        const transformedProjects = response.map((project) => {
          const details = project.details || {};
          
          // Get image from profilePhoto
          const getImageUrl = (media) => {
            if (!media) return null;
            if (typeof media === 'string') return media;
            if (Array.isArray(media) && media.length > 0) {
              return typeof media[0] === 'string' ? media[0] : media[0]?.url;
            }
            if (typeof media === 'object' && media.url) return media.url;
            return null;
          };

          return {
            id: project.id || project.project_id,
            site_name: project.name || details.name || 'Untitled Project',
            name: project.name || details.name || 'Untitled Project',
            address: details.address || project.address || '',
            image: getImageUrl(project.profilePhoto) || getImageUrl(details.profilePhoto) || null,
            status: project.status || details.status || 'in_progress',
          };
        });

        setProjects(transformedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        const errorMessage = error?.response?.data?.message || error?.message || t('error.fetchProjects', { defaultValue: 'Failed to load projects' });
        showError(errorMessage);
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
        isFetchingRef.current = false;
      }
    };

    fetchProjects();
  }, [selectedWorkspace]); // Removed 't' from dependencies as translation functions are stable

  const handleProjectClick = (project) => {
    navigate(getRoute(ROUTES.DPR.PROJECT_REPORTS, { projectId: project.id }), {
      state: {
        projectName: project.site_name || project.name,
        projectId: project.id,
      },
    });
  };

  // Filter projects based on search and status
  const filteredProjectsList = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        !searchQuery ||
        (project.site_name || project.name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (project.address || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        (project.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        {/* Header Section */}
        <div className="mb-6">
          <PageHeader title={t('header.title')}
          showBackButton={false}
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
            </div>
          </PageHeader>
        </div>

        {/* Projects List */}
        {isLoadingProjects ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-secondary text-lg">{t('loading', { defaultValue: 'Loading projects...' })}</p>
            </div>
          </div>
        ) : filteredProjectsList.length === 0 ? (
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

