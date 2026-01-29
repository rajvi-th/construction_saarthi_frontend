/**
 * Finance API
 * API calls for finance features
 */

import http from '../../../services/http';
import { FINANCE_ENDPOINTS_FLAT } from '../constants/financeEndpoints';

/**
 * Get all expense sections for a project
 * @param {string|number} projectId - Project ID
 * @returns {Promise<Array>} List of expense sections
 */
export const getExpenseSections = async (projectId) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  return http.get(FINANCE_ENDPOINTS_FLAT.EXPENSE_SECTION_LIST, {
    params: {
      project_id: projectId,
    },
  });
};

/**
 * Create a new expense section
 * @param {Object} data - Expense section data
 * @param {string} data.name - Section name
 * @param {string|number} data.workspace_id - Workspace ID
 * @param {string|number} data.project_id - Project ID
 * @returns {Promise<Object>} Created expense section
 */
export const createExpenseSection = async (data) => {
  if (!data.name || !data.workspace_id || !data.project_id) {
    throw new Error('Name, workspace_id, and project_id are required');
  }

  return http.post(FINANCE_ENDPOINTS_FLAT.EXPENSE_SECTION_CREATE, {
    name: data.name,
    workspace_id: data.workspace_id,
    project_id: data.project_id,
  });
};

/**
 * Update an existing expense section
 * @param {string|number} sectionId - Section ID
 * @param {Object} data - Expense section data
 * @param {string} data.name - Section name
 * @returns {Promise<Object>} Updated expense section
 */
export const updateExpenseSection = async (sectionId, data) => {
  if (!sectionId) {
    throw new Error('Section ID is required');
  }
  if (!data.name) {
    throw new Error('Name is required');
  }

  return http.put(`${FINANCE_ENDPOINTS_FLAT.EXPENSE_SECTION_UPDATE}/${sectionId}`, {
    name: data.name,
  });
};

/**
 * Delete an expense section
 * @param {string|number} sectionId - Section ID
 * @returns {Promise<Object>} API response
 */
export const deleteExpenseSection = async (sectionId) => {
  if (!sectionId) {
    throw new Error('Section ID is required');
  }

  return http.delete(`${FINANCE_ENDPOINTS_FLAT.EXPENSE_SECTION_DELETE}/${sectionId}`);
};

/**
 * Get payable bills
 * @param {Object} params - Query parameters
 * @param {string|number} params.project_id - Project ID
 * @param {string|number} params.workspace_id - Workspace ID
 * @param {string|number} params.expenseSection_id - Expense Section ID
 * @param {string} [params.status] - Status filter (e.g., "Paid", "Pending")
 * @param {string} [params.startDate] - Start date filter (YYYY-MM-DD)
 * @param {string} [params.endDate] - End date filter (YYYY-MM-DD)
 * @param {string} [params.receiver_name] - Receiver name filter
 * @param {string|number} [params.paidTo] - Paid to vendor ID filter
 * @param {string} [params.method] - Payment method filter (Cash, Cheque, Bank Transfer, UPI, Other)
 * @param {number} [params.minAmount] - Minimum amount filter
 * @param {number} [params.maxAmount] - Maximum amount filter
 * @param {string} [params.paidDate] - Paid date filter (YYYY-MM-DD)
 * @param {string} [params.due_date] - Due date filter (YYYY-MM-DD)
 * @param {string|number} [params.category_id] - Category ID filter
 * @returns {Promise<Array>} List of payable bills
 */
