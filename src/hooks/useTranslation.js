/**
 * Custom translation hook
 * Wrapper around react-i18next's useTranslation hook for convenience
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  return {
    t, // Translation function
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage.bind(i18n),
  };
};

export default useTranslation;

