/**
 * RejectTransferModal Component
 * Modal for rejecting transfer requests with reason (Voice/Text/Both)
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Radio from '../../../components/ui/Radio';

export default function RejectTransferModal({
  isOpen,
  onClose,
  onReject,
  request,
}) {
  const { t } = useTranslation('siteInventory');
  
  const [rejectionType, setRejectionType] = useState('voice');
  const [voiceNote, setVoiceNote] = useState(null);
  const [textReason, setTextReason] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRejectionType('voice');
      setVoiceNote(null);
      setTextReason('');
      setErrors({});
      setIsRecording(false);
    }
  }, [isOpen]);

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
      onClose();
      // Reset form
      setRejectionType('voice');
      setVoiceNote(null);
      setTextReason('');
      setErrors({});
    } catch (error) {
      console.error('Error rejecting transfer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setRejectionType('voice');
      setVoiceNote(null);
      setTextReason('');
      setErrors({});
      setIsRecording(false);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implement actual voice recording
    // This is a placeholder for voice recording functionality
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Save recorded voice note
    // setVoiceNote(recordedAudio);
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
                onClick={!isLoading ? (isRecording ? handleStopRecording : handleStartRecording) : undefined}
              >
                <Mic className={`w-5 h-5 ${isRecording ? 'text-accent' : 'text-accent'}`} />
                <span className="text-secondary flex-1">
                  {isRecording 
                    ? t('rejectModal.recording', { defaultValue: 'Recording... Release to stop' })
                    : t('rejectModal.holdMicToRecord', { defaultValue: 'Hold mic to record your voice' })
                  }
                </span>
              </div>
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

