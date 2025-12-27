/**
 * Vendors Page
 * Displays list of vendors
 * Based on the UI design with expandable cards, search, and actions
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Building,
  Phone,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import PageHeader from "../../../components/layout/PageHeader";
import SearchBar from "../../../components/ui/SearchBar";
import Loader from "../../../components/ui/Loader";
import DropdownMenu from "../../../components/ui/DropdownMenu";
import EmptyState from "../../../components/shared/EmptyState";
import RemoveMemberModal from "../../../components/ui/RemoveMemberModal";
import { useAuth } from "../../../hooks/useAuth";
import { useVendors } from "../hooks";
import { ROUTES_FLAT } from "../../../constants/routes";
import addCircleIcon from "../../../assets/icons/Add Circle.svg";

export default function Vendors() {
  const { t } = useTranslation("builderClient"); // Reuse builderClient translations
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();
  const { getVendors, isLoading, deleteVendor } = useVendors();
  const [allItems, setAllItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch vendors
  useEffect(() => {
    if (!selectedWorkspace) return;

    const fetchData = async () => {
      try {
        const data = await getVendors(selectedWorkspace);
        setAllItems(data || []);
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      }
    };

    fetchData();
  }, [getVendors, selectedWorkspace]);

  // Filter list based on search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return allItems;

    const query = searchQuery.toLowerCase();
    return allItems.filter((item) => {
      const name = (item.name || item.full_name || "").toLowerCase();
      const company = (
        item.company_Name ||
        item.company_name ||
        item.company ||
        ""
      ).toLowerCase();
      const phone = (item.phone_number || item.phone || "").toLowerCase();

      return (
        name.includes(query) || company.includes(query) || phone.includes(query)
      );
    });
  }, [allItems, searchQuery]);

  const handleToggle = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleAdd = () => {
    navigate(ROUTES_FLAT.ADD_VENDOR);
  };

  const handleEdit = (item) => {
    const itemId = item.id || item._id;
    if (itemId) {
      navigate(ROUTES_FLAT.EDIT_VENDOR.replace(":id", itemId));
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await deleteVendor(itemToDelete.id || itemToDelete._id);
      if (selectedWorkspace) {
        // Re-fetch vendors
        const data = await getVendors(selectedWorkspace);
        setAllItems(data || []);
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get avatar URL or return null
  const getAvatarUrl = (item) => {
    return item.profile_photo || item.avatar || item.profilePhoto || null;
  };

  // Render list item card
  const renderItemCard = (item) => {
    const isExpanded = expandedId === (item.id || item._id);
    const itemId = item.id || item._id;
    const itemName = item.name || item.full_name || "Unknown";
    const companyName =
      item.company_Name || item.company_name || item.company || "";
    const phoneNumber = item.phone_number || item.phone || "";
    const address = item.address || "";
    const avatarUrl = getAvatarUrl(item);

    const menuItems = [
      {
        label: t("menu.edit", { defaultValue: "Edit" }),
        icon: <Edit className="w-4 h-4" />,
        onClick: () => handleEdit(item),
      },
      {
        label: t("menu.delete", { defaultValue: "Delete" }),
        icon: <Trash2 className="w-4 h-4 text-accent" />,
        onClick: () => handleDelete(item),
        textColor: "text-accent",
      },
    ];

    return (
      <div
        key={itemId}
        className="bg-white rounded-2xl border border-[#ECEFF3] shadow-[0_1px_3px_rgba(15,23,42,0.06)] px-4 py-3.5 md:px-5 md:py-4"
      >
        {/* Main Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Avatar and Name */}
          <div
            className="flex items-center gap-3 md:gap-4 min-w-0 flex-1 cursor-pointer"
            onClick={() => handleToggle(itemId)}
          >
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={itemName}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-sm md:text-base font-medium text-primary flex-shrink-0">
                {getInitials(itemName)}
              </div>
            )}

            {/* Name */}
            <div className="min-w-0 flex-1">
              <p className="text-sm md:text-base font-medium text-primary truncate">
                {itemName}
              </p>
            </div>
          </div>

          {/* Right: Chevron and Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Chevron */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(itemId);
              }}
              className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary transition-colors cursor-pointer"
              aria-label={
                isExpanded
                  ? t("collapse", { defaultValue: "Collapse" })
                  : t("expand", { defaultValue: "Expand" })
              }
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 text-accent ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Three Dots Menu */}
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu items={menuItems} position="right" />
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded &&
          (() => {
            const details = [
              { value: companyName, icon: Building, iconColor: "text-primary" },
              { value: phoneNumber, icon: Phone, iconColor: "text-primary" },
              { value: address, icon: MapPin, iconColor: "text-primary" },
            ].filter((detail) => detail.value);

            return (
              <div className="mt-3 pt-3 border-t border-black-soft space-y-2.5 md:space-y-3">
                {details.length > 0 ? (
                  details.map((detail, index) => {
                    const IconComponent = detail.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#4755690A] border border-[#4755690A] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <IconComponent
                            className={`w-4 h-4 ${detail.iconColor}`}
                          />
                        </div>
                        <p className="text-sm md:text-base text-primary pt-1.5">
                          {detail.value}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-secondary pl-12">
                    {t("noDetails", {
                      defaultValue: "No additional details available",
                    })}
                  </p>
                )}
              </div>
            );
          })()}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Search and Add Button */}
      <PageHeader
        title={t("pages.vendors.title", { defaultValue: "Manage Vendors" })}
        showBackButton={false}
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full lg:w-auto">
          <div className="flex-1 w-full sm:w-auto sm:flex-none">
            <SearchBar
              placeholder={t("searchVendorsPlaceholder", {
                defaultValue: "Search vendors",
              })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[260px]"
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center justify-center sm:justify-start gap-2 text-accent font-medium whitespace-normal sm:whitespace-nowrap flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity w-full sm:w-auto"
          >
            <img
              src={addCircleIcon}
              alt="Add"
              className="w-5 h-5 flex-shrink-0"
            />
            <span className="text-sm sm:text-base">
              {t("form.addVendor", { defaultValue: "Add Vendor" })}
            </span>
          </button>
        </div>
      </PageHeader>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" />
        </div>
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon="inbox"
          title={
            searchQuery
              ? t("emptyState.noResults", { defaultValue: "No Results Found" })
              : t("emptyState.noVendors", { defaultValue: "No Vendors" })
          }
          message={
            searchQuery
              ? t("emptyState.noResultsMessage", {
                  defaultValue:
                    "No vendors found matching your search. Try adjusting your search terms.",
                })
              : t("emptyState.noVendorsMessage", {
                  defaultValue:
                    "You haven't added any vendors yet. Add your first vendor to get started.",
                })
          }
          actionLabel={
            !searchQuery
              ? t("form.addVendor", { defaultValue: "Add Vendor" })
              : undefined
          }
          onAction={!searchQuery ? handleAdd : undefined}
          iconSize="lg"
          padding="default"
        />
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredList.map((item) => renderItemCard(item))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <RemoveMemberModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t("removeVendor.title", { defaultValue: "Remove Vendor" })}
        description={t("removeVendor.description", {
          defaultValue:
            "Are you sure you want to remove vendor? This action is irreversible, and your data cannot be recovered.",
        })}
        confirmText={t("removeVendor.confirm", { defaultValue: "Yes, Remove" })}
        cancelText={t("removeVendor.cancel", { defaultValue: "Cancel" })}
        isLoading={isDeleting}
      />
    </div>
  );
}
