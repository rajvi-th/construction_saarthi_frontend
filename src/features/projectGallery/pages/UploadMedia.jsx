/**
 * Upload Media Page
 * Separate page for uploading photos, videos, and documents to project gallery
 */

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { X, Play } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import FileUpload from '../../../components/ui/FileUpload';
import Button from '../../../components/ui/Button';
import Loader from '../../../components/ui/Loader';
import { useProjectDetails } from '../../projects/hooks';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES_FLAT } from '../../../constants/routes';
import { uploadProjectMedia } from '../api/projectGalleryApi';
import { showSuccess, showError } from '../../../utils/toast';
import PdfIcon from '../../../assets/icons/Pdf.svg';
import Tabs from '../components/Tabs';

export default function UploadMedia() {
  const { t } = useTranslation('projectGallery');
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('photos');
  const fileInputRef = useRef(null);

  // Get project ID from params or location state
  const projectIdFromState = location.state?.projectId;
  const finalProjectId = projectId || projectIdFromState;

  const { project, isLoading: isLoadingProject, refetch: refetchProject } = useProjectDetails(finalProjectId, selectedWorkspace);

  const handleBack = () => {
    navigate(ROUTES_FLAT.PROJECT_GALLERY_DETAILS.replace(':projectId', finalProjectId), {
      state: {
        projectId: finalProjectId,
        projectName: project?.site_name || project?.name,
      },
    });
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
        // Add preview URLs and file type to each file
        // Store File object with metadata
        const filesWithPreview = validFiles.map((file) => {
          const fileType = getFileType(file);
          return {
            file, // Store the actual File instance
            id: Date.now() + Math.random(),
            fileType,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl: fileType === 'photo' || fileType === 'video' ? createPreviewUrl(file) : null,
          };
        });
        
        setSelectedFiles((prev) => [...prev, ...filesWithPreview]);
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !finalProjectId) {
      showError(t('upload.error', { defaultValue: 'Please select at least one file to upload.' }));
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. Get IDs of existing media to preserve them
      const existingMedia = project?.media || [];
      const keepMediaIds = existingMedia
        .filter(item => {
          const typeId = String(item.typeId || item.type_id || '');
          return typeId !== '1';
        })
        .map(item => item.id || item._id)
        .filter(Boolean);

      // 2. Extract new File instances from selectedFiles
      const newFileInstances = selectedFiles.map(f => f.file || f).filter(f => f instanceof File);
      
      if (newFileInstances.length === 0) {
        throw new Error('No valid file instances found');
      }
      
      // 3. Call API with new files and existing IDs to keep
      await uploadProjectMedia(finalProjectId, newFileInstances, keepMediaIds);
      
      showSuccess(t('upload.success', { defaultValue: 'Files uploaded successfully' }));

      // Refresh project details immediately in case of another upload before navigation
      if (typeof refetchProject === 'function') await refetchProject();
      
      // Wait a bit before navigating to ensure backend has processed
      setTimeout(() => {
        navigate(ROUTES_FLAT.PROJECT_GALLERY_DETAILS.replace(':projectId', finalProjectId), {
          state: {
            projectId: finalProjectId,
            projectName: project?.site_name || project?.name,
            fromUpload: true, // Flag to trigger refetch
          },
        });
      }, 1000);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || t('upload.error', { defaultValue: 'Failed to upload files' });
      showError(errorMessage);
    } finally {
      setIsUploading(false);
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

  const handleClearAll = () => {
    // Revoke all object URLs to free memory
    selectedFiles.forEach((file) => {
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Group files by type
  const groupedFiles = {
    photos: selectedFiles.filter((file) => file?.fileType === 'photo'),
    videos: selectedFiles.filter((file) => file?.fileType === 'video'),
    documents: selectedFiles.filter((file) => file?.fileType === 'document'),
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
          onBack={handleBack}
          className="capitalize!"
        />
      </div>
    );
  }

  const projectName = project.site_name || project.name || 'Project';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Header Section */}
      <PageHeader
        title={projectName}
        showBackButton
        backTo={ROUTES_FLAT.PROJECT_GALLERY_DETAILS.replace(':projectId', finalProjectId)}
        className="capitalize!"
      />

      {/* Upload Section */}
      <div className="mt-6">
        <FileUpload
          title={t('upload.title', { defaultValue: 'Upload Photos/ Videos / Documents' })}
          supportedFormats="JPG, PNG, Mp4"
          maxSize={10}
          maxSizeUnit="MB"
          onFileSelect={handleFileSelect}
          accept=".jpg,.jpeg,.png,.mp4,.pdf"
          uploadButtonText={t('upload.button', { defaultValue: 'Select Files' })}
          supportedFormatLabel="Supported Format:"
        />
      </div>

      {/* Selected Files List - Card View with Tabs */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-primary">
              {selectedFiles.length} file(s) selected
            </h3>
            <Button
              variant="secondary"
              onClick={handleClearAll}
              disabled={isUploading}
            >
              Clear All
            </Button>
          </div>

          {/* Tabs */}
          <Tabs
            tabs={[
              {
                id: 'photos',
                label: `${t('tabs.photos', { defaultValue: 'Photos' })} (${groupedFiles.photos.length})`,
              },
              {
                id: 'videos',
                label: `${t('tabs.videos', { defaultValue: 'Videos' })} (${groupedFiles.videos.length})`,
              },
              {
                id: 'documents',
                label: `${t('tabs.documents', { defaultValue: 'Documents' })} (${groupedFiles.documents.length})`,
              },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Photos Tab Content */}
          {activeTab === 'photos' && (
            <div>
              {groupedFiles.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {groupedFiles.photos.map((file, index) => {
                    const originalIndex = selectedFiles.findIndex((f) => f.id === file.id);
                    return (
                      <div key={file.id} className="relative group cursor-pointer">
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                          <img
                            src={file?.previewUrl}
                            alt={file?.name || 'Photo'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Overlay on Hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                        <button
                          onClick={() => handleRemoveFile(originalIndex)}
                          disabled={isUploading}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md disabled:opacity-50 z-10 cursor-pointer"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-secondary">
                  {t('emptyState.noPhotos', { defaultValue: 'No Photos Uploaded' })}
                </div>
              )}
            </div>
          )}

          {/* Videos Tab Content */}
          {activeTab === 'videos' && (
            <div>
              {groupedFiles.videos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {groupedFiles.videos.map((file, index) => {
                    const originalIndex = selectedFiles.findIndex((f) => f.id === file.id);
                    return (
                      <div key={file.id} className="relative group cursor-pointer">
                        <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                          {file.previewUrl ? (
                            <div className="relative w-full h-full">
                              <img
                                src={file?.previewUrl}
                                alt={file?.name || 'Video'}
                                className="w-full h-full object-cover"
                              />
                              {/* Play Button Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center hover:bg-black/90 transition-colors shadow-lg cursor-pointer">
                                  <Play className="w-7 h-7 text-white ml-1" fill="white" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Play className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveFile(originalIndex)}
                          disabled={isUploading}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md disabled:opacity-50 z-10 cursor-pointer"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-secondary">
                  {t('emptyState.noVideos', { defaultValue: 'No Videos Uploaded' })}
                </div>
              )}
            </div>
          )}

          {/* Documents Tab Content */}
          {activeTab === 'documents' && (
            <div>
              {groupedFiles.documents.length > 0 ? (
                <div className="space-y-3">
                  {groupedFiles.documents.map((file, index) => {
                    const originalIndex = selectedFiles.findIndex((f) => f.id === file.id);
                    return (
                      <div
                        key={file.id}
                        className="bg-white rounded-xl p-4 flex items-center gap-4 border border-black-soft"
                      >
                        {/* PDF Icon */}
                        <div className="flex-shrink-0">
                          <img src={PdfIcon} alt="PDF" className="w-12 h-12" />
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-primary truncate mb-1">
                          {file?.name || 'Document'}
                        </h3>
                        <p className="text-sm text-secondary">
                          {file?.size ? ((file.size / (1024 * 1024)).toFixed(2) + ' MB') : ''}
                        </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFile(originalIndex)}
                          disabled={isUploading}
                          className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-5 h-5 text-secondary" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-secondary">
                  {t('emptyState.noDocuments', { defaultValue: 'No Documents Uploaded' })}
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
            >
              {isUploading 
                ? t('upload.uploading', { defaultValue: 'Uploading...' })
                : t('upload.button', { defaultValue: 'Upload' })
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

