/**
 * Edit Note Page
 * Form to edit an existing note
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT } from '../../../constants/routes';
import PageHeader from '../../../components/layout/PageHeader';
import Input from '../../../components/ui/Input';
import Radio from '../../../components/ui/Radio';
import DateTimePicker from '../../../components/ui/DateTimePicker';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import { useNoteDetails } from '../hooks/useNoteDetails';
import { useNotesProjects } from '../hooks/useNotesProjects';
import { useAuth } from '../../../features/auth/store/authStore';
import { updateNote } from '../api/notesApi';
import { showError, showSuccess } from '../../../utils/toast';

export default function EditNote() {
  const { t } = useTranslation('notes');
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedWorkspace } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch note details
  const { note, isLoading } = useNoteDetails(id);
  
  // Fetch projects
  const { projects } = useNotesProjects(selectedWorkspace);
  const projectOptions = projects.map(p => ({
    value: p.id?.toString(),
    label: p.name,
  }));
  
  // Form state
  const [title, setTitle] = useState('');
  const [assignTo, setAssignTo] = useState([]); // Array for multiple projects
  const [noteType, setNoteType] = useState('Text');
  const [textNote, setTextNote] = useState('');
  const [reminderDateTime, setReminderDateTime] = useState(null);
  
  // Load note data when fetched
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      
      // Set project IDs from note
      if (note.originalData?.projects && note.originalData.projects.length > 0) {
        const projectIds = note.originalData.projects.map(p => p.projectId?.toString());
        setAssignTo(projectIds);
      }
      
      // Determine note type from noteDocs
      const noteDocs = note.originalData?.notes?.noteDocs || [];
      if (noteDocs.length > 0) {
        const fileType = noteDocs[0].file_type;
        setNoteType(fileType || 'Text');
        
        // Set text content
        if (fileType === 'Text' || fileType === 'Both') {
          const textDoc = noteDocs.find(doc => doc.file_type === 'Text' || doc.file_type === 'Both');
          if (textDoc) {
            setTextNote(textDoc.text || '');
          }
        }
      }
      
      // Set reminder date
      if (note.reminderDate) {
        setReminderDateTime(new Date(note.reminderDate));
      }
    }
  }, [note]);

  const noteTypeOptions = [
    { value: 'Text', label: t('form.text') },
    { value: 'Voice', label: t('form.voice') },
    { value: 'Both', label: t('form.both') },
  ];

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError(t('form.titleRequired', { defaultValue: 'Title is required' }));
      return;
    }

    if (assignTo.length === 0) {
      showError(t('form.projectRequired', { defaultValue: 'Please select at least one project' }));
      return;
    }

    if (!reminderDateTime) {
      showError(t('form.reminderRequired', { defaultValue: 'Reminder date is required' }));
      return;
    }

    if ((noteType === 'Text' || noteType === 'Both') && !textNote.trim()) {
      showError(t('form.textRequired', { defaultValue: 'Text note is required' }));
      return;
    }

    try {
      setIsSubmitting(true);

      // Format reminder date (YYYY-MM-DD)
      const reminderDate = reminderDateTime.toISOString().split('T')[0];

      // Prepare update data
      const updateData = {
        title: title.trim(),
        workspaceId: parseInt(selectedWorkspace) || 0,
        reminderDate: reminderDate,
        projectIds: assignTo.map(id => parseInt(id)),
        file_type: noteType,
        text: textNote.trim(),
        url: null, // Will be set if there's a voice memo or attachment
      };

      // If note type is Voice or Both, we might need to handle voice URL
      // For now, we'll keep it null if no voice memo exists
      if (noteType === 'Voice' || noteType === 'Both') {
        const voiceDoc = note?.originalData?.notes?.noteDocs?.find(
          doc => doc.file_type === 'Voice' || doc.file_type === 'Both'
        );
        if (voiceDoc?.url) {
          updateData.url = voiceDoc.url;
        }
      }

      await updateNote(id, updateData);
      
      showSuccess(t('noteUpdated', { defaultValue: 'Note updated successfully' }));
      navigate(-1);
    } catch (err) {
      console.error('Error updating note:', err);
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        t('updateError', { defaultValue: 'Failed to update note' });
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={isLoading ? t('loading', { defaultValue: 'Loading...' }) : (title || t('editNote', { defaultValue: 'Edit Note' }))}
        onBack={() => navigate(-1)}
      />

      {/* Form */}
      <div>
        <div className="space-y-6">
          {/* Title */}
          <Input
            label={t('form.title')}
            placeholder={t('form.titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Assign To - Multiple Projects */}
          <div>
            <label className="block text-sm font-normal text-black mb-2">
              {t('form.assignTo')}<span>*</span>
            </label>
            <Dropdown
              options={projectOptions}
              value={assignTo.length > 0 ? assignTo[0] : ''}
              onChange={(value) => {
                if (value && !assignTo.includes(value)) {
                  setAssignTo([...assignTo, value]);
                }
              }}
              placeholder={t('form.selectProject')}
            />
            {assignTo.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {assignTo.map((projectId) => {
                  const project = projectOptions.find((p) => p.value === projectId);
                  return project ? (
                    <span
                      key={projectId}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-primary flex items-center gap-2"
                    >
                      {project.label}
                      <button
                        onClick={() => setAssignTo(assignTo.filter(id => id !== projectId))}
                        className="text-secondary hover:text-primary cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Notes Type */}
          <div>
            <label className="block text-sm font-normal text-black mb-3">{t('form.notesType')}</label>
            <div className="flex items-center gap-6">
              {noteTypeOptions.map((option) => (
                <Radio
                  key={option.value}
                  name="noteType"
                  value={option.value}
                  label={option.label}
                  checked={noteType === option.value}
                  onChange={() => setNoteType(option.value)}
                />
              ))}
            </div>
          </div>

          {/* Voice Note Player (if voice or both) */}
          {(noteType === 'Voice' || noteType === 'Both') && (
            <div>
              <label className="block text-sm font-normal text-black mb-2">
                {t('form.voiceNote')}
              </label>
              <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 cursor-pointer">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-0.5 "></div>
                </button>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden cursor-pointer">
                    <div className="h-full bg-accent w-1/3"></div>
                  </div>
                  <span className="text-sm text-secondary">
                    {note?.originalData?.notes?.voiceMemos?.[0]?.duration || '00:00'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-secondary mt-2">
                {t('voiceNoteInfo', { defaultValue: 'Voice note cannot be edited. Upload a new one if needed.' })}
              </p>
            </div>
          )}

          {/* Text Note */}
          {(noteType === 'Text' || noteType === 'Both') && (
            <div>
              <label className="block text-sm font-normal text-black mb-2">
                {t('form.note')}<span>*</span>
              </label>
              <RichTextEditor
                value={textNote}
                onChange={setTextNote}
                placeholder={t('form.enterTextHere')}
              />
            </div>
          )}

          {/* Add Reminder */}
          <DateTimePicker
            label={t('form.addReminder')}
            value={reminderDateTime}
            onChange={setReminderDateTime}
            placeholder="DD/MM/YYYY HH:MM"
            required
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end pt-4">
            <Button 
              variant="secondary" 
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              {t('form.cancel')}
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave} 
              disabled={isSubmitting || isLoading}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? t('saving', { defaultValue: 'Saving...' }) : t('form.saveChanges')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

