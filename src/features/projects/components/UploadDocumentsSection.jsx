/**
 * UploadDocumentsSection
 * Bottom card for Add New Project - upload relevant images/documents with tabs
 */

import { useState, useEffect, useRef } from 'react';
import { X, Play, FileText, Loader2 } from 'lucide-react';
import FileUpload from '../../../components/ui/FileUpload';
import { showError, showSuccess, showLoading, dismissToast } from '../../../utils/toast';
import { uploadMedia } from '../api/projectApi';

function UploadDocumentsSection({ t, onFilesChange, projectKey, existingFiles, isEditMode }) {
  const [activeTab, setActiveTab] = useState('photos');
  const [uploadedFiles, setUploadedFiles] = useState(existingFiles || {
    photos: [],
    videos: [],
    documents: [],
  });
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const lastSyncedRef = useRef(null);

  // Update uploadedFiles when existingFiles prop changes (for edit mode)
  useEffect(() => {
    if (existingFiles && existingFiles !== lastSyncedRef.current) {
      lastSyncedRef.current = existingFiles;
      setUploadedFiles(existingFiles);
    }
  }, [existingFiles]);

  // Notify parent component of file changes
  useEffect(() => {
    if (onFilesChange && uploadedFiles !== lastSyncedRef.current) {
      lastSyncedRef.current = uploadedFiles;
      onFilesChange(uploadedFiles);
    }
  }, [uploadedFiles, onFilesChange]);

  const uploadTitle = t('addNewProject.steps.uploadDocuments');
  const optionalText = '(Optional)';
  const [mainTitle, afterOptional] = uploadTitle.split(optionalText);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format date with time
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Check file type
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

  const handleFileSelect = async (files) => {
    // In edit mode, projectKey is actually projectId, so it should exist
    // In create mode, we need projectKey for uploads
    if (!projectKey) {
      showError(t('addNewProject.form.validation.projectKeyRequired'));
      return;
    }

    const now = new Date();
    const uploadDate = formatDate(now);
    const uploadDateTime = formatDateTime(now);

    // Validate files and categorize automatically by file type
    const invalidFiles = [];
    const oversizedFiles = [];
    const categorizedFiles = {
      photos: [],
      videos: [],
      documents: [],
    };
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    Array.from(files).forEach((file) => {
      const fileType = getFileType(file);

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file);
        return;
      }

      // Automatically categorize files by type
      if (fileType === 'photo') {
        categorizedFiles.photos.push(file);
      } else if (fileType === 'video') {
        categorizedFiles.videos.push(file);
      } else if (fileType === 'document') {
        categorizedFiles.documents.push(file);
      } else {
        invalidFiles.push(file);
      }
    });

    // Show error if oversized files found
    if (oversizedFiles.length > 0) {
      showError(
        t('addNewProject.form.validation.fileTooLarge', {
          count: oversizedFiles.length,
          maxSize: '10MB'
        })
      );
    }

    // Show error if invalid files found
    if (invalidFiles.length > 0) {
      showError(
        t('addNewProject.form.validation.invalidFileType', {
          count: invalidFiles.length
        })
      );
    }

    // Process and upload files by category
    const newPhotoFiles = [];
    const newVideoFiles = [];
    const newDocumentFiles = [];
    const allFilesToUpload = [];

    // Categorize for state update
    categorizedFiles.photos.forEach((file, index) => {
      const id = `${Date.now()}-${Math.random()}-${index}-photo`;
      newPhotoFiles.push({
        id,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        uploadDate,
        uploadDateTime,
        date: uploadDateTime,
        url: createPreviewUrl(file),
        isUploading: !isEditMode,
        needsUpload: isEditMode,
      });
      allFilesToUpload.push(file);
      if (!isEditMode) {
        setUploadingFiles((prev) => new Set(prev).add(id));
      }
    });

    categorizedFiles.videos.forEach((file, index) => {
      const id = `${Date.now()}-${Math.random()}-${index}-video`;
      newVideoFiles.push({
        id,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        uploadDate,
        uploadDateTime,
        date: uploadDateTime,
        thumbnail: createPreviewUrl(file),
        url: createPreviewUrl(file),
        isUploading: !isEditMode,
        needsUpload: isEditMode,
      });
      allFilesToUpload.push(file);
      if (!isEditMode) {
        setUploadingFiles((prev) => new Set(prev).add(id));
      }
    });

    categorizedFiles.documents.forEach((file, index) => {
      const id = `${Date.now()}-${Math.random()}-${index}-document`;
      newDocumentFiles.push({
        id,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        uploadDate,
        uploadDateTime,
        date: uploadDateTime,
        url: createPreviewUrl(file),
        isUploading: !isEditMode,
        needsUpload: isEditMode,
      });
      allFilesToUpload.push(file);
      if (!isEditMode) {
        setUploadingFiles((prev) => new Set(prev).add(id));
      }
    });

    const newFiles = {
      photos: newPhotoFiles,
      videos: newVideoFiles,
      documents: newDocumentFiles,
    };

    // Update state once with all new files
    setUploadedFiles((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotoFiles],
      videos: [...prev.videos, ...newVideoFiles],
      documents: [...prev.documents, ...newDocumentFiles],
    }));

    // Start batch upload if not in edit mode (Instant upload for new projects)
    if (allFilesToUpload.length > 0 && !isEditMode) {
      uploadBatchToAPI(allFilesToUpload, newFiles);
    }
  };

  // Upload a batch of files to API
  const uploadBatchToAPI = async (files, newFilesMapping) => {
    // Create a flat array of all new file IDs to track progress
    const allNewIds = [
      ...newFilesMapping.photos.map(f => ({ id: f.id, category: 'photos' })),
      ...newFilesMapping.videos.map(f => ({ id: f.id, category: 'videos' })),
      ...newFilesMapping.documents.map(f => ({ id: f.id, category: 'documents' }))
    ];

    const loadingToast = showLoading(t('addNewProject.form.uploading'));

    try {
      // Upload to API
      const response = await uploadMedia(projectKey, { media: files });

      // Support capturing IDs from server response if available
      const serverFiles = response?.files || response?.data?.files || [];

      // Mark all as uploaded and sync IDs
      setUploadedFiles((prev) => {
        const newState = { ...prev };
        allNewIds.forEach(({ id, category }, index) => {
          const serverFile = serverFiles[index];
          newState[category] = newState[category].map(f =>
            f.id === id ? {
              ...f,
              isUploading: false,
              isUploaded: true,
              id: serverFile?.id || f.id
            } : f
          );
        });
        return newState;
      });

      dismissToast(loadingToast);
      showSuccess(t('addNewProject.form.uploadSuccess'));
    } catch (error) {
      console.error('Error uploading batch:', error);
      dismissToast(loadingToast);

      // Mark all as failed
      setUploadedFiles((prev) => {
        const newState = { ...prev };
        allNewIds.forEach(({ id, category }) => {
          newState[category] = newState[category].map(f =>
            f.id === id ? { ...f, isUploading: false, isUploadFailed: true } : f
          );
        });
        return newState;
      });

      showError(t('addNewProject.form.uploadBatchError'));
    } finally {
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        allNewIds.forEach(({ id }) => newSet.delete(id));
        return newSet;
      });
    }
  };

  const handleRemoveFile = (type, index) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev[type][index];
      // Revoke object URL to free memory (only for File objects, not existing URLs)
      if (fileToRemove.url && !fileToRemove.isExisting) {
        try {
          URL.revokeObjectURL(fileToRemove.url);
        } catch (e) {
          // Ignore errors if URL is not an object URL
        }
      }
      if (fileToRemove.thumbnail && !fileToRemove.isExisting) {
        try {
          URL.revokeObjectURL(fileToRemove.thumbnail);
        } catch (e) {
          // Ignore errors if URL is not an object URL
        }
      }
      return {
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index),
      };
    });
  };

  const tabs = [
    { id: 'photos', label: t('addNewProject.form.tabs.photos') },
    { id: 'videos', label: t('addNewProject.form.tabs.videos') },
    { id: 'documents', label: t('addNewProject.form.tabs.documents') },
  ];

  const currentFiles = uploadedFiles[activeTab];

  // Group files by date with original indices
  const groupedFiles = currentFiles.reduce((acc, file, index) => {
    const date = file.uploadDate || 'Unknown';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({ ...file, originalIndex: index });
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-7.5">
      {/* Header */}
      <h2 className="text-base sm:text-lg font-semibold text-primary mb-4">
        {mainTitle}
        {uploadTitle.includes(optionalText) && (
          <span className="text-primary-light text-sm">{optionalText}</span>
        )}
        {afterOptional}
      </h2>

      {/* Upload Area */}
      <div className="mb-6">
        <FileUpload
          title={t('addNewProject.form.uploadRelevantDocuments')}
          supportedFormats={t('addNewProject.form.supportedFormats.all') || 'Images, Videos, PDFs'}
          uploadButtonText={t('addNewProject.form.upload')}
          supportedFormatLabel={t('addNewProject.form.supportedFormatLabel')}
          onFileSelect={handleFileSelect}
          accept=".jpg,.jpeg,.png,.mp4,.mov,.avi,.pdf"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors md:px-6 ${activeTab === tab.id
              ? 'text-accent border-b-2 border-accent'
              : 'text-secondary hover:text-primary'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Uploaded Files Display */}
      {Object.keys(groupedFiles).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedFiles).sort((a, b) => {
            if (a[0] === 'Unknown') return 1;
            if (b[0] === 'Unknown') return -1;
            return new Date(b[0]) - new Date(a[0]);
          }).map(([date, files]) => (
            <div key={date} className="space-y-4">
              {/* Date Header */}
              <p className="text-sm font-medium text-secondary">{date}</p>

              {/* Files Grid */}
              {activeTab === 'photos' && (
                <div className="grid grid-cols-2 grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
                  {files.map((file, fileIndex) => (
                    <div key={file.id} className="relative group cursor-pointer">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200  mx-auto relative">
                        <img
                          src={file.url}
                          alt={file.name || `Photo ${fileIndex + 1}`}
                          className={`w-full h-full object-cover ${file.isUploading ? 'opacity-50' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open image in new tab for viewing
                            if (!file.isUploading) {
                              const newWindow = window.open(file.url, '_blank', 'noopener,noreferrer');
                              if (newWindow) newWindow.focus();
                            }
                          }}
                        />
                        {file.isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                        {file.isUploadFailed && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/30">
                            <span className="text-xs text-white font-medium">{t('addNewProject.form.uploadFailed', { defaultValue: 'Upload Failed' })}</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!file.isUploading) {
                            handleRemoveFile(activeTab, file.originalIndex);
                          }
                        }}
                        disabled={file.isUploading}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 disabled:opacity-50"
                      >
                        <X className="w-3 h-3 text-primary" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {files.map((file, fileIndex) => (
                    <div key={file.id} className="relative group cursor-pointer">
                      <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 max-w-[200px] mx-auto relative bg-gray-100">
                        {/* Render video or thumbnail */}
                        {(file.isExisting && !file.url?.match(/\.(jpeg|jpg|png|gif|webp)$/i)) || (!file.isExisting) ? (
                          <video
                            src={file.url}
                            className={`w-full h-full object-cover ${file.isUploading ? 'opacity-50' : ''}`}
                            preload="metadata"
                            muted
                            playsInline
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!file.isUploading) {
                                const newWindow = window.open(file.url, '_blank', 'noopener,noreferrer');
                                if (newWindow) newWindow.focus();
                              }
                            }}
                            onError={(e) => {
                              // If video fail to load first frame, show placeholder
                              e.target.style.display = 'none';
                              e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-200');
                            }}
                          />
                        ) : (
                          <img
                            src={file.thumbnail || file.url}
                            alt={file.name || `Video ${fileIndex + 1}`}
                            className={`w-full h-full object-cover ${file.isUploading ? 'opacity-50' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newWindow = window.open(file.url, '_blank', 'noopener,noreferrer');
                              if (newWindow) newWindow.focus();
                            }}
                          />
                        )}

                        {/* Play Button */}
                        {!file.isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all pointer-events-none">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                              <Play className="w-5 h-5 text-primary ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        )}

                        {/* Video Type Badge */}
                        {!file.isUploading && (
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-white uppercase tracking-wide z-10">
                            {file.name?.split('.').pop() || 'VIDEO'}
                          </div>
                        )}
                        {file.isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                        {file.isUploadFailed && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/30">
                            <span className="text-xs text-white font-medium">{t('addNewProject.form.uploadFailed', { defaultValue: 'Upload Failed' })}</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!file.isUploading) {
                            handleRemoveFile(activeTab, file.originalIndex);
                          }
                        }}
                        disabled={file.isUploading}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 disabled:opacity-50"
                      >
                        <X className="w-3 h-3 text-primary" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-3">
                  {files.map((file, fileIndex) => (
                    <div
                      key={file.id}
                      className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer ${file.isUploading ? 'opacity-50' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open document in new tab for viewing
                        if (file.url && !file.isUploading) {
                          const newWindow = window.open(file.url, '_blank', 'noopener,noreferrer');
                          if (newWindow) newWindow.focus();
                        }
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        {file.isUploading ? (
                          <Loader2 className="w-5 h-5 text-accent animate-spin" />
                        ) : (
                          <FileText className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-secondary">
                          {file.size} • {file.uploadDateTime || file.date}
                          {file.isUploading && ` • ${t('addNewProject.form.uploadingStatus', { defaultValue: 'Uploading...' })}`}
                          {file.isUploadFailed && ` • ${t('addNewProject.form.uploadFailed', { defaultValue: 'Upload Failed' })}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!file.isUploading) {
                            handleRemoveFile(activeTab, file.originalIndex);
                          }
                        }}
                        disabled={file.isUploading}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 disabled:opacity-50"
                      >
                        <X className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-secondary">
          <p className="text-sm">{t('addNewProject.form.noFilesUploaded')}</p>
        </div>
      )}
    </div>
  );
}

export default UploadDocumentsSection;


