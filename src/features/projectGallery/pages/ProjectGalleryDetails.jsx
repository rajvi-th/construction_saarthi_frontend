import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Play, X, FileText } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import SearchBar from '../../../components/ui/SearchBar';
import Dropdown from '../../../components/ui/Dropdown';
import Loader from '../../../components/ui/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import EmptyStateSvg from '../../../assets/icons/EmptyState.svg';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Button from '../../../components/ui/Button';
import FileUpload from '../../../components/ui/FileUpload';
import { useProjectDetails } from '../../projects/hooks';
import { useProjectGallery } from '../hooks';
import { useAuth } from '../../../hooks/useAuth';
import { useWorkspaceRole } from '../../dashboard/hooks';
import { ROUTES_FLAT } from '../../../constants/routes';
import Tabs from '../components/Tabs';
import { DocumentCard, VideoCard, PhotoCard } from '../components';
import { uploadProjectMedia } from '../api/projectGalleryApi';
import { showSuccess, showError } from '../../../utils/toast';

export default function ProjectGalleryDetails() {
  const { t } = useTranslation('projectGallery');
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();
  const currentUserRole = useWorkspaceRole();
  const [activeTab, setActiveTab] = useState('photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Get project ID from params or location state
  const projectIdFromState = location.state?.projectId;
  const finalProjectId = projectId || projectIdFromState;

  const { project, isLoading: isLoadingProject, refetch: refetchProject } = useProjectDetails(finalProjectId, selectedWorkspace);

  // Map activeTab to API type parameter
  const getTypeFromTab = (tab) => {
    switch (tab) {
      case 'photos':
        return 'photo';
      case 'videos':
        return 'video';
      case 'documents':
        return 'document';
      default:
        return null;
    }
  };

  // Map filterValue to dateFilter parameter
  const getDateFilter = (filter) => {
    if (!filter || filter === '') return null;
    // Map filter values to API dateFilter values
    switch (filter) {
      case 'recent':
        return 'recent';
      case 'oldest':
        return 'oldest';
      default:
        return 'custom';
    }
  };

  // Fetch gallery items from API
  const apiType = getTypeFromTab(activeTab);
  const apiDateFilter = getDateFilter(filterValue);
  const { galleryItems, isLoading: isLoadingGallery, deleteMedia, refetch } = useProjectGallery(
    finalProjectId,
    apiType,
    apiDateFilter
  );

  useEffect(() => {
    if (finalProjectId && location.state?.fromUpload) {
      refetch();
      if (typeof refetchProject === 'function') refetchProject();
      window.history.replaceState({ ...location.state, fromUpload: false }, '');
    }
  }, [finalProjectId, location.state?.fromUpload, refetch, refetchProject]);

  // Group items by date for documents
  const groupItemsByDate = (items) => {
    const grouped = {};
    items.forEach((item) => {
      const date = item.date || (item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : 'Unknown');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  // Filter items by search query
  const filteredItems = galleryItems.filter((item) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const fileName = item.name || item.fileName || (item.url ? item.url.split('/').pop() : '');
    return (
      fileName.toLowerCase().includes(searchLower) ||
      item.url?.toLowerCase().includes(searchLower) ||
      item.title?.toLowerCase().includes(searchLower)
    );
  });

  // Group filtered items by date for documents, videos, and photos
  const groupedDocuments = activeTab === 'documents' ? groupItemsByDate(filteredItems) : {};
  const groupedVideos = activeTab === 'videos' ? groupItemsByDate(filteredItems) : {};
  const groupedPhotos = activeTab === 'photos' ? groupItemsByDate(filteredItems) : {};

  const isLoading = isLoadingProject || isLoadingGallery;

  // Check if user can delete (builder role cannot delete)
  const canDelete = currentUserRole?.toLowerCase() !== 'builder';

  // Tabs configuration
  const tabs = [
    { id: 'photos', label: t('tabs.photos', { defaultValue: 'Photos' }) },
    { id: 'videos', label: t('tabs.videos', { defaultValue: 'Videos' }) },
    { id: 'documents', label: t('tabs.documents', { defaultValue: 'Documents' }) },
  ];

  const handleFilterChange = (value) => {
    setFilterValue(value || '');
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
  };

  const handleDeleteCancel = () => {
    setItemToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete?.id) return;

    try {
      setIsDeleting(true);
      await deleteMedia(itemToDelete.id);
      setItemToDelete(null);
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsDeleting(false);
    }
  };

  // Get file type
  const getFileType = (file) => {
    const type = file.type || '';
    if (type.startsWith('image/')) return 'photo';
    if (type.startsWith('video/')) return 'video';
    return 'document';
  };

  // Create preview URL
  const createPreviewUrl = (file) => {
    return URL.createObjectURL(file);
  };

  const handleFileSelect = (files) => {
    if (files.length > 0) {
      // Validate file types and sizes
      const validFiles = files.filter((file) => {
        const fileType = file.type || '';
        const isValidType =
          fileType.startsWith('image/') ||
          fileType.startsWith('video/') ||
          fileType === 'application/pdf';
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

        if (!isValidType) {
          showError(t('upload.error', { defaultValue: 'Invalid file type. Only JPG, PNG, MP4, and PDF are allowed.' }));
        }
        if (!isValidSize) {
          showError(t('upload.error', { defaultValue: 'File size exceeds 10MB limit.' }));
        }

        return isValidType && isValidSize;
      });

      if (validFiles.length > 0) {
        // Trigger upload immediately with valid files
        const newFileInstances = validFiles.map(file => file);
        handleUpload(newFileInstances);
      }
    }
  };

  const handleUpload = async (filesToUpload) => {
    if (!filesToUpload || filesToUpload.length === 0 || !finalProjectId) {
      return;
    }

    try {
      setIsUploading(true);

      // Store uploading files in state for preview during upload
      const filesWithPreview = filesToUpload.map((file) => {
        const fileType = getFileType(file);
        return {
          file,
          id: Date.now() + Math.random(),
          fileType,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl: fileType === 'photo' || fileType === 'video' ? createPreviewUrl(file) : null,
        };
      });
      setSelectedFiles(filesWithPreview);

      // 1. Get IDs of existing media from the project object
      const existingMedia = project?.media || [];
      const keepMediaIds = existingMedia
        .filter(item => {
          const typeId = String(item.typeId || item.type_id || '');
          return typeId !== '1';
        })
        .map(item => item.id || item._id)
        .filter(Boolean);

      // 2. Call API with new files and the list of IDs to keep
      await uploadProjectMedia(finalProjectId, filesToUpload, keepMediaIds);

      showSuccess(t('upload.success', { defaultValue: 'Files uploaded successfully' }));
      setSelectedFiles([]);

      // Refresh both gallery items and project details
      refetch();
      if (typeof refetchProject === 'function') await refetchProject();

      window.history.replaceState({ ...location.state, fromUpload: true }, '');

    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || t('upload.error', { defaultValue: 'Failed to upload files' });
      showError(errorMessage);
    } finally {
      setIsUploading(false);
      setSelectedFiles([]);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev[index];
      // Revoke object URL to free memory
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Group files by type
  const groupedFiles = {
    photos: selectedFiles.filter((file) => file?.fileType === 'photo'),
    videos: selectedFiles.filter((file) => file?.fileType === 'video'),
    documents: selectedFiles.filter((file) => file?.fileType === 'document'),
  };

  // Filter options
  const filterOptions = [
    { value: '', label: t('filterOptions.all', { defaultValue: 'All' }) },
    { value: 'recent', label: t('filterOptions.recent', { defaultValue: 'Recent' }) },
    { value: 'oldest', label: t('filterOptions.oldest', { defaultValue: 'Oldest' }) },
    { value: 'custom', label: t('filterOptions.custom', { defaultValue: 'Custom' }) },
  ];

  const getEmptyStateConfig = () => {
    switch (activeTab) {
      case 'photos':
        return {
          title: t('emptyState.noPhotos', { defaultValue: 'No Photos Uploaded' }),
          message: t('emptyState.photosMessage', { defaultValue: 'Add your project photos to show in your proposal.' }),
          actionLabel: t('emptyState.uploadPhotos', { defaultValue: 'Upload Photos' }),
        };
      case 'videos':
        return {
          title: t('emptyState.noVideos', { defaultValue: 'No Videos Uploaded' }),
          message: t('emptyState.videosMessage', { defaultValue: 'Add your project videos to show in your proposal.' }),
          actionLabel: t('emptyState.uploadVideos', { defaultValue: 'Upload Videos' }),
        };
      case 'documents':
        return {
          title: t('emptyState.noDocuments', { defaultValue: 'No Documents Uploaded' }),
          message: t('emptyState.documentsMessage', { defaultValue: 'Add your project documents to show in your proposal.' }),
          actionLabel: t('emptyState.uploadDocuments', { defaultValue: 'Upload Documents' }),
        };
      default:
        return {
          title: t('emptyState.noItems', { defaultValue: 'No Items Found' }),
          message: t('emptyState.noItemsMessage', { defaultValue: 'No items to display.' }),
        };
    }
  };

  if (isLoadingProject) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <PageHeader
          title={t('projectNotFound', { defaultValue: 'Project Not Found' })}
          showBackButton
          backTo={ROUTES_FLAT.PROJECT_GALLERY}
          className="capitalize!"
        />
        <EmptyState
          icon="inbox"
          title={t('projectNotFound', { defaultValue: 'Project Not Found' })}
          message={t('projectNotFoundMessage', { defaultValue: 'The project you are looking for does not exist.' })}
          actionLabel={t('backToGallery', { defaultValue: 'Back to Gallery' })}
          onAction={handleBack}
        />
      </div>
    );
  }

  const projectName = project.site_name || project.name || 'Project';
  const emptyStateConfig = getEmptyStateConfig();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Header Section */}
      <PageHeader
        title={projectName}
        showBackButton={true}
        backTo={ROUTES_FLAT.PROJECT_GALLERY}
        className="capitalize!"
      >
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Dropdown
            options={filterOptions}
            value={filterValue || ''}
            onChange={handleFilterChange}
            placeholder={t('filter', { defaultValue: 'Filter' })}
            className="w-full sm:w-[180px]"
          />
        </div>
      </PageHeader>

      {/* Upload Section */}
      <div className="mt-6">
        <FileUpload
          title={t('upload.title', { defaultValue: 'Upload Photos/ Videos / Documents' })}
          supportedFormats={t('upload.supportedFormats', { defaultValue: 'JPG, PNG, Mp4, PDF' })}
          maxSize={10}
          maxSizeUnit="MB"
          maxSizeText={t('upload.maxSizeEach', { defaultValue: '10MB EACH' })}
          onFileSelect={handleFileSelect}
          accept=".jpg,.jpeg,.png,.mp4,.pdf"
          uploadButtonText={t('upload.button', { defaultValue: 'Upload' })}
          supportedFormatLabel={t('upload.supportedFormatLabel', { defaultValue: 'Supported Format:' })}
          disabled={isUploading}
        />
      </div>

      {/* Selected Files Preview */}
      {/* {selectedFiles.length > 0 && (
        <div className="mt-4 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-primary">
              {isUploading ? t('upload.uploading', { defaultValue: 'Uploading...' }) : t('upload.filesSelected', { count: selectedFiles.length, defaultValue: `${selectedFiles.length} file(s) selected` })}
            </h3>
          </div>

          <div className="grid md:grid-cols-6 grid-cols-4 gap-4 mb-4">
            {selectedFiles.map((file, index) => {
              if (file.fileType === 'photo') {
                return (
                  <div key={file.id} className="relative group">
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                      {file.previewUrl ? (
                        <img
                          src={file.previewUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Preview</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-secondary mt-1 truncate" title={file.name}>
                      {file.name}
                    </p>
                  </div>
                );
              } else if (file.fileType === 'video') {
                return (
                  <div key={file.id} className="relative group">
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                      {file.previewUrl ? (
                        <div className="relative w-full h-full">
                          <img
                            src={file.previewUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-10 h-10 bg-black/70 rounded-full flex items-center justify-center">
                              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-secondary mt-1 truncate" title={file.name}>
                      {file.name}
                    </p>
                  </div>
                );
              } else {
                // Document
                return (
                  <div key={file.id} className="relative group">
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-red-600" />
                    </div>
                    <p className="text-xs text-secondary mt-1 truncate" title={file.name}>
                      {file.name}
                    </p>
                  </div>
                );
              }
            })}
          </div>

        </div>
      )} */}

      {/* Tabs */}
      <div className="mt-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => {
            setActiveTab(tabId);
          }}
        />
      </div>

      {/* Content */}
      {isLoadingGallery ? null : filteredItems.length === 0 ? (
        <EmptyState
          image={EmptyStateSvg}
          title={emptyStateConfig.title}
          message={emptyStateConfig.message}
          padding="lg"
        />
      ) : activeTab === 'documents' ? (
        // Documents: Display as list with date groups
        <div className="space-y-6">
          {Object.entries(groupedDocuments)
            .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
            .map(([date, items]) => (
              <div key={date}>
                {/* Date Header */}
                <h3 className="text-sm font-medium text-secondary mb-3">
                  {new Date(date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </h3>
                {/* Documents List */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <DocumentCard
                      key={item.id || item.url}
                      document={item}
                      onView={(doc) => {
                        if (doc.url) window.open(doc.url, '_blank');
                      }}
                      onDelete={canDelete ? (doc) => {
                        handleDeleteClick(doc);
                      } : null}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : activeTab === 'videos' ? (
        // Videos: Display as grid with date groups
        <div className="space-y-6">
          {Object.entries(groupedVideos)
            .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
            .map(([date, items]) => (
              <div key={date}>
                {/* Date Header */}
                <h3 className="text-sm font-medium text-secondary mb-3">
                  {new Date(date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </h3>
                {/* Videos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {items.map((item, index) => (
                    <VideoCard
                      key={item.id || item.url || index}
                      video={item}
                      onPlay={(video) => {
                        if (video.url) window.open(video.url, '_blank');
                      }}
                      onDelete={canDelete ? (video) => {
                        handleDeleteClick(video);
                      } : null}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : activeTab === 'photos' ? (
        // Photos: Display as grid with date groups
        <div className="space-y-6">
          {Object.entries(groupedPhotos)
            .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
            .map(([date, items]) => (
              <div key={date}>
                {/* Date Header */}
                <h3 className="text-sm font-medium text-secondary mb-3">
                  {new Date(date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </h3>
                {/* Photos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {items.map((item, index) => (
                    <PhotoCard
                      key={item.id || item.url || index}
                      photo={item}
                      onView={(photo) => {
                        if (photo.url) window.open(photo.url, '_blank');
                      }}
                      onDelete={canDelete ? (photo) => {
                        handleDeleteClick(photo);
                      } : null}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t('deleteModal.title', { defaultValue: 'Delete Media' })}
        message={t('deleteModal.message', { defaultValue: 'Are you sure you want to delete this item? This action cannot be undone.' })}
        confirmText={t('deleteModal.confirm', { defaultValue: 'Yes, Delete' })}
        cancelText={t('deleteModal.cancel', { defaultValue: 'Cancel' })}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

