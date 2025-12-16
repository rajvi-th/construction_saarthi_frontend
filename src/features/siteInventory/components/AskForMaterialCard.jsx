/**
 * AskForMaterialCard Component
 * Displays a single "Ask for Materials" request with status and rejection reason
 */

import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function AskForMaterialCard({ request, t, formatTime }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const audioRef = useRef(null);

  // Map backend response fields to UI-friendly variables
  const status = request.status;

  // Quantity / title content
  const quantity = request.item_count ?? request.quantity ?? 0;
  const materialName =
    request.materialName ||
    request.material?.name ||
    ''; // backend currently doesn't send name, so this may be empty

  // "From: <project>" text - show ONLY project name (no ID fallback)
  const fromProjectName =
    request.fromProjectname ||
    request.fromProjectName ||
    request.from_project_name ||
    '';
  const hasFromProject = !!fromProjectName;

  // Asking description line (grey text)
  const askingDescription =
    request.asking_description || request.description || '';

  // Timestamps
  const timestamp = request.createdAt || request.updatedAt || request.timestamp;

  // Rejection info
  const rejectionReason =
    request.rejected_description || request.rejectionReason || '';
  const rejectionAudio =
    request.rejection_audio_url || request.rejectionAudio || null;

  const formatSeconds = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log("Audio play error:", err));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };


  const getStatusBadge = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-lg border border-[rgba(52,199,89,0.4)] bg-[rgba(52,199,89,0.08)] text-[#34C759]">
            {t('askForMaterials.status.approved', { defaultValue: 'Approved' })}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-lg border border-[rgba(255,59,48,0.4)] bg-[rgba(255,59,48,0.08)] text-[#FF3B30]">
            {t('askForMaterials.status.rejected', { defaultValue: 'Rejected' })}
          </span>
        );
      case 'pending':
        return (
          <StatusBadge
            text={t('askForMaterials.status.pending', { defaultValue: 'Pending' })}
            color="yellow"
            className="text-xs px-2 py-1"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-col justify-start items-start">
            <h3 className="text-base sm:text-lg text-primary font-medium">
              {quantity}{' '}
              {materialName ||
                t('askForMaterials.items', { defaultValue: 'items' })}
            </h3>
            {hasFromProject && (
              <span className="text-base sm:text-lg capitalize text-secondary">
                {t('askForMaterials.from', { defaultValue: 'From' })}:&nbsp;
                {fromProjectName}
              </span>
            )}
          </div>
          {askingDescription && (
            <p className="text-base text-secondary">{askingDescription}</p>
          )}
        </div>

        {/* Status Badge and Timestamp */}
        <div className="flex items-center gap-2 sm:gap-3">
          {getStatusBadge()}
          <span className="text-xs sm:text-sm text-secondary whitespace-nowrap">
            {formatTime(timestamp)}
          </span>
        </div>
      </div>

      {/* Rejection Reason Section - Only show for rejected requests */}
      {status === 'rejected' && (rejectionReason || rejectionAudio) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-primary mb-3">
            {t('askForMaterials.rejectionReason', { defaultValue: 'Reason for rejection' })}
          </p>

          <div className="space-y-3">
            {/* Audio Player */}
            {rejectionAudio && (
              <>
                <audio
                  ref={audioRef}
                  src={rejectionAudio}
                  type="audio/aac"
                  preload="metadata"
                  onLoadedMetadata={() => {
                    setAudioDuration(audioRef.current.duration);
                  }}
                  onCanPlayThrough={() => {
                    if (!audioDuration) {
                      setAudioDuration(audioRef.current.duration);
                    }
                  }}
                  onTimeUpdate={() => {
                    setAudioCurrentTime(audioRef.current.currentTime);
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
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <div className="flex-1 flex items-center gap-2">
                    <div className="relative w-full h-1.5 bg-[#E5E5EA] rounded-full">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{
                          width:
                            audioDuration > 0
                              ? `${(audioCurrentTime / audioDuration) * 100}%`
                              : "0%",
                        }}
                      ></div>
                    </div>

                    {/* SHOW REVERSE COUNTDOWN TIME */}
                    <span className="text-[11px] text-primary">
                      {formatSeconds(audioDuration - audioCurrentTime)}
                    </span>
                  </div>
                </div>

              </>

            )}

            {/* Text Reason */}
            {rejectionReason && (
              <p className="text-sm">
                {rejectionReason}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

