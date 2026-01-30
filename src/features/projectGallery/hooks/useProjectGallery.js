/**
 * Custom hook for fetching and managing project gallery items
 * @param {string|number} projectId - Project ID
 * @param {string} type - Media type: 'photo', 'video', or 'document'
 * @param {string} dateFilter - Date filter: 'custom', 'recent', 'oldest', etc.
 * @returns {Object} { galleryItems, isLoading, error, refetch }
 */

import { useState, useEffect, useCallback } from 'react';
import { getProjectGallery, deleteMedia } from '../api/projectGalleryApi';
import { showError, showSuccess } from '../../../utils/toast';

export const useProjectGallery = (projectId, type, dateFilter) => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGalleryItems = useCallback(async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setGalleryItems([]);

      const params = {
        projectId,
        ...(type && { type }),
        ...(dateFilter && { dateFilter }),
      };

      const data = await getProjectGallery(params);

      const responseData = data?.data || data;

      if (responseData?.gallery && Array.isArray(responseData.gallery)) {
        const flattenedItems = responseData.gallery.flatMap((group) => {
          const items = group.items || [];
          return items.map((item) => ({
            ...item,
            date: group.date,
          }));
        });
        setGalleryItems(flattenedItems);
      } else if (Array.isArray(responseData)) {
        setGalleryItems(responseData);
      } else {
        const items = responseData?.galleryItems || responseData?.items || [];
        setGalleryItems(Array.isArray(items) ? items : []);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load gallery items. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      setGalleryItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, type, dateFilter]);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  const handleDelete = useCallback(async (mediaId) => {
    try {
      await deleteMedia(mediaId);
      showSuccess('Media deleted successfully');
      // Refetch gallery items after deletion
      await fetchGalleryItems();
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete media. Please try again.';
      showError(errorMessage);
      throw err;
    }
  }, [fetchGalleryItems]);

  return {
    galleryItems,
    isLoading,
    error,
    refetch: fetchGalleryItems,
    deleteMedia: handleDelete,
  };
};

export default useProjectGallery;

