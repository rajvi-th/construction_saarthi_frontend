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
  addBusinessCard: "businessCard.add.title",
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
  "labour-attendance": "labourAttendance.common.labourAttendance",
  "add-labour": "labourAttendance.common.addLabour",
  calculation: "calculation.breadcrumbs.calculation",
  "construction-calculation": "calculation.breadcrumbs.calculation",
  "construction-cost": "calculation.quickActions.items.constructionCost",
  "calculation-history": "calculation.projectDetails.history",
  "calculation-details": "calculation.projectDetails.calculationDetails",
  reports: "sidebar.mainMenu.dpr",
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
  const { t: tBusinessCard } = useTranslation("businessCard");
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

    const state = location.state || {};
    const projectName = typeof state.projectName === "string" ? state.projectName.trim() : null;
    const fromProjects = !!state.fromProjects;
    const fromDashboard = !!state.fromDashboard;
    const createPath = (idx) => "/" + segments.slice(0, idx + 1).join("/");

    // --- Helper for Prepending Parent context ---
    const wrapWithContext = (items) => {
      if (fromDashboard) {
        return [{ id: "dashboard", path: "/" }, ...items];
      }
      return items;
    };

    // --- Helper for Project-Context Prefix ---
    const getProjectPrefix = (featureId, featurePath) => {
      if (fromProjects && projectName) {
        let projectId = state.projectId || segments[segments.indexOf("projects") + 1];
        if (!projectId && segments[0] === featureId && segments.length > 1) projectId = segments[1];
        if (!projectId && segments[0] === "past-work" && segments.length > 1) projectId = segments[1];
        if (!projectId && segments[0] === "gallery" && segments.length > 1) projectId = segments[1];
        if (!projectId && segments[0] === "construction-calculation" && segments.length > 1) projectId = segments[1];

        if (projectId) {
          // If the feature is project-specific, we should link to the project's view of that feature
          const projectFeaturePath = (featureId === "labour-attendance" || featureId === "finance" || featureId === "documents" || featureId === "notes")
            ? `${featurePath}/${projectId}`
            : featurePath;

          return [
            { id: "projects", path: "/projects" },
            { id: projectName, path: `/projects/${projectId}` },
            { id: featureId, path: projectFeaturePath },
          ];
        }
      }
      return [{ id: featureId, path: featurePath }];
    };

    const rootSegment = segments[0];

    // 1. PROJECTS
    if (rootSegment === "projects") {
      const items = [{ id: "projects", path: "/projects" }];
      if (segments.length > 1) items.push({ id: projectName || segments[1], path: createPath(1) });
      if (segments.length > 2) segments.slice(2).forEach((seg, i) => items.push({ id: seg, path: createPath(i + 2) }));
      return wrapWithContext(items);
    }

    // 2. LABOUR ATTENDANCE
    if (rootSegment === "labour-attendance") {
      const items = getProjectPrefix("labour-attendance", "/labour-attendance");
      if (segments.length === 1) return wrapWithContext(items);
      const projectId = segments[1];
      const projectPath = `/labour-attendance/${projectId}`;

      if (!fromProjects) {
        if (typeof state.projectName === "string" && state.projectName.trim()) {
          items.push({ id: state.projectName.trim(), path: projectPath });
        } else {
          items.push({ id: projectId, path: projectPath });
        }
      }

      if (segments.length > 2) {
        if (segments[2] === "add-labour") {
          const editLabourName = state.editLabour?.name || null;
          if (editLabourName && typeof editLabourName === "string" && editLabourName.trim()) {
            items.push({ id: editLabourName.trim(), path: projectPath + "/add-labour" });
          } else {
            items.push({ id: "add-labour", path: projectPath + "/add-labour" });
          }
        } else if (segments[2] === "labour" && segments.length > 3) {
          const labourName = state.labour?.name || state.editLabour?.name || state.labourName || segments[3];
          items.push({ id: labourName, path: projectPath + "/labour/" + segments[3] });
          segments.slice(4).forEach((seg, i) => {
            items.push({ id: seg, path: createPath(i + 4) });
          });
        } else {
          segments.slice(2).forEach((seg, i) => {
            items.push({ id: seg, path: createPath(i + 2) });
          });
        }
      }
      return wrapWithContext(items);
    }

    // Handle business-card routes
    if (rootSegment === "business-card" && segments.length > 1) {
      if (segments[1] === "add") {
        return wrapWithContext([
          { id: "business-card", path: createPath(0) },
          { id: "addBusinessCard", path: createPath(1) },
        ]);
      }
      return wrapWithContext(segments.map((seg, i) => ({ id: seg, path: createPath(i) })));
    }

    // 3. SITE INVENTORY
    if (rootSegment === "site-inventory") {
      const items = getProjectPrefix("site-inventory", "/site-inventory");
      if (segments.length > 1) {
        if (state.item?.name || state.consumable?.name) {
          items.push({ id: state.item?.name || state.consumable?.name, path: createPath(segments.length - 1) });
        } else {
          segments.slice(1).forEach((seg, i) => items.push({ id: seg, path: createPath(i + 1) }));
        }
      }
      return wrapWithContext(items);
    }

    // 4. FINANCE
    if (rootSegment === "finance") {
      const items = getProjectPrefix("finance", "/finance");
      if (segments[1] === "projects" && segments.length > 2) {
        if (!fromProjects) items.push({ id: projectName || segments[2], path: `/finance/projects/${segments[2]}` });
        if (segments.length > 3) segments.slice(3).forEach((seg, i) => items.push({ id: seg, path: createPath(i + 3) }));
      } else if (segments.length > 1) {
        segments.slice(1).forEach((seg, i) => items.push({ id: seg, path: createPath(i + 1) }));
      }
      return wrapWithContext(items);
    }

