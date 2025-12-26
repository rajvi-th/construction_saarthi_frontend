/**
 * Section Detail Page
 * Shows invoices for a specific project section
 */

import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES_FLAT, getRoute } from "../../../constants/routes";
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
import downloadIcon from "../../../assets/icons/Download Minimalistic.svg";
import pencilIcon from "../../../assets/icons/Pen.svg";
import trashIcon from "../../../assets/icons/Trash.svg";
import { Plus } from "lucide-react";

export default function SectionDetail() {
  const { t } = useTranslation("finance");
  const navigate = useNavigate();
  const { projectId, sectionId } = useParams();
  const location = useLocation();

  // Get section name from navigation state or default
  const sectionName = location.state?.sectionName || "Section";

  // State management
  const [budget, setBudget] = useState("1.2 Cr");
  const [invoices, setInvoices] = useState([
    {
      id: "1",
      milestoneTitle: "Materials And Deliveries",
      percentage: "10",
      amount: "120000",
      status: "paid",
      description: "",
      document: "Final_Proposal.pdf",
    },
    {
      id: "2",
      milestoneTitle: "Labour Charges",
      percentage: "10",
      amount: "120000",
      status: "pending",
      description: "",
      document: null,
    },
    {
      id: "3",
      milestoneTitle: "Slab Materials and Bricks",
      percentage: "20",
      amount: "240000",
      status: "in progress",
      description: "",
      document: null,
    },
    {
      id: "4",
      milestoneTitle: "Materials And Deliveries",
      percentage: "10",
      amount: "120000",
      status: "paid",
      description: "",
      document: null,
    },
  ]);
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

  // Handle create invoice
  const handleCreateInvoice = (invoiceData) => {
    const newInvoice = {
      id: Date.now().toString(),
      milestoneTitle: invoiceData.milestoneTitle,
      percentage: invoiceData.percentage,
      amount: invoiceData.amount,
      status: invoiceData.status,
      description: invoiceData.description,
      document:
        invoiceData.files && invoiceData.files.length > 0
          ? invoiceData.files[0].name
          : null,
    };
    setInvoices([...invoices, newInvoice]);
    // Invoice data persists in state - will remain visible
  };

  // Handle edit invoice
  const handleEditInvoice = (updatedInvoiceData) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === updatedInvoiceData.id
          ? { ...invoice, ...updatedInvoiceData }
          : invoice
      )
    );
    setInvoiceToEdit(null);
  };

  // Handle delete invoice
  const handleDeleteInvoice = () => {
    if (invoiceToDelete) {
      setInvoices(
        invoices.filter((invoice) => invoice.id !== invoiceToDelete.id)
      );
      setInvoiceToDelete(null);
      setIsDeleteInvoiceModalOpen(false);
    }
  };

  // Handle download PDF
  const handleDownloadPDF = (invoice) => {
    // TODO: Implement PDF download functionality
    console.log("Download PDF for invoice:", invoice);
  };

  // Handle update budget
  const handleUpdateBudget = (amount) => {
    const numAmount = parseFloat(amount.replace(/,/g, ""));
    if (!isNaN(numAmount)) {
      if (numAmount >= 10000000) {
        setBudget(`${(numAmount / 10000000).toFixed(1)} Cr`);
      } else if (numAmount >= 100000) {
        setBudget(`${(numAmount / 100000).toFixed(1)} Lakh`);
      } else {
        setBudget(amount);
      }
    } else {
      setBudget(amount);
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
  const filteredInvoices = invoices.filter((invoice) =>
    invoice.milestoneTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle edit section
  const handleEditSection = (newSectionName) => {
    setCurrentSectionName(newSectionName);
  };

  // Handle delete section
  const handleDeleteSection = () => {
    // Navigate back to BuilderInvoices page
    navigate(getRoute(ROUTES_FLAT.FINANCE_BUILDER_INVOICES, { projectId }));
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
  const hasInvoices = invoices.length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={currentSectionName}
        onBack={() =>
          navigate(
            getRoute(ROUTES_FLAT.FINANCE_BUILDER_INVOICES, { projectId })
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
              <p className="text-lg font-medium text-primary truncate">
                {formatBudget(budget)}
              </p>
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

      {/* Invoices List or Empty State */}
      {filteredInvoices.length > 0 ? (
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white rounded-2xl  p-4 border border-gray-200 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-">
                <div className="flex-1">
                  {/* Status badge – width fit to content */}
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

                    {/* Divider */}
                    <span className="mx-3 h-4 w-px bg-gray-300" />

                    <span>
                      {t("amount", { defaultValue: "Amount" })}:{" "}
                      <span className="font-medium text-primary">
                        {formatAmount(invoice.amount)}
                      </span>
                    </span>
                  </div>

                  {invoice.document && (
                    <div className="flex items-center gap-2 mt-3 border-t border-gray-200 pt-3">
                      <img src={pdfIcon} alt="PDF" className="w-5 h-5" />
                      <span className="text-sm text-secondary">
                        {invoice.document}
                      </span>
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
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-[430px]">
            <img src={emptyStateIcon} alt="Empty State" className="w-full" />
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-primary">
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

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceModalOpen}
        onClose={() => setIsCreateInvoiceModalOpen(false)}
        onCreate={handleCreateInvoice}
      />

      <EditInvoiceModal
        isOpen={isEditInvoiceModalOpen}
        onClose={() => {
          setIsEditInvoiceModalOpen(false);
          setInvoiceToEdit(null);
        }}
        onUpdate={handleEditInvoice}
        invoice={invoiceToEdit}
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
      />

      <UpdateBudgetModal
        isOpen={isUpdateBudgetModalOpen}
        onClose={() => setIsUpdateBudgetModalOpen(false)}
        onUpdate={handleUpdateBudget}
        currentBudget={budget}
      />

      <EditSectionModal
        isOpen={isEditSectionModalOpen}
        onClose={() => setIsEditSectionModalOpen(false)}
        onSave={handleEditSection}
        currentSectionName={currentSectionName}
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
