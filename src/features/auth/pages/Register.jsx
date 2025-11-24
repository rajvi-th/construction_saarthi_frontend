/**
 * Register Page
 * Example usage of AuthLayout with register-specific image and fields
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import PhoneInput from '../../../components/ui/PhoneInput';
import Checkbox from '../../../components/ui/Checkbox';

// Import register image (you'll need to add this image to src/assets/images/)
// import registerImage from '../../../assets/images/register-image.svg';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [countryCode, setCountryCode] = useState('+91');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register:', formData);
    // Add register logic here
  };

  return (
    <AuthLayout
      leftImage={null} // Add your register image path here: registerImage
      title={t('register.title', { ns: 'auth' })}
      subtitle={t('register.subtitle', { ns: 'auth' })}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <Input
          label={t('forms.name')}
          placeholder={t('forms.enterName')}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        {/* Email Input */}
        <Input
          label={t('forms.email')}
          type="email"
          placeholder={t('forms.enterEmail')}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        {/* Phone Input */}
        <PhoneInput
          label={t('forms.phone')}
          placeholder="000 000 0000"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          required
        />

        {/* Password Input */}
        <Input
          label={t('forms.password')}
          type="password"
          placeholder={t('forms.enterPassword')}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        {/* Confirm Password Input */}
        <Input
          label={t('forms.confirmPassword')}
          type="password"
          placeholder={t('forms.confirmPassword')}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />

        {/* Terms Checkbox */}
        <Checkbox
          label={t('register.agreeToTerms', { ns: 'auth' })}
          checked={formData.agreeToTerms}
          onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
        />

        {/* Submit Button */}
        <Button 
          type="submit" 
          variant="primary" 
          className="w-full"
          disabled={!formData.agreeToTerms}
        >
          {t('register.button', { ns: 'auth' })}
        </Button>

        {/* Login Link */}
        <div className="text-center text-sm text-secondary">
          {t('register.haveAccount', { ns: 'auth' })}{' '}
          <a href="/login" className="text-accent font-medium hover:underline">
            {t('login.link', { ns: 'auth' })}
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}

