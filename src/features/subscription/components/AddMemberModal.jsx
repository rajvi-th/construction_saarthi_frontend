/**
 * Add Member Modal Component
 * Modal for adding members to subscription plan
 * Uses Input, Radio, and PhoneInput components
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Info } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Radio from '../../../components/ui/Radio';
import PhoneInput from '../../../components/ui/PhoneInput';

export default function AddMemberModal({
  isOpen,
  onClose,
  onSave,
  existingMembersCount = 2,
  memberPrice = 99,
}) {
  const { t } = useTranslation('subscription');
  const [formData, setFormData] = useState({
    full_name: '',
    country_code: '+91',
    phone_number: '',
    role: 'supervisor_engineer',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        full_name: '',
        country_code: '+91',
        phone_number: '',
        role: 'supervisor_engineer',
      });
      setErrors({});
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handlePhoneChange = (e) => {
    handleInputChange('phone_number', e.target.value);
  };

  const handleCountryCodeChange = (code) => {
    handleInputChange('country_code', code);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = t('addMemberModal.errors.fullNameRequired', {
        defaultValue: 'Full name is required',
      });
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = t('addMemberModal.errors.phoneRequired', {
        defaultValue: 'Phone number is required',
      });
    } else {
      // Validate phone number (should have at least 10 digits)
      const digits = formData.phone_number.replace(/\D/g, '');
      if (digits.length < 10) {
        newErrors.phone_number = t('addMemberModal.errors.phoneInvalid', {
          defaultValue: 'Please enter a valid phone number',
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Call onSave with form data
    onSave({
      ...formData,
    });

    // Reset form
    setFormData({
      full_name: '',
      country_code: '+91',
      phone_number: '',
      role: 'supervisor_engineer',
    });
    setErrors({});
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto "
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={handleKeyPress}
    >
      <div className="bg-white rounded-[16px] shadow-xl w-full max-w-lg my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <h3 className="text-[20px] font-medium text-primary">
            {t('addMemberModal.title', { defaultValue: 'Add Member' })}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-2">
          {/* Member Information Section */}
          <div className="mb-6">
            <h4 className=" font-medium text-primary">
              {t('addMemberModal.memberInformation', { defaultValue: 'Member Information' })}
            </h4>
            <p className="text-sm text-primary-light mb-4">
              {t('addMemberModal.memberInformationDescription', {
                defaultValue: 'Please enter the member details to add them to your subscription plan.',
              })}
            </p>

            <div className="space-y-4">
              {/* Full Name */}
              <Input
                placeholder={t('addMemberModal.fullNamePlaceholder', { defaultValue: 'Full name' })}
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
                error={errors.full_name}
              />

              {/* Phone Number */}
              <PhoneInput
                placeholder="000 000 0000"
                value={formData.phone_number}
                onChange={handlePhoneChange}
                countryCode={formData.country_code}
                onCountryCodeChange={handleCountryCodeChange}
                required
                error={errors.phone_number}
              />
            </div>
          </div>

          {/* Assign Role Section */}
          <div className="mb-4">
            <h4 className="font-medium text-primary mb-3">
              {t('addMemberModal.assignRole', { defaultValue: 'Assign Role' })}
            </h4>
            <div className="space-y-4">
              <Radio
                name="role"
                value="supervisor_engineer"
                checked={formData.role === 'supervisor_engineer'}
                onChange={(e) => handleInputChange('role', e.target.value)}
                label={t('addMemberModal.roleSupervisorEngineer', {
                  defaultValue: 'Supervisor/Engineer',
                })}
              />
              <Radio
                name="role"
                value="builder_client"
                checked={formData.role === 'builder_client'}
                onChange={(e) => handleInputChange('role', e.target.value)}
                label={t('addMemberModal.roleBuilderClient', {
                  defaultValue: 'Builder/Client',
                })}
              />
            </div>
          </div>

          {/* Information Message */}
          <div className="">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-[#FF9500] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-primary mb-1">
                  {t('addMemberModal.membersAdded', {
                    defaultValue: '{{count}} Member already added',
                    count: existingMembersCount,
                  })}
                </p>
                <p className="text-sm text-primary-light">
                  {t('addMemberModal.addingMoreCosts', {
                    defaultValue: 'Adding more member costs ',
                  })}
                  <span className="font-medium text-accent">
                    ₹{memberPrice}
                  </span>
                  {t('addMemberModal.perUserMonth', {
                    defaultValue: '/user/month',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pb-5 px-4 pt-4">
          <Button variant="secondary" onClick={onClose}>
            {t('addMemberModal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {t('addMemberModal.addMember', { defaultValue: 'Add Member' })}
          </Button>
        </div>
      </div>
    </div>
  );
}

