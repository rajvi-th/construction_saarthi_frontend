/**
 * RejectTransferModal Component
 * Modal for rejecting transfer requests with reason (Voice/Text/Both)
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Radio from '../../../components/ui/Radio';
import { showError } from '../../../utils/toast';

export default function RejectTransferModal({
  isOpen,
  onClose,
  onReject,
  request,
}) {
  const { t } = useTranslation('siteInventory');
  
  const [rejectionType, setRejectionType] = useState('voice');
  const [voiceNote, setVoiceNote] = useState(null); // Will store File object for FormData
  const [voiceNoteUrl, setVoiceNoteUrl] = useState(null); // Will store URL for preview
  const [textReason, setTextReason] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRejectionType('voice');
      setVoiceNote(null);
      setVoiceNoteUrl(null);
      setTextReason('');
      setErrors({});
      setIsRecording(false);
      setRecordingTime(0);
      chunksRef.current = [];
    }
  }, [isOpen]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      // Stop recording if still active
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Revoke object URL only on unmount
      if (voiceNoteUrl) {
        URL.revokeObjectURL(voiceNoteUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on unmount

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    
    if (rejectionType === 'voice' || rejectionType === 'both') {
      if (!voiceNote) {
        newErrors.voiceNote = t('rejectModal.errors.voiceNoteRequired', { defaultValue: 'Voice note is required' });
      }
    }
    
    if (rejectionType === 'text' || rejectionType === 'both') {
      if (!textReason.trim()) {
        newErrors.textReason = t('rejectModal.errors.textReasonRequired', { defaultValue: 'Text reason is required' });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReject = async () => {
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await onReject?.({
        ...request,
        rejectionType,
        voiceNote: rejectionType === 'voice' || rejectionType === 'both' ? voiceNote : null,
        textReason: rejectionType === 'text' || rejectionType === 'both' ? textReason : '',
      });
      // Revoke object URL after successful submission
      if (voiceNoteUrl) {
        URL.revokeObjectURL(voiceNoteUrl);
      }
      
      onClose();
      // Reset form
      setRejectionType('voice');
      setVoiceNote(null);
      setVoiceNoteUrl(null);
      setTextReason('');
      setErrors({});
      setRecordingTime(0);
      chunksRef.current = [];
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      // Stop recording if active
      if (isRecording) {
        handleStopRecording();
      }
      
      // Revoke object URL
      if (voiceNoteUrl) {
        URL.revokeObjectURL(voiceNoteUrl);
      }
      
      onClose();
      setRejectionType('voice');
      setVoiceNote(null);
      setVoiceNoteUrl(null);
      setTextReason('');
      setErrors({});
      setIsRecording(false);
      setRecordingTime(0);
      chunksRef.current = [];
    }
  };

  const handleStartRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder with webm format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        
        // Create File object from Blob for FormData
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.${mimeType.includes('webm') ? 'webm' : 'mp4'}`, {
          type: mimeType,
          lastModified: Date.now(),
        });
        
        // Create URL for preview
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setVoiceNote(audioFile);
        setVoiceNoteUrl(audioUrl);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
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
      showError(t('rejectModal.errors.microphoneAccess', { 
        defaultValue: 'Microphone access denied. Please allow microphone access to record voice notes.' 
      }));
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

  const handleRerecord = () => {
    // Revoke previous URL before clearing
    if (voiceNoteUrl) {
      URL.revokeObjectURL(voiceNoteUrl);
    }
    setVoiceNote(null);
    setVoiceNoteUrl(null);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl my-auto">
        {/* Header */}
        <div className="px-6 py-4">
          <h3 className="text-2xl font-medium text-primary text-center">
            {t('rejectModal.title', { defaultValue: 'Reject Transfer Request' })}
          </h3>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          {/* Confirmation Message */}
          <div className="mb-4">
            <p className="text-base text-secondary">
              {t('rejectModal.confirmationMessage', {
                defaultValue: 'Are you sure you want to reject transfer request of {{materialName}} from {{fromProject}}?',
              })
                .replace('{{materialName}}', `<MATERIAL>`)
                .replace('{{fromProject}}', `<PROJECT>`)
                .split(/(<MATERIAL>|<PROJECT>)/g)
                .map((part, index) => {
                  if (part === '<MATERIAL>') {
                    return (
                      <span key={index} className="text-primary font-medium">
                        {request?.materialName}
                      </span>
                    );
                  }
                  if (part === '<PROJECT>') {
                    return (
                      <span key={index} className="text-primary font-medium">
                        {request?.fromProject}
                      </span>
                    );
                  }
                  return part;
                })}
            </p>
          </div>

          {/* Reason for Rejection */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              {t('rejectModal.reasonForRejection', { defaultValue: 'Reason for Rejection' })}
            </label>
            <div className="flex gap-6">
              <Radio
                id="rejection-voice"
                name="rejectionType"
                value="voice"
                checked={rejectionType === 'voice'}
                onChange={(e) => {
                  setRejectionType(e.target.value);
                  setErrors({ ...errors, voiceNote: '', textReason: '' });
                }}
                label={t('rejectModal.voice', { defaultValue: 'Voice' })}
              />
              <Radio
                id="rejection-text"
                name="rejectionType"
                value="text"
                checked={rejectionType === 'text'}
                onChange={(e) => {
                  setRejectionType(e.target.value);
                  setErrors({ ...errors, voiceNote: '', textReason: '' });
                }}
                label={t('rejectModal.text', { defaultValue: 'Text' })}
              />
              <Radio
                id="rejection-both"
                name="rejectionType"
                value="both"
                checked={rejectionType === 'both'}
                onChange={(e) => {
                  setRejectionType(e.target.value);
                  setErrors({ ...errors, voiceNote: '', textReason: '' });
                }}
                label={t('rejectModal.both', { defaultValue: 'Both' })}
              />
            </div>
          </div>

          {/* Voice Note Section */}
          {(rejectionType === 'voice' || rejectionType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('rejectModal.voiceNote', { defaultValue: 'Voice Note' })}
                <span className="text-accent ml-1">*</span>
              </label>
              {isRecording ? (
                <div
                  className={`
                    w-full px-4 py-3 rounded-lg border bg-white
                    flex items-center gap-3
                    transition-colors
                    ${errors.voiceNote 
                      ? 'border-accent focus:border-accent' 
                      : 'border-gray-200 focus:border-[rgba(6,12,18,0.3)]'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <button
                    onClick={handleStopRecording}
                    disabled={isLoading}
                    className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 hover:bg-[#9F290A] transition-colors cursor-pointer disabled:opacity-50"
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
                      <span className="text-sm text-secondary whitespace-nowrap">
                        {t('rejectModal.recording', { defaultValue: 'Recording' })}
                      </span>
                      <span className="text-sm font-medium text-accent">{formatTime(recordingTime)}</span>
                    </div>
                  </div>
                </div>
              ) : voiceNoteUrl ? (
                <div
                  className={`
                    w-full px-4 py-3 rounded-lg border bg-white
                    flex items-center gap-3
                    transition-colors
                    ${errors.voiceNote 
                      ? 'border-accent focus:border-accent' 
                      : 'border-gray-200 focus:border-[rgba(6,12,18,0.3)]'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <button
                    onClick={handleStartRecording}
                    disabled={isLoading}
                    className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 hover:bg-[#9F290A] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Mic className="w-5 h-5 text-white" />
                  </button>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <audio 
                      src={voiceNoteUrl} 
                      controls 
                      className="flex-1 h-8 min-w-0"
                    />
                    <button
                      onClick={handleRerecord}
                      disabled={isLoading}
                      className="text-sm text-accent hover:underline whitespace-nowrap disabled:opacity-50"
                    >
                      {t('rejectModal.rerecord', { defaultValue: 'Re-record' })}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`
                    w-full px-4 py-3 rounded-lg border bg-white
                    flex items-center gap-3 cursor-pointer
                    transition-colors
                    ${errors.voiceNote 
                      ? 'border-accent focus:border-accent' 
                      : 'border-gray-200 focus:border-[rgba(6,12,18,0.3)]'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}
                  `}
                  onClick={!isLoading ? handleStartRecording : undefined}
                >
                  <Mic className="w-5 h-5 text-accent" />
                  <span className="text-secondary flex-1">
                    {t('rejectModal.holdMicToRecord', { defaultValue: 'Hold mic to record your voice' })}
                  </span>
                </div>
              )}
              {errors.voiceNote && (
                <p className="mt-1 text-sm text-accent">{errors.voiceNote}</p>
              )}
            </div>
          )}

          {/* Text Reason Section */}
          {(rejectionType === 'text' || rejectionType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('rejectModal.textReason', { defaultValue: 'Text Reason' })}
                {(rejectionType === 'text' || rejectionType === 'both') && (
                  <span className="text-accent ml-1">*</span>
                )}
              </label>
              <textarea
                value={textReason}
                onChange={(e) => {
                  setTextReason(e.target.value);
                  if (errors.textReason) {
                    setErrors({ ...errors, textReason: '' });
                  }
                }}
                placeholder={t('rejectModal.textReasonPlaceholder', { defaultValue: 'Enter reason for rejection' })}
                disabled={isLoading}
                rows={4}
                className={`
                  w-full px-4 py-3 rounded-lg border bg-white text-primary 
                  placeholder:text-secondary focus:outline-none transition-colors resize-none
                  ${errors.textReason 
                    ? 'border-accent focus:border-accent' 
                    : 'border-gray-200 focus:border-[rgba(6,12,18,0.3)]'
                  }
                  ${isLoading 
                    ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                    : 'cursor-text'
                  }
                `}
              />
              {errors.textReason && (
                <p className="mt-1 text-sm text-accent">{errors.textReason}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('rejectModal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleReject}
            disabled={isLoading}
          >
            {isLoading 
              ? t('rejectModal.rejecting', { defaultValue: 'Rejecting...' })
              : t('rejectModal.reject', { defaultValue: 'Reject' })
            }
          </Button>
        </div>
      </div>
    </div>
  );
}

