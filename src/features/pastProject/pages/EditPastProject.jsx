/**
 * Edit Past Project Page
 * Shows editable form with existing details and upload sections
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Eye, Trash2, Video } from 'lucide-react';

import PageHeader from '../../../components/layout/PageHeader';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import FileUpload from '../../../components/ui/FileUpload';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import Loader from '../../../components/ui/Loader';
import documentIcon from '../../../assets/icons/document.svg';
import { PAST_PROJECT_ROUTES } from '../constants';
import { getRoute } from '../../../constants/routes';
import { getPastProjectById, updatePastProject, uploadPastProjectMedia } from '../api/pastProjectApi';
import { useAuth } from '../../../hooks/useAuth';
import { showSuccess, showError } from '../../../utils/toast';

// Helper functions to process media
const getFileNameFromUrl = (url) => {
  if (!url) return 'Untitled';
  try {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    return fileName.split('?')[0] || 'Untitled';
  } catch {
    return 'Untitled';
  }
};

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
  
  // Check typeId
  if (typeId === '1' || typeId === '3' || typeId === '12' || typeId === 1 || typeId === 3 || typeId === 12) {
    if (urlLower.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) return 'video';
    if (urlLower.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i)) return 'document';
    return 'photo';
  }
  
  return 'document';
};

export default function EditPastProject() {
  const { t } = useTranslation(['pastProjects', 'common']);
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();

  const projectFromState = location.state?.project;
  const isAddMode = !id;

  const [project, setProject] = useState(projectFromState || null);
  const [projectName, setProjectName] = useState('');
  const [address, setAddress] = useState('');
  const [mediaItems, setMediaItems] = useState([]); // photos + videos
  const [documentItems, setDocumentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  const [newDocumentFiles, setNewDocumentFiles] = useState([]);

  // Fetch project data from API
  useEffect(() => {
    if (!isAddMode && !project && id) {
      setIsLoading(true);
      getPastProjectById(id)
        .then((projectData) => {
          setProject(projectData);
        })
        .catch((err) => {
          console.error('Error fetching project:', err);
          const errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            t('error.failedToLoad', { defaultValue: 'Failed to load project details' });
          showError(errorMessage);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, project, isAddMode, t]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        if (item.url && item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, []);

  // Process project data and categorize media
  useEffect(() => {
    if (project) {
      setProjectName(project.site_name || project.name || '');
      setAddress(project.address || '');

      // Process pastWorkMedia array
      if (project.pastWorkMedia && Array.isArray(project.pastWorkMedia)) {
        const activeMedia = project.pastWorkMedia.filter(
          (media) => !media.isDeleted && media.url
        );

        const photos = [];
        const videos = [];
        const documents = [];

        activeMedia.forEach((mediaItem) => {
          const mediaType = getMediaType(mediaItem);
          const fileName = getFileNameFromUrl(mediaItem.url);

          const formattedItem = {
            id: mediaItem.id,
            url: mediaItem.url,
            name: fileName,
            typeId: mediaItem.typeId,
            createdAt: mediaItem.createdAt,
          };

          if (mediaType === 'photo') {
            photos.push(formattedItem);
          } else if (mediaType === 'video') {
            formattedItem.thumbnail = mediaItem.thumbnail || mediaItem.url;
            videos.push(formattedItem);
          } else if (mediaType === 'document') {
            documents.push(formattedItem);
          }
        });

        setMediaItems([...photos, ...videos]);
        setDocumentItems(documents);
      } else {
        // Fallback: check array fields from list API
        const photos = [];
        const videos = [];
        const documents = [];

        if (project.photo && Array.isArray(project.photo)) {
          project.photo.forEach((url) => {
            photos.push({ id: `photo-${url}`, url, name: getFileNameFromUrl(url) });
          });
        }
        if (project.myPastWorkphoto && Array.isArray(project.myPastWorkphoto)) {
          project.myPastWorkphoto.forEach((url) => {
            photos.push({ id: `photo-${url}`, url, name: getFileNameFromUrl(url) });
          });
        }

        if (project.document && Array.isArray(project.document)) {
          project.document.forEach((url) => {
            const urlLower = url.toLowerCase();
            if (urlLower.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i)) {
              documents.push({ id: `doc-${url}`, url, name: getFileNameFromUrl(url) });
            } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) {
              photos.push({ id: `photo-${url}`, url, name: getFileNameFromUrl(url) });
            }
          });
        }
        if (project.myPastWorkdocument && Array.isArray(project.myPastWorkdocument)) {
          project.myPastWorkdocument.forEach((url) => {
            const urlLower = url.toLowerCase();
            if (urlLower.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i)) {
              documents.push({ id: `doc-${url}`, url, name: getFileNameFromUrl(url) });
            } else if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) {
              photos.push({ id: `photo-${url}`, url, name: getFileNameFromUrl(url) });
            }
          });
        }

        setMediaItems([...photos, ...videos]);
        setDocumentItems(documents);
      }
    }
  }, [project]);

  const handleSave = async () => {
    if (!projectName.trim()) {
      showError(t('validation.projectNameRequired', { defaultValue: 'Project name is required' }));
      return;
    }

    if (!address.trim()) {
      showError(t('validation.addressRequired', { defaultValue: 'Address is required' }));
      return;
    }

    if (isAddMode) {
      // Add mode - navigate to add page
      navigate(PAST_PROJECT_ROUTES.ADD);
      return;
    }

    if (!id) {
      showError(t('error.projectIdNotFound', { defaultValue: 'Project ID not found' }));
      return;
    }

    setIsSaving(true);

    try {
      // Update project details (include projectKey if available, similar to create API)
      await updatePastProject(id, {
        name: projectName.trim(),
        address: address.trim(),
        ...(project?.projectKey && { projectKey: project.projectKey }),
      }, selectedWorkspace);

      // Upload new media files if any
      if (newMediaFiles.length > 0) {
        if (project?.projectKey) {
          try {
            await uploadPastProjectMedia(project.projectKey, newMediaFiles);
            showSuccess(t('success.mediaUploaded', { defaultValue: 'Media files uploaded successfully!' }));
          } catch (uploadError) {
            console.error('Error uploading media:', uploadError);
            const errorMessage =
              uploadError?.response?.data?.message ||
              uploadError?.message ||
              t('error.uploadFailed', { defaultValue: 'Failed to upload media files' });
            showError(errorMessage);
            // Don't fail the whole save if upload fails
          }
        } else {
          console.warn('Project key not available, skipping media upload');
        }
      }

      // Upload new document files if any
      if (newDocumentFiles.length > 0) {
        if (project?.projectKey) {
          try {
            await uploadPastProjectMedia(project.projectKey, newDocumentFiles);
            showSuccess(t('success.documentsUploaded', { defaultValue: 'Documents uploaded successfully!' }));
          } catch (uploadError) {
            console.error('Error uploading documents:', uploadError);
            const errorMessage =
              uploadError?.response?.data?.message ||
              uploadError?.message ||
              t('error.uploadFailed', { defaultValue: 'Failed to upload documents' });
            showError(errorMessage);
            // Don't fail the whole save if upload fails
          }
        } else {
          console.warn('Project key not available, skipping document upload');
        }
      }

      // Refetch project data to get latest updates
      const updatedProject = await getPastProjectById(id);
      setProject(updatedProject);

      showSuccess(t('success.projectUpdated', { defaultValue: 'Project updated successfully!' }));

      // Navigate to detail page with updated project
      navigate(getRoute(PAST_PROJECT_ROUTES.DETAILS, { id }), {
        state: { project: updatedProject },
      });
    } catch (error) {
      console.error('Error updating project:', error);
      console.error('Error response data:', error?.response?.data);
      
      // Extract detailed error message
      const errorData = error?.response?.data;
      let errorMessage = 
        errorData?.message ||
        errorData?.error ||
        errorData?.errors?.[0]?.message ||
        error?.message ||
        t('error.updateFailed', { defaultValue: 'Failed to update project. Please try again.' });
      
      // Add status code info for debugging
      if (error?.response?.status) {
        console.error(`Update failed with status ${error.response.status}:`, errorMessage);
      }
      
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getFileType = (file) => {
    const type = file.type || '';
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    return 'document';
  };

  const createPreviewUrl = (file) => {
    return URL.createObjectURL(file);
  };

  const handleMediaUpload = async (files) => {
    const fileArray = Array.from(files);
    const filesWithPreview = fileArray.map((file) => {
      const fileType = getFileType(file);
      return {
        file,
        id: `new-${Date.now()}-${Math.random()}`,
        url: fileType === 'image' || fileType === 'video' ? createPreviewUrl(file) : null,
        name: file.name,
        type: fileType,
        isNew: true,
      };
    });

    setMediaItems((prev) => [...prev, ...filesWithPreview]);
    setNewMediaFiles((prev) => [...prev, ...fileArray]);
  };

  const handleDocumentsUpload = async (files) => {
    const fileArray = Array.from(files);
    
    // Filter only PDF files
    const pdfFiles = fileArray.filter((file) => {
      const fileType = file.type || '';
      const fileName = file.name || '';
      return fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
    });

    if (pdfFiles.length === 0) {
      showError(t('validation.onlyPdfAllowed', { defaultValue: 'Only PDF files are allowed in documents section' }));
      return;
    }

    if (pdfFiles.length < fileArray.length) {
      showError(t('validation.someFilesRejected', { defaultValue: 'Some files were rejected. Only PDF files are allowed.' }));
    }

    const filesWithPreview = pdfFiles.map((file) => ({
      file,
      id: `new-doc-${Date.now()}-${Math.random()}`,
      url: null,
      name: file.name,
      type: 'document',
      isNew: true,
    }));

    setDocumentItems((prev) => [...prev, ...filesWithPreview]);
    setNewDocumentFiles((prev) => [...prev, ...pdfFiles]);
  };

  const handleRemoveMedia = (idToRemove) => {
    setMediaItems((prev) => {
      const itemToRemove = prev.find((item) => item.id === idToRemove);
      if (itemToRemove?.isNew && itemToRemove?.file) {
        // Remove from new files if it's a new upload
        setNewMediaFiles((files) => files.filter((f) => f !== itemToRemove.file));
        // Revoke object URL if exists
        if (itemToRemove.url && itemToRemove.url.startsWith('blob:')) {
          URL.revokeObjectURL(itemToRemove.url);
        }
      }
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  const handleRemoveDocument = (idToRemove) => {
    setDocumentItems((prev) => {
      const itemToRemove = prev.find((item) => item.id === idToRemove);
      if (itemToRemove?.isNew && itemToRemove?.file) {
        // Remove from new files if it's a new upload
        setNewDocumentFiles((files) => files.filter((f) => f !== itemToRemove.file));
      }
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  const handleViewDocument = (doc) => {
    if (doc.url && doc.url !== '#') {
      window.open(doc.url, '_blank');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={t('editTitle', { ns: 'pastProjects', defaultValue: 'Edit Project' })}
        />
        <div className="mt-8 flex items-center justify-center py-20">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  // If project not found in edit mode, show simple not-found UI
  if (!isAddMode && !project && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary text-lg mb-2">
            {t('error.projectNotFound', { ns: 'pastProjects', defaultValue: 'Past project not found' })}
          </p>
          <Button variant="primary" onClick={() => navigate(PAST_PROJECT_ROUTES.LIST)}>
            {t('detail.backToPastWork', { ns: 'pastProjects', defaultValue: 'Back to Past Work' })}
          </Button>
        </div>
      </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title={
            isAddMode
              ? t('addTitle', { ns: 'pastProjects', defaultValue: 'Add Project (Site)' })
              : projectName || project?.site_name || project?.name || t('editTitle', { ns: 'pastProjects', defaultValue: 'Edit Project' })
          }
          showBackButton={true}
          backTo={PAST_PROJECT_ROUTES.LIST}
        />

        {/* Basic details */}
        <div className="space-y-4">
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
        </div>

        {/* Upload Images / Videos */}
        <div className="my-6 space-y-2">
          <p className="text-xs sm:text-sm font-medium text-primary">
            {t('uploadImagesVideos', {
              ns: 'pastProjects',
              defaultValue: 'Upload Images/Videos*',
            })}
          </p>
          <FileUpload
            title={t('uploadTitle', {
              ns: 'pastProjects',
              defaultValue: 'Upload Photos/ Videos / Documents',
            })}
            supportedFormats={t('supportedFormats', {
              ns: 'pastProjects',
              defaultValue: 'JPG, PNG, Mp4, PDF',
            })}
            maxSize={10}
            maxSizeUnit="MB"
            maxSizeText={t('maxSizeEach', {
              ns: 'pastProjects',
              defaultValue: '10MB each',
            })}
            supportedFormatLabel={t('supportedFormatsLabel', {
              ns: 'pastProjects',
              defaultValue: 'Supported Format:',
            })}
            onFileSelect={handleMediaUpload}
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

          {/* Media Preview */}
          {mediaItems.length > 0 && (
            <div className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaItems.map((item) => (
                  <div key={item.id} className="relative group">
                    {item.type === 'image' && item.url ? (
                      <div className="relative">
                        <img
                          src={item.url}
                          alt={item.name || 'Photo'}
                          className="w-full h-24 sm:h-28 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(item.id)}
                          disabled={isSaving}
                          className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : item.type === 'video' && item.url ? (
                      <div className="relative">
                        <video
                          src={item.url}
                          className="w-full h-24 sm:h-28 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(item.id)}
                          disabled={isSaving}
                          className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : item.url ? (
                      <div className="relative">
                        <img
                          src={item.url}
                          alt={item.name || 'Media'}
                          className="w-full h-24 sm:h-28 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(item.id)}
                          disabled={isSaving}
                          className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload Documents */}
        <div className="my-6 space-y-2">
          <p className="text-xs sm:text-sm font-medium text-primary">
            {t('uploadDocuments', {
              ns: 'pastProjects',
              defaultValue: 'Upload Documents',
            })}
          </p>
          <FileUpload
            title={t('uploadTitle', {
              ns: 'pastProjects',
              defaultValue: 'Upload Photos/ Videos / Documents',
            })}
            supportedFormats="PDF"
            maxSize={10}
            maxSizeUnit="MB"
            maxSizeText={t('maxSizeEach', {
              ns: 'pastProjects',
              defaultValue: '10MB each',
            })}
            supportedFormatLabel={t('supportedFormatsLabel', {
              ns: 'pastProjects',
              defaultValue: 'Supported Format:',
            })}
            onFileSelect={handleDocumentsUpload}
            accept=".pdf"
            uploadButtonText={
              isUploading
                ? t('uploading', { defaultValue: 'Uploading...' })
                : t('uploadButton', {
                    ns: 'pastProjects',
                    defaultValue: 'Upload',
                  })
            }
          />

          {/* Documents list - UI same as Relevant Documents in PastProjectDocumentsGallery */}
          {documentItems.length > 0 && (
            <div className="mt-4 space-y-3">
              {documentItems.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center bg-white gap-3 p-4 rounded-xl group cursor-pointer border border-gray-200"
                  onClick={() => handleViewDocument(doc)}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <img src={documentIcon} alt="Document" className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{doc.name}</p>
                    <p className="text-xs text-primary-light ">
                      {doc.size}
                    </p>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <DropdownMenu
                      items={[
                        {
                          label: t('detail.viewDocument', { ns: 'pastProjects', defaultValue: 'View Document' }),
                          onClick: () => handleViewDocument(doc),
                          icon: <Eye className="w-4 h-4" />,
                        },
                        {
                          label: t('delete', { ns: 'common', defaultValue: 'Delete' }),
                          onClick: () => handleRemoveDocument(doc.id),
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
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 pb-10">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto px-6"
            onClick={() => navigate(PAST_PROJECT_ROUTES.LIST)}
            disabled={isSaving}
          >
            {t('cancel', { ns: 'common', defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-full sm:w-auto px-6"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <Loader size="sm" />
                <span>{t('saving', { defaultValue: 'Saving...' })}</span>
              </div>
            ) : (
              t('saveProject', { ns: 'pastProjects', defaultValue: 'Save Project' })
            )}
          </Button>
        </div>
      </div>
  );
}


