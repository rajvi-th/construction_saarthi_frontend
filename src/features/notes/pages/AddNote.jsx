/**
 * Add Note Page
 * Form to add a new note with voice/text/both options
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT } from '../../../constants/routes';
import PageHeader from '../../../components/layout/PageHeader';
import Input from '../../../components/ui/Input';
import Radio from '../../../components/ui/Radio';
import DateTimePicker from '../../../components/ui/DateTimePicker';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import { useAuth } from '../../../features/auth/store/authStore';
import { useNotesProjects } from '../hooks/useNotesProjects';
import { startNote, createNote, uploadNoteFiles } from '../api/notesApi';
import { showSuccess, showError } from '../../../utils/toast';

export default function AddNote() {
  const { t } = useTranslation('notes');
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();
  const [title, setTitle] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [noteType, setNoteType] = useState('voice');
  const [voiceNote, setVoiceNote] = useState(null); // Will store audio blob/URL
  const [voiceNoteBlob, setVoiceNoteBlob] = useState(null); // Will store audio Blob for upload
  const [textNote, setTextNote] = useState('');
  const [reminderDateTime, setReminderDateTime] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState([]);
  const [noteKey, setNoteKey] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Fetch projects from API
  const { projects, isLoading: isLoadingProjects } = useNotesProjects(selectedWorkspace);
  
  // Transform projects for dropdown
  const projectOptions = projects.map(project => ({
    value: String(project.id),
    label: project.name
  }));

  const noteTypeOptions = [
    { value: 'voice', label: t('form.voice') },
    { value: 'text', label: t('form.text') },
    { value: 'both', label: t('form.both') },
  ];

  const handleCancel = () => {
    navigate(-1);
  };

  // Get noteKey from navigation state or initialize if not provided
  useEffect(() => {
    const noteKeyFromState = location.state?.noteKey;
    
    if (noteKeyFromState) {
      // Use noteKey from navigation state (passed from ProjectNotes)
      setNoteKey(noteKeyFromState);
    } else {
      // If noteKey not provided, initialize note (fallback for direct navigation)
      const initializeNote = async () => {
        if (!selectedWorkspace) {
          showError('Workspace not selected');
          return;
        }

        try {
          setIsInitializing(true);
          const response = await startNote(selectedWorkspace);
          const key = response?.noteKey || response?.note_key || response?.key || response?.data?.noteKey || response?.data?.note_key || response?.data?.key;
          if (key) {
            setNoteKey(key);
          } else {
            throw new Error('Failed to get note key from server');
          }
        } catch (error) {
          console.error('Error initializing note:', error);
          const errorMessage = error?.response?.data?.message || 
            error?.message || 
            'Failed to initialize note. Please try again.';
          showError(errorMessage);
          // Navigate back on initialization error
          setTimeout(() => navigate(-1), 2000);
        } finally {
          setIsInitializing(false);
        }
      };

      initializeNote();
    }
  }, [location.state, selectedWorkspace, navigate]);

  const handleAddNote = async () => {
    // Validation
    if (!title.trim()) {
      showError(t('form.required', { defaultValue: 'Title is required' }));
      return;
    }

    if (!assignTo) {
      showError(t('form.required', { defaultValue: 'Please select a project' }));
      return;
    }

    if ((noteType === 'voice' || noteType === 'both') && !voiceNote) {
      showError(t('form.required', { defaultValue: 'Voice note is required' }));
      return;
    }

    if ((noteType === 'text' || noteType === 'both') && !textNote.trim()) {
      showError(t('form.required', { defaultValue: 'Text note is required' }));
      return;
    }

    if (!reminderDateTime) {
      showError(t('form.required', { defaultValue: 'Reminder date is required' }));
      return;
    }

    if (!noteKey) {
      showError('Note not initialized. Please refresh and try again.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Map noteType to file_type
      const fileTypeMap = {
        'voice': 'Voice',
        'text': 'Text',
        'both': 'Both'
      };
      const file_type = fileTypeMap[noteType] || 'Text';

      // Prepare note data
      const noteData = {
        noteKey: noteKey,
        title: title.trim(),
        projectIds: [Number(assignTo)],
        file_type: file_type,
        text: textNote.trim() || '',
        reminderDate: reminderDateTime,
      };

      await createNote(noteData);
      
      showSuccess(t('noteCreated', { defaultValue: 'Note created successfully' }));
      navigate(-1);
    } catch (error) {
      console.error('Error creating note:', error);
      const errorMessage = error?.response?.data?.message || 
        error?.message || 
        t('createError', { defaultValue: 'Failed to create note. Please try again.' });
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      setAudioChunks(chunks);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setVoiceNote(audioUrl);
        setVoiceNoteBlob(audioBlob); // Store blob for upload
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Upload voice note immediately after recording stops
        if (noteKey && audioBlob) {
          try {
            setIsUploadingVoice(true);
            const uploadResponse = await uploadNoteFiles(noteKey, audioBlob);
            
            // If API returns uploaded file URL, use it instead of blob URL
            const uploadedUrl = uploadResponse?.data?.url || 
                               uploadResponse?.url || 
                               uploadResponse?.data?.fileUrl ||
                               uploadResponse?.fileUrl;
            
            if (uploadedUrl) {
              // Revoke old blob URL and use uploaded URL
              URL.revokeObjectURL(audioUrl);
              setVoiceNote(uploadedUrl);
            }
            
            showSuccess(t('voiceNoteUploaded', { defaultValue: 'Voice note uploaded successfully' }));
          } catch (error) {
            console.error('Error uploading voice note:', error);
            const errorMessage = error?.response?.data?.message || 
              error?.message || 
              t('voiceNoteUploadError', { defaultValue: 'Failed to upload voice note. Please try again.' });
            showError(errorMessage);
          } finally {
            setIsUploadingVoice(false);
          }
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied. Please allow microphone access to record voice notes.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t('addNewNote')}
        onBack={() => navigate(-1)}
      />

      {/* Form */}
      <div>
        <div className="p- space-y-6">
          {/* Title */}
          <Input
            label={t('form.title')}
            placeholder={t('form.titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Assign To */}
          <div>
            <label className="block text-sm font-normal text-black mb-2">
              {t('form.assignTo')}<span>*</span>
            </label>
            <Dropdown
              options={projectOptions}
              value={assignTo}
              onChange={setAssignTo}
              placeholder={isLoadingProjects ? t('loading', { defaultValue: 'Loading...' }) : t('form.selectProject')}
              disabled={isLoadingProjects || projectOptions.length === 0}
            />
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

          {/* Voice Note */}
          {(noteType === 'voice' || noteType === 'both') && (
            <div>
              <label className="block text-sm font-normal text-black mb-2">
                {t('form.voiceNote')}<span>*</span>
              </label>
              <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3 cursor-pointer">
                {isRecording ? (
                  <>
                    <button
                      onClick={handleStopRecording}
                      className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 hover:bg-[#9F290A] transition-colors cursor-pointer"
                    >
                      <div className="w-4 h-4 bg-white rounded"></div>
                    </button>
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <div className="flex gap-1 items-center">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-accent rounded animate-pulse"
                            style={{
                              animationDelay: `${i * 0.1}s`,
                              height: `${Math.random() * 20 + 20}px`,
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm text-secondary whitespace-nowrap">{t('form.recording', { defaultValue: 'Recording' })}</span>
                        <span className="text-sm font-medium text-accent">{formatTime(recordingTime)}</span>
                      </div>
                    </div>
                  </>
                ) : voiceNote ? (
                  <>
                    <button
                      onClick={handleStartRecording}
                      className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 hover:bg-[#9F290A] transition-colors"
                      disabled={isUploadingVoice}
                    >
                      <Mic className="w-6 h-6 text-white" />
                    </button>
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      {isUploadingVoice ? (
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex gap-1 items-center">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 bg-accent rounded animate-pulse"
                                style={{
                                  animationDelay: `${i * 0.2}s`,
                                  height: '16px',
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-secondary">{t('uploading', { defaultValue: 'Uploading voice note...' })}</span>
                        </div>
                      ) : (
                        <>
                          <audio 
                            src={voiceNote} 
                            controls 
                            className="flex-1 h-8 min-w-0"
                          />
                          <button
                            onClick={() => {
                              if (voiceNote && voiceNote.startsWith('blob:')) {
                                URL.revokeObjectURL(voiceNote);
                              }
                              setVoiceNote(null);
                              setVoiceNoteBlob(null);
                              setRecordingTime(0);
                            }}
                            className="text-sm text-accent hover:underline whitespace-nowrap"
                          >
                            {t('rerecord', { defaultValue: 'Re-record' })}
                          </button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleStartRecording}
                      className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 hover:bg-[#9F290A] transition-colors cursor-pointer"
                    >
                      <Mic className="w-6 h-6 text-white" />
                    </button>
                    <span className="text-sm text-secondary">{t('form.holdMicToRecord', { defaultValue: 'Hold mic to record your voice' })}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Text Note */}
          {(noteType === 'text' || noteType === 'both') && (
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
              onClick={handleAddNote}
              className="w-full sm:w-auto"
              disabled={isSubmitting || isInitializing || !noteKey}
            >
              {isSubmitting ? t('loading', { defaultValue: 'Loading...' }) : t('addNote')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

