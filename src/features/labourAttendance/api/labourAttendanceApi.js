/**
 * Labour Attendance API
 * API calls for labour attendance feature
 */

import http from '../../../services/http';
import { LABOUR_ATTENDANCE_ENDPOINTS as E } from '../constants/labourAttendanceEndpoints';

/**
 * Get all projects for labour attendance
 * (Same projects list endpoint used by Notes feature)
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Array>} List of projects
 */
export const getLabourAttendanceProjects = async (workspaceId) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }

  return http.get(`/project/${workspaceId}`);
};

export const getShiftTypes = async () => {
  return http.get(`${E.SHIFT_TYPES}?`);
};

export const getCategories = async (workspaceId) => {
  if (!workspaceId) throw new Error('Workspace ID is required');
  return http.get(E.CATEGORIES.LIST(workspaceId));
};

export const createCategory = async ({ workspace_id, name, categoryId = '' }) => {
  if (!workspace_id) throw new Error('Workspace ID is required');
  if (!name) throw new Error('Category name is required');
  return http.post(E.CATEGORIES.CREATE, { categoryId, name, workspace_id: Number(workspace_id) });
};

export const getProjectsAll = async (workspaceId) => {
  if (!workspaceId) throw new Error('Workspace ID is required');
  try {
    return await http.get(E.PROJECTS.LIST_ALL(workspaceId));
  } catch (e) {
    // Fallback to standard endpoint used across app
    return http.get(E.PROJECTS.LIST_STANDARD(workspaceId));
  }
};

export const addLabour = async (formData) => {
  // Must be FormData (includes file uploads)
  if (!(formData instanceof FormData)) {
    throw new Error('addLabour requires FormData');
  }
  return http.post(E.LABOUR.ADD, formData);
};

export const updateLabour = async (labourId, formData) => {
  // Must be FormData (includes file uploads)
  if (!(formData instanceof FormData)) {
    throw new Error('updateLabour requires FormData');
  }
  if (!labourId) {
    throw new Error('Labour ID is required');
  }
  return http.put(`${E.LABOUR.UPDATE}/${labourId}`, formData);
};

export const deleteLabour = async (labourId) => {
  if (!labourId) {
    throw new Error('Labour ID is required');
  }
  return http.delete(`${E.LABOUR.DELETE}/${labourId}`);
};

export const getProjectLabours = async ({ workspaceId, projectId }) => {
  if (!workspaceId) throw new Error('Workspace ID is required');
  if (!projectId) throw new Error('Project ID is required');
  return http.get(E.LABOUR.PROJECT_LABOURS, {
    params: { workspaceId: Number(workspaceId), projectId: Number(projectId) },
  });
};

export const moveLabourToProject = async ({ labour_id, new_project_id }) => {
  if (!labour_id) throw new Error('Labour ID is required');
  if (!new_project_id) throw new Error('New project ID is required');
  return http.post(E.ATTENDANCE.MOVE, { labour_id: Number(labour_id), new_project_id: Number(new_project_id) });
};

export const getAttendance = async ({ workspace_id, project_id, date, labour_id = null }) => {
  if (!workspace_id) throw new Error('Workspace ID is required');
  if (!project_id) throw new Error('Project ID is required');
  if (!date) throw new Error('Date is required');

  const params = {
    workspace_id: Number(workspace_id),
    project_id: Number(project_id),
    date: String(date), // YYYY-MM-DD format
  };

  // Add labour_id if provided (for filtering specific labour)
  if (labour_id !== null && labour_id !== undefined) {
    params.labour_id = Number(labour_id);
  }

  return http.get(E.ATTENDANCE.GET, { params });
};

export const createAttendance = async ({
  workspace_id,
  project_id,
  shift_type_id,
  labour_id,
  date,
  status,
  ot_rate = null,
  ot_hours = null,
  daily_wage = null,
  method = 'Cash',
  expenseSections = 'labour'
}) => {
  if (!workspace_id) throw new Error('Workspace ID is required');
  if (!project_id) throw new Error('Project ID is required');
  if (!shift_type_id) throw new Error('Shift type ID is required');
  if (!labour_id) throw new Error('Labour ID is required');
  if (!date) throw new Error('Date is required');
  if (!status) throw new Error('Status is required');

  // Map status codes to API status names
  const statusMap = {
    P: 'Present',
    A: 'Absent',
    H: 'HalfDay',
    OT: 'OT',
  };
  const apiStatus = statusMap[status] || status;

  const payload = {
    workspace_id: Number(workspace_id),
    project_id: Number(project_id),
    shift_type_id: Number(shift_type_id),
    labour_id: Number(labour_id),
    date: String(date), // YYYY-MM-DD format
    status: apiStatus,
    method: String(method),
    expenseSections: String(expenseSections),
  };

  // Add OT fields only if status is OT
  if (status === 'OT' && ot_rate !== null && ot_hours !== null) {
    payload.ot_rate = Number(ot_rate);
    payload.ot_hours = Number(ot_hours);
  }

  // Add daily_wage if provided
  if (daily_wage !== null) {
    payload.daily_wage = Number(daily_wage);
  }

  return http.post(E.ATTENDANCE.CREATE, payload);
};