export const getPayableBills = async (params) => {
  if (!params.project_id || !params.workspace_id || !params.expenseSection_id) {
    throw new Error('project_id, workspace_id, and expenseSection_id are required');
  }

  // Build query parameters object
  const queryParams = {
    project_id: params.project_id,
    workspace_id: params.workspace_id,
    expenseSection_id: params.expenseSection_id,
  };

  // Add optional filters (only include if they have a value)
  if (params.status) {
    queryParams.status = params.status;
  }
  if (params.startDate) {
    queryParams.startDate = params.startDate;
  }
  if (params.endDate) {
    queryParams.endDate = params.endDate;
  }
  if (params.receiver_name) {
    queryParams.receiver_name = params.receiver_name.trim();
  }
  if (params.paidTo) {
    queryParams.paidTo = params.paidTo;
  }
  if (params.method) {
    queryParams.method = params.method;
  }
  if (params.minAmount !== undefined && params.minAmount !== null) {
    queryParams.minAmount = typeof params.minAmount === 'string'
      ? parseFloat(params.minAmount.replace(/[₹,]/g, ''))
      : params.minAmount;
  }
  if (params.maxAmount !== undefined && params.maxAmount !== null) {
    queryParams.maxAmount = typeof params.maxAmount === 'string'
      ? parseFloat(params.maxAmount.replace(/[₹,]/g, ''))
      : params.maxAmount;
  }
  if (params.paidDate) {
    queryParams.paidDate = params.paidDate;
  }
  if (params.due_date) {
    queryParams.due_date = params.due_date;
  }
  if (params.category_id) {
    queryParams.category_id = params.category_id;
  }

  return http.get(FINANCE_ENDPOINTS_FLAT.PAYABLE_BILL_GET, {
    params: queryParams,
  });
};

/**
 * Create a new payable bill
 * @param {Object} data - Payable bill data
 * @param {string|number} data.expenseSection_id - Expense Section ID
 * @param {string|number} data.workspace_id - Workspace ID
 * @param {string|number} data.project_id - Project ID
 * @param {string} data.title - Bill title
 * @param {string|number} data.amount - Amount
 * @param {string} data.status - Status (Pending or Paid)
 * @param {string} data.defineScript - Description
 * @param {string} [data.method] - Payment method (default: "Cash")
 * @param {string|number} [data.paidTo] - Vendor ID or name
 * @param {string|number} [data.paidBy] - User ID who paid
 * @param {string} [data.paidDate] - Date when paid (YYYY-MM-DD, only if status is Paid)
 * @param {string} data.due_date - Due date (YYYY-MM-DD)
 * @param {File} [data.PaymentProof] - Payment proof file (optional)
 * @returns {Promise<Object>} Created payable bill
 */
export const createPayableBill = async (data) => {
  if (!data.expenseSection_id || !data.workspace_id || !data.project_id || !data.title || !data.amount || !data.status || !data.due_date) {
    throw new Error('expenseSection_id, workspace_id, project_id, title, amount, status, and due_date are required');
  }

  const formData = new FormData();

  // Required fields
  formData.append('expenseSection_id', data.expenseSection_id);
  formData.append('workspace_id', data.workspace_id);
  formData.append('project_id', data.project_id);
  formData.append('title', data.title);
  formData.append('amount', data.amount);
  formData.append('status', data.status);
  formData.append('defineScript', data.defineScript || data.description || '');
  formData.append('due_date', data.due_date);

  // Optional fields with defaults
  formData.append('method', data.method || 'Cash');

  // paidTo - vendor ID or name
  if (data.paidTo) {
    formData.append('paidTo', data.paidTo);
  }

  // paidBy - user ID
  if (data.paidBy) {
    formData.append('paidBy', data.paidBy);
  }

  // paidDate - only if status is Paid
  if (data.status === 'Paid' || data.status === 'paid') {
    if (data.paidDate) {
      formData.append('paidDate', data.paidDate);
    }
  }

  // PaymentProof - file upload (optional)
  if (data.PaymentProof && data.PaymentProof instanceof File) {
    formData.append('PaymentProof', data.PaymentProof);
  }

  return http.post(FINANCE_ENDPOINTS_FLAT.PAYABLE_BILL_CREATE, formData);
};

