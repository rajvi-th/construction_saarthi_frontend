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
// Calculation - LandingPage & Common
const CalculationProjects = lazy(() => import('../calculation/LandingPage/pages/Projects'));
const ProjectCalDetails = lazy(() => import('../calculation/LandingPage/pages/ProjectCalDetails'));
const History = lazy(() => import('../calculation/LandingPage/pages/History'));
const ComingSoon = lazy(() => import('../calculation/common/ComingSoon'));

// Calculation - Steel
// Steel - LandingPage
const SteelQuantities = lazy(() => import('../calculation/steel/LandingPage/pages/SteelQuantities'));

// Steel - Weight
const ReinforcementWeight = lazy(() => import('../calculation/steel/weight/pages/ReinforcementWeight'));
const ReinforcementDetailedReport = lazy(() => import('../calculation/steel/weight/pages/ReinforcementDetailedReport'));
const ReinforcementHistory = lazy(() => import('../calculation/steel/weight/pages/ReinforcementHistory'));

// Steel - Footing
const FootingType1 = lazy(() => import('../calculation/steel/footing/pages/FootingType1'));
const FootingType1Detailed = lazy(() => import('../calculation/steel/footing/pages/FootingType1Detailed'));
const FootingType2 = lazy(() => import('../calculation/steel/footing/pages/FootingType2'));
const FootingType2Detailed = lazy(() => import('../calculation/steel/footing/pages/FootingType2Detailed'));

// Steel - Beam
const BeamType1 = lazy(() => import('../calculation/steel/beam/pages/BeamType1'));
const BeamType1Detailed = lazy(() => import('../calculation/steel/beam/pages/BeamType1Detailed'));
const BeamType2 = lazy(() => import('../calculation/steel/beam/pages/BeamType2'));
const BeamType2Detailed = lazy(() => import('../calculation/steel/beam/pages/BeamType2Detailed'));
const BeamType3 = lazy(() => import('../calculation/steel/beam/pages/BeamType3'));
const BeamType3Detailed = lazy(() => import('../calculation/steel/beam/pages/BeamType3Detailed'));
const BeamType4 = lazy(() => import('../calculation/steel/beam/pages/BeamType4'));
const BeamType4Detailed = lazy(() => import('../calculation/steel/beam/pages/BeamType4Detailed'));
const BeamType5 = lazy(() => import('../calculation/steel/beam/pages/BeamType5'));
const BeamType5Detailed = lazy(() => import('../calculation/steel/beam/pages/BeamType5Detailed'));
const BeamType6 = lazy(() => import('../calculation/steel/beam/pages/BeamType6'));
const BeamType6Detailed = lazy(() => import('../calculation/steel/beam/pages/BeamType6Detailed'));
const BeamType7 = lazy(() => import('../calculation/steel/beam/pages/BeamType7'));
const BeamType7Detailed = lazy(() => import('../calculation/steel/beam/pages/BeamType7Detailed'));
const BeamType8 = lazy(() => import('../calculation/steel/beam/pages/BeamType8'));
const BeamType8Detailed = lazy(() => import('../calculation/steel/beam/pages/BeamType8Detailed'));
const BeamType9 = lazy(() => import('../calculation/steel/beam/pages/BeamType9'));
const BeamType9Detailed = lazy(() => import('../calculation/steel/beam/pages/BeamType9Detailed'));
const BeamType10 = lazy(() => import('../calculation/steel/beam/pages/BeamType10'));
const BeamType10Detailed = lazy(() => import('../calculation/steel/beam/pages/BeamType10Detailed'));
const BeamHorizontalBar = lazy(() => import('../calculation/steel/beam/pages/BeamHorizontalBar'));
const BeamHorizontalBarDetailed = lazy(() => import('../calculation/steel/beam/pages/BeamHorizontalBarDetailed'));
const BeamRingType1 = lazy(() => import('../calculation/steel/beam/pages/BeamRingType1'));
const BeamRingType1Detailed = lazy(() => import('../calculation/steel/beam/pages/BeamRingType1Detailed'));
const BeamRingType2 = lazy(() => import('../calculation/steel/beam/pages/BeamRingType2'));
const BeamRingType2Detailed = lazy(() => import('../calculation/steel/beam/pages/BeamRingType2Detailed'));

