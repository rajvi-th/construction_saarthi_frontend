/**
 * Project Documents Page
 * Shows document categories for a specific project
 */

import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import PageHeader from '../../../components/layout/PageHeader';
import aiPoweredIcon from '../../../assets/icons/aipowered.svg';

// Static project names mapping
const staticProjectNames = {
  '1': 'Shiv Residency, Bopal',
  '2': 'Nirmaan Homes, Surat',
  '3': 'Shivaay Homes, Rajasthan',
  '4': 'Shree Villa, Surat',
  '5': 'Shiv Residency, Bopal',
  '6': 'Nirmaan Homes, Surat',
  '7': 'Shiv Residency, Bopal',
};

export default function ProjectDocuments() {
  const { t } = useTranslation('documents');
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const projectName = staticProjectNames[projectId] || t('project');

  const [expandedCategories, setExpandedCategories] = useState({
    preConstruction: true,
    procurement: true,
    safety: true,
    financial: true,
    handover: true,
  });

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleDocumentClick = (documentId) => {
    navigate(getRoute(ROUTES_FLAT.DOCUMENTS_DOCUMENT_DETAILS, { projectId, documentId }));
  };

  const documentCategories = useMemo(() => [
    {
      id: 'preConstruction',
      title: t('categories.preConstruction'),
      documents: [
        {
          id: 'proposal',
          name: t('documents.proposal'),
          description: t('documents.proposalDescription'),
        },
        {
          id: 'approval',
          name: t('documents.approval'),
          description: t('documents.approvalDescription'),
        },
      ],
    },
    {
      id: 'procurement',
      title: t('categories.procurement'),
      documents: [
        {
          id: 'material',
          name: t('documents.material'),
          description: t('documents.materialDescription'),
        },
        {
          id: 'vendor',
          name: t('documents.vendor'),
          description: t('documents.vendorDescription'),
        },
      ],
    },
    {
      id: 'safety',
      title: t('categories.safety'),
      documents: [
        {
          id: 'safety',
          name: t('documents.safety'),
          description: t('documents.safetyDescription'),
        },
      ],
    },
    {
      id: 'financial',
      title: t('categories.financial'),
      documents: [
        {
          id: 'raBill',
          name: t('documents.raBill'),
          description: t('documents.raBillDescription'),
        },
        {
          id: 'finalBill',
          name: t('documents.finalBill'),
          description: t('documents.finalBillDescription'),
        },
      ],
    },
    {
      id: 'handover',
      title: t('categories.handover'),
      documents: [
        {
          id: 'completion',
          name: t('documents.completion'),
          description: t('documents.completionDescription'),
        },
        {
          id: 'maintenance',
          name: t('documents.maintenance'),
          description: t('documents.maintenanceDescription'),
        },
      ],
    },
  ], [t]);

  return (
    <div className="max-w-7xl mx-auto relative">
      <PageHeader
        title={projectName}
        onBack={() => navigate(ROUTES_FLAT.DOCUMENTS)}
      />

      {/* AI Powered Badge - Fixed on right side */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-10 block">
        <img src={aiPoweredIcon} alt="AI Powered" className="h-9 cursor-pointer" />
      </div>

      {/* Document Categories */}
      <div className="space-y-4 mt-6">
        {documentCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-4 sm:px-6 py-4 flex items-center justify-between cursor-pointer"
            >
              <h3 className="text-base sm:text-lg font-medium text-primary">
                {category.title}
              </h3>
              {expandedCategories[category.id] ? (
                <ChevronUp className="w-5 h-5 text-secondary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-secondary" />
              )}
            </button>

            {/* Category Documents */}
            {expandedCategories[category.id] && (
              <div className="px-4 sm:px-6 pb-4 space-y-3">
                {category.documents.map((document) => (
                  <div
                    key={document.id}
                    onClick={() => handleDocumentClick(document.id)}
                    className="bg-white rounded-lg p-4 border border-gray-200 flex items-start gap-3 relative cursor-pointer"
                  >
                    {/* Red vertical bar - Vector element */}
                    <div className="w-1 h-6 bg-accent rounded-full absolute left-0 top-3 bottom-4"></div>
                    <div className="flex-1 pl-3">
                      <h4 className="text-sm sm:text-base font-medium text-primary mb-1">
                        {document.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-secondary">
                        {document.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

