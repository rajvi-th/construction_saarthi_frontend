/**
 * Add Vendor Modal Component
 * Common modal for adding new vendor with name and contact number
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import PhoneInput from './PhoneInput';
import { useTranslation } from 'react-i18next';

export default function AddVendorModal({
  isOpen,
  onClose,
  onSave,
}) {
  const { t } = useTranslation('finance');
  const [vendorName, setVendorName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [contactNumber, setContactNumber] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setVendorName('');
      setCountryCode('+91');
      setContactNumber('');
      setErrors({});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, onClose]);

  const handleSave = () => {
    const newErrors = {};

    if (!vendorName.trim()) {
      newErrors.vendorName = t('vendorNameRequired', { defaultValue: 'Vendor name is required' });
    }

    const cleanedNumber = contactNumber.replace(/\s/g, '');
    if (!cleanedNumber) {
      newErrors.contactNumber = t('contactNumberRequired', { defaultValue: 'Contact number is required' });
    } else if (!/^\d{10}$/.test(cleanedNumber)) {
      newErrors.contactNumber = t('invalidContactNumber', { defaultValue: 'Please enter a valid 10-digit contact number' });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: vendorName.trim(),
      countryCode,
      contactNumber: contactNumber.trim(),
    });
    
    setVendorName('');
    setCountryCode('+91');
    setContactNumber('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-auto">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-lg font-medium text-primary">
            {t('addVendor', { defaultValue: 'Add Vendor' })}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Vendor Name */}
          <Input
            label={t('vendorName', { defaultValue: 'Vendor Name' })}
            value={vendorName}
            onChange={(e) => {
              setVendorName(e.target.value);
              if (errors.vendorName) {
                setErrors((prev) => ({ ...prev, vendorName: '' }));
              }
            }}
            placeholder={t('enterVendorName', { defaultValue: 'Enter vendor name' })}
            error={errors.vendorName}
            autoFocus
          />

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('contactNumber', { defaultValue: 'Contact Number' })} <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              value={contactNumber}
              onChange={setContactNumber}
              placeholder="000 000 0000"
              error={errors.contactNumber}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-4 border-t border-gray-100 pt-4">
          <Button variant="secondary" onClick={onClose}>
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {t('add', { defaultValue: 'Add' })}
          </Button>
        </div>
      </div>
    </div>
  );
}

