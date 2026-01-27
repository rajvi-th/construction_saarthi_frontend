/**
 * Custom hook for creating projects
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Object} { createProject, isSubmitting, error }
 */

import { useState, useCallback } from "react";
import {
  startProject,
  editProject as editProjectApi,
} from "../api";
import { showError, showSuccess } from "../../../utils/toast";
import { useTranslation } from "react-i18next";

export const useCreateProject = (workspaceId) => {
  const { t } = useTranslation("projects");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const createProject = useCallback(
    async (data) => {
      if (!workspaceId) {
        showError("Workspace not selected");
        return null;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        // Step 1: Start project to get projectKey (unless provided from pre-init)
        let projectKey = data?.projectKey;
        if (!projectKey) {
          const startResponse = await startProject(workspaceId);
          projectKey =
            startResponse?.projectKey ||
            startResponse?.project_key ||
            startResponse?.key;
        }

        if (!projectKey) {
          throw new Error("Failed to get project key");
        }

        // Step 2: Format dates to YYYY-MM-DD
        const formatDate = (date) => {
          if (!date) return null;
          if (date instanceof Date) {
            return date.toISOString().split("T")[0];
          }
          if (typeof date === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
            const parsed = new Date(date);
            if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0];
          }
          return null;
        };

        // Map form status to API status
        const mapStatus = (formStatus) => {
          if (formStatus === "upcoming") return "pending";
          return formStatus || "pending";
        };

        // Step 3: Use the edit API to finalize project details (as requested: Create uses PUT /project/edit)
        // Combine all media files
        const mediaFiles = [
          ...(data.photos || []),
          ...(data.videos || []),
          ...(data.documents || []),
        ].map(item => {
          if (item.file instanceof File) return item.file; // New file
          if (item.id && (item.isExisting || item.isUploaded)) return item.id; // Existing/Uploaded ID
          if (item instanceof File) return item;
          return null;
        }).filter(Boolean);

        const projectData = {
          name: data.siteName,
          status: mapStatus(data.projectStatus),
          address: data.address || "",
          builderId: data.builderId || null,
          startDate: formatDate(data.startDate),
          endDate: formatDate(data.endDate),
          totalArea: data.totalArea || null,
          gaugeTypeId: data.areaUnit === "meter" ? 2 : 1,
          perUnitRate: data.perSqFtRate || null,
          numberOfFloors: data.noOfFloors || null,
          contractTypeId: data.contractType || null,
          constructionTypeId: data.constructionType || null,
          description: data.projectDescription || "",
          estimatedBudget: data.estimatedBudget || null,
          profilePhoto: data.profilePhoto || null,
          media: mediaFiles.length > 0 ? mediaFiles : null,
        };

        // Call editProject API with projectKey as the ID (as per requested PUT /project/edit/{id})
        const response = await editProjectApi(projectKey, projectData);

        showSuccess(
          t("addNewProject.form.projectCreated", {
            defaultValue: "Project created successfully",
          })
        );

        return response;
      } catch (err) {
        console.error("Error creating project:", err);
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          t("addNewProject.form.createError", {
            defaultValue: "Failed to create project",
          });
        setError(errorMessage);
        showError(errorMessage);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [workspaceId, t]
  );

  return {
    createProject,
    isSubmitting,
    error,
  };
};

export default useCreateProject;
