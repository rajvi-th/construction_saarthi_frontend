import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import Input from '../../../components/ui/Input';
import PhoneInput from '../../../components/ui/PhoneInput';
import FileUpload from '../../../components/ui/FileUpload';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import Button from '../../../components/ui/Button';

export default function BusinessCardForm({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) {
  const { t: tAccount } = useTranslation('account');
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('businessCard');

  // Form state
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [companyTagline, setCompanyTagline] = useState('');

  // Initialize form with initialData (for edit mode)
  useEffect(() => {
    if (initialData) {
      // Set first name and last name (API returns them separately in camelCase)
      setFirstName(initialData.firstName || initialData.first_name || '');
      setLastName(initialData.lastName || initialData.last_name || '');

      // Parse phone number and country code
      // API returns phoneNumber and countyCode separately (camelCase)
      const phoneNumber = initialData.phoneNumber || initialData.phone_number || initialData.phone || '';
      const countyCode = initialData.countyCode || initialData.countryCode || initialData.country_code || '+91';
      
      setCountryCode(countyCode || '+91');
      setContactNumber(phoneNumber.toString().replace(/\s/g, '') || '');

      setEmail(initialData.email || '');
      setAddress(initialData.address || '');
      
      // Company name - API returns companyName (camelCase)
      setCompanyName(initialData.companyName || initialData.company_Name || initialData.company_name || '');
      
      // Company tagline - API returns companyTagline (camelCase)
      setCompanyTagline(initialData.companyTagline || initialData.company_tagline || '');

      // Set company logo if exists - API returns logoUrl (camelCase)
      const logoUrl = initialData.logoUrl || initialData.logo_url || initialData.logo || initialData.company_logo || initialData.companyLogo;
      if (logoUrl) {
        setCompanyLogo(logoUrl);
      }
    } else {
      // Reset form if initialData is null
      setFirstName('');
      setLastName('');
      setCompanyName('');
      setCountryCode('+91');
      setContactNumber('');
      setEmail('');
      setAddress('');
      setCompanyTagline('');
      setCompanyLogo(null);
      setCompanyLogoFile(null);
    }
  }, [initialData]);

  const handleCompanyLogoSelect = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setCompanyLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyLogo(null);
    setCompanyLogoFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      firstName,
      lastName,
      full_name: `${firstName} ${lastName}`.trim(),
      companyName,
      countryCode,
      contactNumber,
      phone_number: `${countryCode} ${contactNumber}`.trim(),
      email,
      address,
      companyTagline,
      companyLogo: companyLogoFile,
      company_logo: companyLogo, // Preview URL if no new file
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {/* Company Logo Section */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          {tAccount('profile.companyLogo', { defaultValue: 'Company Logo' })}
        </label>
        {/* File Upload SHOULD ALWAYS BE VISIBLE */}
        <FileUpload
          title={tAccount('profile.uploadImages', { defaultValue: 'Upload Images' })}
          supportedFormats="JPG, PNG"
          maxSize={10}
          maxSizeUnit="MB"
          accept=".jpg,.jpeg,.png"
          onFileSelect={handleCompanyLogoSelect}
          disabled={isLoading}
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
              onClick={handleRemoveLogo}
              disabled={isLoading}
              className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Personal Information Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* First Name */}
          <Input
            label={tAccount('profile.firstName', { defaultValue: 'First Name' })}
            placeholder={tAccount('profile.enterFirstName', { defaultValue: 'Enter first name' })}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isLoading}
          />

          {/* Last Name */}
          <Input
            label={tAccount('profile.lastName', { defaultValue: 'Last Name' })}
            placeholder={tAccount('profile.enterLastName', { defaultValue: 'Enter last name' })}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Company Name Section */}
      <div>
        <Input
          label={tAccount('profile.companyName', { defaultValue: 'Company Name' })}
          placeholder={tAccount('profile.enterCompanyName', { defaultValue: 'Enter company name' })}
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {/* Contact & Email Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Contact Number */}
        <PhoneInput
          label={tAccount('profile.contactNumber', { defaultValue: 'Contact Number' })}
          placeholder="000 000 0000"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          required
          disabled={isLoading}
        />

        {/* Email Address */}
        <Input
          label={tAccount('profile.emailAddress', { defaultValue: 'Email Address' })}
          placeholder={tAccount('profile.enterEmail', { defaultValue: 'Enter email address' })}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Address Section */}
      <div>
        <Input
          label={tAccount('profile.address', { defaultValue: 'Address' })}
          placeholder={tAccount('profile.enterAddress', { defaultValue: 'Enter address' })}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Company Tagline Section */}
      <div>
        <label className="block text-sm font-medium text-primary mb-3 sm:mb-4">
          {tAccount('profile.companyTagline', { defaultValue: 'Company Tagline' })}
          <span className="text-accent ml-1">*</span>
        </label>
        <RichTextEditor
          value={companyTagline}
          onChange={setCompanyTagline}
          placeholder={tAccount('profile.enterTextHere', { defaultValue: 'Enter text here' })}
          disabled={isLoading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {tCommon('cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading
            ? tCommon('loading', { defaultValue: 'Loading...' })
            : t('add.saveCard', { defaultValue: 'Save Card' })
          }
        </Button>
      </div>
    </form>
  );
}

