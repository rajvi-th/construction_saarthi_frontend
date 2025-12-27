/**
 * AddPastProject Page
 * Simple, responsive UI for adding a past project (site) with media uploads.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, FileText, Video } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import Input from '../../../components/ui/Input';
import FileUpload from '../../../components/ui/FileUpload';
import Button from '../../../components/ui/Button';
import Loader from '../../../components/ui/Loader';
import { ROUTES_FLAT } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';
import { createPastProject, uploadPastProjectMedia, startPastProject } from '../api/pastProjectApi';
import { showSuccess, showError } from '../../../utils/toast';

export default function AddPastProject() {
  const { t } = useTranslation(['pastProjects', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();

  // Get projectKey from navigation state (if coming from project card click)
  const projectKeyFromState = location.state?.projectKey;
  const projectFromState = location.state?.project;

  const [projectName, setProjectName] = useState(projectFromState?.name || '');
  const [address, setAddress] = useState(projectFromState?.address || '');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [projectKey, setProjectKey] = useState(projectKeyFromState);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Get file type helper
  const getFileType = (file) => {
    const type = file.type || '';
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    return 'document';
  };

  // Create preview URL for images/videos
  const createPreviewUrl = (file) => {
    return URL.createObjectURL(file);
  };

  // Upload files immediately after selection
  const uploadFilesImmediately = async (files) => {
    // Validation
    if (!projectKey) {
      showError(t('validation.projectKeyRequired', { defaultValue: 'Project key is required. Please refresh and try again.' }));
      return false;
    }

    setIsUploading(true);

    try {
      // Only upload files - start is already called in PastProjects, create will be called in handleSubmit
      const fileArray = Array.from(files);
      if (fileArray.length > 0) {
        await uploadPastProjectMedia(projectKey, fileArray);
        setUploadedFiles((prev) => [...prev, ...fileArray]);
        showSuccess(t('success.filesUploaded', { defaultValue: 'Files uploaded successfully!' }));
      }

      return true;
    } catch (error) {
      console.error('Error uploading files:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t('error.uploadFailed', { defaultValue: 'Failed to upload files. Please try again.' });
      showError(errorMessage);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaFileSelect = async (files) => {
    const fileArray = Array.from(files);
    const filesWithPreview = fileArray.map((file) => {
      const fileType = getFileType(file);
      return {
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        type: fileType,
        previewUrl: fileType === 'image' || fileType === 'video' ? createPreviewUrl(file) : null,
        isUploaded: false,
      };
    });
    setMediaFiles((prev) => [...prev, ...filesWithPreview]);

    // Upload files immediately
    const uploadSuccess = await uploadFilesImmediately(fileArray);
    if (uploadSuccess) {
      // Mark files as uploaded
      setMediaFiles((prev) =>
        prev.map((f) => {
          if (fileArray.includes(f.file)) {
            return { ...f, isUploaded: true };
          }
          return f;
        })
      );
    }
  };

  const handleDocumentFileSelect = async (files) => {
    const fileArray = Array.from(files);
    
    // Accept all file types (images, videos, documents)
    const filesWithPreview = fileArray.map((file) => {
      const fileType = getFileType(file);
      return {
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        type: fileType,
        previewUrl: fileType === 'image' || fileType === 'video' ? createPreviewUrl(file) : null,
        isUploaded: false,
      };
    });
    setDocumentFiles((prev) => [...prev, ...filesWithPreview]);

    // Upload files immediately
    const uploadSuccess = await uploadFilesImmediately(fileArray);
    if (uploadSuccess) {
      // Mark files as uploaded
      setDocumentFiles((prev) =>
        prev.map((f) => {
          if (fileArray.includes(f.file)) {
            return { ...f, isUploaded: true };
          }
          return f;
        })
      );
    }
  };

  const handleRemoveMediaFile = (id) => {
    setMediaFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleRemoveDocumentFile = (id) => {
    setDocumentFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  // Initialize projectKey - from state or by calling start API
  useEffect(() => {
    let mounted = true;

    const initializeProjectKey = async () => {
      // If projectKey already exists, skip
      if (projectKey) {
        return;
      }

      // If projectKey from state, use it
      if (projectKeyFromState) {
        setProjectKey(projectKeyFromState);
        console.log('ProjectKey initialized from state:', projectKeyFromState);
        return;
      }

      // If no projectKey and no workspace, skip
      if (!selectedWorkspace) {
        return;
      }

      // Call start API to get projectKey
      setIsInitializing(true);
      try {
        const startResponse = await startPastProject(selectedWorkspace);
        const newProjectKey = startResponse?.projectKey || startResponse?.data?.projectKey;
        
        if (newProjectKey && mounted) {
          setProjectKey(newProjectKey);
          console.log('ProjectKey initialized from start API:', newProjectKey);
        } else if (mounted) {
          throw new Error('Failed to get project key from start API');
        }
      } catch (error) {
        console.error('Error initializing project key:', error);
        if (mounted) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            t('error.failedToStart', { defaultValue: 'Failed to initialize project. Please try again.' });
          showError(errorMessage);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeProjectKey();

    return () => {
      mounted = false;
    };
  }, [projectKeyFromState, projectKey, selectedWorkspace, t]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      mediaFiles.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
      documentFiles.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!projectName.trim()) {
      showError(t('validation.projectNameRequired', { defaultValue: 'Project name is required' }));
      return;
    }

    if (!address.trim()) {
      showError(t('validation.addressRequired', { defaultValue: 'Address is required' }));
      return;
    }

    if (!selectedWorkspace) {
      showError(t('validation.workspaceRequired', { defaultValue: 'Workspace is required' }));
      return;
    }

    if (!projectKey) {
      showError(t('validation.projectKeyRequired', { defaultValue: 'Project key is required. Please refresh and try again.' }));
      return;
    }

    // Check if at least one file is selected
    const allFiles = [...mediaFiles.map((f) => f.file), ...documentFiles.map((f) => f.file)];
    if (allFiles.length === 0) {
      showError(t('validation.filesRequired', { defaultValue: 'Please upload at least one file' }));
      return;
    }

    setIsSubmitting(true);

    try {
      // Only call create API - start is already called in PastProjects, upload is already called when files are selected
      await createPastProject(selectedWorkspace, {
        projectKey: projectKey,
        name: projectName.trim(),
        address: address.trim(),
      });

      showSuccess(t('success.projectAdded', { defaultValue: 'Project added successfully!' }));
      navigate(ROUTES_FLAT.PAST_PROJECTS);
    } catch (error) {
      console.error('Error adding past project:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t('error.addFailed', { defaultValue: 'Failed to add project. Please try again.' });
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseUploadTitle = t('uploadTitle', {
    ns: 'pastProjects',
    defaultValue: 'Upload Photos/ Videos / Documents',
  });

  const supportedFormatsLabel = t('supportedFormatsLabel', {
    ns: 'pastProjects',
    defaultValue: 'Supported Format:',
  });

  const supportedFormats = t('supportedFormats', {
    ns: 'pastProjects',
    defaultValue: 'JPG, PNG, Mp4, PDF',
  });

  const maxSizeEach = t('maxSizeEach', {
    ns: 'pastProjects',
    defaultValue: '10MB each',
  });

  // Show loader while initializing projectKey
  if (isInitializing) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={t('addTitle', { ns: 'pastProjects', defaultValue: 'Add Project (Site)' })}
          showBackButton
          backTo={ROUTES_FLAT.PAST_PROJECTS}
        />
        <div className="mt-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader size="lg" />
            <p className="text-sm text-secondary">
              {t('initializing', { defaultValue: 'Initializing project...' })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={t('addTitle', { ns: 'pastProjects', defaultValue: 'Add Project (Site)' })}
          showBackButton
          backTo={ROUTES_FLAT.PAST_PROJECTS}
        />

        <form
          onSubmit={handleSubmit}
          className="mt-4 sm:mt-6 space-y-6 sm:space-y-8"
        >
          {/* Project Name */}
          <Input
            label={t('projectName', { ns: 'pastProjects', defaultValue: 'Project Name' })}
            placeholder={t('projectNamePlaceholder', {
              ns: 'pastProjects',
              defaultValue: 'Enter project name',
            })}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />

          {/* Address */}
          <Input
            label={t('address', { ns: 'pastProjects', defaultValue: 'Address' })}
            placeholder={t('addressPlaceholder', {
              ns: 'pastProjects',
              defaultValue: 'Enter site address',
            })}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          {/* Upload Images / Videos */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-medium text-primary">
              {t('uploadImagesVideos', {
                ns: 'pastProjects',
                defaultValue: 'Upload Images/Videos*',
              })}
            </p>
            <FileUpload
              title={baseUploadTitle}
              supportedFormats={supportedFormats}
              maxSize={10}
              maxSizeUnit="MB"
              maxSizeText={maxSizeEach}
              supportedFormatLabel={supportedFormatsLabel}
              onFileSelect={handleMediaFileSelect}
              accept=".jpg,.jpeg,.png,.mp4,.pdf"
              uploadButtonText={
                isUploading
                  ? t('uploading', { defaultValue: 'Uploading...' })
                  : t('uploadButton', {
                      ns: 'pastProjects',
                      defaultValue: 'Upload',
                    })
              }
            />
            {isUploading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-secondary">
                <Loader size="sm" />
                <span>{t('uploadingFiles', { defaultValue: 'Uploading files...' })}</span>
              </div>
            )}
            {/* Media Files Preview */}
            {mediaFiles.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaFiles.map((fileItem) => (
                    <div key={fileItem.id} className="relative group">
                      {fileItem.type === 'image' && fileItem.previewUrl ? (
                        <div className="relative">
                          <img
                            src={fileItem.previewUrl}
                            alt={fileItem.name}
                            className="w-full h-24 sm:h-28 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMediaFile(fileItem.id)}
                            disabled={isSubmitting || isUploading}
                            className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : fileItem.type === 'video' && fileItem.previewUrl ? (
                        <div className="relative">
                          <video
                            src={fileItem.previewUrl}
                            className="w-full h-24 sm:h-28 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMediaFile(fileItem.id)}
                            disabled={isSubmitting || isUploading}
                            className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-full h-24 sm:h-28 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => handleRemoveMediaFile(fileItem.id)}
                            disabled={isSubmitting || isUploading}
                            className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <p className="absolute bottom-1 left-1 right-1 text-xs text-gray-600 truncate px-1">
                            {fileItem.name}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Documents */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-medium text-primary">
              {t('uploadDocuments', {
                ns: 'pastProjects',
                defaultValue: 'Upload Documents',
              })}
            </p>
            <FileUpload
              title={baseUploadTitle}
              supportedFormats={supportedFormats}
              maxSize={10}
              maxSizeUnit="MB"
              maxSizeText={maxSizeEach}
              supportedFormatLabel={supportedFormatsLabel}
              onFileSelect={handleDocumentFileSelect}
              accept=".jpg,.jpeg,.png,.mp4,.pdf"
              uploadButtonText={
                isUploading
                  ? t('uploading', { defaultValue: 'Uploading...' })
                  : t('uploadButton', {
                      ns: 'pastProjects',
                      defaultValue: 'Upload',
                    })
              }
            />
            {isUploading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-secondary">
                <Loader size="sm" />
                <span>{t('uploadingFiles', { defaultValue: 'Uploading files...' })}</span>
              </div>
            )}
            {/* Document Files Preview - All formats */}
            {documentFiles.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {documentFiles.map((fileItem) => (
                    <div key={fileItem.id} className="relative group">
                      {fileItem.type === 'image' && fileItem.previewUrl ? (
                        <div className="relative">
                          <img
                            src={fileItem.previewUrl}
                            alt={fileItem.name}
                            className="w-full h-24 sm:h-28 object-cover rounded-lg border border-gray-200"
                          />
                          {fileItem.isUploaded && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              ✓
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveDocumentFile(fileItem.id)}
                            disabled={isSubmitting || isUploading}
                            className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : fileItem.type === 'video' && fileItem.previewUrl ? (
                        <div className="relative">
                          <video
                            src={fileItem.previewUrl}
                            className="w-full h-24 sm:h-28 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                          {fileItem.isUploaded && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              ✓
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveDocumentFile(fileItem.id)}
                            disabled={isSubmitting || isUploading}
                            className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-full h-24 sm:h-28 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-400" />
                          {fileItem.isUploaded && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              ✓
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveDocumentFile(fileItem.id)}
                            disabled={isSubmitting || isUploading}
                            className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <p className="absolute bottom-1 left-1 right-1 text-xs text-gray-600 truncate px-1">
                            {fileItem.name}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto px-6"
              onClick={() => navigate(ROUTES_FLAT.PAST_PROJECTS)}
              disabled={isSubmitting}
            >
              {t('cancel', { ns: 'common', defaultValue: 'Cancel' })}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader size="sm" />
                  <span>{t('adding', { defaultValue: 'Adding...' })}</span>
                </div>
              ) : (
                t('addSubmit', {
                  ns: 'pastProjects',
                  defaultValue: 'Add Project',
                })
              )}
            </Button>
          </div>
        </form>
      </div>
  );
}