/**
 * Update an existing payable bill
 * @param {string|number} billId - Bill ID
 * @param {Object} data - Payable bill data
 * @param {string|number} data.expenseSection_id - Expense Section ID
 * @param {string|number} data.workspace_id - Workspace ID
 * @param {string|number} data.project_id - Project ID
 * @param {string} data.title - Bill title
 * @param {string|number} data.amount - Amount
 * @param {string} data.status - Status (Pending or Paid)
 * @param {string} data.defineScript - Description
 * @param {string} [data.method] - Payment method (default: "Cash")
 * @param {string|number} [data.paidTo] - Vendor ID
 * @param {string|number} [data.paidBy] - User ID
 * @param {string} [data.paidDate] - Paid date (YYYY-MM-DD format)
 * @param {string} data.due_date - Due date (YYYY-MM-DD format)
 * @param {File} [data.PaymentProof] - Payment proof file
 * @param {string|number} [data.category_id] - Category ID
 * @returns {Promise<Object>} Updated payable bill
 */
export const updatePayableBill = async (billId, data) => {
  if (!billId) {
    throw new Error('Bill ID is required');
  }

  if (!data.expenseSection_id || !data.workspace_id || !data.project_id || !data.title || !data.amount || !data.status || !data.due_date) {
    throw new Error('expenseSection_id, workspace_id, project_id, title, amount, status, and due_date are required');
  }

  const formData = new FormData();

  // Required fields
  formData.append('expenseSection_id', data.expenseSection_id);
  formData.append('workspace_id', data.workspace_id);
  formData.append('project_id', data.project_id);
  formData.append('title', data.title.trim());

  // Convert amount to number if it's a string (remove currency formatting)
  const amountValue = typeof data.amount === 'string'
    ? parseFloat(data.amount.toString().replace(/[₹,]/g, ''))
    : data.amount;
  formData.append('amount', amountValue);

  formData.append('status', data.status);
  formData.append('defineScript', data.defineScript || data.description || '');
  formData.append('due_date', data.due_date);

  // Optional fields with defaults
  formData.append('method', data.method || 'Cash');

  // paidTo - vendor ID
  if (data.paidTo) {
    formData.append('paidTo', data.paidTo);
  }

  // paidBy - user ID
  if (data.paidBy) {
    formData.append('paidBy', data.paidBy);
  }

  // paidDate - only if status is Paid
  if (data.status === 'Paid' || data.status === 'paid') {
    if (data.paidDate) {
      formData.append('paidDate', data.paidDate);
    }
  }

  // PaymentProof - file upload (optional)
  if (data.PaymentProof && data.PaymentProof instanceof File) {
    formData.append('PaymentProof', data.PaymentProof);
  }

  // category_id - optional
  if (data.category_id) {
    formData.append('category_id', data.category_id);
  }

  return http.put(`${FINANCE_ENDPOINTS_FLAT.PAYABLE_BILL_UPDATE}/${billId}`, formData);
};

/**
 * Delete a payable bill
 * @param {string|number} billId - Bill ID
 * @returns {Promise<Object>} Deletion response
 */
export const deletePayableBill = async (billId) => {
  if (!billId) {
    throw new Error('Bill ID is required');
  }

  return http.delete(`${FINANCE_ENDPOINTS_FLAT.PAYABLE_BILL_DELETE}/${billId}`);
};

/**
 * Get all builder invoice sections
 * Try GET first, fallback to POST if needed
 * @param {Object} params - Query parameters
 * @param {string|number} params.workspace_id - Workspace ID
 * @param {string|number} params.project_id - Project ID
 * @returns {Promise<Array>} List of builder invoice sections
 */
export const getBuilderInvoiceSections = async (params = {}) => {
  if (!params.workspace_id || !params.project_id) {
    throw new Error('workspace_id and project_id are required');
  }

  try {
    // Try GET request first (most common for list endpoints)
    return await http.get(FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_LIST, {
      params: {
        workspace_id: params.workspace_id,
        project_id: params.project_id,
      },
    });
  } catch (error) {
    // If GET fails with 404, try POST (as per Postman request)
    if (error?.response?.status === 404 || error?.response?.status === 405) {
      return await http.post(FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_LIST, {
        workspace_id: params.workspace_id,
        project_id: params.project_id,
      });
    }
    // Re-throw other errors
    throw error;
  }
};

/**
 * Get invoices for a builder invoice section
 * POST request to fetch invoices for a specific section
 * @param {string|number} sectionId - Section ID
 * @returns {Promise<Array>} List of invoices for the section
 */
