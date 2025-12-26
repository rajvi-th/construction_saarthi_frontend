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
  builders: "sidebar.mainMenu.buildersClients",
  clients: "sidebar.mainMenu.buildersClients",
  vendors: "sidebar.mainMenu.vendors",
  addVendor: "builderClient.form.addVendor",  
  editVendor: "builderClient.form.editVendor", 
  "past-work": "sidebar.mainMenu.pastWork",
  addpastwork: "pastProjects.addTitle",
  "business-card": "sidebar.mainMenu.businessCard",
  "site-inventory": "sidebar.mainMenu.siteInventory",
  notes: "notes.title",
  addNewNote: "notes.addNewNote",
  editNote: "notes.editNote",
  documents: "documents.title",
  proposal: "documents.details.materialQuotation",
  refer: "sidebar.mainMenu.referEarn",
  subscription: "sidebar.mainMenu.subscription",
  account: "sidebar.mainMenu.account",
  settings: "sidebar.settings.settings",
  help: "sidebar.settings.help",
  contact: "sidebar.settings.contact",
  finance: "finance.finance",
  "builder-invoices": "finance.builderInvoices",
  "payment-received": "finance.paymentReceived",
  "expenses-paid": "finance.expensesPaid",
  "expenses-to-pay": "finance.expensesToPay",
  sections: "finance.sections",
};

