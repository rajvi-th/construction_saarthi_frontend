/**
 * Custom hook for creating projects
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Object} { createProject, isSubmitting, error }
 */

import { useState, useCallback } from 'react';
import { startProject, uploadMedia, createProject as createProjectApi } from '../api';
import { showError, showSuccess } from '../../../utils/toast';
import { useTranslation } from 'react-i18next';

export const useCreateProject = (workspaceId) => {
  const { t } = useTranslation('projects');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const createProject = useCallback(async (data) => {
    if (!workspaceId) {
      showError('Workspace not selected');
      return null;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Step 1: Start project to get projectKey
      const startResponse = await startProject(workspaceId);
      const projectKey = startResponse?.projectKey;

      if (!projectKey) {
        throw new Error('Failed to get project key');
      }

      // Step 2: Upload media files if any
      const mediaFiles = {};
      // Add profile photo if selected
      if (data.profilePhoto) {
        mediaFiles.profilePhoto = Array.isArray(data.profilePhoto) ? data.profilePhoto : [data.profilePhoto];
      }
      // Add other photos if any
      if (data.photos && data.photos.length > 0) {
        mediaFiles.media = data.photos.map(f => f.file || f);
      }
      if (data.videos && data.videos.length > 0) {
        mediaFiles.video = data.videos.map(f => f.file || f);
      }
      if (data.documents && data.documents.length > 0) {
        // If media already exists, merge documents
        if (mediaFiles.media) {
          mediaFiles.media = [...mediaFiles.media, ...data.documents.map(f => f.file || f)];
        } else {
          mediaFiles.media = data.documents.map(f => f.file || f);
        }
      }

      if (Object.keys(mediaFiles).length > 0) {
        await uploadMedia(projectKey, mediaFiles);
      }

      // Step 3: Create project with all details
      const projectDetails = {
        address: data.address || '',
        builderId: data.builderId || null,
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : null,
        totalArea: data.totalArea || null,
        gaugeTypeId: data.areaUnit === 'meter' ? '2' : '1', // Assuming 1 = sqft, 2 = meter
        perUnitRate: data.perSqFtRate ? parseFloat(data.perSqFtRate) : null,
        numberOfFloors: data.noOfFloors ? parseInt(data.noOfFloors) : null,
        constructionTypeId: data.constructionType || null,
        contractTypeId: data.contractType || null,
        estimatedBudget: data.estimatedBudget ? parseFloat(data.estimatedBudget) : null,
        description: data.projectDescription || '',
      };

      const projectData = {
        workspaceId: workspaceId,
        name: data.siteName,
        status: data.projectStatus || 'pending',
        details: projectDetails,
      };

      const response = await createProjectApi(projectData);

      showSuccess(t('addNewProject.form.projectCreated', { defaultValue: 'Project created successfully' }));

      return response;
    } catch (err) {
      console.error('Error creating project:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('addNewProject.form.createError', { defaultValue: 'Failed to create project' });
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [workspaceId, t]);

  return {
    createProject,
    isSubmitting,
    error,
  };
};

export default useCreateProject;