export const getBuilderInvoiceSectionInvoices = async (sectionId) => {
  if (!sectionId) {
    throw new Error('Section ID is required');
  }

  try {
    // Try GET request first
    return await http.get(FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_INVOICES, {
      params: {
        section_id: sectionId,
      },
    });
  } catch (error) {
    // If GET fails with 404/405, try POST (as per Postman request)
    if (error?.response?.status === 404 || error?.response?.status === 405) {
      // For POST, params go in the config object
      const url = `${FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_INVOICES}?section_id=${sectionId}`;
      return await http.post(url, {});
    }
    // Re-throw other errors
    throw error;
  }
};

/**
 * Create a new builder invoice
 * @param {Object} data - Builder invoice data
 * @param {string} data.title - Invoice title (milestone title)
 * @param {string|number} data.estBudget - Percentage of total estimated budget
 * @param {string|number} data.amount - Invoice amount
 * @param {string} data.status - Status (Pending, Completed, In Progress)
 * @param {string} [data.description] - Description
 * @param {File[]} [data.files] - Array of files to upload
 * @param {string|number} data.builderInvoicesSection_id - Section ID
 * @param {string|number} data.workspace_id - Workspace ID
 * @param {string|number} data.project_id - Project ID
 * @returns {Promise<Object>} Created builder invoice
 */
export const createBuilderInvoice = async (data) => {
  if (!data.title || !data.estBudget || !data.amount || !data.status || !data.builderInvoicesSection_id || !data.workspace_id || !data.project_id) {
    throw new Error('title, estBudget, amount, status, builderInvoicesSection_id, workspace_id, and project_id are required');
  }

  const formData = new FormData();

  // Required fields - ensure proper data types
  formData.append('title', data.title.trim());
  // Convert estBudget to number if it's a string
  const estBudgetValue = typeof data.estBudget === 'string' ? parseFloat(data.estBudget) || 0 : data.estBudget;
  formData.append('estBudget', estBudgetValue);
  // Convert amount to number if it's a string (remove currency formatting first)
  const amountValue = typeof data.amount === 'string' ? parseFloat(data.amount.toString().replace(/[₹,]/g, '')) || 0 : data.amount;
  formData.append('amount', amountValue);

  // Map status: "pending" -> "Pending", "completed" -> "Completed", "paid" -> "Completed" (backend uses Completed, not Paid), etc.
  const statusMap = {
    'pending': 'Pending',
    'completed': 'Completed',
    'paid': 'Completed', // Backend uses "Completed" instead of "Paid"
    'in progress': 'In Progress',
    'in_progress': 'In Progress',
  };
  const mappedStatus = statusMap[data.status?.toLowerCase()] || data.status;
  formData.append('status', mappedStatus);

  formData.append('builderInvoicesSection_id', data.builderInvoicesSection_id);
  formData.append('workspace_id', data.workspace_id);
  formData.append('project_id', data.project_id);

  // Optional fields
  if (data.description) {
    formData.append('description', data.description.trim());
  }

  // Files - append each file
  if (data.files && Array.isArray(data.files) && data.files.length > 0) {
    console.log('Files to upload:', data.files.length);
    data.files.forEach((file, index) => {
      if (file instanceof File) {
        formData.append('files', file);
        console.log(`Appended file[${index}]:`, file.name, file.type, `(${file.size} bytes)`);
      } else {
        console.warn(`Skipping invalid file at index ${index}:`, file);
      }
    });
  } else {
    console.log('No files to upload');
  }

  // Debug: Log FormData contents
  console.log('FormData entries:');
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}:`, value.name, `(${value.size} bytes, ${value.type})`);
    } else {
      console.log(`${key}:`, value);
    }
  }

  return http.post(FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_CREATE_INVOICE, formData);
};

/**
 * Update an existing builder invoice
 * @param {string|number} invoiceId - Invoice ID
 * @param {Object} data - Builder invoice data
 * @param {string} data.title - Invoice title (milestone title)
 * @param {string|number} data.estBudget - Percentage of total estimated budget
 * @param {string|number} data.amount - Invoice amount
 * @param {string} data.status - Status (Pending, Completed, In Progress)
 * @param {string} [data.description] - Description
 * @param {File[]} [data.files] - Array of files to upload
 * @param {string|number} data.builderInvoicesSection_id - Section ID
 * @param {string|number} data.workspace_id - Workspace ID
 * @param {string|number} data.project_id - Project ID
 * @returns {Promise<Object>} Updated builder invoice
 */
export const updateBuilderInvoice = async (invoiceId, data) => {
  if (!invoiceId) {
    throw new Error('Invoice ID is required');
  }

  if (!data.title || !data.estBudget || !data.amount || !data.status || !data.builderInvoicesSection_id || !data.workspace_id || !data.project_id) {
    throw new Error('title, estBudget, amount, status, builderInvoicesSection_id, workspace_id, and project_id are required');
  }

  const formData = new FormData();

  // Required fields
  formData.append('title', data.title.trim());
  formData.append('estBudget', data.estBudget);
  formData.append('amount', data.amount);

  // Map status: "pending" -> "Pending", "completed" -> "Completed", "paid" -> "Completed" (backend uses Completed, not Paid), etc.
  const statusMap = {
    'pending': 'Pending',
    'completed': 'Completed',
    'paid': 'Completed', // Backend uses "Completed" instead of "Paid"
    'in progress': 'In Progress',
    'in_progress': 'In Progress',
  };
  const mappedStatus = statusMap[data.status?.toLowerCase()] || data.status;
  formData.append('status', mappedStatus);

  formData.append('builderInvoicesSection_id', data.builderInvoicesSection_id);
  formData.append('workspace_id', data.workspace_id);
  formData.append('project_id', data.project_id);

  // Optional fields - always send description (even if empty) as per Postman
  formData.append('description', data.description ? data.description.trim() : '');

  // Files - append each file (only if files are provided)
  if (data.files && Array.isArray(data.files) && data.files.length > 0) {
    console.log('Files to upload (update):', data.files.length);
    data.files.forEach((file, index) => {
      if (file instanceof File) {
        formData.append('files', file);
        console.log(`Appended file[${index}]:`, file.name, file.type, `(${file.size} bytes)`);
      } else {
        console.warn(`Skipping invalid file at index ${index}:`, file);
      }
    });
  } else {
    console.log('No files to upload (update) - skipping files field');
  }

  // Debug: Log FormData contents
  console.log('FormData entries (update):');
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}:`, value.name, `(${value.size} bytes, ${value.type})`);
    } else {
      console.log(`${key}:`, value);
    }
  }

  return http.put(`${FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_UPDATE_INVOICE}/${invoiceId}`, formData);
};

