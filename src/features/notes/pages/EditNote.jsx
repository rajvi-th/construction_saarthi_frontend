/**
 * Edit Note Page
 * Form to edit an existing note
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mic, Plus } from "lucide-react";
import { ROUTES_FLAT, getRoute } from "../../../constants/routes";
import PageHeader from "../../../components/layout/PageHeader";
import Input from "../../../components/ui/Input";
import Radio from "../../../components/ui/Radio";
import DateTimePicker from "../../../components/ui/DateTimePicker";
import RichTextEditor from "../../../components/ui/RichTextEditor";
import Button from "../../../components/ui/Button";
import Dropdown from "../../../components/ui/Dropdown";
import { useNoteDetails } from "../hooks/useNoteDetails";
import { useNotesProjects } from "../hooks/useNotesProjects";
import { useAuth } from "../../../features/auth/store/authStore";
import { updateNote } from "../api/notesApi";
import { showError, showSuccess } from "../../../utils/toast";

export default function EditNote() {
  const { t } = useTranslation("notes");
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch note details
  const { note, isLoading } = useNoteDetails(id);

  // Fetch projects
  const { projects } = useNotesProjects(selectedWorkspace);
  const projectOptions = projects.map((p) => ({
    value: p.id?.toString(),
    label: p.name,
  }));

  // Form state
  const [title, setTitle] = useState("");
  const [assignTo, setAssignTo] = useState([]); // Array for multiple projects
  const [noteType, setNoteType] = useState("Text");
  const [textNote, setTextNote] = useState("");
  const [reminderDateTime, setReminderDateTime] = useState(null);
  
  // Voice memos state
  const [voiceMemos, setVoiceMemos] = useState([]); // Existing from backend
  const [newVoiceMemos, setNewVoiceMemos] = useState([]); // Newly recorded files
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Load note data when fetched
  useEffect(() => {
    if (!note) return;

    setTitle(note.title || "");

    // Set project IDs from note
    if (note.originalData?.projects && note.originalData.projects.length > 0) {
      const projectIds = note.originalData.projects.map((p) =>
        p.projectId?.toString(),
      );
      setAssignTo(projectIds);
    }

    // Backend structure: note.originalData.notes can contain textNotes[] and voiceMemos[]
    const textNotes = note.originalData?.notes?.textNotes || [];
    const voiceMemos = note.originalData?.notes?.voiceMemos || [];

    // Determine note type based on presence of text and voice data
    if (textNotes.length > 0 && voiceMemos.length > 0) {
      setNoteType("Both");
    } else if (voiceMemos.length > 0) {
      setNoteType("Voice");
    } else {
      setNoteType("Text");
    }

    // Set text content (use first text note if available)
    if (textNotes.length > 0) {
      setTextNote(textNotes[0].text || "");
    }

    // Set all voice memos
    setVoiceMemos(voiceMemos);

    // Set reminder date
    if (note.reminderDate) {
      setReminderDateTime(new Date(note.reminderDate));
    }
  }, [note]);
  
  // Sync project/note names to location state for breadcrumbs
  useEffect(() => {
    if (note) {
      const noteTitle = note.title || "";
      let projectName = location.state?.projectName;
      let projectId = location.state?.projectId;

      // If no project name in state, try to get it from note details
      if (!projectName && note.originalData?.projects?.length > 0) {
        const firstProject = note.originalData.projects[0];
        projectName = firstProject.project_name || firstProject.site_name || firstProject.name;
        projectId = firstProject.projectId?.toString();
      }

      if ((noteTitle && location.state?.noteTitle !== noteTitle) || (projectName && location.state?.projectName !== projectName)) {
        navigate(location.pathname, {
          replace: true,
          state: {
            ...location.state,
            noteTitle,
            projectName,
            projectId
          },
        });
      }
    }
  }, [note, location.state, location.pathname, navigate]);

  // Cleanup recording on unmount
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

  const noteTypeOptions = [
    { value: "Text", label: t("form.text") },
    { value: "Voice", label: t("form.voice") },
    { value: "Both", label: t("form.both") },
  ];

  const formatTimeDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Add to new voice memos list
        setNewVoiceMemos(prev => [...prev, {
          url: audioUrl,
          blob: audioBlob,
          name: `recording-${Date.now()}.webm`
        }]);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

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
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const VoiceMemoPlayer = ({ memo }) => {
    const playerAudioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [currTime, setCurrTime] = useState(0);
    const [dur, setDur] = useState(0);

    return (
      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 mb-2">
        <button
          type="button"
          onClick={() => {
            if (playing) playerAudioRef.current.pause();
            else playerAudioRef.current.play();
          }}
          className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 cursor-pointer"
        >
          {playing ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="4" width="4" height="16" fill="white" />
              <rect x="14" y="4" width="4" height="16" fill="white" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7L8 5z" fill="white" />
            </svg>
          )}
        </button>
        
        <div className="flex-1 flex flex-col gap-1">
          <div 
            className="h-1.5 bg-gray-200 rounded-full cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              playerAudioRef.current.currentTime = pct * (dur || 0);
            }}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-accent rounded-full" 
              style={{ width: `${(currTime / (dur || 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-secondary">{formatTimeDisplay(currTime)}</span>
            <span className="text-[10px] text-secondary">{formatTimeDisplay(dur)}</span>
          </div>
        </div>

        <audio
          ref={playerAudioRef}
          src={memo.url}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setCurrTime(e.target.currentTime)}
          onLoadedMetadata={(e) => setDur(e.target.duration)}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
      </div>
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError(t("form.titleRequired", { defaultValue: "Title is required" }));
      return;
    }

    if (assignTo.length === 0) {
      showError(
        t("form.projectRequired", {
          defaultValue: "Please select at least one project",
        }),
      );
      return;
    }

    if ((noteType === "Text" || noteType === "Both") && !textNote.trim()) {
      showError(
        t("form.textRequired", { defaultValue: "Text note is required" }),
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData as seen in the request
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('text', textNote.trim());
      formData.append('workspaceId', selectedWorkspace);
      
      // Append project ids
      assignTo.forEach(id => {
        formData.append('projectIds', id);
      });
      
      // Append reminder date if exists
      if (reminderDateTime) {
        formData.append('reminderDate', reminderDateTime.toISOString().split('T')[0]);
      }

      // Append new voice memos
      newVoiceMemos.forEach(memo => {
        if (memo.blob) {
          const file = new File([memo.blob], memo.name || `recording-${Date.now()}.webm`, { type: memo.blob.type });
          formData.append('noteFiles', file);
        }
      });

      await updateNote(id, formData);

      showSuccess(
        t("noteUpdated", { defaultValue: "Note updated successfully" }),
      );
      
      const pId = location.state?.projectId || (note?.originalData?.projects?.[0]?.projectId?.toString());
      
      navigate(getRoute(ROUTES_FLAT.NOTES_DETAILS, { id }), {
        state: {
          projectName: location.state?.projectName || note?.project,
          projectId: pId,
          noteTitle: title.trim(),
          fromProjects: location.state?.fromProjects,
          fromDashboard: location.state?.fromDashboard
        }
      });
    } catch (err) {
      console.error("Error updating note:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t("updateError", { defaultValue: "Failed to update note" });
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={
          isLoading
            ? t("loading", { defaultValue: "Loading..." })
            : title || t("editNote", { defaultValue: "Edit Note" })
        }
        onBack={() => {
          if (id) {
            navigate(getRoute(ROUTES_FLAT.NOTES_DETAILS, { id }), {
              state: { 
                projectName: location.state?.projectName,
                projectId: location.state?.projectId,
                noteTitle: title,
                fromProjects: location.state?.fromProjects,
                fromDashboard: location.state?.fromDashboard
              }
            });
          } else {
            navigate(-1);
          }
        }}
      />

      {/* Form */}
      <div>
        <div className="space-y-6">
          {/* Title */}
          <Input
            label={t("form.title")}
            placeholder={t("form.titlePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Assign To - Multiple Projects */}
          {/* <div>
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
          </div> */}

          {/* Notes Type */}
          <div>
            <label className="block text-sm font-normal text-black mb-3">
              {t("form.notesType")}
            </label>
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

          {/* Voice Note Section */}
          {(noteType === "Voice" || noteType === "Both") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-normal text-black font-semibold">
                  {t("form.voiceNote")}
                </label>
                {!isRecording && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isRecording) handleStartRecording();
                    }}
                    className="flex items-center gap-1 text-accent text-sm font-medium hover:underline cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    {t("form.addVoice", { defaultValue: "Add Voice" })}
                  </button>
                )}
              </div>

              {/* Existing and New Voice Memos List */}
              <div className="space-y-2 mb-4">
                {/* Existing memos */}
                {voiceMemos.map((memo, idx) => (
                  <VoiceMemoPlayer key={`existing-${idx}`} memo={memo} />
                ))}
                
                {/* New memos */}
                {newVoiceMemos.map((memo, idx) => (
                  <VoiceMemoPlayer key={`new-${idx}`} memo={memo} />
                ))}
                
                {voiceMemos.length === 0 && newVoiceMemos.length === 0 && !isRecording && (
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-secondary">
                      {t("noVoiceNote", { defaultValue: "No voice notes attached" })}
                    </p>
                  </div>
                )}
              </div>

              {/* Recording Interface */}
              {isRecording && (
                <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3 mb-4">
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 hover:bg-[#9F290A] transition-colors cursor-pointer"
                  >
                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                  </button>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex gap-1 items-center">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-accent rounded animate-pulse"
                          style={{
                            animationDelay: `${i * 0.1}s`,
                            height: `${Math.random() * 10 + 10}px`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-secondary">{t('form.recording', { defaultValue: 'Recording' })}</span>
                    <span className="text-sm font-medium text-accent">{formatTimeDisplay(recordingTime)}</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-secondary mt-2">
                {t("voiceNoteInfo", {
                  defaultValue: "You can add multiple voice notes. Existing voice notes cannot be removed.",
                })}
              </p>
            </div>
          )}

          {/* Text Note */}
          {(noteType === "Text" || noteType === "Both") && (
            <div>
              <label className="block text-sm font-normal text-black mb-2">
                {t("form.note")}
                <span>*</span>
              </label>
              <RichTextEditor
                value={textNote}
                onChange={setTextNote}
                placeholder={t("form.enterTextHere")}
              />
            </div>
          )}

          {/* Add Reminder */}
          {/* <DateTimePicker
            label={t('form.addReminder')}
            value={reminderDateTime}
            onChange={setReminderDateTime}
            placeholder="DD/MM/YYYY HH:MM"
            required
          /> */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end pt-4">
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              {t("form.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSubmitting || isLoading}
              className="w-full sm:w-auto"
            >
              {isSubmitting
                ? t("saving", { defaultValue: "Saving..." })
                : t("form.saveChanges")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
