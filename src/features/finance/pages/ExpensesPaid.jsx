/**
 * Expenses Paid Page
 * Shows payment entries with expand/collapse, create, edit, filter, and download functionality
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES_FLAT, getRoute } from "../../../constants/routes";
import PageHeader from "../../../components/layout/PageHeader";
import SearchBar from "../../../components/ui/SearchBar";
import Button from "../../../components/ui/Button";
import DropdownMenu from "../../../components/ui/DropdownMenu";
import FilterPaidModal from "../../../components/ui/FilterPaidModal";
import CustomDateRangeModal from "../../../components/ui/CustomDateRangeModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import paidIcon from "../../../assets/icons/paidred.svg";
import paidViaBankIcon from "../../../assets/icons/Paidviabank.svg";
import paidViaCashIcon from "../../../assets/icons/paidviacash.svg";
import pendingRedIcon from "../../../assets/icons/Pendingred.svg";
import emptyStateIcon from "../../../assets/icons/EmptyState.svg";
import downloadIcon from "../../../assets/icons/Download Minimalistic.svg";
import sortVerticalIcon from "../../../assets/icons/Sort Vertical.svg";
import pdfIcon from "../../../assets/icons/Download Minimalistic.svg";
import pencilIcon from "../../../assets/icons/pen.svg";
import trashIcon from "../../../assets/icons/Trash.svg";
import { Plus, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";

export default function ExpensesPaid() {
  const { t } = useTranslation("finance");
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const downloadMenuRef = useRef(null);

  // Static data
  const [vendors, setVendors] = useState([
    "Arvind Sharma",
    "Bipin Shah",
    "Shantilal Patel",
    "Rohan Sharma",
    "Anurag Shah",
    "Ganesh Traders",
    "Vishal Steel Works",
  ]);

  const [categories, setCategories] = useState([
    "Labour",
    "Centring",
    "Cement",
    "Steel",
    "Materials",
  ]);

  const [modules, setModules] = useState(["Module 1", "Module 2", "Module 3"]);

  const paymentModes = [
    { value: "cash", label: t("cash", { defaultValue: "Cash" }) },
    { value: "cheque", label: t("cheque", { defaultValue: "Cheque" }) },
    {
      value: "bank_transfer",
      label: t("bankTransfer", { defaultValue: "Bank Transfer" }),
    },
    { value: "upi", label: t("upi", { defaultValue: "UPI" }) },
    { value: "other", label: t("other", { defaultValue: "Other" }) },
  ];

  const paidByOptions = ["Mahesh (Site Manager)", "Anurag Sharma", "Admin"];

  // Static payment entries data
  const [paymentEntries, setPaymentEntries] = useState([
    {
      id: "1",
      vendorName: "Ganesh Traders",
      amount: "₹1,20,000",
      amountValue: 120000,
      paidDate: "12 May 2025",
      description: "Cement & Gravel Purchase",
      paidBy: "Mahesh (Site Manager)",
      paidVia: "Bank Transfer",
      mode: "bank_transfer",
      category: "Materials",
    },
    {
      id: "2",
      vendorName: "Vishal Steel Works",
      amount: "₹1,20,000",
      amountValue: 120000,
      paidDate: "10 May 2025",
      description: "Steel rods and bars",
      paidBy: "Anurag Sharma",
      paidVia: "Cash",
      mode: "cash",
      category: "Steel",
    },
    {
      id: "3",
      vendorName: "Ganesh Traders",
      amount: "₹1,20,000",
      amountValue: 120000,
      paidDate: "08 May 2025",
      description: "Construction materials",
      paidBy: "Mahesh (Site Manager)",
      paidVia: "Bank Transfer",
      mode: "bank_transfer",
      category: "Materials",
    },
    {
      id: "4",
      vendorName: "Vishal Steel Works",
      amount: "₹1,20,000",
      amountValue: 120000,
      paidDate: "05 May 2025",
      description: "Steel supplies",
      paidBy: "Admin",
      paidVia: "UPI",
      mode: "upi",
      category: "Steel",
    },
    {
      id: "5",
      vendorName: "Ganesh Traders",
      amount: "₹1,20,000",
      amountValue: 120000,
      paidDate: "01 May 2025",
      description: "Raw materials",
      paidBy: "Mahesh (Site Manager)",
      paidVia: "Cash",
      mode: "cash",
      category: "Materials",
    },
  ]);

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
  const handleDeletePaymentEntry = () => {
    if (entryToDelete) {
      setPaymentEntries(
        paymentEntries.filter((entry) => entry.id !== entryToDelete.id)
      );
      setEntryToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Handle add vendor
  const handleAddVendor = (vendorData) => {
    if (!vendors.includes(vendorData.name)) {
      setVendors([...vendors, vendorData.name]);
    }
    return Promise.resolve();
  };

  // Handle add category
  const handleAddCategory = (categoryData) => {
    if (!categories.includes(categoryData.name)) {
      setCategories([...categories, categoryData.name]);
    }
    return Promise.resolve();
  };

  // Handle filter apply
  const handleFilterApply = (filterData) => {
    setFilters(filterData);
  };

  // Handle filter reset
  const handleFilterReset = () => {
    setFilters({});
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

          {/* Download and Create (only show when data exists) */}
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
      {filteredEntries.length > 0 ? (
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
      <FilterPaidModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
        initialFilters={filters}
        vendors={vendors}
        categories={categories}
        modules={modules}
        paymentModes={paymentModes}
        onAddVendor={handleAddVendor}
        onAddCategory={handleAddCategory}
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
