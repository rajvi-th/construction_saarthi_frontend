import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../features/auth/store";

import Breadcrumbs from "../../assets/icons/breadcrumbs.svg";
import LanguageSwitcher from "../ui/LanguageSwitcher";

// Map URL segments to translation keys in common.json
const BREADCRUMB_TRANSLATION_KEYS = {
  dashboard: "sidebar.mainMenu.dashboard",
  projects: "sidebar.mainMenu.projects",
  dpr: "sidebar.mainMenu.dpr",
  gallery: "sidebar.mainMenu.gallery",
  clients: "sidebar.mainMenu.buildersClients",
  vendors: "sidebar.mainMenu.vendors",
  "past-work": "sidebar.mainMenu.pastWork",
  "business-card": "sidebar.mainMenu.businessCard",
  refer: "sidebar.mainMenu.referEarn",
  subscription: "sidebar.mainMenu.subscription",
  account: "sidebar.mainMenu.account",
  settings: "sidebar.settings.settings",
  help: "sidebar.settings.help",
  contact: "sidebar.settings.contact",
};

const Navbar = () => {
  const { t } = useTranslation("common");
  const location = useLocation();
  const { user: authUser } = useAuth();


  // Compute user display data dynamically from AuthContext
  const user = useMemo(() => {
    if (!authUser) {
      return {
        name: "",
        initials: "",
        avatar: "",
      };
    }
    // Extract name from backend or token
    const name =
      authUser?.full_name ||
      authUser?.name ||
      authUser?.fullName ||
      "";

    // Generate initials
    let initials = "";
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        initials = `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      } else {
        initials = name.substring(0, 2).toUpperCase();
      }
    }


    const avatar =
      authUser?.avatar ||
      authUser?.profilePicture ||
      authUser?.profile_image ||
      "";

    return { name, initials, avatar };
  }, [authUser]);

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return ["dashboard"];
    return segments;
  }, [location.pathname]);

  const currentBreadcrumb = useMemo(() => {
    const last = breadcrumbs[breadcrumbs.length - 1] || "dashboard";
    return t(BREADCRUMB_TRANSLATION_KEYS[last.toLowerCase()] || "", {
      defaultValue: last.replace(/-/g, " "),
    });
  }, [breadcrumbs, t]);

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-[300px] py-3 px-4 md:px-8 bg-white border-b border-black-soft z-40 flex items-center justify-between ">
      {/* LEFT – BREADCRUMBS */}
      <div className="flex items-center gap-2 min-w-0 flex-1 ml-10 md:ml-7 lg:ml-0 ">
        {/* Icon only on tablet & desktop (>= 768px) */}
        <img
          src={Breadcrumbs}
          alt="Breadcrumbs"
          className="hidden md:block w-5 h-5 flex-shrink-0"
        />

        {/* Full breadcrumb trail on desktop */}
        <div className="hidden lg:flex items-center gap-2 flex-wrap text-sm text-gray-500 min-w-0">
          {breadcrumbs.map((crumb, index) => (
            <span
              key={index}
              className="flex items-center gap-2 capitalize whitespace-nowrap text-ellipsis overflow-hidden"
            >
              {index > 0 && <span className="text-gray-300">/</span>}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? "text-gray-900 font-medium truncate"
                    : "text-gray-400 truncate"
                }
              >
                {t(BREADCRUMB_TRANSLATION_KEYS[crumb.toLowerCase()] || "", {
                  defaultValue: crumb.replace(/-/g, " "),
                })}
              </span>
            </span>
          ))}
        </div>

        {/* Mobile / tablet: only current page label */}
        <div className="flex lg:hidden items-center text-sm font-medium text-gray-900 truncate">
          {currentBreadcrumb}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* USER PROFILE */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="
              w-9 h-9 sm:w-10 sm:h-10 
              rounded-full bg-gray-100 border border-gray-200 
              flex items-center justify-center 
              text-xs sm:text-sm font-semibold text-gray-600
            ">
              {user.initials}
            </div>
          )}

          {/* USER NAME (hidden on mobile) */}
          {user.name && (
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                {user.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
