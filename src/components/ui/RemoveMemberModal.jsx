/**
 * Remove Member Confirmation Modal
 * Reusable confirmation dialog for destructive member removal
 */

import { useTranslation } from 'react-i18next';
import Button from './Button';

export default function RemoveMemberModal({
  isOpen,
  onClose,
  onConfirm,
  memberName = '',
  title,
  description,
  confirmText,
  cancelText,
  isLoading = false,
}) {
  const { t } = useTranslation('subscription');
  
  if (!isOpen) return null;

  const safeName = memberName || '';

  const finalTitle = title || 
    (safeName 
      ? t('removeMemberModal.title', { name: safeName, defaultValue: `Remove ${safeName}` })
      : t('removeMemberModal.titleDefault', { defaultValue: 'Remove Member' }));
  
  const finalDescription =
    description ||
    (safeName
      ? t('removeMemberModal.description', { name: safeName, defaultValue: `Are you sure you want to remove ${safeName}? This action is irreversible, and your data cannot be recovered.` })
      : t('removeMemberModal.descriptionDefault', { defaultValue: 'Are you sure you want to remove this member? This action is irreversible, and your data cannot be recovered.' }));

  const finalCancelText = cancelText || t('removeMemberModal.cancel', { defaultValue: 'Cancel' });
  const finalConfirmText = confirmText || t('removeMemberModal.confirm', { defaultValue: 'Yes, Remove' });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose?.();
        }
      }}
    >
      <div className="bg-white rounded-[24px] shadow-xl w-full max-w-2xl my-auto px-6 sm:px-10 py-8 sm:py-10">
        <h2 className="text-2xl sm:text-[28px] font-semibold text-primary mb-4">
          {finalTitle}
        </h2>
        <p className="text-sm sm:text-base text-secondary leading-relaxed mb-8 max-w-3xl">
          {finalDescription}
        </p>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-[140px]"
            onClick={onClose}
            disabled={isLoading}
          >
            {finalCancelText}
          </Button>
          <Button
            variant="danger"
            size="md"
            className="w-full sm:w-[160px]"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading 
              ? t('removeMemberModal.removing', { defaultValue: 'Removing...' })
              : finalConfirmText
            }
          </Button>
        </div>
      </div>
    </div>
  );
}


