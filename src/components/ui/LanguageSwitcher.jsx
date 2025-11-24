/**
 * Language Switcher Component
 * Dropdown to switch between available languages
 */

import { useTranslation } from 'react-i18next';
import i18n from '../../lib/i18n';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'raj', name: 'Rajasthani', nativeName: 'राजस्थानी' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'hry', name: 'Haryanvi', nativeName: 'हरियाणवी' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { i18n: i18nInstance } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = i18nInstance.language || 'en';
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('lang', langCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Change Language"
      >
        <Globe className="w-4 h-4 text-secondary" />
        <span className="text-sm font-medium text-primary">{currentLang.nativeName}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-80 overflow-y-auto">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    w-full text-left px-4 py-2 text-sm transition-colors
                    ${currentLanguage === lang.code
                      ? 'bg-accent text-white font-medium'
                      : 'text-primary hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{lang.nativeName}</span>
                    {currentLanguage === lang.code && (
                      <span className="text-white">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

