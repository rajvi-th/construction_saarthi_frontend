import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../../lib/i18n';
import PageHeader from '../../../components/layout/PageHeader';
import Button from '../../../components/ui/Button';
import { ROUTES_FLAT } from '../../../constants/routes';
import { updateLanguage } from '../../auth/api';
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

export default function ChangeLanguage() {
  const { t } = useTranslation('account');
  const { t: tCommon } = useTranslation('common');
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

  const handleSave = async (e) => {
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
        tCommon('successMessages.saved', { defaultValue: 'Language preference saved successfully' })
      );

      // Navigate back to My Account
      navigate(ROUTES_FLAT.MY_ACCOUNT);
    } catch (error) {
      // Error handling - show error message
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        t('changeLanguage.error', { defaultValue: 'Failed to save language preference. Please try again.' });
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header with Set Language Button */}
      <PageHeader
        title={t('changeLanguage.title', { defaultValue: 'Languages' })}
        showBackButton={true}
        onBack={() => navigate(ROUTES_FLAT.MY_ACCOUNT)}
      >
        <Button
          type="button"
          onClick={handleSave}
          variant="primary"
          className="py-2 px-4 sm:px-6 text-sm sm:text-base"
          disabled={isLoading}
        >
          {isLoading
            ? tCommon('loading', { defaultValue: 'Loading...' })
            : t('changeLanguage.setLanguage', { defaultValue: 'Set Language' })
          }
        </Button>
      </PageHeader>

      {/* Language Grid - 4 columns */}
      <div className="">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            const isDefault = lang.code === 'en';
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageSelect(lang.code)}
                className={`
                  relative p-4 sm:p-5 rounded-2xl shadow-sm
                  transition-all duration-200 ease-in-out cursor-pointer bg-white border
                  ${isSelected
                    ? 'border-accent border-2'
                    : 'border-black-soft'
                  }
                  hover:shadow-md focus:outline-none
                `}
                style={isSelected ? {
                  borderTopWidth: '0.6px',
                  borderLeftWidth: '0.6px',
                  borderRightWidth: '3px',
                  borderBottomWidth: '3px',
                  borderColor: 'accent'
                } : {}}
                aria-label={`Select ${lang.nativeName}`}
              >
                {/* Language Character Badge */}
                <div
                  className={`
                    w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                    rounded-full flex items-center justify-center 
                    font-semibold text-lg sm:text-xl lg:text-2xl
                    mb-3 mx-auto
                    ${statusBadgeBgColors[lang.color] || statusBadgeBgColors.darkblue}
                  `}
                  style={{
                    color: statusBadgeColorHex[lang.color] || statusBadgeColorHex.darkblue
                  }}
                >
                  {lang.firstLetter}
                </div>

                {/* Language Name */}
                <p className="text-sm sm:text-base font-medium text-secondary text-center">
                  {isDefault && isSelected
                    ? `${lang.nativeName} (Default)`
                    : lang.nativeName
                  }
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

