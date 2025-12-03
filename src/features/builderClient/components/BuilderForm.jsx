/**
 * BuilderForm Component
 * Reusable form component for both Add and Edit Builder
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, User } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import PhoneInput from '../../../components/ui/PhoneInput';
import Loader from '../../../components/ui/Loader';

export default function BuilderForm({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isLoading = false,
  type = 'builder', // 'builder' or 'vendor'
}) {
  const { t } = useTranslation('builderClient');
  
  const [formData, setFormData] = useState({
    full_name: '',
    country_code: '+91',
    phone_number: '',
    company_Name: '',
    address: '',
  });
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Load initial data when provided (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name || initialData.name || '',
        country_code: initialData.country_code || '+91',
        phone_number: initialData.phone_number || initialData.phone || '',
        company_Name: initialData.company_Name || initialData.company_name || initialData.company || '',
        address: initialData.address || '',
      });
      
      if (initialData.profile_photo || initialData.avatar || initialData.profilePhoto) {
        setExistingPhotoUrl(initialData.profile_photo || initialData.avatar || initialData.profilePhoto);
      }
    }
  }, [initialData]);

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

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        profilePhoto: t('form.errors.invalidImage', { defaultValue: 'Please select an image file' }),
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profilePhoto: t('form.errors.imageSize', { defaultValue: 'Image size should be less than 5MB' }),
      }));
      return;
    }

    setProfilePhoto(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
    setErrors((prev) => ({
      ...prev,
      profilePhoto: undefined,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = t('form.errors.nameRequired', { defaultValue: 'Builder name is required' });
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = t('form.errors.phoneRequired', { defaultValue: 'Contact number is required' });
    } else {
      // Validate phone number (should have at least 10 digits)
      const digits = formData.phone_number.replace(/\D/g, '');
      if (digits.length < 10) {
        newErrors.phone_number = t('form.errors.invalidPhone', { defaultValue: 'Please enter a valid phone number' });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Create FormData if profile photo exists, otherwise use plain object
      if (profilePhoto) {
        const formDataToSend = new FormData();
        Object.keys(formData).forEach((key) => {
          formDataToSend.append(key, formData[key]);
        });
        formDataToSend.append('profile_photo', profilePhoto);
        await onSubmit(formDataToSend);
      } else {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors((prev) => ({
        ...prev,
        general: error?.response?.data?.message || error?.message || t('form.errors.createFailed', { defaultValue: 'Failed to save builder. Please try again.' }),
      }));
      throw error;
    }
  };

  const displayPhoto = profilePhotoPreview || existingPhotoUrl;
  const isEditMode = !!initialData;
  const submitButtonText = isEditMode 
    ? (type === 'vendor' 
        ? t('form.updateVendor', { defaultValue: 'Update Vendor' })
        : t('form.updateBuilder', { defaultValue: 'Update Builder' }))
    : (type === 'vendor'
        ? t('form.addVendor', { defaultValue: 'Add Vendor' })
        : t('form.addBuilder', { defaultValue: 'Add Builder' }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="">
      {/* Profile Photo Upload */}
      <div className="flex justify-center mb-6 md:mb-8">
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#F4F4F4] flex items-center justify-center overflow-hidden">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 md:w-12 md:h-12 text-secondary cursor-pointer " />
            )}
          </div>
          <button
            type="button"
            onClick={handlePhotoClick}
            className="absolute bottom-0 right-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-accent flex items-center justify-center cursor-pointer hover:bg-[#9F290A] transition-colors shadow-md border-2 border-white"
            aria-label={t('form.changePhoto', { defaultValue: 'Change photo' })}
          >
            <Camera className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" strokeWidth={2.5}/>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Error Message */}
      {errors.general && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-accent">{errors.general}</p>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4 md:space-y-5">
        {/* Name Field */}
        <Input
          label={type === 'vendor' 
            ? t('form.vendorName', { defaultValue: 'Vendor Name' })
            : t('form.builderName', { defaultValue: 'Builder Name' })
          }
          placeholder={t('form.placeholders.enterName', { defaultValue: 'Enter name' })}
          value={formData.full_name}
          onChange={(e) => handleInputChange('full_name', e.target.value)}
          required
          error={errors.full_name}
        />

        {/* Contact Number */}
        <PhoneInput
          label={t('form.contactNumber', { defaultValue: 'Contact Number' })}
          placeholder={t('form.placeholders.phoneNumber', { defaultValue: '000 000 0000' })}
          value={formData.phone_number}
          onChange={handlePhoneChange}
          countryCode={formData.country_code}
          onCountryCodeChange={handleCountryCodeChange}
          required
          error={errors.phone_number}
        />

        {/* Company Name */}
        <Input
          label={t('form.companyName', { defaultValue: 'Company Name' })}
          placeholder={t('form.placeholders.enterCompanyName', { defaultValue: 'Enter company name' })}
          value={formData.company_Name}
          onChange={(e) => handleInputChange('company_Name', e.target.value)}
        />

        {/* Address */}
        <Input
          label={t('form.address', { defaultValue: 'Address' })}
          placeholder={t('form.placeholders.enterAddress', { defaultValue: 'Enter address' })}
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 md:gap-4 mt-6 md:mt-8 pt-6">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-w-[100px] md:min-w-[120px]"
        >
          {t('form.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-w-[100px] md:min-w-[120px]"
        >
          {isSubmitting ? (
            <Loader size="sm" className="text-white" />
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </div>
  );
}

