import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../features/auth/store';
import { useShiftTypes } from './useShiftTypes';
import { useProjectLabours } from './useProjectLabours';
import { showSuccess, showLoading, updateToast } from '../../../utils/toast';
import { deleteLabour } from '../api/labourAttendanceApi';

/**
 * Hook for managing labour attendance state, filtering, and data processing
 */
export const useLabourAttendance = () => {
  const { projectId } = useParams();
  const { state } = useLocation();
  const { selectedWorkspace } = useAuth();
  const { t } = useTranslation('labourAttendance');

  const deletedLabourId = state?.deletedLabourId;

  // Shift management
  const { shiftTypes } = useShiftTypes();
  const sortedShiftTypes = useMemo(() => {
    const list = Array.isArray(shiftTypes) ? shiftTypes : [];
    return [...list].sort((a, b) => Number(a?.id || 0) - Number(b?.id || 0));
  }, [shiftTypes]);

  const [activeShiftId, setActiveShiftId] = useState('');
  useEffect(() => {
    if (!activeShiftId && sortedShiftTypes.length > 0) {
      setActiveShiftId(String(sortedShiftTypes[0]?.id || ''));
    }
  }, [activeShiftId, sortedShiftTypes]);

  // Search / filter / date states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);

  // Filter states
  const [appliedFilters, setAppliedFilters] = useState({
    projects: '',
    category: '',
    status: '',
    shift: [],
  });

  // Labour data
  const { labours, isLoading: isLoadingLabours, refetch: refetchLabours } = useProjectLabours({
    workspaceId: selectedWorkspace,
    projectId,
  });

  // Status and deletion management
  const [statusByLabourId, setStatusByLabourId] = useState({});
  const [deletedIds, setDeletedIds] = useState(() => new Set());

  useEffect(() => {
    if (!deletedLabourId) return;
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(Number(deletedLabourId));
      return next;
    });
  }, [deletedLabourId]);

  // Process and filter labour list
  const labourList = useMemo(() => {
    const list = Array.isArray(labours) ? labours : [];

    const mapped = list
      .map((l) => {
        const id = Number(l?.id || l?.labourId || l?.labour_id);
        const categoryName =
          l?.category?.name ||
          l?.category_details?.name ||
          l?.category_name ||
          l?.categoryName ||
          l?.role ||
          l?.designation ||
          l?.occupation ||
          l?.labour_category_name ||
          (typeof l?.category === 'string' ? l?.category : '') ||
          '';
        const name = l?.full_name || l?.labour_name || l?.name || '';
        const shiftTypeId = String(l?.shift_type_id || l?.shiftTypeId || l?.shift_type || l?.shiftType || '');
        const profilePhoto =
          l?.media?.profilePhoto?.url ||
          l?.media?.profilePhoto ||
          l?.profilePhoto ||
          l?.profile_photo ||
          '';

        const base = {
          id,
          name,
          role: categoryName,
          category: l?.category_id || l?.categoryId,
          shiftTypeId,
          contactNumber: (l?.phone_number || l?.contact_number)
            ? `${l?.country_code || ''} ${l?.phone_number || l?.contact_number}`.trim()
            : l?.contactNumber,
          countryCode: l?.country_code || l?.countryCode,
          aadharNumber: l?.labour_aadhar_number || l?.aadharNumber,
          defaultDailyWage: l?.daily_wage || l?.defaultDailyWage,
          pay: l?.daily_wage || l?.pay || 0,
          joinDate: l?.join_date || l?.joinDate,
          profilePhoto,
          status: l?.status || 'P',
        };

        const override = statusByLabourId[id];
        return override ? { ...base, ...override } : base;
      })
      .filter((l) => !deletedIds.has(Number(l.id)));

    if (!activeShiftId) return mapped;
    return mapped.filter((l) => String(l.shiftTypeId || '') === String(activeShiftId));
  }, [labours, statusByLabourId, deletedIds, activeShiftId]);

  // Search and filter filtering
  const filteredLabourList = useMemo(() => {
    let filtered = labourList;

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((labour) =>
        labour.name?.toLowerCase().includes(q) ||
        labour.role?.toLowerCase().includes(q)
      );
    }

    // Apply project filter
    if (appliedFilters.projects) {
      filtered = filtered.filter((labour) => {
        // Note: Project filtering might need to check labour's assigned project
        // For now, since we're already on a project page, we might not need this
        // But keeping it for future use
        return true;
      });
    }

    // Apply category filter
    if (appliedFilters.category) {
      const categoryId = String(appliedFilters.category);
      filtered = filtered.filter((labour) =>
        String(labour.category || '') === categoryId
      );
    }

    return filtered;
  }, [labourList, searchQuery, appliedFilters]);

  // Summary calculation
  const summary = useMemo(() => {
    const present = labourList.filter((l) => l.status === 'P').length;
    const absent = labourList.filter((l) => l.status === 'A').length;
    const halfDay = labourList.filter((l) => l.status === 'H').length;

    const totalPay = labourList.reduce((sum, labour) => {
      const pay = Number(labour.pay || 0);

      if (labour.status === 'P') return sum + pay;
      if (labour.status === 'H') return sum + pay / 2;
      if (labour.status === 'OT') return sum + pay;
      return sum; // A or anything else
    }, 0);

    return { present, absent, halfDay, totalPay };
  }, [labourList]);

  // Status change handler
  const handleStatusChange = (labourId, status) => {
    setStatusByLabourId((prev) => ({
      ...prev,
      [labourId]: { ...(prev[labourId] || {}), status },
    }));
  };

  // Mark paid leave handler
  const handleMarkPaidLeave = (labourId) => {
    setStatusByLabourId((prev) => ({
      ...prev,
      [labourId]: { ...(prev[labourId] || {}), status: 'P', paidLeave: true },
    }));
    showSuccess(t('attendancePage.paidLeaveMarked'));
  };

  // Delete labour handler
  const handleDeleteLabour = async (labourId) => {
    if (!labourId) {
      return;
    }

    const lid = Number(labourId);
    const toastId = showLoading(t('labourDetails.deletingLabour', { defaultValue: 'Deleting labour…' }));

    try {
      await deleteLabour(lid);
      updateToast(toastId, { type: 'success', message: t('attendancePage.labourDeleted') });
      setDeletedIds((prev) => {
        const next = new Set(prev);
        next.add(lid);
        return next;
      });
      // Refresh the labour list after deletion
      refetchLabours?.();
    } catch (e) {
      console.error(e);
      updateToast(toastId, { type: 'error', message: e?.response?.data?.message || e?.message || t('labourDetails.deleteFail', { defaultValue: 'Failed to delete labour' }) });
    }
  };

  // Filter handlers
  const handleFilterApply = (filterValues) => {
    // Map status filter values: 'fullDay' -> 'P', 'halfDay' -> 'H', 'absent' -> 'A'
    const statusMap = {
      fullDay: 'P',
      halfDay: 'H',
      absent: 'A',
    };

    const mappedStatus = filterValues.receiverName ? statusMap[filterValues.receiverName] || '' : '';

    setAppliedFilters({
      projects: filterValues.projects || '',
      category: filterValues.category || '',
      status: mappedStatus,
      shift: Array.isArray(filterValues.shift) ? filterValues.shift : [],
    });
  };

  const handleFilterReset = () => {
    setStatusFilter('');
    setAppliedFilters({
      projects: '',
      category: '',
      status: '',
      shift: [],
    });
  };

  return {
    // Data
    deletedLabourId,
    sortedShiftTypes,
    activeShiftId,
    setActiveShiftId,
    labourList,
    filteredLabourList,
    summary,
    isLoadingLabours,
    refetchLabours,

    // Search/Filter state
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    appliedFilters,

    // Handlers
    handleStatusChange,
    handleMarkPaidLeave,
    handleDeleteLabour,
    handleFilterApply,
    handleFilterReset,
  };
};

export default useLabourAttendance;

