/**
 * Transfer Request Card Component
 * Displays a single transfer request with status and actions
 */

import { useState, useRef } from 'react';
import { X, Check, Play, Pause } from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';
import ApproveTransferModal from './ApproveTransferModal';

export default function TransferRequestCard({
  request,
  onApprove,
  onReject,
  t,
  formatTime,
  formatCurrency,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const {
    quantity,
    item_count,
    materialName,
    fromProject,
    toProject,
    whichProject,
    to_project,
    status,
    timestamp,
    rejectionReason,
  } = request;

  // Normalize rejection audio URL from API
  const rejectionAudio =
    request.rejection_audio_url || request.rejectionAudio || null;

  // Prefer quantity, but fall back to item_count from API
  const displayQuantity = quantity ?? item_count ?? 0;

  // Normalized project labels for display - names only (no ID fallback)
  const fromProjectId = fromProject || whichProject;
  const toProjectId = toProject || to_project;

  const fromProjectLabel =
    request.fromProjectname ||
    request.fromProjectName ||
    request.from_project_name ||
    '';

  const toProjectLabel =
    request.toProject ||
    request.to_project_name ||
    '';

  // Data passed to ApproveTransferModal (quantity + from/to project)
  const approveModalRequest = {
    ...request,
    quantity: displayQuantity,
    fromProject: fromProjectLabel || fromProjectId || '',
    toProject: toProjectLabel || toProjectId || '',
  };

  const formatSeconds = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleApproveClick = () => {
    setIsApproveModalOpen(true);
  };

  const handleApprove = async (approvedData) => {
    try {
      await onApprove?.(approvedData);
      setIsApproveModalOpen(false);
    } catch (error) {
      console.error('Error in handleApprove:', error);
    }
  };

  const handleReject = () => {
    onReject?.(request);
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Audio play error:', err));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      {/* Request Info */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 w-full">
          <p className="text-sm sm:text-base text-secondary flex flex-wrap items-center gap-1 mb-3 sm:mb-0">
            <span className="font-medium text-primary">{displayQuantity} </span> 
            <span>{materialName}</span>
            <span>
              {t('transferRequests.beingSent', {
                defaultValue: 'are being sent from',
              })}
            </span>
            {toProjectLabel && (
              <span className="font-medium text-primary">{toProjectLabel}</span>
            )}
            <span>
              {t('transferRequests.to', { defaultValue: 'to your project' })}
            </span>
            {fromProjectLabel && (
              <span className="font-medium text-primary">{fromProjectLabel}</span>
            )}
          </p>
          
          {/* Status Badge and Timestamp for Approved/Rejected */}
          {status?.toLowerCase() !== 'pending' && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:justify-end">
              {status?.toLowerCase() === 'approved' && (
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-lg border border-[rgba(52,199,89,0.4)] bg-[rgba(52,199,89,0.08)] text-[#34C759]">
                  {t('transferRequests.status.approved', { defaultValue: 'Approved' })}
                </span>
              )}
              {status?.toLowerCase() === 'rejected' && (
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-lg border border-[rgba(255,59,48,0.4)] bg-[rgba(255,59,48,0.08)] text-[#FF3B30]">
                  {t('transferRequests.status.rejected', { defaultValue: 'Rejected' })}
                </span>
              )}
              <p className="text-xs text-secondary whitespace-nowrap">
                {formatTime(timestamp)}
              </p>
            </div>
          )}
        </div>

        {/* Actions for Pending Requests */}
        {status?.toLowerCase() === 'pending' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0 w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={handleReject}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-[rgba(255,59,48,0.08)] text-[#FF3B30] border border-[rgba(255,59,48,0.4)] hover:bg-[rgba(255,59,48,0.12)] transition-colors cursor-pointer whitespace-nowrap"
              >
                <X className="w-4 h-4" />
                {t('transferRequests.reject', { defaultValue: 'Reject' })}
              </button>
              <button
                onClick={handleApproveClick}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-[rgba(52,199,89,0.08)] text-[#34C759] border border-[rgba(52,199,89,0.4)] hover:bg-[rgba(52,199,89,0.12)] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                {t('transferRequests.approve', { defaultValue: 'Approve' })}
              </button>
            </div>
            <p className="text-xs text-secondary text-center sm:text-left sm:whitespace-nowrap">
              {formatTime(timestamp)}
            </p>
          </div>
        )}
      </div>

      {/* Rejection Reason Section (for Rejected requests) */}
      {status?.toLowerCase() === 'rejected' && (rejectionReason || rejectionAudio) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-primary mb-3">
            {t('transferRequests.rejectionReason', { defaultValue: 'Your reason for rejection' })}
          </p>
          
          <div className="space-y-3">
            {/* Audio Player - same style as AskForMaterialCard */}
            {rejectionAudio && (
              <>
                <audio
                  ref={audioRef}
                  src={rejectionAudio}
                  type="audio/aac"
                  preload="metadata"
                  onLoadedMetadata={() => {
                    setAudioDuration(audioRef.current?.duration || 0);
                  }}
                  onCanPlayThrough={() => {
                    if (!audioDuration && audioRef.current) {
                      setAudioDuration(audioRef.current.duration || 0);
                    }
                  }}
                  onTimeUpdate={() => {
                    setAudioCurrentTime(audioRef.current?.currentTime || 0);
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                    setAudioCurrentTime(0);
                  }}
                />

                <div className="flex items-center gap-3 px-3 py-2 bg-[#F5F5F7] rounded-full w-full max-w-xs">
                  <button
                    onClick={toggleAudio}
                    className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-[#9F290A] transition-colors cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 flex items-center gap-2">
                    <div className="relative w-full h-1.5 bg-[#E5E5EA] rounded-full">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{
                          width:
                            audioDuration > 0
                              ? `${(audioCurrentTime / audioDuration) * 100}%`
                              : '0%',
                        }}
                      ></div>
                    </div>

                    <span className="text-[11px] text-primary">
                      {formatSeconds(audioDuration - audioCurrentTime)}
                    </span>
                  </div>
                </div>
              </>
            )}
            
            {/* Text Reason */}
            {rejectionReason && (
              <p className="text-sm ">
                {rejectionReason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Approve Transfer Modal */}
      <ApproveTransferModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onApprove={handleApprove}
        request={approveModalRequest}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

