/**
 * Note Details Page
 * Shows full details of a note with notes, voice memos, and reminder
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MoreVertical, X, Play, FileText, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import PageHeader from '../../../components/layout/PageHeader';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import Toggle from '../../../components/ui/Toggle';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import downloadIcon from '../../../assets/icons/DownloadMinimalistic.svg';
import trashIcon from '../../../assets/icons/Trash.svg';
import pencilIcon from '../../../assets/icons/pencil.svg';
import { useNoteDetails } from '../hooks/useNoteDetails';
import { deleteNote } from '../api/notesApi';
import { showError, showSuccess } from '../../../utils/toast';
import jsPDF from 'jspdf';

export default function NoteDetails() {
  const { t } = useTranslation('notes');
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Fetch note details from API
  const { note, isLoading } = useNoteDetails(id);
  
  const [isReminderActive, setIsReminderActive] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [playingMemoId, setPlayingMemoId] = useState(null);
  const [memoDurations, setMemoDurations] = useState({});
  const audioRefs = useRef({});
  
  // Update reminder active state when note loads
  useEffect(() => {
    if (note?.reminder) {
      setIsReminderActive(note.reminder.isActive);
    }
  }, [note]);

  const handleEdit = () => {
    navigate(getRoute(ROUTES_FLAT.NOTES_EDIT, { id }), {
      state: {
        projectName: note?.project,
        projectId: note?.originalData?.projects?.[0]?.projectId, // Assuming first project
        noteTitle: note?.title
      }
    });
  };

  const handleToggleReminder = () => {
    setIsReminderActive(!isReminderActive);
  };

  const handleDeleteVoiceMemo = (memoId) => {
    console.log('Delete voice memo:', memoId);
  };

  // Handle play/pause for voice memos
  const handlePlayPauseVoiceMemo = (memoId, memoUrl) => {
    const audioElement = audioRefs.current[memoId];
    
    if (!audioElement) {
      // Create audio element if it doesn't exist
      const audio = new Audio(memoUrl);
      audioRefs.current[memoId] = audio;
      
      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setMemoDurations(prev => ({ ...prev, [memoId]: formattedDuration }));
      });
      
      audio.addEventListener('ended', () => {
        setPlayingMemoId(null);
      });
      
      audio.addEventListener('timeupdate', () => {
        // Update duration display if needed
      });
      
      audio.play();
      setPlayingMemoId(memoId);
    } else {
      if (playingMemoId === memoId) {
        // Pause if currently playing
        audioElement.pause();
        setPlayingMemoId(null);
      } else {
        // Stop other audio and play this one
        Object.values(audioRefs.current).forEach(audio => {
          if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
        });
        audioElement.play();
        setPlayingMemoId(memoId);
      }
    }
  };

  // Cleanup audio elements on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const handleDownload = () => {
    if (!note) {
      showError(t('noteNotFound', { defaultValue: 'Note not found' }));
      return;
    }

    try {
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper function to add text with word wrap
      const addText = (text, fontSize = 12, isBold = false, color = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        if (isBold) {
          doc.setFont(undefined, 'bold');
        } else {
          doc.setFont(undefined, 'normal');
        }
        
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 5;
      };

      // Extract text content from HTML notes
      const notesText = note.notes?.map((noteText) => {
        const div = document.createElement('div');
        div.innerHTML = noteText;
        return div.textContent || div.innerText || '';
      }).join('\n\n') || '';

      // Add Title
      addText(note.title || 'Untitled Note', 20, true, [0, 0, 0]);
      yPosition += 5;

      // Add Project
      if (note.project) {
        addText(`Project: ${note.project}`, 12, false, [100, 100, 100]);
        yPosition += 10;
      }

      // Add separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Add Notes & Voice Memos section
      if (notesText) {
        addText(t('notesAndVoiceMemos', { defaultValue: 'Notes & Voice Memos' }), 16, true);
        addText(notesText, 11, false);
        yPosition += 5;
      }

      // Add Attachments section
      if (note.attachments && note.attachments.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = margin;
        }
        addText('Attachments', 16, true);
        note.attachments.forEach((att) => {
          const attachmentText = `${att.name || 'Attachment'}${att.date ? ` - ${att.size || ''} • ${att.date}` : ''}`;
          addText(attachmentText, 11, false);
        });
        yPosition += 5;
      }

      // Add Reminder section
      if (note.reminder) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
        addText(t('reminder', { defaultValue: 'Reminder' }), 16, true);
        const reminderText = `${note.reminder.date || ''} - ${note.reminder.time || ''}`;
        addText(reminderText, 11, false);
      }

      // Generate filename
      const fileName = `${note.title || 'Note'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save PDF
      doc.save(fileName);
      
      showSuccess(t('downloadNote', { defaultValue: 'Download Note' }) + ' ' + t('success', { defaultValue: 'downloaded successfully' }));
    } catch (error) {
      console.error('Error downloading note:', error);
      showError(t('deleteError', { defaultValue: 'Failed to download note' }));
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNote(id);
      
      showSuccess(t('noteDeleted', { defaultValue: 'Note deleted successfully' }));
      
      // Navigate back after successful delete
      navigate(ROUTES_FLAT.NOTES);
    } catch (error) {
      console.error('Error deleting note:', error);
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        t('deleteError', { defaultValue: 'Failed to delete note' });
      showError(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  };

  const menuItems = [
    {
      label: t('downloadNote', { defaultValue: 'Download Note' }),
      icon: <img src={downloadIcon} alt="Download" className="w-4 h-4" />,
      onClick: handleDownload,
    },
    {
      label: t('delete', { defaultValue: 'Delete' }),
      icon: <img src={trashIcon} alt="Delete" className="w-4 h-4" />,
      onClick: handleDelete,
      textColor: 'text-accent',
      iconClassName: 'opacity-100',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={note?.title || t('loading', { defaultValue: 'Loading...' })}
        onBack={() => navigate(-1)}
        titleActions={
          /* Mobile: Show 3 dots menu in title line */
          <DropdownMenu
            items={menuItems}
            position="right"
          />
        }
      >
        {/* Tablet & Desktop: Show Edit button and menu in header (1 line) */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-3xl bg-[#B02E0C0F] text-[#B02E0C] hover:bg-[#B02E0C1A] transition-colors cursor-pointer"
          >
            <img src={pencilIcon} alt="Edit" className="w-4 h-4" />
            <span className="font-medium text-sm sm:text-base">{t('editProposal')}</span>
          </button>
          <DropdownMenu
            items={menuItems}
            position="right"
          />
        </div>
      </PageHeader>

      {/* Mobile: Edit Proposal Button Below Header */}
      <div className="md:hidden mb-4">
        <button
          onClick={handleEdit}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-3xl bg-[#B02E0C0F] text-[#B02E0C] hover:bg-[#B02E0C1A] transition-colors"
        >
          <img src={pencilIcon} alt="Edit" className="w-4 h-4" />
          <span className="font-medium">{t('editProposal')}</span>
        </button>
      </div>

      {/* Content */}
      <div className="sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-secondary">{t('loading', { defaultValue: 'Loading...' })}</div>
          </div>
        ) : !note ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-secondary">{t('noteNotFound', { defaultValue: 'Note not found' })}</div>
          </div>
        ) : (
          <div className="space-y-6 ">
            {/* Title and Project */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-medium text-primary mb-2">{note.title}</h2>
              <p className="text-sm text-secondary">{note.project}</p>
            </div>

          {/* Notes & Voice Memos */}
          <div>
            <h3 className="text-lg font-medium text-primary mb-4">{t('notesAndVoiceMemos')}</h3>
              
              {/* Text Notes */}
              {note.notes && note.notes.length > 0 && (
                <div className="space-y-2 mb-6">
                  {note.notes.map((noteText, index) => (
                    <div
                      key={index}
                      className="text-sm text-secondary"
                      dangerouslySetInnerHTML={{ __html: noteText }}
                    />
                  ))}
                </div>
              )}

              {/* Attachments */}
              {note.attachments && note.attachments.length > 0 && (
                <div className="mb-6">
                  {note.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                      <FileText className="w-8 h-8 text-accent" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary">{attachment.name}</p>
                        {attachment.date && (
                          <p className="text-xs text-secondary">
                            {attachment.size} • {attachment.date}
                          </p>
                        )}
                      </div>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-secondary" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Voice Memos */}
              {note.voiceMemos && note.voiceMemos.length > 0 && (
                <div className="space-y-3">
                  {note.voiceMemos.map((memo) => {
                    const isPlaying = playingMemoId === memo.id;
                    const displayDuration = memoDurations[memo.id] || memo.duration || '00:00';
                    
                    return (
                      <div key={memo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <button 
                          onClick={() => handlePlayPauseVoiceMemo(memo.id, memo.url)}
                          className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 hover:bg-[#9F290A] transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white" />
                          ) : (
                            <Play className="w-5 h-5 text-white ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                          {/* Waveform visualization */}
                          <div className="flex gap-1 items-center flex-1">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 bg-accent rounded transition-all"
                                style={{
                                  height: isPlaying 
                                    ? `${Math.random() * 30 + 10}px`
                                    : `${Math.random() * 20 + 5}px`,
                                  animation: isPlaying ? 'pulse 0.5s ease-in-out infinite' : 'none',
                                  animationDelay: `${i * 0.05}s`,
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-secondary whitespace-nowrap ml-2">{displayDuration}</span>
                        </div>
                        {/* <button
                          onClick={() => handleDeleteVoiceMemo(memo.id)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-secondary" />
                        </button> */}
                        {/* Hidden audio element */}
                        <audio
                          ref={(el) => {
                            if (el && memo.url) {
                              audioRefs.current[memo.id] = el;
                              // Load duration when audio is ready
                              el.addEventListener('loadedmetadata', () => {
                                const duration = el.duration;
                                if (duration && !isNaN(duration)) {
                                  const minutes = Math.floor(duration / 60);
                                  const seconds = Math.floor(duration % 60);
                                  const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                                  setMemoDurations(prev => ({ ...prev, [memo.id]: formattedDuration }));
                                }
                              });
                            }
                          }}
                          src={memo.url}
                          preload="metadata"
                          style={{ display: 'none' }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Show message if no content */}
              {(!note.notes || note.notes.length === 0) &&
                (!note.attachments || note.attachments.length === 0) &&
                (!note.voiceMemos || note.voiceMemos.length === 0) && (
                  <div className="text-sm text-secondary text-center py-4">
                    {t('noContent', { defaultValue: 'No content available' })}
                  </div>
                )}
            </div>

            {/* Reminder */}
            {/* {note.reminder && (
              <div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <div>
                    <h3 className="text-lg font-medium text-primary mb-2">{t('reminder')}</h3>
                    <p className="text-sm font-medium">
                      {note.reminder.date} - {note.reminder.time}
                    </p>
                  </div>
                  <Toggle
                    checked={isReminderActive}
                    onChange={handleToggleReminder}
                  />
                </div>
              </div>
            )} */}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t('deleteNote', { defaultValue: 'Delete Note' }) + ` "${note?.title || ''}"`}
        message={t('deleteNoteMessage', { 
          defaultValue: 'Are you sure you want to delete this note from this project? This action is irreversible, and your data cannot be recovered.' 
        })}
        confirmText={t('yesDelete', { defaultValue: 'Yes, Delete' })}
        cancelText={t('form.cancel', { defaultValue: 'Cancel' })}
        confirmVariant="primary"
        isLoading={isDeleting}
        maxWidthClass="max-w-md"
      />
    </div>
  );
}

