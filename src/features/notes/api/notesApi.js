/**
 * Notes API
 * API calls for notes feature
 */

import http from '../../../services/http';

/**
 * Get all projects for notes
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Array>} List of projects
 */
export const getNotesProjects = async (workspaceId) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }
  
  return http.get(`/project/${workspaceId}`);
};

/**
 * Get all notes
 * @param {string|number} projectId - Optional project ID to filter notes
 * @returns {Promise<Array>} List of notes
 */
export const getAllNotes = async (projectId = null) => {
  const params = projectId ? { projectId } : {};
  return http.get('/note/all', { params });
};

/**
 * Get note details by ID
 * @param {string|number} noteId - Note ID
 * @returns {Promise<Object>} Note details
 */
export const getNoteDetails = async (noteId) => {
  if (!noteId) {
    throw new Error('Note ID is required');
  }
  
  return http.get(`/note/${noteId}`);
};

/**
 * Update note by ID
 * @param {string|number} noteId - Note ID
 * @param {Object} noteData - Note data to update
 * @returns {Promise<Object>} Updated note
 */
export const updateNote = async (noteId, noteData) => {
  if (!noteId) {
    throw new Error('Note ID is required');
  }
  
  return http.put(`/note/update/${noteId}`, noteData);
};

/**
 * Delete note by ID
 * @param {string|number} noteId - Note ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteNote = async (noteId) => {
  if (!noteId) {
    throw new Error('Note ID is required');
  }
  
  return http.delete(`/note/${noteId}`);
};

/**
 * Start/Initialize a note draft to get noteKey
 * This API is called when "Add Note" button is clicked, before opening the form
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Object>} Response with noteKey
 */
export const startNote = async (workspaceId) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }
  
  const response = await http.post(`/note/startNote/${workspaceId}`);
  
  return response?.data || response || {};
};

/**
 * Create a new note
 * @param {Object} noteData - Note data
 * @param {string} noteData.noteKey - Note key from startNote API
 * @param {string} noteData.title - Note title
 * @param {string|number|Array} noteData.projectIds - Project ID(s) - can be single ID or array
 * @param {string} noteData.file_type - File type ('Voice', 'Text', 'Both')
 * @param {string} [noteData.text] - Text content
 * @param {string} [noteData.reminderDate] - Reminder date in YYYY-MM-DD format
 * @returns {Promise<Object>} Created note
 */
export const createNote = async (noteData) => {
  if (!noteData.noteKey) {
    throw new Error('Note key is required');
  }
  
  if (!noteData.title || !noteData.title.trim()) {
    throw new Error('Note title is required');
  }
  
  if (!noteData.projectIds) {
    throw new Error('Project ID is required');
  }

  // Format reminderDate as YYYY-MM-DD
  let reminderDate = null;
  if (noteData.reminderDate) {
    const date = noteData.reminderDate instanceof Date 
      ? noteData.reminderDate
      : new Date(noteData.reminderDate);
    if (!isNaN(date.getTime())) {
      reminderDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
  }

  // Convert projectIds to array
  const projectIds = Array.isArray(noteData.projectIds) 
    ? noteData.projectIds.map(id => Number(id))
    : [Number(noteData.projectIds)];

  const requestBody = {
    noteKey: noteData.noteKey,
    title: noteData.title.trim(),
    reminderDate: reminderDate,
    projectIds: projectIds,
    file_type: noteData.file_type || 'Text',
    text: noteData.text || '',
  };
  
  return http.post('/note/create', requestBody);
};

