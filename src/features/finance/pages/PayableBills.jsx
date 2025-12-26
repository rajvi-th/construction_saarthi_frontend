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
import totalPayablesIcon from "../../../assets/icons/pendingg.svg";
import paidAmountIcon from "../../../assets/icons/paidred.svg";
import pendingAmountIcon from "../../../assets/icons/Pendingred.svg";
import downloadIcon from "../../../assets/icons/Download Minimalistic.svg";
import sortVerticalIcon from "../../../assets/icons/Sort Vertical.svg";
import pdfIcon from "../../../assets/icons/Download Minimalistic.svg";
import pencilIcon from "../../../assets/icons/pen.svg";
import trashIcon from "../../../assets/icons/Trash.svg";
import emptyStateIcon from "../../../assets/icons/EmptyState.svg";
import { Plus, ChevronDown, ChevronUp, MoreVertical } from "lucide-react";

export default function PayableBills() {
  const { t } = useTranslation("finance");
  const navigate = useNavigate();
  const { projectId, sectionId } = useParams();
  const location = useLocation();

  // Get section name from navigation state or default
  const [sectionName, setSectionName] = useState(location.state?.sectionName || "Section");

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
  const [vendors, setVendors] = useState([
    "Ramesh Traders",
    "Hari Electricals",
    "Shree Cement Supplier",
    "Arvind Sharma",
    "Bipin Shah",
  ]);
  const [filters, setFilters] = useState({});
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef(null);

  // Static payable bills data
  const [payableBills, setPayableBills] = useState([
    {
      id: "1",
      billNo: "PYBL-101",
      title: "Plumbing materials for Building 1",
      vendorName: "Ramesh Traders",
      amount: "₹3,00,000",
      dueDate: "20 May 2025",
      date: "12 May 2025",
      status: "paid",
      description: "Plumbing materials for Building 1",
    },
    {
      id: "2",
      billNo: "PYBL-101",
      title: "Electrical wiring 1st & 2nd floor",
      vendorName: "Hari Electricals",
      amount: "₹2,00,000",
      dueDate: "15 May 2025",
      date: "12 May 2025",
      status: "pending",
      description: "Electrical wiring 1st & 2nd floor",
    },
    {
      id: "3",
      billNo: "PYBL-095",
      title: "Cement supply for slab work (Bldg 2)",
      vendorName: "Cement Supplier",
      amount: "₹7,50,000",
      dueDate: "10 May 2025",
      date: "01 May 2025",
      status: "pending",
      description: "Cement supply for slab work (Bldg 2)",
    },
  ]);

  // Static summary data
  const summaryData = [
    {
      icon: totalPayablesIcon,
      label: t("totalPayables", { defaultValue: "Total Payables" }),
      amount: "₹12,50,000",
    },
    {
      icon: paidAmountIcon,
      label: t("paidAmount", { defaultValue: "Paid Amount" }),
      amount: "₹5,00,000",
    },
    {
      icon: pendingAmountIcon,
      label: t("pendingAmount", { defaultValue: "Pending Amount" }),
      amount: "₹7,50,000",
    },
  ];

  // Handle edit section
  const handleEditSection = (newSectionName) => {
    setSectionName(newSectionName);
    setIsEditSectionModalOpen(false);
  };

  // Handle delete section
  const handleDeleteSection = () => {
    // Navigate back to expenses to pay page
    navigate(
      getRoute(ROUTES_FLAT.FINANCE_EXPENSES_TO_PAY, { projectId })
    );
    setIsDeleteSectionModalOpen(false);
  };

  // Handle create payable bill
  const handleCreatePayableBill = (formData) => {
    const newBill = {
      id: Date.now().toString(),
      billNo: `PYBL-${String(payableBills.length + 1).padStart(3, "0")}`,
      title: formData.title,
      vendorName: formData.vendorName,
      amount: `₹${parseFloat(formData.amount).toLocaleString("en-IN")}`,
      dueDate: new Date(formData.dueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      date: new Date(formData.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: formData.status,
      description: formData.description,
    };
    setPayableBills([newBill, ...payableBills]);
  };

  // Handle edit payable bill
  const handleEditPayableBill = (formData) => {
    if (!selectedBill) return;

    const updatedBill = {
      ...selectedBill,
      title: formData.title,
      vendorName: formData.vendorName,
      amount: `₹${parseFloat(
        formData.amount.replace(/[^\d.]/g, "")
      ).toLocaleString("en-IN")}`,
      dueDate: new Date(formData.dueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      date: new Date(formData.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: formData.status,
      description: formData.description,
    };

    setPayableBills(
      payableBills.map((bill) =>
        bill.id === selectedBill.id ? updatedBill : bill
      )
    );
    setSelectedBill(null);
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
  const handleDeletePayableBill = () => {
    if (billToDelete) {
      setPayableBills(
        payableBills.filter((bill) => bill.id !== billToDelete.id)
      );
      setBillToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Handle add vendor
  const handleAddVendor = (vendorName) => {
    if (!vendors.includes(vendorName)) {
      setVendors([...vendors, vendorName]);
    }
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
            getRoute(ROUTES_FLAT.FINANCE_EXPENSES_TO_PAY, { projectId })
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

              {/* 3 Dots Menu - Desktop only */}
              <div
                className="hidden lg:block lg:flex-none"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu
                  items={getSectionMenuItems()}
                  position="right"
                />
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
                  <div className="flex items-center gap-4 border-t border-gray-200 pt-2">
                    <div>
                      <div className="text-secondary mb-1 ">
                        {t("to", { defaultValue: "To" })}:
                      </div>
                      <div className="text-primary font-semibold">
                        {bill.vendorName}
                      </div>
                    </div>

                    <div className="pl-20">
                      <div className="text-secondary mb-1">
                        {t("amount", { defaultValue: "Amount" })}:
                      </div>
                      <div className="text-primary font-semibold">
                        {bill.amount}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-secondary mb-1">
                        {t("dueDate", { defaultValue: "Due Date" })}:
                      </div>
                      <div className="text-primary font-semibold">
                        {bill.dueDate}
                      </div>
                    </div>
                    <div className="flex-1 max-w-[200px] pl-25">
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
      />
    </div>
  );
}

