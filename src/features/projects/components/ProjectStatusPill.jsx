import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import Dropdown from "../../../components/ui/Dropdown";
import { statusBadgeColors } from "../../../components/ui/StatusBadge";

export default function ProjectStatusPill({ status, onChange }) {
  const { t } = useTranslation("common");

  const statusOptions = [
    { value: "completed", label: t("completed", { defaultValue: "Completed" }) },
    { value: "in_progress", label: t("inProgress", { defaultValue: "In Progress" }) },
    { value: "upcoming", label: t("upcoming", { defaultValue: "Upcoming" }) },
    { value: "pending", label: t("pending", { defaultValue: "Pending" }) },
  ];

  const normalizedStatus = status?.toLowerCase?.() || "completed";

  // Helper to determine colors based on status
  const getStatusColors = (currentStatus) => {
    const s = currentStatus?.toLowerCase() || "completed";
    if (s === "completed") {
      return statusBadgeColors.green;
    } else if (
      s === "inprogress" ||
      s === "in_progress" ||
      s === "in_progress" ||
      s === "in progress"
    ) {
      return statusBadgeColors.yellow;
    } else if (s === "upcoming") {
      return statusBadgeColors.blue;
    } else if (s === "pending") {
      return statusBadgeColors.red;
    } else {
      return statusBadgeColors.green;
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dropdown
        options={statusOptions}
        value={status}
        onChange={onChange}
        className=""
        customButton={(isOpen, setIsOpen) => {
          const colors = getStatusColors(normalizedStatus);
          // Find label based on loose matching or exact match
          const selectedOption = statusOptions.find(opt => opt.value === status)
            || statusOptions.find(opt => opt.value === normalizedStatus)
            || statusOptions.find(opt => opt.value === 'completed'); // fallback

          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="px-3 py-1.5 rounded-full flex gap-1 items-center justify-between font-medium border transition-colors cursor-pointer"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text,
              }}
            >
              <span>{selectedOption?.label || "Completed"}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
                  }`}
                style={{ color: colors.text }}
              />
            </button>
          );
        }}
      />
    </div>
  );
}

