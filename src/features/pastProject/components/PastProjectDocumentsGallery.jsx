/**
 * Past Project Documents and Gallery Component
 * Displays relevant documents and project gallery (photos/videos) for past projects
 * Fully responsive and dynamic
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Play, Eye, Trash2 } from 'lucide-react';
import documentIcon from '../../../assets/icons/document.svg';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Loader from '../../../components/ui/Loader';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Format file size
const formatFileSize = (url) => {
  // If we have size info, use it, otherwise return empty
  return '';
};

// Get file name from URL
const getFileNameFromUrl = (url) => {
  if (!url) return 'Untitled';
  try {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    // Remove query parameters if any
    return fileName.split('?')[0] || 'Untitled';
  } catch {
    return 'Untitled';
  }
};

// Determine media type from URL and typeId
const getMediaType = (mediaItem) => {
  const url = mediaItem.url || '';
  const typeId = String(mediaItem.typeId || '');
  const urlLower = url.toLowerCase();
  
  // Check file extension
  if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) {
    return 'photo';
  }
  if (urlLower.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) {
    return 'video';
  }
  if (urlLower.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i)) {
    return 'document';
  }
  
  // Check typeId (common patterns: 1, 3, 12 = photos)
  // Based on API response, typeId "12" appears to be photos
  // Note: We prioritize file extension over typeId for accuracy
  if (typeId === '1' || typeId === '3' || typeId === '12' || typeId === 1 || typeId === 3 || typeId === 12) {
    // If typeId suggests photo but file extension suggests otherwise, trust file extension
    if (urlLower.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) {
      return 'video';
    }
    if (urlLower.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i)) {
      return 'document';
    }
    return 'photo';
  }
  
  // Default to document if can't determine (safer default)
  return 'document';
};

export default function PastProjectDocumentsGallery({
  project,
  onDocumentDelete,
  showDocuments = true,
  showGallery = true,
}) {
  const { t } = useTranslation(['pastProjects', 'common']);
  const [activeTab, setActiveTab] = useState('photos');
  const [documents, setDocuments] = useState([]);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [photoItems, setPhotoItems] = useState([]);
  const [videoItems, setVideoItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [loadingImages, setLoadingImages] = useState(new Set());

  // Process media from both API structures:
  // 1. Detail API: pastWorkMedia array with typeId
  // 2. List API: photo, document, myPastWorkdocument arrays
  useEffect(() => {
    setIsProcessing(true);
    const categorized = {
      documents: [],
      photos: [],
      videos: [],
    };

    // Helper to add item to categorized array
    const addToCategory = (url, category, id = null, createdAt = null, typeId = null) => {
      if (!url) return;
      
      const fileName = getFileNameFromUrl(url);
      const formattedDate = createdAt ? formatDate(createdAt) : formatDate(new Date());
      
      const formattedItem = {
        id: id || `item-${Date.now()}-${Math.random()}`,
        url: url,
        name: fileName,
        date: formattedDate,
        uploadDate: formattedDate,
        createdAt: createdAt || new Date().toISOString(),
        typeId: typeId,
      };

      if (category === 'document') {
        categorized.documents.push(formattedItem);
      } else if (category === 'photo') {
        categorized.photos.push(formattedItem);
      } else if (category === 'video') {
        formattedItem.thumbnail = url;
        categorized.videos.push(formattedItem);
      }
    };

    // 1. Process pastWorkMedia array (Detail API structure)
    if (project?.pastWorkMedia && Array.isArray(project.pastWorkMedia)) {
      const activeMedia = project.pastWorkMedia.filter(
        (media) => !media.isDeleted && media.url
      );

      activeMedia.forEach((mediaItem) => {
        const mediaType = getMediaType(mediaItem);
        addToCategory(mediaItem.url, mediaType, mediaItem.id, mediaItem.createdAt, mediaItem.typeId);
      });
    }

    // 2. Process array fields from List API structure
    // Handle photo arrays
    if (project?.photo && Array.isArray(project.photo)) {
      project.photo.forEach((url) => {
        addToCategory(url, 'photo');
      });
    }
    if (project?.myPastWorkphoto && Array.isArray(project.myPastWorkphoto)) {
      project.myPastWorkphoto.forEach((url) => {
        addToCategory(url, 'photo');
      });
    }

    // Handle document arrays
    if (project?.document && Array.isArray(project.document)) {
      project.document.forEach((url) => {
        // Determine if it's actually a document or photo based on extension
        const urlLower = url.toLowerCase();
        if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) {
          addToCategory(url, 'photo');
        } else {
          addToCategory(url, 'document');
        }
      });
    }
    if (project?.myPastWorkdocument && Array.isArray(project.myPastWorkdocument)) {
      project.myPastWorkdocument.forEach((url) => {
        // Determine if it's actually a document or photo based on extension
        const urlLower = url.toLowerCase();
        if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) {
          addToCategory(url, 'photo');
        } else {
          addToCategory(url, 'document');
        }
      });
    }

    setDocuments(categorized.documents);
    setPhotoItems(categorized.photos);
    setVideoItems(categorized.videos);
    setIsProcessing(false);
  }, [project]);

  const handleViewDocument = (doc) => {
    if (doc.url && doc.url !== '#') {
      window.open(doc.url, '_blank');
    }
  };

  const handleDeleteClick = (doc) => {
    setDocumentToDelete(doc);
  };

  const handleDeleteConfirm = () => {
    if (documentToDelete) {
      // Remove document from local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentToDelete.id));
      
      // Call parent callback if provided (for API integration)
      if (onDocumentDelete) {
        onDocumentDelete(documentToDelete.id);
      }
      
      setDocumentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDocumentToDelete(null);
  };

  const tabs = [
    { id: 'photos', label: t('detail.photos', { ns: 'pastProjects', defaultValue: 'Photos' }) },
    { id: 'videos', label: t('detail.videos', { ns: 'pastProjects', defaultValue: 'Videos' }) },
  ];

  // Show loader while processing project data
  if (isProcessing) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* Relevant Documents Section */}
      {showDocuments && documents.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-medium text-primary mb-2">
            {t('detail.relevantDocuments', { ns: 'pastProjects', defaultValue: 'Relevant Documents' })}
          </h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center bg-white gap-3 p-4 rounded-xl group cursor-pointer"
                onClick={() => {
                  if (doc.url && doc.url !== '#') {
                    window.open(doc.url, '_blank');
                  }
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <img src={documentIcon} alt="Document" className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {doc.name}
                  </p>
                  {doc.date && (
                    <p className="text-xs text-primary-light">
                      {doc.date}
                    </p>
                  )}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu
                    items={[
                      {
                        label: t('detail.viewDocument', { ns: 'pastProjects', defaultValue: 'View Document' }),
                        onClick: () => handleViewDocument(doc),
                        icon: <Eye className="w-4 h-4" />,
                      },
                      {
                        label: t('delete', { ns: 'common', defaultValue: 'Delete' }),
                        onClick: () => handleDeleteClick(doc),
                        icon: <Trash2 className="w-4 h-4 text-accent" />,
                        textColor: 'text-accent',
                      },
                    ]}
                    position="right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Gallery Section */}
      {showGallery && (
      <div className="">
        <h2 className="text-lg sm:text-xl font-medium text-primary mb-4">
          {t('detail.projectGallery', { ns: 'pastProjects', defaultValue: 'Project Gallery' })}
        </h2>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors md:px-6 cursor-pointer ${
                activeTab === tab.id
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <>
            {photoItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
                {photoItems.map((file) => {
                  const isImageLoading = loadingImages.has(file.id);
                  return (
                    <div
                      key={file.id}
                      className="relative group cursor-pointer w-[140px] sm:w-[160px]"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden border border-gray-200 relative bg-gray-100">
                        {isImageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader size="sm" />
                          </div>
                        )}
                        <img
                          src={file.url}
                          alt={file.name || 'Photo'}
                          className={`w-full h-full object-cover ${isImageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                          onLoad={() => {
                            setLoadingImages((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(file.id);
                              return newSet;
                            });
                          }}
                          onLoadStart={() => {
                            setLoadingImages((prev) => new Set(prev).add(file.id));
                          }}
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
                        setPhotoItems((prev) => prev.filter((item) => item.id !== file.id));
                      }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-3 h-3 text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-secondary">
                <p className="text-sm">
                  {t('detail.noPhotosUploaded', { ns: 'pastProjects', defaultValue: 'No photos uploaded yet' })}
                </p>
              </div>
            )}
          </>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <>
            {videoItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
                {videoItems.map((file) => {
                  const isVideoLoading = loadingImages.has(file.id);
                  return (
                    <div
                      key={file.id}
                      className="relative group cursor-pointer w-[140px] sm:w-[160px]"
                    >
                      <div className="aspect-square">
                        <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 relative bg-gray-100">
                        {isVideoLoading && (
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <Loader size="sm" />
                          </div>
                        )}
                        <img
                          src={file.thumbnail || file.url}
                          alt={file.name || 'Video'}
                          className={`w-full h-full object-cover ${isVideoLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                          onLoad={() => {
                            setLoadingImages((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(file.id);
                              return newSet;
                            });
                          }}
                          onLoadStart={() => {
                            setLoadingImages((prev) => new Set(prev).add(file.id));
                          }}
                          onClick={() => {
                            // Open video in new tab for viewing
                            window.open(file.url, '_blank');
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 shadow-md flex items-center justify-center">
                            <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoItems((prev) => prev.filter((item) => item.id !== file.id));
                      }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-3 h-3 text-primary" />
                    </button>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-secondary">
                <p className="text-sm">
                  {t('detail.noVideosUploaded', { ns: 'pastProjects', defaultValue: 'No videos uploaded yet' })}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!documentToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t('detail.deleteDocument', { ns: 'pastProjects', defaultValue: 'Delete Document' })}
        message={
          documentToDelete ? (
            <p>
              {t('detail.deleteConfirmMessage', { ns: 'pastProjects', defaultValue: 'Are you sure you want to delete' })}{' '}
              <span className="font-medium text-primary">
                {documentToDelete.name}
              </span>
              ? {t('detail.deleteConfirmAction', { ns: 'pastProjects', defaultValue: 'This action cannot be undone.' })}
            </p>
          ) : (
            ''
          )
        }
        confirmText={t('delete', { ns: 'common', defaultValue: 'Delete' })}
        cancelText={t('cancel', { ns: 'common', defaultValue: 'Cancel' })}
        confirmVariant="primary"
      />
    </>
  );
}

