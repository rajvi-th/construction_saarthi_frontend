/**
 * Custom hook for deleting projects
 * @returns {Object} { deleteProject, isDeleting, error }
 */

import { useState, useCallback } from "react";
import { deleteProject as deleteProjectApi } from "../api";
import { showError, showSuccess } from "../../../utils/toast";
import { useTranslation } from "react-i18next";

export const useDeleteProject = () => {
  const { t } = useTranslation("projects");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteProject = useCallback(
    async (projectId) => {
      if (!projectId) {
        showError("Project ID is required");
        return null;
      }

      try {
        setIsDeleting(true);
        setError(null);

        await deleteProjectApi(projectId);

        showSuccess(
          t("deleteModal.success", {
            defaultValue: "Project deleted successfully",
          })
        );

        return true;
      } catch (err) {
        console.error("Error deleting project:", err);
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          t("deleteModal.error", {
            defaultValue: "Failed to delete project",
          });
        setError(errorMessage);
        showError(errorMessage);
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [t]
  );

  return {
    deleteProject,
    isDeleting,
    error,
  };
};

export default useDeleteProject;

