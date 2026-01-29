import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import LabourAmountModal from '../../../components/ui/LabourAmountModal';
import LabourMoveProjectModal from '../../../components/ui/LabourMoveProjectModal';
import RemoveMemberModal from '../../../components/ui/RemoveMemberModal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import { useAuth } from '../../auth/store';
import { createPayLabour, moveLabourToProject, createAttendance, getAttendance } from '../api/labourAttendanceApi';
import { showError, showLoading, updateToast } from '../../../utils/toast';
import { useProjectsAll } from '../hooks/useProjectsAll';

const AVATAR_VARIANTS = [
  { border: '#007AFF66', bg: '#007AFF14', text: '#007AFF' },
  { border: '#21005D66', bg: '#21005D14', text: '#21005D' },
  { border: '#0DC5A166', bg: '#0DC5A114', text: '#0DC5A1' },
];

const STATUS_STYLES = {
  P: {
    active: { bg: '#34C759', text: '#FFFFFF', border: '#34C759' },
    inactive: { bg: '#34C7590A', text: '#34C759', border: '#34C75933' },
  },
  A: {
    active: { bg: '#B02E0C', text: '#FFFFFF', border: '#B02E0C' },
    inactive: { bg: '#B02E0C14', text: '#B02E0C', border: '#B02E0C33' },
  },
  H: {
    active: { bg: '#FF9500', text: '#FFFFFF', border: '#FF9500' },
    inactive: { bg: '#FF950014', text: '#FF9500', border: '#FF950033' },
  },
  OT: {
    active: { bg: '#007AFF', text: '#FFFFFF', border: '#007AFF' },
    inactive: { bg: '#007AFF14', text: '#007AFF', border: '#007AFF33' },
  },
};

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || '';
  const b = parts[1]?.[0] || '';
  return (a + b).toUpperCase() || 'NA';
}

