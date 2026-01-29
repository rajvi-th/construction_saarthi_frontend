import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import Dropdown from "../../../components/ui/Dropdown";
import { statusBadgeColors } from "../../../components/ui/StatusBadge";

export default function ProjectStatusPill({ status: rawStatus, onChange, readOnly = false }) {
  // Normalized form for internal logic/matching
  const normalize = (s) => {
    if (!s) return "completed";
    let normalized = s.toLowerCase().replace(/\s+/g, '_');
    // Map pending to upcoming for display consistency
    if (normalized === 'pending') return 'upcoming';
    return normalized;
  };

  const status = normalize(rawStatus);

  const statusOptions = [
    { value: "completed", label: "Completed" },
    { value: "in_progress", label: "In Progress" },
    { value: "upcoming", label: "Upcoming" },
  ];

  // Helper to determine colors based on status
  const getStatusColors = (currentStatus) => {
    const s = normalize(currentStatus);
    if (s === "completed") {
      return statusBadgeColors.green;
    } else if (s === "in_progress" || s === "inprogress") {
      return statusBadgeColors.yellow;
    } else if (s === "upcoming") {
      return statusBadgeColors.blue;
    } else {
      return statusBadgeColors.green;
    }
  };

  const colors = getStatusColors(status);
  const selectedOption = statusOptions.find(opt => normalize(opt.value) === status)
    || statusOptions.find(opt => normalize(opt.value) === 'completed');

  if (readOnly) {
    return (
      <div
        className="px-3 py-1.5 rounded-full flex gap-1 items-center font-medium border"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.background,
          color: colors.text,
        }}
      >
        <span>{selectedOption?.label || "Completed"}</span>
      </div>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dropdown
        options={statusOptions}
        value={status}
        onChange={onChange}
        className=""
        customButton={(isOpen, setIsOpen) => {
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

