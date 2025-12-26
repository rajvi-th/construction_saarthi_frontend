/**
 * OvertimeModal
 * Modal for entering overtime details (Rate/hr and OT Hours)
 */

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function OvertimeModal({
  isOpen,
  onClose,
  onSubmit,
  labourName = '',
  dailyWage = 0,
  isSubmitting = false,
}) {
  const { t } = useTranslation('labourAttendance');
  const [ratePerHour, setRatePerHour] = useState('');
  const [otHours, setOtHours] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setRatePerHour('');
      setOtHours('');
      setErrors({});
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRateChange = (e) => {
    if (isSubmitting) return;
    const raw = e.target.value;
    if (String(raw).includes('-')) {
      const cleaned = String(raw).replace(/-/g, '');
      setRatePerHour(cleaned);
      setErrors((prev) => ({ ...prev, ratePerHour: 'Rate cannot be negative' }));
      return;
    }
    const num = Number(raw);
    if (!Number.isNaN(num) && num < 0) {
      setErrors((prev) => ({ ...prev, ratePerHour: 'Rate cannot be negative' }));
    } else {
      setErrors((prev => ({ ...prev, ratePerHour: '' })));
    }
    setRatePerHour(raw);
  };

  const handleHoursChange = (e) => {
    if (isSubmitting) return;
    const raw = e.target.value;
    if (String(raw).includes('-')) {
      const cleaned = String(raw).replace(/-/g, '');
      setOtHours(cleaned);
      setErrors((prev) => ({ ...prev, otHours: 'Hours cannot be negative' }));
      return;
    }
    const num = Number(raw);
    if (!Number.isNaN(num) && num < 0) {
      setErrors((prev) => ({ ...prev, otHours: 'Hours cannot be negative' }));
    } else {
      setErrors((prev => ({ ...prev, otHours: '' })));
    }
    setOtHours(raw);
  };

  const handleSubmit = () => {
    const rate = Number(ratePerHour);
    const hours = Number(otHours);

    const newErrors = {};
    if (!ratePerHour.trim() || rate <= 0) {
      newErrors.ratePerHour = 'Please enter a valid rate';
    }
    if (!otHours.trim() || hours <= 0) {
      newErrors.otHours = 'Please enter valid hours';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isSubmitting) return;
    onSubmit?.({ ratePerHour: rate, otHours: hours });
  };

  const isPrimaryDisabled = !ratePerHour.trim() || !otHours.trim() || Boolean(errors.ratePerHour) || Boolean(errors.otHours) || isSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose?.();
      }}
    >
      <div className="bg-white rounded-[16px] shadow-xl w-full max-w-xl my-auto px-6 py-6 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <h2 className="text-base font-semibold text-primary mb-6 pr-8">
          {t('overtimeModal.title', { defaultValue: 'Enter Over Time' })}
        </h2>

        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label={t('overtimeModal.ratePerHour', { defaultValue: 'Rate/hr' })}
                placeholder={t('overtimeModal.ratePlaceholder', { defaultValue: 'Rate/hr' })}
                value={ratePerHour}
                onChange={handleRateChange}
                type="number"
                step="any"
                min="0"
                error={errors.ratePerHour}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex-1">
              <Input
                label={t('overtimeModal.otHours', { defaultValue: 'OT Hours' })}
                placeholder={t('overtimeModal.hoursPlaceholder', { defaultValue: 'OT Hours' })}
                value={otHours}
                onChange={handleHoursChange}
                type="number"
                step="any"
                min="0"
                error={errors.otHours}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex items-end gap-3 pt-2">
            <div className="flex-1">
              <label className="block text-sm font-normal text-black mb-2">
                {t('overtimeModal.todaysWage', { defaultValue: "Today's Wage Per Day" })}
              </label>
              <div className="px-4 py-3 rounded-lg border border-gray-200 bg-white text-primary font-medium">
                {formatCurrencyINR(dailyWage)}
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="primary"
                size="sm"
                className="w-[120px]"
                onClick={handleSubmit}
                disabled={isPrimaryDisabled}
              >
                {isSubmitting ? t('common.loading', { defaultValue: 'Please wait…' }) : t('common.save', { defaultValue: 'Save' })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCurrencyINR(amount) {
  const value = Number(amount || 0);
  if (Number.isNaN(value)) return '₹0';
  return `₹${value.toLocaleString('en-IN')}`;
}