function formatCurrencyINR(amount) {
  const value = Number(amount || 0);
  if (Number.isNaN(value)) return '₹0';
  return `₹${value.toLocaleString('en-IN')}`;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getCurrentDateYYYYMMDD() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function LabourAttendanceCards({
  projectId,
  projectName,
  labourList,
  onStatusChange,
  onMarkPaidLeave,
  onDeleteLabour,
  onRefresh,
  isLoading = false,
  dateRange = null,
  onAttendanceDataChange = null, // Callback to pass attendanceData and overtimeData to parent
}) {
  const { t } = useTranslation('labourAttendance');
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();
  const [activeModal, setActiveModal] = useState(null); // 'move' | 'advance' | 'bonus' | 'deduction' | null
  const [activeLabour, setActiveLabour] = useState(null);
  const [deleteLabour, setDeleteLabour] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overtimeData, setOvertimeData] = useState({}); // { labourId: { ot_rate, ot_hours } }
  const [overtimeInputs, setOvertimeInputs] = useState({}); // { labourId: { ot_rate: '', ot_hours: '' } }
  const [attendanceData, setAttendanceData] = useState({}); // { labourId: { status, payable_amount } }
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [showOvertimeInputs, setShowOvertimeInputs] = useState({}); // { labourId: true/false } - controls visibility of OT inputs

  // Use ref to track if we should notify parent (to avoid calling during render)
  const shouldNotifyParentRef = useRef(false);

  // Fetch attendance data when date or project changes
  useEffect(() => {
    let isMounted = true;

    const fetchAttendance = async () => {
      if (!selectedWorkspace || !projectId) return;

      // Get date from dateRange or use today's date
      let dateToUse = getCurrentDateYYYYMMDD();
      if (dateRange) {
        if (dateRange instanceof Date) {
          const yyyy = dateRange.getFullYear();
          const mm = String(dateRange.getMonth() + 1).padStart(2, '0');
          const dd = String(dateRange.getDate()).padStart(2, '0');
          dateToUse = `${yyyy}-${mm}-${dd}`;
        } else if (typeof dateRange === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateRange)) {
          dateToUse = dateRange;
        }
      }

      setIsLoadingAttendance(true);
      try {
        const response = await getAttendance({
          workspace_id: selectedWorkspace,
          project_id: projectId,
          date: dateToUse,
        });

        if (!isMounted) return;

        // Handle different response structures
        // API returns: { success: true, totals: {...}, attendanceRecords: Array(3) }
        let attendanceList = [];
        if (Array.isArray(response?.attendanceRecords)) {
          attendanceList = response.attendanceRecords;
        } else if (Array.isArray(response?.data)) {
          attendanceList = response.data;
        } else if (Array.isArray(response)) {
          attendanceList = response;
        }

        // Map attendance data by labour_id - use both number and string keys for compatibility
        const attendanceMap = {};
        const newOvertimeData = {};
        const newOvertimeInputs = {};

        attendanceList.forEach((attendance) => {
          const labourIdNum = Number(attendance.labour_id);
          const labourIdStr = String(attendance.labour_id);

          if (labourIdNum) {
            // Map API status to component status
            const statusMap = {
              Present: 'P',
              Absent: 'A',
              HalfDay: 'H',
              OT: 'OT',
            };
            const mappedStatus = statusMap[attendance.status] || attendance.status;

            const dailyWage = attendance.daily_wage || attendance.labourDetails?.Daily_wage || 0;

            const attendanceInfo = {
              status: mappedStatus,
              payable_amount: attendance.payable_amount !== undefined && attendance.payable_amount !== null
                ? attendance.payable_amount
                : 0,
              daily_wage: dailyWage,
            };

            // Store with both number and string keys for compatibility
            attendanceMap[labourIdNum] = attendanceInfo;
            attendanceMap[labourIdStr] = attendanceInfo;

            // If status is OT, populate overtime inputs if available from API
            if (mappedStatus === 'OT' && attendance.ot_rate && attendance.ot_hours) {
              // Store in overtimeData with all key formats for easy lookup
              newOvertimeData[labourIdNum] = {
                ot_rate: attendance.ot_rate,
                ot_hours: attendance.ot_hours,
              };
              newOvertimeData[labourIdStr] = {
                ot_rate: attendance.ot_rate,
                ot_hours: attendance.ot_hours,
              };

              // Store in overtimeInputs with all key formats for easy lookup
              const otInputs = {
                ot_rate: String(attendance.ot_rate || ''),
                ot_hours: String(attendance.ot_hours || ''),
              };
              newOvertimeInputs[labourIdNum] = otInputs;
              newOvertimeInputs[labourIdStr] = otInputs;
            }
          }
        });

        setAttendanceData(attendanceMap);
        setOvertimeData(newOvertimeData);
        setOvertimeInputs((prev) => ({ ...prev, ...newOvertimeInputs }));

        // Notify parent component about attendance data change
        // Use current overtimeData from state, not from dependency
        if (onAttendanceDataChange) {
          onAttendanceDataChange(attendanceMap, newOvertimeData);
        }
      } catch (e) {
        if (!isMounted) return;
        console.error('Error fetching attendance:', e);
        // Don't show error toast, just log it
      } finally {
        if (isMounted) {
          setIsLoadingAttendance(false);
        }
      }
    };

    fetchAttendance();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkspace, projectId, dateRange]); // Removed onAttendanceDataChange and overtimeData to prevent infinite loop

  // Notify parent component when attendanceData or overtimeData changes (but not during render)
  useEffect(() => {
    if (shouldNotifyParentRef.current && onAttendanceDataChange) {
      shouldNotifyParentRef.current = false;
      // Use setTimeout to defer the callback to avoid updating parent during render
      setTimeout(() => {
        onAttendanceDataChange(attendanceData, overtimeData);
      }, 0);
    }
  }, [attendanceData, overtimeData, onAttendanceDataChange]);

  const { projects } = useProjectsAll(selectedWorkspace);
  const projectsOptions = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    const currentId = String(projectId || '');
    return list
      .map((p) => ({
        id: p?.id ?? p?.project_id ?? p?.projectId,
        name: p?.project_name ?? p?.name ?? p?.title ?? '',
      }))
      .filter((p) => String(p.id || '') && String(p.name || ''))
      .filter((p) => String(p.id) !== currentId);
  }, [projects, projectId]);

  const handleMarkPaidLeave = (labourId) => {
    onMarkPaidLeave?.(labourId);
  };

  const handleViewEditLabour = (labour) => {
    // Navigate to Labour Details page (Edit available inside)
    navigate(
      getRoute(ROUTES_FLAT.LABOUR_ATTENDANCE_LABOUR_DETAILS, { projectId, labourId: labour.id }),
      {
        state: {
          projectName,
          labour,
        },
      }
    );
  };

  const openModalForLabour = (modalType, labour) => {
    setActiveLabour(labour);
    setActiveModal(modalType);
  };

  const handleMoveToProject = (labour) => {
    openModalForLabour('move', labour);
  };

  const handlePayAdvance = (labour) => {
    openModalForLabour('advance', labour);
  };

  const handleAddBonus = (labour) => {
    openModalForLabour('bonus', labour);
  };

  const handleAddDeduction = (labour) => {
    openModalForLabour('deduction', labour);
  };

  const handleStatusChange = async (labourId, status) => {
    const labour = labourList.find((l) => l.id === labourId);
    if (!labour) return;

    const workspace_id = toNumber(selectedWorkspace);
    const pid = toNumber(projectId);
    const shift_type_id = toNumber(labour.shiftTypeId || labour.shift_type_id);
    const lid = toNumber(labourId);
    const currentDate = getCurrentDateYYYYMMDD();

    if (!workspace_id || !pid || !shift_type_id || !lid) {
      showError('Missing required information for attendance');
      return;
    }

    if (status === 'OT') {
      // When OT is clicked, show inputs immediately by updating attendanceData optimistically
      const labourIdNum = toNumber(labourId);
      const labourIdStr = String(labourId);

      // Get existing attendance data to preserve daily_wage
      const existingAttendance = attendanceData[labourIdNum] || attendanceData[labourIdStr];
      const dailyWage = existingAttendance?.daily_wage || labour.pay || 0;

      // Check if OT data already exists (for editing) - check both overtimeData and overtimeInputs
      const existingOTData = overtimeData[labourIdNum] || overtimeData[labourIdStr] || overtimeData[labourId];
      const existingOTInputs = overtimeInputs[labourIdNum] || overtimeInputs[labourIdStr] || overtimeInputs[labourId];

      // Optimistically update attendanceData to show OT status immediately
      setAttendanceData((prev) => {
        const updated = {
          ...prev,
          [labourIdNum]: {
            status: 'OT',
            daily_wage: dailyWage,
            payable_amount: prev[labourIdNum]?.payable_amount || prev[labourIdStr]?.payable_amount || dailyWage, // Preserve existing payable_amount if available
          },
          [labourIdStr]: {
            status: 'OT',
            daily_wage: dailyWage,
            payable_amount: prev[labourIdNum]?.payable_amount || prev[labourIdStr]?.payable_amount || dailyWage,
          },
        };
        // Mark that we should notify parent after state update
        shouldNotifyParentRef.current = true;
        return updated;
      });

      // Populate overtime inputs from existing data if available, otherwise initialize empty
      setOvertimeInputs((prev) => {
        // First check if inputs already exist (from previous fetch or save)
        if (existingOTInputs) {
          // If existing inputs found, use them
          return {
            ...prev,
            [labourId]: {
              ot_rate: String(existingOTInputs.ot_rate || ''),
              ot_hours: String(existingOTInputs.ot_hours || ''),
            },
            [labourIdNum]: {
              ot_rate: String(existingOTInputs.ot_rate || ''),
              ot_hours: String(existingOTInputs.ot_hours || ''),
            },
            [labourIdStr]: {
              ot_rate: String(existingOTInputs.ot_rate || ''),
              ot_hours: String(existingOTInputs.ot_hours || ''),
            },
          };
        } else if (existingOTData) {
          // If existing OT data found (from overtimeData), populate inputs with that data
          return {
            ...prev,
            [labourId]: {
              ot_rate: String(existingOTData.ot_rate || ''),
              ot_hours: String(existingOTData.ot_hours || ''),
            },
            [labourIdNum]: {
              ot_rate: String(existingOTData.ot_rate || ''),
              ot_hours: String(existingOTData.ot_hours || ''),
            },
            [labourIdStr]: {
              ot_rate: String(existingOTData.ot_rate || ''),
              ot_hours: String(existingOTData.ot_hours || ''),
            },
          };
        } else if (!prev[labourId] && !prev[labourIdNum] && !prev[labourIdStr]) {
          // If no existing data and no inputs, initialize empty
          return {
            ...prev,
            [labourId]: { ot_rate: '', ot_hours: '' },
          };
        }
        return prev;
      });

      // Show overtime inputs
      setShowOvertimeInputs((prev) => ({
        ...prev,
        [labourId]: true,
      }));

      // Call parent status change handler
      onStatusChange?.(labourId, 'OT');
    } else {
      // For P, A, H statuses - create attendance
      try {
        const existingAttendance = attendanceData[toNumber(labourId)] || attendanceData[String(labourId)];
        const dailyWage = existingAttendance?.daily_wage || labour.pay || 0;

        await createAttendance({
          workspace_id,
          project_id: pid,
          shift_type_id,
          labour_id: lid,
          date: currentDate,
          status,
          daily_wage: dailyWage,
        });

        // Clear overtime data and hide inputs if switching away from OT
        if (labour.status === 'OT' && status !== 'OT') {
          setOvertimeData((prev) => {
            const next = { ...prev };
            delete next[labourId];
            return next;
          });
          setOvertimeInputs((prev) => {
            const next = { ...prev };
            delete next[labourId];
            return next;
          });
          setShowOvertimeInputs((prev) => {
            const next = { ...prev };
            delete next[labourId];
            return next;
          });
        }

        onStatusChange?.(labourId, status);

        // Refresh attendance data by re-fetching all attendance (only once)
        const workspace_id_num = toNumber(selectedWorkspace);
        const pid_num = toNumber(projectId);
        if (workspace_id_num && pid_num) {
          try {
            const response = await getAttendance({
              workspace_id: workspace_id_num,
              project_id: pid_num,
              date: currentDate,
            });

            let attendanceList = [];
            if (Array.isArray(response?.attendanceRecords)) {
              attendanceList = response.attendanceRecords;
            } else if (Array.isArray(response?.data)) {
              attendanceList = response.data;
            } else if (Array.isArray(response)) {
              attendanceList = response;
            }

            // Map all attendance data
            const attendanceMap = {};
            const updatedOvertimeData = {};
            const updatedOvertimeInputs = {};

            attendanceList.forEach((attendance) => {
              const lidNum = Number(attendance.labour_id);
              const lidStr = String(attendance.labour_id);

              if (lidNum) {
                const statusMap = {
                  Present: 'P',
                  Absent: 'A',
                  HalfDay: 'H',
                  OT: 'OT',
                };
                const mappedStatus = statusMap[attendance.status] || attendance.status;
                const dailyWage = attendance.daily_wage || attendance.labourDetails?.Daily_wage || 0;

                const attendanceInfo = {
                  status: mappedStatus,
                  payable_amount: attendance.payable_amount !== undefined && attendance.payable_amount !== null
                    ? attendance.payable_amount
                    : 0,
                  daily_wage: dailyWage,
                };

                attendanceMap[lidNum] = attendanceInfo;
                attendanceMap[lidStr] = attendanceInfo;

                // If status is OT, populate overtime data if available from API
                if (mappedStatus === 'OT' && attendance.ot_rate && attendance.ot_hours) {
                  updatedOvertimeData[lidNum] = {
                    ot_rate: attendance.ot_rate,
                    ot_hours: attendance.ot_hours,
                  };
                  updatedOvertimeInputs[lidNum] = {
                    ot_rate: String(attendance.ot_rate || ''),
                    ot_hours: String(attendance.ot_hours || ''),
                  };
                }
              }
            });

            setAttendanceData(attendanceMap);
            setOvertimeData((prev) => ({ ...prev, ...updatedOvertimeData }));
            setOvertimeInputs((prev) => ({ ...prev, ...updatedOvertimeInputs }));
            if (onAttendanceDataChange) {
              onAttendanceDataChange(attendanceMap, { ...overtimeData, ...updatedOvertimeData });
            }
          } catch (e) {
            console.error('Error refreshing attendance:', e);
          }
        }

        onRefresh?.();
      } catch (e) {
        console.error('Error creating attendance:', e);
        showError(e?.response?.data?.message || e?.message || 'Failed to mark attendance');
      }
    }
  };

  const handleOvertimeInputChange = (labourId, field, value) => {
    setOvertimeInputs((prev) => ({
      ...prev,
      [labourId]: {
        ...(prev[labourId] || { ot_rate: '', ot_hours: '' }),
        [field]: value,
      },
    }));
  };

  const handleSaveOvertime = async (labourId) => {
    const inputs = overtimeInputs[labourId];
    if (!inputs) return;

    const ot_rate = Number(inputs.ot_rate);
    const ot_hours = Number(inputs.ot_hours);

    if (!inputs.ot_rate?.trim() || ot_rate <= 0) {
      showError('Please enter a valid rate');
      return;
    }
    if (!inputs.ot_hours?.trim() || ot_hours <= 0) {
      showError('Please enter valid hours');
      return;
    }

    const labour = labourList.find((l) => l.id === labourId);
    if (!labour) return;

    const workspace_id = toNumber(selectedWorkspace);
    const pid = toNumber(projectId);
    const lid = toNumber(labourId);
    const shift_type_id = toNumber(labour.shiftTypeId || labour.shift_type_id);
    const currentDate = getCurrentDateYYYYMMDD();

    if (!workspace_id || !pid || !lid || !shift_type_id) {
      showError('Missing required information');
      return;
    }

    const toastId = showLoading('Saving overtime...');
    setIsSubmitting(true);
    try {
      // Get existing attendance data to get daily_wage
      const existingAttendance = attendanceData[toNumber(labourId)] || attendanceData[String(labourId)];
      const dailyWage = existingAttendance?.daily_wage || labour.pay || 0;

      // Create OT attendance with ot_rate and ot_hours
      await createAttendance({
        workspace_id,
        project_id: pid,
        shift_type_id,
        labour_id: lid,
        date: currentDate,
        status: 'OT',
        ot_rate,
        ot_hours,
        daily_wage: dailyWage,
      });

      // Save overtime data locally
      setOvertimeData((prev) => {
        const updated = {
          ...prev,
          [labourId]: { ot_rate, ot_hours },
        };
        return updated;
      });

      // Refresh attendance data by re-fetching all attendance (only once)
      const workspace_id_num = toNumber(selectedWorkspace);
      const pid_num = toNumber(projectId);
      if (workspace_id_num && pid_num) {
        try {
          const response = await getAttendance({
            workspace_id: workspace_id_num,
            project_id: pid_num,
            date: currentDate,
          });

          let attendanceList = [];
          if (Array.isArray(response?.attendanceRecords)) {
            attendanceList = response.attendanceRecords;
          } else if (Array.isArray(response?.data)) {
            attendanceList = response.data;
          } else if (Array.isArray(response)) {
            attendanceList = response;
          }

          // Map all attendance data
          const attendanceMap = {};
          const updatedOvertimeData = {};
          const updatedOvertimeInputs = {};

          attendanceList.forEach((attendance) => {
            const lidNum = Number(attendance.labour_id);
            const lidStr = String(attendance.labour_id);

            if (lidNum) {
              const statusMap = {
                Present: 'P',
                Absent: 'A',
                HalfDay: 'H',
                OT: 'OT',
              };
              const mappedStatus = statusMap[attendance.status] || attendance.status;
              const dailyWage = attendance.daily_wage || attendance.labourDetails?.Daily_wage || 0;

              const attendanceInfo = {
                status: mappedStatus,
                payable_amount: attendance.payable_amount !== undefined && attendance.payable_amount !== null
                  ? attendance.payable_amount
                  : 0,
                daily_wage: dailyWage,
              };

              attendanceMap[lidNum] = attendanceInfo;
              attendanceMap[lidStr] = attendanceInfo;

              // If status is OT, populate overtime data if available from API
              if (mappedStatus === 'OT' && attendance.ot_rate && attendance.ot_hours) {
                // Store in overtimeData with all key formats
                updatedOvertimeData[lidNum] = {
                  ot_rate: attendance.ot_rate,
                  ot_hours: attendance.ot_hours,
                };
                updatedOvertimeData[lidStr] = {
                  ot_rate: attendance.ot_rate,
                  ot_hours: attendance.ot_hours,
                };

                // Store in overtimeInputs with all key formats
                const otInputs = {
                  ot_rate: String(attendance.ot_rate || ''),
                  ot_hours: String(attendance.ot_hours || ''),
                };
                updatedOvertimeInputs[lidNum] = otInputs;
                updatedOvertimeInputs[lidStr] = otInputs;
              }
            }
          });

          setAttendanceData(attendanceMap);
          setOvertimeData((prev) => ({ ...prev, ...updatedOvertimeData }));
          // Preserve existing inputs for OT labours even if API doesn't return them
          setOvertimeInputs((prev) => {
            const merged = { ...prev, ...updatedOvertimeInputs };
            // For all OT labours, ensure inputs are preserved
            Object.keys(attendanceMap).forEach((key) => {
              const attendanceInfo = attendanceMap[key];
              if (attendanceInfo?.status === 'OT') {
                const labourIdKey = Number(key) || key;
                // If API didn't return inputs but we have them locally, preserve them
                if (!merged[labourIdKey] && prev[labourIdKey]) {
                  merged[labourIdKey] = prev[labourIdKey];
                }
                // Also ensure we have inputs for OT status (initialize if missing)
                if (!merged[labourIdKey]) {
                  merged[labourIdKey] = { ot_rate: '', ot_hours: '' };
                }
              }
            });
            return merged;
          });
          if (onAttendanceDataChange) {
            onAttendanceDataChange(attendanceMap, { ...overtimeData, ...updatedOvertimeData });
          }
        } catch (e) {
          console.error('Error refreshing attendance:', e);
        }
      }

      // Hide overtime inputs after successful save
      setShowOvertimeInputs((prev) => {
        const next = { ...prev };
        delete next[labourId];
        return next;
      });

      updateToast(toastId, { type: 'success', message: 'Overtime saved successfully' });
      onRefresh?.();
    } catch (e) {
      console.error('Error saving overtime:', e);
      updateToast(toastId, { type: 'error', message: e?.response?.data?.message || e?.message || 'Failed to save overtime' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLabour = (labourId) => {
    const labour = labourList.find((l) => l.id === labourId) || null;
    setDeleteLabour(labour);
  };

  return (
    <div className="space-y-4">

      {labourList.map((labour, idx) => {
        const avatarStyle = AVATAR_VARIANTS[idx % AVATAR_VARIANTS.length];

        return (
          <div
            key={labour.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-lightGray w-full cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleViewEditLabour(labour)}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-lightGray">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0"
                  style={{
                    border: `1px solid ${avatarStyle.border}`,
                    backgroundColor: labour.profilePhoto ? '#FFFFFF' : avatarStyle.bg,
                    color: avatarStyle.text,
                  }}
                >
                  {labour.profilePhoto ? (
                    <img
                      src={labour.profilePhoto}
                      alt={labour.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    labour.avatar || getInitials(labour.name)
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-primary text-sm truncate">{labour.name}</p>
                  <p className="text-xs text-secondary truncate">{labour.role}</p>
                </div>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu
                  openDirection="up"
                  items={[
                    // { label: t('cards.menu.markPaidLeave'), onClick: () => handleMarkPaidLeave(labour.id) },
                    { label: t('cards.menu.viewEditLabour'), onClick: () => handleViewEditLabour(labour), highlight: true },
                    { label: t('cards.menu.moveToAnotherProject'), onClick: () => handleMoveToProject(labour) },
                    { label: t('cards.menu.payAdvance'), onClick: () => handlePayAdvance(labour) },
                    { label: t('cards.menu.addBonus'), onClick: () => handleAddBonus(labour) },
                    { label: t('cards.menu.addDeduction'), onClick: () => handleAddDeduction(labour) },
                    { label: t('cards.menu.deleteLabour'), textColor: 'text-accent', onClick: () => handleDeleteLabour(labour.id) },
                  ]}
                />
              </div>
            </div>

            {/* Bottom row */}
            <div className="pt-3">
              <div className="flex items-end justify-between gap-3 flex-wrap mb-3">
                <div className="flex gap-2 flex-shrink-0">
                  {['P', 'A', 'H', 'OT'].map((status) => {
                    const isOT = status === 'OT';
                    const isP = status === 'P';
                    // Get status from attendanceData if available
                    // Try both number and string keys for compatibility
                    const labourIdNum = Number(labour.id);
                    const labourIdStr = String(labour.id);
                    const attendanceInfo = attendanceData[labourIdNum] || attendanceData[labourIdStr];
                    // Only use status from attendanceData if it exists, don't fallback to labour.status
                    const currentStatus = attendanceInfo?.status || null;

                    // Only show button as active if attendanceInfo exists and has a status
                    // Don't fallback to labour.status default value
                    let isActive = false;
                    if (currentStatus !== null && currentStatus !== undefined) {
                      if (isP) {
                        // Show P as active if status is P or OT
                        isActive = currentStatus === 'P' || currentStatus === 'OT';
                      } else if (isOT) {
                        // Show OT as active only if status is OT
                        isActive = currentStatus === 'OT';
                      } else {
                        // For A and H, show active if status matches
                        isActive = currentStatus === status;
                      }
                    }

                    return (
                      <StatusButton
                        key={status}
                        label={status}
                        active={isActive}
                        onClick={() => handleStatusChange(labour.id, status)}
                      />
                    );
                  })}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-primary-light">
                    {t('cards.payableAmount')}
                  </p>
                  <p className="text-primary font-medium">
                    {(() => {
                      // Get attendance info for this labour
                      const labourIdNum = Number(labour.id);
                      const labourIdStr = String(labour.id);
                      const attendanceInfo = attendanceData[labourIdNum] || attendanceData[labourIdStr];

                      // Get status from attendanceData or fallback to labour.status
                      const currentStatus = attendanceInfo?.status || null;

                      // Get daily wage from attendanceData or labour
                      const dailyWage = attendanceInfo?.daily_wage || labour.pay || 0;

                      // Use payable_amount from API if available and not zero
                      const apiPayable = attendanceInfo?.payable_amount;
                      if (apiPayable !== undefined && apiPayable !== null && apiPayable > 0) {
                        return formatCurrencyINR(apiPayable);
                      }

                      // Calculate payable amount based on status if no API amount
                      let payableAmount = 0;

                      if (currentStatus === 'P') {
                        payableAmount = dailyWage; // Full day for Present
                      } else if (currentStatus === 'H') {
                        payableAmount = dailyWage / 2; // Half day
                      } else if (currentStatus === 'OT') {
                        payableAmount = dailyWage; // Base pay for OT (API should provide full amount)
                      } else {
                        payableAmount = 0; // Absent or Unmarked
                      }

                      return formatCurrencyINR(payableAmount);
                    })()}
                  </p>
                </div>
              </div>

              {/* Overtime inputs - show only when showOvertimeInputs is true for this labour */}
              {showOvertimeInputs[labour.id] && (
                <div className="pt-3 border-t border-lightGray max-w-[450px]" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-end gap-3 mb-3">
                    <div className="flex-1">
                      <Input
                        label={t('overtimeModal.ratePerHour', { defaultValue: 'OT Rate' })}
                        placeholder={t('overtimeModal.ratePlaceholder', { defaultValue: 'OT Rate' })}
                        value={overtimeInputs[labour.id]?.ot_rate || ''}
                        onChange={(e) => handleOvertimeInputChange(labour.id, 'ot_rate', e.target.value)}
                        type="number"
                        step="any"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label={t('overtimeModal.otHours', { defaultValue: 'OT Hours' })}
                        placeholder={t('overtimeModal.hoursPlaceholder', { defaultValue: 'OT Hours' })}
                        value={overtimeInputs[labour.id]?.ot_hours || ''}
                        onChange={(e) => handleOvertimeInputChange(labour.id, 'ot_hours', e.target.value)}
                        type="number"
                        step="any"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-normal text-black mb-2">
                        {t('overtimeModal.todaysWage', { defaultValue: "Today's Wage Per Day" })}
                      </label>
                      <div className="px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-primary font-medium">
                        {formatCurrencyINR(labour.pay || 0)}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-[120px]"
                        onClick={() => handleSaveOvertime(labour.id)}
                        disabled={isSubmitting || !overtimeInputs[labour.id]?.ot_rate?.trim() || !overtimeInputs[labour.id]?.ot_hours?.trim()}
                      >
                        {isSubmitting ? t('common.loading', { defaultValue: 'Saving...' }) : t('common.save', { defaultValue: 'Save' })}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <LabourMoveProjectModal
        isOpen={activeModal === 'move'}
        onClose={() => {
          if (!isSubmitting) setActiveModal(null);
        }}
        projects={projectsOptions}
        isSubmitting={isSubmitting}
        onMove={async (newProjectId) => {
          const labourId = toNumber(activeLabour?.id);
          const nextProjectId = toNumber(newProjectId);
          if (!labourId || !nextProjectId) {
            showError('Please select a project');
            return;
          }

          const toastId = showLoading('Moving labour…');
          setIsSubmitting(true);
          try {
            await moveLabourToProject({ labour_id: labourId, new_project_id: nextProjectId });
            updateToast(toastId, { type: 'success', message: 'Labour moved successfully' });
            setActiveModal(null);
            onRefresh?.();
          } catch (e) {
            console.error(e);
            updateToast(toastId, { type: 'error', message: e?.response?.data?.message || e?.message || 'Failed to move labour' });
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      <LabourAmountModal
        isOpen={activeModal === 'advance'}
        onClose={() => {
          if (!isSubmitting) setActiveModal(null);
        }}
        title={`Pay Advance • ${activeLabour?.name || ''}`}
        amountLabel="Payable Amount"
        primaryActionText="Add"
        isSubmitting={isSubmitting}
        onSubmit={async (amount) => {
          const amt = toNumber(amount);
          if (!amt || amt <= 0) {
            showError('Please enter a valid amount');
            return;
          }
          const workspace_id = toNumber(selectedWorkspace);
          const paidTo = toNumber(activeLabour?.id);
          const pid = toNumber(projectId);
          if (!workspace_id || !paidTo || !pid) {
            showError('Missing workspace/project/labour details');
            return;
          }

          const toastId = showLoading('Adding advance…');
          setIsSubmitting(true);
          try {
            await createPayLabour({
              projectId: pid,
              workspace_id,
              title: 'pay advance',
              amount: amt,
              paidTo,
              paidDate: '',
              method: 'Cash',
              status: 'Paid',
              expenseSections: 'labour',
            });
            updateToast(toastId, { type: 'success', message: 'Advance added' });
            setActiveModal(null);
            onRefresh?.();
          } catch (e) {
            console.error(e);
            updateToast(toastId, { type: 'error', message: e?.response?.data?.message || e?.message || 'Failed to add advance' });
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      <LabourAmountModal
        isOpen={activeModal === 'bonus'}
        onClose={() => {
          if (!isSubmitting) setActiveModal(null);
        }}
        title={`Pay Bonus • ${activeLabour?.name || ''}`}
        amountLabel="Payable Amount"
        primaryActionText="Add"
        isSubmitting={isSubmitting}
        onSubmit={async (amount) => {
          const amt = toNumber(amount);
          if (!amt || amt <= 0) {
            showError('Please enter a valid amount');
            return;
          }
          const workspace_id = toNumber(selectedWorkspace);
          const paidTo = toNumber(activeLabour?.id);
          const pid = toNumber(projectId);
          if (!workspace_id || !paidTo || !pid) {
            showError('Missing workspace/project/labour details');
            return;
          }

          const toastId = showLoading('Adding bonus…');
          setIsSubmitting(true);
          try {
            await createPayLabour({
              projectId: pid,
              workspace_id,
              title: 'pay Bonus',
              amount: amt,
              paidTo,
              paidDate: '',
              method: 'Cash',
              status: 'Pending',
              expenseSections: 'labour',
            });
            updateToast(toastId, { type: 'success', message: 'Bonus added' });
            setActiveModal(null);
            onRefresh?.();
          } catch (e) {
            console.error(e);
            updateToast(toastId, { type: 'error', message: e?.response?.data?.message || e?.message || 'Failed to add bonus' });
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      <LabourAmountModal
        isOpen={activeModal === 'deduction'}
        onClose={() => {
          if (!isSubmitting) setActiveModal(null);
        }}
        title={`Add Deduction • ${activeLabour?.name || ''}`}
        amountLabel="Deduction Amount"
        primaryActionText="Add"
        isSubmitting={isSubmitting}
        onSubmit={async (amount) => {
          const amt = toNumber(amount);
          if (!amt || amt <= 0) {
            showError('Please enter a valid amount');
            return;
          }
          const workspace_id = toNumber(selectedWorkspace);
          const paidTo = toNumber(activeLabour?.id);
          const pid = toNumber(projectId);
          if (!workspace_id || !paidTo || !pid) {
            showError('Missing workspace/project/labour details');
            return;
          }

          const toastId = showLoading('Adding deduction…');
          setIsSubmitting(true);
          try {
            await createPayLabour({
              projectId: pid,
              workspace_id,
              title: 'Deduction',
              amount: amt,
              paidTo,
              paidDate: '',
              method: 'Cash',
              status: 'Pending',
              expenseSections: 'labour',
            });
            updateToast(toastId, { type: 'success', message: 'Deduction added' });
            setActiveModal(null);
            onRefresh?.();
          } catch (e) {
            console.error(e);
            updateToast(toastId, { type: 'error', message: e?.response?.data?.message || e?.message || 'Failed to add deduction' });
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      <RemoveMemberModal
        isOpen={Boolean(deleteLabour)}
        onClose={() => setDeleteLabour(null)}
        onConfirm={() => {
          if (deleteLabour?.id) onDeleteLabour?.(deleteLabour.id);
          setDeleteLabour(null);
        }}
        memberName={deleteLabour?.name || ''}
        title={t('common.deleteLabour')}
        description={t('cards.deleteDescription', { defaultValue: 'Are you sure you want to remove labour from this project? This action is irreversible, and your data cannot be recovered.' })}
        confirmText={t('common.yesDelete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
}

function StatusButton({ label, active, onClick }) {
  const styles = STATUS_STYLES[label];
  const s = active ? styles.active : styles.inactive;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className="w-10 h-10 rounded-lg text-sm font-medium border cursor-pointer transition-colors"
      style={{
        backgroundColor: s.bg,
        color: s.text,
        borderColor: s.border,
      }}
    >
      {label}
    </button>
  );
}

