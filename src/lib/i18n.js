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
// Import account translations for all languages
import enAccount from '../locales/en/account.json';
import hiAccount from '../locales/hi/account.json';
import guAccount from '../locales/gu/account.json';
import bnAccount from '../locales/bn/account.json';
import taAccount from '../locales/ta/account.json';
import mrAccount from '../locales/mr/account.json';
import teAccount from '../locales/te/account.json';
import knAccount from '../locales/kn/account.json';
import mlAccount from '../locales/ml/account.json';
import urAccount from '../locales/ur/account.json';
import rajAccount from '../locales/raj/account.json';
import bhoAccount from '../locales/bho/account.json';
import asAccount from '../locales/as/account.json';
import hryAccount from '../locales/hry/account.json';

// Import businessCard translations for all languages
import enBusinessCard from '../locales/en/businessCard.json';
import hiBusinessCard from '../locales/hi/businessCard.json';
import guBusinessCard from '../locales/gu/businessCard.json';
import bnBusinessCard from '../locales/bn/businessCard.json';
import taBusinessCard from '../locales/ta/businessCard.json';
import mrBusinessCard from '../locales/mr/businessCard.json';
import teBusinessCard from '../locales/te/businessCard.json';
import knBusinessCard from '../locales/kn/businessCard.json';
import mlBusinessCard from '../locales/ml/businessCard.json';
import urBusinessCard from '../locales/ur/businessCard.json';
import rajBusinessCard from '../locales/raj/businessCard.json';
import bhoBusinessCard from '../locales/bho/businessCard.json';
import asBusinessCard from '../locales/as/businessCard.json';
import hryBusinessCard from '../locales/hry/businessCard.json';

// Import referEarn translations for all languages
import enReferEarn from '../locales/en/referEarn.json';
import hiReferEarn from '../locales/hi/referEarn.json';
import guReferEarn from '../locales/gu/referEarn.json';
import bnReferEarn from '../locales/bn/referEarn.json';
import taReferEarn from '../locales/ta/referEarn.json';
import mrReferEarn from '../locales/mr/referEarn.json';
import teReferEarn from '../locales/te/referEarn.json';
import knReferEarn from '../locales/kn/referEarn.json';
import mlReferEarn from '../locales/ml/referEarn.json';
import urReferEarn from '../locales/ur/referEarn.json';
import rajReferEarn from '../locales/raj/referEarn.json';
import bhoReferEarn from '../locales/bho/referEarn.json';
import asReferEarn from '../locales/as/referEarn.json';
import hryReferEarn from '../locales/hry/referEarn.json';
// Import siteInventory translations for all languages
import enSiteInventory from '../locales/en/siteInventory.json';
import hiSiteInventory from '../locales/hi/siteInventory.json';
import guSiteInventory from '../locales/gu/siteInventory.json';
import bnSiteInventory from '../locales/bn/siteInventory.json';
import taSiteInventory from '../locales/ta/siteInventory.json';
import mrSiteInventory from '../locales/mr/siteInventory.json';
import teSiteInventory from '../locales/te/siteInventory.json';
import knSiteInventory from '../locales/kn/siteInventory.json';
import mlSiteInventory from '../locales/ml/siteInventory.json';
import urSiteInventory from '../locales/ur/siteInventory.json';
import rajSiteInventory from '../locales/raj/siteInventory.json';
import bhoSiteInventory from '../locales/bho/siteInventory.json';
import asSiteInventory from '../locales/as/siteInventory.json';
import hrySiteInventory from '../locales/hry/siteInventory.json';

// Import subscription translations for all languages
import enSubscription from '../locales/en/subscription.json';
import hiSubscription from '../locales/hi/subscription.json';
import guSubscription from '../locales/gu/subscription.json';
import bnSubscription from '../locales/bn/subscription.json';
import taSubscription from '../locales/ta/subscription.json';
import mrSubscription from '../locales/mr/subscription.json';
import teSubscription from '../locales/te/subscription.json';
import knSubscription from '../locales/kn/subscription.json';
import mlSubscription from '../locales/ml/subscription.json';
import urSubscription from '../locales/ur/subscription.json';
import rajSubscription from '../locales/raj/subscription.json';
import bhoSubscription from '../locales/bho/subscription.json';
import asSubscription from '../locales/as/subscription.json';
import hrySubscription from '../locales/hry/subscription.json';

