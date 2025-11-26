import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import PhoneInput from '../../../components/ui/PhoneInput';
import Checkbox from '../../../components/ui/Checkbox';
import { ROUTES_FLAT } from '../../../constants/routes';
import { sendOTP } from '../api';
import { showError, showSuccess } from '../../../utils/toast';
import registerImage from '../../../assets/images/register.png';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    referralCode: '',
    agreeToTerms: false,
  });
  const [countryCode, setCountryCode] = useState('+91');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.agreeToTerms) return;
    
    setIsLoading(true);
    
    try {
      const requestData = {
        country_code: countryCode,
        phone_number: formData.phone.trim(),
        full_name: formData.fullName.trim(),
        type: 'register',
      };

      // Add referral code if provided
      if (formData.referralCode.trim()) {
        requestData.referral_code = formData.referralCode.trim();
      }

      const response = await sendOTP(requestData);

      // Show success message
      showSuccess(response?.message || t('register.otpSent', { ns: 'auth', defaultValue: 'OTP sent successfully' }));
      
      // Navigate to verify OTP page
      navigate(ROUTES_FLAT.VERIFY_OTP, { 
        state: { 
          phone: formData.phone.trim(), 
          countryCode: countryCode,
          isFromRegister: true,
          fullName: formData.fullName.trim(),
          referralCode: formData.referralCode.trim(),
        } 
      });
    } catch (error) {
      // Error handling - show error message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          t('register.otpError', { ns: 'auth', defaultValue: 'Failed to send OTP. Please try again.' });
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Left side content with overlay text - Bottom positioned
  const leftContent = (
    <div className="w-full">
      {/* Main Headline - Bottom Left */}
      <div className="z-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight max-w-2xl">
          {t('register.leftContent.title', { ns: 'auth' })}
        </h2>
        <p className="text-white text-base sm:text-lg lg:text-xl max-w-2xl">
          {t('register.leftContent.description', { ns: 'auth' })}
        </p>
      </div>
    </div>
  );

  return (
    <AuthLayout
      leftImage={registerImage}
      title={t('register.title', { ns: 'auth' })}
      subtitle={t('register.subtitle', { ns: 'auth' })}
      leftContent={leftContent}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Full Name Input */}
        <Input
          label={t('register.fullName', { ns: 'auth' })}
          placeholder={t('register.enterFullName', { ns: 'auth' })}
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />

        {/* Phone Input */}
        <PhoneInput
          placeholder="000 000 0000"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          required
        />

        {/* Referral Code Section */}
        <div className="space-y-2">
          <div>
            <h3 className="text-sm sm:text-base font-medium text-primary mb-1">
              {t('register.referralCode.title', { ns: 'auth' })}
            </h3>
            <p className="text-xs sm:text-sm text-secondary mb-3">
              {t('register.referralCode.subtitle', { ns: 'auth' })}
            </p>
          </div>
          <Input
            label={t('register.referralCode.enterCode', { ns: 'auth' })}
            placeholder={t('register.referralCode.placeholder', { ns: 'auth' })}
            value={formData.referralCode}
            onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
          />
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="pt-2">
          <Checkbox
            label={
              <>
                {t('register.agreeToTerms', { ns: 'auth' })}{' '}
                <Link 
                  to="#" 
                  className="text-accent font-semibold"
                  onClick={(e) => {
                    e.preventDefault();
                    // Add terms modal or navigation
                  }}
                >
                  {t('terms', { ns: 'auth' })}
                </Link>
              </>
            }
            checked={formData.agreeToTerms}
            onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
          />
        </div>

        {/* Send OTP Button */}
        <Button 
          type="submit" 
          variant="primary" 
          className="w-full mt-4 sm:mt-6"
          disabled={!formData.fullName || !formData.phone || !formData.agreeToTerms || isLoading}
        >
          {isLoading ? t('loading') : t('register.sendOTP', { ns: 'auth' })}
        </Button>

        {/* Login Link */}
        <div className="text-center text-xs sm:text-sm text-secondary pt-2">
          <span>{t('register.haveAccount', { ns: 'auth' })} </span>
          <Link to={ROUTES_FLAT.LOGIN} className="text-accent font-semibold ">
            {t('register.link', { ns: 'auth' })}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
