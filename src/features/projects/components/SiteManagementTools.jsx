/**
 * Site Management Tools Component
 * Only icons replaced with lucide-react (no layout or size changed)
 */

import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useWorkspaceRole } from '../../dashboard/hooks';

// lucide-react icons (matching your original features)
import {
  Wallet,           // finance
  Calculator,       // construction calculator
  Boxes,            // site inventory
  FileText,         // generate documents
  Users,            // labour sheet
  Image,            // gallery
  ClipboardList,    // dpr
  Mic               // notes (audio)
} from "lucide-react";

// Badge icon
import aiBadgeIcon from '../../../assets/icons/AI.svg';

export default function SiteManagementTools({ tools, onToolClick }) {
  const { t } = useTranslation('projects');
  const currentUserRole = useWorkspaceRole();

  // Replace ONLY icon property with lucide-react components
  const defaultTools = [
    {
      id: 'finance',
      label: t('projectDetails.tools.manageFinance'),
      icon: Wallet,
    },
    {
      id: 'calculator',
      label: t('projectDetails.tools.constructionCalculator'),
      icon: Calculator,
      hasAlert: true,
      alertIcon: aiBadgeIcon,
    },
    {
      id: 'inventory',
      label: t('projectDetails.tools.siteInventory'),
      icon: Boxes,
    },
    {
      id: 'documents',
      label: t('projectDetails.tools.generateDocuments'),
      icon: FileText,
      hasAlert: true,
      alertIcon: aiBadgeIcon,
    },
    {
      id: 'labour',
      label: t('projectDetails.tools.labourSheet'),
      icon: Users,
    },
    {
      id: 'gallery',
      label: t('projectDetails.tools.gallery'),
      icon: Image,
    },
    {
      id: 'dpr',
      label: t('projectDetails.tools.dailyProgressReport'),
      icon: ClipboardList,
    },
    {
      id: 'notes',
      label: t('projectDetails.tools.addNotes'),
      icon: Mic,
    },
  ];

  // Filter tools based on user role
  let toolsToDisplay = tools || defaultTools;
  
  // Hide specific tools for builder role: finance, inventory, labour, notes, documents
  if (currentUserRole?.toLowerCase() === 'builder') {
    const restrictedToolIds = ['finance', 'inventory', 'labour', 'notes', 'documents'];
    toolsToDisplay = toolsToDisplay.filter((tool) => !restrictedToolIds.includes(tool.id));
  }
  
  // Hide documents and finance tools for supervisor role
  if (currentUserRole?.toLowerCase() === 'supervisor') {
    toolsToDisplay = toolsToDisplay.filter((tool) => tool.id !== 'documents' && tool.id !== 'finance');
  }

  const renderIcon = (IconComponent) => {
    return (
      <IconComponent
        className="w-7 h-7 text-accent"
        strokeWidth={2.4}
      />
    );
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

SiteManagementTools.propTypes = {
  tools: PropTypes.array,
  onToolClick: PropTypes.func,
};
