/**
 * Payment Received Page
 * Static page for payment received entries with all features
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES_FLAT, getRoute } from "../../../constants/routes";
import PageHeader from "../../../components/layout/PageHeader";
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
import downloadIcon from "../../../assets/icons/Download Minimalistic.svg";
import pdfIcon from "../../../assets/icons/Download Minimalistic.svg";
import pencilIcon from "../../../assets/icons/pen.svg";
import trashIcon from "../../../assets/icons/Trash.svg";
import sortVerticalIcon from "../../../assets/icons/Sort Vertical.svg";
import emptyStateIcon from "../../../assets/icons/EmptyState.svg";
import { Plus, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";

export default function PaymentReceived() {
  const { t } = useTranslation("finance");
  const navigate = useNavigate();
  const { projectId } = useParams();

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
  const [banks, setBanks] = useState([
    "Bank of Baroda",
    "Bank of India",
    "Central Bank of India",
    "Bank of Maharashtra",
    "Indian Bank",
  ]);
  const [filters, setFilters] = useState({});
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef(null);

  // Static payment entries data
  const [paymentEntries, setPaymentEntries] = useState([
    {
      id: "1",
      name: "Maruti Enterprise",
      amount: "₹7,50,000",
      paymentNo: "RCPT-023",
      date: "10 May 2025",
      description: "2nd Slab Completion",
      to: "Shiv Developers",
      mode: "Bank Transfer",
      from: "Shree Builders",
      bankName: "Bank of India",
    },
    {
      id: "2",
      name: "Mr. Anil Shah",
      amount: "₹7,50,000",
      paymentNo: "RCPT-022",
      date: "8 May 2025",
      description: "1st Slab Completion",
      to: "Shiv Developers",
      mode: "Cash",
      from: "Shree Builders",
    },
    {
      id: "3",
      name: "Shree Electricals",
      amount: "₹7,50,000",
      paymentNo: "RCPT-021",
      date: "5 May 2025",
      description: "Electrical Work",
      to: "Shiv Developers",
      mode: "Cheque",
      from: "Shree Builders",
      bankName: "Bank of Baroda",
    },
    {
      id: "4",
      name: "Mr. Anil Shah",
      amount: "₹7,50,000",
      paymentNo: "RCPT-020",
      date: "3 May 2025",
      description: "Foundation Work",
      to: "Shiv Developers",
      mode: "UPI",
      from: "Shree Builders",
    },
    {
      id: "5",
      name: "Maruti Enterprise",
      amount: "₹7,50,000",
      paymentNo: "RCPT-019",
      date: "1 May 2025",
      description: "Plumbing Work",
      to: "Shiv Developers",
      mode: "Bank Transfer",
      from: "Shree Builders",
      bankName: "Central Bank of India",
    },
    {
      id: "6",
      name: "Shree Electricals",
      amount: "₹7,50,000",
      paymentNo: "RCPT-018",
      date: "28 Apr 2025",
      description: "Painting Work",
      to: "Shiv Developers",
      mode: "Cheque",
      from: "Shree Builders",
      bankName: "Bank of Maharashtra",
    },
  ]);

  // Static summary data
  const summaryData = [
    {
      icon: paymentIcon,
      label: t("totalAmountReceived", {
        defaultValue: "Total Amount Received",
      }),
      amount: "₹45,00,000",
      color: "red",
    },
    {
      icon: amountReceivableIcon,
      label: t("totalAmountReceivable", {
        defaultValue: "Total Amount Receivable",
      }),
      amount: "₹60,00,000",
      color: "red",
    },
    {
      icon: pendingIcon,
      label: t("pendingToReceive", { defaultValue: "Pending to Receive" }),
      amount: "₹15,00,000",
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
  const handleCreatePaymentEntry = (formData) => {
    const newEntry = {
      id: Date.now().toString(),
      name: formData.from,
      amount: `₹${parseFloat(formData.amount).toLocaleString("en-IN")}`,
      paymentNo: formData.paymentNo,
      date: new Date(formData.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      description: formData.description,
      to: formData.to,
      mode: formData.mode
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      from: formData.from,
      bankName: formData.bankName,
    };
    setPaymentEntries([newEntry, ...paymentEntries]);
  };

  // Handle edit payment entry
  const handleEditPaymentEntry = (formData) => {
    if (!selectedEntry) return;

    const updatedEntry = {
      ...selectedEntry,
      name: formData.from,
      amount: `₹${parseFloat(
        formData.amount.replace(/[^\d.]/g, "")
      ).toLocaleString("en-IN")}`,
      paymentNo: formData.paymentNo,
      date: new Date(formData.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      description: formData.description,
      to: formData.to,
      mode: formData.mode
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      from: formData.from,
      bankName: formData.bankName,
    };

    setPaymentEntries(
      paymentEntries.map((entry) =>
        entry.id === selectedEntry.id ? updatedEntry : entry
      )
    );
    setSelectedEntry(null);
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

  // Handle add bank
  const handleAddBank = (bankName) => {
    if (!banks.includes(bankName)) {
      setBanks([...banks, bankName]);
    }
  };

  // Handle filter apply
  const handleFilterApply = (filterData) => {
    setFilters(filterData);
    // In a real app, you would filter the entries here
  };

  // Handle filter reset
  const handleFilterReset = () => {
    setFilters({});
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
          navigate(getRoute(ROUTES_FLAT.FINANCE_PROJECT_DETAILS, { projectId }))
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
