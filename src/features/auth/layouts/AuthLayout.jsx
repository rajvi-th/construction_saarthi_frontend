import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/ui/LanguageSwitcher';
import authCard1 from '../../../assets/images/authCard1.png';
import authCard2 from '../../../assets/images/authCard2.png';

export default function AuthLayout({ 
  children, 
  leftImage, 
  title,
  subtitle,
  leftContent, 
  showLanguageSwitcher = true
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row lg:pt-4 lg:pl-4">
      {/* Left Side - Image Section with Overlay */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[40%] relative">
        {leftImage && (
          <>
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={leftImage} 
                alt="Construction Site" 
                className="w-full h-full rounded-tl-3xl"
              />
            </div>
            
            {/* Backdrop Blur Overlay - Bottom */}
            <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
            
            {/* Custom Left Content (overlay text, cards, etc.) - Bottom Positioned */}
            {leftContent && (
              <div className="absolute bottom-0 left-0 z-10 w-full p-6 lg:p-8 xl:p-10">
                {leftContent}
              </div>
            )}
            
            {/* Auth Cards - Common for all auth pages */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {/* AI Calculator Card - Top Right */}
              <div className="absolute top-12 lg:top-15 -right-8 lg:-right-10 pointer-events-auto">
                <img 
                  src={authCard1} 
                  alt="AI powered Construction Calculator" 
                  className="max-w-[200px] lg:max-w-[220px] xl:max-w-[250px] w-full h-auto rounded-xl shadow-lg"
                />
              </div>

              {/* Labourers Card - Bottom Left */}
              <div className="absolute bottom-40 xl:bottom-60 left-4 lg:left-8 pointer-events-auto">
                <img 
                  src={authCard2} 
                  alt="18 Labourers Attendance Logged" 
                  className="max-w-[160px] lg:max-w-[180px] xl:max-w-[200px] w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 xl:w-[60%] flex flex-col relative min-h-screen lg:min-h-0">
        {/* Language Switcher - Top Right */}
        {showLanguageSwitcher && (
          <div className="absolute top-4 right-4 lg:top-6 lg:right-6 xl:top-4 xl:right-4 z-10">
            <LanguageSwitcher />
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-6 xl:p-0">
          <div className="w-full max-w-md lg:max-w-lg xl:max-w-lg bg-white rounded-2xl p-6 sm:p-8 lg:p-10 xl:p-12 shadow-xl"
            >
            {/* Title Section */}
            {title && (
              <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-3xl xl:text-3xl font-medium text-primary mb-2">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-secondary text-sm sm:text-base lg:text-base">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Form Content (children) */}
            <div className="space-y-4 lg:space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