/**
 * Delete a builder invoice
 * @param {string|number} invoiceId - Invoice ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteBuilderInvoice = async (invoiceId) => {
  if (!invoiceId) {
    throw new Error('Invoice ID is required');
  }

  return http.delete(`${FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_DELETE_INVOICE}/${invoiceId}`);
};

/**
 * Create a new builder invoice section
 * @param {Object} data - Builder invoice section data
 * @param {string} data.name - Section name
 * @param {string|number} data.workspace_id - Workspace ID
 * @param {string|number} data.project_id - Project ID
 * @returns {Promise<Object>} Created builder invoice section
 */
export const createBuilderInvoiceSection = async (data) => {
  if (!data.name || !data.name.trim()) {
    throw new Error('Section name is required');
  }

  if (!data.workspace_id || !data.project_id) {
    throw new Error('workspace_id and project_id are required');
  }

  return http.post(FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_CREATE, {
    name: data.name.trim(),
    workspace_id: data.workspace_id,
    project_id: data.project_id,
  });
};

/**
 * Update an existing builder invoice section
 * @param {string|number} sectionId - Section ID
 * @param {Object} data - Builder invoice section data
 * @param {string} data.name - Section name
 * @returns {Promise<Object>} Updated builder invoice section
 */
export const updateBuilderInvoiceSection = async (sectionId, data) => {
  if (!sectionId) {
    throw new Error('Section ID is required');
  }

  if (!data.name || !data.name.trim()) {
    throw new Error('Section name is required');
  }

  return http.put(`${FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_UPDATE_SECTION}/${sectionId}`, {
    name: data.name.trim(),
  });
};

