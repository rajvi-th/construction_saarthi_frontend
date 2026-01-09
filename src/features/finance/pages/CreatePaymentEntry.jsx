/**
 * Create Payment Entry Page
 * Page for creating a new payment entry
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES_FLAT, getRoute } from "../../../constants/routes";
import PageHeader from "../../../components/layout/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Dropdown from "../../../components/ui/Dropdown";
import DatePicker from "../../../components/ui/DatePicker";
import Textarea from "../../../components/ui/Textarea";
import FileUpload from "../../../components/ui/FileUpload";
import AddVendorModal from "../../../components/ui/AddVendorModal";
import AddCategoryModal from "../../../components/ui/AddCategoryModal";
import AddPaymentModeModal from "../../../components/ui/AddPaymentModeModal";
import { useAuth } from "../../auth/store";
import { createCategory, createVendor, getVendors, getBanks, createBank, createPayableBill, getExpenseSections, getCategories } from "../api/financeApi";
import { getWorkspaceMembers } from "../../auth/api/authApi";
import { showSuccess, showError } from "../../../utils/toast";
import AddItemModal from "../../../components/ui/AddItemModal";
import { X, Play, FileText } from "lucide-react";

export default function CreatePaymentEntry() {
  const { t } = useTranslation("finance");
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { selectedWorkspace, user } = useAuth();

  const [formData, setFormData] = useState({
    paidDate: new Date(),
    paidBy: "",
    amount: "",
    description: "",
    paidTo: "",
    category: "",
    mode: "",
    bankName: "",
    paymentProof: null, // Keep for API (single file)
  });

  // Store uploaded files for display
  const [uploadedFiles, setUploadedFiles] = useState({
    photos: [],
    videos: [],
    documents: [],
  });
  const [activeTab, setActiveTab] = useState("photos");

  const [errors, setErrors] = useState({});
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseSectionId, setExpenseSectionId] = useState(null);

  // Vendors list - will be fetched from API (store full objects with IDs)
  const [vendors, setVendors] = useState([]);
  const [vendorsData, setVendorsData] = useState([]); // Store full vendor objects with IDs
  
  // Users list for paidBy field - store full user objects with IDs
  const [usersData, setUsersData] = useState([]); // Store full user objects with IDs
  
  // Banks list - will be fetched from API
  const [banks, setBanks] = useState([]);

  const [categories, setCategories] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]); // Store full category objects with IDs

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


  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      if (!selectedWorkspace) {
        return;
      }

      try {
        setIsLoadingVendors(true);
        const response = await getVendors(selectedWorkspace, 'vendor');
        
        // Handle response structure: { users: [...] }
        const vendorsList = response?.users || response?.data?.users || response?.data || (Array.isArray(response) ? response : []);
        
        // Store full vendor objects for ID mapping
        // Use vendor ID as unique identifier to prevent duplicate key issues
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
        setIsLoadingVendors(false);
      }
    };

    fetchVendors();
  }, [selectedWorkspace]);

  // Fetch users/members for paidBy field
  useEffect(() => {
    const fetchUsers = async () => {
      if (!selectedWorkspace) {
        return;
      }

      try {
        // Try to fetch workspace members
        const response = await getWorkspaceMembers(selectedWorkspace);
        
        // Handle different response structures
        const usersList = response?.data || response?.members || response?.users || response || [];
        const usersArray = Array.isArray(usersList) ? usersList : [];
        
        // Store full user objects with IDs
        setUsersData(usersArray);
      } catch (error) {
        console.error("Error fetching users:", error);
        // If workspace members fails, try fetching vendors/users with different roles
        try {
          // Try fetching with role 'user' or empty role
          const vendorResponse = await getVendors(selectedWorkspace, 'user');
          const usersList = vendorResponse?.users || vendorResponse?.data?.users || vendorResponse?.data || (Array.isArray(vendorResponse) ? vendorResponse : []);
          setUsersData(usersList);
        } catch (err) {
          console.error("Error fetching users with alternative method:", err);
          setUsersData([]);
        }
      }
    };

    fetchUsers();
  }, [selectedWorkspace]);

  // Fetch banks on component mount
  useEffect(() => {
    const fetchBanks = async () => {
      if (!projectId) {
        return;
      }

      try {
        setIsLoadingBanks(true);
        const response = await getBanks(projectId);
        
        // Handle different response structures
        // API might return: { data: [...] } or { banks: [...] } or directly [...]
        let banksList = [];
        
        if (Array.isArray(response)) {
          banksList = response;
        } else if (Array.isArray(response?.data)) {
          banksList = response.data;
        } else if (Array.isArray(response?.banks)) {
          banksList = response.banks;
        } else if (response?.data && typeof response.data === 'object') {
          // If data is an object, try to extract array from it
          banksList = Array.isArray(response.data.data) 
            ? response.data.data 
            : Object.values(response.data).filter(Array.isArray)[0] || [];
        }
        
        // Extract bank names from the response
        const bankNames = banksList.map((bank) => {
          if (typeof bank === 'string') return bank;
          return bank.name || bank.bank_name || bank.bankName || String(bank);
        }).filter(Boolean);
        
        setBanks(bankNames);
      } catch (error) {
        console.error("Error fetching banks:", error);
        // Don't show error toast on initial load, just log it
        setBanks([]);
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchBanks();
  }, [projectId]);

  // Fetch expense sections to get expenseSection_id
  useEffect(() => {
    const fetchExpenseSections = async () => {
      if (!projectId) {
        return;
      }

      try {
        const response = await getExpenseSections(projectId);
        
        // Handle different response structures
        const sectionsData = response?.data || response || [];
        const sectionsList = Array.isArray(sectionsData) ? sectionsData : [];
        
        // Get the first expense section ID (or "Expenses Paid" section if available)
        if (sectionsList.length > 0) {
          // Try to find "Expenses Paid" section, otherwise use first one
          const expensesPaidSection = sectionsList.find(
            (section) => section.name?.toLowerCase().includes('paid') || section.name?.toLowerCase().includes('expense')
          );
          setExpenseSectionId(expensesPaidSection?.id || sectionsList[0]?.id || sectionsList[0]?.expenseSection_id);
        }
      } catch (error) {
        console.error("Error fetching expense sections:", error);
        // Don't show error toast, just log it
      }
    };

    fetchExpenseSections();
  }, [projectId]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedWorkspace) {
        return;
      }

      try {
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
      }
    };

    fetchCategories();
  }, [selectedWorkspace]);


  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Check file type
  const getFileType = (file) => {
    const type = file.type || "";
    if (type.startsWith("image/")) return "photos";
    if (type.startsWith("video/")) return "videos";
    return "documents";
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Create file object with preview URL
  const createFileObject = (file) => {
    const fileType = getFileType(file);
    const fileObj = {
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      uploadDate: formatDate(new Date()),
      url: fileType === "photos" || fileType === "videos" ? URL.createObjectURL(file) : null,
    };
    return { fileObj, fileType };
  };

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      // Store first file for API (backward compatibility)
      handleChange("paymentProof", files[0]);

      // Add all files to display
      const newFiles = { photos: [], videos: [], documents: [] };
      
      Array.from(files).forEach((file) => {
        const { fileObj, fileType } = createFileObject(file);
        newFiles[fileType].push(fileObj);
      });

      setUploadedFiles((prev) => ({
        photos: [...prev.photos, ...newFiles.photos],
        videos: [...prev.videos, ...newFiles.videos],
        documents: [...prev.documents, ...newFiles.documents],
      }));

      // Switch to the tab of the first file type
      if (newFiles.photos.length > 0) setActiveTab("photos");
      else if (newFiles.videos.length > 0) setActiveTab("videos");
      else if (newFiles.documents.length > 0) setActiveTab("documents");
    }
  };

  const handleRemoveFile = (fileId, fileType) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [fileType]: prev[fileType].filter((f) => f.id !== fileId),
    }));

    // If removed file was the first one, update paymentProof
    const remainingFiles = {
      photos: [...uploadedFiles.photos.filter((f) => f.id !== fileId)],
      videos: [...uploadedFiles.videos.filter((f) => f.id !== fileId)],
      documents: [...uploadedFiles.documents.filter((f) => f.id !== fileId)],
    };

    const allFiles = [
      ...remainingFiles.photos,
      ...remainingFiles.videos,
      ...remainingFiles.documents,
    ];

    handleChange("paymentProof", allFiles.length > 0 ? allFiles[0].file : null);
  };

  const handleCreate = () => {
    const newErrors = {};

    if (!formData.paidDate) {
      newErrors.paidDate = t("paidDateRequired", {
        defaultValue: "Paid date is required",
      });
    }

    if (!formData.paidTo) {
      newErrors.paidTo = t("paidToRequired", {
        defaultValue: "Paid to is required",
      });
    }

    if (!formData.category) {
      newErrors.category = t("categoryRequired", {
        defaultValue: "Category is required",
      });
    }

    const amountValue = formData.amount
      ? parseFloat(formData.amount.replace(/[^\d.]/g, ""))
      : 0;

    if (!formData.amount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = t("amountRequired", {
        defaultValue: "Amount is required",
      });
    }

    if (!formData.mode) {
      newErrors.mode = t("modeRequired", {
        defaultValue: "Payment mode is required",
      });
    }

    // Bank name is required for cheque, bank_transfer, and upi
    if (
      (formData.mode === "cheque" ||
        formData.mode === "bank_transfer" ||
        formData.mode === "upi") &&
      !formData.bankName
    ) {
      newErrors.bankName = t("bankNameRequired", {
        defaultValue: "Bank name is required",
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check if expenseSectionId is available
    if (!expenseSectionId) {
      showError(t("expenseSectionRequired", { defaultValue: "Expense section is required. Please try again." }));
      return;
    }

    // Check if workspace is available
    if (!selectedWorkspace) {
      showError(t("workspaceRequired", { defaultValue: "Workspace is required" }));
      return;
    }

    // Call API to create payment entry
    handleCreatePaymentEntry();
  };

  const handleCreatePaymentEntry = async () => {
    try {
      setIsSubmitting(true);

      // Format date to YYYY-MM-DD
      const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Get vendor ID - formData.paidTo should be vendor ID from dropdown
      // But handle case where it might be a name (backward compatibility)
      let vendorId = formData.paidTo;
      
      // If paidTo is a name (string that's not a number), find the vendor ID
      if (typeof formData.paidTo === 'string' && !/^\d+$/.test(formData.paidTo)) {
        const vendor = vendorsData.find(
          (v) => (v.full_name || v.name || v.fullName) === formData.paidTo
        );
        vendorId = vendor?.id || vendor?.user_id || formData.paidTo;
      }
      
      // Ensure vendorId is a string (API expects string/number)
      vendorId = vendorId ? String(vendorId) : '';
      
      // Validate vendorId exists
      if (!vendorId) {
        showError(t("vendorRequired", { defaultValue: "Please select a vendor" }));
        return;
      }

      // Calculate due date (3 days after paid date by default)
      const paidDate = new Date(formData.paidDate);
      const dueDate = new Date(paidDate);
      dueDate.setDate(dueDate.getDate() + 3);

      // Map payment mode to API format
      const modeMap = {
        cash: 'Cash',
        cheque: 'Cheque',
        bank_transfer: 'Bank Transfer',
        upi: 'UPI',
        other: 'Other',
      };
      const method = modeMap[formData.mode] || formData.mode || 'Cash';

      // Prepare API data
      const amountValue = parseFloat(formData.amount.replace(/[^\d.]/g, ""));

      // Map paidBy name to user ID
      let paidById = '';
      if (formData.paidBy) {
        const searchName = formData.paidBy.toLowerCase().trim();
        
        // First try to find in usersData (workspace members)
        let foundUser = usersData.find(user => {
          const userName = user.full_name || user.name || user.fullName || '';
          return userName.toLowerCase() === searchName;
        });
        
        // If not found in users, try vendorsData (vendors are also users)
        if (!foundUser) {
          foundUser = vendorsData.find(vendor => {
            const vendorName = vendor.full_name || vendor.name || vendor.fullName || '';
            return vendorName.toLowerCase() === searchName;
          });
        }
        
        if (foundUser) {
          paidById = String(foundUser.id || foundUser.user_id || foundUser.userId);
        } else {
          // If not found, check if it's already a numeric ID
          const numericId = formData.paidBy.trim();
          if (/^\d+$/.test(numericId)) {
            paidById = numericId;
          } else {
            // If still not found and not numeric, use current user's ID as fallback
            paidById = user?.id ? String(user.id) : '';
          }
        }
      } else {
        // Default to current user's ID
        paidById = user?.id ? String(user.id) : '';
      }

      const apiData = {
        expenseSection_id: expenseSectionId,
        workspace_id: selectedWorkspace,
        project_id: projectId,
        title: formData.description || formData.category || 'Payment Entry',
        amount: amountValue,
        status: 'Paid', // Since this is "Expenses Paid" page
        defineScript: formData.description || '',
        method: method,
        paidTo: vendorId,
        paidBy: paidById, // User ID (bigint) - mapped from name
        paidDate: formatDate(formData.paidDate),
        due_date: formatDate(dueDate),
        PaymentProof: formData.paymentProof, // File object
      };

      // Debug: Log API data
      console.log("API Data being sent:", {
        ...apiData,
        PaymentProof: apiData.PaymentProof ? `${apiData.PaymentProof.name} (${apiData.PaymentProof.size} bytes)` : null,
      });

      // Call API
      await createPayableBill(apiData);

      // Show success message
      showSuccess(t("paymentEntryCreated", { defaultValue: "Payment entry created successfully" }));

      // Navigate back to expenses paid page
      navigate(getRoute(ROUTES_FLAT.FINANCE_EXPENSES_PAID, { projectId }));
    } catch (error) {
      console.error("Error creating payment entry:", error);
      const errorMessage = error?.response?.data?.message || error?.message || t("paymentEntryCreateError", { defaultValue: "Failed to create payment entry" });
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVendorAdd = async (vendorData) => {
    // vendorData comes from AddVendorModal's onSave callback
    // It contains: { name, countryCode, contactNumber }
    const vendorName = vendorData.name || vendorData;
    const phoneNumber = vendorData.contactNumber || '';

    // Check if workspace is available
    if (!selectedWorkspace) {
      showError(t("workspaceRequired", { defaultValue: "Workspace is required to create vendor" }));
      return;
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

      // If API call successful, refresh vendors list and select the new vendor
      // Refresh vendors list from API
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
        
        // Find the newly created vendor and set its ID
        const newVendor = vendorsList.find(
          (v) => (v.full_name || v.name || v.fullName) === vendorName
        );
        if (newVendor?.id) {
          handleChange("paidTo", String(newVendor.id));
        } else {
          handleChange("paidTo", vendorName);
        }
      } catch (fetchError) {
        // If refresh fails, just add to local state
        if (!vendors.includes(vendorName)) {
          setVendors([...vendors, vendorName]);
        }
        handleChange("paidTo", vendorName);
      }
      showSuccess(t("vendorCreated", { defaultValue: "Vendor created successfully" }));
    } catch (error) {
      console.error("Error creating vendor:", error);
      const errorMessage = error?.response?.data?.message || error?.message || t("vendorCreateError", { defaultValue: "Failed to create vendor" });
      showError(errorMessage);
    }
  };

  const handleCategoryAdd = async (categoryData) => {
    // categoryData comes from AddCategoryModal's onSave callback
    const categoryName = categoryData.name || categoryData;
    
    // Check if workspace is available
    if (!selectedWorkspace) {
      showError(t("workspaceRequired", { defaultValue: "Workspace is required to create category" }));
      return;
    }

    try {
      // Call API to create category
      const response = await createCategory({
        name: categoryName,
        workspace_id: selectedWorkspace,
        categoryId: "",
      });

      // If API call successful, refresh categories list from API
      try {
        const categoriesResponse = await getCategories(selectedWorkspace);
        const categoriesList = categoriesResponse?.data || categoriesResponse?.categories || categoriesResponse || [];
        const categoriesArray = Array.isArray(categoriesList) ? categoriesList : [];
        
        // Store full category objects with IDs
        setCategoriesData(categoriesArray);
        
        // Extract category names from the response
        const categoryNames = categoriesArray.map((category) => 
          category.name || category.category_name || String(category)
        ).filter(Boolean);
        
        setCategories(categoryNames);
        
        // Find the newly created category and set its name
        const newCategory = categoriesArray.find(
          (c) => (c.name || c.category_name) === categoryName
        );
        if (newCategory) {
          handleChange("category", categoryName);
        } else {
          handleChange("category", categoryName);
        }
      } catch (fetchError) {
        // If refresh fails, just add to local state
        if (!categories.includes(categoryName)) {
          setCategories([...categories, categoryName]);
        }
        handleChange("category", categoryName);
      }
      
      showSuccess(t("categoryCreated", { defaultValue: "Category created successfully" }));
    } catch (error) {
      console.error("Error creating category:", error);
      const errorMessage = error?.response?.data?.message || error?.message || t("categoryCreateError", { defaultValue: "Failed to create category" });
      showError(errorMessage);
    }
  };

  const handlePaymentModeAdd = async (modeData) => {
    // modeData comes from AddPaymentModeModal's onSave callback
    const modeName = modeData.name || modeData;
    const modeValue = modeName.toLowerCase().replace(/\s+/g, "_");

    // Check if mode already exists
    const exists = paymentModes.some(
      (m) =>
        m.value === modeValue ||
        m.label.toLowerCase() === modeName.toLowerCase()
    );
    if (!exists) {
      const newMode = { value: modeValue, label: modeName };
      setPaymentModes([...paymentModes, newMode]);
    }
    handleChange("mode", modeValue);
    // Clear bank name when mode changes
    handleChange("bankName", "");
  };

  const handleBankAdd = async (bankData) => {
    // bankData comes from AddItemModal's onSave callback (just a string)
    const bankName = typeof bankData === 'string' ? bankData : (bankData?.name || bankData?.label || bankData);

    // Check if projectId is available
    if (!projectId) {
      showError(t("projectRequired", { defaultValue: "Project ID is required to create bank" }));
      return;
    }

    try {
      // Call API to create bank
      await createBank({
        name: bankName,
        projectId: projectId,
      });

      // If API call successful, refresh banks list
      try {
        const response = await getBanks(projectId);
        
        // Handle different response structures
        let banksList = [];
        
        if (Array.isArray(response)) {
          banksList = response;
        } else if (Array.isArray(response?.data)) {
          banksList = response.data;
        } else if (Array.isArray(response?.banks)) {
          banksList = response.banks;
        } else if (response?.data && typeof response.data === 'object') {
          banksList = Array.isArray(response.data.data) 
            ? response.data.data 
            : Object.values(response.data).filter(Array.isArray)[0] || [];
        }
        
        const bankNames = banksList.map((bank) => {
          if (typeof bank === 'string') return bank;
          return bank.name || bank.bank_name || bank.bankName || String(bank);
        }).filter(Boolean);
        
        setBanks(bankNames);
      } catch (fetchError) {
        console.error("Error refreshing banks:", fetchError);
        // If refresh fails, just add to local state
        if (!banks.includes(bankName)) {
          setBanks([...banks, bankName]);
        }
      }
      
      handleChange("bankName", bankName);
      showSuccess(t("bankCreated", { defaultValue: "Bank created successfully" }));
    } catch (error) {
      console.error("Error creating bank:", error);
      const errorMessage = error?.response?.data?.message || error?.message || t("bankCreateError", { defaultValue: "Failed to create bank" });
      showError(errorMessage);
    }
  };

  // Create vendor options using IDs as values to prevent duplicate key issues
  const vendorOptions = vendorsData.map((vendor, index) => {
    const vendorName = vendor.full_name || vendor.name || vendor.fullName || vendors[index] || `Vendor ${index}`;
    const vendorId = vendor.id || vendor.user_id || `${vendorName}-${index}`; // Use index as fallback for unique key
    return {
      value: vendorId, // Use ID as value
      label: vendorName, // Display name as label
      vendorName: vendorName, // Keep name for reference
    };
  });

  // Create category options using names as values
  const categoryOptions = categories.map((c) => ({
    value: c,
    label: c,
  }));

  const paymentModeOptions = paymentModes.map((m) => ({
    value: typeof m === "string" ? m : m.value || m,
    label: typeof m === "object" ? m.label : t(m, { defaultValue: m }),
  }));

  const bankOptions = banks.map((bank) => ({
    value: bank,
    label: bank,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={t("createPaymentEntry", {
          defaultValue: "Create Payment Entry",
        })}
        onBack={() =>
          navigate(getRoute(ROUTES_FLAT.FINANCE_EXPENSES_PAID, { projectId }))
        }
      />

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Paid Date */}
            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                {t("paidDate", { defaultValue: "Paid Date" })} <span>*</span>
              </label>
              <DatePicker
                value={formData.paidDate}
                onChange={(date) => handleChange("paidDate", date)}
                error={errors.paidDate}
              />
            </div>

            {/* Paid By */}
            <Input
              label={t("paidBy", { defaultValue: "Paid By" })}
              placeholder={t("enterPaidBy", { defaultValue: "Enter paid by" })}
              value={formData.paidBy}
              onChange={(e) => handleChange("paidBy", e.target.value)}
            />

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t("amount", { defaultValue: "Amount" })} <span>*</span>
              </label>
              <Input
                placeholder="₹.00"
                value={formData.amount}
                error={errors.amount}
                onChange={(e) =>
                  handleChange("amount", e.target.value.replace(/[^\d.]/g, ""))
                }
              />
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Paid To */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t("paidTo", { defaultValue: "Paid To" })} <span>*</span>
              </label>
              <Dropdown
                value={formData.paidTo}
                options={vendorOptions}
                placeholder={t("enterOrSelectName", {
                  defaultValue: "Enter or select name",
                })}
                error={errors.paidTo}
                onChange={(value) => handleChange("paidTo", value)}
                searchable
                searchPlaceholder={t("searchVendor", {
                  defaultValue: "Search vendor",
                })}
                showSeparator={true}
                onAddNew={handleVendorAdd}
                addButtonLabel={t("addNewVendor", {
                  defaultValue: "Add New Vendor",
                })}
                customModal={AddVendorModal}
              />
            </div>

            {/* Categories for Payment */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t("categoriesForPayment", {
                  defaultValue: "Categories for Payment",
                })}{" "}
                <span>*</span>
              </label>
              <Dropdown
                value={formData.category}
                options={categoryOptions}
                placeholder={t("selectCategory", {
                  defaultValue: "Select category",
                })}
                error={errors.category}
                onChange={(value) => handleChange("category", value)}
                showSeparator={true}
                onAddNew={handleCategoryAdd}
                addButtonLabel={t("addNewCategory", {
                  defaultValue: "Add New Category",
                })}
                customModal={AddCategoryModal}
              />
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t("mode", { defaultValue: "Mode" })}{" "}
                <span>*</span>
              </label>
              <Dropdown
                value={formData.mode}
                options={paymentModeOptions}
                placeholder={t("selectMode", { defaultValue: "Select Mode" })}
                error={errors.mode}
                onChange={(value) => {
                  handleChange("mode", value);
                  handleChange("bankName", "");
                }}
                showSeparator={true}
                onAddNew={handlePaymentModeAdd}
                addButtonLabel={t("addNew", { defaultValue: "Add New" })}
                customModal={AddPaymentModeModal}
              />
            </div>

          </div>
        </div>

        {/* Bank Name (Cheque / Bank Transfer / UPI) - Full Width */}
        {(formData.mode === "cheque" ||
          formData.mode === "bank_transfer" ||
          formData.mode === "upi") && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-primary mb-2">
              {t("bankName", { defaultValue: "Bank Name" })}{" "}
              <span>*</span>
            </label>
            <Dropdown
              value={formData.bankName}
              options={bankOptions}
              placeholder={t("selectBank", {
                defaultValue: "Select Bank",
              })}
              error={errors.bankName}
              onChange={(value) => handleChange("bankName", value)}
              showSeparator={true}
              onAddNew={handleBankAdd}
              addButtonLabel={t("addNewBank", {
                defaultValue: "Add New Bank",
              })}
              customModal={AddItemModal}
            />
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2 ">
            {t("description", { defaultValue: "Description" })}
          </label>
          <Textarea
            placeholder={t("writeDescription", {
              defaultValue: "Write description",
            })}
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        {/* Payment Proof */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-primary mb-2">
            {t("paymentProof", { defaultValue: "Payment Proof" })}
          </label>
          
          {/* Upload Area */}
          <div className="mb-6">
            <FileUpload
              title={t("uploadPaymentProof", {
                defaultValue: "Upload Payment Proof",
              })}
              supportedFormats="PDF, JPG, PNG, MP4"
              maxSize={10}
              maxSizeUnit="MB"
              onFileSelect={handleFileSelect}
              uploadButtonText={t("upload", { defaultValue: "Upload" })}
              supportedFormatLabel={t("supportedFormat", {
                defaultValue: "Supported Format:",
              })}
              accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov,.avi"
            />
          </div>

          {/* Tabs and File Display */}
          {(uploadedFiles.photos.length > 0 ||
            uploadedFiles.videos.length > 0 ||
            uploadedFiles.documents.length > 0) && (
            <div>
              {/* Tabs */}
              <div className="flex gap-6 border-b border-gray-200 mb-4">
                {[
                  { id: "photos", label: t("photos", { defaultValue: "Photos" }) },
                  { id: "videos", label: t("videos", { defaultValue: "Videos" }) },
                  { id: "documents", label: t("documents", { defaultValue: "Documents" }) },
                ].map((tab) => {
                  const fileCount =
                    uploadedFiles[tab.id]?.length || 0;
                  if (fileCount === 0) return null;
                  
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? "text-accent border-b-2 border-accent"
                          : "text-secondary hover:text-primary"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Files Display */}
              <div className="mt-4">
                {/* Photos Tab */}
                {activeTab === "photos" && uploadedFiles.photos.length > 0 && (
                  <div>
                    {/* Group by date */}
                    {Object.entries(
                      uploadedFiles.photos.reduce((acc, file) => {
                        const date = file.uploadDate || "Today";
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(file);
                        return acc;
                      }, {})
                    ).map(([date, files]) => (
                      <div key={date} className="mb-6">
                        <p className="text-sm font-medium text-secondary mb-3">
                          {date}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {files.map((file) => (
                            <div
                              key={file.id}
                              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                            >
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover"
                                onClick={() => window.open(file.url, "_blank")}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id, "photos")}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center cursor-pointer"
                              >
                                <X className="w-4 h-4 cursor-pointer" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Videos Tab */}
                {activeTab === "videos" && uploadedFiles.videos.length > 0 && (
                  <div>
                    {Object.entries(
                      uploadedFiles.videos.reduce((acc, file) => {
                        const date = file.uploadDate || "Today";
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(file);
                        return acc;
                      }, {})
                    ).map(([date, files]) => (
                      <div key={date} className="mb-6">
                        <p className="text-sm font-medium text-secondary mb-3">
                          {date}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {files.map((file) => (
                            <div
                              key={file.id}
                              className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200"
                            >
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => window.open(file.url, "_blank")}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                  <Play
                                    className="w-5 h-5 text-primary ml-0.5 cursor-pointer"
                                    fill="currentColor"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id, "videos")}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center"
                              >
                                <X className="w-4 h-4 cursor-pointer" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === "documents" &&
                  uploadedFiles.documents.length > 0 && (
                    <div>
                      {Object.entries(
                        uploadedFiles.documents.reduce((acc, file) => {
                          const date = file.uploadDate || "Today";
                          if (!acc[date]) acc[date] = [];
                          acc[date].push(file);
                          return acc;
                        }, {})
                      ).map(([date, files]) => (
                        <div key={date} className="mb-6">
                          <p className="text-sm font-medium text-secondary mb-3">
                            {date}
                          </p>
                          <div className="space-y-3">
                            {files.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50 "
                              >
                                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5 text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-primary truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-secondary">
                                    {file.size}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveFile(file.id, "documents")
                                  }
                                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                getRoute(ROUTES_FLAT.FINANCE_EXPENSES_PAID, { projectId })
              )
            }
            className="w-full sm:w-auto"
          >
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("creating", { defaultValue: "Creating..." }) : t("create", { defaultValue: "Create" })}
          </Button>
        </div>
      </div>
    </div>
  );
}