const Navbar = () => {
  const { t } = useTranslation("common");
  const { t: tBuilderClient } = useTranslation("builderClient");
  const { t: tPastProjects } = useTranslation("pastProjects");
  const { t: tNotes } = useTranslation("notes");
  const { t: tDocuments } = useTranslation("documents");
  const { t: tFinance } = useTranslation("finance");
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

    // If we're on a project details page and have projectName in route state,
    // replace the numeric ID segment with the human-readable project name.
    if (
      segments[0] === "projects" &&
      segments.length > 1 &&
      typeof location.state?.projectName === "string" &&
      location.state.projectName.trim()
    ) {
      return [segments[0], location.state.projectName.trim()];
    }

    // If we're on site-inventory page and have projectName in route state,
    // show breadcrumb as: Projects / ProjectName / Site Inventory
    if (
      segments[0] === "site-inventory" &&
      typeof location.state?.projectName === "string" &&
      location.state.projectName.trim()
    ) {
      return ["projects", location.state.projectName.trim(), segments[0]];
    }

    // Handle vendors routes: replace "add" with "addVendor" and "edit" with "editVendor" for breadcrumb translation
    if (segments[0] === "vendors" && segments.length > 1) {
      const processedSegments = [...segments];
      if (segments[1] === "add") {
        processedSegments[1] = "addVendor";
      } else if (segments[1] === "edit") {
        processedSegments[1] = "editVendor";
      }
      return processedSegments;
    }

    // Handle past-work add route: /past-work/add → ['past-work', 'addPastWork']
    if (segments[0] === "past-work" && segments[1] === "add") {
      return ["past-work", "addPastWork"];
    }

    // Handle notes routes: replace "add" with "addNewNote" and "edit" with "editNote" for breadcrumb translation
    if (segments[0] === "notes" && segments.length > 1) {
      const processedSegments = [...segments];
      // Check if "add" is in any position (could be segments[1] for /notes/add or segments[2] for /notes/:id/add)
      const addIndex = processedSegments.findIndex((seg, idx) => idx > 0 && seg === "add");
      if (addIndex !== -1) {
        processedSegments[addIndex] = "addNewNote";
      }
      // Check if "edit" is in any position (could be segments[1] for /notes/edit or segments[2] for /notes/:id/edit)
      const editIndex = processedSegments.findIndex((seg, idx) => idx > 0 && seg === "edit");
      if (editIndex !== -1) {
        processedSegments[editIndex] = "editNote";
      }
      return processedSegments;
    }

    // Handle documents routes: /documents/projects/:projectId/documents/:documentId
    if (segments[0] === "documents" && segments.length > 1) {
      const processedSegments = ["documents"];
      // If we have projects/:projectId, add project name or "projects" translation
      if (segments[1] === "projects" && segments.length > 2) {
        // For /documents/projects/:projectId, show: Documents / Projects / ProjectName
        // For /documents/projects/:projectId/documents/:documentId, show: Documents / Projects / ProjectName / Documents / Proposal
        if (segments.length === 3) {
          // Just project documents page
          processedSegments.push("projects", segments[2], "documents");
        } else if (segments.length >= 5 && segments[3] === "documents") {
          // Document details page
          processedSegments.push("projects", segments[2], "documents", "proposal");
        }
        return processedSegments;
      }
      return processedSegments;
    }

    // Handle finance routes: /finance/projects/:projectId/...
    if (segments[0] === "finance" && segments.length > 1) {
      const processedSegments = ["finance"];
      if (segments[1] === "projects" && segments.length > 2) {
        // For /finance/projects/:projectId, show: Finance / Projects / ProjectName
        if (segments.length === 3) {
          processedSegments.push("projects", segments[2]);
        } else if (segments.length > 3) {
          // For /finance/projects/:projectId/builder-invoices, show: Finance / Projects / ProjectName / Builder Invoices
          // For /finance/projects/:projectId/builder-invoices/sections/:sectionId, show: Finance / Projects / ProjectName / Builder Invoices / Sections / SectionId
          processedSegments.push("projects", segments[2]);
          if (segments[3] === "builder-invoices") {
            processedSegments.push("builder-invoices");
            if (segments[4] === "sections" && segments.length > 5) {
              processedSegments.push("sections", segments[5]);
            }
          } else if (segments[3] === "payment-received") {
            processedSegments.push("payment-received");
          } else if (segments[3] === "expenses-paid") {
            processedSegments.push("expenses-paid");
          } else if (segments[3] === "expenses-to-pay") {
            processedSegments.push("expenses-to-pay");
            if (segments[4] === "sections" && segments.length > 5) {
              processedSegments.push("sections", segments[5]);
            }
          }
        }
        return processedSegments;
      }
      return processedSegments;
    }

    return segments;
  }, [location.pathname, location.state]);

  const currentBreadcrumb = useMemo(() => {
    const last = breadcrumbs[breadcrumbs.length - 1] || "dashboard";
    // Try original case first, then lowercase for camelCase keys like "addNewNote"
    const translationKey = BREADCRUMB_TRANSLATION_KEYS[last] || 
                          BREADCRUMB_TRANSLATION_KEYS[last.toLowerCase()] || 
                          "";
    
    // Use builderClient namespace for vendor-specific translations
    if (translationKey && translationKey.startsWith("builderClient.")) {
      return tBuilderClient(translationKey.replace("builderClient.", ""), {
        defaultValue: last.replace(/-/g, " "),
      });
    }

    // Use pastProjects namespace for past work related translations
    if (translationKey && translationKey.startsWith("pastProjects.")) {
      return tPastProjects(translationKey.replace("pastProjects.", ""), {
        defaultValue: last.replace(/-/g, " "),
      });
    }

    // Use notes namespace for notes-related translations
    if (translationKey && translationKey.startsWith("notes.")) {
      return tNotes(translationKey.replace("notes.", ""), {
        defaultValue: last.replace(/-/g, " "),
      });
    }

    // Use documents namespace for documents-related translations
    if (translationKey && translationKey.startsWith("documents.")) {
      return tDocuments(translationKey.replace("documents.", ""), {
        defaultValue: last.replace(/-/g, " "),
      });
    }

    // Use finance namespace for finance-related translations
    if (translationKey && translationKey.startsWith("finance.")) {
      return tFinance(translationKey.replace("finance.", ""), {
        defaultValue: last.replace(/-/g, " "),
      });
    }
    
    if (translationKey) {
      return t(translationKey, {
        defaultValue: last.replace(/-/g, " "),
      });
    }
    
    // Fallback: return the original value if no translation key found
    return last.replace(/-/g, " ");
  }, [breadcrumbs, t, tBuilderClient, tPastProjects, tNotes, tDocuments, tFinance]);

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
                {(() => {
                  // Try original case first, then lowercase for camelCase keys like "addNewNote"
                  const translationKey = BREADCRUMB_TRANSLATION_KEYS[crumb] || 
                                        BREADCRUMB_TRANSLATION_KEYS[crumb.toLowerCase()] || 
                                        "";
                  
                  // Skip translation for numeric IDs (they're data, not UI text)
                  if (!translationKey && /^\d+$/.test(crumb)) {
                    return crumb;
                  }
                  
                  // Use builderClient namespace for vendor-specific translations
                  if (translationKey && translationKey.startsWith("builderClient.")) {
                    return tBuilderClient(translationKey.replace("builderClient.", ""), {
                      defaultValue: crumb.replace(/-/g, " "),
                    });
                  }
                  // Use pastProjects namespace for past work related translations
                  if (translationKey && translationKey.startsWith("pastProjects.")) {
                    return tPastProjects(translationKey.replace("pastProjects.", ""), {
                      defaultValue: crumb.replace(/-/g, " "),
                    });
                  }
                  // Use notes namespace for notes-related translations
                  if (translationKey && translationKey.startsWith("notes.")) {
                    return tNotes(translationKey.replace("notes.", ""), {
                      defaultValue: crumb.replace(/-/g, " "),
                    });
                  }
                  // Use documents namespace for documents-related translations
                  if (translationKey && translationKey.startsWith("documents.")) {
                    return tDocuments(translationKey.replace("documents.", ""), {
                      defaultValue: crumb.replace(/-/g, " "),
                    });
                  }
                  // Use finance namespace for finance-related translations
                  if (translationKey && translationKey.startsWith("finance.")) {
                    return tFinance(translationKey.replace("finance.", ""), {
                      defaultValue: crumb.replace(/-/g, " "),
                    });
                  }
                  if (translationKey) {
                    return t(translationKey, {
                      defaultValue: crumb.replace(/-/g, " "),
                    });
                  }
                  // Fallback: return the original value if no translation key found
                  return crumb.replace(/-/g, " ");
                })()}
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
