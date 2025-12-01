/**
 * Site Management Tools Component
 * Reusable component for displaying site management tool cards
 */

import { useTranslation } from 'react-i18next';


import aiBadgeIcon from '../../../assets/icons/AI.svg';
import walletIcon from '../../../assets/icons/Wallet.svg';
import calculatorIcon from '../../../assets/icons/Calculator.svg';
import siteInventory from '../../../assets/icons/siteInventory.svg';
import document from '../../../assets/icons/document.svg';
import usersIcon from '../../../assets/icons/userRed.svg';
import galleryIcon from '../../../assets/icons/galleryRed.svg';
import dprIcon from '../../../assets/icons/dprRed.svg';
import audioIcon from '../../../assets/icons/audioRed.svg';

export default function SiteManagementTools({ tools, onToolClick }) {
  const { t } = useTranslation('projects');

  const defaultTools = [
    {
      id: 'finance',
      label: t('projectDetails.tools.manageFinance'),
      icon: walletIcon,
    },
    {
      id: 'calculator',
      label: t('projectDetails.tools.constructionCalculator'),
      icon: calculatorIcon,
      hasAlert: true,
      alertIcon: aiBadgeIcon,
    },
    {
      id: 'inventory',
      label: t('projectDetails.tools.siteInventory'),
      icon: siteInventory,
    },
    {
      id: 'documents',
      label: t('projectDetails.tools.generateDocuments'),
      icon: document,
      hasAlert: true,
      alertIcon: aiBadgeIcon,
    },
    {
      id: 'labour',
      label: t('projectDetails.tools.labourSheet'),
      icon: usersIcon,
    },
    {
      id: 'gallery',
      label: t('projectDetails.tools.gallery'),
      icon: galleryIcon,
    },
    {
      id: 'dpr',
      label: t('projectDetails.tools.dailyProgressReport'),
      icon: dprIcon,
    },
    {
      id: 'notes',
      label: t('projectDetails.tools.addNotes'),
      icon: audioIcon,
    },
  ];

  const toolsToDisplay = tools || defaultTools;

  const renderIcon = (icon) => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      // If icon is a string (e.g. imported SVG path), render it as an image
      return (
        <img
          src={icon}
          alt=""
          className="w-7 h-7 object-contain"
        />
      );
    }
    const IconComponent = icon;
    return <IconComponent className="w-6 h-6 text-accent" strokeWidth={2.4} />;
  };

  const renderAlertBadge = (tool) => {
    if (!tool.hasAlert) return null;

    if (tool.alertIcon) {
      return (
        <span className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-[#FFE2DA] flex items-center justify-center">
          <img src={tool.alertIcon} alt="AI badge" className="w-4 h-4 object-contain" />
        </span>
      );
    }

    return (
      <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-[10px] font-semibold">
        !
      </span>
    );
  };

  return (
    <div>
      <h3 className="text-[18px] sm:text-[20px] font-semibold text-primary mb-4 sm:mb-6">
        {t('projectDetails.siteManagementTools')}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {toolsToDisplay.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolClick?.(tool.id)}
            className="group relative rounded-[20px] bg-white border border-[#B02E0C0A] shadow-[1px_1px_4px_0_rgba(194,194,194,0.1)] hover:shadow-[1px_1px_6px_0_rgba(194,194,194,0.15)] transition-shadow px-3 py-4 sm:px-4 sm:py-5 flex flex-col items-center text-center gap-3 sm:gap-4 cursor-pointer"
          >
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F2F2F2] flex items-center justify-center transition-colors duration-200 group-hover:bg-[#F8E9E3]">
                {renderIcon(tool.icon)}
              </div>
            </div>
            {renderAlertBadge(tool)}
            <span className="text-[11px] xs:text-xs sm:text-sm md:text-base font-medium text-primary leading-snug line-clamp-2">
              {tool.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

