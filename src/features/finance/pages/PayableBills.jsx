/**
 * Payable Bills Page
 * Shows payable bills for a specific section
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES_FLAT, getRoute } from "../../../constants/routes";
import PageHeader from "../../../components/layout/PageHeader";
import SearchBar from "../../../components/ui/SearchBar";
import Button from "../../../components/ui/Button";
import DropdownMenu from "../../../components/ui/DropdownMenu";
import Dropdown from "../../../components/ui/Dropdown";
import CreatePayableBillModal from "../../../components/ui/CreatePayableBillModal";
import EditPayableBillModal from "../../../components/ui/EditPayableBillModal";
import FilterPayableBillsModal from "../../../components/ui/FilterPayableBillsModal";
import CustomDateRangeModal from "../../../components/ui/CustomDateRangeModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import EditSectionModal from "../../../components/ui/EditSectionModal";
import StatusBadge from "../../../components/ui/StatusBadge";
import { useExpenseSections } from "../hooks/useExpenseSections";
import { getPayableBills, createPayableBill, updatePayableBill, deletePayableBill } from "../api/financeApi";
import { getVendorsList, createVendor } from "../../siteInventory/api/siteInventoryApi";
import { useAuth } from "../../auth/store";
import { showSuccess, showError } from "../../../utils/toast";
import totalPayablesIcon from "../../../assets/icons/pendingg.svg";
import paidAmountIcon from "../../../assets/icons/paidred.svg";
import pendingAmountIcon from "../../../assets/icons/Pendingred.svg";
import downloadIcon from "../../../assets/icons/DownloadMinimalistic.svg";
import sortVerticalIcon from "../../../assets/icons/Sort Vertical.svg";
import pdfIcon from "../../../assets/icons/DownloadMinimalistic.svg";
import pencilIcon from "../../../assets/icons/Pen.svg";
import trashIcon from "../../../assets/icons/Trash.svg";
import emptyStateIcon from "../../../assets/icons/EmptyState.svg";
import { Plus, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";

export default function PayableBills() {
  const { t } = useTranslation("finance");
  const navigate = useNavigate();
  const { projectId, sectionId } = useParams();
  const location = useLocation();
  const { selectedWorkspace, user } = useAuth();

  const state = location.state || {};
  const projectName = state.projectName || "";
  const fromProjects = !!state.fromProjects;
  const fromDashboard = !!state.fromDashboard;

  const [sectionName, setSectionName] = useState(state.sectionName || "Section");

  // Use API hook for expense sections
  const { sections, isUpdating, isDeleting, updateSection, deleteSection } = useExpenseSections(projectId);

  // Sync section name when it becomes available from API
  useEffect(() => {
    const section = sections?.find((s) => s.id === sectionId || s.id?.toString() === sectionId);
    if (section?.name) {
      setSectionName(section.name);
    }
  }, [sections, sectionId]);

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);
  const [vendors, setVendors] = useState([]); // Will store {value: id, label: name} format
  const [filters, setFilters] = useState({});
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef(null);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  const [isCreatingBill, setIsCreatingBill] = useState(false);
  const [isUpdatingBill, setIsUpdatingBill] = useState(false);
  const isFetchingBillsRef = useRef(false);
  const isLoadingVendorsRef = useRef(false);
  const isUpdatingBillRef = useRef(false);

  // Payable bills data from API
  const [payableBills, setPayableBills] = useState([]);

  // Calculate summary data from payable bills
  const calculateSummary = () => {
    let totalPayables = 0;
    let paidAmount = 0;
    let pendingAmount = 0;

    payableBills.forEach((bill) => {
      // Extract numeric value from amount string (e.g., "₹3,00,000" -> 300000)
      const amountStr = bill.amount?.toString().replace(/[₹,]/g, "") || "0";
      const amount = parseFloat(amountStr) || 0;
      totalPayables += amount;

      if (bill.status?.toLowerCase() === "paid") {
        paidAmount += amount;
      } else {
        pendingAmount += amount;
      }
    });

    return {
      totalPayables: `₹${totalPayables.toLocaleString("en-IN")}`,
      paidAmount: `₹${paidAmount.toLocaleString("en-IN")}`,
      pendingAmount: `₹${pendingAmount.toLocaleString("en-IN")}`,
    };
  };

  const summary = calculateSummary();
  const summaryData = [
    {
      icon: totalPayablesIcon,
      label: t("totalPayables", { defaultValue: "Total Payables" }),
      amount: summary.totalPayables,
    },
    {
      icon: paidAmountIcon,
      label: t("paidAmount", { defaultValue: "Paid Amount" }),
      amount: summary.paidAmount,
    },
    {
      icon: pendingAmountIcon,
      label: t("pendingAmount", { defaultValue: "Pending Amount" }),
      amount: summary.pendingAmount,
    },
  ];

  // Transform API response to component format
  const transformBillData = (apiBill) => {
    // Format date
    const formatDate = (dateString) => {
      if (!dateString) {
        console.log('formatDate: dateString is empty/null');
        return "";
      }
      
      try {
        // Handle different date formats
        let date;
        if (typeof dateString === 'string') {
          // Handle YYYY-MM-DD format (most common from API)
          const yyyyMMddMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (yyyyMMddMatch) {
            const [, year, month, day] = yyyyMMddMatch;
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            console.log('formatDate: Parsed YYYY-MM-DD:', { dateString, year, month, day, date });
          } else {
            // Try parsing as-is
            date = new Date(dateString);
            // If invalid, try DD/MM/YYYY format
            if (isNaN(date.getTime())) {
              const parts2 = dateString.split('/');
              if (parts2.length === 3) {
                date = new Date(parseInt(parts2[2]), parseInt(parts2[1]) - 1, parseInt(parts2[0]));
              }
            }
          }
        } else {
          date = new Date(dateString);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn('formatDate: Invalid date:', dateString);
          return "";
        }
        
        const formatted = date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        console.log('formatDate: Formatted result:', { dateString, formatted });
        return formatted;
      } catch (e) {
        console.error('formatDate: Error formatting date:', dateString, e);
        return "";
      }
    };

    // Format amount
    const formatAmount = (amount) => {
      if (!amount) return "₹0";
      const numAmount = typeof amount === "string" ? parseFloat(amount.replace(/[₹,]/g, "")) : amount;
      return `₹${numAmount.toLocaleString("en-IN")}`;
    };

    // Get vendor name from vendors list using vendor ID
    const getVendorName = (vendorId) => {
      if (!vendorId) return "";
      
      // First, check if API response has paidToName (from backend)
      // This is the most reliable source as it comes directly from the API
      if (apiBill.paidToName) {
        return String(apiBill.paidToName);
      }
      
      // Try to find vendor in vendors list by ID
      const vendor = vendors.find((v) => String(v.value) === String(vendorId));
      if (vendor) {
        return vendor.label;
      }
      
      // Fallback to other API response fields
      return (
        apiBill.paidTo_name ||
        apiBill.vendor_name ||
        apiBill.vendorName ||
        apiBill.vendor ||
        ""
      );
    };

    // Get vendor ID from API response
    const vendorId = apiBill.paidTo || apiBill.paid_to || apiBill.vendor_id || apiBill.vendorId;

    // Get due date from API response - try multiple field names (API returns DueDate with capital D)
    const dueDateValue = apiBill.DueDate ||      // PascalCase (from API response) - PRIMARY
                        apiBill.due_date ||       // snake_case
                        apiBill.dueDate ||        // camelCase
                        apiBill.Due_Date ||       // PascalCase with underscore
                        apiBill.due_Date ||       // mixed case
                        null;

    // Format the due date
    const formattedDueDate = formatDate(dueDateValue);

    // Debug: Log to see what's happening with due date
    console.log('Bill transformation:', {
      id: apiBill.id,
      DueDate: apiBill.DueDate,
      dueDateValue: dueDateValue,
      formattedDueDate: formattedDueDate,
      allKeys: Object.keys(apiBill)
    });

    return {
      id: apiBill.id?.toString() || apiBill.bill_id?.toString() || Date.now().toString(),
      billNo: apiBill.bill_no || apiBill.billNo || apiBill.bill_number || `PYBL-${apiBill.id || ""}`,
      title: apiBill.title || apiBill.description || apiBill.name || "",
      vendorName: getVendorName(vendorId),
      vendorId: vendorId, // Store vendor ID for reference
      amount: formatAmount(apiBill.amount),
      dueDate: formattedDueDate,
      date: formatDate(apiBill.date || apiBill.created_at || apiBill.created_date),
      status: (apiBill.status || "pending").toLowerCase(),
      description: apiBill.description || apiBill.defineScript || apiBill.title || "",
    };
  };

  // Fetch payable bills from API
  const fetchPayableBills = async (statusFilter = null) => {
    if (!projectId || !selectedWorkspace || !sectionId) {
      console.warn("Missing required parameters for fetching payable bills");
      return;
    }

    // Prevent duplicate API calls
    if (isFetchingBillsRef.current) {
      console.log("Already fetching bills, skipping duplicate call");
      return;
    }

    try {
      isFetchingBillsRef.current = true;
      setIsLoadingBills(true);
      const response = await getPayableBills({
        project_id: projectId,
        workspace_id: selectedWorkspace,
        expenseSection_id: sectionId,
        ...(statusFilter && { status: statusFilter }),
      });

      // Handle different response structures
      // API can return: { data: [...] } or { bills: [...] } or direct array
      let billsData = response?.data || response?.bills || response || [];
      
      // If data is an object with nested array, extract it
      if (billsData && typeof billsData === 'object' && !Array.isArray(billsData)) {
        // Check if it's a single bill object (from create response)
        if (billsData.id || billsData.bill_id) {
          billsData = [billsData];
        } else {
          // Try to find array in nested structure
          billsData = billsData.data || billsData.bills || [];
        }
      }
      
      const billsList = Array.isArray(billsData) ? billsData : [];

      // Transform API response to component format
      // Note: vendors must be loaded before transforming bills to map vendor IDs to names
      const transformedBills = billsList.map(transformBillData);

      setPayableBills(transformedBills);
      showSuccess(
        t("payableBillsLoaded", {
          defaultValue: "Payable bills loaded successfully",
        })
      );
    } catch (error) {
      console.error("Error fetching payable bills:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToLoadPayableBills", {
          defaultValue: "Failed to load payable bills",
        });
      showError(errorMessage);
      setPayableBills([]);
    } finally {
      setIsLoadingBills(false);
      isFetchingBillsRef.current = false;
    }
  };

  // Fetch vendors from API
  const loadVendors = async () => {
    if (!selectedWorkspace) {
      return;
    }

    // Prevent duplicate API calls
    if (isLoadingVendorsRef.current) {
      console.log("Already loading vendors, skipping duplicate call");
      return;
    }

    try {
      isLoadingVendorsRef.current = true;
      const response = await getVendorsList(selectedWorkspace);

      // Handle different response structures
      let vendorsArray = [];

      if (Array.isArray(response?.users)) {
        vendorsArray = response.users;
      } else if (Array.isArray(response?.data?.users)) {
        vendorsArray = response.data.users;
      } else if (Array.isArray(response?.data)) {
        vendorsArray = response.data;
      } else if (Array.isArray(response)) {
        vendorsArray = response;
      }

      // Transform vendors to dropdown options format {value: id, label: name}
      const vendorOptions = vendorsArray.map((vendor) => {
        const vendorId = vendor.id || vendor._id || vendor.vendorId || vendor.userId;
        const vendorName = vendor.full_name || vendor.name || vendor.vendorName || "Unknown Vendor";
        return {
          value: vendorId,
          label: String(vendorName),
        };
      });

      setVendors(vendorOptions);
    } catch (error) {
      console.error("Error loading vendors:", error);
      setVendors([]);
    } finally {
      isLoadingVendorsRef.current = false;
    }
  };

  // Fetch vendors on component mount (must load before bills to map vendor IDs)
  useEffect(() => {
    if (selectedWorkspace) {
      loadVendors();
    }
  }, [selectedWorkspace]);

  // Fetch bills on component mount and when dependencies change
  // Note: Removed vendors from dependencies to prevent duplicate calls
  // Vendor names are updated in transformBillData which uses the vendors state
  useEffect(() => {
    if (projectId && selectedWorkspace && sectionId) {
      // Initial fetch without status filter
      fetchPayableBills(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, selectedWorkspace, sectionId]);

  // Handle edit section
  const handleEditSection = async (newSectionName) => {
    if (!sectionId) {
      showError(t('sectionIdRequired', { defaultValue: 'Section ID is required' }));
      return false;
    }

    const updatedSection = await updateSection(sectionId, newSectionName);
    if (updatedSection) {
      setSectionName(newSectionName);
      showSuccess(t('sectionUpdated', { defaultValue: 'Section updated successfully' }));
      setIsEditSectionModalOpen(false);
      return true;
    } else {
      showError(t('failedToUpdateSection', { defaultValue: 'Failed to update section' }));
      return false;
    }
  };

  // Handle delete section
  const handleDeleteSection = async () => {
    if (!sectionId) {
      showError(t('sectionIdRequired', { defaultValue: 'Section ID is required' }));
      setIsDeleteSectionModalOpen(false);
      return;
    }

    const success = await deleteSection(sectionId);
    if (success) {
      showSuccess(t('sectionDeleted', { defaultValue: 'Section deleted successfully' }));
      setIsDeleteSectionModalOpen(false);
      // Navigate back to expenses to pay page after successful delete
      navigate(
        getRoute(ROUTES_FLAT.FINANCE_EXPENSES_TO_PAY, { projectId }),
        { state: { projectName, fromProjects, fromDashboard, projectId } }
      );
    } else {
      showError(t('failedToDeleteSection', { defaultValue: 'Failed to delete section' }));
      setIsDeleteSectionModalOpen(false);
    }
  };

  // Handle create payable bill
  const handleCreatePayableBill = async (formData) => {
    // Prevent duplicate API calls
    if (isCreatingBill) {
      return;
    }

    if (!projectId || !selectedWorkspace || !sectionId) {
      showError(
        t("missingRequiredFields", {
          defaultValue: "Missing required fields. Please refresh the page.",
        })
      );
      return;
    }

    try {
      setIsCreatingBill(true);

      // Format date to YYYY-MM-DD
      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Get vendor ID from formData.vendorName (which is actually the vendor ID from dropdown)
      // The dropdown stores the value (ID) when a vendor is selected
      const vendorId = formData.vendorName || formData.vendorId || "";

      // Prepare API data
      const apiData = {
        expenseSection_id: sectionId,
        workspace_id: selectedWorkspace,
        project_id: projectId,
        title: formData.title.trim(),
        amount: parseFloat(formData.amount) || 0,
        status: formData.status === "paid" ? "Paid" : "Pending",
        defineScript: formData.description || formData.title || "",
        due_date: formatDate(formData.dueDate),
        method: "Cash", // Default payment method
        paidTo: vendorId, // Vendor ID (bigint)
        paidBy: user?.id || user?.uid || "", // User ID from auth
      };

      // Add paidDate only if status is Paid
      if (formData.status === "paid" || formData.status === "Paid") {
        apiData.paidDate = formatDate(new Date()); // Use current date as paid date
      }

      // Add PaymentProof file if provided
      if (formData.PaymentProof && formData.PaymentProof instanceof File) {
        apiData.PaymentProof = formData.PaymentProof;
      }

      // Call API
      const response = await createPayableBill(apiData);

      // Show success toast
      showSuccess(
        t("payableBillCreated", {
          defaultValue: "Payable bill created successfully",
        })
      );

      // Close modal
      setIsCreateModalOpen(false);

      // Refetch bills from API to get the latest data
      const statusFilter = filters.status || null;
      await fetchPayableBills(statusFilter);
    } catch (error) {
      console.error("Error creating payable bill:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToCreatePayableBill", {
          defaultValue: "Failed to create payable bill",
        });
      showError(errorMessage);
    } finally {
      setIsCreatingBill(false);
    }
  };

  // Handle edit payable bill
  const handleEditPayableBill = async (formData) => {
    if (!selectedBill) return;

    // Prevent duplicate API calls
    if (isUpdatingBill) {
      return;
    }

    if (!projectId || !selectedWorkspace || !sectionId) {
      showError(
        t("missingRequiredFields", {
          defaultValue: "Missing required fields. Please refresh the page.",
        })
      );
      return;
    }

    try {
      setIsUpdatingBill(true);

      // Format date to YYYY-MM-DD
      const formatDateToYYYYMMDD = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Get vendor ID from formData.vendorName
      // Dropdown returns the value (ID) when a vendor is selected
      // But if it's a name string (from initial load), find the vendor ID from vendors list
      let vendorId = formData.vendorName || selectedBill.vendorId || "";
      
      // If vendorName is not a number/ID, try to find vendor ID from vendors list
      if (vendorId && isNaN(Number(vendorId)) && vendors.length > 0) {
        const vendor = vendors.find(
          (v) => String(v.label) === String(vendorId) || 
                 String(v.value) === String(vendorId) ||
                 String(v.name) === String(vendorId)
        );
        if (vendor) {
          vendorId = String(vendor.value || vendor.id || vendorId);
        } else {
          // If vendor not found by name, try to use selectedBill.vendorId as fallback
          vendorId = selectedBill.vendorId ? String(selectedBill.vendorId) : "";
        }
      } else if (vendorId) {
        // Ensure vendorId is a string (it's already an ID)
        vendorId = String(vendorId);
      }
      
      // Final fallback: use selectedBill.vendorId if vendorId is still empty
      if (!vendorId && selectedBill.vendorId) {
        vendorId = String(selectedBill.vendorId);
      }

      // Prepare API data matching Postman request structure
      const apiData = {
        expenseSection_id: sectionId,
        workspace_id: selectedWorkspace,
        project_id: projectId,
        title: formData.title.trim(),
        amount: parseFloat(formData.amount.replace(/[^\d.]/g, "")) || 0,
        status: formData.status === "paid" ? "Paid" : "Pending",
        defineScript: formData.description || formData.defineScript || "",
        due_date: formatDateToYYYYMMDD(formData.dueDate),
        method: selectedBill.method || "Cash", // Use existing method or default
        paidTo: vendorId, // Vendor ID
        paidBy: user?.id || user?.uid || selectedBill.paidBy || "", // User ID from auth
      };

      // Add paidDate only if status is Paid
      if (formData.status === "paid" || formData.status === "Paid") {
        // Use existing paidDate if available, otherwise use current date
        apiData.paidDate = selectedBill.paidDate 
          ? formatDateToYYYYMMDD(new Date(selectedBill.paidDate))
          : formatDateToYYYYMMDD(new Date());
      }

      // Add PaymentProof file if provided (for future file upload support)
      if (formData.PaymentProof && formData.PaymentProof instanceof File) {
        apiData.PaymentProof = formData.PaymentProof;
      }

      // Add category_id if available
      if (selectedBill.category_id) {
        apiData.category_id = selectedBill.category_id;
      }

      // Call API to update payable bill
      await updatePayableBill(selectedBill.id, apiData);

      // Show success toast
      showSuccess(
        t("payableBillUpdated", {
          defaultValue: "Payable bill updated successfully",
        })
      );

      // Close modal
      setIsEditModalOpen(false);
      setSelectedBill(null);

      // Refetch bills from API to get the latest data
      const statusFilter = filters.status || null;
      await fetchPayableBills(statusFilter);
    } catch (error) {
      console.error("Error updating payable bill:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToUpdatePayableBill", {
          defaultValue: "Failed to update payable bill",
        });
      showError(errorMessage);
    } finally {
      setIsUpdatingBill(false);
    }
  };

  // Handle status change
  const handleStatusChange = (billId, newStatus) => {
    setPayableBills(
      payableBills.map((bill) =>
        bill.id === billId ? { ...bill, status: newStatus } : bill
      )
    );
  };

  // Handle delete payable bill
  const handleDeletePayableBill = async () => {
    if (!billToDelete) return;

    try {
      // Call API to delete payable bill
      await deletePayableBill(billToDelete.id);

      // Show success toast
      showSuccess(
        t("payableBillDeleted", {
          defaultValue: "Payable bill deleted successfully",
        })
      );

      // Close modal
      setIsDeleteModalOpen(false);
      setBillToDelete(null);

      // Refetch bills from API to get the latest data
      const statusFilter = filters.status || null;
      await fetchPayableBills(statusFilter);
    } catch (error) {
      console.error("Error deleting payable bill:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToDeletePayableBill", {
          defaultValue: "Failed to delete payable bill",
        });
      showError(errorMessage);
    }
  };

  // Handle add vendor
  const handleAddVendor = async (vendorData) => {
    if (!selectedWorkspace) {
      showError(
        t("workspaceRequired", {
          defaultValue: "Workspace is required to add vendor",
        })
      );
      return;
    }

    try {
      // Create vendor via API
      // Ensure all required fields are present and valid
      const payload = {
        name: (vendorData.name || vendorData.full_name || "").trim(),
        countryCode: vendorData.countryCode || "+91",
        contactNumber: (vendorData.contactNumber || vendorData.phone_number || "").trim(),
        company_Name: (vendorData.company_Name || vendorData.companyName || "").trim(),
        address: (vendorData.address || "").trim(),
        workspace_id: selectedWorkspace,
      };

      // Validate required fields
      if (!payload.name) {
        showError(t("vendorNameRequired", { defaultValue: "Vendor name is required" }));
        return null;
      }

      console.log("Creating vendor with payload:", payload);
      const response = await createVendor(payload);
      console.log("Vendor creation response:", response);

      // Extract created vendor from response
      const createdVendor =
        response?.data?.user ||
        response?.data?.vendor ||
        response?.data?.data ||
        response?.data ||
        payload;

      const newVendor = {
        value: createdVendor.id || createdVendor._id || createdVendor.vendorId || Date.now().toString(),
        label: createdVendor.full_name || vendorData.name || "",
      };

      // Add to vendors list
      setVendors((prev) => [...prev, newVendor]);

      return newVendor;
    } catch (error) {
      console.error("Error creating vendor:", error);
      console.error("Error response:", error?.response?.data);
      console.error("Payload sent:", payload);
      
      // Extract detailed error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        t("failedToCreateVendor", {
          defaultValue: "Failed to create vendor. Please check all fields are filled correctly.",
        });
      showError(errorMessage);
      
      // Don't throw error to prevent unhandled promise rejection
      // Return null instead so the UI can handle it gracefully
      return null;
    }
  };

  // Handle filter apply
  const handleFilterApply = async (filterData) => {
    if (!projectId || !selectedWorkspace || !sectionId) {
      showError(
        t("projectIdRequired", {
          defaultValue: "Project ID, Workspace ID, and Section ID are required",
        })
      );
      return;
    }

    try {
      setIsLoadingBills(true);
      setFilters(filterData);

      // Format dates to YYYY-MM-DD
      const formatDateToYYYYMMDD = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Map status to API format (capitalize first letter)
      let status = null;
      if (filterData.status) {
        status = filterData.status.charAt(0).toUpperCase() + filterData.status.slice(1);
      }

      // Map payment modes to method
      // If multiple modes selected, use the first one
      let method = null;
      if (filterData.paymentModes && filterData.paymentModes.length > 0) {
        const modeMap = {
          'cash': 'Cash',
          'cheque': 'Cheque',
          'bank_transfer': 'Bank Transfer',
          'upi': 'UPI',
          'other': 'Other',
        };
        // Use first selected mode
        const selectedMode = filterData.paymentModes[0];
        method = modeMap[selectedMode] || selectedMode
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      // Parse amount range
      let minAmount = null;
      let maxAmount = null;
      if (filterData.amount) {
        const amountValue = typeof filterData.amount === 'string' 
          ? parseFloat(filterData.amount.replace(/[₹,]/g, '')) 
          : parseFloat(filterData.amount);
        if (!isNaN(amountValue) && amountValue > 0) {
          // Use same amount for min and max
          minAmount = amountValue;
          maxAmount = amountValue;
        }
      }

      // Get vendor ID from receiver name (if it matches a vendor)
      let paidTo = null;
      if (filterData.receiverName) {
        const vendor = vendors.find(
          (v) => v.label?.toLowerCase() === filterData.receiverName.toLowerCase() ||
                 v.name?.toLowerCase() === filterData.receiverName.toLowerCase()
        );
        if (vendor) {
          paidTo = vendor.value || vendor.id;
        }
      }

      // Prepare API parameters
      const apiParams = {
        project_id: projectId,
        workspace_id: selectedWorkspace,
        expenseSection_id: sectionId,
        status: status,
        startDate: formatDateToYYYYMMDD(filterData.startDate),
        endDate: formatDateToYYYYMMDD(filterData.endDate),
        receiver_name: filterData.receiverName || null,
        paidTo: paidTo,
        method: method,
        minAmount: minAmount,
        maxAmount: maxAmount,
        paidDate: null,
        due_date: null,
        category_id: null,
      };

      // Remove null/undefined/empty values
      Object.keys(apiParams).forEach(key => {
        if (apiParams[key] === null || apiParams[key] === undefined || apiParams[key] === '') {
          delete apiParams[key];
        }
      });

      // Call API with filters
      const response = await getPayableBills(apiParams);

      // Handle different response structures
      let billsData = response?.data || response?.bills || response || [];
      
      // If data is an object with nested array, extract it
      if (billsData && typeof billsData === 'object' && !Array.isArray(billsData)) {
        // Check if it's a single bill object
        if (billsData.id || billsData.bill_id) {
          billsData = [billsData];
        } else {
          // Try to find array in nested structure
          billsData = billsData.data || billsData.bills || [];
        }
      }

      // Process bills data
      const processedBills = billsData.map((bill) => {
        // Handle nested structures (e.g., builderDetail, invoiceMapping)
        const mergedBill = {
          ...bill,
          ...(bill.builderDetail || {}),
          ...(bill.invoiceMapping || {}),
        };

        const dueDate = mergedBill.DueDate || mergedBill.due_date || mergedBill.dueDate;
        const paidDate = mergedBill.PaidDate || mergedBill.paidDate || mergedBill.paid_date;
        const amount = parseFloat(mergedBill.amount || 0);
        const status = mergedBill.status || "Pending";

        return {
          id: mergedBill.id || mergedBill.bill_id || Date.now().toString(),
          billNo: mergedBill.billNo || `PYBL-${mergedBill.id || mergedBill.bill_id || ''}`,
          title: mergedBill.title || "",
          amount: amount,
          status: status,
          dueDate: dueDate ? new Date(dueDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }) : "N/A",
          paidDate: paidDate ? new Date(paidDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }) : null,
          description: mergedBill.defineScript || mergedBill.description || "",
          method: mergedBill.method || "N/A",
          vendorId: mergedBill.paidTo || mergedBill.vendorId || null,
          vendorName: mergedBill.paidToName || mergedBill.vendorName || "",
          paidByName: mergedBill.paidByName || "",
          paymentProof: mergedBill.paymentProof || mergedBill.PaymentProof || null,
          expenseSection_id: mergedBill.expenseSection_id || mergedBill.expense_section?.id || sectionId,
          category_id: mergedBill.category_id || null,
        };
      });

      setPayableBills(processedBills);
      setIsFilterModalOpen(false);
    } catch (error) {
      console.error("Error applying filters:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToApplyFilters", {
          defaultValue: "Failed to apply filters",
        });
      showError(errorMessage);
    } finally {
      setIsLoadingBills(false);
    }
  };

  // Handle filter reset
  const handleFilterReset = async () => {
    if (!projectId || !selectedWorkspace || !sectionId) {
      return;
    }

    try {
      setIsLoadingBills(true);
      setFilters({});

      // Reload bills without filters
      const response = await getPayableBills({
        project_id: projectId,
        workspace_id: selectedWorkspace,
        expenseSection_id: sectionId,
      });

      // Handle different response structures
      let billsData = response?.data || response?.bills || response || [];
      
      // If data is an object with nested array, extract it
      if (billsData && typeof billsData === 'object' && !Array.isArray(billsData)) {
        // Check if it's a single bill object
        if (billsData.id || billsData.bill_id) {
          billsData = [billsData];
        } else {
          // Try to find array in nested structure
          billsData = billsData.data || billsData.bills || [];
        }
      }

      // Process bills data (same as in fetchPayableBills)
      const processedBills = billsData.map((bill) => {
        // Handle nested structures (e.g., builderDetail, invoiceMapping)
        const mergedBill = {
          ...bill,
          ...(bill.builderDetail || {}),
          ...(bill.invoiceMapping || {}),
        };

        const dueDate = mergedBill.DueDate || mergedBill.due_date || mergedBill.dueDate;
        const paidDate = mergedBill.PaidDate || mergedBill.paidDate || mergedBill.paid_date;
        const amount = parseFloat(mergedBill.amount || 0);
        const status = mergedBill.status || "Pending";

        return {
          id: mergedBill.id || mergedBill.bill_id || Date.now().toString(),
          billNo: mergedBill.billNo || `PYBL-${mergedBill.id || mergedBill.bill_id || ''}`,
          title: mergedBill.title || "",
          amount: amount,
          status: status,
          dueDate: dueDate ? new Date(dueDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }) : "N/A",
          paidDate: paidDate ? new Date(paidDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }) : null,
          description: mergedBill.defineScript || mergedBill.description || "",
          method: mergedBill.method || "N/A",
          vendorId: mergedBill.paidTo || mergedBill.vendorId || null,
          vendorName: mergedBill.paidToName || mergedBill.vendorName || "",
          paidByName: mergedBill.paidByName || "",
          paymentProof: mergedBill.paymentProof || mergedBill.PaymentProof || null,
          expenseSection_id: mergedBill.expenseSection_id || mergedBill.expense_section?.id || sectionId,
          category_id: mergedBill.category_id || null,
        };
      });

      setPayableBills(processedBills);
      setIsFilterModalOpen(false);
    } catch (error) {
      console.error("Error resetting filters:", error);
      showError(
        t("failedToResetFilters", {
          defaultValue: "Failed to reset filters",
        })
      );
    } finally {
      setIsLoadingBills(false);
    }
  };

  // Handle download all bills
  const handleDownloadAll = () => {
    console.log("Downloading all bills");
    setDownloadMenuOpen(false);
  };

  // Handle download with custom date
  const handleDownloadCustomDate = (dateRange) => {
    console.log("Downloading bills with date range:", dateRange);
    setDownloadMenuOpen(false);
  };

  // Get section menu items (3 dots menu)
  const getSectionMenuItems = () => [
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

  // Get bill menu items
  const getBillMenuItems = (bill) => [
    {
      label: t("editEntry", { defaultValue: "Edit Entry" }),
      onClick: () => {
        setSelectedBill(bill);
        setIsEditModalOpen(true);
      },
      icon: <img src={pencilIcon} alt="Edit" className="w-4 h-4" />,
    },
    {
      label: t("downloadAsPDF", { defaultValue: "Download as PDF" }),
      onClick: () => {
        console.log("Download as PDF:", bill);
      },
      icon: <img src={pdfIcon} alt="Download PDF" className="w-4 h-4" />,
    },
    {
      label: t("deleteEntry", { defaultValue: "Delete Entry" }),
      onClick: () => {
        setBillToDelete(bill);
        setIsDeleteModalOpen(true);
      },
      icon: <img src={trashIcon} alt="Delete" className="w-4 h-4" />,
      textColor: "text-accent",
    },
  ];

  // Get download menu items
  const getDownloadMenuItems = () => [
    {
      label: t("downloadAllBills", { defaultValue: "Download All Bills" }),
      onClick: handleDownloadAll,
    },
    {
      label: t("downloadWithCustomDate", {
        defaultValue: "Download with Custom Date",
      }),
      onClick: () => {
        setIsCustomDateModalOpen(true);
        setDownloadMenuOpen(false);
      },
    },
  ];

  // Filter bills based on search and filters
  const filteredBills = payableBills.filter((bill) => {
    const matchesSearch =
      !searchQuery ||
      bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.vendorName.toLowerCase().includes(searchQuery.toLowerCase());

    // Add more filter logic here if needed
    return matchesSearch;
  });

  // Handle click outside download menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(event.target)
      ) {
        setDownloadMenuOpen(false);
      }
    };

    if (downloadMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [downloadMenuOpen]);

  // Get border color class based on status
  const getBorderColorClass = (status) => {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, "");
    switch (normalizedStatus) {
      case "paid":
        return "border-gray-100";
      case "pending":
        return "border-gray-100";
      default:
        return "border-gray-100";
    }
  };

  // Status options for dropdown
  const statusOptions = [
    { value: "paid", label: t("paid", { defaultValue: "Paid" }) },
    { value: "pending", label: t("pending", { defaultValue: "Pending" }) },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={sectionName}
        onBack={() =>
          navigate(
            getRoute(ROUTES_FLAT.FINANCE_EXPENSES_TO_PAY, { projectId }),
            { state: { projectName, fromProjects, fromDashboard, projectId } }
          )
        }
        titleActions={
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu
              items={getSectionMenuItems()}
              position="right"
            />
          </div>
        }
      >
        <div className="w-full grid grid-cols-4 gap-2 md:gap-2.5 lg:flex lg:flex-row lg:items-center lg:gap-3 lg:w-auto">
          {/* Search */}
          <div className="col-span-2 md:col-span-1 lg:flex-none">
            <SearchBar
              placeholder={t("searchBills", { defaultValue: "Search Bills" })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-[240px] [&_input]:py-1.5 [&_input]:text-sm"
            />
          </div>

          {/* Filter */}
          <div className="col-span-2 md:col-span-1 lg:flex-none">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFilterModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap"
            >
              <img src={sortVerticalIcon} alt="Filter" className="w-4 h-4" />
              {t("filter", { defaultValue: "Filter" })}
            </Button>
          </div>

          {/* Download and Create */}
          {filteredBills.length > 0 && (
            <>
              {/* Download */}
              <div className="col-span-2 md:col-span-1 lg:flex-none relative" ref={downloadMenuRef}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap"
                >
                  <img src={downloadIcon} alt="Download" className="w-4 h-4" />
                  {t("downloadBills", { defaultValue: "Download Bills" })}
                </Button>

                {downloadMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[200px]">
                    {getDownloadMenuItems().map((item, index) => (
                      <button
                        key={index}
                        onClick={item.onClick}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Create */}
              <div className="col-span-2 md:col-span-1 lg:flex-none">
                <Button
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 text-accent bg-white rounded-full p-0.5" />
                  {t("createPayableBill", { defaultValue: "Create Payable Bill" })}
                </Button>
              </div>
            </>
          )}

          {/* 3 Dots Menu - Always visible on Desktop */}
          <div
            className="hidden lg:block lg:flex-none"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu
              items={getSectionMenuItems()}
              position="right"
            />
          </div>
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50"
          >
            <div className="flex items-center gap-4 cursor-pointer">
              <div className="flex-shrink-0">
                <img src={item.icon} alt={item.label} className="w-12 h-12" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-primary leading-tight mb-1">
                  {item.amount}
                </p>
                <p className="text-xs text-secondary truncate">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payable Bills Section */}
      <div className="mb-4">
        <h2 className="text-lg font-medium text-primary">
          {t("payableBills", { defaultValue: "Payable Bills" })}
        </h2>
      </div>

      {/* Payable Bills List or Empty State */}
      {filteredBills.length > 0 ? (
        <div className="space-y-3">
          {filteredBills.map((bill) => {
            return (
              <div
                key={bill.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-50 `}
              >
                {/* Bill Header */}
                <div className="px-4 py-2">
                  <div className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-accent">
                        {bill.billNo}
                      </span>
                      <span className="text-sm text-secondary">
                        {bill.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu
                        items={getBillMenuItems(bill)}
                        position="right"
                      />
                    </div>
                  </div>
                </div>

                {/* Bill Details */}
                <div className="px-4 pb-4 space-y-3 text-sm">
                  <div className="flex items-start gap-4 border-t border-gray-200 pt-2">
                    {/* Left Column */}
                    <div className="flex-1">
                      <div className="mb-4">
                        <div className="text-secondary mb-1 ">
                          {t("to", { defaultValue: "To" })}:
                        </div>
                        <div className="text-primary font-semibold">
                          {bill.vendorName}
                        </div>
                      </div>
                      <div>
                        <div className="text-secondary mb-1">
                          {t("dueDate", { defaultValue: "Due Date" })}:
                        </div>
                        <div className="text-primary font-semibold">
                          {bill.dueDate || (
                            <span className="text-secondary italic text-sm">
                              {t("notSet", { defaultValue: "Not set" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1">
                      <div className="mb-4">
                        <div className="text-secondary mb-1">
                          {t("amount", { defaultValue: "Amount" })}:
                        </div>
                        <div className="text-primary font-semibold">
                          {bill.amount}
                        </div>
                      </div>
                      <div>
                        
                        <div>
                          <Dropdown
                            options={statusOptions}
                            value={bill.status}
                            onChange={(value) => handleStatusChange(bill.id, value)}
                            customButton={(isOpen, setIsOpen) => (
                              <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className={`px-3 py-1 rounded-full flex items-center gap-2 text-sm font-normal border cursor-pointer ${
                                  bill.status === "paid"
                                    ? "border-green-300 bg-green-50 text-green-600"
                                    : "border-pink-300 bg-pink-50 text-pink-600"
                                }`}
                              >
                                <span>
                                  {bill.status === "paid"
                                    ? t("paid", { defaultValue: "Paid" })
                                    : t("pending", { defaultValue: "Pending" })}
                                </span>
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${
                                    isOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            )}
                            position="bottom"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-secondary mb-1">
                      {t("description", { defaultValue: "Description" })}:
                    </span>
                    <span className="text-primary font-normal pl-2">
                      {bill.description}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-[430px] mb-6">
            <img
              src={emptyStateIcon}
              alt="Empty State"
              className="w-full h-auto"
            />
          </div>
          <h3 className="text-lg font-medium text-primary mb-2">
            {t("noPayableBillsCreated", {
              defaultValue: "No Payable Bills Created",
            })}
          </h3>
          <p className="text-sm text-secondary text-center mb-6 max-w-md">
            {t("setupPayableBills", {
              defaultValue:
                "Set up your project's payable bills to streamline and manage your payables more efficiently.",
            })}
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <Plus className="w-3 h-3 text-accent" strokeWidth={3} />
            </div>
            {t("createPayableBill", { defaultValue: "Create Payable Bill" })}
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreatePayableBillModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreatePayableBill}
        vendors={vendors}
        onAddVendor={handleAddVendor}
        isLoading={isCreatingBill}
      />

      <EditPayableBillModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBill(null);
        }}
        onUpdate={handleEditPayableBill}
        payableBill={selectedBill}
        vendors={vendors}
        onAddVendor={handleAddVendor}
        isLoading={isUpdatingBill}
      />

      <FilterPayableBillsModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
        initialFilters={filters}
      />

      <CustomDateRangeModal
        isOpen={isCustomDateModalOpen}
        onClose={() => setIsCustomDateModalOpen(false)}
        onDownload={handleDownloadCustomDate}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBillToDelete(null);
        }}
        onConfirm={handleDeletePayableBill}
        title={t("deleteEntry", { defaultValue: "Delete Entry" })}
        message={t("deleteBillConfirm", {
          defaultValue:
            "Are you sure you want to delete this payable bill? This action cannot be undone.",
        })}
        confirmText={t("delete", { defaultValue: "Delete" })}
        cancelText={t("cancel", { defaultValue: "Cancel" })}
        confirmVariant="danger"
      />

      <EditSectionModal
        isOpen={isEditSectionModalOpen}
        onClose={() => setIsEditSectionModalOpen(false)}
        onSave={handleEditSection}
        currentSectionName={sectionName}
        isLoading={isUpdating}
      />

      <ConfirmModal
        isOpen={isDeleteSectionModalOpen}
        onClose={() => setIsDeleteSectionModalOpen(false)}
        onConfirm={handleDeleteSection}
        title={t("deleteSection", { defaultValue: "Delete Section" })}
        message={t("deleteSectionConfirm", {
          defaultValue:
            "Are you sure you want to delete this section? This action cannot be undone.",
        })}
        confirmText={t("delete", { defaultValue: "Delete" })}
        cancelText={t("cancel", { defaultValue: "Cancel" })}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

