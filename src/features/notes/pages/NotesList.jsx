/**
 * Notes List Page
 * Shows list of projects with search and status filter
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import PageHeader from '../../../components/layout/PageHeader';
import SearchBar from '../../../components/ui/SearchBar';
import Dropdown from '../../../components/ui/Dropdown';
import { useAuth } from '../../../features/auth/store/authStore';
import { useNotesProjects } from '../hooks/useNotesProjects';

export default function NotesList() {
  const { t } = useTranslation('notes');
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  // Fetch projects from API
  const { projects, isLoading } = useNotesProjects(selectedWorkspace);

  const statusOptions = [
    { value: 'completed', label: t('completed') },
    { value: 'inProgress', label: t('inProgress') },
  ];

  const handleProjectClick = (projectId) => {
    navigate(getRoute(ROUTES_FLAT.NOTES_PROJECT_NOTES, { projectId }));
  };

  const handleImageError = (projectId) => {
    setImageErrors((prev) => ({ ...prev, [projectId]: true }));
  };

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [projects, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t('title')}
        onBack={() => navigate(-1)}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 md:gap-4">
          <SearchBar
            placeholder={t('searchProjects')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:flex-1 lg:w-[300px] lg:flex-none sm:min-w-0"
          />
          <Dropdown
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder={t('status')}
            className="w-full sm:w-36 md:w-40 flex-shrink-0"
          />
        </div>
      </PageHeader>

      {/* Projects List */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-sm sm:text-base text-secondary">{t('loading', { defaultValue: 'Loading...' })}</div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-sm sm:text-base text-secondary">{t('noProjects', { defaultValue: 'No projects found' })}</div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredProjects.map((project) => {
              const hasImageError = imageErrors[project.id];
              const imageSrc = project.image;
              // Only show image if API provides valid, non-empty image URL and no error occurred
              // No default image - only show what API provides
              const isValidImage = imageSrc !== null &&
                imageSrc !== undefined &&
                typeof imageSrc === 'string' &&
                imageSrc.trim() !== '' &&
                !hasImageError;
              const showImage = isValidImage;

              return (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer shadow-md transition-shadow"
                >
                  {/* Project Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {showImage ? (
                      <img
                        src={imageSrc}
                        alt={project.name}
                        onError={() => handleImageError(project.id)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-1">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 mb-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-[10px] sm:text-xs text-center leading-tight">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Project Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-primary mb-1 truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary mb-2 line-clamp-1">{project.address}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-secondary">
                        {t('budget')}: <span className="font-medium text-primary">{project.budget}</span>
                      </span>
                      <span className="text-secondary">
                        {t('balance')}: <span className="font-medium text-primary">{project.balance}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

