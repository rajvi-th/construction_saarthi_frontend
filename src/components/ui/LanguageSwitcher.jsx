/**
 * Language Switcher Component
 * Uses Dropdown component with custom rendering for language badges
 */

import { useTranslation } from 'react-i18next';
import i18n from '../../lib/i18n';
import { Globe, ChevronDown } from 'lucide-react';
import Dropdown from './Dropdown';
import { statusBadgeBgColors, statusBadgeColorHex } from "./StatusBadge";

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
  { code: 'raj', name: 'Rajasthani', nativeName: 'राजस्थानी', firstLetter: 'र', color: 'red' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', firstLetter: 'भ', color: 'green' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', firstLetter: 'অ', color: 'blue' },
  { code: 'hry', name: 'Haryanvi', nativeName: 'हरियाणवी', firstLetter: 'ह', color: 'purple' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { i18n: i18nInstance } = useTranslation();
  const currentLanguage = i18nInstance.language || 'en';
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  // Convert languages to dropdown options format and sort so selected language appears first
  const options = languages
    .map(lang => ({
      value: lang.code,
      label: lang.nativeName,
      ...lang // Include all language properties
    }))
    .sort((a, b) => {
      // Put selected language first
      if (a.value === currentLanguage) return -1;
      if (b.value === currentLanguage) return 1;
      return 0;
    });

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('lang', langCode);
  };

  // Custom button renderer
  const customButton = (isOpen, setIsOpen) => (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer"
      aria-label="Change Language"
    >
      <Globe className="w-4 h-4 text-secondary flex-shrink-0" />

      {/* Circular badge with first letter */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${statusBadgeBgColors[currentLang.color] || statusBadgeBgColors.red}`}
        style={{ color: statusBadgeColorHex[currentLang.color] || statusBadgeColorHex.red }}
      >
        {currentLang.firstLetter}
      </div>

      <span className="text-sm font-medium text-primary">{currentLang.nativeName}</span>

      <ChevronDown
        className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""
          }`}
      />
    </button>
  );

  // Custom option renderer
  const renderOption = (option, isActive) => {
    const lang = languages.find(l => l.code === option.value);
    if (!lang) return option.label;

    return (
      <div className="flex items-center gap-3 w-full cursor-pointer">
        {/* Circular badge with first letter */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${statusBadgeBgColors[lang.color] || statusBadgeBgColors.red}`}
          style={{ color: statusBadgeColorHex[lang.color] || statusBadgeColorHex.red }}
        >
          {lang.firstLetter}
        </div>

        {/* Language name */}
        <span
          className="flex-1 text-left text-sm"
          style={{
            color: isActive
              ? "text-primary font-bold" 
              : "text-secondary font-medium"                         
          }}
        >
          {lang.nativeName}
        </span>


        {/* Red dot indicator for active language */}
        {isActive && (
          <div
            className="w-2 h-2 rounded-full flex-shrink-0 bg-accent"
          ></div>
        )}
      </div>
    );
  };

  return (
    <Dropdown
      className={className}
      options={options}
      value={currentLanguage}
      onChange={handleLanguageChange}
      customButton={customButton}
      renderOption={renderOption}
    />
  );
}
