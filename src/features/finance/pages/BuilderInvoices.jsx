/**
 * Builder Invoices Page
 * Static page for builder invoices
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES_FLAT, getRoute } from "../../../constants/routes";
import PageHeader from "../../../components/layout/PageHeader";
import Button from "../../../components/ui/Button";
import SearchBar from "../../../components/ui/SearchBar";
import DropdownMenu from "../../../components/ui/DropdownMenu";
import CreateSectionModal from "../../../components/ui/CreateSectionModal";
import UpdateBudgetModal from "../../../components/ui/UpdateBudgetModal";
import EditSectionModal from "../../../components/ui/EditSectionModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";
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

  // State management
  const [budget, setBudget] = useState("1.2 Cr");
  const [sections, setSections] = useState([
    { id: "1", name: "Basement" },
    { id: "2", name: "Ground Floor" },
    { id: "3", name: "Building A" },
    { id: "4", name: "Building B" },
    { id: "5", name: "Building C" },
    { id: "6", name: "Building D" },
    { id: "7", name: "Main Office" },
    { id: "8", name: "Garden Area" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateSectionModalOpen, setIsCreateSectionModalOpen] =
    useState(false);
  const [isUpdateBudgetModalOpen, setIsUpdateBudgetModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] =
    useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);
  const [sectionToDelete, setSectionToDelete] = useState(null);

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
  const handleCreateSection = (sectionName) => {
    const newSection = {
      id: Date.now().toString(),
      name: sectionName,
    };
    setSections([...sections, newSection]);
  };

  // Handle update budget
  const handleUpdateBudget = (amount) => {
    // Format amount - if it's a number, convert to Cr/Lakh format
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

  // Handle edit section
  const handleEditSection = (sectionName) => {
    if (sectionToEdit) {
      setSections(
        sections.map((section) =>
          section.id === sectionToEdit.id
            ? { ...section, name: sectionName }
            : section
        )
      );
      setSectionToEdit(null);
    }
  };

  // Handle delete section
  const handleDeleteSection = () => {
    if (sectionToDelete) {
      setSections(
        sections.filter((section) => section.id !== sectionToDelete.id)
      );
      setSectionToDelete(null);
      setIsDeleteSectionModalOpen(false);
    }
  };

  // Handle section click - navigate to section detail
  const handleSectionClick = (section) => {
    navigate(
      `/finance/projects/${projectId}/builder-invoices/sections/${section.id}`,
      {
        state: { sectionName: section.name },
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
          navigate(getRoute(ROUTES_FLAT.FINANCE_PROJECT_DETAILS, { projectId }))
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

      {/* Project Sections */}
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-primary">
          {t("projectSections", { defaultValue: "Project Sections" })}
        </h2>
      </div>

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

      {/* Modals */}
      <CreateSectionModal
        isOpen={isCreateSectionModalOpen}
        onClose={() => setIsCreateSectionModalOpen(false)}
        onCreate={handleCreateSection}
      />

      <UpdateBudgetModal
        isOpen={isUpdateBudgetModalOpen}
        onClose={() => setIsUpdateBudgetModalOpen(false)}
        onUpdate={handleUpdateBudget}
        currentBudget={budget}
      />

      <EditSectionModal
        isOpen={isEditSectionModalOpen}
        onClose={() => {
          setIsEditSectionModalOpen(false);
          setSectionToEdit(null);
        }}
        onSave={handleEditSection}
        currentSectionName={sectionToEdit?.name || ""}
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
      />
    </div>
  );
}