// Steel - Column
const ColumnType1 = lazy(() => import('../calculation/steel/column/pages/ColumnType1'));
const ColumnType1Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnType1Detailed'));
const ColumnType2 = lazy(() => import('../calculation/steel/column/pages/ColumnType2'));
const ColumnType2Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnType2Detailed'));
const ColumnType3 = lazy(() => import('../calculation/steel/column/pages/ColumnType3'));
const ColumnType3Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnType3Detailed'));
const ColumnType4 = lazy(() => import('../calculation/steel/column/pages/ColumnType4'));
const ColumnType4Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnType4Detailed'));
const ColumnType5 = lazy(() => import('../calculation/steel/column/pages/ColumnType5'));
const ColumnType5Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnType5Detailed'));
const ColumnType6 = lazy(() => import('../calculation/steel/column/pages/ColumnType6'));
const ColumnType6Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnType6Detailed'));
const ColumnType7 = lazy(() => import('../calculation/steel/column/pages/ColumnType7'));
const ColumnType7Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnType7Detailed'));
const ColumnType8 = lazy(() => import('../calculation/steel/column/pages/ColumnType8'));
const ColumnType8Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnType8Detailed'));
const ColumnType9 = lazy(() => import('../calculation/steel/column/pages/ColumnType9'));
const ColumnType9Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnType9Detailed'));
const ColumnType10 = lazy(() => import('../calculation/steel/column/pages/ColumnType10'));
const ColumnType10Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnType10Detailed'));
const ColumnType11 = lazy(() => import('../calculation/steel/column/pages/ColumnType11'));
const ColumnType11Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnType11Detailed'));
const ColumnType12 = lazy(() => import('../calculation/steel/column/pages/ColumnType12'));
const ColumnType12Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnType12Detailed'));
const ColumnVerticalSteel = lazy(() => import('../calculation/steel/column/pages/ColumnVerticalSteel'));
const ColumnVerticalSteelDetailed = lazy(() => import('../calculation/steel/column/pages/ColumnVerticalSteelDetailed'));
const ColumnRingType1 = lazy(() => import('../calculation/steel/column/pages/ColumnRingType1'));
const ColumnRingType1Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnRingType1Detailed'));
const ColumnRingType2 = lazy(() => import('../calculation/steel/column/pages/ColumnRingType2'));
const ColumnRingType2Detailed = lazy(() => import('../calculation/steel/column/pages/ColumnRingType2Detailed'));

// Steel - Slab
const SlabType1 = lazy(() => import('../calculation/steel/slab/pages/SlabType1'));
const SlabType1Detailed = lazy(() => import('../calculation/steel/slab/pages/SlabType1Detailed'));
const SlabType2 = lazy(() => import('../calculation/steel/slab/pages/SlabType2'));
const SlabType2Detailed = lazy(() => import('../calculation/steel/slab/pages/SlabType2Detailed'));
const SlabType3 = lazy(() => import('../calculation/steel/slab/pages/SlabType3'));
const SlabType3Detailed = lazy(() => import('../calculation/steel/slab/pages/SlabType3Detailed'));

// Steel - Cutting Length
const StraightBar = lazy(() => import('../calculation/steel/cutting-length/pages/StraightBar'));
const StraightBarDetailed = lazy(() => import('../calculation/steel/cutting-length/pages/StraightBarDetailed'));
const LShapeBar = lazy(() => import('../calculation/steel/cutting-length/pages/LShapeBar'));
const LShapeBarDetailed = lazy(() => import('../calculation/steel/cutting-length/pages/LShapeBarDetailed'));
const UShapeBar = lazy(() => import('../calculation/steel/cutting-length/pages/UShapeBar'));
const UShapeBarDetailed = lazy(() => import('../calculation/steel/cutting-length/pages/UShapeBarDetailed'));
const Stirrups = lazy(() => import('../calculation/steel/cutting-length/pages/Stirrups'));
const StirrupsDetailed = lazy(() => import('../calculation/steel/cutting-length/pages/StirrupsDetailed'));





// Calculation - Concrete
// Concrete - LandingPage
const Concrete = lazy(() => import('../calculation/concrete/LandingPage/pages/Concrete'));

// Concrete - Volume
const ConcreteByVolume = lazy(() => import('../calculation/concrete/volume/pages/ConcreteByVolume'));
const ConcreteByVolumeDetailedReport = lazy(() => import('../calculation/concrete/volume/pages/ConcreteByVolumeDetailedReport'));

// Concrete - Column
const ConcreteSquareColumn = lazy(() => import('../calculation/concrete/column/pages/ConcreteSquareColumn'));
const ConcreteRectangularColumn = lazy(() => import('../calculation/concrete/column/pages/ConcreteRectangularColumn'));
const ConcreteRoundColumn = lazy(() => import('../calculation/concrete/column/pages/ConcreteRoundColumn'));

