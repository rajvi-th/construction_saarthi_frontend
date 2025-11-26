// src/layout/Sidebar.jsx
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import SidebarHeader from "./SidebarHeader";
import { Menu, X, Settings, HelpCircle, Phone } from "lucide-react";

// ICONS (Default + Active versions)
import home from "../../assets/icons/home.svg";

import project from "../../assets/icons/project.svg";
import progressReport from "../../assets/icons/progress-report.svg";
import gallery from "../../assets/icons/gallery.svg";
import builderClient from "../../assets/icons/builder-client.svg";
import vendorsIcon from "../../assets/icons/vendors.svg";
import pastWork from "../../assets/icons/past-work.svg";
import businessCard from "../../assets/icons/business-card.svg";
import referEarn from "../../assets/icons/dollar.svg";
import subscription from "../../assets/icons/Subscription.svg";
import homeLight from "../../assets/icons/home-light.svg";
import projectLight from "../../assets/icons/project-light.svg";
import progressReportLight from "../../assets/icons/progress-report-light.svg";
import galleryLight from "../../assets/icons/gallery-light.svg";
import builderLight from "../../assets/icons/builder-light.svg";
import vendorsLight from "../../assets/icons/vendors-light.svg";
import businessCardLight from "../../assets/icons/business-light.svg";
import referEarnLight from "../../assets/icons/refere-light.svg";
import subscriptionLight from "../../assets/icons/subscription-light.svg";
import userLight from "../../assets/icons/user-light.svg";


const Sidebar = () => {
  const [open, setOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Collapse sidebar automatically on screens smaller than md
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // -------------------------
  // MENU DATA (INSIDE FILE)
  // -------------------------
  const mainMenu = [
    {
      label: "Dashboard",
      icon: home,
      activeIcon: homeLight,
      path: "/dashboard",
    },
    {
      label: "Projects",
      icon: project,
      activeIcon: projectLight,
      path: "/projects",
    },
    {
      label: "Daily Progress Report (DPR)",
      icon: progressReport,
      activeIcon: progressReportLight,
      path: "/dpr",
    },
    {
      label: "Project Gallery",
      icon: gallery,
      activeIcon: galleryLight,
      path: "/gallery",
    },
    {
      label: "Builders & Clients",
      icon: builderClient,
      activeIcon: builderLight,
      path: "/clients",
    },
    {
      label: "Manage Vendors",
      icon: vendorsIcon,
      activeIcon: vendorsLight,
      path: "/vendors",
    },
    {
      label: "My Past Work",
      icon: pastWork,
      activeIcon: projectLight,
      path: "/past-work",
    },
    {
      label: "Business Card",
      icon: businessCard,
      activeIcon: businessCardLight,
      path: "/business-card",
    },
    {
      label: "Refer & Earn",
      icon: referEarn,
      activeIcon: referEarnLight,
      path: "/refer",
    },
    {
      label: "My Subscription",
      icon: subscription,
      activeIcon:   subscriptionLight,
      path: "/subscription",
    },
    {
      label: "My Account",
      icon: builderClient,
      activeIcon: userLight,
      path: "/account",
    },
  ];

  const settingsMenu = [
    {
      label: "Settings",
      icon: Settings,
      activeIcon: Settings,
      path: "/settings",
    },
    {
      label: "Help",
      icon: HelpCircle,
      activeIcon: HelpCircle,
      path: "/help",
    },
    {
      label: "Contact",
      icon: Phone,
      activeIcon: Phone,
      path: "/contact",
    },
  ];

  // auto close menu in mobile
  const handleClose = () => {
    if (window.innerWidth < 768) setOpen(false);
  };

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        className="md:hidden p-2 rounded-full shadow-sm bg-white fixed top-4 left-4 z-[999]"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle sidebar"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[260px] md:w-[300px] bg-white shadow-lg border-r border-gray-100 px-4 py-6.5 z-50 flex flex-col overflow-y-auto transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* HEADER */}
        <SidebarHeader />

        {/* MAIN MENU */}
        <p className="text-xs font-medium text-[#8B8B8B] mb-2">MAIN MENU</p>
        <div className="flex flex-col gap-1 mb-6">
          {mainMenu.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              onClick={handleClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-[100px] transition-all duration-200
                ${isActive ? "bg-[#121212] text-white" : "text-gray-700 hover:bg-gray-100"}`
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
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* SETTINGS MENU */}
        <p className="text-xs font-semibold text-gray-400 mb-2">SETTINGS</p>
        <div className="flex flex-col gap-1">
          {settingsMenu.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              onClick={handleClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-200
                ${isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`
              }
            >
              {({ isActive }) => {
                const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;
                return (
                  <>
                    {Icon && <Icon className="w-5 h-5" />}
                    {item.label}
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
