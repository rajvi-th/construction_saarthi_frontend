import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../features/auth/store";

import { getProjectDetails } from "../../features/projects/api/projectApi";

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
  consumable: "siteInventory.materialType.consumable",
  "add-new-ask": "siteInventory.addNewAsk.title",
  restock: "siteInventory.tabs.restock",
  "transfer-material": "siteInventory.itemDetails.transferMaterial",
  "add-stock": "siteInventory.addStock.title",
  editMaterial: "siteInventory.actions.edit",
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

  const { user: authUser, selectedWorkspace } = useAuth();
  
  // Cache for project names to persist across navigation
  const [projectNames, setProjectNames] = useState({});

  // Fetch project name if missing from state
  useEffect(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    let projectId = null;

    // Pattern 1: .../projects/:id...
    const projectsIndex = segments.indexOf("projects");
    if (projectsIndex !== -1 && segments.length > projectsIndex + 1) {
      projectId = segments[projectsIndex + 1];
    }
    
    // Pattern 2: /labour-attendance/:id
    if (!projectId && segments[0] === "labour-attendance" && segments.length > 1) {
      // Check if second segment is numeric (project ID) vs "add-labour" etc
      if (/^\d+$/.test(segments[1])) {
        projectId = segments[1];
      }
    }

    // Pattern 3: /finance/projects/:id (covered by pattern 1)
    
    // If we found a project ID and don't have its name
    if (projectId && /^\d+$/.test(projectId)) {
      // If not in cache AND not in current location state (or even if in state, cache it for later)
      if (!projectNames[projectId]) {
        // If it's in state, use that to populate cache immediately
        if (location.state?.projectName) {
           setProjectNames(prev => ({ ...prev, [projectId]: location.state.projectName }));
        } else {
           // Otherwise fetch it
           getProjectDetails(projectId, selectedWorkspace)
             .then(data => {
               if (data && data.name) {
                 setProjectNames(prev => ({ ...prev, [projectId]: data.name }));
               }
             })
             .catch(err => {
               console.error("Failed to fetch project name for breadcrumb:", err);
             });
        }
      }
    }
  }, [location.pathname, location.state, selectedWorkspace, projectNames]);


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

          const pName = projectName || projectNames[projectId] || projectId;

          return [
            { id: "projects", path: "/projects" },
            { id: pName, path: `/projects/${projectId}` },
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
      if (segments.length > 1) {
         const pid = segments[1];
         const pName = projectName || projectNames[pid] || pid;
         items.push({ id: pName, path: createPath(1) });
      }
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
          items.push({ id: projectNames[projectId] || projectId, path: projectPath });
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
    if (rootSegment === "business-card") {
      const items = [{ id: "business-card", path: "/business-card" }];
      if (segments.length > 1) {
        if (segments[1] === "add") {
          items.push({ id: "addBusinessCard", path: "/business-card/add" });
        } else {
          // It's an ID
          const name = state.businessCardName || state.itemName || segments[1];
          items.push({ id: name, path: createPath(1) });
          
          if (segments.length > 2) {
             segments.slice(2).forEach((seg, i) => items.push({ id: seg, path: createPath(i + 2) }));
          }
        }
      }
      return wrapWithContext(items);
    }

    // 3. SITE INVENTORY
    if (rootSegment === "site-inventory") {
      const items = getProjectPrefix("site-inventory", "/site-inventory");
      
      const startIdx = 1;
      if (segments.length > startIdx) {
        const seg1 = segments[startIdx];
        
        if (seg1 === "consumable") {
           items.push({ id: "consumable", path: createPath(startIdx) });
           if (segments.length > startIdx + 1) {
              const name = state.itemName || state.consumable?.name || segments[startIdx + 1];
              items.push({ id: name, path: createPath(startIdx + 1) });
              if (segments.length > startIdx + 2) {
                segments.slice(startIdx + 2).forEach((seg, i) => items.push({ id: seg, path: createPath(i + startIdx + 2) }));
              }
           }
        } else if (seg1 === "add") {
           items.push({ id: "add", path: createPath(startIdx) });
        } else if (seg1 === "add-new-ask") {
           // If we have an item name, show it as part of the trail
           if (state.itemName) {
              items.push({ id: state.itemName, path: createPath(startIdx) });
              items.push({ id: "add-new-ask", path: createPath(startIdx) });
           } else {
              items.push({ id: "add-new-ask", path: createPath(startIdx) });
           }
        } else if (seg1 === "restock") {
           // Handle /site-inventory/restock/add-stock
           const name = state.itemName || state.item?.name || "restock";
           items.push({ id: name, path: createPath(startIdx) });
           if (segments[startIdx + 1] === "add-stock") {
              items.push({ id: "restock", path: createPath(startIdx + 1) });
           }
        } else if (seg1 === "transfer-material") {
           // Handle /site-inventory/transfer-material/:id
           const name = state.itemName || state.item?.name || "Material";
           items.push({ id: name, path: createPath(startIdx) });
           if (segments.length > startIdx + 1) {
              items.push({ id: "transfer-material", path: createPath(startIdx + 1) });
           }
        } else {
           // Default: seg1 is likely an ID (e.g., /site-inventory/:id)
           const name = state.itemName || state.item?.name || seg1;
           items.push({ id: name, path: createPath(startIdx) });
           if (segments.length > startIdx + 1) {
              segments.slice(startIdx + 1).forEach((seg, i) => {
                let id = seg;
                if (seg === "edit") id = "editMaterial";
                items.push({ id: id, path: createPath(i + startIdx + 1) });
              });
           }
        }
      }
      return wrapWithContext(items);
    }

    // Handle builders and clients
    if (rootSegment === "builders" || rootSegment === "clients") {
      const items = [{ id: rootSegment, path: `/${rootSegment}` }];
      if (segments.length > 1) {
        if (segments[1] === "add") {
          items.push({ id: "add", path: createPath(1) });
        } else {
          // It's an ID
          const name = state.builderName || state.clientName || state.itemName || segments[1];
          items.push({ id: name, path: createPath(1) });
          if (segments.length > 2) {
            segments.slice(2).forEach((seg, i) => items.push({ id: seg, path: createPath(i + 2) }));
          }
        }
      }
      return wrapWithContext(items);
    }

    // Handle vendors routes
    if (rootSegment === "vendors") {
      const items = [{ id: "vendors", path: "/vendors" }];
      if (segments.length > 1) {
        if (segments[1] === "add") {
          items.push({ id: "addVendor", path: "/vendors/add" });
        } else {
          // It's an ID
          const name = state.vendorName || state.itemName || segments[1];
          items.push({ id: name, path: createPath(1) });
          if (segments.length > 2) {
            segments.slice(2).forEach((seg, i) => items.push({ id: seg, path: createPath(i + 2) }));
          }
        }
      }
      return wrapWithContext(items);
    }



    // 4. FINANCE
    if (rootSegment === "finance") {
      const items = getProjectPrefix("finance", "/finance");
      
      if (segments[1] === "projects" && segments.length > 2) {
        const pid = segments[2];
        const pName = projectName || projectNames[pid] || pid;
        
        // Only push project name if we didn't already get it from getProjectPrefix (which happens if fromProjects is true)
        if (!fromProjects) {
            items.push({ id: pName, path: `/finance/projects/${pid}` });
        }
        
        if (segments.length > 3) {
          // Push the sub-feature segment (e.g., 'builder-invoices', 'payment-received', etc.)
          items.push({ id: segments[3], path: createPath(3) });

          // Handle deeper nesting like 'sections'
          if (segments.length > 5 && segments[4] === "sections") {
             // We can either push 'sections' or skip it. Let's push it for clarity.
             items.push({ id: "sections", path: createPath(4) });
             
             // The specific section name (passed in state)
             const sName = state.sectionName || segments[5];
             items.push({ id: sName, path: createPath(5) });
             
             // If there's even more (unlikely for now), add it
             if (segments.length > 6) {
               segments.slice(6).forEach((seg, i) => items.push({ id: seg, path: createPath(i + 6) }));
             }
          } else if (segments.length > 4) {
             segments.slice(4).forEach((seg, i) => items.push({ id: seg, path: createPath(i + 4) }));
          }
        }
      } else if (segments.length > 1) {
        segments.slice(1).forEach((seg, i) => items.push({ id: seg, path: createPath(i + 1) }));
      }
      return wrapWithContext(items);
    }

// 5. DPR / DOCUMENTS / NOTES / GALLERY
if (["dpr", "documents", "notes", "gallery"].includes(rootSegment)) {
  const items = getProjectPrefix(rootSegment, `/${rootSegment}`);
  const pidIdx = segments.indexOf("projects");
  
  // Resolve Project ID from URL or state
  let projectId = null;
  if (pidIdx !== -1) projectId = segments[pidIdx + 1];
  else if (rootSegment === "gallery" && segments.length > 1) projectId = segments[1];
  else if (state.projectId) projectId = state.projectId;

  if (projectId && !fromProjects) {
    // Inject Project Name (similar to Finance behavior)
    items.push({
      id: projectName || projectNames[projectId] || projectId,
      path: `/${rootSegment}/${pidIdx !== -1 ? "projects/" : ""}${projectId}`
    });
  }

  const startIdx = pidIdx !== -1 ? pidIdx + 2 : (rootSegment === "gallery" ? 2 : 1);

  if (segments.length > startIdx) {
    segments.slice(startIdx).forEach((seg, i) => {
      let id = seg;
      const currentIdx = i + startIdx;

      // Feature-specific naming
      if (rootSegment === "notes") {
        if (seg === "add") id = "addNewNote";
        else if (seg === "edit") id = "editNote";
        else if (/^\d+$/.test(seg) && state.noteTitle) id = state.noteTitle;
      }

      if (rootSegment === "documents") {
        if (/^\d+$/.test(seg) && state.documentTitle) id = state.documentTitle;
      }

      if (seg === "documents" && rootSegment === "documents") return;
      if (seg === "projects" && pidIdx !== -1 && currentIdx === pidIdx) return;
      if (seg === projectId && currentIdx === (pidIdx !== -1 ? pidIdx + 1 : (rootSegment === "gallery" ? 1 : -1))) return;

      items.push({ id, path: createPath(currentIdx) });
    });
  }

  return wrapWithContext(items);
}


// 6. PAST WORK
if (rootSegment === "past-work") {
  const items = [{ id: "past-work", path: "/past-work" }];

  if (segments.length > 1) {
    if (segments[1] === "add") {
      items.push({ id: "addPastWork", path: "/past-work/add" });
    } else {
      const pid = segments[1];
      const pName = projectName || projectNames[pid] || pid;
      items.push({
        id: pName,
        path: `/past-work/${pid}`
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




    // 7. CALCULATION
    if (rootSegment === "construction-calculation") {
      const items = getProjectPrefix("construction-calculation", "/construction-calculation");
      if (segments.length > 1 && !fromProjects) {
          const pid = segments[1];
          items.push({ id: projectName || projectNames[pid] || pid, path: `/construction-calculation/${pid}` });
      }
      if (segments.length > 1) segments.slice(1).forEach((seg, i) => {
        if (seg === segments[1] && !fromProjects) return;
        if (seg === segments[1] && fromProjects) return;
        items.push({ id: seg, path: createPath(i + 1) });
      });
      return wrapWithContext(items);
    }

    return wrapWithContext(segments.map((seg, i) => ({ id: seg, path: createPath(i) })));
  }, [location.pathname, location.state, projectNames]);

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
