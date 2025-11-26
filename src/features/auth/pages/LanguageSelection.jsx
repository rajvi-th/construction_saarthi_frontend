import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../../lib/i18n';
import Button from '../../../components/ui/Button';
import { ROUTES_FLAT } from '../../../constants/routes';
import { updateLanguage } from '../api';
import { showError, showSuccess } from '../../../utils/toast';
import { statusBadgeBgColors, statusBadgeColorHex } from '../../../components/ui/StatusBadge';

// All languages from LanguageSwitcher
const languages = [
  { code: 'en', name: 'English', nativeName: 'English', firstLetter: 'E', color: 'red' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', firstLetter: 'हि', color: 'yellow' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', firstLetter: 'ગ', color: 'green' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', firstLetter: 'म', color: 'blue' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', firstLetter: 'த', color: 'blue' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', firstLetter: 'తె', color: 'purple' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', firstLetter: 'ಕ', color: 'purple' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', firstLetter: 'മ', color: 'pink' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', firstLetter: 'বা', color: 'darkblue' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', firstLetter: 'ار', color: 'yellow' },
  { code: 'raj', name: 'Rajasthani', nativeName: 'राजस्थानी', firstLetter: 'रा', color: 'green' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', firstLetter: 'भो', color: 'green' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', firstLetter: 'অ', color: 'blue' },
  { code: 'hry', name: 'Haryanvi', nativeName: 'हरियाणवी', firstLetter: 'ह', color: 'purple' },
];

export default function LanguageSelectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { i18n: i18nInstance } = useTranslation();
  const currentLanguage = i18nInstance.language || 'en';
  
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages.find(lang => lang.code === currentLanguage)?.code || languages[0].code
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    // Immediately change language for entire website
    i18n.changeLanguage(langCode);
    localStorage.setItem('lang', langCode);
  };

  const handleSaveAndContinue = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update language preference on server
      await updateLanguage(selectedLanguage);
      
      // Language is already changed when selected, just ensure it's saved to localStorage
      i18n.changeLanguage(selectedLanguage);
      localStorage.setItem('lang', selectedLanguage);
      
      // Show success message
      showSuccess(
        t('languageSelection.saved', { ns: 'auth', defaultValue: 'Language preference saved successfully' })
      );
      
      // Navigate to workspace selection
      navigate(ROUTES_FLAT.WORKSPACE_SELECTION);
    } catch (error) {
      // Error handling - show error message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          t('languageSelection.error', { ns: 'auth', defaultValue: 'Failed to save language preference. Please try again.' });
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10">
          {/* Card Title */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-primary mb-6 sm:mb-8 text-center">
            {t('languageSelection.title', { ns: 'auth', defaultValue: 'Select Your Preferred Language' })}
          </h2>

          {/* Language Grid - Fixed 2 columns, scrollable */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <div className="max-h-[600px] overflow-y-auto pr-2 pl-2 pt-2 pb-2">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {languages.map((lang) => {
                  const isSelected = selectedLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`
                        relative p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl
                        transition-all duration-200 ease-in-out cursor-pointer bg-white shadow-md border border-[rgba(6,12,18,0.06)]
                        ${isSelected 
                          ? 'bg-gray-50' 
                          : 'bg-gray-50'
                        }
                        focus:outline-none
                      `}
                      style={isSelected ? {
                        borderTopWidth: '0.6px',
                        borderLeftWidth: '0.6px',
                        borderRightWidth: '3px',
                        borderBottomWidth: '3px',
                        borderColor: '#B02E0C'
                      } : {}}
                      aria-label={`Select ${lang.nativeName}`}
                    >
                      {/* Language Character Badge */}
                      <div
                        className={`
                          w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 
                          rounded-full flex items-center justify-center 
                          font-bold text-lg sm:text-xl lg:text-2xl
                          mb-3 sm:mb-4 mx-auto
                          ${statusBadgeBgColors[lang.color] || statusBadgeBgColors.darkblue}
                        `}
                        style={{ 
                          color: statusBadgeColorHex[lang.color] || statusBadgeColorHex.darkblue 
                        }}
                      >
                        {lang.firstLetter}
                      </div>

                      {/* Language Name */}
                      <p className="text-sm sm:text-base lg:text-lg font-medium text-secondary text-center">
                        {lang.nativeName}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
                
          {/* Save & Continue Button */}
          <Button
            type="button"
            onClick={handleSaveAndContinue}
            variant="primary"
            className="w-full py-3 sm:py-4 text-base sm:text-lg rounded-xl sm:rounded-2xl"
            disabled={isLoading}
          >
            {isLoading 
              ? t('loading', { defaultValue: 'Loading...' })
              : t('languageSelection.saveAndContinue', { ns: 'auth', defaultValue: 'Save & Continue' })
            }
          </Button>
        </div>
      </main>
    </div>
  );
}

