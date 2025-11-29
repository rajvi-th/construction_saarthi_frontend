import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, X } from 'lucide-react';
import { useAuth } from '../../auth/store';
import PageHeader from '../../../components/layout/PageHeader';
import Input from '../../../components/ui/Input';
import PhoneInput from '../../../components/ui/PhoneInput';
import FileUpload from '../../../components/ui/FileUpload';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import Button from '../../../components/ui/Button';
import Loader from '../../../components/ui/Loader';
import { statusBadgeColors } from '../../../components/ui/StatusBadge';
import { useProfile } from '../hooks';

// Get initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Get avatar color
const getAvatarColor = (name) => {
  const colors = ['red', 'green', 'yellow', 'blue', 'purple', 'pink', 'darkblue'];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Get avatar style
const getAvatarStyle = (color) => {
  const colorKey = color || 'red';
  const colors = statusBadgeColors[colorKey] || statusBadgeColors.red;
  return {
    backgroundColor: colors.background,
    borderColor: colors.border,
    color: colors.text,
  };
};

  
export default function MyProfile() {
  const { t } = useTranslation('account');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Use profile hook for API calls
  const { profile, isLoading: isFetching, isSaving, updateProfile } = useProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyTagline, setCompanyTagline] = useState('');
  const [gstin, setGstin] = useState('');
  const [panCard, setPanCard] = useState(null); // Single PAN card photo
  const [profilePicture, setProfilePicture] = useState(null);

  // Store File objects separately for FormData upload
  const [profileFile, setProfileFile] = useState(null);
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [panCardFile, setPanCardFile] = useState(null); // Single PAN card file

  const profilePhotoInputRef = useRef(null);

  // Update form fields when profile data is loaded
  useEffect(() => {
    if (profile) {
      const fullName = profile.full_name || '';
      const nameParts = fullName.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setContactNumber(profile.phone_number || profile.phone?.split(' ').slice(1).join(' ') || '');
      setCountryCode(profile.country_code || '+91');
      setEmail(profile.email || '');
      setAddress(profile.address || '');
      setCompanyName(profile.company_Name || profile.company_name || '');
      setCompanyLogo(profile.company_logo || null);
      setCompanyTagline(profile.company_tagline || '');
      setGstin(profile.gstin || '');
      // Handle PAN card (single photo)
      const panCardData = profile.pan_card;
      if (panCardData) {
        // If array, take first one; if single, use as is
        const panPhoto = Array.isArray(panCardData) ? panCardData[0] : panCardData;
        setPanCard(panPhoto);
      } else {
        setPanCard(null);
      }
      setProfilePicture(profile.profile || profile.profile_picture || null);
    }
  }, [profile]);

  const userName = `${firstName} ${lastName}`.trim() || user?.full_name || user?.name || 'User';
  const avatarColor = getAvatarColor(userName);
  const avatarStyle = getAvatarStyle(avatarColor);
  const initials = getInitials(userName);

  const handleCompanyLogoSelect = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setCompanyLogoFile(file); // Store File object for upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyLogo(e.target.result); // Store preview URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePanCardSelect = (files) => {
    if (files && files.length > 0) {
      const file = files[0]; // Take only first file
      setPanCardFile(file); // Store File object for upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setPanCard(e.target.result); // Store preview URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCompanyLogo = () => {
    setCompanyLogo(null);
    setCompanyLogoFile(null);
  };

  const handleRemovePanCard = () => {
    setPanCard(null);
    setPanCardFile(null);
  };

  const handleProfilePhotoChange = () => {
    profilePhotoInputRef.current?.click();
  };

  const handleProfilePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file); // Store File object for upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target.result); // Store preview URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const language = localStorage.getItem('lang') || 'en';

    // Prepare form data
    const formData = {
      full_name: `${firstName} ${lastName}`.trim(),
      language: language,
      company_Name: companyName,
      address: address,
      company_tagline: companyTagline,
      gstin: gstin,
    };

    // Add files only if they are File objects
    if (profileFile instanceof File) {
      formData.profile = profileFile;
    }
    if (companyLogoFile instanceof File) {
      formData.company_logo = companyLogoFile;
    }
    if (panCardFile instanceof File) {
      formData.pan_card = panCardFile;
    }

    // Call hook's updateProfile function
    await updateProfile(formData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isFetching) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title={t('profile.title', { defaultValue: 'My Profile' })}
          showBackButton={true}
        />

        {/* User Profile Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="relative mb-4 sm:mb-5">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center font-semibold text-xl sm:text-2xl md:text-3xl border-2 flex-shrink-0"
                style={avatarStyle}
              >
                {profilePicture || user?.profile_picture ? (
                  <img
                    src={profilePicture || user.profile_picture}
                    alt={userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <button
                type="button"
                onClick={handleProfilePhotoChange}
                className="absolute bottom-0 right-0 sm:right-1 bg-accent rounded-full p-1.5 sm:p-2 border-2 border-white shadow-md hover:bg-[#9F290A] transition-colors cursor-pointer"
                aria-label={t('changePhoto', { defaultValue: 'Change photo' })}
              >
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </button>
              <input
                ref={profilePhotoInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoSelect}
                className="hidden"
              />
            </div>

            {/* Name */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary mb-1 sm:mb-2">
              {userName}
            </h2>

            {/* Phone Number */}
            <p className="text-sm sm:text-base text-secondary">
              {countryCode} {contactNumber || user?.phone_number || '+91 98765 43210'}
            </p>
          </div>
        </div>

        {/* Personal Information Section */}
        <h3 className="text-lg font-semibold text-primary mb-4 sm:mb-6">
          {t('profile.personalInformation', { defaultValue: 'Personal Information' })}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* First Name */}
          <Input
            label={t('profile.firstName', { defaultValue: 'First Name' })}
            placeholder={t('profile.enterFirstName', { defaultValue: 'Enter first name' })}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          {/* Last Name */}
          <Input
            label={t('profile.lastName', { defaultValue: 'Last Name' })}
            placeholder={t('profile.enterLastName', { defaultValue: 'Enter last name' })}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          {/* Contact Number */}
          <div className="md:col-span-2">
            <PhoneInput
              label={t('profile.contactNumber', { defaultValue: 'Contact Number' })}
              placeholder="76545 65743"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
            />
          </div>

          {/* Address */}
          <Input
            label={t('profile.address', { defaultValue: 'Address' })}
            placeholder={t('profile.enterAddress', { defaultValue: 'Enter address' })}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="md:col-span-2"
          />
        </div>

        {/* Company Details Section */}

        <div className="space-y-4 sm:space-y-6 mt-3">
          {/* Company Name */}
          <Input
            label={t('profile.companyName', { defaultValue: 'Company Name' })}
            placeholder={t('profile.enterCompanyName', { defaultValue: 'Enter company name' })}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          {/* Company Logo */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('profile.companyLogo', { defaultValue: 'Company Logo' })}
            </label>
            {/* File Upload SHOULD ALWAYS BE VISIBLE */}
            <FileUpload
              title={t('profile.uploadImages', { defaultValue: 'Upload Images' })}
              supportedFormats="JPG, PNG"
              maxSize={10}
              maxSizeUnit="MB"
              accept=".jpg,.jpeg,.png"
              onFileSelect={handleCompanyLogoSelect}
            />

             {/* Existing Uploaded Images Preview */}
             {companyLogo && (
              <div className="relative inline-block mt-3">
                <img
                  src={companyLogo}
                  alt="Company Logo"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveCompanyLogo}
                  className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Company Tagline */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('profile.companyTagline', { defaultValue: 'Company Tagline' })}
            </label>
            <RichTextEditor
              value={companyTagline}
              onChange={setCompanyTagline}
              placeholder={t('profile.enterTextHere', { defaultValue: 'Enter text here' })}
            />
          </div>
        </div>

        {/* Other Information Section */}
        <div className="space-y-4 sm:space-y-6 mt-3">
          {/* GSTIN */}
          <Input
            label={t('profile.gstin', { defaultValue: 'GSTIN' })}
            placeholder={t('profile.enterNumber', { defaultValue: 'Enter number' })}
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
          />

          {/* PAN Card */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary mb-2">
              {t('profile.panCard', { defaultValue: 'PAN Card' })}
            </label>

            {/* ALWAYS SHOW THIS - FileUpload always visible */}
            <FileUpload
              title={t('profile.uploadImages', { defaultValue: 'Upload Images' })}
              supportedFormats="JPG, PNG"
              maxSize={10}
              maxSizeUnit="MB"
              accept=".jpg,.jpeg,.png"
              onFileSelect={handlePanCardSelect}
            />
            
            {/* Preview uploaded PAN card photo */}
            {panCard && (
              <div className="relative inline-block mt-3">
                <img
                  src={panCard}
                  alt="PAN Card"
                  className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleRemovePanCard}
                  className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 hover:bg-[#9F290A] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            {tCommon('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader size="sm" />
                {tCommon('loading', { defaultValue: 'Saving...' })}
              </>
            ) : (
              tCommon('save', { defaultValue: 'Save' })
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

