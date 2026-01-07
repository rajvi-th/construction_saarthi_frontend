/**
 * UploadDocumentsSection
 * Bottom card for Add New Project - upload relevant images/documents with tabs
 */

import { useState, useEffect } from 'react';
import { X, Play, FileText, Loader2 } from 'lucide-react';
import FileUpload from '../../../components/ui/FileUpload';
import { showError, showSuccess, showLoading, dismissToast } from '../../../utils/toast';
import { uploadMedia } from '../api/projectApi';

function UploadDocumentsSection({ t, onFilesChange, projectKey, existingFiles }) {
  const [activeTab, setActiveTab] = useState('photos');
  const [uploadedFiles, setUploadedFiles] = useState(existingFiles || {
    photos: [],
    videos: [],
    documents: [],
  });
  const [uploadingFiles, setUploadingFiles] = useState(new Set());

  // Update uploadedFiles when existingFiles prop changes (for edit mode)
  useEffect(() => {
    if (existingFiles) {
      setUploadedFiles(existingFiles);
    }
  }, [existingFiles]);

  // Notify parent component of file changes using useEffect to avoid setState during render
  useEffect(() => {
    if (onFilesChange) {
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
      showError(t('addNewProject.form.validation.projectKeyRequired') || 'Project key is required. Please wait for project initialization.');
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
        }) || `${invalidFiles.length} file(s) have invalid format`
      );
    }

    // Process and upload files by category
    const uploadPromises = [];
    const newPhotoFiles = [];
    const newVideoFiles = [];
    const newDocumentFiles = [];

    // Process photos
    if (categorizedFiles.photos.length > 0) {
      categorizedFiles.photos.forEach((file, index) => {
        const fileData = {
          id: `${Date.now()}-${Math.random()}-${index}-photo`,
          file,
          name: file.name,
          size: formatFileSize(file.size),
          uploadDate,
          uploadDateTime,
          date: uploadDateTime,
          url: createPreviewUrl(file),
          isUploading: true,
        };
        newPhotoFiles.push(fileData);
        setUploadingFiles((prev) => new Set(prev).add(fileData.id));
        uploadPromises.push(uploadFileToAPI(fileData, 'photos'));
      });
    }

    // Process videos
    if (categorizedFiles.videos.length > 0) {
      categorizedFiles.videos.forEach((file, index) => {
        const fileData = {
          id: `${Date.now()}-${Math.random()}-${index}-video`,
          file,
          name: file.name,
          size: formatFileSize(file.size),
          uploadDate,
          uploadDateTime,
          date: uploadDateTime,
          thumbnail: createPreviewUrl(file),
          url: createPreviewUrl(file),
          isUploading: true,
        };
        newVideoFiles.push(fileData);
        setUploadingFiles((prev) => new Set(prev).add(fileData.id));
        uploadPromises.push(uploadFileToAPI(fileData, 'videos'));
      });
    }

    // Process documents
    if (categorizedFiles.documents.length > 0) {
      categorizedFiles.documents.forEach((file, index) => {
        const fileData = {
          id: `${Date.now()}-${Math.random()}-${index}-document`,
          file,
          name: file.name,
          size: formatFileSize(file.size),
          uploadDate,
          uploadDateTime,
          date: uploadDateTime,
          url: createPreviewUrl(file),
          isUploading: true,
        };
        newDocumentFiles.push(fileData);
        setUploadingFiles((prev) => new Set(prev).add(fileData.id));
        uploadPromises.push(uploadFileToAPI(fileData, 'documents'));
      });
    }

    // Update state once with all new files
    if (newPhotoFiles.length > 0 || newVideoFiles.length > 0 || newDocumentFiles.length > 0) {
      setUploadedFiles((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotoFiles],
        videos: [...prev.videos, ...newVideoFiles],
        documents: [...prev.documents, ...newDocumentFiles],
      }));
    }

    // Wait for all uploads to complete
    if (uploadPromises.length > 0) {
      const loadingToast = showLoading(t('addNewProject.form.uploading') || 'Uploading files...');
      try {
        await Promise.all(uploadPromises);
        dismissToast(loadingToast);
        showSuccess(t('addNewProject.form.uploadSuccess') || 'Files uploaded successfully');
      } catch (error) {
        dismissToast(loadingToast);
        console.error('Error uploading files:', error);
      }
    }
  };

  // Upload individual file to API
  const uploadFileToAPI = async (fileData, category) => {
    try {
      // In edit mode, don't upload immediately - files will be uploaded on form submit
      // Check if projectKey is a number (projectId in edit mode) vs string (projectKey in create mode)
      const isEditMode = projectKey && !isNaN(Number(projectKey)) && String(projectKey).length < 10;
      
      if (isEditMode) {
        // In edit mode, just mark as uploaded (will be sent with form submission)
        setUploadedFiles((prev) => ({
          ...prev,
          [category]: prev[category].map((f) =>
            f.id === fileData.id ? { ...f, isUploading: false, isUploaded: true } : f
          ),
        }));

        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileData.id);
          return newSet;
        });
        return;
      }

      // In create mode, upload immediately using projectKey
      // Prepare files object for API
      const filesToUpload = {
        media: [fileData.file], // All files go under 'media' key as per API
      };

      // Upload to API
      await uploadMedia(projectKey, filesToUpload);

      // Mark file as uploaded
      setUploadedFiles((prev) => ({
        ...prev,
        [category]: prev[category].map((f) =>
          f.id === fileData.id ? { ...f, isUploading: false, isUploaded: true } : f
        ),
      }));

      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileData.id);
        return newSet;
      });
    } catch (error) {
      console.error(`Error uploading file ${fileData.name}:`, error);
      
      // Mark file as failed
      setUploadedFiles((prev) => ({
        ...prev,
        [category]: prev[category].map((f) =>
          f.id === fileData.id ? { ...f, isUploading: false, isUploadFailed: true } : f
        ),
      }));

      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileData.id);
        return newSet;
      });

      showError(
        t('addNewProject.form.uploadError', { fileName: fileData.name }) || 
        `Failed to upload ${fileData.name}`
      );
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
            className={`pb-3 text-sm font-medium transition-colors md:px-6 ${
              activeTab === tab.id
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
          {Object.entries(groupedFiles).map(([date, files]) => (
            <div key={date} className="space-y-4">
              {/* Date Header */}
              <p className="text-sm font-medium text-secondary">{date}</p>

              {/* Files Grid */}
              {activeTab === 'photos' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {files.map((file, fileIndex) => (
                    <div key={file.id} className="relative group cursor-pointer">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 max-w-[200px] mx-auto relative">
                        <img
                          src={file.url}
                          alt={file.name || `Photo ${fileIndex + 1}`}
                          className={`w-full h-full object-cover ${file.isUploading ? 'opacity-50' : ''}`}
                          onClick={() => {
                            // Open image in new tab for viewing
                            if (!file.isUploading) {
                              window.open(file.url, '_blank');
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
                            <span className="text-xs text-white font-medium">Upload Failed</span>
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
                      <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 max-w-[200px] mx-auto relative">
                        <img
                          src={file.thumbnail || file.url}
                          alt={file.name || `Video ${fileIndex + 1}`}
                          className={`w-full h-full object-cover ${file.isUploading ? 'opacity-50' : ''}`}
                          onClick={() => {
                            // Open video in new tab for viewing
                            if (!file.isUploading) {
                              window.open(file.url, '_blank');
                            }
                          }}
                        />
                        {!file.isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="w-5 h-5 text-primary ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        )}
                        {file.isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                        {file.isUploadFailed && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/30">
                            <span className="text-xs text-white font-medium">Upload Failed</span>
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
                      onClick={() => {
                        // Open document in new tab for viewing
                        if (file.url && !file.isUploading) {
                          window.open(file.url, '_blank');
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
                          {file.isUploading && ' • Uploading...'}
                          {file.isUploadFailed && ' • Upload Failed'}
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