/**
 * Delete a builder invoice section
 * @param {string|number} sectionId - Section ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteBuilderInvoiceSection = async (sectionId) => {
  if (!sectionId) {
    throw new Error('Section ID is required');
  }

  return http.delete(`${FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_DELETE_SECTION}/${sectionId}`);
};

/**
 * Get estimated budget for a project
 * Attempts GET request first, falls back to POST if GET returns 404/405.
 * @param {string|number} projectId - Project ID
 * @returns {Promise<Object>} Estimated budget data
 */
export const getProjectEstimatedBudget = async (projectId) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  try {
    // Try GET request first
    return await http.get(`${FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_GET_ESTIMATED_BUDGET}/${projectId}`);
  } catch (error) {
    // If GET fails with 404 or 405, try POST with empty body (as per Postman)
    if (error?.response?.status === 404 || error?.response?.status === 405) {
      console.warn(`GET ${FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_GET_ESTIMATED_BUDGET}/${projectId} failed with 404/405, trying POST with empty body.`);
      return await http.post(`${FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_GET_ESTIMATED_BUDGET}/${projectId}`, {});
    }
    throw error; // Re-throw other errors
  }
};

/**
 * Update estimated budget for a project
 * @param {string|number} projectId - Project ID
 * @param {number} estimatedBudget - Estimated budget amount
 * @returns {Promise<Object>} Updated estimated budget data
 */
export const updateProjectEstimatedBudget = async (projectId, estimatedBudget) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  if (estimatedBudget === undefined || estimatedBudget === null) {
    throw new Error('Estimated budget is required');
  }

  // Convert to number if it's a string (remove currency formatting)
  const budgetValue = typeof estimatedBudget === 'string'
    ? parseFloat(estimatedBudget.toString().replace(/[₹,]/g, ''))
    : estimatedBudget;

  if (isNaN(budgetValue) || budgetValue < 0) {
    throw new Error('Invalid estimated budget value');
  }

  return http.put(
    `${FINANCE_ENDPOINTS_FLAT.BUILDER_INVOICES_SECTION_UPDATE_ESTIMATED_BUDGET}/${projectId}`,
    {
      estimatedBudget: budgetValue,
    }
  );
};

/**
 * Get banks for a project
 * @param {string|number} projectId - Project ID
 * @returns {Promise<Array>} List of banks
 */
export const getBanks = async (projectId) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  return http.get(FINANCE_ENDPOINTS_FLAT.BANK_GET, {
    params: {
      projectId: projectId,
    },
  });
};

/**
 * Create a new bank
 * @param {Object} data - Bank data
 * @param {string} data.name - Bank name
 * @param {string|number} data.projectId - Project ID
 * @returns {Promise<Object>} Created bank
 */
export const createBank = async (data) => {
  if (!data.name || !data.projectId) {
    throw new Error('Bank name and projectId are required');
  }

  return http.post(FINANCE_ENDPOINTS_FLAT.BANK_CREATE, {
    name: data.name.trim(),
    projectId: data.projectId,
  });
};

/**
 * Create a new payment entry (income)
 * @param {Object} data - Payment entry data
 * @param {string} data.payment_no - Payment number
 * @param {string} data.date - Date (YYYY-MM-DD format)
 * @param {string} data.from - From (sender)
 * @param {string} data.to - To (recipient)
 * @param {number} data.amount - Amount
 * @param {string} data.method - Payment method (Cash, Bank Transfer, etc.)
 * @param {string|number} data.project_id - Project ID
 * @param {string|number} data.workspace_id - Workspace ID
 * @param {number} [data.bank_id] - Bank ID (optional, required if method is Bank Transfer)
 * @param {string} [data.description] - Description
 * @returns {Promise<Object>} Created payment entry
 */
