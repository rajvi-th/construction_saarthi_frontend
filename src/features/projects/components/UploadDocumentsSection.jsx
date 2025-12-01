/**
 * UploadDocumentsSection
 * Bottom card for Add New Project - upload relevant images/documents with tabs
 */

import { useState } from 'react';
import { X, Play, FileText } from 'lucide-react';
import FileUpload from '../../../components/ui/FileUpload';
import { showError } from '../../../utils/toast';

function UploadDocumentsSection({ t, onFilesChange }) {
  const [activeTab, setActiveTab] = useState('photos');
  const [uploadedFiles, setUploadedFiles] = useState({
    photos: [],
    videos: [],
    documents: [],
  });

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

  const handleFileSelect = (files) => {
    const now = new Date();
    const uploadDate = formatDate(now);
    const uploadDateTime = formatDateTime(now);

    // Validate files match active tab and size
    const invalidFiles = [];
    const oversizedFiles = [];
    const validFiles = [];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    Array.from(files).forEach((file) => {
      const fileType = getFileType(file);
      const expectedType = activeTab === 'photos' ? 'photo' : activeTab === 'videos' ? 'video' : 'document';
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file);
        return;
      }
      
      // Check file type
      if (fileType !== expectedType) {
        invalidFiles.push(file);
      } else {
        validFiles.push(file);
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
      const tabName = activeTab === 'photos' 
        ? t('addNewProject.form.tabs.photos') 
        : activeTab === 'videos' 
        ? t('addNewProject.form.tabs.videos') 
        : t('addNewProject.form.tabs.documents');
      
      showError(
        t('addNewProject.form.validation.invalidFileType', { 
          tab: tabName,
          count: invalidFiles.length 
        })
      );
      
      // Don't proceed if all files are invalid
      if (validFiles.length === 0) {
        return;
      }
    }

    // Process only valid files
    const newFiles = validFiles.map((file) => {
      const fileType = getFileType(file);
      const fileData = {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: formatFileSize(file.size),
        uploadDate,
        uploadDateTime,
        date: uploadDateTime,
      };

      if (fileType === 'photo') {
        fileData.url = createPreviewUrl(file);
      } else if (fileType === 'video') {
        fileData.thumbnail = createPreviewUrl(file);
        fileData.url = createPreviewUrl(file);
      } else {
        // For documents, create URL for viewing
        fileData.url = createPreviewUrl(file);
      }

      return { type: fileType, data: fileData };
    });

    // Add files to current active tab only
    const filesToAdd = newFiles.map(({ data }) => data);

    setUploadedFiles((prev) => {
      const updated = {
        ...prev,
        [activeTab]: [...prev[activeTab], ...filesToAdd],
      };
      // Notify parent of file changes
      if (onFilesChange) {
        onFilesChange(updated);
      }
      return updated;
    });
  };

  const handleRemoveFile = (type, index) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev[type][index];
      // Revoke object URL to free memory
      if (fileToRemove.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      if (fileToRemove.thumbnail) {
        URL.revokeObjectURL(fileToRemove.thumbnail);
      }
      const updated = {
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index),
      };
      // Notify parent of file changes
      if (onFilesChange) {
        onFilesChange(updated);
      }
      return updated;
    });
  };

  const tabs = [
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' },
    { id: 'documents', label: 'Documents' },
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
          supportedFormats={
            activeTab === 'photos' 
              ? 'JPG, PNG' 
              : activeTab === 'videos' 
              ? 'MP4, MOV, AVI' 
              : 'PDF'
          }
          onFileSelect={handleFileSelect}
          accept={
            activeTab === 'photos' 
              ? '.jpg,.jpeg,.png' 
              : activeTab === 'videos' 
              ? '.mp4,.mov,.avi' 
              : '.pdf'
          }
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
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 max-w-[200px] mx-auto">
                        <img
                          src={file.url}
                          alt={file.name || `Photo ${fileIndex + 1}`}
                          className="w-full h-full object-cover"
                          onClick={() => {
                            // Open image in new tab for viewing
                            window.open(file.url, '_blank');
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(activeTab, file.originalIndex);
                        }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
                      <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 max-w-[200px] mx-auto">
                        <img
                          src={file.thumbnail || file.url}
                          alt={file.name || `Video ${fileIndex + 1}`}
                          className="w-full h-full object-cover"
                          onClick={() => {
                            // Open video in new tab for viewing
                            window.open(file.url, '_blank');
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-5 h-5 text-primary ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(activeTab, file.originalIndex);
                        }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => {
                        // Open document in new tab for viewing
                        if (file.url) {
                          window.open(file.url, '_blank');
                        }
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-secondary">
                          {file.size} • {file.uploadDateTime || file.date}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(activeTab, file.originalIndex);
                        }}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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


