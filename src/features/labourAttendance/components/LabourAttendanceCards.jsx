import { useMemo, useState, useEffect } from 'react';
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
import { createPayLabour, moveLabourToProject, createAttendance, createOTPayableBill, getAttendance } from '../api/labourAttendanceApi';
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

function calculatePayableAmount(labour, overtimeData = null) {
  const dailyWage = Number(labour.pay || 0);
  const status = labour.status;

  if (status === 'P') {
    return dailyWage; // Full day for Present
  }
  if (status === 'OT') {
    // Overtime: daily wage + (rate per hour * hours)
    const basePay = dailyWage;
    if (overtimeData && overtimeData.ratePerHour && overtimeData.otHours) {
      const overtimePay = Number(overtimeData.ratePerHour) * Number(overtimeData.otHours);
      return basePay + overtimePay;
    }
    return basePay; // If no overtime data, just return base pay
  }
  if (status === 'H') {
    return dailyWage / 2; // Half day
  }
  if (status === 'A') {
    return 0; // Absent
  }
  return 0; // Default for no status
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
  const [overtimeData, setOvertimeData] = useState({}); // { labourId: { ratePerHour, otHours } }
  const [overtimeInputs, setOvertimeInputs] = useState({}); // { labourId: { ratePerHour: '', otHours: '' } }
  const [attendanceData, setAttendanceData] = useState({}); // { labourId: { status, payable_amount } }
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  // Fetch attendance data when date or project changes
  useEffect(() => {
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
            
            // Calculate payable amount based on status
            let calculatedPayable = 0;
            if (mappedStatus === 'P') {
              calculatedPayable = dailyWage; // Full day
            } else if (mappedStatus === 'H') {
              calculatedPayable = dailyWage / 2; // Half day
            } else if (mappedStatus === 'OT') {
              calculatedPayable = dailyWage; // Base pay for OT (overtime will be added separately)
            } else if (mappedStatus === 'A') {
              calculatedPayable = 0; // Absent
            }
            
            const attendanceInfo = {
              status: mappedStatus,
              payable_amount: attendance.payable_amount !== undefined && attendance.payable_amount !== null 
                ? attendance.payable_amount 
                : calculatedPayable,
              daily_wage: dailyWage,
            };
            
            // Store with both number and string keys for compatibility
            attendanceMap[labourIdNum] = attendanceInfo;
            attendanceMap[labourIdStr] = attendanceInfo;
          }
        });
        
        setAttendanceData(attendanceMap);
        // Notify parent component about attendance data change
        if (onAttendanceDataChange) {
          onAttendanceDataChange(attendanceMap, overtimeData);
        }
      } catch (e) {
        console.error('Error fetching attendance:', e);
        // Don't show error toast, just log it
      } finally {
        setIsLoadingAttendance(false);
      }
    };

    fetchAttendance();
  }, [selectedWorkspace, projectId, dateRange, onAttendanceDataChange, overtimeData]);

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
      // When OT is clicked, immediately update local state to prevent flickering
      const labourIdNum = toNumber(labourId);
      const labourIdStr = String(labourId);
      
      // Get existing attendance data to preserve daily_wage and payable_amount
      const existingAttendance = attendanceData[labourIdNum] || attendanceData[labourIdStr];
      const dailyWage = existingAttendance?.daily_wage || labour.pay || 0;
      
      // Create the updated attendance data object
      const updatedAttendanceData = {
        ...attendanceData,
        [labourIdNum]: {
          ...(attendanceData[labourIdNum] || {}),
          status: 'OT',
          daily_wage: dailyWage,
        },
        [labourIdStr]: {
          ...(attendanceData[labourIdStr] || {}),
          status: 'OT',
          daily_wage: dailyWage,
        },
      };
      
      // Optimistically update local attendance data immediately - prevents flickering
      setAttendanceData(updatedAttendanceData);
      
      // Notify parent component immediately with updated data
      if (onAttendanceDataChange) {
        onAttendanceDataChange(updatedAttendanceData, overtimeData);
      }
      
      // Initialize overtime inputs immediately
      setOvertimeInputs((prev) => {
        if (!prev[labourId]) {
          return {
            ...prev,
            [labourId]: { ratePerHour: '', otHours: '' },
          };
        }
        return prev;
      });
      
      // Call parent status change handler
      onStatusChange?.(labourId, 'OT');
      
      // Then make API call in background (non-blocking)
      createAttendance({
        workspace_id,
        project_id: pid,
        shift_type_id,
        labour_id: lid,
        date: currentDate,
        status: 'P',
      }).catch((e) => {
        console.error('Error creating attendance:', e);
        showError(e?.response?.data?.message || e?.message || 'Failed to mark attendance');
        
        // On error, revert the optimistic update
        const revertedAttendanceData = { ...attendanceData };
        delete revertedAttendanceData[labourIdNum];
        delete revertedAttendanceData[labourIdStr];
        setAttendanceData(revertedAttendanceData);
        if (onAttendanceDataChange) {
          onAttendanceDataChange(revertedAttendanceData, overtimeData);
        }
      });
    } else {
      // For P, A, H statuses - create attendance
      try {
        await createAttendance({
          workspace_id,
          project_id: pid,
          shift_type_id,
          labour_id: lid,
          date: currentDate,
          status,
        });
        
        // Clear overtime data if switching away from OT
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
        }
        
        onStatusChange?.(labourId, status);
        
        // Refresh attendance data for this specific labour to get updated status and payable_amount
        const workspace_id_num = toNumber(selectedWorkspace);
        const pid_num = toNumber(projectId);
        if (workspace_id_num && pid_num && lid) {
          try {
            // Fetch attendance for this specific labour
            const response = await getAttendance({
              workspace_id: workspace_id_num,
              project_id: pid_num,
              date: currentDate,
              labour_id: lid, // Filter by specific labour_id
            });
            // Handle different response structures
            let attendanceList = [];
            if (Array.isArray(response?.attendanceRecords)) {
              attendanceList = response.attendanceRecords;
            } else if (Array.isArray(response?.data)) {
              attendanceList = response.data;
            } else if (Array.isArray(response)) {
              attendanceList = response;
            }
            
            // Update attendance data for this specific labour
            if (attendanceList.length > 0) {
              const attendance = attendanceList[0]; // Should be single record for specific labour_id
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
                
                // Calculate payable amount based on status
                let calculatedPayable = 0;
                if (mappedStatus === 'P') {
                  calculatedPayable = dailyWage; // Full day
                } else if (mappedStatus === 'H') {
                  calculatedPayable = dailyWage / 2; // Half day
                } else if (mappedStatus === 'OT') {
                  calculatedPayable = dailyWage; // Base pay for OT
                } else if (mappedStatus === 'A') {
                  calculatedPayable = 0; // Absent
                }
                
                const attendanceInfo = {
                  status: mappedStatus,
                  payable_amount: attendance.payable_amount !== undefined && attendance.payable_amount !== null && attendance.payable_amount > 0
                    ? attendance.payable_amount
                    : calculatedPayable,
                  daily_wage: dailyWage,
                };
                // Update only this labour's attendance data
                setAttendanceData((prev) => {
                  const updated = {
                    ...prev,
                    [lidNum]: attendanceInfo,
                    [lidStr]: attendanceInfo,
                  };
                  // Notify parent component about attendance data change
                  if (onAttendanceDataChange) {
                    onAttendanceDataChange(updated, overtimeData);
                  }
                  return updated;
                });
              }
            } else {
              // If no attendance record found, clear the status for this labour
              const lidNum = toNumber(labourId);
              const lidStr = String(labourId);
              setAttendanceData((prev) => {
                const next = { ...prev };
                delete next[lidNum];
                delete next[lidStr];
                // Notify parent component about attendance data change
                if (onAttendanceDataChange) {
                  onAttendanceDataChange(next, overtimeData);
                }
                return next;
              });
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
        ...(prev[labourId] || { ratePerHour: '', otHours: '' }),
        [field]: value,
      },
    }));
  };

  const handleSaveOvertime = async (labourId) => {
    const inputs = overtimeInputs[labourId];
    if (!inputs) return;

    const rate = Number(inputs.ratePerHour);
    const hours = Number(inputs.otHours);

    if (!inputs.ratePerHour.trim() || rate <= 0) {
      showError('Please enter a valid rate');
      return;
    }
    if (!inputs.otHours.trim() || hours <= 0) {
      showError('Please enter valid hours');
      return;
    }

    const labour = labourList.find((l) => l.id === labourId);
    if (!labour) return;

    const workspace_id = toNumber(selectedWorkspace);
    const pid = toNumber(projectId);
    const lid = toNumber(labourId);
    const currentDate = getCurrentDateYYYYMMDD();
    const totalAmount = rate * hours;

    if (!workspace_id || !pid || !lid) {
      showError('Missing required information');
      return;
    }

    const toastId = showLoading('Saving overtime...');
    setIsSubmitting(true);
    try {
      // Create OT payable bill
      await createOTPayableBill({
        workspace_id,
        project_id: pid,
        title: 'labourd attandse', // As per API example
        amount: totalAmount,
        status: 'Pending',
        method: 'Cash',
        labour_id: lid,
        paidDate: currentDate,
      });

      // Create OT attendance
      const shift_type_id = toNumber(labour.shiftTypeId || labour.shift_type_id);
      if (shift_type_id) {
        await createAttendance({
          workspace_id,
          project_id: pid,
          shift_type_id,
          labour_id: lid,
          date: currentDate,
          status: 'OT',
        });
      }

      // Save overtime data locally
      setOvertimeData((prev) => {
        const updated = {
          ...prev,
          [labourId]: { ratePerHour: rate, otHours: hours },
        };
        // Notify parent component about overtime data change
        if (onAttendanceDataChange) {
          onAttendanceDataChange(attendanceData, updated);
        }
        return updated;
      });

      // Refresh attendance data for this specific labour to get updated payable_amount
      const workspace_id_num = toNumber(selectedWorkspace);
      const pid_num = toNumber(projectId);
      if (workspace_id_num && pid_num && lid) {
        try {
            // Fetch attendance for this specific labour
            const response = await getAttendance({
              workspace_id: workspace_id_num,
              project_id: pid_num,
              date: currentDate,
              labour_id: lid, // Filter by specific labour_id
            });
            
            // Handle different response structures
            let attendanceList = [];
            if (Array.isArray(response?.attendanceRecords)) {
              attendanceList = response.attendanceRecords;
            } else if (Array.isArray(response?.data)) {
              attendanceList = response.data;
            } else if (Array.isArray(response)) {
              attendanceList = response;
            }
          
          // Update attendance data for this specific labour
          if (attendanceList.length > 0) {
            const attendance = attendanceList[0]; // Should be single record for specific labour_id
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
              
              // Calculate payable amount based on status
              let calculatedPayable = 0;
              if (mappedStatus === 'P') {
                calculatedPayable = dailyWage; // Full day
              } else if (mappedStatus === 'H') {
                calculatedPayable = dailyWage / 2; // Half day
              } else if (mappedStatus === 'OT') {
                calculatedPayable = dailyWage; // Base pay for OT
              } else if (mappedStatus === 'A') {
                calculatedPayable = 0; // Absent
              }
              
              const attendanceInfo = {
                status: mappedStatus,
                payable_amount: attendance.payable_amount !== undefined && attendance.payable_amount !== null && attendance.payable_amount > 0
                  ? attendance.payable_amount
                  : calculatedPayable,
                daily_wage: dailyWage,
              };
              // Update only this labour's attendance data
              setAttendanceData((prev) => {
                const updated = {
                  ...prev,
                  [lidNum]: attendanceInfo,
                  [lidStr]: attendanceInfo,
                };
                // Notify parent component about attendance data change
                if (onAttendanceDataChange) {
                  onAttendanceDataChange(updated, overtimeData);
                }
                return updated;
              });
            }
          }
        } catch (e) {
          console.error('Error refreshing attendance:', e);
        }
      }

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
      {isLoading ? (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-lightGray w-full text-sm text-secondary">
          Loading...
        </div>
      ) : null}
      {labourList.map((labour, idx) => {
        const avatarStyle = AVATAR_VARIANTS[idx % AVATAR_VARIANTS.length];

        return (
          <div
            key={labour.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-lightGray w-full"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-lightGray">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0"
                  style={{
                    border: `1px solid ${avatarStyle.border}`,
                    backgroundColor: avatarStyle.bg,
                    color: avatarStyle.text,
                  }}
                >
                  {labour.avatar || getInitials(labour.name)}
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-primary text-sm truncate">{labour.name}</p>
                  <p className="text-xs text-secondary truncate">{labour.role}</p>
                </div>
              </div>

              <DropdownMenu
                openDirection="up"
                items={[
                  { label: t('cards.menu.markPaidLeave'), onClick: () => handleMarkPaidLeave(labour.id) },
                  { label: t('cards.menu.viewEditLabour'), onClick: () => handleViewEditLabour(labour), highlight: true },
                  { label: t('cards.menu.moveToAnotherProject'), onClick: () => handleMoveToProject(labour) },
                  { label: t('cards.menu.payAdvance'), onClick: () => handlePayAdvance(labour) },
                  { label: t('cards.menu.addBonus'), onClick: () => handleAddBonus(labour) },
                  { label: t('cards.menu.addDeduction'), onClick: () => handleAddDeduction(labour) },
                  { label: t('cards.menu.deleteLabour'), textColor: 'text-accent', onClick: () => handleDeleteLabour(labour.id) },
                ]}

              />
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
                      const currentStatus = attendanceInfo?.status || labour.status || null;
                      
                      // Get daily wage from attendanceData or labour
                      const dailyWage = attendanceInfo?.daily_wage || labour.pay || 0;
                      
                      // Calculate payable amount based on status
                      let payableAmount = 0;
                      
                      if (currentStatus === 'P') {
                        payableAmount = dailyWage; // Full day for Present
                      } else if (currentStatus === 'H') {
                        payableAmount = dailyWage / 2; // Half day
                      } else if (currentStatus === 'OT') {
                        // Overtime: daily wage + (rate per hour * hours)
                        const basePay = dailyWage;
                        const otData = overtimeData[labour.id];
                        if (otData && otData.ratePerHour && otData.otHours) {
                          const overtimePay = Number(otData.ratePerHour) * Number(otData.otHours);
                          payableAmount = basePay + overtimePay;
                        } else {
                          payableAmount = basePay; // If no overtime data, just return base pay
                        }
                      } else if (currentStatus === 'A') {
                        payableAmount = 0; // Absent
                      }
                      
                      // Use payable_amount from API if available and not zero, otherwise use calculated
                      const apiPayable = attendanceInfo?.payable_amount;
                      if (apiPayable !== undefined && apiPayable !== null && apiPayable > 0) {
                        return formatCurrencyINR(apiPayable);
                      }
                      
                      return formatCurrencyINR(payableAmount);
                    })()}
                  </p>
                </div>
              </div>

              {/* Overtime inputs - show when OT is selected */}
              {(() => {
                const labourIdNum = Number(labour.id);
                const labourIdStr = String(labour.id);
                const attendanceInfo = attendanceData[labourIdNum] || attendanceData[labourIdStr];
                // Only show OT inputs if attendanceInfo exists and status is OT
                // Don't fallback to labour.status to prevent flickering
                return attendanceInfo?.status === 'OT';
              })() && (
                <div className="pt-3 border-t border-lightGray max-w-[450px]">
                  <div className="flex items-end gap-3 mb-3">
                    <div className="flex-1">
                      <Input
                        label={t('overtimeModal.ratePerHour', { defaultValue: 'Rate/hr' })}
                        placeholder={t('overtimeModal.ratePlaceholder', { defaultValue: 'Rate/hr' })}
                        value={overtimeInputs[labour.id]?.ratePerHour || ''}
                        onChange={(e) => handleOvertimeInputChange(labour.id, 'ratePerHour', e.target.value)}
                        type="number"
                        step="any"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label={t('overtimeModal.otHours', { defaultValue: 'OT Hours' })}
                        placeholder={t('overtimeModal.hoursPlaceholder', { defaultValue: 'OT Hours' })}
                        value={overtimeInputs[labour.id]?.otHours || ''}
                        onChange={(e) => handleOvertimeInputChange(labour.id, 'otHours', e.target.value)}
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
                        disabled={isSubmitting || !overtimeInputs[labour.id]?.ratePerHour?.trim() || !overtimeInputs[labour.id]?.otHours?.trim()}
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
      onClick={onClick}
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

