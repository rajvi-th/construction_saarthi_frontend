/**
 * i18n Configuration
 * Enterprise-level multilingual support
 * Loads language from localStorage ("lang")
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import common translations for all languages
import enCommon from '../locales/en/common.json';
import hiCommon from '../locales/hi/common.json';
import guCommon from '../locales/gu/common.json';
import bnCommon from '../locales/bn/common.json';
import taCommon from '../locales/ta/common.json';
import mrCommon from '../locales/mr/common.json';
import teCommon from '../locales/te/common.json';
import knCommon from '../locales/kn/common.json';
import mlCommon from '../locales/ml/common.json';
import urCommon from '../locales/ur/common.json';
import rajCommon from '../locales/raj/common.json';
import bhoCommon from '../locales/bho/common.json';
import asCommon from '../locales/as/common.json';
import hryCommon from '../locales/hry/common.json';

// Import auth translations for all languages
import enAuth from '../locales/en/auth.json';
import hiAuth from '../locales/hi/auth.json';
import guAuth from '../locales/gu/auth.json';
import bnAuth from '../locales/bn/auth.json';
import taAuth from '../locales/ta/auth.json';
import mrAuth from '../locales/mr/auth.json';
import teAuth from '../locales/te/auth.json';
import knAuth from '../locales/kn/auth.json';
import mlAuth from '../locales/ml/auth.json';
import urAuth from '../locales/ur/auth.json';
import rajAuth from '../locales/raj/auth.json';
import bhoAuth from '../locales/bho/auth.json';
import asAuth from '../locales/as/auth.json';
import hryAuth from '../locales/hry/auth.json';

// Get saved language from localStorage or default to 'en'
const savedLang = localStorage.getItem('lang') || 'en';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
  },
  hi: {
    common: hiCommon,
    auth: hiAuth,
  },
  gu: {
    common: guCommon,
    auth: guAuth,
  },
  bn: {
    common: bnCommon,
    auth: bnAuth,
  },
  ta: {
    common: taCommon,
    auth: taAuth,
  },
  mr: {
    common: mrCommon,
    auth: mrAuth,
  },
  te: {
    common: teCommon,
    auth: teAuth,
  },
  kn: {
    common: knCommon,
    auth: knAuth,
  },
  ml: {
    common: mlCommon,
    auth: mlAuth,
  },
  ur: {
    common: urCommon,
    auth: urAuth,
  },
  raj: {
    common: rajCommon,
    auth: rajAuth,
  },
  bho: {
    common: bhoCommon,
    auth: bhoAuth,
  },
  as: {
    common: asCommon,
    auth: asAuth,
  },
  hry: {
    common: hryCommon,
    auth: hryAuth,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: savedLang,
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    defaultNS: 'common',
    ns: ['common', 'auth'],
  });

export default i18n;

