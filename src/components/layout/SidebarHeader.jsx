// src/components/layout/SidebarHeader.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { ROUTES_FLAT } from "../../constants/routes";
import { getWorkspaces } from "../../features/auth/api";
import { useAuth } from "../../features/auth/store";
import { showError } from "../../utils/toast";
import { getWorkspaceColor } from "../../utils/getWorkspaceColor";
import ConfirmModal from "../ui/ConfirmModal";

import expand from "../../assets/icons/expand.svg";
import { Users, Check, CirclePlus, LogOut } from "lucide-react";

/* Utility Functions */
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

/* Workspace List Item */
const WorkspaceItem = ({ workspace, isActive, onSwitch }) => {
  const colors = getWorkspaceColor(workspace.color);
  
  return (
    <button
      onClick={() => onSwitch(workspace)}
      className="w-full hover:bg-gray-50 flex items-center justify-between transition-colors py-1 rounded-lg cursor-pointer mb-2"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0 border text-primary"
          style={{
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            color: colors.text,
          }}
        >
          {getWorkspaceInitials(workspace)}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h4 className="text-primary font-medium">{workspace.name}</h4>
            <img src={expand} />
          </div>
          <p className="text-secondary text-sm">{workspace.role}</p>
        </div>
      </div>

      {isActive && <Check className="text-gray-500" />}
    </button>
  );
};

/* Footer Actions */
const FooterActions = ({ onLogout, t }) => (
  <div className="border-t border-gray-200 pt-3">
    <button
      onClick={onLogout}
      className="w-full text-primary flex items-center gap-2 transition-colors rounded-lg mt-1 cursor-pointer"
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

/* Main Component */
const SidebarHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedWorkspace: storeSelectedWorkspace, selectWorkspace, logout: authLogout } = useAuth();
  const dropdownRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showDropdown) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDropdown]);

  /* Load Workspace from API */
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setIsLoading(true);
        const response = await getWorkspaces();

        const workspacesData =
          response?.data || response?.workspaces || response || [];

        const list = Array.isArray(workspacesData) ? workspacesData : [];

        const WORKSPACE_COLORS = ["red", "green", "yellow", "blue", "purple", "pink", "darkblue"];

        const mappedWorkspaces = list.map((workspace, index) => {
          const userRole = workspace.isOwner
            ? "Owner"
            : workspace.members?.[0]?.role || "Member";
        
          return {
            ...workspace,
            role: userRole,
            initials: workspace.initials || getInitials(workspace.name),
            color: WORKSPACE_COLORS[index % WORKSPACE_COLORS.length], 
          };
        });

        setWorkspaces(mappedWorkspaces);

        // Load current workspace from store
        const currentId = storeSelectedWorkspace;
        const found =
          mappedWorkspaces.find(
            (w) => w.id?.toString() === currentId?.toString()
          ) || mappedWorkspaces[0];

        if (found) {
          setCurrentWorkspace(found);
          if (!storeSelectedWorkspace) {
            selectWorkspace(found.id);
          }
        }
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load workspaces";
        showError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, [storeSelectedWorkspace, selectWorkspace]);

  /* Switch Workspace */
  const handleWorkspaceSwitch = useCallback(
    (workspace) => {
      const workspaceId = workspace.id?.toString() || workspace.id;
      setCurrentWorkspace(workspace);
      selectWorkspace(workspaceId);
    },
    [selectWorkspace]
  );

  /* Logout */
  const handleLogoutClick = useCallback(() => {
    setShowDropdown(false); // Close workspace dropdown when logout modal opens
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    setShowLogoutConfirm(false);
    setShowDropdown(false);
    authLogout();
    navigate(ROUTES_FLAT.LOGIN);
  }, [navigate, authLogout]);

  return (
    <div className="mb-6 relative" ref={dropdownRef}>
      {/* Header */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {(() => {
            const workspaceColor = currentWorkspace?.color || "red";
            const colors = getWorkspaceColor(workspaceColor);
            return (
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-base flex-shrink-0 border text-primary"
                style={{
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              >
                {currentWorkspace ? getWorkspaceInitials(currentWorkspace) : "AD"}
              </div>
            );
          })()}
          <div className="text-left">
            <h2 className="font-medium text-primary">
              {currentWorkspace?.name || "Workspace"}
            </h2>
            <p className="text-sm text-secondary">
              {currentWorkspace?.role || "Member"}
            </p>
          </div>
        </div>
        <img src={expand} />
      </button>

      {/* Modal */}
      {showDropdown &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998] bg-black/30"
              onClick={() => setShowDropdown(false)}
            />

            <div
              className="fixed transform top-22 left-4 p-5 w-[400px] bg-white rounded-[16px] shadow-2xl z-[9999] overflow-hidden border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title */}
              <h3 className="text-lg font-medium mb-3">Workspaces</h3>

              <div className="max-h-96 overflow-y-auto">
                {/* Active Workspace */}
                {currentWorkspace && (() => {
                  const colors = getWorkspaceColor(currentWorkspace.color);
                  return (
                    <div className="border-b border-gray-200 pb-5 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-base flex-shrink-0 border text-primary"
                          style={{
                            backgroundColor: colors.bg,
                            border: `1px solid ${colors.border}`,
                            color: colors.text,
                            }}
                        >
                          {getWorkspaceInitials(currentWorkspace)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-primary font-medium">
                            {currentWorkspace.name}
                          </h4>
                          <p className="text-secondary text-sm">
                            {currentWorkspace.role}
                          </p>
                        </div>
                      </div>

                    <button className="w-full bg-[#FBFBFB] border border-gray-200 rounded-[10px] py-2 px-3 flex items-center justify-center gap-2 cursor-pointer">
                      <Users className="w-5 h-5" /> 
                      <span className="text-sm text-secondary ">
                        Invite & View Members
                      </span>
                    </button>
                    </div>
                  );
                })()}

                {/* All Workspace List */}  
                {workspaces.map((workspace) => (
                  <WorkspaceItem
                    key={workspace.id}
                    workspace={workspace}
                    isActive={workspace.id === currentWorkspace?.id}
                    onSwitch={handleWorkspaceSwitch}
                  />
                ))}

                {/* Create Workspace */}
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    navigate(ROUTES_FLAT.CREATE_WORKSPACE);
                  }}
                  className="w-full text-accent flex items-center gap-2 my-2 cursor-pointer py-2"
                >
                  <CirclePlus className="w-5 h-5" />
                  <span className="text-sm font-medium">Create Workspace</span>
                </button>
              </div>

              {/* Bottom Actions */}
              <FooterActions onLogout={handleLogoutClick} t={t} />
            </div>
          </>,
          document.body
        )}

      {/* Logout Confirmation Modal - Rendered via Portal for center positioning */}
      {createPortal(
        <ConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogoutConfirm}
          title={t("sidebarHeader.logoutConfirm.title", {
            ns: "common",
            defaultValue: "Log Out",
          })}
          message={t("sidebarHeader.logoutConfirm.message", {
            ns: "common",
            defaultValue: "Are you sure you want to log out?",
          })}
          confirmText={t("sidebarHeader.logout", {
            ns: "common",
            defaultValue: "Log out",
          })}
          cancelText={t("cancel", {
            ns: "common",
            defaultValue: "Cancel",
          })}
          confirmVariant="primary"
        />,
        document.body
      )}
    </div>
  );
};

export default SidebarHeader;
