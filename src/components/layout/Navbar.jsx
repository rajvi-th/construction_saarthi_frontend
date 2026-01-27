import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  "labour-attendance": "sidebar.mainMenu.labourAttendance",
  "add-labour": "labourAttendance.common.addLabour",
  calculation: "calculation.breadcrumbs.calculation",
  concrete: "calculation.quickActions.items.concrete",
  "by-volume": "calculation.concrete.sections.byVolume",
  "curbed-stone-1": "calculation.concrete.curbedStone.curbStone1",
  "curbed-stone-2": "calculation.concrete.curbedStone.curbStone2",
  "simple-tube": "calculation.concrete.tube.simpleTube",
  "square-tube": "calculation.concrete.tube.squareTube",
  "gutter-shape-1": "calculation.concrete.gutter.gutterShape1",
  "gutter-shape-2": "calculation.concrete.gutter.gutterShape2",
};

const Navbar = () => {
  const { t } = useTranslation("common");
  const { t: tBuilderClient } = useTranslation("builderClient");
  const { t: tPastProjects } = useTranslation("pastProjects");
  const { t: tNotes } = useTranslation("notes");
  const { t: tDocuments } = useTranslation("documents");
  const { t: tFinance } = useTranslation("finance");
  const { t: tLabourAttendance } = useTranslation("labourAttendance");
  const { t: tCalculation } = useTranslation("calculation");
  const location = useLocation();
  const navigate = useNavigate();
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
    if (segments.length === 0) return [{ id: "dashboard", path: "/" }];

    const createPath = (idx) => "/" + segments.slice(0, idx + 1).join("/");

    // If we're on a project details page and have projectName in route state,
    // replace the numeric ID segment with the human-readable project name.
    if (
      segments[0] === "projects" &&
      segments.length > 1 &&
      typeof location.state?.projectName === "string" &&
      location.state.projectName.trim()
    ) {
      const processed = [
        { id: segments[0], path: createPath(0) },
        { id: location.state.projectName.trim(), path: createPath(1) },
      ];

      // Append any remaining segments (like "edit", "details" etc.)
      if (segments.length > 2) {
        segments.slice(2).forEach((seg, i) => {
          processed.push({ id: seg, path: createPath(i + 2) });
        });
      }

      return processed;
    }

    // If we're on site-inventory page and have projectName in route state,
    // show breadcrumb as: Projects / ProjectName / Site Inventory
    if (
      segments[0] === "site-inventory" &&
      typeof location.state?.projectName === "string" &&
      location.state.projectName.trim()
    ) {
      // Assuming project ID is also in state for the link, otherwise fallback to just projects list
      const projectPath = location.state?.projectId ? `/projects/${location.state.projectId}` : '/projects';
      return [
        { id: "projects", path: "/projects" },
        { id: location.state.projectName.trim(), path: projectPath },
        { id: segments[0], path: createPath(0) },
      ];
    }

    // Handle labour-attendance routes
    if (segments[0] === "labour-attendance" && segments.length > 1) {
      const processed = [{ id: segments[0], path: createPath(0) }];

      // Replace project ID with project name if available
      if (typeof location.state?.projectName === "string" && location.state.projectName.trim()) {
        processed.push({ id: location.state.projectName.trim(), path: createPath(1) });
      } else {
        processed.push({ id: segments[1], path: createPath(1) });
      }

      // Handle add-labour route
      if (segments.length > 2 && segments[2] === "add-labour") {
        const editLabourName = location.state?.editLabour?.name || null;

        if (editLabourName && typeof editLabourName === "string" && editLabourName.trim()) {
          processed.push({ id: editLabourName.trim(), path: createPath(2) });
        } else {
          processed.push({ id: "add-labour", path: createPath(2) });
        }
        return processed;
      }

      // Handle labour details route
      if (segments.length > 3 && segments[2] === "labour") {
        const labourName = location.state?.labour?.name ||
          location.state?.editLabour?.name ||
          location.state?.labourName ||
          null;

        if (labourName && typeof labourName === "string" && labourName.trim()) {
          processed.push({ id: labourName.trim(), path: createPath(3) });
        } else {
          processed.push({ id: segments[3], path: createPath(3) });
        }
        return processed;
      }

      return processed;
    }

    // Handle vendors routes
    if (segments[0] === "vendors" && segments.length > 1) {
      const processed = segments.map((seg, i) => ({ id: seg, path: createPath(i) }));
      if (segments[1] === "add") {
        processed[1].id = "addVendor";
      } else if (segments[1] === "edit") {
        processed[1].id = "editVendor";
      }
      return processed;
    }

    // Handle past-work routes
    if (segments[0] === "past-work" && segments.length > 1) {
      if (segments[1] === "add") {
        return [
          { id: "past-work", path: createPath(0) },
          { id: "addPastWork", path: createPath(1) },
        ];
      }

      // Detail or Edit page
      const processed = [{ id: "past-work", path: createPath(0) }];

      // Replace ID with project name if available
      if (typeof location.state?.projectName === "string" && location.state.projectName.trim()) {
        processed.push({ id: location.state.projectName.trim(), path: createPath(1) });
      } else {
        processed.push({ id: segments[1], path: createPath(1) });
      }

      // Append remaining segments (e.g. "edit")
      if (segments.length > 2) {
        segments.slice(2).forEach((seg, i) => {
          processed.push({ id: seg, path: createPath(i + 2) });
        });
      }

      return processed;
    }

    // Handle notes routes
    if (segments[0] === "notes" && segments.length > 1) {
      const processed = segments.map((seg, i) => ({ id: seg, path: createPath(i) }));
      const addIndex = segments.findIndex((seg, idx) => idx > 0 && seg === "add");
      if (addIndex !== -1) processed[addIndex].id = "addNewNote";

      const editIndex = segments.findIndex((seg, idx) => idx > 0 && seg === "edit");
      if (editIndex !== -1) processed[editIndex].id = "editNote";

      return processed;
    }

    // Handle finance routes
    if (segments[0] === "finance" && segments.length > 1) {
      const processed = [{ id: "finance", path: "/finance" }];
      if (segments[1] === "projects" && segments.length > 2) {
        // Skip "projects" segment in display, go straight to project name
        const projectName = location.state?.projectName || null;
        processed.push({
          id: (projectName && typeof projectName === "string" && projectName.trim()) ? projectName.trim() : segments[2],
          path: createPath(2) // /finance/projects/:id
        });

        if (segments.length === 3) {
          return processed;
        } else if (segments.length > 3) {
          if (["builder-invoices", "payment-received", "expenses-paid", "expenses-to-pay"].includes(segments[3])) {
            processed.push({ id: segments[3], path: createPath(3) });

            if (segments[3] === "builder-invoices" && segments[4] === "sections" && segments.length > 5) {
              processed.push({ id: "sections", path: createPath(4) });
              processed.push({ id: segments[5], path: createPath(5) });
            } else if (segments[3] === "expenses-to-pay" && segments[4] === "sections" && segments.length > 5) {
              processed.push({ id: "sections", path: createPath(4) });
              processed.push({ id: segments[5], path: createPath(5) });
            }
          }
        }
        return processed;
      }
      return [{ id: "finance", path: "/finance" }, ...segments.slice(1).map((s, i) => ({ id: s, path: createPath(i + 1) }))];
    }

    // Handle documents routes
    if (segments[0] === "documents" && segments.length > 1) {
      if (segments[1] === "projects" && segments.length > 2) {
        // This block in original code was returning: ["documents", "projects", NAME, "documents", ...] which seems redundant or specific to design
        // Retaining logic but assigning paths.
        // Original: processedSegments.push("projects", segments[2], "documents");
        // Paths: /documents/projects -> /documents/projects/:id -> /documents/projects/:id/documents (?? typically redundancy in UI logic)
        // Let's assume standard pathing for links.
        const projectName = location.state?.projectName || segments[2];
        const items = [
          { id: "documents", path: "/documents" },
          { id: "projects", path: "/documents/projects" }, // Likely not a real page but we'll link it
          { id: projectName, path: createPath(2) },
          { id: "documents", path: createPath(2) + "/documents" } // Assuming this exists?
        ];

        if (segments.length >= 5 && segments[3] === "documents") {
          items.push({ id: "proposal", path: createPath(4) }); // "proposal" hardcoded in original for length >= 5
        }
        return items;
      }
    }

    // Default map
    return segments.map((seg, i) => ({ id: seg, path: createPath(i) }));
  }, [location.pathname, location.state]);

  const currentBreadcrumb = useMemo(() => {
    const lastObj = breadcrumbs[breadcrumbs.length - 1];
    const last = lastObj ? lastObj.id : "dashboard";

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
        defaultValue: crumb.replace(/-/g, " "),
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

    // Use labourAttendance namespace for labour attendance-related translations
    if (translationKey && translationKey.startsWith("labourAttendance.")) {
      return tLabourAttendance(translationKey.replace("labourAttendance.", ""), {
        defaultValue: last.replace(/-/g, " "),
      });
    }

    // Use calculation namespace for calculation-related translations
    if (translationKey && translationKey.startsWith("calculation.")) {
      return tCalculation(translationKey.replace("calculation.", ""), {
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
  }, [breadcrumbs, t, tBuilderClient, tPastProjects, tNotes, tDocuments, tFinance, tLabourAttendance, tCalculation]);

  return (
    <header className="fixed top-0 left-0 right-0 xl:left-[300px] lg:left-[260px] py-3 px-4 md:px-8 bg-white border-b border-black-soft z-40 flex items-center justify-between ">
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
          {breadcrumbs.map((crumbObj, index) => {
            const crumb = crumbObj.id;
            const isLast = index === breadcrumbs.length - 1;

            return (
              <span
                key={index}
                className="flex items-center gap-2 capitalize whitespace-nowrap text-ellipsis overflow-hidden"
              >
                {index > 0 && <span className="text-gray-300">/</span>}
                <span
                  onClick={() => !isLast && navigate(crumbObj.path, { state: location.state })}
                  className={
                    isLast
                      ? "text-gray-900 font-medium truncate cursor-default"
                      : "text-gray-400 truncate cursor-pointer hover:text-gray-600 hover:underline"
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
                    // Use labourAttendance namespace for labour attendance-related translations
                    if (translationKey && translationKey.startsWith("labourAttendance.")) {
                      return tLabourAttendance(translationKey.replace("labourAttendance.", ""), {
                        defaultValue: crumb.replace(/-/g, " "),
                      });
                    }

                    // Use calculation namespace for calculation-related translations
                    if (translationKey && translationKey.startsWith("calculation.")) {
                      return tCalculation(translationKey.replace("calculation.", ""), {
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
            );
          })}
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
