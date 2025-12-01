import { useState, useEffect, useRef } from 'react';
import { X, Camera, User } from 'lucide-react';
import Button from './Button';
import PhoneInput from './PhoneInput';
import Input from './Input';

export default function BuilderFormModal({
  isOpen,
  onClose,
  onSave,
  workspaceId,
}) {
  const [formData, setFormData] = useState({
    full_name: '',
    country_code: '+91',
    phone_number: '',
    company_Name: '',
    address: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        full_name: '',
        country_code: '+91',
        phone_number: '',
        company_Name: '',
        address: '',
      });
      setProfilePhoto(null);
      setProfilePhotoPreview(null);
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
        profilePhoto: 'Please select an image file',
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profilePhoto: 'Image size should be less than 5MB',
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
      newErrors.full_name = 'Builder name is required';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Contact number is required';
    } else {
      // Validate phone number (should have at least 10 digits)
      const digits = formData.phone_number.replace(/\D/g, '');
      if (digits.length < 10) {
        newErrors.phone_number = 'Please enter a valid phone number';
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
      profilePhoto,
      workspace_id: workspaceId,
    });

    // Reset form
    setFormData({
      full_name: '',
      country_code: '+91',
      phone_number: '',
      company_Name: '',
      address: '',
    });
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={handleKeyPress}
    >
      <div className="bg-white rounded-[16px] shadow-xl w-full max-w-md my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-semibold text-primary">Add Builder</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Profile Photo Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {profilePhotoPreview ? (
                  <img
                    src={profilePhotoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-accent flex items-center justify-center cursor-pointer hover:bg-accent/90 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
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

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Builder Name */}
            <Input
              label="Builder Name"
              placeholder="Enter name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              required
              error={errors.full_name}
            />

            {/* Contact Number */}
            <PhoneInput
              label="Contact Number"
              placeholder="000 000 0000"
              value={formData.phone_number}
              onChange={handlePhoneChange}
              countryCode={formData.country_code}
              onCountryCodeChange={handleCountryCodeChange}
              required
              error={errors.phone_number}
            />

            {/* Company Name */}
            <Input
              label="Company Name"
              placeholder="Enter company name"
              value={formData.company_Name}
              onChange={(e) => handleInputChange('company_Name', e.target.value)}
            />

            {/* Address */}
            <Input
              label="Address"
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pb-5 px-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Add Builder
          </Button>
        </div>
      </div>
    </div>
  );
}