// Get saved language from localStorage or default to 'en'
const savedLang = localStorage.getItem('lang') || 'en';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    projects: enProjects,
    account: enAccount,
    businessCard: enBusinessCard,
    referEarn: enReferEarn,
    siteInventory: enSiteInventory,
    subscription: enSubscription,
  },
  hi: {
    common: hiCommon,
    auth: hiAuth,
    dashboard: hiDashboard,
    projects: hiProjects,
    account: hiAccount,
    businessCard: hiBusinessCard,
    referEarn: hiReferEarn,
    siteInventory: hiSiteInventory,
    subscription: hiSubscription,
  },
  gu: {
    common: guCommon,
    auth: guAuth,
    dashboard: guDashboard,
    projects: guProjects,
    account: guAccount,
    businessCard: guBusinessCard,
    referEarn: guReferEarn,
    siteInventory: guSiteInventory,
    subscription: guSubscription,
  },
  bn: {
    common: bnCommon,
    auth: bnAuth,
    dashboard: bnDashboard,
    projects: bnProjects,
    account: bnAccount,
    businessCard: bnBusinessCard,
    referEarn: bnReferEarn,
    siteInventory: bnSiteInventory,
    subscription: bnSubscription,
  },
  ta: {
    common: taCommon,
    auth: taAuth,
    dashboard: taDashboard,
    projects: taProjects,
    account: taAccount,
    businessCard: taBusinessCard,
    referEarn: taReferEarn,
    siteInventory: taSiteInventory,
    subscription: taSubscription,
  },
  mr: {
    common: mrCommon,
    auth: mrAuth,
    dashboard: mrDashboard,
    projects: mrProjects,
    account: mrAccount,
    businessCard: mrBusinessCard,
    referEarn: mrReferEarn,
    siteInventory: mrSiteInventory,
    subscription: mrSubscription,
  },
  te: {
    common: teCommon,
    auth: teAuth,
    dashboard: teDashboard,
    projects: teProjects,
    account: teAccount,
    businessCard: teBusinessCard,
    referEarn: teReferEarn,
    siteInventory: teSiteInventory,
    subscription: teSubscription,
  },
  kn: {
    common: knCommon,
    auth: knAuth,
    dashboard: knDashboard,
    projects: knProjects,
    account: knAccount,
    businessCard: knBusinessCard,
    referEarn: knReferEarn,
    siteInventory: knSiteInventory,
    subscription: knSubscription,
  },
  ml: {
    common: mlCommon,
    auth: mlAuth,
    dashboard: mlDashboard,
    projects: mlProjects,
    account: mlAccount,
    businessCard: mlBusinessCard,
    referEarn: mlReferEarn,
    siteInventory: mlSiteInventory,
    subscription: mlSubscription,
  },
  ur: {
    common: urCommon,
    auth: urAuth,
    dashboard: urDashboard,
    projects: urProjects,
    account: urAccount,
    businessCard: urBusinessCard,
    referEarn: urReferEarn,
    siteInventory: urSiteInventory,
    subscription: urSubscription,
  },
  raj: {
    common: rajCommon,
    auth: rajAuth,
    dashboard: rajDashboard,
    projects: rajProjects,
    account: rajAccount,
    businessCard: rajBusinessCard,
    referEarn: rajReferEarn,
    siteInventory: rajSiteInventory,
    subscription: rajSubscription,
  },
  bho: {
    common: bhoCommon,
    auth: bhoAuth,
    dashboard: bhoDashboard,
    projects: bhoProjects,
    account: bhoAccount,
    businessCard: bhoBusinessCard,
    referEarn: bhoReferEarn,
    siteInventory: bhoSiteInventory,
    subscription: bhoSubscription,
  },
  as: {
    common: asCommon,
    auth: asAuth,
    dashboard: asDashboard,
    projects: asProjects,
    account: asAccount,
    businessCard: asBusinessCard,
    referEarn: asReferEarn,
    siteInventory: asSiteInventory,
    subscription: asSubscription,
  },
  hry: {
    common: hryCommon,
    auth: hryAuth,
    dashboard: hryDashboard,
    projects: hryProjects,
    account: hryAccount,
    businessCard: hryBusinessCard,
    referEarn: hryReferEarn,
    siteInventory: hrySiteInventory,
    subscription: hrySubscription,
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
    ns: ['common', 'auth', 'dashboard', 'account', 'businessCard', 'siteInventory', 'referEarn', 'subscription'],
  });

export default i18n;

