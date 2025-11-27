// src/components/layout/SidebarHeader.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { ROUTES } from "../../constants/routes";
import StatusBadge from "../ui/StatusBadge";

import expand from "../../assets/icons/expand.svg";
import { Users, Check, CirclePlus, LogOut } from "lucide-react";

/* -----------------------------------------------------
   Utility Functions
------------------------------------------------------ */
const getInitials = (name = "", fallback = "AD") => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return fallback;
};

const getWorkspaceInitials = (workspace) => {
  return workspace.initials || getInitials(workspace.name);
};

// Map workspace color keys to StatusAvatar color tokens
const getStatusAvatarColor = (color) => {
  if (color === "orange") return "yellow";
  return color || "red";
};


/* -----------------------------------------------------
   Workspace List Item
------------------------------------------------------ */
const WorkspaceItem = ({ workspace, isActive, onSwitch }) => {
  return (
    <button
      onClick={() => onSwitch(workspace)}
      className="w-full hover:bg-gray-50 flex items-center justify-between transition-colors py-1 rounded-lg cursor-pointer mb-2"
    >
      <div className="flex items-center gap-3">
        <StatusAvatar
          label={getWorkspaceInitials(workspace)}
          color={getStatusAvatarColor(workspace.color)}
          variant="square"
          size="sm"
        />
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h4 className="text-gray-900 font-medium">{workspace.name}</h4>
            <img src={expand} />
          </div>
          <p className="text-gray-500 text-sm">{workspace.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isActive && (
          <Check className="text-gray-500" />
        )}
      </div>
    </button>
  );
};

/* -----------------------------------------------------
   Footer Actions (Logout only)
   "Create Workspace" button is now placed under the list
------------------------------------------------------ */
const FooterActions = ({ onLogout, t }) => (
  <div className="border-t border-gray-200 pt-3">
    <button
      onClick={onLogout}
      className="w-full text-gray-900 flex items-center gap-2 transition-colors rounded-lg mt-1 cursor-pointer"
    >
      <LogOut className="w-5 h-5" />
      <span className="text-sm">
        {t("sidebarHeader.logout", {
          ns: "common",
          defaultValue: "Log out",
        })}
      </span>
    </button>
  </div>
);

/* -----------------------------------------------------
   Main Component
------------------------------------------------------ */
const SidebarHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);

  /* ---------------------------
     Load Workspace & User Data
  ---------------------------- */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("workspaces"));
      const currentId = localStorage.getItem("currentWorkspaceId");

      const defaultData = [
        { id: 1, name: "Admin's Workspace", role: "Contractor", initials: "AD", color: "red" },
        { id: 2, name: "Shree Villa", role: "Contractor", initials: "SV", color: "orange" },
        { id: 3, name: "Royal Villa", role: "Contractor", initials: "RV", color: "green" },
        { id: 4, name: "Royal Villa", role: "Contractor", initials: "RV", color: "green" },
        { id: 5, name: "Royal Villa", role: "Contractor", initials: "RV", color: "green" },
      ];

      const list = Array.isArray(saved) && saved.length ? saved : defaultData;

      setWorkspaces(list);

      const found = list.find((w) => w.id.toString() === currentId) || list[0];
      setCurrentWorkspace(found);
    } catch {
      console.error("Workspace load error");
    }
  }, []);

  /* ---------------------------
     Switch Workspace
  ---------------------------- */
  const handleWorkspaceSwitch = useCallback((workspace) => {
    localStorage.setItem("currentWorkspaceId", workspace.id.toString());
    setCurrentWorkspace(workspace);
  }, []);

  /* ---------------------------
     Logout
  ---------------------------- */
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentWorkspaceId");
    navigate(ROUTES_FLAT.LOGIN);
  }, [navigate]);

  return (
    <div className="mb-6 relative" ref={dropdownRef}>
      {/* Header Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* User Avatar with Initials (using shared StatusAvatar UI) */}
          <StatusAvatar
            label={currentWorkspace ? getWorkspaceInitials(currentWorkspace) : "AD"}
            color={currentWorkspace?.color || "red"}
            variant="square"
            size="md"
          />
          {/* User Info */}
          <div className="text-left">
            <h2 className="font-medium">{currentWorkspace?.name || "Admin's Workspace"}</h2>
            <p className="text-sm text-gray-500">{currentWorkspace?.role || "Contractor"}</p>
          </div>
        </div>
        {/* Expand Icon */}
        <div className="flex-shrink-0">
          <img src={expand} />
        </div>
      </button>

      {/* Workspace Modal Overlay */}
      {showDropdown && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/30"
            onClick={() => setShowDropdown(false)}
          />

          {/* Modal */}
          <div
            className="fixed transform top-22 left-4 p-5 w-[400px] bg-white rounded-[16px] shadow-2xl z-[9999] overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <div className="mb-2">
              <h3 className="text-lg font-medium">
                {t("sidebarHeader.title", {
                  ns: "common",
                  defaultValue: "Workspaces",
                })}
              </h3>
            </div>

            <div className="max-h-96 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Current Active Workspace Section */}
              {currentWorkspace && (() => {
                return (
                  <div className="border-b border-gray-200 pb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <StatusAvatar
                        label={getWorkspaceInitials(currentWorkspace)}
                        color={getStatusAvatarColor(currentWorkspace.color)}
                        variant="square"
                        size="md"
                        className="w-13 h-13 rounded-[14px]"
                      />
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-medium">{currentWorkspace.name}</h4>
                        <p className="text-gray-500 text-sm">{currentWorkspace.role}</p>
                      </div>
                    </div>
                    <button className="w-full bg-[#FBFBFB] border border-gray-200 rounded-[10px] py-2 px-3 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                      <Users className="w-5 h-5" />
                      <span className="text-sm text-gray-500">
                        {t("sidebarHeader.inviteMembers", {
                          ns: "common",
                          defaultValue: "Invite & View Members",
                        })}
                      </span>
                    </button>
                  </div>
                );
              })()}

              {/* All Workspaces List */}
              <div className="py-4 space-y-2">
                <div>
                  {workspaces && workspaces.length > 0 ? (
                    workspaces.map((workspace) => (
                      <WorkspaceItem
                        key={workspace.id}
                        workspace={workspace}
                        isActive={workspace.id === currentWorkspace?.id}
                        onSwitch={handleWorkspaceSwitch}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No workspaces available
                    </div>
                  )}
                </div>

                {/* Create Workspace button should appear just below list */}
                <button className="w-full text-[#B02E0C] flex items-center gap-2 transition-colors rounded-lg cursor-pointer">
                  <CirclePlus className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {t("sidebarHeader.createWorkspace", {
                      ns: "common",
                      defaultValue: "Create Workspace",
                    })}
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <FooterActions onLogout={handleLogout} t={t} />
          </div>
        </>,
        document.body
      )}

    </div>
  );
};

export default SidebarHeader;