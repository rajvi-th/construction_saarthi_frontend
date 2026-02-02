/**
 * Builder Invoices Page
 * Static page for builder invoices
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES_FLAT, getRoute } from "../../../constants/routes";
import PageHeader from "../../../components/layout/PageHeader";
import { useAuth } from "../../auth/store";
import Button from "../../../components/ui/Button";
import SearchBar from "../../../components/ui/SearchBar";
import DropdownMenu from "../../../components/ui/DropdownMenu";
import CreateSectionModal from "../../../components/ui/CreateSectionModal";
import UpdateBudgetModal from "../../../components/ui/UpdateBudgetModal";
import EditSectionModal from "../../../components/ui/EditSectionModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { createBuilderInvoiceSection, getBuilderInvoiceSections, getProjectEstimatedBudget, updateProjectEstimatedBudget, updateBuilderInvoiceSection, deleteBuilderInvoiceSection } from "../api/financeApi";
import { showSuccess, showError } from "../../../utils/toast";
import builderIcon from "../../../assets/icons/buider.svg";
import emptyStateIcon from "../../../assets/icons/EmptyState.svg";
import blackPencilIcon from "../../../assets/icons/Blackpencil.svg";
import pencilIcon from "../../../assets/icons/pencil.svg";
import trashIcon from "../../../assets/icons/Trash.svg";
import { Plus, ChevronRight } from "lucide-react";

export default function BuilderInvoices() {
  const { t } = useTranslation("finance");
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const projectName = state.projectName || "";
  const fromProjects = !!state.fromProjects;
  const fromDashboard = !!state.fromDashboard;
  const { selectedWorkspace } = useAuth();

  // State management
  const [budget, setBudget] = useState("1.2 Cr");
  const [sections, setSections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateSectionModalOpen, setIsCreateSectionModalOpen] =
    useState(false);
  const [isUpdateBudgetModalOpen, setIsUpdateBudgetModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] =
    useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isLoadingBudget, setIsLoadingBudget] = useState(false);
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);
  const [isUpdatingSection, setIsUpdatingSection] = useState(false);
  const [isDeletingSection, setIsDeletingSection] = useState(false);
  const isCreatingSectionRef = useRef(false);
  const isFetchingSectionsRef = useRef(false);
  const isFetchingBudgetRef = useRef(false);
  const isUpdatingBudgetRef = useRef(false);
  const isUpdatingSectionRef = useRef(false);

  // Fetch builder invoice sections from API
  const fetchBuilderInvoiceSections = async () => {
    // Prevent duplicate API calls
    if (isFetchingSectionsRef.current) {
      console.log("Already fetching builder invoice sections, skipping duplicate call");
      return;
    }

    if (!projectId || !selectedWorkspace) {
      console.warn("Project ID or workspace ID is missing, cannot fetch builder invoice sections");
      return;
    }

    try {
      isFetchingSectionsRef.current = true;
      setIsLoadingSections(true);
      
      const response = await getBuilderInvoiceSections({
        project_id: projectId,
        workspace_id: selectedWorkspace,
      });

      // Handle different response structures
      let sectionsData = response?.data || response?.sections || response || [];
      
      // If data is an object with nested array, extract it
      if (sectionsData && typeof sectionsData === 'object' && !Array.isArray(sectionsData)) {
        // Try to find array in nested structure
        sectionsData = sectionsData.data || sectionsData.sections || [];
      }
      
      const sectionsList = Array.isArray(sectionsData) ? sectionsData : [];

      // Transform API response to match component structure
      const transformedSections = sectionsList.map((section) => ({
        id: section.id || section.section_id || section.builder_invoice_section_id || Date.now().toString(),
        name: section.name || section.section_name || 'Untitled Section',
      }));

      setSections(transformedSections);
      
      // Only show success toast if sections were actually loaded
      if (transformedSections.length > 0) {
        showSuccess(
          t("sectionsLoaded", {
            defaultValue: "Sections loaded successfully",
          })
        );
      }
    } catch (error) {
      // Handle 404 errors silently (endpoint might not be available yet)
      if (error?.response?.status === 404) {
        // Silently handle 404 - endpoint may not be available yet
        setSections([]);
        return; // Exit early, don't show any error or log
      }
      
      // Log and show error toast for other errors only
      console.error("Error fetching builder invoice sections:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToLoadSections", {
          defaultValue: "Failed to load sections",
        });
      showError(errorMessage);
      setSections([]);
    } finally {
      setIsLoadingSections(false);
      isFetchingSectionsRef.current = false;
    }
  };

  // Fetch estimated budget for the project
  const fetchEstimatedBudget = async () => {
    // Prevent duplicate API calls
    if (isFetchingBudgetRef.current) {
      console.log("Already fetching estimated budget, skipping duplicate call");
      return;
    }

    if (!projectId) {
      console.warn("Project ID is missing, cannot fetch estimated budget");
      return;
    }

    try {
      isFetchingBudgetRef.current = true;
      setIsLoadingBudget(true);
      
      const response = await getProjectEstimatedBudget(projectId);
      console.log("Raw estimated budget from API (BuilderInvoices):", response);

      // Handle different response structures
      let budgetValue = response?.data?.estimatedBudget || 
                       response?.data?.estimated_budget || 
                       response?.data?.budget || 
                       response?.data?.amount ||
                       response?.estimatedBudget || 
                       response?.estimated_budget || 
                       response?.budget || 
                       response?.amount ||
                       response?.data || 
                       response || '0';
      
      // Ensure budgetValue is a number or string that can be parsed
      if (typeof budgetValue !== 'string' && typeof budgetValue !== 'number') {
        budgetValue = '0';
      }
      
      const budgetStr = String(budgetValue);
      const numAmount = parseFloat(budgetStr.replace(/,/g, ""));
      
      if (!isNaN(numAmount) && numAmount > 0) {
        // Format budget for display (e.g., "1.2 Cr", "50 Lakh")
        let formattedBudget;
        if (numAmount >= 10000000) {
          formattedBudget = `${(numAmount / 10000000).toFixed(1)} Cr`;
        } else if (numAmount >= 100000) {
          formattedBudget = `${(numAmount / 100000).toFixed(1)} Lakh`;
        } else {
          formattedBudget = `₹${numAmount.toLocaleString("en-IN")}`;
        }
        setBudget(formattedBudget);
        console.log("Budget set to (BuilderInvoices):", formattedBudget);
      } else {
        console.warn("Invalid budget value:", budgetValue);
        setBudget("1.2 Cr"); // Default fallback
      }
    } catch (error) {
      // Handle 404 errors silently (endpoint might not be available yet)
      if (error?.response?.status === 404) {
        console.warn("Estimated budget endpoint not found (404). Endpoint may not be available yet.");
        // Keep default budget
      } else {
        console.error("Error fetching estimated budget:", error);
        // Keep default budget on error
      }
    } finally {
      setIsLoadingBudget(false);
      isFetchingBudgetRef.current = false;
    }
  };

  // Fetch sections and budget on component mount
  // Only fetch if endpoint is available (will fail silently if 404)
  useEffect(() => {
    fetchBuilderInvoiceSections().catch(() => {
      // Silently handle errors - endpoint may not be available yet
    });
    fetchEstimatedBudget().catch(() => {
      // Silently handle errors - endpoint may not be available yet
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Format budget for display
  const formatBudget = (budgetStr) => {
    // If it already has Cr/Lakh suffix, return as is
    if (budgetStr.includes("Cr") || budgetStr.includes("Lakh")) {
      return budgetStr;
    }
    // Otherwise return as is (assuming it's formatted already)
    return budgetStr;
  };

  // Handle create section
  const handleCreateSection = async (sectionName) => {
    // Prevent duplicate API calls
    if (isCreatingSectionRef.current) {
      console.log("Already creating section, skipping duplicate call");
      return false; // Return false to prevent modal from closing
    }

    if (!sectionName || !sectionName.trim()) {
      showError(
        t("sectionNameRequired", {
          defaultValue: "Section name is required",
        })
      );
      return false; // Return false to prevent modal from closing
    }

    if (!projectId || !selectedWorkspace) {
      showError(
        t("missingProjectOrWorkspace", {
          defaultValue: "Missing project or workspace ID. Please refresh the page.",
        })
      );
      return false; // Return false to prevent modal from closing
    }

    try {
      isCreatingSectionRef.current = true;
      setIsCreatingSection(true);

      const response = await createBuilderInvoiceSection({
        name: sectionName,
        workspace_id: selectedWorkspace,
        project_id: projectId,
      });

      // Show success toast
      showSuccess(
        t("sectionCreated", {
          defaultValue: "Section created successfully",
        })
      );

      // Refetch sections to get updated list from API
      await fetchBuilderInvoiceSections();

      // Return true to allow modal to close
      return true;
    } catch (error) {
      console.error("Error creating builder invoice section:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToCreateSection", {
          defaultValue: "Failed to create section",
        });
      showError(errorMessage);
      return false; // Return false to prevent modal from closing on error
    } finally {
      setIsCreatingSection(false);
      isCreatingSectionRef.current = false;
    }
  };

  // Handle update budget
  const handleUpdateBudget = async (amount) => {
    // Prevent duplicate API calls
    if (isUpdatingBudgetRef.current) {
      console.log("Already updating budget, skipping duplicate call");
      return false; // Return false to prevent modal from closing
    }

    if (!projectId) {
      showError(
        t("missingProjectId", {
          defaultValue: "Missing project ID. Please refresh the page.",
        })
      );
      return false; // Return false to prevent modal from closing
    }

    // Parse amount - remove currency formatting
    const numAmount = parseFloat(amount.replace(/[₹,]/g, ""));
    
    if (isNaN(numAmount) || numAmount < 0) {
      showError(
        t("invalidBudgetAmount", {
          defaultValue: "Please enter a valid budget amount",
        })
      );
      return false; // Return false to prevent modal from closing
    }

    try {
      isUpdatingBudgetRef.current = true;
      setIsUpdatingBudget(true);

      // Call API to update budget
      await updateProjectEstimatedBudget(projectId, numAmount);

      // Show success toast
      showSuccess(
        t("budgetUpdated", {
          defaultValue: "Budget updated successfully",
        })
      );

      // Refetch budget to get updated value from API
      await fetchEstimatedBudget();

      // Return true to allow modal to close
      return true;
    } catch (error) {
      console.error("Error updating budget:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToUpdateBudget", {
          defaultValue: "Failed to update budget",
        });
      showError(errorMessage);
      return false; // Return false to prevent modal from closing
    } finally {
      setIsUpdatingBudget(false);
      isUpdatingBudgetRef.current = false;
    }
  };

  // Handle edit section
  const handleEditSection = async (sectionName) => {
    // Prevent duplicate API calls
    if (isUpdatingSectionRef.current) {
      console.log("Already updating section, skipping duplicate call");
      return false; // Return false to prevent modal from closing
    }

    if (!sectionToEdit || !sectionToEdit.id) {
      showError(
        t("missingSectionId", {
          defaultValue: "Missing section ID. Please refresh the page.",
        })
      );
      return false; // Return false to prevent modal from closing
    }

    if (!sectionName || !sectionName.trim()) {
      showError(
        t("sectionNameRequired", {
          defaultValue: "Section name is required",
        })
      );
      return false; // Return false to prevent modal from closing
    }

    try {
      isUpdatingSectionRef.current = true;
      setIsUpdatingSection(true);

      // Call API to update section
      await updateBuilderInvoiceSection(sectionToEdit.id, {
        name: sectionName.trim(),
      });

      // Show success toast
      showSuccess(
        t("sectionUpdated", {
          defaultValue: "Section updated successfully",
        })
      );

      // Refetch sections to get updated list from API
      await fetchBuilderInvoiceSections();

      // Clear section to edit
      setSectionToEdit(null);

      // Return true to allow modal to close
      return true;
    } catch (error) {
      console.error("Error updating section:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToUpdateSection", {
          defaultValue: "Failed to update section",
        });
      showError(errorMessage);
      return false; // Return false to prevent modal from closing
    } finally {
      setIsUpdatingSection(false);
      isUpdatingSectionRef.current = false;
    }
  };

  // Handle delete section
  const handleDeleteSection = async () => {
    // Prevent duplicate API calls
    if (isDeletingSectionRef.current) {
      console.log("Already deleting section, skipping duplicate call");
      return false; // Return false to prevent modal from closing
    }

    if (!sectionToDelete || !sectionToDelete.id) {
      showError(
        t("missingSectionId", {
          defaultValue: "Missing section ID. Please refresh the page.",
        })
      );
      return false; // Return false to prevent modal from closing
    }

    try {
      isDeletingSectionRef.current = true;
      setIsDeletingSection(true);

      // Call API to delete section
      await deleteBuilderInvoiceSection(sectionToDelete.id);

      // Show success toast
      showSuccess(
        t("sectionDeleted", {
          defaultValue: "Section deleted successfully",
        })
      );

      // Refetch sections to get updated list from API
      await fetchBuilderInvoiceSections();

      // Clear section to delete
      setSectionToDelete(null);
      setIsDeleteSectionModalOpen(false);

      // Return true to indicate success
      return true;
    } catch (error) {
      console.error("Error deleting section:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToDeleteSection", {
          defaultValue: "Failed to delete section",
        });
      showError(errorMessage);
      return false; // Return false to prevent modal from closing
    } finally {
      setIsDeletingSection(false);
      isDeletingSectionRef.current = false;
    }
  };

  // Handle section click - navigate to section detail
  const handleSectionClick = (section) => {
    navigate(
      `/finance/projects/${projectId}/builder-invoices/sections/${section.id}`,
      {
        state: { 
          sectionName: section.name,
          projectName,
          fromProjects,
          fromDashboard,
          projectId
        },
      }
    );
  };

  // Filter sections based on search
  const filteredSections = sections.filter((section) =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dropdown menu items for section actions
  const getSectionMenuItems = (section) => [
    {
      label: t("editSection", { defaultValue: "Edit Section" }),
      onClick: () => {
        setSectionToEdit(section);
        setIsEditSectionModalOpen(true);
      },
      icon: <img src={pencilIcon} alt="Edit" className="w-4 h-4" />,
    },
    {
      label: t("delete", { defaultValue: "Delete" }),
      onClick: () => {
        setSectionToDelete(section);
        setIsDeleteSectionModalOpen(true);
      },
      icon: <img src={trashIcon} alt="Delete" className="w-4 h-4" />,
      textColor: "text-accent",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t("builderInvoices", { defaultValue: "Builder Invoices" })}
        onBack={() =>
          navigate(getRoute(ROUTES_FLAT.FINANCE_PROJECT_DETAILS, { projectId }), {
            state: { projectName, fromProjects, fromDashboard, projectId }
          })
        }
      >
        <div className="flex flex-row gap-2 lg:gap-3 w-full lg:w-auto items-center">
          {/* Search Bar */}
          <SearchBar
            placeholder={t("searchInvoices", {
              defaultValue: "Search invoices",
            })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 lg:w-[240px] lg:flex-none"
          />

          {/* Create Section Button */}
          <Button
            onClick={() => setIsCreateSectionModalOpen(true)}
            className="flex items-center gap-2 whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-5 h-5 text-accent bg-white rounded-full p-1 font-bold" />
            {t("createSection", { defaultValue: "Create Section" })}
          </Button>
        </div>
      </PageHeader>

      {/* Budget Card */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-50">
        <div className="flex items-center justify-between gap-4 cursor-pointer">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 ">
              <img src={builderIcon} alt="Builder" className="w-12 h-12" />
            </div>
            <div className="min-w-0 flex-1">
              {isLoadingBudget ? (
                <p className="text-lg font-medium text-primary truncate">
                  {t("loading", { defaultValue: "Loading..." })}
                </p>
              ) : (
                <p className="text-lg font-medium text-primary truncate">
                  {budget}
                </p>
              )}
              <p className="text-sm text-secondary">
                {t("totalEstBudget", { defaultValue: "Total Est. Budget" })}
              </p>
            </div>
          </div>
          <button onClick={() => setIsUpdateBudgetModalOpen(true)}>
            <img
              src={blackPencilIcon}
              alt="Edit"
              className="w-6 h-6 cursor-pointer"
            />
          </button>
        </div>
      </div>

      {/* Project Sections */}
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-primary">
          {t("projectSections", { defaultValue: "Project Sections" })}
        </h2>
      </div>

      {/* Loading State */}
      {isLoadingSections ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-secondary">{t("loading", { defaultValue: "Loading..." })}</p>
        </div>
      ) : (
        <>
          {/* Sections List or Empty State */}
          {filteredSections.length > 0 ? (
            <div className="space-y-3">
              {filteredSections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-xl shadow-sm p-4 cursor-pointer border border-gray-50"
                  onClick={() => handleSectionClick(section)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-primary">
                      {section.name}
                    </span>
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ChevronRight className="w-5 h-5 text-secondary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-full max-w-[430px] mb-6">
                <img src={emptyStateIcon} alt="Empty State" className="w-full" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-primary mb-2">
                {t("noSectionsCreated", { defaultValue: "No Sections Created" })}
              </h3>
              <p className="text-md sm:text-base text-secondary text-center mb-6 max-w-md">
                {t("createProjectSections", {
                  defaultValue:
                    "Create your Project Sections to manage finances more efficiently.",
                })}
              </p>
              <Button
                onClick={() => setIsCreateSectionModalOpen(true)}
                className="flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                  <Plus className="w-3 h-3 text-accent " strokeWidth={3} />
                </div>
                {t("createSection", { defaultValue: "Create Section" })}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateSectionModal
        isOpen={isCreateSectionModalOpen}
        onClose={() => setIsCreateSectionModalOpen(false)}
        onCreate={handleCreateSection}
        isLoading={isCreatingSection}
      />

      <UpdateBudgetModal
        isOpen={isUpdateBudgetModalOpen}
        onClose={() => setIsUpdateBudgetModalOpen(false)}
        onUpdate={handleUpdateBudget}
        currentBudget={budget}
        isLoading={isUpdatingBudget}
      />

      <EditSectionModal
        isOpen={isEditSectionModalOpen}
        onClose={() => {
          setIsEditSectionModalOpen(false);
          setSectionToEdit(null);
        }}
        onSave={handleEditSection}
        currentSectionName={sectionToEdit?.name || ""}
        isLoading={isUpdatingSection}
      />

      <ConfirmModal
        isOpen={isDeleteSectionModalOpen}
        onClose={() => {
          setIsDeleteSectionModalOpen(false);
          setSectionToDelete(null);
        }}
        onConfirm={handleDeleteSection}
        title={t("deleteSection", { defaultValue: "Delete Section" })}
        message={t("deleteSectionConfirm", {
          defaultValue:
            "Are you sure you want to delete this section? This action cannot be undone.",
        })}
        confirmText={t("delete", { defaultValue: "Delete" })}
        cancelText={t("cancel", { defaultValue: "Cancel" })}
        confirmVariant="danger"
        isLoading={isDeletingSection}
      />
    </div>
  );
}
