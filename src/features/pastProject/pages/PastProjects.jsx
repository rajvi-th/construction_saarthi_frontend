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
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import { PAST_PROJECT_ROUTES } from '../constants';
import { useAuth } from '../../../hooks/useAuth';
import { usePastProjects } from '../hooks/usePastProjects';
import { startPastProject } from '../api/pastProjectApi';
import { showError } from '../../../utils/toast';

// Placeholder image (SVG data URI)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBhc3QgUHJvamVjdDwvdGV4dD48L3N2Zz4=';

// Project Card Component with image error handling
function ProjectCard({ project, imageSrc, placeholderImage, onProjectClick, isLoadingProjectKey, t }) {
  const [imageError, setImageError] = useState(false);
  const projectName = project.name || project.title || t('untitled', {
    ns: 'pastProjects',
    defaultValue: 'Untitled Project',
  });
  const address = project.address || project.location || '';
  const displayImage = imageError ? placeholderImage : imageSrc;

  return (
    <div
      onClick={onProjectClick}
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      style={{ opacity: isLoadingProjectKey ? 0.6 : 1 }}
    >
      <div className="flex gap-4 items-center">
        {/* Project Image - Always show */}
        <div className="flex-shrink-0">
          <img
            src={displayImage}
            alt={projectName}
            onError={() => setImageError(true)}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover bg-gray-100"
          />
        </div>

        {/* Project Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-primary mb-1 line-clamp-1 capitalize">
            {projectName}
          </h3>
          {address && (
            <p className="text-xs sm:text-sm text-secondary mb-2 line-clamp-2 capitalize">
              {address}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

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

  const handleProjectClick = (project) => {
    // Get project ID (can be id, projectKey, or _id)
    const projectId = project.id || project.projectKey || project._id;

    if (!projectId) {
      showError(t('error.projectIdNotFound', { defaultValue: 'Project ID not found' }));
      return;
    }

    // Navigate to project detail page
    navigate(getRoute(PAST_PROJECT_ROUTES.DETAILS, { id: projectId }), {
      state: {
        project: project,
      },
    });
  };

  // Helper function to get first valid URL from array or string
  const getFirstImageUrl = (value) => {
    if (!value) return null;
    if (Array.isArray(value)) {
      return value.length > 0 ? value[0] : null;
    }
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
    return null;
  };

  // Get project image from multiple sources with fallback
  const getProjectImage = (project) => {
    // 1. Check pastWorkMedia array (only non-deleted items)
    if (project.pastWorkMedia && Array.isArray(project.pastWorkMedia)) {
      const activeMedia = project.pastWorkMedia.filter(
        (media) => !media.isDeleted && media.url
      );

      // Prefer image types (typeId 1, 3, or 12), fallback to any media
      const imageMedia = activeMedia.find(
        (media) => {
          const typeId = String(media.typeId || '');
          return typeId === '1' || typeId === '3' || typeId === '12' || 
                 media.typeId === 1 || media.typeId === 3 || media.typeId === 12;
        }
      );

      if (imageMedia?.url) return imageMedia.url;
      
      // Fallback: find first image by file extension
      const imageByExtension = activeMedia.find((media) => {
        const url = (media.url || '').toLowerCase();
        return url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
      });
      if (imageByExtension?.url) return imageByExtension.url;
      
      // Last fallback: any media
      if (activeMedia[0]?.url) return activeMedia[0].url;
    }

    // 2. Check array fields (API returns arrays)
    const profilePhotoUrl = getFirstImageUrl(project.profilePhoto);
    if (profilePhotoUrl) return profilePhotoUrl;

    const photoUrl = getFirstImageUrl(project.photo);
    if (photoUrl) return photoUrl;

    const myPastWorkphotoUrl = getFirstImageUrl(project.myPastWorkphoto);
    if (myPastWorkphotoUrl) return myPastWorkphotoUrl;

    // 3. Check string fields (backward compatibility)
    if (project.profile_photo) {
      const url = getFirstImageUrl(project.profile_photo);
      if (url) return url;
    }
    if (project.image) {
      const url = getFirstImageUrl(project.image);
      if (url) return url;
    }

    // 4. Return placeholder if no image found
    return PLACEHOLDER_IMAGE;
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
            const imageSrc = getProjectImage(project);
            return (
              <ProjectCard
                key={project.id || project.projectKey || idx}
                project={project}
                imageSrc={imageSrc}
                placeholderImage={PLACEHOLDER_IMAGE}
                onProjectClick={() => handleProjectClick(project)}
                isLoadingProjectKey={isLoadingProjectKey}
                t={t}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}


