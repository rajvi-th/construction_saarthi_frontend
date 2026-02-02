/**
 * Payment Received Page
 * Static page for payment received entries with all features
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES_FLAT, getRoute } from "../../../constants/routes";
import PageHeader from "../../../components/layout/PageHeader";
import { useAuth } from "../../auth/store";
import SearchBar from "../../../components/ui/SearchBar";
import Button from "../../../components/ui/Button";
import DropdownMenu from "../../../components/ui/DropdownMenu";
import CreatePaymentEntryModal from "../../../components/ui/CreatePaymentEntryModal";
import EditPaymentEntryModal from "../../../components/ui/EditPaymentEntryModal";
import FilterPaymentModal from "../../../components/ui/FilterPaymentModal";
import CustomDateRangeModal from "../../../components/ui/CustomDateRangeModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import paymentIcon from "../../../assets/icons/paymentred.svg";
import pendingIcon from "../../../assets/icons/Pendingred.svg";
import amountReceivableIcon from "../../../assets/icons/Amountrecevaible.svg";
import downloadIcon from "../../../assets/icons/DownloadMinimalistic.svg";
import pdfIcon from "../../../assets/icons/DownloadMinimalistic.svg";
import pencilIcon from "../../../assets/icons/Pen.svg";
import trashIcon from "../../../assets/icons/Trash.svg";
import sortVerticalIcon from "../../../assets/icons/Sort Vertical.svg";
import emptyStateIcon from "../../../assets/icons/EmptyState.svg";
import { Plus, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { createBank, getBanks, createIncome, getAllIncomes, updateIncome, deleteIncome } from "../api/financeApi";
import { showSuccess, showError } from "../../../utils/toast";

export default function PaymentReceived() {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState(new Set(["1"]));
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [banks, setBanks] = useState([]); // Array of bank names for dropdown
  const [banksData, setBanksData] = useState([]); // Array of bank objects with IDs
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [filters, setFilters] = useState({});
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef(null);

  // Payment entries from API
  const [paymentEntries, setPaymentEntries] = useState([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  
  // Summary data from API
  const [summary, setSummary] = useState({
    totalAmountReceived: 0,
    totalAmountReceivable: 0,
    pendingToReceive: 0,
  });

  // Format amount helper function
  const formatAmount = (amount) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0);
    return `₹${numAmount.toLocaleString("en-IN")}`;
  };

  // Dynamic summary data
  const summaryData = [
    {
      icon: paymentIcon,
      label: t("totalAmountReceived", {
        defaultValue: "Total Amount Received",
      }),
      amount: formatAmount(summary.totalAmountReceived),
      color: "red",
    },
    {
      icon: amountReceivableIcon,
      label: t("totalAmountReceivable", {
        defaultValue: "Total Amount Receivable",
      }),
      amount: formatAmount(summary.totalAmountReceivable),
      color: "red",
    },
    {
      icon: pendingIcon,
      label: t("pendingToReceive", { defaultValue: "Pending to Receive" }),
      amount: formatAmount(summary.pendingToReceive),
      color: "red",
    },
  ];

  // Toggle entry expansion
  const toggleEntry = (id) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle create payment entry
  const handleCreatePaymentEntry = async (formData) => {
    if (!projectId) {
      showError(
        t("projectIdRequired", {
          defaultValue: "Project ID is required",
        })
      );
      return;
    }

    try {
      // Format date to YYYY-MM-DD
      const formatDateToYYYYMMDD = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Map mode to method (API expects: Cash, Cheque, Bank Transfer, UPI, Other)
      const mapModeToMethod = (mode) => {
        const modeMap = {
          'cash': 'Cash',
          'cheque': 'Cheque',
          'bank_transfer': 'Bank Transfer',
          'upi': 'UPI',
          'other': 'Other',
        };
        return modeMap[mode] || mode
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };

      // Get bank_id from bank name
      let bank_id = null;
      if (formData.bankName && (formData.mode === 'bank_transfer' || formData.mode === 'upi')) {
        const bank = banksData.find(
          (b) => b.name === formData.bankName || b.bankName === formData.bankName
        );
        if (bank) {
          bank_id = parseInt(bank.id);
        } else {
          console.warn(`Bank not found: ${formData.bankName}`);
        }
      }

      // Prepare API payload
      const payload = {
        payment_no: formData.paymentNo.trim(),
        date: formatDateToYYYYMMDD(formData.date),
        from: formData.from.trim(),
        to: formData.to.trim(),
        amount: typeof formData.amount === 'string' 
          ? parseFloat(formData.amount.replace(/[₹,]/g, '')) 
          : parseFloat(formData.amount),
        method: mapModeToMethod(formData.mode),
        description: formData.description || '',
        project_id: projectId,
        workspace_id: selectedWorkspace,
      };

      // Add bank_id if available
      if (bank_id) {
        payload.bank_id = bank_id;
      }

      // Call API to create payment entry
      const response = await createIncome(payload);

      // Extract created entry from response
      const createdEntry = response?.data?.income || response?.data?.data || response?.data || {};

      // Create local entry for display
      const newEntry = {
        id: createdEntry.id || Date.now().toString(),
        name: formData.from,
        amount: `₹${payload.amount.toLocaleString("en-IN")}`,
        paymentNo: formData.paymentNo,
        date: new Date(formData.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        description: formData.description,
        to: formData.to,
        mode: payload.method,
        from: formData.from,
        bankName: formData.bankName,
      };

      // Refresh entries list from API after creation
      try {
        const refreshResponse = await getAllIncomes({ projectId: projectId });
        
        // Extract summary from response
        const summaryData = refreshResponse?.data?.summary || refreshResponse?.summary || {};
        if (summaryData) {
          setSummary({
            totalAmountReceived: summaryData.totalAmountReceived || 0,
            totalAmountReceivable: summaryData.totalAmountReceivable || 0,
            pendingToReceive: summaryData.pendingToReceive || 0,
          });
        }
        
        let entriesArray = [];
        if (Array.isArray(refreshResponse?.data?.incomes)) {
          entriesArray = refreshResponse.data.incomes;
        } else if (Array.isArray(refreshResponse?.data?.data)) {
          entriesArray = refreshResponse.data.data;
        } else if (Array.isArray(refreshResponse?.incomes)) {
          entriesArray = refreshResponse.incomes;
        } else if (Array.isArray(refreshResponse?.data)) {
          entriesArray = refreshResponse.data;
        } else if (Array.isArray(refreshResponse)) {
          entriesArray = refreshResponse;
        }

        const transformedEntries = entriesArray.map((entry) => {
          const entryDate = entry.date 
            ? new Date(entry.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A";
          const amountValue = parseFloat(entry.amount || 0);
          const formattedAmount = `₹${amountValue.toLocaleString("en-IN")}`;
          const bankName = entry.bankName || entry.bank?.name || "";

          return {
            id: entry.id || entry.income_id || Date.now().toString(),
            name: entry.from || entry.fromName || "N/A",
            amount: formattedAmount,
            paymentNo: entry.payment_no || entry.paymentNo || "N/A",
            date: entryDate,
            description: entry.description || "",
            to: entry.to || entry.toName || "N/A",
            mode: entry.method || entry.mode || "N/A",
            from: entry.from || entry.fromName || "N/A",
            bankName: bankName,
          };
        });

        setPaymentEntries(transformedEntries);
      } catch (refreshError) {
        console.error("Error refreshing entries:", refreshError);
        // If refresh fails, add the new entry to the list
        setPaymentEntries([newEntry, ...paymentEntries]);
      }

      // Show success message
      showSuccess(
        t("paymentEntryCreated", {
          defaultValue: "Payment entry created successfully",
        })
      );

      // Close modal
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating payment entry:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToCreatePaymentEntry", {
          defaultValue: "Failed to create payment entry",
        });
      showError(errorMessage);
    }
  };

  // Handle edit payment entry
  const handleEditPaymentEntry = async (formData) => {
    if (!selectedEntry) return;

    if (!projectId) {
      showError(
        t("projectIdRequired", {
          defaultValue: "Project ID is required",
        })
      );
      return;
    }

    try {
      // Format date to YYYY-MM-DD
      const formatDateToYYYYMMDD = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Map mode to method (API expects: Cash, Cheque, Bank Transfer, UPI, Other)
      const mapModeToMethod = (mode) => {
        const modeMap = {
          'cash': 'Cash',
          'cheque': 'Cheque',
          'bank_transfer': 'Bank Transfer',
          'upi': 'UPI',
          'other': 'Other',
        };
        return modeMap[mode] || mode
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };

      // Get bank_id from bank name
      let bank_id = null;
      if (formData.bankName && (formData.mode === 'bank_transfer' || formData.mode === 'upi')) {
        const bank = banksData.find(
          (b) => b.name === formData.bankName || b.bankName === formData.bankName
        );
        if (bank) {
          bank_id = parseInt(bank.id);
        } else {
          console.warn(`Bank not found: ${formData.bankName}`);
        }
      }

      // Prepare API payload
      const payload = {
        payment_no: formData.paymentNo.trim(),
        date: formatDateToYYYYMMDD(formData.date),
        from: formData.from.trim(),
        to: formData.to.trim(),
        amount: typeof formData.amount === 'string' 
          ? parseFloat(formData.amount.replace(/[₹,]/g, '')) 
          : parseFloat(formData.amount),
        method: mapModeToMethod(formData.mode),
        description: formData.description || '',
      };

      // Add bank_id if available
      if (bank_id) {
        payload.bank_id = bank_id;
      }

      // Call API to update payment entry
      const response = await updateIncome(selectedEntry.id, payload);

      // Extract updated entry from response
      const updatedEntryResponse = response?.data?.income || response?.data?.data || response?.data || {};

      // Refresh entries list from API after update
      try {
        const refreshResponse = await getAllIncomes({ projectId: projectId });
        
        // Extract summary from response
        const summaryData = refreshResponse?.data?.summary || refreshResponse?.summary || {};
        if (summaryData) {
          setSummary({
            totalAmountReceived: summaryData.totalAmountReceived || 0,
            totalAmountReceivable: summaryData.totalAmountReceivable || 0,
            pendingToReceive: summaryData.pendingToReceive || 0,
          });
        }
        
        let entriesArray = [];
        if (Array.isArray(refreshResponse?.data?.incomes)) {
          entriesArray = refreshResponse.data.incomes;
        } else if (Array.isArray(refreshResponse?.data?.data)) {
          entriesArray = refreshResponse.data.data;
        } else if (Array.isArray(refreshResponse?.incomes)) {
          entriesArray = refreshResponse.incomes;
        } else if (Array.isArray(refreshResponse?.data)) {
          entriesArray = refreshResponse.data;
        } else if (Array.isArray(refreshResponse)) {
          entriesArray = refreshResponse;
        }

        const transformedEntries = entriesArray.map((entry) => {
          const entryDate = entry.date 
            ? new Date(entry.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A";
          const amountValue = parseFloat(entry.amount || 0);
          const formattedAmount = `₹${amountValue.toLocaleString("en-IN")}`;
          const bankName = entry.bankName || entry.bank?.name || "";

          return {
            id: entry.id || entry.income_id || Date.now().toString(),
            name: entry.from || entry.fromName || "N/A",
            amount: formattedAmount,
            paymentNo: entry.payment_no || entry.paymentNo || "N/A",
            date: entryDate,
            description: entry.description || "",
            to: entry.to || entry.toName || "N/A",
            mode: entry.method || entry.mode || "N/A",
            from: entry.from || entry.fromName || "N/A",
            bankName: bankName,
          };
        });

        setPaymentEntries(transformedEntries);
      } catch (refreshError) {
        console.error("Error refreshing entries:", refreshError);
        // If refresh fails, update local entry
        const updatedEntry = {
          ...selectedEntry,
          name: formData.from,
          amount: `₹${payload.amount.toLocaleString("en-IN")}`,
          paymentNo: formData.paymentNo,
          date: new Date(formData.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          description: formData.description,
          to: formData.to,
          mode: payload.method,
          from: formData.from,
          bankName: formData.bankName,
        };
        setPaymentEntries(
          paymentEntries.map((entry) =>
            entry.id === selectedEntry.id ? updatedEntry : entry
          )
        );
      }

      // Show success message
      showSuccess(
        t("paymentEntryUpdated", {
          defaultValue: "Payment entry updated successfully",
        })
      );

      // Close modal
      setIsEditModalOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error("Error updating payment entry:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToUpdatePaymentEntry", {
          defaultValue: "Failed to update payment entry",
        });
      showError(errorMessage);
    }
  };

  // Handle delete payment entry
  const handleDeletePaymentEntry = async () => {
    if (!entryToDelete) return;

    try {
      // Call API to delete payment entry
      await deleteIncome(entryToDelete.id);

      // Refresh entries list from API after deletion
      try {
        const refreshResponse = await getAllIncomes({ projectId: projectId });
        
        // Extract summary from response
        const summaryData = refreshResponse?.data?.summary || refreshResponse?.summary || {};
        if (summaryData) {
          setSummary({
            totalAmountReceived: summaryData.totalAmountReceived || 0,
            totalAmountReceivable: summaryData.totalAmountReceivable || 0,
            pendingToReceive: summaryData.pendingToReceive || 0,
          });
        }
        
        let entriesArray = [];
        if (Array.isArray(refreshResponse?.data?.incomes)) {
          entriesArray = refreshResponse.data.incomes;
        } else if (Array.isArray(refreshResponse?.data?.data)) {
          entriesArray = refreshResponse.data.data;
        } else if (Array.isArray(refreshResponse?.incomes)) {
          entriesArray = refreshResponse.incomes;
        } else if (Array.isArray(refreshResponse?.data)) {
          entriesArray = refreshResponse.data;
        } else if (Array.isArray(refreshResponse)) {
          entriesArray = refreshResponse;
        }

        const transformedEntries = entriesArray.map((entry) => {
          const entryDate = entry.date 
            ? new Date(entry.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A";
          const amountValue = parseFloat(entry.amount || 0);
          const formattedAmount = `₹${amountValue.toLocaleString("en-IN")}`;
          const bankName = entry.bankName || entry.bank?.name || "";

          return {
            id: entry.id || entry.income_id || Date.now().toString(),
            name: entry.from || entry.fromName || "N/A",
            amount: formattedAmount,
            paymentNo: entry.payment_no || entry.paymentNo || "N/A",
            date: entryDate,
            description: entry.description || "",
            to: entry.to || entry.toName || "N/A",
            mode: entry.method || entry.mode || "N/A",
            from: entry.from || entry.fromName || "N/A",
            bankName: bankName,
          };
        });

        setPaymentEntries(transformedEntries);
      } catch (refreshError) {
        console.error("Error refreshing entries:", refreshError);
        // If refresh fails, remove entry from local list
        setPaymentEntries(
          paymentEntries.filter((entry) => entry.id !== entryToDelete.id)
        );
      }

      // Show success message
      showSuccess(
        t("paymentEntryDeleted", {
          defaultValue: "Payment entry deleted successfully",
        })
      );

      // Close modal and reset state
      setEntryToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting payment entry:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToDeletePaymentEntry", {
          defaultValue: "Failed to delete payment entry",
        });
      showError(errorMessage);
    }
  };

  // Handle add bank
  const handleAddBank = async (bankName) => {
    if (!projectId) {
      showError(
        t("projectIdRequired", {
          defaultValue: "Project ID is required to add bank",
        })
      );
      return;
    }

    // Check if bank already exists locally
    if (banks.includes(bankName)) {
      return bankName;
    }

    try {
      // Call API to create bank
      const response = await createBank({
        name: bankName,
        projectId: projectId,
      });

      // Extract created bank from response
      const createdBank =
        response?.data?.bank ||
        response?.data?.data ||
        response?.data ||
        { name: bankName };

      const newBankName = createdBank.name || bankName;

      // Refetch banks from API to get the latest list
      try {
        const banksResponse = await getBanks(projectId);
        let banksArray = [];
        if (Array.isArray(banksResponse?.data?.banks)) {
          // Structure: { data: { success: true, banks: [...] } }
          banksArray = banksResponse.data.banks;
        } else if (Array.isArray(banksResponse?.banks)) {
          // Structure: { banks: [...] }
          banksArray = banksResponse.banks;
        } else if (Array.isArray(banksResponse?.data)) {
          // Structure: { data: [...] }
          banksArray = banksResponse.data;
        } else if (Array.isArray(banksResponse?.data?.data)) {
          // Structure: { data: { data: [...] } }
          banksArray = banksResponse.data.data;
        } else if (Array.isArray(banksResponse)) {
          // Direct array
          banksArray = banksResponse;
        }

        // Store full bank objects for ID lookup
        setBanksData(banksArray);

        // Transform banks to array of bank names for dropdown
        const bankNames = banksArray.map((bank) => {
          return bank.name || bank.bankName || bank.label || String(bank);
        });

        setBanks(bankNames);
      } catch (refreshError) {
        // If refresh fails, try to add the new bank to the list
        console.error("Error refreshing banks:", refreshError);
        // Try to extract bank from create response
        if (createdBank && createdBank.id) {
          setBanksData([...banksData, createdBank]);
        }
        if (!banks.includes(newBankName)) {
          setBanks([...banks, newBankName]);
        }
      }

      showSuccess(
        t("bankCreated", {
          defaultValue: "Bank created successfully",
        })
      );

      return newBankName;
    } catch (error) {
      console.error("Error creating bank:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("failedToCreateBank", {
          defaultValue: "Failed to create bank",
        });
      showError(errorMessage);
      throw error;
    }
  };

  // Handle filter apply
  const handleFilterApply = async (filterData) => {
    if (!projectId) {
      showError(
        t("projectIdRequired", {
          defaultValue: "Project ID is required",
        })
      );
      return;
    }

    try {
      setIsLoadingEntries(true);
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

      // Map payment modes to method
      // If multiple modes selected, use the first one (or handle as needed)
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
          // Use same amount for min and max, or you can split if needed
          minAmount = amountValue;
          maxAmount = amountValue;
        }
      }

      // Prepare API filters
      const apiFilters = {
        projectId: projectId,
        startDate: formatDateToYYYYMMDD(filterData.startDate),
        endDate: formatDateToYYYYMMDD(filterData.endDate),
        to: filterData.receiverName || null,
        method: method,
        minAmount: minAmount,
        maxAmount: maxAmount,
      };

      // Remove null/undefined values
      Object.keys(apiFilters).forEach(key => {
        if (apiFilters[key] === null || apiFilters[key] === undefined || apiFilters[key] === '') {
          delete apiFilters[key];
        }
      });

      // Call API with filters
      const response = await getAllIncomes(apiFilters);

      // Extract summary from response
      const summaryData = response?.data?.summary || response?.summary || {};
      if (summaryData) {
        setSummary({
          totalAmountReceived: summaryData.totalAmountReceived || 0,
          totalAmountReceivable: summaryData.totalAmountReceivable || 0,
          pendingToReceive: summaryData.pendingToReceive || 0,
        });
      }

      // Extract entries array from response
      let entriesArray = [];
      if (Array.isArray(response?.data?.incomes)) {
        entriesArray = response.data.incomes;
      } else if (Array.isArray(response?.data?.data)) {
        entriesArray = response.data.data;
      } else if (Array.isArray(response?.incomes)) {
        entriesArray = response.incomes;
      } else if (Array.isArray(response?.data)) {
        entriesArray = response.data;
      } else if (Array.isArray(response)) {
        entriesArray = response;
      }

      // Transform entries to match display format
      const transformedEntries = entriesArray.map((entry) => {
        const entryDate = entry.date 
          ? new Date(entry.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "N/A";
        const amountValue = parseFloat(entry.amount || 0);
        const formattedAmount = `₹${amountValue.toLocaleString("en-IN")}`;
        const bankName = entry.bankName || entry.bank?.name || "";

        return {
          id: entry.id || entry.income_id || Date.now().toString(),
          name: entry.from || entry.fromName || "N/A",
          amount: formattedAmount,
          paymentNo: entry.payment_no || entry.paymentNo || "N/A",
          date: entryDate,
          description: entry.description || "",
          to: entry.to || entry.toName || "N/A",
          mode: entry.method || entry.mode || "N/A",
          from: entry.from || entry.fromName || "N/A",
          bankName: bankName,
        };
      });

      setPaymentEntries(transformedEntries);
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
      setIsLoadingEntries(false);
    }
  };

  // Handle filter reset
  const handleFilterReset = async () => {
    if (!projectId) return;

    try {
      setIsLoadingEntries(true);
      setFilters({});

      // Reload all entries without filters
      const response = await getAllIncomes({ projectId: projectId });

      // Extract summary from response
      const summaryData = response?.data?.summary || response?.summary || {};
      if (summaryData) {
        setSummary({
          totalAmountReceived: summaryData.totalAmountReceived || 0,
          totalAmountReceivable: summaryData.totalAmountReceivable || 0,
          pendingToReceive: summaryData.pendingToReceive || 0,
        });
      }

      // Extract entries array from response
      let entriesArray = [];
      if (Array.isArray(response?.data?.incomes)) {
        entriesArray = response.data.incomes;
      } else if (Array.isArray(response?.data?.data)) {
        entriesArray = response.data.data;
      } else if (Array.isArray(response?.incomes)) {
        entriesArray = response.incomes;
      } else if (Array.isArray(response?.data)) {
        entriesArray = response.data;
      } else if (Array.isArray(response)) {
        entriesArray = response;
      }

      // Transform entries to match display format
      const transformedEntries = entriesArray.map((entry) => {
        const entryDate = entry.date 
          ? new Date(entry.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "N/A";
        const amountValue = parseFloat(entry.amount || 0);
        const formattedAmount = `₹${amountValue.toLocaleString("en-IN")}`;
        const bankName = entry.bankName || entry.bank?.name || "";

        return {
          id: entry.id || entry.income_id || Date.now().toString(),
          name: entry.from || entry.fromName || "N/A",
          amount: formattedAmount,
          paymentNo: entry.payment_no || entry.paymentNo || "N/A",
          date: entryDate,
          description: entry.description || "",
          to: entry.to || entry.toName || "N/A",
          mode: entry.method || entry.mode || "N/A",
          from: entry.from || entry.fromName || "N/A",
          bankName: bankName,
        };
      });

      setPaymentEntries(transformedEntries);
      setIsFilterModalOpen(false);
    } catch (error) {
      console.error("Error resetting filters:", error);
      showError(
        t("failedToResetFilters", {
          defaultValue: "Failed to reset filters",
        })
      );
    } finally {
      setIsLoadingEntries(false);
    }
  };

  // Handle download all entries
  const handleDownloadAll = () => {
    console.log("Downloading all entries");
    setDownloadMenuOpen(false);
  };

  // Handle download with custom date
  const handleDownloadCustomDate = (dateRange) => {
    console.log("Downloading entries with date range:", dateRange);
    setDownloadMenuOpen(false);
  };

  // Get entry menu items
  const getEntryMenuItems = (entry) => [
    {
      label: t("editEntry", { defaultValue: "Edit Entry" }),
      onClick: () => {
        setSelectedEntry(entry);
        setIsEditModalOpen(true);
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
      label: "Download All Entries",
      onClick: handleDownloadAll,
    },
    {
      label: "Download with Custom Date",
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
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.paymentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.to.toLowerCase().includes(searchQuery.toLowerCase());

    // Add more filter logic here if needed
    return matchesSearch;
  });

  // Fetch payment entries from API on component mount
  useEffect(() => {
    const loadPaymentEntries = async () => {
      if (!projectId) return;

      try {
        setIsLoadingEntries(true);
        const response = await getAllIncomes({ projectId: projectId });

        console.log("Payment entries API response:", response);

        // Extract summary from response
        const summaryData = response?.data?.summary || response?.summary || {};
        if (summaryData) {
          setSummary({
            totalAmountReceived: summaryData.totalAmountReceived || 0,
            totalAmountReceivable: summaryData.totalAmountReceivable || 0,
            pendingToReceive: summaryData.pendingToReceive || 0,
          });
        }

        // Extract entries array from response
        let entriesArray = [];
        if (Array.isArray(response?.data?.incomes)) {
          entriesArray = response.data.incomes;
        } else if (Array.isArray(response?.data?.data)) {
          entriesArray = response.data.data;
        } else if (Array.isArray(response?.incomes)) {
          entriesArray = response.incomes;
        } else if (Array.isArray(response?.data)) {
          entriesArray = response.data;
        } else if (Array.isArray(response)) {
          entriesArray = response;
        }

        console.log("Extracted entries array:", entriesArray);
        console.log("Extracted summary:", summaryData);

        // Transform entries to match display format
        const transformedEntries = entriesArray.map((entry) => {
          // Format date
          const entryDate = entry.date 
            ? new Date(entry.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A";

          // Format amount
          const amountValue = parseFloat(entry.amount || 0);
          const formattedAmount = `₹${amountValue.toLocaleString("en-IN")}`;

          // Get bank name if available
          const bankName = entry.bankName || entry.bank?.name || "";

          return {
            id: entry.id || entry.income_id || Date.now().toString(),
            name: entry.from || entry.fromName || "N/A",
            amount: formattedAmount,
            paymentNo: entry.payment_no || entry.paymentNo || "N/A",
            date: entryDate,
            description: entry.description || "",
            to: entry.to || entry.toName || "N/A",
            mode: entry.method || entry.mode || "N/A",
            from: entry.from || entry.fromName || "N/A",
            bankName: bankName,
          };
        });

        console.log("Transformed entries:", transformedEntries);
        setPaymentEntries(transformedEntries);
      } catch (error) {
        console.error("Error loading payment entries:", error);
        console.error("Error response:", error?.response?.data);
        // Don't show error toast, just use empty array
        setPaymentEntries([]);
      } finally {
        setIsLoadingEntries(false);
      }
    };

    loadPaymentEntries();
  }, [projectId]);

  // Fetch banks from API on component mount
  useEffect(() => {
    const loadBanks = async () => {
      if (!projectId) return;

      try {
        setIsLoadingBanks(true);
        const response = await getBanks(projectId);

        console.log("Banks API response:", response);

        // Extract banks array from response
        // Response structure: { success: true, banks: [...] } or axios wraps it in data
        let banksArray = [];
        if (Array.isArray(response?.data?.banks)) {
          // Structure: { data: { success: true, banks: [...] } }
          banksArray = response.data.banks;
        } else if (Array.isArray(response?.banks)) {
          // Structure: { banks: [...] }
          banksArray = response.banks;
        } else if (Array.isArray(response?.data)) {
          // Structure: { data: [...] }
          banksArray = response.data;
        } else if (Array.isArray(response?.data?.data)) {
          // Structure: { data: { data: [...] } }
          banksArray = response.data.data;
        } else if (Array.isArray(response)) {
          // Direct array
          banksArray = response;
        }

        console.log("Extracted banks array:", banksArray);

        // Store full bank objects for ID lookup
        setBanksData(banksArray);

        // Transform banks to array of bank names for dropdown
        const bankNames = banksArray.map((bank) => {
          return bank.name || bank.bankName || bank.label || String(bank);
        });

        console.log("Bank names:", bankNames);
        setBanks(bankNames);
      } catch (error) {
        console.error("Error loading banks:", error);
        console.error("Error response:", error?.response?.data);
        // Don't show error toast, just use empty array
        setBanks([]);
      } finally {
        setIsLoadingBanks(false);
      }
    };

    loadBanks();
  }, [projectId]);

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

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t("paymentReceived", { defaultValue: "Payment Received" })}
        onBack={() =>
          navigate(getRoute(ROUTES_FLAT.FINANCE_PROJECT_DETAILS, { projectId }), {
            state: { projectName, fromProjects, fromDashboard, projectId }
          })
        }
      >
        <div className="w-full grid grid-cols-2 gap-2 md:gap-2.5 lg:flex lg:flex-row lg:items-center lg:gap-3 lg:w-auto">
          {/* Search */}
          <div className="col-span-2 md:col-span-1 lg:flex-none">
            <SearchBar
              placeholder={t("searchEntries", {
                defaultValue: "Search entries",
              })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-[200px] [&_input]:py-1.5 [&_input]:text-sm"
            />
          </div>

          {/* Filter */}
          <div className="col-span-2 md:col-span-1 lg:flex-none">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFilterModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm"
            >
              <img src={sortVerticalIcon} alt="Filter" className="w-4 h-4" />
              {t("filter", { defaultValue: "Filter" })}
            </Button>
          </div>

          {/* Download and Create */}
          {filteredEntries.length > 0 && (
            <>
              {/* Download */}
              <div className="col-span-2 md:col-span-1 lg:flex-none relative" ref={downloadMenuRef}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm"
                >
                  <img src={downloadIcon} alt="Download" className="w-4 h-4" />
                  {t("downloadEntries", { defaultValue: "Download Entries" })}
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
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm "
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50"
          >
            <div className="flex items-center gap-4 cursor-pointer">
              {/* Icon */}
              <div className="flex-shrink-0">
                <img src={item.icon} alt={item.label} className="w-12 h-12" />
              </div>

              {/* Text */}
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

      {/* Payment Entries Section */}
      <div className="mb-4">
        <h2 className="text-lg font-medium text-primary">
          {t("paymentEntries", { defaultValue: "Payment Entries" })}
        </h2>
      </div>

      {/* Payment Entries List or Empty State */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.id);

            return (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-sm border border-gray-50"
              >
                {/* Entry Header */}
                <div className="px-4 py-2">
                  <div className="flex items-center justify-between cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium mb-1">
                        {entry.name}
                      </h3>
                      <p className="text-base font-medium text-[#34C759]">
                        {entry.amount}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleEntry(entry.id)}
                        className="cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-accent" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-accent" />
                        )}
                      </button>

                      <DropdownMenu
                        items={getEntryMenuItems(entry)}
                        position="right"
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3 text-sm">
                    {/* Row 1: Payment No & To */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-secondary">
                          {t("paymentNo", { defaultValue: "Payment No" })}:
                        </div>
                        <div className="text-primary font-medium">
                          {entry.paymentNo}
                        </div>
                      </div>

                      <div>
                        <div className="text-secondary">
                          {t("to", { defaultValue: "To" })}:
                        </div>
                        <div className="text-primary font-medium">
                          {entry.to}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Date & Mode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-secondary">
                          {t("date", { defaultValue: "Date" })}:
                        </div>
                        <div className="text-primary font-medium">
                          {entry.date}
                        </div>
                      </div>

                      <div>
                        <div className="text-secondary">
                          {t("mode", { defaultValue: "Mode" })}:
                        </div>
                        <div className="text-primary font-medium">
                          {entry.mode}
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Description */}
                    <div className="flex border-t border-gray-200 pt-3">
                      <span className="text-secondary pr-4">
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
          {/* Empty State Illustration */}
          <div className="w-full max-w-[430px] mb-6">
            <img
              src={emptyStateIcon}
              alt="Empty State"
              className="w-full h-auto"
            />
          </div>

          {/* Empty State Text */}
          <h3 className="text-lg font-medium text-primary mb-2">
            {t("noPaymentEntryCreated", {
              defaultValue: "No Payment Entry Created",
            })}
          </h3>
          <p className="text-sm text-secondary text-center mb-6 max-w-md">
            {t("noPaymentsRecorded", {
              defaultValue:
                "No Payments have been recorded for this project. Add a payment to get started.",
            })}
          </p>

          {/* Create Payment Entry Button */}
          <Button
            onClick={() => setIsCreateModalOpen(true)}
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
      <CreatePaymentEntryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreatePaymentEntry}
        banks={banks}
        onAddBank={handleAddBank}
        existingEntries={paymentEntries}
      />

      <EditPaymentEntryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEntry(null);
        }}
        onUpdate={handleEditPaymentEntry}
        paymentEntry={selectedEntry}
        banks={banks}
        onAddBank={handleAddBank}
      />

      <FilterPaymentModal
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
          setEntryToDelete(null);
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
      />
    </div>
  );
}
