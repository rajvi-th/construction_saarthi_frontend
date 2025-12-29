/**
 * App Routes Configuration
 * Centralized routing for 400+ screen project
 * Uses lazy loading for better performance
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { ROUTES_FLAT, ROUTES } from '../constants/routes';
import ProtectedRoute from '../routes/ProtectedRoute';
import Layout from '../components/layout/Layout';
import Settings from '../pages/Settings';

// Lazy load components for better performance (important for 400+ screens)
// Auth Routes
const Login = lazy(() => import('../features/auth/pages/Login'));
const Register = lazy(() => import('../features/auth/pages/Register'));
const VerifyOTP = lazy(() => import('../features/auth/pages/VerifyOTP'));
const LanguageSelection = lazy(() => import('../features/auth/pages/LanguageSelection'));
const WorkspaceSelection = lazy(() => import('../features/auth/pages/WorkspaceSelection'));
const CreateWorkspace = lazy(() => import('../features/auth/pages/CreateWorkspace'));
const AddNewMember = lazy(() => import('../features/auth/pages/AddNewMember'));
const EditMember = lazy(() => import('../features/auth/pages/EditMember'));

// Dashboard
const Dashboard = lazy(() => import('../features/dashboard/pages/Dashboard'));
const Members = lazy(() => import('../features/dashboard/pages/Members'));

// Account
const MyAccount = lazy(() => import('../features/account/pages/MyAccount'));
const MyProfile = lazy(() => import('../features/account/pages/MyProfile'));
const ChangeLanguage = lazy(() => import('../features/account/pages/ChangeLanguage'));

// Business Card
const BusinessCard = lazy(() => import('../features/businessCard/pages/BusinessCard'));
const AddBusinessCard = lazy(() => import('../features/businessCard/pages/AddBusinessCard'));
const EditBusinessCard = lazy(() => import('../features/businessCard/pages/EditBusinessCard'));

// Refer & Earn
const ReferEarn = lazy(() => import('../features/refer_earn/pages/ReferEarn'));
const Wallet = lazy(() => import('../features/refer_earn/pages/Wallet'));

// Subscription
const Subscription = lazy(() => import('../features/subscription/pages/Subscription'));
const AddedMembers = lazy(() => import('../features/subscription/pages/AddedMembers'));
const Coupon = lazy(() => import('../features/subscription/pages/Coupon'));

// Site Inventory
const SiteInventory = lazy(() => import('../features/siteInventory/pages/SiteInventory'));
const AddSiteInventory = lazy(() => import('../features/siteInventory/pages/AddSiteInventory'));
const EditSiteInventory = lazy(() => import('../features/siteInventory/pages/EditSiteInventory'));
const InventoryItemDetails = lazy(() => import('../features/siteInventory/pages/InventoryItemDetails'));
const ConsumableItemDetails = lazy(() => import('../features/siteInventory/pages/ConsumableItemDetails'));
const AddNewAsk = lazy(() => import('../features/siteInventory/pages/AddNewAsk'));
const AddStock = lazy(() => import('../features/siteInventory/pages/AddStock'));
const TransferMaterial = lazy(() => import('../features/siteInventory/pages/TransferMaterial'));

// Builder Client
const Builders = lazy(() => import('../features/builderClient/pages/Builders'));
const AddBuilder = lazy(() => import('../features/builderClient/pages/AddBuilder'));
const EditBuilder = lazy(() => import('../features/builderClient/pages/EditBuilder'));

// Vendors
const Vendors = lazy(() => import('../features/vendors/pages/Vendors'));
const AddVendor = lazy(() => import('../features/vendors/pages/AddVendor'));
const EditVendor = lazy(() => import('../features/vendors/pages/EditVendor'));

// Past Projects
const PastProjects = lazy(() => import('../features/pastProject/pages/PastProjects'));
const AddPastProject = lazy(() => import('../features/pastProject/pages/AddPastProject'));
const PastProjectDetail = lazy(() => import('../features/pastProject/pages/PastProjectDetail'));
const EditPastProject = lazy(() => import('../features/pastProject/pages/EditPastProject'));

// Project Gallery
const ProjectGallery = lazy(() => import('../features/projectGallery/pages/ProjectGallery'));
const ProjectGalleryDetails = lazy(() => import('../features/projectGallery/pages/ProjectGalleryDetails'));
const UploadMedia = lazy(() => import('../features/projectGallery/pages/UploadMedia'));

// Projects
const Projects = lazy(() => import('../features/projects/pages/Projects'));
const ProjectDetails = lazy(() => import('../features/projects/pages/ProjectDetails'));
const AddNewProject = lazy(() => import('../features/projects/pages/AddNewProject'));

// Daily Progress Report
const DailyProgressReport = lazy(() => import('../features/dailyProgressReport/pages/DailyProgressReport'));
const ProjectReports = lazy(() => import('../features/dailyProgressReport/pages/ProjectReports'));
const ReportDetails = lazy(() => import('../features/dailyProgressReport/pages/ReportDetails'));
const AddReport = lazy(() => import('../features/dailyProgressReport/pages/AddReport'));

// Notes
const NotesList = lazy(() => import('../features/notes/pages/NotesList'));
const ProjectNotes = lazy(() => import('../features/notes/pages/ProjectNotes'));
const AddNote = lazy(() => import('../features/notes/pages/AddNote'));
const NoteDetails = lazy(() => import('../features/notes/pages/NoteDetails'));
const EditNote = lazy(() => import('../features/notes/pages/EditNote'));

// Labour Attendance
const LabourAttendanceProjectList = lazy(() => import('../features/labourAttendance/pages/ProjectList'));
const LabourAttendance = lazy(() => import('../features/labourAttendance/pages/LabourAttendance'));
const AddLabour = lazy(() => import('../features/labourAttendance/pages/AddLabour'));
const LabourDetails = lazy(() => import('../features/labourAttendance/pages/LabourDetails'));

// Documents
const GenerateDocuments = lazy(() => import('../features/documents/pages/GenerateDocuments'));
const ProjectDocuments = lazy(() => import('../features/documents/pages/ProjectDocuments'));
const DocumentDetails = lazy(() => import('../features/documents/pages/DocumentDetails'));

// Finance
const FinanceList = lazy(() => import('../features/finance/pages/FinanceList'));
const FinanceProjectDetail = lazy(() => import('../features/finance/pages/FinanceProjectDetail'));
const BuilderInvoices = lazy(() => import('../features/finance/pages/BuilderInvoices'));
const SectionDetail = lazy(() => import('../features/finance/pages/SectionDetail'));
const PaymentReceived = lazy(() => import('../features/finance/pages/PaymentReceived'));
const ExpensesToPay = lazy(() => import('../features/finance/pages/ExpensesToPay'));
const PayableBills = lazy(() => import('../features/finance/pages/PayableBills'));
const ExpensesPaid = lazy(() => import('../features/finance/pages/ExpensesPaid'));
const CreatePaymentEntry = lazy(() => import('../features/finance/pages/CreatePaymentEntry'));
const EditPaymentEntry = lazy(() => import('../features/finance/pages/EditPaymentEntry'));

// Loading Component for Suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader size="lg" />
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes - Auth */}
        <Route path={ROUTES_FLAT.LOGIN} element={<Login />} />
        <Route path={ROUTES_FLAT.REGISTER} element={<Register />} />
        <Route path={ROUTES_FLAT.VERIFY_OTP} element={<VerifyOTP />} />
        <Route path={ROUTES_FLAT.LANGUAGE_SELECTION} element={<LanguageSelection />} />
        <Route path={ROUTES_FLAT.WORKSPACE_SELECTION} element={<WorkspaceSelection />} />
        <Route path={ROUTES_FLAT.CREATE_WORKSPACE} element={<CreateWorkspace />} />
        <Route path={ROUTES_FLAT.ADD_NEW_MEMBER} element={<AddNewMember />} />
        <Route path={ROUTES_FLAT.EDIT_MEMBER} element={<EditMember />} />

        {/* Protected Routes - Will be added as features are developed */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path={ROUTES_FLAT.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES_FLAT.PROJECTS} element={<Projects />} />
            <Route path={ROUTES_FLAT.PROJECT_DETAILS} element={<ProjectDetails />} />
            <Route path={ROUTES_FLAT.ADD_NEW_PROJECT} element={<AddNewProject />} />
            <Route path={ROUTES_FLAT.EDIT_PROJECT} element={<AddNewProject />} />
            <Route path={ROUTES_FLAT.SETTINGS} element={<Settings />} />
            <Route path={ROUTES_FLAT.MEMBERS} element={<Members />} />
            <Route path={ROUTES_FLAT.MY_ACCOUNT} element={<MyAccount />} />
            <Route path={ROUTES_FLAT.MY_PROFILE} element={<MyProfile />} />
            <Route path={ROUTES_FLAT.CHANGE_LANGUAGE} element={<ChangeLanguage />} />
            <Route path={ROUTES_FLAT.BUSINESS_CARD} element={<BusinessCard />} />
            <Route path={ROUTES_FLAT.ADD_BUSINESS_CARD} element={<AddBusinessCard />} />
            <Route path={ROUTES_FLAT.EDIT_BUSINESS_CARD} element={<EditBusinessCard />} />
            <Route path={ROUTES_FLAT.REFER_EARN} element={<ReferEarn />} />
            <Route path={ROUTES_FLAT.REFER_EARN_WALLET} element={<Wallet />} />
            <Route path={ROUTES_FLAT.SUBSCRIPTION} element={<Subscription />} />
            <Route path={ROUTES_FLAT.SUBSCRIPTION_ADDED_MEMBERS} element={<AddedMembers />} />
            <Route path={ROUTES_FLAT.SUBSCRIPTION_COUPON} element={<Coupon />} />
            <Route path={ROUTES_FLAT.SITE_INVENTORY} element={<SiteInventory />} />
            <Route path={ROUTES_FLAT.ADD_SITE_INVENTORY} element={<AddSiteInventory />} />
            <Route path={ROUTES_FLAT.EDIT_SITE_INVENTORY} element={<EditSiteInventory />} />
            <Route path={ROUTES_FLAT.INVENTORY_ITEM_DETAILS} element={<InventoryItemDetails />} />
            <Route path={ROUTES_FLAT.CONSUMABLE_ITEM_DETAILS} element={<ConsumableItemDetails />} />
            <Route path={ROUTES_FLAT.ADD_NEW_ASK} element={<AddNewAsk />} />
            <Route path={ROUTES_FLAT.ADD_STOCK} element={<AddStock />} />
            <Route path={ROUTES_FLAT.TRANSFER_MATERIAL} element={<TransferMaterial />} />
            <Route path={ROUTES_FLAT.BUILDERS} element={<Builders />} />
            <Route path={ROUTES_FLAT.ADD_BUILDER} element={<AddBuilder />} />
            <Route path={ROUTES_FLAT.EDIT_BUILDER} element={<EditBuilder />} />
            <Route path={ROUTES_FLAT.VENDORS} element={<Vendors />} />
            <Route path={ROUTES_FLAT.ADD_VENDOR} element={<AddVendor />} />
            <Route path={ROUTES_FLAT.EDIT_VENDOR} element={<EditVendor />} />
            <Route path={ROUTES_FLAT.PAST_PROJECTS} element={<PastProjects />} />
            <Route path={ROUTES_FLAT.PAST_PROJECTS_ADD} element={<AddPastProject />} />
            <Route path={ROUTES_FLAT.PAST_PROJECTS_DETAILS} element={<PastProjectDetail />} />
            <Route path={ROUTES_FLAT.PAST_PROJECTS_EDIT} element={<EditPastProject />} />
            <Route path={ROUTES_FLAT.PROJECT_GALLERY} element={<ProjectGallery />} />
            <Route path={ROUTES_FLAT.PROJECT_GALLERY_DETAILS} element={<ProjectGalleryDetails />} />
            <Route path={ROUTES_FLAT.PROJECT_GALLERY_UPLOAD} element={<UploadMedia />} />
            <Route path={ROUTES_FLAT.DPR} element={<DailyProgressReport />} />
            <Route path={ROUTES_FLAT.DPR_PROJECT_REPORTS} element={<ProjectReports />} />
            <Route path={ROUTES_FLAT.DPR_REPORT_DETAILS} element={<ReportDetails />} />
            <Route path={ROUTES_FLAT.DPR_ADD_REPORT} element={<AddReport />} />
            <Route path={ROUTES_FLAT.NOTES} element={<NotesList />} />
            <Route path={ROUTES_FLAT.NOTES_PROJECT_NOTES} element={<ProjectNotes />} />
            <Route path={ROUTES_FLAT.NOTES_ADD} element={<AddNote />} />
            <Route path={ROUTES_FLAT.NOTES_DETAILS} element={<NoteDetails />} />
            <Route path={ROUTES_FLAT.NOTES_EDIT} element={<EditNote />} />
            <Route path={ROUTES_FLAT.LABOUR_ATTENDANCE} element={<LabourAttendanceProjectList />} />
            <Route path={ROUTES_FLAT.LABOUR_ATTENDANCE_PROJECT} element={<LabourAttendance />} />
            <Route path={ROUTES_FLAT.LABOUR_ATTENDANCE_ADD_LABOUR} element={<AddLabour />} />
            <Route path={ROUTES_FLAT.LABOUR_ATTENDANCE_LABOUR_DETAILS} element={<LabourDetails />} />
            <Route path={ROUTES_FLAT.DOCUMENTS} element={<GenerateDocuments />} />
            <Route path={ROUTES_FLAT.DOCUMENTS_PROJECT_DOCUMENTS} element={<ProjectDocuments />} />
            <Route path={ROUTES_FLAT.DOCUMENTS_DOCUMENT_DETAILS} element={<DocumentDetails />} />
            <Route path={ROUTES_FLAT.FINANCE} element={<FinanceList />} />
            <Route path={ROUTES_FLAT.FINANCE_PROJECT_DETAILS} element={<FinanceProjectDetail />} />
            <Route path={ROUTES_FLAT.FINANCE_SECTION_DETAIL} element={<SectionDetail />} />
            <Route path={ROUTES_FLAT.FINANCE_BUILDER_INVOICES} element={<BuilderInvoices />} />
            <Route path={ROUTES_FLAT.FINANCE_PAYMENT_RECEIVED} element={<PaymentReceived />} />
            <Route path={ROUTES_FLAT.FINANCE_EXPENSES_TO_PAY} element={<ExpensesToPay />} />
            <Route path={ROUTES_FLAT.FINANCE_PAYABLE_BILLS_SECTION} element={<PayableBills />} />
            <Route path={ROUTES_FLAT.FINANCE_EXPENSES_PAID} element={<ExpensesPaid />} />
            <Route path={ROUTES_FLAT.FINANCE_CREATE_PAYMENT_ENTRY} element={<CreatePaymentEntry />} />
            <Route path={ROUTES_FLAT.FINANCE_EDIT_PAYMENT_ENTRY} element={<EditPaymentEntry />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={ROUTES_FLAT.LOGIN} replace />} />

        {/* 404 - Not Found */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
                <p className="text-secondary mb-4">Page not found</p>
                <Link to={ROUTES_FLAT.LOGIN} className="text-accent hover:underline">
                  Go to Login
                </Link>
              </div>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
