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

// Import dashboard translations for all languages
import enDashboard from '../locales/en/dashboard.json';
import hiDashboard from '../locales/hi/dashboard.json';
import guDashboard from '../locales/gu/dashboard.json';
import bnDashboard from '../locales/bn/dashboard.json';
import taDashboard from '../locales/ta/dashboard.json';
import mrDashboard from '../locales/mr/dashboard.json';
import teDashboard from '../locales/te/dashboard.json';
import knDashboard from '../locales/kn/dashboard.json';
import mlDashboard from '../locales/ml/dashboard.json';
import urDashboard from '../locales/ur/dashboard.json';
import rajDashboard from '../locales/raj/dashboard.json';
import bhoDashboard from '../locales/bho/dashboard.json';
import asDashboard from '../locales/as/dashboard.json';
import hryDashboard from '../locales/hry/dashboard.json';

// Import projects translations for all languages
import enProjects from '../locales/en/projects.json';
import hiProjects from '../locales/hi/projects.json';
import guProjects from '../locales/gu/projects.json';
import bnProjects from '../locales/bn/projects.json';
import taProjects from '../locales/ta/projects.json';
import mrProjects from '../locales/mr/projects.json';
import teProjects from '../locales/te/projects.json';
import knProjects from '../locales/kn/projects.json';
import mlProjects from '../locales/ml/projects.json';
import urProjects from '../locales/ur/projects.json';
import rajProjects from '../locales/raj/projects.json';
import bhoProjects from '../locales/bho/projects.json';
import asProjects from '../locales/as/projects.json';
import hryProjects from '../locales/hry/projects.json';

// Get saved language from localStorage or default to 'en'
const savedLang = localStorage.getItem('lang') || 'en';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    projects: enProjects,
  },
  hi: {
    common: hiCommon,
    auth: hiAuth,
    dashboard: hiDashboard,
    projects: hiProjects,
  },
  gu: {
    common: guCommon,
    auth: guAuth,
    dashboard: guDashboard,
    projects: guProjects,
  },
  bn: {
    common: bnCommon,
    auth: bnAuth,
    dashboard: bnDashboard,
    projects: bnProjects,
  },
  ta: {
    common: taCommon,
    auth: taAuth,
    dashboard: taDashboard,
    projects: taProjects,
  },
  mr: {
    common: mrCommon,
    auth: mrAuth,
    dashboard: mrDashboard,
    projects: mrProjects,
  },
  te: {
    common: teCommon,
    auth: teAuth,
    dashboard: teDashboard,
    projects: teProjects,
  },
  kn: {
    common: knCommon,
    auth: knAuth,
    dashboard: knDashboard,
    projects: knProjects,
  },
  ml: {
    common: mlCommon,
    auth: mlAuth,
    dashboard: mlDashboard,
    projects: mlProjects,
  },
  ur: {
    common: urCommon,
    auth: urAuth,
    dashboard: urDashboard,
    projects: urProjects,
  },
  raj: {
    common: rajCommon,
    auth: rajAuth,
    dashboard: rajDashboard,
    projects: rajProjects,
  },
  bho: {
    common: bhoCommon,
    auth: bhoAuth,
    dashboard: bhoDashboard,
    projects: bhoProjects,
  },
  as: {
    common: asCommon,
    auth: asAuth,
    dashboard: asDashboard,
    projects: asProjects,
  },
  hry: {
    common: hryCommon,
    auth: hryAuth,
    dashboard: hryDashboard,
    projects: hryProjects,
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
    ns: ['common', 'auth', 'dashboard', 'projects'],
  });

export default i18n;