export const createIncome = async (data) => {
  if (!data.payment_no || !data.date || !data.from || !data.to || !data.amount || !data.method) {
    throw new Error('payment_no, date, from, to, amount, and method are required');
  }

  if (!data.project_id || !data.workspace_id) {
    throw new Error('project_id and workspace_id are required');
  }

  const payload = {
    payment_no: data.payment_no.trim(),
    date: data.date, // Should be YYYY-MM-DD format
    from: data.from.trim(),
    to: data.to.trim(),
    amount: typeof data.amount === 'string'
      ? parseFloat(data.amount.replace(/[₹,]/g, ''))
      : data.amount,
    method: data.method.trim(),
    description: data.description || '',
    project_id: data.project_id,
    workspace_id: data.workspace_id,
  };

  // Add bank_id only if provided
  if (data.bank_id) {
    payload.bank_id = typeof data.bank_id === 'string' ? parseInt(data.bank_id) : data.bank_id;
  }

  return http.post(FINANCE_ENDPOINTS_FLAT.INCOME_CREATE, payload);
};

/**
 * Get all payment entries (incomes) with filters
 * @param {Object} [filters] - Optional filters
 * @param {string|number} [filters.projectId] - Project ID filter
 * @param {string} [filters.startDate] - Start date filter (YYYY-MM-DD)
 * @param {string} [filters.endDate] - End date filter (YYYY-MM-DD)
 * @param {string} [filters.method] - Payment method filter (Cash, Cheque, Bank Transfer, UPI, Other)
 * @param {string} [filters.to] - Receiver name filter
 * @param {number} [filters.minAmount] - Minimum amount filter
 * @param {number} [filters.maxAmount] - Maximum amount filter
 * @returns {Promise<Array>} List of payment entries
 */
export const getAllIncomes = async (filters = {}) => {
  const params = {};

  // Support both projectId and project_id for backward compatibility
  if (filters.projectId || filters.project_id) {
    params.project_id = filters.projectId || filters.project_id;
  }
  if (filters.startDate) {
    params.startDate = filters.startDate;
  }
  if (filters.endDate) {
    params.endDate = filters.endDate;
  }
  if (filters.method) {
    params.method = filters.method;
  }
  if (filters.to) {
    params.to = filters.to.trim();
  }
  if (filters.minAmount !== undefined && filters.minAmount !== null) {
    params.minAmount = typeof filters.minAmount === 'string'
      ? parseFloat(filters.minAmount.replace(/[₹,]/g, ''))
      : filters.minAmount;
  }
  if (filters.maxAmount !== undefined && filters.maxAmount !== null) {
    params.maxAmount = typeof filters.maxAmount === 'string'
      ? parseFloat(filters.maxAmount.replace(/[₹,]/g, ''))
      : filters.maxAmount;
  }

  return http.get(FINANCE_ENDPOINTS_FLAT.INCOME_GET_ALL, {
    params: params,
  });
};

/**
 * Update a payment entry (income)
 * @param {string|number} incomeId - Income ID
 * @param {Object} data - Payment entry data
 * @param {string} data.payment_no - Payment number
 * @param {string} data.date - Date (YYYY-MM-DD format)
 * @param {string} data.from - From (sender)
 * @param {string} data.to - To (recipient)
 * @param {number} data.amount - Amount
 * @param {string} data.method - Payment method (Cash, Bank Transfer, etc.)
 * @param {number} [data.bank_id] - Bank ID (optional, required if method is Bank Transfer)
 * @param {string} [data.description] - Description
 * @returns {Promise<Object>} Updated payment entry
 */
export const updateIncome = async (incomeId, data) => {
  if (!incomeId) {
    throw new Error('Income ID is required');
  }

  if (!data.payment_no || !data.date || !data.from || !data.to || !data.amount || !data.method) {
    throw new Error('payment_no, date, from, to, amount, and method are required');
  }

  const payload = {
    payment_no: data.payment_no.trim(),
    date: data.date, // Should be YYYY-MM-DD format
    from: data.from.trim(),
    to: data.to.trim(),
    amount: typeof data.amount === 'string'
      ? parseFloat(data.amount.replace(/[₹,]/g, ''))
      : data.amount,
    method: data.method.trim(),
    description: data.description || '',
  };

  // Add bank_id only if provided
  if (data.bank_id) {
    payload.bank_id = typeof data.bank_id === 'string' ? parseInt(data.bank_id) : data.bank_id;
  }

  return http.put(`${FINANCE_ENDPOINTS_FLAT.INCOME_UPDATE}/${incomeId}`, payload);
};

