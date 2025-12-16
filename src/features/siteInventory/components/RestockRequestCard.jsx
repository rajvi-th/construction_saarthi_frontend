/**
 * Restock Request Card Component
 * Displays a single restock request with status and actions
 */

import { X, Check, Plus } from 'lucide-react';

export default function RestockRequestCard({
  request,
  onApprove,
  onReject,
  onAddStock,
  t,
}) {
  const {
    quantity,
    materialName,
    quantityUnit,
    fromProject,
    status,
  } = request;

  const handleApprove = () => {
    onApprove?.(request);
  };

  const handleReject = () => {
    onReject?.(request);
  };

  const handleAddStock = () => {
    onAddStock?.(request);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side - Material details */}
        <div className="flex-1">
          <h3 className="text-lg font-medium text-primary mb-2">
            {materialName}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-secondary">
            <span>
              <span className="font-medium">{t('restockRequests.quantity', { defaultValue: 'Quantity' })}:</span>{' '}
              {quantity} {quantityUnit}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              <span className="font-medium">{t('restockRequests.from', { defaultValue: 'From' })}:</span>{' '}
              {fromProject}
            </span>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          {status === 'pending' ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReject}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-[rgba(255,59,48,0.08)] text-[#FF3B30] border border-[rgba(255,59,48,0.4)] hover:bg-[rgba(255,59,48,0.12)] transition-colors cursor-pointer whitespace-nowrap"
              >
                <X className="w-4 h-4" />
                {t('restockRequests.reject', { defaultValue: 'Reject' })}
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-[rgba(52,199,89,0.08)] text-[#34C759] border border-[rgba(52,199,89,0.4)] hover:bg-[rgba(52,199,89,0.12)] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                {t('restockRequests.approve', { defaultValue: 'Approve' })}
              </button>
            </div>
          ) : status === 'approved' ? (
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-lg bg-[rgba(52,199,89,0.08)] text-[#34C759] font-medium text-sm whitespace-nowrap cursor-not-allowed"
            >
              {t('restockRequests.approved', { defaultValue: 'Approved' })}
            </button>
          ) : null}
        </div>
      </div>

      {/* Add Stock button for approved requests */}
      {status === 'approved' && (
        <div className="mt-4 pt-4 border-t border-black-soft">
          <button
            type="button"
            onClick={handleAddStock}
            className="flex items-center gap-2 text-accent hover:text-[#9F290A] transition-colors font-medium text-sm cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
            <span>{t('restockRequests.addStock', { defaultValue: 'Add Stock' })}</span>
          </button>
        </div>
      )}
    </div>
  );
}

