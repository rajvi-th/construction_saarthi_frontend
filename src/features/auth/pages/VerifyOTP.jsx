import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes';
import verifyOTPImage from '../../../assets/images/VerifyOTP.png';

export default function VerifyOTPPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  
  // Get phone number from navigation state
  const phoneNumber = location.state?.phone || '';
  const countryCode = location.state?.countryCode || '+91';
  
  // Mask phone number: show only last 2 digits
  const maskPhoneNumber = (phone) => {
    if (!phone || phone.length < 2) return '*** *** **XX';
    const lastTwo = phone.slice(-2);
    const masked = '*** *** **' + lastTwo;
    return masked;
  };
  
  const maskedPhone = maskPhoneNumber(phoneNumber);

  // Resend timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      return;
    }

    setIsLoading(true);
    console.log('Verify OTP:', otpCode);
    // Add OTP verification logic here
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    console.log('Resend OTP');
    setResendTimer(30);
    // Add resend OTP logic here
  };

  // Format timer as MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Left side content with overlay text - Bottom positioned
  const leftContent = (
    <div className="w-full">
      {/* Main Headline - Bottom Left */}
      <div className="z-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight max-w-2xl">
          {t('verifyOTP.leftContent.title', { ns: 'auth' })}
        </h2>
        <p className="text-white text-base sm:text-lg lg:text-xl max-w-2xl">
          {t('verifyOTP.leftContent.description', { ns: 'auth' })}
        </p>
      </div>
    </div>
  );

  return (
    <AuthLayout
      leftImage={verifyOTPImage}
      title={t('verifyOTP.title', { ns: 'auth' })}
      subtitle={t('verifyOTP.subtitleWithPhone', { phone: maskedPhone, ns: 'auth' })}
      leftContent={leftContent}
      showLanguageSwitcher={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* OTP Input Fields */}
        <div>
          <div className="flex flex-row justify-center items-center flex-wrap gap-2 sm:gap-3 md:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-8 h-8 sm:w-12 sm:h-12 md:w-12 md:h-12 text-center text-lg sm:text-xl md:text-2xl font-semibold rounded-lg border-2 border-gray-200 focus:border-accent focus:outline-none transition-colors shadow-sm"
              />
            ))}
          </div>
          {/* Resend Timer */}
          <div className="mt-4 sm:mt-6 text-center sm:text-right">
            <div className="text-xs sm:text-sm text-secondary inline-flex items-center">
             <span className="text-accent cursor-pointer" onClick={handleResend}>{t('verifyOTP.resendIn', { ns: 'auth' })}</span>{formatTimer(resendTimer)}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          variant="primary" 
          className="w-full mt-8 sm:mt-12 md:mt-16 lg:mt-20"
          disabled={otp.join('').length !== 6 || isLoading}
        >
          {isLoading ? t('loading') : t('verifyOTP.button', { ns: 'auth' })}
        </Button>

        {/* Back to Login */}
        <div className="text-center text-xs sm:text-sm text-primary">
          <span>{t('register.haveAccount', { ns: 'auth' })} </span>
          <Link to={ROUTES.REGISTER} className="text-accent font-semibold">
            {t('register.link', { ns: 'auth' })}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