/**
 * Delete a payment entry (income)
 * @param {string|number} incomeId - Income ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteIncome = async (incomeId) => {
  if (!incomeId) {
    throw new Error('Income ID is required');
  }

  return http.delete(`${FINANCE_ENDPOINTS_FLAT.INCOME_DELETE}/${incomeId}`);
};

/**
 * Get all categories for a workspace
 * @param {string|number} workspace_id - Workspace ID
 * @returns {Promise<Array>} List of categories
 */
export const getCategories = async (workspace_id) => {
  if (!workspace_id) {
    throw new Error('workspace_id is required');
  }

  return http.get(`${FINANCE_ENDPOINTS_FLAT.CATEGORY_GET}/${workspace_id}`);
};

/**
 * Create a new category
 * @param {Object} data - Category data
 * @param {string} data.name - Category name
 * @param {string|number} data.workspace_id - Workspace ID
 * @param {string} [data.categoryId] - Category ID (optional, empty string for new category)
 * @returns {Promise<Object>} Created category
 */
export const createCategory = async (data) => {
  if (!data.name || !data.workspace_id) {
    throw new Error('Category name and workspace_id are required');
  }

  return http.post(FINANCE_ENDPOINTS_FLAT.CATEGORY_CREATE, {
    categoryId: data.categoryId || '',
    name: data.name.trim(),
    workspace_id: data.workspace_id,
  });
};

/**
 * Get vendors by workspace and role
 * @param {string|number} workspace_id - Workspace ID
 * @param {string} [role] - Role filter (default: 'vendor')
 * @returns {Promise<Array>} List of vendors
 */
export const getVendors = async (workspace_id, role = 'vendor') => {
  if (!workspace_id) {
    throw new Error('workspace_id is required');
  }

  return http.get(FINANCE_ENDPOINTS_FLAT.BUILDER_USER_ROLES, {
    params: {
      workspace_id,
      role,
    },
  });
};

/**
 * Create a new vendor/builder
 * @param {Object} data - Vendor data
 * @param {string} data.full_name - Vendor full name
 * @param {string} data.phone_number - Phone number (without country code)
 * @param {string|number} data.workspace_id - Workspace ID
 * @param {string} [data.role] - Role (default: 'vendor')
 * @param {File} [data.profile] - Profile picture file (optional)
 * @returns {Promise<Object>} Created vendor
 */
export const createVendor = async (data) => {
  if (!data.full_name || !data.phone_number || !data.workspace_id) {
    throw new Error('full_name, phone_number, and workspace_id are required');
  }

  const formData = new FormData();

  // Required fields
  formData.append('full_name', data.full_name.trim());
  formData.append('phone_number', data.phone_number.trim());
  formData.append('workspace_id', data.workspace_id);
  formData.append('role', data.role || 'vendor');

  // Optional profile file
  if (data.profile && data.profile instanceof File) {
    formData.append('profile', data.profile);
  }

  return http.post(FINANCE_ENDPOINTS_FLAT.BUILDER_CREATE, formData);
};

/**
 * Get financial summary for a project
 * @param {Object} params - Query parameters
 * @param {string|number} params.project_id - Project ID
 * @param {string|number} params.workspace_id - Workspace ID
 * @returns {Promise<Object>} Financial summary data
 */
export const getFinancialSummary = async (params) => {
  if (!params.project_id || !params.workspace_id) {
    throw new Error('project_id and workspace_id are required');
  }

  return http.get(FINANCE_ENDPOINTS_FLAT.PROJECT_FINANCIAL_SUMMARY, {
    params: {
      project_id: params.project_id,
      workspace_id: params.workspace_id,
    },
  });
};

