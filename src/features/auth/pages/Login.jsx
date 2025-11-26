import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../../../components/ui/Button';
import PhoneInput from '../../../components/ui/PhoneInput';
import { ROUTES_FLAT } from '../../../constants/routes';
import { sendOTP } from '../api';
import { showError, showSuccess } from '../../../utils/toast';
import loginImage from '../../../assets/images/login.png';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await sendOTP({
        country_code: countryCode,
        phone_number: phone.trim(),
        type: 'login',
      });

      // Show success message
      showSuccess(response?.message || t('login.otpSent', { ns: 'auth', defaultValue: 'OTP sent successfully' }));
      
      // Navigate to verify OTP page
      navigate(ROUTES_FLAT.VERIFY_OTP, { 
        state: { 
          phone: phone.trim(), 
          countryCode: countryCode, 
          isFromRegister: false 
        } 
      });
    } catch (error) {
      // Error handling - show error message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          t('login.otpError', { ns: 'auth', defaultValue: 'Failed to send OTP. Please try again.' });
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
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight max-w-2xl">
          Manage All Your Construction Sites in One Place
        </h2>
        <p className="text-white text-lg lg:text-xl max-w-2xl">
          Track progress, materials, and updates for all your projects in one app.
        </p>
      </div>
    </div>
  );

  return (
    <AuthLayout
      leftImage={loginImage}
      title={t('login.title', { ns: 'auth' }) || 'Login To Your Account'}
      subtitle={t('login.subtitle', { ns: 'auth' }) || 'Enter your mobile number to login with your account'}
      leftContent={leftContent}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Phone Input - No label, just input */}
        <PhoneInput
          placeholder="000 000 0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          required
        />

        {/* Send OTP Button */}
        <Button 
          type="submit" 
          variant="primary" 
          className="w-full mt-20"
          disabled={!phone || isLoading}
        >
          {isLoading ? t('loading') : t('login.sendOTP', { ns: 'auth' })}
        </Button>

        {/* Register Link */}
        <div className="text-center text-sm text-secondary">
          <span>{t('login.noAccount', { ns: 'auth' })} </span>
          <Link to={ROUTES_FLAT.REGISTER} className="text-accent font-semibold">
            {t('register.createAccount', { ns: 'auth' })}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
