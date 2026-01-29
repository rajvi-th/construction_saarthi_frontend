/**
 * Custom hook for editing projects
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Object} { editProject, isSubmitting, error }
 */

import { useState, useCallback } from "react";
import { editProject as editProjectApi } from "../api";
import { showError, showSuccess } from "../../../utils/toast";
import { useTranslation } from "react-i18next";

export const useEditProject = (workspaceId) => {
  const { t } = useTranslation("projects");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const editProject = useCallback(
    async (projectId, data) => {
      if (!workspaceId) {
        showError("Workspace not selected");
        return null;
      }

      if (!projectId) {
        showError("Project ID is required");
        return null;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        // Format dates to YYYY-MM-DD
        const formatDate = (date) => {
          if (!date) return null;
          if (date instanceof Date) {
            return date.toISOString().split("T")[0];
          }
          if (typeof date === 'string') {
            // If already in YYYY-MM-DD format, return as is
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
              return date;
            }
            // Try to parse and format
            const parsed = new Date(date);
            if (!isNaN(parsed.getTime())) {
              return parsed.toISOString().split("T")[0];
            }
          }
          return null;
        };

        // Map form status to API status
        // Form uses "upcoming" and "in_progress", API uses "pending" and "in_progress"
        const mapStatus = (formStatus) => {
          if (formStatus === "upcoming") return "pending";
          return formStatus || "pending";
        };

        const projectData = {
          name: data.siteName,
          status: mapStatus(data.projectStatus),
          address: data.address || "",
          builderId: data.builderId || null,
          startDate: formatDate(data.startDate),
          endDate: formatDate(data.endDate),
          totalArea: data.totalArea || null,
          gaugeTypeId: data.areaUnit === "meter" ? 2 : 1, // 1 = sqft, 2 = meter
          perUnitRate: data.perSqFtRate || null,
          numberOfFloors: data.noOfFloors || null,
          contractTypeId: data.contractType || null,
          constructionTypeId: data.constructionType || null,
          description: data.projectDescription || "",
          estimatedBudget: data.estimatedBudget || null,
          profilePhoto: data.profilePhoto || null,
          keepMediaIds: data.keepMediaIds || null,
          media: data.media || null,
        };

        const response = await editProjectApi(projectId, projectData);

        showSuccess(
          t("addNewProject.form.projectUpdated", {
            defaultValue: "Project updated successfully",
          })
        );

        return response;
      } catch (err) {
        console.error("Error editing project:", err);
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          t("addNewProject.form.updateError", {
            defaultValue: "Failed to update project",
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
    editProject,
    isSubmitting,
    error,
  };
};

export default useEditProject;

