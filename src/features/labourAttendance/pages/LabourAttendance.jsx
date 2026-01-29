import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import LabourAttendanceCards from '../components/LabourAttendanceCards';
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';
import FilterModal from "../../../components/ui/FilterModal";
import DatePicker from "../../../components/ui/DatePicker";
import { Download } from "lucide-react";
import addCircleIcon from "../../../assets/icons/Add Circle.svg";
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import { useLabourAttendance } from '../hooks/useLabourAttendance';
import { useLabourAttendanceActions } from '../hooks/useLabourAttendanceActions';
import { formatCurrencyINR } from '../utils/formatting';
import { useAuth } from '../../../features/auth/store';
import { useProjectsAll } from '../hooks/useProjectsAll';
import { useCategories } from '../hooks/useCategories';
import EmptyState from '../../../components/shared/EmptyState';
import EmptyStateSvg from '../../../assets/icons/EmptyState.svg';

function LabourAttendance() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation('labourAttendance');
    const { state } = useLocation();
    const { selectedWorkspace } = useAuth();
    const { projects } = useProjectsAll(selectedWorkspace);
    const { categories } = useCategories(selectedWorkspace);

    const {
        deletedLabourId,
        sortedShiftTypes,
        activeShiftId,
        setActiveShiftId,
        filteredLabourList,
        summary,
        isLoadingLabours,
        refetchLabours,
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
        handleStatusChange,
        handleMarkPaidLeave,
        handleDeleteLabour,
        handleFilterApply,
        handleFilterReset,
        appliedFilters,
    } = useLabourAttendance();

    // Compute projectName in component to ensure it's reactive to language changes
    const projectName = state?.projectName || t('common.labourAttendance');

    // State to receive attendanceData and overtimeData from LabourAttendanceCards
    const [attendanceDataFromCards, setAttendanceDataFromCards] = useState({});
    const [overtimeDataFromCards, setOvertimeDataFromCards] = useState({});

    // Memoize callback to prevent infinite loops
    const handleAttendanceDataChange = useCallback((attendanceData, overtimeData) => {
        setAttendanceDataFromCards(attendanceData);
        setOvertimeDataFromCards(overtimeData);
    }, []);

    // Apply status filter based on attendance data
    const finalFilteredLabourList = useMemo(() => {
        let list = filteredLabourList;

        // Apply status filter if set
        if (appliedFilters.status) {
            list = list.filter((labour) => {
                const labourIdNum = Number(labour.id);
                const labourIdStr = String(labour.id);
                const attendanceInfo = attendanceDataFromCards[labourIdNum] || attendanceDataFromCards[labourIdStr];
                const currentStatus = attendanceInfo?.status || null;
                return currentStatus === appliedFilters.status;
            });
        }

        return list;
    }, [filteredLabourList, appliedFilters.status, attendanceDataFromCards]);

    const { handleDownload, handleAddReport } = useLabourAttendanceActions({
        projectName,
        activeShiftId,
        sortedShiftTypes,
        dateRange,
        summary,
        filteredLabourList,
        projectId,
        fromProjects: state?.fromProjects,
        fromDashboard: state?.fromDashboard,
    });

    // Handle navigation when labour is deleted
    useEffect(() => {
        if (!deletedLabourId) return;
        // Clear state so it doesn't re-run on refresh/back
        navigate(
            getRoute(ROUTES_FLAT.LABOUR_ATTENDANCE_PROJECT, { projectId }),
            { replace: true, state: { projectName } }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deletedLabourId]);

    // Dynamic project options - similar to AddLabourForm
    const projectOptions = useMemo(() => {
        const list = Array.isArray(projects) ? projects : [];
        return list.map((p) => ({
            label: p?.name || p?.project_name || p?.label || '',
            value: String(p?.id || p?.project_id || p?.value || ''),
        })).filter((o) => o.value);
    }, [projects]);

    // Dynamic category options - similar to AddLabourForm
    const categoryOptions = useMemo(() => {
        const list = Array.isArray(categories) ? categories : [];
        return list.map((c) => ({
            label: c?.name || c?.label || '',
            value: String(c?.id || c?.category_id || c?.value || ''),
        })).filter((o) => o.value);
    }, [categories]);

    // FILTER_CONFIG with translations - reactive to language changes
    const FILTER_CONFIG = useMemo(() => [
        {
            id: 'projects',
            label: t('addLabourForm.assignToProject'),
            type: 'dropdown',
            placeholder: t('addLabourForm.selectProject'),
            options: projectOptions,
        },
        {
            id: 'category',
            label: t('addLabourForm.category'),
            type: 'dropdown',
            placeholder: t('addLabourForm.selectCategory'),
            options: categoryOptions,
        },
        {
            id: 'receiverName',
            label: t('projectList.status'),
            type: 'radio',
            options: [
                { label: t('attendancePage.summary.present'), value: 'fullDay' },
                { label: t('attendancePage.summary.halfDay'), value: 'halfDay' },
                { label: t('attendancePage.summary.absent'), value: 'absent' },
            ],
        },
        {
            id: 'shift',
            label: t('addLabourForm.shiftType'),
            type: 'checkbox',
            options: [
                { label: t('attendancePage.morning'), value: 'morning' },
                { label: t('attendancePage.evening'), value: 'evening' },
            ],
        },
    ], [t, projectOptions, categoryOptions]);



    // Calculate summary from attendanceData (from API) instead of labour.status
    const calculatedSummary = useMemo(() => {
        let present = 0;
        let absent = 0;
        let halfDay = 0;
        let overtime = 0;
        let totalPayable = 0;

        finalFilteredLabourList.forEach((labour) => {
            const labourIdNum = Number(labour.id);
            const labourIdStr = String(labour.id);
            const attendanceInfo = attendanceDataFromCards[labourIdNum] || attendanceDataFromCards[labourIdStr];
            // Only use status from attendanceData, don't fallback to labour.status
            const currentStatus = attendanceInfo?.status || null;

            // Count by status
            if (currentStatus === 'P') {
                present++;
            } else if (currentStatus === 'H') {
                halfDay++;
            } else if (currentStatus === 'OT') {
                overtime++;
                present++; // OT also counts as Present
            } else if (currentStatus === 'A') {
                absent++;
            }

            // Calculate payable amount
            const dailyWage = attendanceInfo?.daily_wage || labour.pay || 0;
            let payableAmount = 0;

            if (currentStatus === 'P') {
                payableAmount = dailyWage;
            } else if (currentStatus === 'H') {
                payableAmount = dailyWage / 2;
            } else if (currentStatus === 'OT') {
                const basePay = dailyWage;
                const otData = overtimeDataFromCards[labour.id];
                if (otData && otData.ratePerHour && otData.otHours) {
                    const overtimePay = Number(otData.ratePerHour) * Number(otData.otHours);
                    payableAmount = basePay + overtimePay;
                } else {
                    payableAmount = basePay;
                }
            } else {
                // Absent or Unmarked
                payableAmount = 0;
            }

            // Use API payable_amount if available and > 0, otherwise use calculated
            const apiPayable = attendanceInfo?.payable_amount;
            if (apiPayable !== undefined && apiPayable !== null && apiPayable > 0) {
                totalPayable += apiPayable;
            } else {
                totalPayable += payableAmount;
            }
        });

        return { present, absent, halfDay, overtime, totalPayable };
    }, [finalFilteredLabourList, attendanceDataFromCards, overtimeDataFromCards]);

    const summaryCards = [
        {
            title: t('attendancePage.summary.present'),
            value: String(calculatedSummary.present),
            border: '#34C75914',
            bg: '#34C7590A',
            valueColor: '#34C759',
        },
        {
            title: t('attendancePage.summary.absent'),
            value: String(calculatedSummary.absent),
            border: '#B02E0C14',
            bg: '#B02E0C0A',
            valueColor: '#B02E0C',
        },
        {
            title: t('attendancePage.summary.halfDay'),
            value: String(calculatedSummary.halfDay),
            border: '#FF950014',
            bg: '#FF95000A',
            valueColor: '#FF9500',
        },
        {
            title: t('attendancePage.summary.totalPay'),
            value: formatCurrencyINR(calculatedSummary.totalPayable),
            border: 'var(--color-lightGray)',
            bg: '#F6F6F6',
            valueColor: 'var(--color-primary)',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="w-full">
                <div className="mx-auto">

                    {/* ================= SMALL SCREEN HEADER ================= */}
                    <div className="flex items- justify-between w-full xl:hidden">
                        <PageHeader title={projectName} />

                        <button
                            type="button"
                            className="h-10 flex gap-2 whitespace-nowrap text-accent"
                            onClick={handleAddReport}
                        >
                            <img src={addCircleIcon} alt={t('common.addLabour')} className="w-5 h-5" />
                            {t('common.addLabour')}
                        </button>
                    </div>

                    {/* ================= MAIN HEADER ================= */}
                    <div className="flex flex-col xl:flex-row xl:justify-between gap-0 xl:gap-3 items-start w-full">

                        {/* LEFT: Page Header (xl only) */}
                        <div className="hidden xl:block">
                            <PageHeader title={projectName} />
                        </div>

                        {/* RIGHT: Controls */}
                        <div className="flex flex-col xl:flex-row gap-2 w-full xl:flex-1 xl:justify-end">

                            {/* ================= ROW 1 ================= */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full xl:max-w-[400px]">
                                <SearchBar
                                    placeholder={t('attendancePage.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full"
                                />

                                <DatePicker
                                    value={dateRange}
                                    onChange={setDateRange}
                                    placeholder={t('attendancePage.datePlaceholder')}
                                    className="w-full"
                                />
                            </div>

                            {/* ================= ROW 2 ================= */}
                            <div className="
                                grid grid-cols-1 sm:grid-cols-2
                                xl:flex xl:flex-nowrap
                                gap-2
                                xl:pr-4
                                w-full xl:w-fit
                                ">

                                {/* Filter */}
                                <div className="w-full xl:min-w-[100px]">
                                    <FilterModal
                                        filters={FILTER_CONFIG}
                                        onApply={handleFilterApply}
                                        onReset={handleFilterReset}
                                        placeholder={t('common.filter')}
                                        className="!h-10 w-full"
                                    />
                                </div>

                                {/* Download */}
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleDownload}
                                    leftIcon={<Download className="text-primary-light w-5 h-5" />}
                                    className="h-10 px-4 whitespace-nowrap bg-white w-full xl:w-auto"
                                >
                                    {t('common.downloadReport')}
                                </Button>

                                {/* Add Labour (xl+ only) */}
                                <button
                                    type="button"
                                    className="
                                                hidden xl:flex
                                                h-10 items-center gap-2
                                                whitespace-nowrap text-accent
                                                justify-center
                                                shrink-0 cursor-pointer
                                                "
                                    onClick={handleAddReport}
                                >
                                    <img src={addCircleIcon} alt={t('common.addLabour')} className="w-5 h-5" />
                                    {t('common.addLabour')}
                                </button>

                            </div>
                        </div>

                    </div>
                </div>
            </div>



            {/* Shift Tabs */}
            <div className="flex gap-8 border-b mt-8" style={{ borderColor: 'var(--color-lightGray)' }}>
                {sortedShiftTypes.map((shift) => {
                    const isActive = String(activeShiftId) === String(shift.id);
                    return (
                        <button
                            key={shift.id}
                            type="button"
                            onClick={() => setActiveShiftId(shift.id)}
                            className={`pb-3 text-sm px-8 cursor-pointer ${isActive ? 'font-medium text-accent' : 'text-primary-light'}`}
                            style={
                                isActive
                                    ? { borderBottom: '2px solid var(--color-accent)' }
                                    : { borderBottom: '2px solid transparent' }
                            }
                        >
                            {shift.name} {t('common.shift', { defaultValue: 'shift' })}
                        </button>
                    );
                })}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {summaryCards.map((card) => (
                    <div
                        key={card.title}
                        className="rounded-xl p-4 text-center"
                        style={{
                            border: `1px solid ${card.border}`,
                            backgroundColor: card.bg,
                        }}
                    >
                        <p className="text-sm text-primary">{card.title}</p>
                        <p className="text-[22px] font-medium mt-1" style={{ color: card.valueColor }}>
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Labour list */}
            <div className="mt-6">
                {!isLoadingLabours && finalFilteredLabourList.length === 0 ? (
                    <EmptyState
                        image={EmptyStateSvg}
                        title={t('common.noLabourFound', { defaultValue: 'No Labor Found' })}
                        message={t('common.noLabourMessage', { defaultValue: 'Add labor to this project to start tracking attendance' })}
                        actionLabel={t('common.addLabour')}
                        onAction={handleAddReport}
                    />
                ) : (
                    <LabourAttendanceCards
                        projectId={projectId}
                        projectName={projectName}
                        labourList={finalFilteredLabourList}
                        onStatusChange={handleStatusChange}
                        onMarkPaidLeave={handleMarkPaidLeave}
                        onDeleteLabour={handleDeleteLabour}
                        onRefresh={refetchLabours}
                        isLoading={isLoadingLabours}
                        dateRange={dateRange}
                        onAttendanceDataChange={handleAttendanceDataChange}
                    />
                )}
            </div>
        </div>
    );
}

export default LabourAttendance;
