/**
 * Transfer Request Card Component
 * Displays a single transfer request with status and actions
 */

import { useState } from 'react';
import { X, Check, Play, Pause } from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function TransferRequestCard({
  request,
  onApprove,
  onReject,
  t,
  formatTime,
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    id,
    quantity,
    materialName,
    specification,
    fromProject,
    toProject,
    status,
    timestamp,
    rejectionReason,
    rejectionAudio,
  } = request;

  const handleApprove = () => {
    onApprove?.(id);
  };

  const handleReject = () => {
    onReject?.(id);
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio playback
  };

  const getStatusBadge = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <StatusBadge text={t('transferRequests.status.approved', { defaultValue: 'Approved' })} color="green" className="text-xs px-2 py-1" />;
      case 'rejected':
        return <StatusBadge text={t('transferRequests.status.rejected', { defaultValue: 'Rejected' })} color="red" className="text-xs px-2 py-1" />;
      case 'pending':
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      {/* Request Info */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-start sm:justify-between w-full">
          <p className="text-sm sm:text-base text-primary flex items-center">
            <span className="font-semibold">{quantity}</span> {' '} {materialName}
            {t('transferRequests.beingSent', { defaultValue: 'are being sent from your project' })}{' '}
            <span className="font-semibold">{fromProject}</span>{' '}
            {t('transferRequests.to', { defaultValue: 'to' })}{' '}
            <span className="font-semibold">{toProject}</span>
          </p>
          
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            {status?.toLowerCase() === 'approved' && (
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-lg border border-[rgba(52,199,89,0.4)] bg-[rgba(52,199,89,0.08)] text-[#34C759]">
                {t('transferRequests.status.approved', { defaultValue: 'Approved' })}
              </span>
            )}
            {status?.toLowerCase() === 'rejected' && (
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-lg border border-[rgba(255,59,48,0.4)] bg-[rgba(255,59,48,0.08)] text-[#FF3B30]">
                {t('transferRequests.status.rejected', { defaultValue: 'Rejected' })}
              </span>
            )}
            
            {/* Timestamp - Show after status badge only for approved/rejected */}
            {status?.toLowerCase() !== 'pending' && (
              <p className="text-xs text-secondary">
                {formatTime(timestamp)}
              </p>
            )}
          </div>
        </div>

        {/* Actions for Pending Requests */}
        {status?.toLowerCase() === 'pending' && (
          <div className="flex items-center gap-3 flex-shrink-0 mt-4 sm:mt-0">
            <button
              onClick={handleReject}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[rgba(255,59,48,0.08)] text-[#FF3B30] border border-[rgba(255,59,48,0.4)] hover:bg-[rgba(255,59,48,0.12)] transition-colors cursor-pointer whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              {t('transferRequests.reject', { defaultValue: 'Reject' })}
            </button>
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[rgba(52,199,89,0.08)] text-[#34C759] border border-[rgba(52,199,89,0.4)] hover:bg-[rgba(52,199,89,0.12)] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Check className="w-4 h-4" />
              {t('transferRequests.approve', { defaultValue: 'Approve' })}
            </button>
            <p className="text-xs text-secondary">
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
            {/* Audio Player */}
            {rejectionAudio && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg w-fit">
                <button
                  onClick={toggleAudio}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-[#9F290A] transition-colors cursor-pointer  "
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                  )}
                </button>
                <div className="flex-1 min-w-[200px]">
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: '30%' }}></div>
                  </div>
                  <p className="text-xs text-secondary mt-1">00:12</p>
                </div>
              </div>
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
    </div>
  );
}