export const createOTPayableBill = async ({ workspace_id, project_id, title, amount, status, method, labour_id, paidDate }) => {
  if (!workspace_id) throw new Error('Workspace ID is required');
  if (!project_id) throw new Error('Project ID is required');
  if (!labour_id) throw new Error('Labour ID is required');
  if (!amount || amount <= 0) throw new Error('Valid amount is required');

  return http.post(E.ATTENDANCE.OT_PAYABLE_BILL, {
    expenseSections: 'labour',
    workspace_id: Number(workspace_id),
    project_id: Number(project_id),
    title: String(title || 'Overtime Payable'),
    amount: Number(amount),
    status: String(status || 'Pending'),
    method: String(method || 'Cash'),
    labour_id: Number(labour_id),
    paidDate: String(paidDate || ''), // YYYY-MM-DD format
  });
};

export const createPayLabour = async (payload) => {
  return http.post(E.PAY_LABOUR.CREATE, payload);
};

export const addLabourNote = async (formData) => {
  if (!(formData instanceof FormData)) {
    throw new Error('addLabourNote requires FormData');
  }
  return http.post(E.LABOUR.ADD_NOTE, formData);
};

export const getLabourProfile = async ({ workspaceId, labourId }) => {
  if (!workspaceId) throw new Error('Workspace ID is required');
  if (!labourId) throw new Error('Labour ID is required');

  // Use the new endpoint: /api/labour/all?id={labourId}
  const response = await http.get(`${E.LABOUR.PROFILE_ALL}?id=${labourId}`);

  // Transform the response to match expected structure
  const data = response?.data || response;

  if (!data) {
    throw new Error('No data received from API');
  }

  // Handle notes - could be string, array, or null
  let notesArray = [];
  if (data.notes) {
    if (Array.isArray(data.notes)) {
      notesArray = data.notes;
    } else if (typeof data.notes === 'string') {
      notesArray = [data.notes];
    }
  }

  // Map API response to expected format for LabourDetails UI
  return {
    data: {
      id: data.id,
      name: data.full_name,
      role: data.category_name,
      category: data.category_id,
      contactNumber: data.phone_number ? `${data.country_code || '+91'} ${data.phone_number}` : '',
      countryCode: data.country_code,
      phoneNumber: data.phone_number,
      defaultDailyWage: data.daily_wage,
      pay: data.daily_wage,
      joinDate: data.join_date,
      profilePhoto: data.category_image_url || '',
      profilePhotoPreview: data.category_image_url || '',
      shiftType: data.shift_name,
      shiftTypeId: data.shift_type_id,
      projectId: data.project_id,
      projectName: data.project_name,
      notes: notesArray,
      voiceMemoUrl: data.voiceNotes?.[0] || '',
      voiceNotes: data.voiceNotes || [],
      // Attendance Summary
      attendanceSummary: {
        shift: data.shift_name,
        totalDays: data.attendance?.totalDays || 0,
        presentDays: data.attendance?.present || 0,
        absentDays: data.attendance?.absent || 0,
        halfDayDays: data.attendance?.halfDay || 0,
        otDays: data.attendance?.ot || 0,
        attendancePercent: data.attendance?.percentage || 0,
        lastMark: data.attendance?.lastDate ? formatDate(data.attendance.lastDate) : '-',
      },
      // Wage Summary
      wageSummary: {
        totalWage: data.totalWage || 0,
        paidAmount: data.paid_Amount || 0,
        pendingAmount: data.pending_Amount || 0,
        advances: data.advances || 0,
        bonuses: data.bonuses || 0,
        deductions: data.deductions || 0,
      },
    },
  };
};

export const getLabourById = async (labourId) => {
  if (!labourId) throw new Error('Labour ID is required');
  return http.get(`${E.LABOUR.GET}/${labourId}`);
};

function formatDate(dateValue) {
  if (!dateValue) return '-';
  const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(d.getTime())) return String(dateValue);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}


