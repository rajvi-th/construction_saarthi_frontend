/**
 * PastProjects Page
 * "My Past Work" screen with search + empty state CTA.
 */

import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import EmptyStateSvg from '../../../assets/icons/EmptyState.svg';
import { ROUTES_FLAT } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';
import { usePastProjects } from '../hooks/usePastProjects';
import { startPastProject } from '../api/pastProjectApi';
import { showError } from '../../../utils/toast';

export default function PastProjects() {
  const { t } = useTranslation(['pastProjects', 'common', 'projects']);
  const navigate = useNavigate();
  const { selectedWorkspace, user } = useAuth();
  const { items, isLoading, fetchPastProjects } = usePastProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProjectKey, setIsLoadingProjectKey] = useState(false);

  useEffect(() => {
    if (!selectedWorkspace || !user?.id) return;
    fetchPastProjects({
      workspaceId: selectedWorkspace,
      userId: user.id,
    });
  }, [selectedWorkspace, user?.id, fetchPastProjects]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return (items || []).filter((project) => {
      const name = (project.name || project.title || '').toLowerCase();
      const address = (project.address || project.location || '').toLowerCase();
      return name.includes(q) || address.includes(q);
    });
  }, [items, searchQuery]);

  const handleAddProject = async () => {
    if (!selectedWorkspace) {
      showError(t('validation.workspaceRequired', { defaultValue: 'Workspace is required' }));
      return;
    }

    setIsLoadingProjectKey(true);

    try {
      // Call startPastProject API when Add Project button is clicked
      const startResponse = await startPastProject(selectedWorkspace);
      const projectKey = startResponse?.projectKey || startResponse?.data?.projectKey;

      if (!projectKey) {
        throw new Error('Failed to get project key from start API');
      }

      // Navigate with the new projectKey
      navigate(ROUTES_FLAT.PAST_PROJECTS_ADD, {
        state: {
          projectKey: projectKey,
        },
      });
    } catch (error) {
      console.error('Error getting project key:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t('error.failedToStart', { defaultValue: 'Failed to start project. Please try again.' });
      showError(errorMessage);
    } finally {
      setIsLoadingProjectKey(false);
    }
  };

  const handleProjectClick = async (project) => {
    if (!selectedWorkspace) {
      showError(t('validation.workspaceRequired', { defaultValue: 'Workspace is required' }));
      return;
    }

    setIsLoadingProjectKey(true);

    try {
      // Call startPastProject API every time project card is clicked
      const startResponse = await startPastProject(selectedWorkspace);
      const projectKey = startResponse?.projectKey || startResponse?.data?.projectKey;

      if (!projectKey) {
        throw new Error('Failed to get project key from start API');
      }

      // Navigate with the new projectKey
      navigate(ROUTES_FLAT.PAST_PROJECTS_ADD, {
        state: {
          projectKey: projectKey,
          project: project, 
        },
      });
    } catch (error) {
      console.error('Error getting project key:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t('error.failedToStart', { defaultValue: 'Failed to start project. Please try again.' });
      showError(errorMessage);
    } finally {
      setIsLoadingProjectKey(false);
    }
  };

  // Get project image from pastWorkMedia array (only non-deleted items)
  const getProjectImage = (project) => {
    if (!project.pastWorkMedia || !Array.isArray(project.pastWorkMedia)) {
      return null;
    }
    
    // Filter out deleted items and get the first available image
    const activeMedia = project.pastWorkMedia.filter(
      (media) => !media.isDeleted && media.url
    );
    
    // Prefer image types (typeId 1 or 3), fallback to any media
    const imageMedia = activeMedia.find(
      (media) => media.typeId === '1' || media.typeId === 1 || media.typeId === '3' || media.typeId === 3
    );
    
    return imageMedia?.url || activeMedia[0]?.url || null;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t('title', {
          ns: 'pastProjects',
          defaultValue: 'My Past Work',
        })}
        showBackButton={false}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-[260px]">
            <SearchBar
              placeholder={t('search.placeholder', {
                ns: 'projects',
                defaultValue: 'Search Projects',
              })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddProject}
            leftIconName="Plus"
            className="whitespace-nowrap flex-shrink-0"
            disabled={isLoadingProjectKey}
          >
            {isLoadingProjectKey ? (
              <div className="flex items-center gap-2">
                <Loader size="sm" />
                <span>{t('loading', { defaultValue: 'Loading...' })}</span>
              </div>
            ) : (
              t('addButton', {
                ns: 'pastProjects',
                defaultValue: 'Add Project (Site)',
              })
            )}
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" />
        </div>
      ) : !filteredItems || filteredItems.length === 0 ? (
        <EmptyState
          image={EmptyStateSvg}
          title={t('emptyTitle', {
            ns: 'pastProjects',
            defaultValue: 'No Project Added',
          })}
          message={t('emptyMessage', {
            ns: 'pastProjects',
            defaultValue: 'Add your projects to show in your proposal.',
          })}
          actionLabel={t('addButton', {
            ns: 'pastProjects',
            defaultValue: 'Add Project (Site)',
          })}
          onAction={handleAddProject}
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredItems.map((project, idx) => {
            const projectName = project.name || project.title || t('untitled', {
              ns: 'pastProjects',
              defaultValue: 'Untitled Project',
            });
            const address = project.address || project.location || '';
            const imageSrc = getProjectImage(project);

            return (
              <div
                key={project.id || project.projectKey || idx}
                onClick={() => handleProjectClick(project)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ opacity: isLoadingProjectKey ? 0.6 : 1 }}
              >
                <div className="flex gap-4 items-center">
                  {/* Project Image - Only show if image exists */}
                  {imageSrc && (
                    <div className="flex-shrink-0">
                      <img
                        src={imageSrc}
                        alt={projectName}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover"
                      />
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-primary mb-1 line-clamp-1 capitalize">
                      {projectName}
                    </h3>
                    {address && (
                      <p className="text-xs sm:text-sm text-secondary mb-2 line-clamp-2 capitalize  ">
                        {address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


