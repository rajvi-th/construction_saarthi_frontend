import { statusBadgeColors } from "../components/ui/StatusBadge";

export const getWorkspaceColor = (color = "red") => {
    const selected = statusBadgeColors[color] || statusBadgeColors.red;

    return {
        bg: selected.background,
        border: selected.border,
        text: selected.text
    };
};
