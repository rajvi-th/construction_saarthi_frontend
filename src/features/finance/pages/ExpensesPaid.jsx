/**
 * Expenses Paid Page
 * Shows payment entries with expand/collapse, create, edit, filter, and download functionality
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES_FLAT, getRoute } from "../../../constants/routes";
import PageHeader from "../../../components/layout/PageHeader";
import SearchBar from "../../../components/ui/SearchBar";
import Button from "../../../components/ui/Button";
import DropdownMenu from "../../../components/ui/DropdownMenu";
import FilterModal from "../../../components/ui/FilterModal";
import AddVendorModal from "../../../components/ui/AddVendorModal";
import AddCategoryModal from "../../../components/ui/AddCategoryModal";
import AddPaymentModeModal from "../../../components/ui/AddPaymentModeModal";
import CustomDateRangeModal from "../../../components/ui/CustomDateRangeModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { useAuth } from "../../auth/store";
import { getExpenseSections, getPayableBills, deletePayableBill, getCategories, createCategory, getVendors, createVendor } from "../api/financeApi";
import { showError, showSuccess } from "../../../utils/toast";
import paidIcon from "../../../assets/icons/paidred.svg";
import paidViaBankIcon from "../../../assets/icons/Paidviabank.svg";
import paidViaCashIcon from "../../../assets/icons/paidviacash.svg";
import pendingRedIcon from "../../../assets/icons/Pendingred.svg";
import emptyStateIcon from "../../../assets/icons/EmptyState.svg";
import downloadIcon from "../../../assets/icons/Download Minimalistic.svg";
import sortVerticalIcon from "../../../assets/icons/Sort Vertical.svg";
import pdfIcon from "../../../assets/icons/Download Minimalistic.svg";
import pencilIcon from "../../../assets/icons/Pen.svg";
import trashIcon from "../../../assets/icons/Trash.svg";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";

export default function ExpensesPaid() {
  const { t } = useTranslation("finance");
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { selectedWorkspace } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  //   const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // FilterModal manages its own open state via the button inside it, but wait, usually we control it?
  // Checking FilterModal.jsx: It puts the button inside itself! So we don't need isOpen state here for it.
  // Actually, FilterModal renders the button AND the drawer. So we just render <FilterModal />

  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const downloadMenuRef = useRef(null);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [expenseSectionId, setExpenseSectionId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Refs to prevent duplicate API calls
  const isFetchingEntriesRef = useRef(false);
  const isFetchingSectionsRef = useRef(false);
  const isFetchingVendorsRef = useRef(false);
  const isFetchingCategoriesRef = useRef(false);

  // Vendors list - will be fetched from API
  const [vendors, setVendors] = useState([]);
  const [vendorsData, setVendorsData] = useState([]); // Store full vendor objects with IDs

  const [categories, setCategories] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]); // Store full category objects with IDs

  const [modules, setModules] = useState(["Module 1", "Module 2", "Module 3"]);

  const [paymentModes, setPaymentModes] = useState([
    { value: "cash", label: t("cash", { defaultValue: "Cash" }) },
    { value: "cheque", label: t("cheque", { defaultValue: "Cheque" }) },
    {
      value: "bank_transfer",
      label: t("bankTransfer", { defaultValue: "Bank Transfer" }),
    },
    { value: "upi", label: t("upi", { defaultValue: "UPI" }) },
    { value: "other", label: t("other", { defaultValue: "Other" }) },
  ]);

  // Payment entries data - fetched from API
  const [paymentEntries, setPaymentEntries] = useState([]);

  // Static summary data
  const summaryData = [
    {
      icon: paidIcon,
      label: t("totalPaid", { defaultValue: "Total Paid" }),
      amount: "₹5,20,000",
    },
    {
      icon: pendingRedIcon,
      label: t("pendingToPay", { defaultValue: "Pending to Pay" }),
      amount: "₹1,50,000",
    },
    {
      icon: paidViaBankIcon,
      label: t("paidViaBank", { defaultValue: "Paid via Bank" }),
      amount: "₹3,40,000",
    },
    {
      icon: paidViaCashIcon,
      label: t("paidViaCash", { defaultValue: "Paid via Cash" }),
      amount: "₹1,80,000",
    },
  ];

  // Navigate to create payment entry page
  const handleCreatePaymentEntry = () => {
    navigate(getRoute(ROUTES_FLAT.FINANCE_CREATE_PAYMENT_ENTRY, { projectId }));
  };

  // Navigate to edit payment entry page
  const handleEditPaymentEntry = (entry) => {
    navigate(
      getRoute(ROUTES_FLAT.FINANCE_EDIT_PAYMENT_ENTRY, {
        projectId,
        entryId: entry.id,
      }),
      { state: { entry } }
    );
  };

  // Handle delete payment entry
  const handleDeletePaymentEntry = async () => {
    if (!entryToDelete) {
      return;
    }

    try {
      setIsDeleting(true);

      // Call API to delete payment entry
      await deletePayableBill(entryToDelete.id);

      // Show success message
      showSuccess(t("paymentEntryDeleted", { defaultValue: "Payment entry deleted successfully" }));

      // Remove from local state
      setPaymentEntries(
        paymentEntries.filter((entry) => entry.id !== entryToDelete.id)
      );

      // Close modal and reset state
      setEntryToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting payment entry:", error);
      const errorMessage = error?.response?.data?.message || error?.message || t("paymentEntryDeleteError", { defaultValue: "Failed to delete payment entry" });
      showError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle add vendor
  const handleAddVendor = async (vendorData) => {
    // vendorData comes from AddVendorModal's onSave callback
    // It contains: { name, countryCode, contactNumber }
    const vendorName = vendorData.name || vendorData;
    const phoneNumber = vendorData.contactNumber || '';

    // Check if workspace is available
    if (!selectedWorkspace) {
      showError(t("workspaceRequired", { defaultValue: "Workspace is required to create vendor" }));
      return Promise.reject();
    }

    try {
      // Remove spaces from phone number (API expects just digits)
      const cleanedPhoneNumber = phoneNumber.replace(/\s/g, '');

      // Call API to create vendor
      await createVendor({
        full_name: vendorName,
        phone_number: cleanedPhoneNumber,
        workspace_id: selectedWorkspace,
        role: 'vendor',
        profile: null, // Profile is optional, can be added later if needed
      });

      // If API call successful, refresh vendors list from API
      try {
        const response = await getVendors(selectedWorkspace, 'vendor');

        // Handle response structure: { users: [...] }
        const vendorsList = response?.users || response?.data?.users || response?.data || (Array.isArray(response) ? response : []);

        // Store full vendor objects for ID mapping
        setVendorsData(vendorsList);

        // Extract vendor names from the response
        const vendorNames = vendorsList.map((vendor) =>
          vendor.full_name || vendor.name || vendor.fullName || String(vendor)
        ).filter(Boolean);

        setVendors(vendorNames);
      } catch (fetchError) {
        // If refresh fails, just add to local state
        if (!vendors.includes(vendorName)) {
          setVendors([...vendors, vendorName]);
        }
      }

      showSuccess(t("vendorCreated", { defaultValue: "Vendor created successfully" }));
      return Promise.resolve();
    } catch (error) {
      console.error("Error creating vendor:", error);
      const errorMessage = error?.response?.data?.message || error?.message || t("vendorCreateError", { defaultValue: "Failed to create vendor" });
      showError(errorMessage);
      return Promise.reject(error);
    }
  };

  // Handle add category
  const handleAddCategory = async (categoryData) => {
    const categoryName = categoryData.name || categoryData;

    // Check if workspace is available
    if (!selectedWorkspace) {
      showError(t("workspaceRequired", { defaultValue: "Workspace is required to create category" }));
      return Promise.reject();
    }

    try {
      // Call API to create category
      await createCategory({
        name: categoryName,
        workspace_id: selectedWorkspace,
        categoryId: "",
      });

      // If API call successful, refresh categories list from API
      try {
        const categoriesResponse = await getCategories(selectedWorkspace);
        const categoriesList = categoriesResponse?.data || categoriesResponse?.categories || categoriesResponse || [];
        const categoriesArray = Array.isArray(categoriesList) ? categoriesList : [];

        // Extract category names from the response
        const categoryNames = categoriesArray.map((category) =>
          category.name || category.category_name || String(category)
        ).filter(Boolean);

        setCategories(categoryNames);
      } catch (fetchError) {
        // If refresh fails, just add to local state
        if (!categories.includes(categoryName)) {
          setCategories([...categories, categoryName]);
        }
      }

      showSuccess(t("categoryCreated", { defaultValue: "Category created successfully" }));
      return Promise.resolve();
    } catch (error) {
      console.error("Error creating category:", error);
      const errorMessage = error?.response?.data?.message || error?.message || t("categoryCreateError", { defaultValue: "Failed to create category" });
      showError(errorMessage);
      return Promise.reject(error);
    }
  };

  // Helper function to format date to YYYY-MM-DD
  const formatDateForAPI = useCallback((date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Helper function to map filter data to API parameters
  const mapFiltersToAPIParams = useCallback((filterData) => {
    const params = {
      status: 'Paid', // Always filter by Paid status for Expenses Paid page
    };

    // Map paidDate to paidDate
    if (filterData.paidDate) {
      params.paidDate = formatDateForAPI(filterData.paidDate);
    }

    // Map paidTo (vendor name) to paidTo (vendor ID)
    if (filterData.paidTo) {
      const vendor = vendorsData.find(
        (v) => (v.full_name || v.name || v.fullName) === filterData.paidTo
      );
      if (vendor?.id || vendor?.user_id) {
        params.paidTo = String(vendor.id || vendor.user_id);
      } else if (/^\d+$/.test(filterData.paidTo)) {
        // If it's already an ID
        params.paidTo = filterData.paidTo;
      }
    }

    // Map category (category name) to category_id
    if (filterData.category) {
      const category = categoriesData.find(
        (c) => (c.name || c.category_name) === filterData.category
      );
      if (category?.id || category?.category_id || category?.categoryId) {
        params.category_id = String(category.id || category.category_id || category.categoryId);
      } else if (/^\d+$/.test(filterData.category)) {
        // If it's already an ID
        params.category_id = filterData.category;
      }
    }

    // Map paymentMode to method
    if (filterData.paymentMode) {
      const modeMap = {
        cash: 'Cash',
        cheque: 'Cheque',
        bank_transfer: 'Bank Transfer',
        upi: 'UPI',
        other: 'Other',
      };
      params.method = modeMap[filterData.paymentMode] || filterData.paymentMode;
    }

    // Note: module filter is not used in API based on the Postman request

    return params;
  }, [vendorsData, categoriesData, formatDateForAPI]);
  // Handle add payment mode
  const handleAddPaymentMode = async (modeData) => {
    if (modeData?.name) {
      const modeValue = modeData.name.toLowerCase().replace(/\s+/g, "_");
      setPaymentModes(prev => [...prev, { value: modeValue, label: modeData.name }]);
    }
    return Promise.resolve();
  }

  // Handle filter apply
  const handleFilterApply = (filterData) => {
    setFilters(filterData);
    // The useEffect will automatically refetch when filters change
  };

  // Handle filter reset
  const handleFilterReset = () => {
    setFilters({});
    // The useEffect will automatically refetch when filters change
  };

  // Handle download all bills
  const handleDownloadAll = () => {
    console.log("Downloading all bills");
    setDownloadMenuOpen(false);
  };

  // Handle download with custom date
  const handleDownloadCustomDate = (dateRange) => {
    console.log("Download with custom date range:", dateRange);
    setDownloadMenuOpen(false);
  };

  // Get entry menu items
  const getEntryMenuItems = (entry) => [
    {
      label: t("editEntry", { defaultValue: "Edit Entry" }),
      onClick: () => {
        handleEditPaymentEntry(entry);
      },
      icon: <img src={pencilIcon} alt="Edit" className="w-4 h-4" />,
    },
    {
      label: t("downloadAsPDF", { defaultValue: "Download as PDF" }),
      onClick: () => {
        console.log("Download as PDF:", entry);
      },
      icon: <img src={pdfIcon} alt="Download PDF" className="w-4 h-4" />,
    },
    {
      label: t("deleteEntry", { defaultValue: "Delete Entry" }),
      onClick: () => {
        setEntryToDelete(entry);
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

  // Filter entries based on search and filters
  const filteredEntries = paymentEntries.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Add filter logic here if needed
    return matchesSearch;
  });

  // Fetch expense sections to get expenseSection_id
  useEffect(() => {
    const fetchExpenseSections = async () => {
      if (!projectId) {
        console.log("ExpensesPaid: projectId is missing");
        return;
      }

      // Prevent duplicate calls
      if (isFetchingSectionsRef.current) {
        return;
      }

      try {
        isFetchingSectionsRef.current = true;
        console.log("ExpensesPaid: Fetching expense sections for projectId:", projectId);
        const sections = await getExpenseSections(projectId);
        console.log("ExpensesPaid: Expense sections response:", sections);

        const sectionsList = Array.isArray(sections)
          ? sections
          : sections?.data || sections?.sections || [];

        console.log("ExpensesPaid: Processed sections list:", sectionsList);

        // Find "Expenses Paid" section or use first available
        const expensesPaidSection = sectionsList.find(
          (section) =>
            section.name?.toLowerCase().includes('expenses paid') ||
            section.name?.toLowerCase().includes('paid') ||
            section.section_name?.toLowerCase().includes('expenses paid')
        );

        if (expensesPaidSection) {
          const sectionId = expensesPaidSection.id || expensesPaidSection.section_id;
          console.log("ExpensesPaid: Found Expenses Paid section, ID:", sectionId);
          setExpenseSectionId(sectionId);
        } else if (sectionsList.length > 0) {
          // Fallback to first section if "Expenses Paid" not found
          const sectionId = sectionsList[0].id || sectionsList[0].section_id;
          console.log("ExpensesPaid: Using first section as fallback, ID:", sectionId);
          setExpenseSectionId(sectionId);
        } else {
          console.log("ExpensesPaid: No sections found");
        }
      } catch (error) {
        console.error("ExpensesPaid: Error fetching expense sections:", error);
      } finally {
        isFetchingSectionsRef.current = false;
      }
    };

    fetchExpenseSections();
  }, [projectId]);

  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      if (!selectedWorkspace) {
        return;
      }

      // Prevent duplicate calls
      if (isFetchingVendorsRef.current) {
        return;
      }

      try {
        isFetchingVendorsRef.current = true;
        const response = await getVendors(selectedWorkspace, 'vendor');

        // Handle response structure: { users: [...] }
        const vendorsList = response?.users || response?.data?.users || response?.data || (Array.isArray(response) ? response : []);

        // Store full vendor objects for ID mapping
        setVendorsData(vendorsList);

        // Extract vendor names for display
        const vendorNames = vendorsList.map((vendor) =>
          vendor.full_name || vendor.name || vendor.fullName || String(vendor)
        ).filter(Boolean);

        setVendors(vendorNames);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        // Don't show error toast on initial load, just log it
        // User can still add new vendors manually
        setVendors([]);
      } finally {
        isFetchingVendorsRef.current = false;
      }
    };

    fetchVendors();
  }, [selectedWorkspace]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedWorkspace) {
        return;
      }

      // Prevent duplicate calls
      if (isFetchingCategoriesRef.current) {
        return;
      }

      try {
        isFetchingCategoriesRef.current = true;
        const response = await getCategories(selectedWorkspace);

        // Handle different response structures
        const categoriesList = response?.data || response?.categories || response || [];
        const categoriesArray = Array.isArray(categoriesList) ? categoriesList : [];

        // Store full category objects with IDs
        setCategoriesData(categoriesArray);

        // Extract category names from the response
        const categoryNames = categoriesArray.map((category) =>
          category.name || category.category_name || String(category)
        ).filter(Boolean);

        setCategories(categoryNames);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Don't show error toast on initial load, just log it
        // User can still add new categories manually
        setCategories([]);
      } finally {
        isFetchingCategoriesRef.current = false;
      }
    };

    fetchCategories();
  }, [selectedWorkspace]);

  // Fetch payment entries from API
  useEffect(() => {
    const fetchPaymentEntries = async () => {
      if (!projectId) {
        console.log("ExpensesPaid: projectId is missing, cannot fetch entries");
        return;
      }
      if (!selectedWorkspace) {
        console.log("ExpensesPaid: selectedWorkspace is missing, cannot fetch entries");
        return;
      }
      if (!expenseSectionId) {
        console.log("ExpensesPaid: expenseSectionId is missing, cannot fetch entries");
        return;
      }

      // Prevent duplicate calls
      if (isFetchingEntriesRef.current) {
        return;
      }

      try {
        isFetchingEntriesRef.current = true;
        // Map filters to API parameters
        const filterParams = mapFiltersToAPIParams(filters);

        const apiParams = {
          project_id: projectId,
          workspace_id: selectedWorkspace,
          expenseSection_id: expenseSectionId,
          ...filterParams,
        };

        console.log("ExpensesPaid: Fetching payment entries with params:", apiParams);
        setIsLoadingEntries(true);
        const response = await getPayableBills(apiParams);
        console.log("ExpensesPaid: Payment entries API response:", response);

        // Handle different response structures
        let entriesList = [];
        if (Array.isArray(response)) {
          entriesList = response;
        } else if (Array.isArray(response?.data)) {
          entriesList = response.data;
        } else if (Array.isArray(response?.bills)) {
          entriesList = response.bills;
        } else if (Array.isArray(response?.payableBills)) {
          entriesList = response.payableBills;
        } else if (response?.data?.bills) {
          entriesList = response.data.bills;
        }

        // Map API response to component data structure
        const mappedEntries = entriesList.map((entry) => {
          // Format amount with currency symbol
          const amountValue = parseFloat(entry.amount || 0);
          const formattedAmount = `₹${amountValue.toLocaleString('en-IN')}`;

          // Format date
          const paidDate = entry.PaidDate || entry.paidDate || entry.paid_date || '';
          let formattedDate = '';
          if (paidDate) {
            try {
              const dateObj = new Date(paidDate);
              formattedDate = dateObj.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
            } catch (e) {
              formattedDate = paidDate;
            }
          }

          // Map payment method
          const method = entry.method || entry.paymentMethod || '';
          const methodMap = {
            'Cash': { paidVia: 'Cash', mode: 'cash' },
            'Cheque': { paidVia: 'Cheque', mode: 'cheque' },
            'Bank Transfer': { paidVia: 'Bank Transfer', mode: 'bank_transfer' },
            'UPI': { paidVia: 'UPI', mode: 'upi' },
            'Other': { paidVia: 'Other', mode: 'other' },
          };
          const paymentInfo = methodMap[method] || { paidVia: method || 'Cash', mode: 'cash' };

          // Get vendor name (paidTo might be ID, need to fetch vendor name)
          // For now, use title or paidTo as vendor name
          const vendorName = entry.paidToName || entry.title || entry.paidTo || 'Unknown Vendor';

          // Get paidBy name (might be ID, need to fetch user name)
          // For now, use paidBy as is or fetch from users
          const paidBy = entry.paidByName || entry.paidBy || 'Unknown';

          return {
            id: String(entry.id || entry.bill_id || entry.payable_bill_id),
            vendorName: vendorName,
            amount: formattedAmount,
            amountValue: amountValue,
            paidDate: formattedDate,
            description: entry.defineScript || entry.description || entry.title || '',
            paidBy: paidBy,
            paidVia: paymentInfo.paidVia,
            mode: paymentInfo.mode,
            category: entry.category || entry.category_name || '',
            // Store original entry for reference
            originalEntry: entry,
          };
        });

        setPaymentEntries(mappedEntries);
      } catch (error) {
        console.error("Error fetching payment entries:", error);
        const errorMessage = error?.response?.data?.message || error?.message || t("failedToLoadPaymentEntries", { defaultValue: "Failed to load payment entries" });
        showError(errorMessage);
        setPaymentEntries([]);
      } finally {
        setIsLoadingEntries(false);
        isFetchingEntriesRef.current = false;
      }
    };

    fetchPaymentEntries();
  }, [projectId, selectedWorkspace, expenseSectionId, filters, mapFiltersToAPIParams]);

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

  // Toggle entry expansion
  const toggleEntryExpansion = (entryId) => {
    setExpandedEntryId(expandedEntryId === entryId ? null : entryId);
  };

  // Configuration for FilterModal
  const filtersConfig = useMemo(() => [
    {
      id: "paidDate",
      type: "date",
      label: t("paidDate", { defaultValue: "Paid Date" }),
      required: true,
      defaultValue: new Date(),
    },
    {
      id: "paidTo",
      type: "dropdown",
      label: t("paidTo", { defaultValue: "Paid To" }),
      required: true,
      options: vendors.map((v) => ({ label: v, value: v })),
      searchable: true,
      searchPlaceholder: t("searchVendor", { defaultValue: "Search vendor" }),
      showSeparator: true,
      addButtonLabel: t("addNew", { defaultValue: "Add New" }),
      onAddNew: handleAddVendor,
      customModal: AddVendorModal,
    },
    {
      id: "category",
      type: "dropdown",
      label: t("categoriesForPayment", { defaultValue: "Categories for Payment" }),
      required: true,
      options: categories.map((c) => ({ label: c, value: c })),
      showSeparator: true,
      addButtonLabel: t("addNew", { defaultValue: "Add New" }),
      onAddNew: handleAddCategory,
      customModal: AddCategoryModal,
      placeholder: t("selectCategories", { defaultValue: "Select Categories" }),
    },
    {
      id: "module",
      type: "dropdown",
      label: t("selectModule", { defaultValue: "Select Module" }),
      required: true,
      options: modules.map((m) => ({ label: m, value: m })),
    },
    {
      id: "paymentMode",
      type: "dropdown",
      label: t("paymentMode", { defaultValue: "Payment Mode" }),
      required: true,
      options: paymentModes,
      showSeparator: true,
      addButtonLabel: t("addNew", { defaultValue: "Add New" }),
      onAddNew: handleAddPaymentMode,
      customModal: AddPaymentModeModal,
      placeholder: t("selectPaymentMode", { defaultValue: "Select Payment Mode" }),
    },
  ], [vendors, categories, modules, paymentModes, t]);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t("expensesPaid", { defaultValue: "Expenses Paid" })}
        onBack={() =>
          navigate(getRoute(ROUTES_FLAT.FINANCE_PROJECT_DETAILS, { projectId }))
        }
      >
        <div className="w-full grid grid-cols-2 gap-2 md:gap-2.5 lg:flex lg:flex-row lg:items-center lg:gap-3 lg:w-auto">
          {/* Search */}
          <div className="col-span-2 md:col-span-1 lg:flex-none">
            <SearchBar
              placeholder={t("searchPaymentEntries", {
                defaultValue: "Search payment entries",
              })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-[250px] [&_input]:py-1.5 [&_input]:text-sm"
            />
          </div>

          {/* Filter */}
          <div className="col-span-2 md:col-span-1 lg:flex-none">
            <FilterModal
              filters={filtersConfig}
              onApply={handleFilterApply}
              onReset={handleFilterReset}
              placeholder={t("filter", { defaultValue: "Filter" })}
              className="w-full flex items-center justify-center gap-1.5 px-3 !py-1.5 text-sm"
            />
          </div>

          {/* Download and Create (only show when data exists) */}
          {filteredEntries.length > 0 && (
            <>
              {/* Download */}
              <div
                className="col-span-2 md:col-span-1 lg:flex-none relative"
                ref={downloadMenuRef}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm"
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
                  onClick={handleCreatePaymentEntry}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm"
                >
                  <Plus className="w-4 h-4 text-accent bg-white rounded-full p-0.5" />
                  {t("createPaymentEntry", {
                    defaultValue: "Create Payment Entry",
                  })}
                </Button>
              </div>
            </>
          )}
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 border border-gray-50 shadow-sm"
          >
            <div className="flex items-center gap-4 cursor-pointer">
              <div className="flex-shrink-0">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-medium text-primary leading-tight mb-1">
                  {item.amount}
                </p>
                <p className="text-xs sm:text-sm text-secondary truncate">
                  {item.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Entries Section */}
      <div className="mb-4">
        <h2 className="text-lg font-medium text-primary">
          {t("paymentEntries", { defaultValue: "Payment Entries" })}
        </h2>
      </div>

      {/* Payment Entries List or Empty State */}
      {isLoadingEntries ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-secondary">{t("loading", { defaultValue: "Loading..." })}</div>
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedEntryId === entry.id;
            return (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-sm border border-gray-50"
              >
                {/* Entry Header */}
                <div
                  className="px-4 py-2 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleEntryExpansion(entry.id)}
                >
                  <div className="min-w-0">
                    <div className="text-base font-medium text-primary truncate">
                      {entry.vendorName}
                    </div>
                    <div className="text-base font-medium text-[#34C759]">
                      {entry.amount}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-accent" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-accent" />
                    )}
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu
                        items={getEntryMenuItems(entry)}
                        position="right"
                      />
                    </div>
                  </div>
                </div>

                {/* Entry Details (when expanded) */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200 pt-3">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      {/* Left */}
                      <div>
                        <div className="text-secondary text-sm mb-1">
                          {t("to", { defaultValue: "To" })}:
                        </div>
                        <div className="text-primary font-medium">
                          {entry.vendorName}
                        </div>
                      </div>

                      {/* Right */}
                      <div>
                        <div className="text-secondary text-sm mb-1">
                          {t("paidBy", { defaultValue: "Paid By" })}:
                        </div>
                        <div className="text-primary font-medium">
                          {entry.paidBy}
                        </div>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      {/* Left */}
                      <div>
                        <div className="text-secondary text-sm mb-1">
                          {t("date", { defaultValue: "Date" })}:
                        </div>
                        <div className="text-primary font-medium">
                          {entry.paidDate}
                        </div>
                      </div>

                      {/* Right */}
                      <div>
                        <div className="text-secondary text-sm mb-1">
                          {t("paidVia", { defaultValue: "Paid via" })}:
                        </div>
                        <div className="text-primary font-medium">
                          {entry.paidVia}
                        </div>
                      </div>
                    </div>

                    {/* Row 3 – Full width */}
                    <div className="border-t border-gray-200 pt-2">
                      <span className="text-secondary text-sm mb-1 pr-2">
                        {t("description", { defaultValue: "Description" })}:
                      </span>
                      <span className="text-primary font-normal">
                        {entry.description}
                      </span>
                    </div>
                  </div>
                )}
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
            {t("noPaymentRecordedYet", {
              defaultValue: "No Payment Recorded Yet",
            })}
          </h3>
          <p className="text-sm text-secondary text-center mb-6 max-w-md">
            {t("startTrackingExpenses", {
              defaultValue:
                "Start tracking your project expenses by adding your first payment entry.",
            })}
          </p>
          <Button
            onClick={handleCreatePaymentEntry}
            className="flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <Plus className="w-3 h-3 text-accent" strokeWidth={3} />
            </div>
            {t("createPaymentEntry", { defaultValue: "Create Payment Entry" })}
          </Button>
        </div>
      )}

      {/* Modals */}
      <CustomDateRangeModal
        isOpen={isCustomDateModalOpen}
        onClose={() => setIsCustomDateModalOpen(false)}
        onDownload={handleDownloadCustomDate}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setEntryToDelete(null);
          }
        }}
        onConfirm={handleDeletePaymentEntry}
        title={t("deleteEntry", { defaultValue: "Delete Entry" })}
        message={t("deleteEntryConfirm", {
          defaultValue:
            "Are you sure you want to delete this payment entry? This action cannot be undone.",
        })}
        confirmText={t("delete", { defaultValue: "Delete" })}
        cancelText={t("cancel", { defaultValue: "Cancel" })}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}