// 5. DPR / DOCUMENTS / NOTES / GALLERY
if (["dpr", "documents", "notes", "gallery"].includes(rootSegment)) {
  const items = getProjectPrefix(rootSegment, `/${rootSegment}`);
  const pidIdx = segments.indexOf("projects");
  const projectId =
    pidIdx !== -1
      ? segments[pidIdx + 1]
      : rootSegment === "gallery"
      ? segments[1]
      : null;

  if (projectId && !fromProjects) {
    items.push({
      id: projectName || projectId,
      path: `/${rootSegment}/${pidIdx !== -1 ? "projects/" : ""}${projectId}`
    });
  }

  const startIdx = pidIdx !== -1 ? pidIdx + 2 : rootSegment === "gallery" ? 2 : 1;

  if (segments.length > startIdx) {
    segments.slice(startIdx).forEach((seg, i) => {
      let id = seg;

      // NOTES-specific naming
      if (rootSegment === "notes") {
        if (seg === "add") id = "addNewNote";
        if (seg === "edit") id = "editNote";

        // /notes/:id → note title
        if (
          segments.length === startIdx + 1 &&
          seg !== "add" &&
          typeof location.state?.noteTitle === "string"
        ) {
          id = location.state.noteTitle.trim();
        }
      }

      if (seg === "documents" && rootSegment === "documents") return;
      items.push({ id, path: createPath(i + startIdx) });
    });
  }

  return wrapWithContext(items);
}


// 6. PAST WORK
if (rootSegment === "past-work") {
  const items = [{ id: "past-work", path: "/past-work" }];

  if (segments.length > 1) {
    if (segments[1] === "add") {
      items.push({ id: "addpastwork", path: "/past-work/add" });
    } else {
      items.push({
        id: projectName || segments[1],
        path: `/past-work/${segments[1]}`
      });
    }
  }

  if (segments.length > 2) {
    segments.slice(2).forEach((seg, i) =>
      items.push({ id: seg, path: createPath(i + 2) })
    );
  }

  return wrapWithContext(items);
}


// Handle finance routes
if (segments[0] === "finance" && segments.length > 1) {
  const processed = [{ id: "finance", path: "/finance" }];

  if (segments[1] === "projects" && segments.length > 2) {
    const projectName = location.state?.projectName || null;

    processed.push({
      id:
        projectName && typeof projectName === "string" && projectName.trim()
          ? projectName.trim()
          : segments[2],
      path: createPath(2)
    });

    if (segments.length === 3) return processed;

    if (
      ["builder-invoices", "payment-received", "expenses-paid", "expenses-to-pay"]
        .includes(segments[3])
    ) {
      processed.push({ id: segments[3], path: createPath(3) });

      if (
        ["builder-invoices", "expenses-to-pay"].includes(segments[3]) &&
        segments[4] === "sections" &&
        segments.length > 5
      ) {
        processed.push({ id: "sections", path: createPath(4) });
        processed.push({ id: segments[5], path: createPath(5) });
      }
    }
  }

  return processed;
}

    // 7. CALCULATION
    if (rootSegment === "construction-calculation") {
      const items = getProjectPrefix("construction-calculation", "/construction-calculation");
      if (segments.length > 1 && !fromProjects) items.push({ id: projectName || segments[1], path: `/construction-calculation/${segments[1]}` });
      if (segments.length > 1) segments.slice(1).forEach((seg, i) => {
        if (seg === segments[1] && !fromProjects) return;
        if (seg === segments[1] && fromProjects) return;
        items.push({ id: seg, path: createPath(i + 1) });
      });
      return wrapWithContext(items);
    }

    return wrapWithContext(segments.map((seg, i) => ({ id: seg, path: createPath(i) })));
  }, [location.pathname, location.state]);

  const currentBreadcrumb = useMemo(() => {
    if (!Array.isArray(breadcrumbs) || breadcrumbs.length === 0) return "Dashboard";

    const lastObj = breadcrumbs[breadcrumbs.length - 1];
    const lastId = lastObj?.id || "dashboard";
    const last = String(lastId);

    // Try original case first, then lowercase for camelCase keys like "addNewNote"
    let translationKey = "";
    if (Object.prototype.hasOwnProperty.call(BREADCRUMB_TRANSLATION_KEYS, last)) {
      translationKey = BREADCRUMB_TRANSLATION_KEYS[last];
    } else if (Object.prototype.hasOwnProperty.call(BREADCRUMB_TRANSLATION_KEYS, last.toLowerCase())) {
      translationKey = BREADCRUMB_TRANSLATION_KEYS[last.toLowerCase()];
    }

    if (typeof translationKey !== "string") translationKey = "";

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

    // Use businessCard namespace for business card-related translations
    if (translationKey && translationKey.startsWith("businessCard.")) {
      return tBusinessCard(translationKey.replace("businessCard.", ""), {
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
  }, [breadcrumbs, t, tBuilderClient, tPastProjects, tNotes, tDocuments, tFinance, tLabourAttendance, tCalculation, tBusinessCard]);

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

                    // Use businessCard namespace for business card-related translations
                    if (translationKey && translationKey.startsWith("businessCard.")) {
                      return tBusinessCard(translationKey.replace("businessCard.", ""), {
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
