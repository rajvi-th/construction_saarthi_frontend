// src/layout/Sidebar.jsx
import { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SidebarHeader from "./SidebarHeader";
import { Menu, X, Settings, HelpCircle, Phone } from "lucide-react";
import { ROUTES_FLAT } from "../../constants/routes";
import { useWorkspaceRole } from "../../features/dashboard/hooks";

// ICONS (Default + Active versions)
import home from "../../assets/icons/home.svg";

import project from "../../assets/icons/project.svg";
import progressReport from "../../assets/icons/progressReport.svg";
import gallery from "../../assets/icons/gallery.svg";
import builderClient from "../../assets/icons/builderClient.svg";
import vendorsIcon from "../../assets/icons/vendors.svg";
import pastWork from "../../assets/icons/pastWork.svg";
import businessCard from "../../assets/icons/businessCard.svg";
import referEarn from "../../assets/icons/dollar.svg";
import subscription from "../../assets/icons/Subscription.svg";
import homeLight from "../../assets/icons/homeLight.svg";
import projectLight from "../../assets/icons/projectLight.svg";
import progressReportLight from "../../assets/icons/progressReportLight.svg";
import galleryLight from "../../assets/icons/GalleryLight.svg";
import builderLight from "../../assets/icons/builderLight.svg";
import vendorsLight from "../../assets/icons/vendorsLight.svg";
import businessCardLight from "../../assets/icons/businessLight.svg";
import referEarnLight from "../../assets/icons/refereLight.svg";
import subscriptionLight from "../../assets/icons/subscriptionLight.svg";
import userLight from "../../assets/icons/userLight.svg";


const Sidebar = () => {
  const { t } = useTranslation();
  const currentUserRole = useWorkspaceRole();

  const [open, setOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Collapse sidebar automatically on screens smaller than md
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // MENU DATA (INSIDE FILE) - Filter Refer & Earn for restricted roles
  const mainMenu = useMemo(() => {
    const allMenuItems = [
    {
      label: "Dashboard",
      labelKey: "sidebar.mainMenu.dashboard",
      icon: home,
      activeIcon: homeLight,
      path: ROUTES_FLAT.DASHBOARD,
    },
    {
      label: "Projects",
      labelKey: "sidebar.mainMenu.projects",
      icon: pastWork,
      activeIcon: projectLight,
      path: ROUTES_FLAT.PROJECTS,
    },
    {
      label: "Daily Progress Report (DPR)",
      labelKey: "sidebar.mainMenu.dpr",
      icon: progressReport,
      activeIcon: progressReportLight,
      path: "/dpr",
    },
    {
      label: "Project Gallery",
      labelKey: "sidebar.mainMenu.gallery",
      icon: gallery,
      activeIcon: galleryLight,
      path: "/gallery",
    },
    {
      label: "Builders & Clients",
      labelKey: "sidebar.mainMenu.buildersClients",
      icon: builderClient,
      activeIcon: builderLight,
      path: ROUTES_FLAT.BUILDERS,
    },
    {
      label: "Manage Vendors",
      labelKey: "sidebar.mainMenu.vendors",
      icon: vendorsIcon,
      activeIcon: vendorsLight,
      path: "/vendors",
    },
    {
      label: "My Past Work",
      labelKey: "sidebar.mainMenu.pastWork",
      icon: pastWork,
      activeIcon: projectLight,
      path: "/past-work",
    },
    {
      label: "Business Card",
      labelKey: "sidebar.mainMenu.businessCard",
      icon: businessCard,
      activeIcon: businessCardLight,
      path: "/business-card",
    },
    {
      label: "Refer & Earn",
      labelKey: "sidebar.mainMenu.referEarn",
      icon: referEarn,
      activeIcon: referEarnLight,
      path: ROUTES_FLAT.REFER_EARN,
    },
    {
      label: "My Subscription",
      labelKey: "sidebar.mainMenu.subscription",
      icon: subscription,
      activeIcon:   subscriptionLight,
      path: "/subscription",
    },
    {
      label: "My Account",
      labelKey: "sidebar.mainMenu.account",
      icon: builderClient,
      activeIcon: userLight,
      path: "/account",
    },
    ];
    
    // Roles that should not see certain menu items
    const restrictedRoles = ['builder', 'supervisor'];
    const isRestricted = restrictedRoles.some(
      (role) => currentUserRole?.toLowerCase() === role.toLowerCase()
    );
    
    // Hide Refer & Earn for builder, contractor, and supervisor roles
    const rolesToHideReferEarn = ['builder', 'contractor', 'supervisor'];
    const shouldHideReferEarn = rolesToHideReferEarn.some(
      (role) => currentUserRole?.toLowerCase() === role.toLowerCase()
    );
    
    // Filter menu items based on restrictions
    let filteredMenu = allMenuItems;
    
    if (isRestricted) {
      // Hide Builders & Clients, Manage Vendors, and Business Card for builder and supervisor
      filteredMenu = filteredMenu.filter(
        (item) => 
          item.labelKey !== "sidebar.mainMenu.buildersClients" &&
          item.labelKey !== "sidebar.mainMenu.vendors" &&
          item.labelKey !== "sidebar.mainMenu.businessCard"
      );
    }
    
    if (shouldHideReferEarn) {
      // Hide Refer & Earn for builder, contractor, and supervisor
      filteredMenu = filteredMenu.filter(
        (item) => item.labelKey !== "sidebar.mainMenu.referEarn"
      );
    }
    
    return filteredMenu;
  }, [currentUserRole]);

  const settingsMenu = [
    {
      label: "Settings",
      labelKey: "sidebar.settings.settings",
      icon: Settings,
      activeIcon: Settings,
      path: ROUTES_FLAT.SETTINGS,
    },
    {
      label: "Help",
      labelKey: "sidebar.settings.help",
      icon: HelpCircle,
      activeIcon: HelpCircle,
      path: "/help",
    },
    {
      label: "Contact",
      labelKey: "sidebar.settings.contact",
      icon: Phone,
      activeIcon: Phone,
      path: "/contact",
    },
  ];

  // auto close menu in mobile
  const handleClose = () => {
    if (window.innerWidth < 1024) setOpen(false);
  };

  return (
    <>
      {/* MOBILE MENU BUTTON (only when sidebar is closed) */}
      {!open && (
        <button
          className="lg:hidden p-2 rounded-full bg-white fixed top-2.5 md:top-4.5 sm:top-4.5 left-4 z-50"
          onClick={() => setOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[260px] lg:w-[300px] bg-white border-r border-black-soft px-4 py-6.5 z-50 flex flex-col overflow-y-auto transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* MOBILE CLOSE BUTTON (inside sidebar, top-right) */}
        <button
          className="lg:hidden absolute top-1.5 right-4 p-2 rounded-full bg-white shadow-sm border border-black-soft"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER */}
        <SidebarHeader />

        {/* MAIN MENU */}
         <p className="text-xs font-medium text-secondary mb-2">
           {t("sidebar.mainMenu.title", {
             ns: "common",
             defaultValue: "MAIN MENU",
           })}
         </p>
        <div className="flex flex-col gap-1 mb-6">
          {mainMenu.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              onClick={handleClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-[100px] transition-all duration-200
                ${isActive ? "bg-[#121212] text-white" : "text-primary hover:bg-gray-100"}`
              }
            >
              {({ isActive }) => (
                <>
                  {item.icon && (
                    <img
                      src={isActive ? item.activeIcon : item.icon}
                      alt={`${item.label} icon`}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                  <span className="text-sm">
                     {t(item.labelKey || item.label, {
                       ns: "common",
                       defaultValue: item.label,
                     })}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* SETTINGS MENU */}
         <p className="text-xs font-semibold text-secondary mb-2">
           {t("sidebar.settings.title", {
             ns: "common",
             defaultValue: "SETTINGS",
           })}
         </p>
        <div className="flex flex-col gap-1">
          {settingsMenu.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              onClick={handleClose}
              className={({ isActive }) =>
                `flex items-center gap-3 text-sm px-4 py-2 rounded-full transition-all duration-200
                ${isActive ? "bg-black text-white" : "text-primary hover:bg-gray-100"}`
              }
            >
              {({ isActive }) => {
                const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;
                return (
                  <>
                    {Icon && <Icon className="w-5 h-5" />}
                     {t(item.labelKey || item.label, {
                       ns: "common",
                       defaultValue: item.label,
                     })}
                  </>
                );
              }}
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