// Concrete - Footing
const ConcreteBoxFooting = lazy(() => import('../calculation/concrete/footing/pages/ConcreteBoxFooting'));
const ConcreteTrapezoidalFooting = lazy(() => import('../calculation/concrete/footing/pages/ConcreteTrapezoidalFooting'));

// Concrete - Staircase
const StraightStaircase = lazy(() => import('../calculation/concrete/staircase/pages/StraightStaircase'));
const DogLeggedStaircase = lazy(() => import('../calculation/concrete/staircase/pages/DogLeggedStaircase'));

// Concrete - Wall
const WallShape1 = lazy(() => import('../calculation/concrete/wall/pages/WallShape1'));
const WallShape2 = lazy(() => import('../calculation/concrete/wall/pages/WallShape2'));

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
            {/* Calculation - LandingPage & Common */}
            <Route path={ROUTES_FLAT.CALCULATION_PROJECTS} element={<CalculationProjects />} />
            <Route path={ROUTES_FLAT.CALCULATION_PROJECT_DETAILS} element={<ProjectCalDetails />} />
            <Route path={ROUTES_FLAT.CALCULATION_HISTORY} element={<History />} />
            <Route path="/calculation/coming-soon" element={<ComingSoon />} />

            {/* Calculation - Steel */}
            {/* Steel - LandingPage */}
            <Route path={ROUTES_FLAT.CALCULATION_STEEL_QUANTITIES} element={<SteelQuantities />} />

            {/* Steel - Weight */}
            <Route path={ROUTES_FLAT.CALCULATION_REINFORCEMENT_WEIGHT} element={<ReinforcementWeight />} />
            <Route path={ROUTES_FLAT.CALCULATION_REINFORCEMENT_WEIGHT_DETAILED} element={<ReinforcementDetailedReport />} />
            <Route path={ROUTES_FLAT.CALCULATION_REINFORCEMENT_WEIGHT_HISTORY} element={<ReinforcementHistory />} />

            {/* Steel - Footing */}
            <Route path={ROUTES_FLAT.CALCULATION_FOOTING_TYPE1} element={<FootingType1 />} />
            <Route path={ROUTES_FLAT.CALCULATION_FOOTING_TYPE1_DETAILED} element={<FootingType1Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_FOOTING_TYPE2} element={<FootingType2 />} />
            <Route path={ROUTES_FLAT.CALCULATION_FOOTING_TYPE2_DETAILED} element={<FootingType2Detailed />} />

            {/* Steel - Beam */}
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE1} element={<BeamType1 />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE1_DETAILED} element={<BeamType1Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE2} element={<BeamType2 />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE2_DETAILED} element={<BeamType2Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE3} element={<BeamType3 />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE3_DETAILED} element={<BeamType3Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE4} element={<BeamType4 />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE4_DETAILED} element={<BeamType4Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE5} element={<BeamType5 />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE5_DETAILED} element={<BeamType5Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE6} element={<BeamType6 />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE6_DETAILED} element={<BeamType6Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE7} element={<BeamType7 />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE7_DETAILED} element={<BeamType7Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE8} element={<BeamType8 />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE8_DETAILED} element={<BeamType8Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE9} element={<BeamType9 />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE9_DETAILED} element={<BeamType9Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE10} element={<BeamType10 />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_TYPE10_DETAILED} element={<BeamType10Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_HORIZONTAL} element={<BeamHorizontalBar />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_HORIZONTAL_DETAILED} element={<BeamHorizontalBarDetailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_RING_TYPE1} element={<BeamRingType1 />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_RING_TYPE1_DETAILED} element={<BeamRingType1Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_RING_TYPE2} element={<BeamRingType2 />} />
            <Route path={ROUTES_FLAT.CALCULATION_BEAM_RING_TYPE2_DETAILED} element={<BeamRingType2Detailed />} />

            {/* Steel - Slab */}
            <Route path={ROUTES_FLAT.CALCULATION_SLAB_TYPE1} element={<SlabType1 />} />
            <Route path={ROUTES_FLAT.CALCULATION_SLAB_TYPE1_DETAILED} element={<SlabType1Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_SLAB_TYPE2} element={<SlabType2 />} />
            <Route path={ROUTES_FLAT.CALCULATION_SLAB_TYPE2_DETAILED} element={<SlabType2Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_SLAB_TYPE3} element={<SlabType3 />} />
            <Route path={ROUTES_FLAT.CALCULATION_SLAB_TYPE3_DETAILED} element={<SlabType3Detailed />} />

            {/* Steel - Cutting Length */}
            <Route path={ROUTES_FLAT.CALCULATION_STRAIGHT_BAR} element={<StraightBar />} />
            <Route path={ROUTES_FLAT.CALCULATION_STRAIGHT_BAR_DETAILED} element={<StraightBarDetailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_L_SHAPE_BAR} element={<LShapeBar />} />
            <Route path={ROUTES_FLAT.CALCULATION_L_SHAPE_BAR_DETAILED} element={<LShapeBarDetailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_U_SHAPE_BAR} element={<UShapeBar />} />
            <Route path={ROUTES_FLAT.CALCULATION_U_SHAPE_BAR_DETAILED} element={<UShapeBarDetailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_STIRRUPS} element={<Stirrups />} />
            <Route path={ROUTES_FLAT.CALCULATION_STIRRUPS_DETAILED} element={<StirrupsDetailed />} />





            {/* Steel - Column */}
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE1} element={<ColumnType1 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE1_DETAILED} element={<ColumnType1Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE2} element={<ColumnType2 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE2_DETAILED} element={<ColumnType2Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE3} element={<ColumnType3 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE3_DETAILED} element={<ColumnType3Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE4} element={<ColumnType4 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE4_DETAILED} element={<ColumnType4Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE5} element={<ColumnType5 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE5_DETAILED} element={<ColumnType5Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE6} element={<ColumnType6 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE6_DETAILED} element={<ColumnType6Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE7} element={<ColumnType7 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE7_DETAILED} element={<ColumnType7Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE8} element={<ColumnType8 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE8_DETAILED} element={<ColumnType8Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE9} element={<ColumnType9 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE9_DETAILED} element={<ColumnType9Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE10} element={<ColumnType10 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE10_DETAILED} element={<ColumnType10Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE11} element={<ColumnType11 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE11_DETAILED} element={<ColumnType11Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE12} element={<ColumnType12 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_TYPE12_DETAILED} element={<ColumnType12Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_VERTICAL_STEEL} element={<ColumnVerticalSteel />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_VERTICAL_STEEL_DETAILED} element={<ColumnVerticalSteelDetailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_RING_TYPE1} element={<ColumnRingType1 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_RING_TYPE1_DETAILED} element={<ColumnRingType1Detailed />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_RING_TYPE2} element={<ColumnRingType2 />} />
            <Route path={ROUTES_FLAT.CALCULATION_COLUMN_RING_TYPE2_DETAILED} element={<ColumnRingType2Detailed />} />

            {/* Calculation - Concrete */}
            {/* Concrete - LandingPage */}
            <Route path={ROUTES_FLAT.CALCULATION_CONCRETE} element={<Concrete />} />

            {/* Concrete - Volume */}
            <Route path={ROUTES_FLAT.CALCULATION_CONCRETE_BY_VOLUME} element={<ConcreteByVolume />} />
            <Route path={ROUTES_FLAT.CALCULATION_CONCRETE_BY_VOLUME_DETAILED} element={<ConcreteByVolumeDetailedReport />} />

            {/* Concrete - Column */}
            <Route path={ROUTES_FLAT.CALCULATION_CONCRETE_SQUARE_COLUMN} element={<ConcreteSquareColumn />} />
            <Route path={ROUTES_FLAT.CALCULATION_CONCRETE_RECTANGULAR_COLUMN} element={<ConcreteRectangularColumn />} />
            <Route path={ROUTES_FLAT.CALCULATION_CONCRETE_ROUND_COLUMN} element={<ConcreteRoundColumn />} />

            {/* Concrete - Footing */}
            <Route path={ROUTES_FLAT.CALCULATION_CONCRETE_BOX_FOOTING} element={<ConcreteBoxFooting />} />
            <Route path={ROUTES_FLAT.CALCULATION_CONCRETE_TRAPEZOIDAL_FOOTING} element={<ConcreteTrapezoidalFooting />} />

            {/* Concrete - Staircase */}
            <Route path={ROUTES_FLAT.STRAIGHT_STAIRCASE} element={<StraightStaircase />} />
            <Route path={ROUTES_FLAT.DOG_LEGGED_STAIRCASE} element={<DogLeggedStaircase />} />

            {/* Concrete - Wall */}
            <Route path="/calculation/concrete/wall/shape1" element={<WallShape1 />} />
            <Route path="/calculation/concrete/wall/shape2" element={<WallShape2 />} />
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
