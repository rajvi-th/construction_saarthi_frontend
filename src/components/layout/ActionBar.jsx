/**
 * ActionBar Component
 * Reusable action bar with search, sort, and action button
 */

import { useTranslation } from "react-i18next";
import { ArrowUpDown } from "lucide-react";
import SearchBar from "../ui/SearchBar";
import Button from "../ui/Button";

export default function ActionBar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  sortByLabel,
  showSort = true,
  actionButtonLabel,
  onActionClick,
  actionButtonIcon = "Plus",
  actionButtonVariant = "primary",
  className = "",
}) {
  const { t } = useTranslation("common");

  // Use translations if not provided, otherwise use provided values
  const finalSearchPlaceholder =
    searchPlaceholder || t("search", { defaultValue: "Search" });
  const finalSortByLabel =
    sortByLabel || t("sortBy", { defaultValue: "Sort By" });
  return (
    <div className={`flex flex-col md:flex-row gap-3 md:gap-4 ${className}`}>
      {/* Search */}
      <SearchBar
        placeholder={finalSearchPlaceholder}
        value={searchValue}
        onChange={onSearchChange}
        className="w-full md:flex-none md:w-[260px]"
      />

      {/* Sort By */}
      {showSort && sortBy && onSortChange && (
        <button
          onClick={onSortChange}
          className="w-full md:w-auto px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-primary hover:bg-gray-50 transition-colors flex items-center justify-center md:justify-start gap-2 cursor-pointer whitespace-nowrap"
        >
          <ArrowUpDown className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="text-sm md:text-base">
            {finalSortByLabel}
            {sortOrder && (
              <span className="ml-2 text-xs text-primary-light">
                {sortOrder === "asc" ? "" : ""}
              </span>
            )}
          </span>
        </button>
      )}

      {/* Action Button */}
      {actionButtonLabel && onActionClick && (
        <Button
          onClick={onActionClick}
          variant={actionButtonVariant}
          leftIconName={actionButtonIcon}
          className="w-full md:w-auto px-3 md:px-4 py-2.5 whitespace-nowrap text-sm md:text-base"
          iconSize="w-4 h-4"
        >
          {actionButtonLabel}
        </Button>
      )}
    </div>
  );
}
