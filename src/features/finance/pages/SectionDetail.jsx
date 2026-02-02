/**
 * Section Detail Page
 * Shows invoices for a specific project section
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES_FLAT, getRoute } from "../../../constants/routes";
import { useExpenseSections } from "../hooks/useExpenseSections";
import { getBuilderInvoiceSectionInvoices, createBuilderInvoice, updateBuilderInvoice, getProjectEstimatedBudget, updateProjectEstimatedBudget, updateBuilderInvoiceSection, deleteBuilderInvoiceSection, deleteBuilderInvoice } from "../api/financeApi";
import { showSuccess, showError } from "../../../utils/toast";
import { useAuth } from "../../../features/auth/store";
import PageHeader from "../../../components/layout/PageHeader";
import Button from "../../../components/ui/Button";
import SearchBar from "../../../components/ui/SearchBar";
import DropdownMenu from "../../../components/ui/DropdownMenu";
import CreateInvoiceModal from "../../../components/ui/CreateInvoiceModal";
import EditInvoiceModal from "../../../components/ui/EditInvoiceModal";
import UpdateBudgetModal from "../../../components/ui/UpdateBudgetModal";
import EditSectionModal from "../../../components/ui/EditSectionModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import StatusBadge from "../../../components/ui/StatusBadge";
import builderIcon from "../../../assets/icons/buider.svg";
import blackPencilIcon from "../../../assets/icons/Blackpencil.svg";
import emptyStateIcon from "../../../assets/icons/EmptyState.svg";
import pdfIcon from "../../../assets/icons/Pdf.svg";
import downloadIcon from "../../../assets/icons/DownloadMinimalistic.svg";
import pencilIcon from "../../../assets/icons/Pen.svg";
import trashIcon from "../../../assets/icons/Trash.svg";
import { Plus } from "lucide-react";

export default function SectionDetail() {
  const { t } = useTranslation("finance");
  const navigate = useNavigate();
  const { projectId, sectionId } = useParams();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();

  // Use API hook for expense sections
  const { sections, isUpdating, isDeleting, updateSection, deleteSection } = useExpenseSections(projectId);

  // Get section name from API or navigation state or default
  const section = sections.find((s) => s.id === sectionId || s.id?.toString() === sectionId);
  
  const state = location.state || {};
  const projectName = state.projectName || "";
  const fromProjects = !!state.fromProjects;
  const fromDashboard = !!state.fromDashboard;

  const sectionName = section?.name || state.sectionName || "Section";

  // Sync section name when it becomes available from API
  useEffect(() => {
    if (section?.name) {
      setCurrentSectionName(section.name);
    }
  }, [section?.name]);

  // State management
  const [budget, setBudget] = useState("1.2 Cr");
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSectionName, setCurrentSectionName] = useState(sectionName);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] =
    useState(false);
  const [isEditInvoiceModalOpen, setIsEditInvoiceModalOpen] = useState(false);
  const [isUpdateBudgetModalOpen, setIsUpdateBudgetModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] =
    useState(false);
  const [isDeleteInvoiceModalOpen, setIsDeleteInvoiceModalOpen] =
    useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isUpdatingInvoice, setIsUpdatingInvoice] = useState(false);
  const [isLoadingBudget, setIsLoadingBudget] = useState(false);
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);
  const [isUpdatingSection, setIsUpdatingSection] = useState(false);
  const [isDeletingSection, setIsDeletingSection] = useState(false);
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
  const isFetchingInvoicesRef = useRef(false);
  const isCreatingInvoiceRef = useRef(false);
  const isUpdatingInvoiceRef = useRef(false);
  const isFetchingBudgetRef = useRef(false);
  const isUpdatingBudgetRef = useRef(false);
  const isUpdatingSectionRef = useRef(false);
  const isDeletingSectionRef = useRef(false);
  const isDeletingInvoiceRef = useRef(false);

  // Fetch invoices for the section from API
  const fetchSectionInvoices = async () => {
    // Prevent duplicate API calls
    if (isFetchingInvoicesRef.current) {
      console.log("Already fetching section invoices, skipping duplicate call");
      return;
    }

    if (!sectionId) {
      console.warn("Section ID is missing, cannot fetch invoices");
      return;
    }

    try {
      isFetchingInvoicesRef.current = true;
      setIsLoadingInvoices(true);

      const response = await getBuilderInvoiceSectionInvoices(sectionId);

      // Handle different response structures
      let invoicesData = response?.data || response?.invoices || response || [];

      // If data is an object with nested array, extract it
      if (invoicesData && typeof invoicesData === 'object' && !Array.isArray(invoicesData)) {
        invoicesData = invoicesData.data || invoicesData.invoices || [];
      }

      const invoicesList = Array.isArray(invoicesData) ? invoicesData : [];

      // Transform API response to match component structure
      const transformedInvoices = invoicesList.map((invoice) => {
        // Get percentage - handle both string and number
        const percentageValue = invoice.percentage || invoice.percent || invoice.estBudget || invoice.est_budget;
        const percentage = percentageValue !== undefined && percentageValue !== null ? String(percentageValue) : '0';

        // Get document/image - handle multiple possible formats
        // Priority: media array (from API) > document fields > files array
        let document = null;

        // First check for media array (from API response) - this is the primary source
        if (invoice.media && Array.isArray(invoice.media) && invoice.media.length > 0) {
          // Get the latest media item's URL (sort by id descending to get newest first)
          const sortedMedia = [...invoice.media].sort((a, b) => {
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idB - idA; // Descending order (newest first)
          });
          const latestMedia = sortedMedia[0];
          document = latestMedia.mediaUrl || latestMedia.url || latestMedia.path || latestMedia;
          console.log('Extracted document from media array:', document, 'from', sortedMedia.length, 'media items');
        } else if (invoice.document) {
          document = invoice.document;
        } else if (invoice.document_url) {
          document = invoice.document_url;
        } else if (invoice.file) {
          document = invoice.file;
        } else if (invoice.image) {
          document = invoice.image;
        } else if (invoice.image_url) {
          document = invoice.image_url;
        } else if (invoice.files && Array.isArray(invoice.files) && invoice.files.length > 0) {
          // If files is an array, get the first file URL
          const firstFile = invoice.files[0];
          document = typeof firstFile === 'string' ? firstFile : (firstFile.url || firstFile.path || firstFile.file_url || firstFile.document_url || firstFile.mediaUrl);
        } else if (invoice.file_url) {
          document = invoice.file_url;
        }

        return {
          id: invoice.id || invoice.invoice_id || invoice.builder_invoice_id || Date.now().toString(),
          milestoneTitle: invoice.milestoneTitle || invoice.milestone_title || invoice.title || invoice.name || 'Untitled Invoice',
          percentage: percentage,
          amount: invoice.amount || invoice.total_amount || '0',
          // Map status from API to UI format
          // Backend returns "Completed" but UI uses "paid", so map "Completed" to "paid" for display
          status: (() => {
            const apiStatus = (invoice.status || 'pending').toLowerCase();
            // Map "completed" from API to "paid" for UI (since UI shows "Paid" option)
            return apiStatus === 'completed' ? 'paid' : apiStatus;
          })(),
          description: invoice.description || invoice.desc || '',
          document: document,
        };
      });

      // Debug: Log transformed invoices
      console.log('Transformed invoices:', transformedInvoices.map(inv => ({
        id: inv.id,
        title: inv.milestoneTitle,
        document: inv.document,
        hasDocument: !!inv.document
      })));

      setInvoices(transformedInvoices);

      // Only show success toast if invoices were loaded
      if (transformedInvoices.length > 0) {
        showSuccess(
          t("invoicesLoaded", {
            defaultValue: "Invoices loaded successfully",
          })
        );
      }
    } catch (error) {
      // Handle 404 errors silently (endpoint might not be available yet)
      if (error?.response?.status === 404) {
        setInvoices([]);
        return; // Exit early, don't show any error or log
      }

      // Log and show error toast for other errors only
      console.error("Error fetching section invoices:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToLoadInvoices", {
          defaultValue: "Failed to load invoices",
        });
      showError(errorMessage);
      setInvoices([]);
    } finally {
      setIsLoadingInvoices(false);
      isFetchingInvoicesRef.current = false;
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
      console.log("Raw estimated budget from API:", response);

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
        console.log("Budget set to:", formattedBudget);
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

  // Fetch invoices and budget on component mount
  useEffect(() => {
    fetchSectionInvoices().catch(() => {
      // Silently handle errors - endpoint may not be available yet
    });
    fetchEstimatedBudget().catch(() => {
      // Silently handle errors - endpoint may not be available yet
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, projectId]);

  // Handle create invoice
  const handleCreateInvoice = async (invoiceData) => {
    // Prevent duplicate API calls
    if (isCreatingInvoiceRef.current) {
      console.log("Already creating invoice, skipping duplicate call");
      return false; // Return false to prevent modal from closing
    }

    if (!selectedWorkspace || !projectId || !sectionId) {
      showError(
        t("missingRequiredFields", {
          defaultValue: "Missing required fields. Please refresh the page.",
        })
      );
      return false; // Return false to prevent modal from closing
    }

    try {
      isCreatingInvoiceRef.current = true;
      setIsCreatingInvoice(true);

      // Map status from modal format to API format
      const statusMap = {
        'pending': 'Pending',
        'completed': 'Completed',
      };
      const apiStatus = statusMap[invoiceData.status?.toLowerCase()] || invoiceData.status || 'Pending';

      // Prepare API data - ensure proper data types
      const apiData = {
        title: invoiceData.milestoneTitle,
        estBudget: invoiceData.percentage, // Will be converted to number in API function
        amount: invoiceData.amount, // Will be converted to number in API function (currency formatting removed there)
        status: apiStatus,
        description: invoiceData.description || '',
        files: invoiceData.files || [],
        builderInvoicesSection_id: sectionId,
        workspace_id: selectedWorkspace,
        project_id: projectId,
      };

      // Debug: Log files being sent
      console.log('Creating invoice with data:', {
        ...apiData,
        files: apiData.files.map(f => f instanceof File ? { name: f.name, size: f.size, type: f.type } : f)
      });

      // Call API
      await createBuilderInvoice(apiData);

      // Show success toast
      showSuccess(
        t("invoiceCreated", {
          defaultValue: "Invoice created successfully",
        })
      );

      // Refetch invoices to get updated list from API
      await fetchSectionInvoices();

      // Return true to allow modal to close
      return true;
    } catch (error) {
      console.error("Error creating builder invoice:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToCreateInvoice", {
          defaultValue: "Failed to create invoice",
        });
      showError(errorMessage);
      return false; // Return false to prevent modal from closing on error
    } finally {
      setIsCreatingInvoice(false);
      isCreatingInvoiceRef.current = false;
    }
  };

  // Handle edit invoice
  const handleEditInvoice = async (updatedInvoiceData) => {
    // Prevent duplicate API calls
    if (isUpdatingInvoiceRef.current) {
      console.log("Already updating invoice, skipping duplicate call");
      return false; // Return false to prevent modal from closing
    }

    if (!selectedWorkspace || !projectId || !sectionId || !updatedInvoiceData.id) {
      showError(
        t("missingRequiredFields", {
          defaultValue: "Missing required fields. Please refresh the page.",
        })
      );
      return false; // Return false to prevent modal from closing
    }

    try {
      isUpdatingInvoiceRef.current = true;
      setIsUpdatingInvoice(true);

      // Map status from modal format to API format
      // Backend uses "Completed" instead of "Paid", so map "paid" to "Completed"
      const statusMap = {
        'pending': 'Pending',
        'completed': 'Completed',
        'paid': 'Completed', // Backend uses "Completed" instead of "Paid"
        'in progress': 'In Progress',
        'in_progress': 'In Progress',
      };
      const apiStatus = statusMap[updatedInvoiceData.status?.toLowerCase()] || updatedInvoiceData.status || 'Pending';

      // Prepare API data - ensure proper data types
      const apiData = {
        title: updatedInvoiceData.milestoneTitle,
        estBudget: updatedInvoiceData.percentage, // Will be converted to number in API function
        amount: updatedInvoiceData.amount, // Will be converted to number in API function (currency formatting removed there)
        status: apiStatus,
        description: updatedInvoiceData.description || '',
        files: updatedInvoiceData.files || [],
        builderInvoicesSection_id: sectionId,
        workspace_id: selectedWorkspace,
        project_id: projectId,
      };

      // Debug: Log files being sent
      console.log('Updating invoice with data:', {
        invoiceId: updatedInvoiceData.id,
        ...apiData,
        files: apiData.files.map(f => f instanceof File ? { name: f.name, size: f.size, type: f.type } : f)
      });

      // Call API
      const updateResponse = await updateBuilderInvoice(updatedInvoiceData.id, apiData);

      // Show success toast
      showSuccess(
        t("invoiceUpdated", {
          defaultValue: "Invoice updated successfully",
        })
      );

      // Small delay to ensure backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refetch invoices to get updated list from API
      await fetchSectionInvoices();

      // Return true to allow modal to close
      return true;
    } catch (error) {
      console.error("Error updating builder invoice:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToUpdateInvoice", {
          defaultValue: "Failed to update invoice",
        });
      showError(errorMessage);
      return false; // Return false to prevent modal from closing on error
    } finally {
      setIsUpdatingInvoice(false);
      isUpdatingInvoiceRef.current = false;
    }
  };

  // Handle delete invoice
  const handleDeleteInvoice = async () => {
    // Prevent duplicate API calls
    if (isDeletingInvoiceRef.current) {
      console.log("Already deleting invoice, skipping duplicate call");
      return false; // Return false to prevent modal from closing
    }

    if (!invoiceToDelete || !invoiceToDelete.id) {
      showError(
        t("missingInvoiceId", {
          defaultValue: "Missing invoice ID. Please refresh the page.",
        })
      );
      return false; // Return false to prevent modal from closing
    }

    try {
      isDeletingInvoiceRef.current = true;
      setIsDeletingInvoice(true);

      // Call API to delete invoice
      await deleteBuilderInvoice(invoiceToDelete.id);

      // Show success toast
      showSuccess(
        t("invoiceDeleted", {
          defaultValue: "Invoice deleted successfully",
        })
      );

      // Refetch invoices to get updated list from API
      await fetchSectionInvoices();

      // Clear invoice to delete
      setInvoiceToDelete(null);
      setIsDeleteInvoiceModalOpen(false);

      // Return true to indicate success
      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToDeleteInvoice", {
          defaultValue: "Failed to delete invoice",
        });
      showError(errorMessage);
      return false; // Return false to prevent modal from closing
    } finally {
      setIsDeletingInvoice(false);
      isDeletingInvoiceRef.current = false;
    }
  };

  // Handle download PDF
  const handleDownloadPDF = (invoice) => {
    // TODO: Implement PDF download functionality
    console.log("Download PDF for invoice:", invoice);
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

  // Format budget for display
  const formatBudget = (budgetStr) => {
    if (budgetStr.includes("Cr") || budgetStr.includes("Lakh")) {
      return budgetStr;
    }
    return budgetStr;
  };

  // Format amount for display
  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount.replace(/,/g, ""));
    if (!isNaN(numAmount)) {
      return `₹${numAmount.toLocaleString("en-IN")}`;
    }
    return amount;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, "");
    switch (normalizedStatus) {
      case "paid":
      case "completed":
        return "green";
      case "pending":
        return "pink";
      case "inprogress":
      case "in_progress":
        return "yellow";
      default:
        return "pink";
    }
  };

  // Format status text for display
  const formatStatusText = (status) => {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, "");
    switch (normalizedStatus) {
      case "paid":
      case "completed":
        return "Paid";
      case "pending":
        return "Pending";
      case "inprogress":
      case "in_progress":
        return "In Progress";
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending";
    }
  };

  // Filter invoices based on search
  const filteredInvoices = (invoices || []).filter((invoice) =>
    invoice.milestoneTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle edit section
  const handleEditSection = async (newSectionName) => {
    // Prevent duplicate API calls
    if (isUpdatingSectionRef.current) {
      console.log("Already updating section, skipping duplicate call");
      return false; // Return false to prevent modal from closing
    }

    if (!sectionId) {
      showError(
        t("missingSectionId", {
          defaultValue: "Missing section ID. Please refresh the page.",
        })
      );
      return false; // Return false to prevent modal from closing
    }

    if (!newSectionName || !newSectionName.trim()) {
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

      // Call API to update builder invoice section (not expense section)
      await updateBuilderInvoiceSection(sectionId, {
        name: newSectionName.trim(),
      });

      // Show success toast
      showSuccess(
        t("sectionUpdated", {
          defaultValue: "Section updated successfully",
        })
      );

      // Update local section name
      setCurrentSectionName(newSectionName.trim());

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

    if (!sectionId) {
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

      // Call API to delete builder invoice section (not expense section)
      await deleteBuilderInvoiceSection(sectionId);

      // Show success toast
      showSuccess(
        t("sectionDeleted", {
          defaultValue: "Section deleted successfully",
        })
      );

      // Navigate back to Builder Invoices page
      navigate(getRoute(ROUTES_FLAT.FINANCE_BUILDER_INVOICES, { projectId }));

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

  // Dropdown menu items for header
  const headerMenuItems = [
    {
      label: t("editSection", { defaultValue: "Edit Section" }),
      onClick: () => {
        setIsEditSectionModalOpen(true);
      },
      icon: <img src={pencilIcon} alt="Edit" className="w-4 h-4" />,
    },
    {
      label: t("delete", { defaultValue: "Delete" }),
      onClick: () => {
        setIsDeleteSectionModalOpen(true);
      },
      icon: <img src={trashIcon} alt="Delete" className="w-4 h-4" />,
      textColor: "text-accent",
    },
  ];
  const hasInvoices = (invoices || []).length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={currentSectionName}
        onBack={() =>
          navigate(
            getRoute(ROUTES_FLAT.FINANCE_BUILDER_INVOICES, { projectId }),
            { state: { projectName, fromProjects, fromDashboard, projectId } }
          )
        }
      >
        <div
          className="
      flex flex-col gap-2
      sm:flex-row sm:items-center sm:gap-3
      w-full md:w-auto
    "
        >
          {/* ✅ Search bar – full width on mobile */}
          <SearchBar
            placeholder={t("searchInvoices", {
              defaultValue: "Search invoices",
            })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[260px]"
          />

          {/* Right side actions */}
          <div className="flex items-center gap-2 justify-between sm:justify-start">
            {/* ❗ Create Invoice – only when invoices exist */}
            {hasInvoices && (
              <Button
                onClick={() => setIsCreateInvoiceModalOpen(true)}
                className="
            flex items-center gap-2
            w-full sm:w-auto
            justify-center
          "
              >
                <Plus className="w-4 h-4 bg-white rounded-full text-accent" />
                {t("createInvoice", { defaultValue: "Create Invoice" })}
              </Button>
            )}

            {/* ✅ 3 dots – always visible */}
            <DropdownMenu items={headerMenuItems} position="right" />
          </div>
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

      {/* Project Invoices */}
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-primary">
          {t("projectInvoices", { defaultValue: "Project Invoices" })}
        </h2>
      </div>

      {/* Loading State */}
      {isLoadingInvoices ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-secondary">{t("loading", { defaultValue: "Loading..." })}</p>
        </div>
      ) : (
        <>
          {/* Invoices List or Empty State */}
          {filteredInvoices.length > 0 ? (
            <div className="space-y-3">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-white rounded-2xl p-4 border border-gray-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Status badge */}
                      <div className="inline-flex mb-2">
                        <StatusBadge
                          text={formatStatusText(invoice.status)}
                          color={getStatusColor(invoice.status)}
                          className="w-auto px-3 py-1 text-sm font-normal"
                        />
                      </div>

                      <h3 className="text-base font-medium text-primary mb-2">
                        {invoice.milestoneTitle}
                      </h3>

                      <div className="flex items-center text-sm text-secondary mt-1">
                        <span>
                          {t("percentage", { defaultValue: "Percentage" })}:{" "}
                          <span className="font-medium text-primary">
                            {invoice.percentage}%
                          </span>
                        </span>

                        <span className="mx-3 h-4 w-px bg-gray-300" />

                        <span>
                          {t("amount", { defaultValue: "Amount" })}:{" "}
                          <span className="font-medium text-primary">
                            {formatAmount(invoice.amount)}
                          </span>
                        </span>
                      </div>

                      {(invoice.description || invoice.document) && (
                        <div className="mt-3 border-t border-gray-200 pt-3 flex flex-col gap-3">
                          {invoice.description && (
                            <p className="text-sm text-secondary leading-relaxed">
                              <span className="font-medium text-primary">
                                {t("description", { defaultValue: "Description" })} :{" "}
                              </span>
                              {invoice.description}
                            </p>
                          )}

                          {invoice.document && (
                            <div className="flex items-center gap-2">
                              {(() => {
                                const docValue = invoice.document;
                                const isUrl = typeof docValue === 'string' && (
                                  docValue.startsWith('http') ||
                                  docValue.startsWith('https') ||
                                  docValue.startsWith('/') ||
                                  docValue.startsWith('data:')
                                );

                                if (isUrl) {
                                  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|jpeg)$/i.test(docValue) ||
                                    docValue.startsWith('data:image') ||
                                    docValue.toLowerCase().includes('avatar') ||
                                    docValue.toLowerCase().includes('image');

                                  const isPdf = /\.pdf$/i.test(docValue);

                                  const getFileName = (url) => {
                                    try {
                                      const urlParts = url.split('/');
                                      const fileName = urlParts[urlParts.length - 1];
                                      return fileName.split('?')[0];
                                    } catch {
                                      return 'Document';
                                    }
                                  };
                                  const fileName = getFileName(docValue);

                                  if (isImage) {
                                    return (
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="relative cursor-pointer group"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(docValue, '_blank');
                                          }}
                                        >
                                          <img
                                            src={docValue}
                                            alt={fileName}
                                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              const fallback = e.target.parentElement.parentElement.querySelector('.fallback-icon');
                                              if (fallback) fallback.style.display = 'flex';
                                            }}
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
                                        </div>
                                        <div className="fallback-icon hidden items-center gap-2">
                                          <img src={pdfIcon} alt="PDF" className="w-5 h-5" />
                                          <span className="text-sm text-secondary">{fileName}</span>
                                        </div>
                                      </div>
                                    );
                                  } else if (isPdf) {
                                    return (
                                      <div className="flex items-center gap-2">
                                        <img src={pdfIcon} alt="PDF" className="w-5 h-5" />
                                        <a
                                          href={docValue}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-black hover:text-accent truncate max-w-[200px] cursor-pointer"
                                          title={docValue}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(docValue, '_blank');
                                          }}
                                        >
                                          {fileName}
                                        </a>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div className="flex items-center gap-2">
                                        <div className="p-1 px-2 bg-gray-100 rounded text-[10px] text-secondary font-bold uppercase">
                                          FILE
                                        </div>
                                        <a
                                          href={docValue}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-black hover:text-accent truncate max-w-[200px] cursor-pointer"
                                          title={docValue}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(docValue, '_blank');
                                          }}
                                        >
                                          {fileName}
                                        </a>
                                      </div>
                                    );
                                  }
                                } else {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <img src={pdfIcon} alt="PDF" className="w-5 h-5" />
                                      <span className="text-sm text-secondary">{docValue}</span>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu
                        items={[
                          {
                            label: t("editMilestone", {
                              defaultValue: "Edit Milestone",
                            }),
                            onClick: () => {
                              setInvoiceToEdit(invoice);
                              setIsEditInvoiceModalOpen(true);
                            },
                            icon: (
                              <img
                                src={pencilIcon}
                                alt="Edit"
                                className="w-4 h-4"
                              />
                            ),
                          },
                          {
                            label: t("downloadAsPDF", {
                              defaultValue: "Download as PDF",
                            }),
                            onClick: () => {
                              handleDownloadPDF(invoice);
                            },
                            icon: (
                              <img
                                src={downloadIcon}
                                alt="Download"
                                className="w-4 h-4"
                              />
                            ),
                          },
                          {
                            label: t("deleteMilestone", {
                              defaultValue: "Delete Milestone",
                            }),
                            onClick: () => {
                              setInvoiceToDelete(invoice);
                              setIsDeleteInvoiceModalOpen(true);
                            },
                            icon: (
                              <img
                                src={trashIcon}
                                alt="Delete"
                                className="w-4 h-4"
                              />
                            ),
                            textColor: "text-accent",
                          },
                        ]}
                        position="right"
                      />
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
                {t("noInvoiceAdded", { defaultValue: "No Invoice Added" })}
              </h3>
              <p className="text-md sm:text-base text-secondary text-center mb-6 max-w-md">
                {t("createProjectInvoice", {
                  defaultValue: "Create your project's invoice for easy billing.",
                })}
              </p>
              <Button
                onClick={() => setIsCreateInvoiceModalOpen(true)}
                className="flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                  <Plus className="w-3 h-3 text-accent " strokeWidth={3} />
                </div>
                {t("createInvoice", { defaultValue: "Create Invoice" })}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceModalOpen}
        onClose={() => setIsCreateInvoiceModalOpen(false)}
        onCreate={handleCreateInvoice}
        isLoading={isCreatingInvoice}
      />

      <EditInvoiceModal
        isOpen={isEditInvoiceModalOpen}
        onClose={() => {
          setIsEditInvoiceModalOpen(false);
          setInvoiceToEdit(null);
        }}
        onUpdate={handleEditInvoice}
        invoice={invoiceToEdit}
        isLoading={isUpdatingInvoice}
      />

      <ConfirmModal
        isOpen={isDeleteInvoiceModalOpen}
        onClose={() => {
          setIsDeleteInvoiceModalOpen(false);
          setInvoiceToDelete(null);
        }}
        onConfirm={handleDeleteInvoice}
        title={t("deleteMilestone", { defaultValue: "Delete Milestone?" })}
        message={t("deleteMilestoneConfirm", {
          defaultValue:
            "Are you sure you want to remove this milestone materials and deliveries from this project? This action is irreversible, and your data cannot be recovered.",
        })}
        confirmText={t("yesDelete", { defaultValue: "Yes, Delete" })}
        cancelText={t("cancel", { defaultValue: "Cancel" })}
        confirmVariant="danger"
        isLoading={isDeletingInvoice}
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
        onClose={() => setIsEditSectionModalOpen(false)}
        onSave={handleEditSection}
        currentSectionName={currentSectionName}
        isLoading={isUpdatingSection}
      />

      <ConfirmModal
        isOpen={isDeleteSectionModalOpen}
        onClose={() => setIsDeleteSectionModalOpen(false)}
        onConfirm={handleDeleteSection}
        isLoading={isDeletingSection}
        title={t("deleteSection", { defaultValue: "Delete Section" })}
        message={t("deleteSectionConfirm", {
          defaultValue:
            "Are you sure you want to delete this section? This action cannot be undone.",
        })}
        confirmText={t("delete", { defaultValue: "Delete" })}
        cancelText={t("cancel", { defaultValue: "Cancel" })}
        confirmVariant="danger"
      />
    </div >
  );
}
