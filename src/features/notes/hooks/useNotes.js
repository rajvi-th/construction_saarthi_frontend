/**
 * Custom hook for fetching notes
 * @param {string|number} projectId - Optional project ID to filter notes
 * @returns {Object} { notes, isLoading, error, refetch }
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllNotes } from '../api/notesApi';
import { showError } from '../../../utils/toast';

export const useNotes = (projectId = null) => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const lastProjectIdRef = useRef(null);

  const fetchNotes = useCallback(async (forceRefetch = false) => {
    // Prevent duplicate calls (unless forced)
    if (isFetchingRef.current && !forceRefetch) {
      return;
    }

    // Check if projectId changed - if same ID and not forced, skip
    const currentProjectId = projectId;
    if (!forceRefetch && lastProjectIdRef.current === currentProjectId && lastProjectIdRef.current !== null) {
      return;
    }

    try {
      isFetchingRef.current = true;
      lastProjectIdRef.current = currentProjectId;
      setIsLoading(true);
      setError(null);
      const response = await getAllNotes(currentProjectId);

      // Handle different response structures
      const notesData = response?.data || response?.notes || response || [];
      const notesList = Array.isArray(notesData) ? notesData : [];

      // Transform API response to match component structure
      const transformedNotes = notesList.map((note) => {
        // Access nested noteDetails
        const noteDetails = note.noteDetails || {};
        
        // Parse date and time from reminder_date
        let dateStr = '';
        let timeStr = '';
        let isActive = false;

        if (noteDetails.reminder_date) {
          const reminderDate = new Date(noteDetails.reminder_date);
          dateStr = reminderDate.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          });
          timeStr = reminderDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
          // Check if reminder is active (not past)
          isActive = reminderDate > new Date();
        } else if (note.reminder) {
          const reminderDate = new Date(note.reminder);
          dateStr = reminderDate.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          });
          timeStr = reminderDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
          isActive = reminderDate > new Date();
        } else if (note.date) {
          const noteDate = new Date(note.date);
          dateStr = noteDate.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          });
          timeStr = noteDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
        }

        // Get project ID from noteMappings
        const projectMapping = note.noteMappings?.[0];
        const projectId = projectMapping?.projectWsMapping?.pId;

        return {
          id: note.id || note.note_id,
          title: noteDetails.title || note.title || note.name || 'Untitled Note',
          type: note.noteDocs?.[0]?.file_type || note.type || note.note_type || 'Reminder',
          date: dateStr,
          time: timeStr,
          isActive: note.isActive !== undefined ? note.isActive : isActive,
          projectId: projectId,
          // Keep original data for reference
          originalData: note,
        };
      });

      setNotes(transformedNotes);
    } catch (err) {
      console.error('Error fetching notes:', err);
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        'Failed to load notes';
      setError(errorMessage);
      showError(errorMessage);
      setNotes([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [projectId]);

  useEffect(() => {
    // Reset refs when projectId changes
    if (lastProjectIdRef.current !== projectId) {
      isFetchingRef.current = false;
    }
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]); // Only depend on projectId to avoid unnecessary re-fetches

  const refetch = useCallback(() => {
    return fetchNotes(true); // Force refetch
  }, [fetchNotes]);

  return {
    notes,
    isLoading,
    error,
    refetch,
  };
};

export default useNotes;

