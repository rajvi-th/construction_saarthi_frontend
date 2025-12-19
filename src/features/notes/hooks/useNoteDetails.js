/**
 * Custom hook for fetching note details
 * @param {string|number} noteId - The ID of the note
 * @returns {Object} { note, isLoading, error, refetch }
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getNoteDetails } from '../api/notesApi';
import { showError } from '../../../utils/toast';

export const useNoteDetails = (noteId) => {
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const lastNoteIdRef = useRef(null);

  const fetchNoteDetails = useCallback(async (forceRefetch = false) => {
    if (!noteId) {
      setNote(null);
      setIsLoading(false);
      setError(null);
      lastNoteIdRef.current = null;
      isFetchingRef.current = false;
      return;
    }

    // Prevent duplicate calls (unless forced)
    if (isFetchingRef.current && !forceRefetch) {
      return;
    }

    // Check if noteId changed - if same ID and not forced, skip
    const currentNoteId = noteId;
    if (!forceRefetch && lastNoteIdRef.current === currentNoteId && lastNoteIdRef.current !== null) {
      return;
    }

    try {
      isFetchingRef.current = true;
      lastNoteIdRef.current = currentNoteId;
      setIsLoading(true);
      setError(null);
      const response = await getNoteDetails(currentNoteId);

      // Handle response structure
      const noteData = response?.data || response?.note || response || {};

      // Transform API response to match component structure
      const transformedNote = {
        id: noteData.id,
        title: noteData.title || 'Untitled Note',
        reminderDate: noteData.reminderDate,
        reminderEnabled: noteData.reminderEnabled !== undefined ? noteData.reminderEnabled : true,
        // Format reminder date and time
        reminder: noteData.reminderDate
          ? (() => {
              const reminderDate = new Date(noteData.reminderDate);
              return {
                date: reminderDate.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }),
                time: reminderDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                }),
                isActive: noteData.reminderEnabled,
              };
            })()
          : null,
        // Text notes
        notes: noteData.notes?.textNotes?.map((textNote) => textNote.text) || [],
        // Attachments/Documents
        attachments: noteData.notes?.documents?.map((doc) => ({
          id: doc.id,
          name: doc.name || doc.fileName || 'Document',
          size: doc.size || 'Unknown size',
          date: doc.createdAt
            ? new Date(doc.createdAt).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
            : '',
          type: doc.type || doc.fileType || 'file',
          url: doc.url || doc.fileUrl,
        })) || [],
        // Voice memos
        voiceMemos: noteData.notes?.voiceMemos?.map((memo) => ({
          id: memo.id,
          duration: memo.duration || '00:00',
          url: memo.url || memo.fileUrl,
        })) || [],
        // Project info
        project: noteData.projects?.[0]?.projectName || 'Unknown Project',
        projectId: noteData.projects?.[0]?.projectId,
        // Keep original data for reference
        originalData: noteData,
      };

      setNote(transformedNote);
    } catch (err) {
      console.error('Error fetching note details:', err);
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        'Failed to load note details';
      setError(errorMessage);
      showError(errorMessage);
      setNote(null);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [noteId]);

  useEffect(() => {
    // Reset refs when noteId changes
    if (lastNoteIdRef.current !== noteId) {
      isFetchingRef.current = false;
    }
    fetchNoteDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]); // Only depend on noteId to avoid unnecessary re-fetches

  const refetch = useCallback(() => {
    return fetchNoteDetails(true); // Force refetch
  }, [fetchNoteDetails]);

  return {
    note,
    isLoading,
    error,
    refetch,
  };
};

export default useNoteDetails;

