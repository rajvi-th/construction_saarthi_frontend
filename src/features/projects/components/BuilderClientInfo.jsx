/**
 * Builder Client Information Component
 * Reusable component for displaying builder/client information
 */

import { useTranslation } from 'react-i18next';
import { User, Phone, Building } from 'lucide-react';

export default function BuilderClientInfo({ project }) {
  const { t } = useTranslation('projects');

  const hasInfo = project.builder_name || project.contact_number || project.builder_company;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="text-[20px] font-medium text-primary mb-3">
        {t('projectDetails.builderClientInfo')}
      </h3>
      <div className="space-y-3">
        {project.builder_name && (
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#4755690A] border border-[#4755690A] flex items-center justify-center">
              <User className="w-4 h-4 text-accent" />
            </span>
            <span className="text-primary">{project.builder_name}</span>
          </div>
        )}
        {project.contact_number && (
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#4755690A] border border-[#4755690A] flex items-center justify-center">
              <Phone className="w-4 h-4 text-accent" />
            </span>
            <span className="text-primary">{project.contact_number}</span>
          </div>
        )}
        {project.builder_company && (
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#4755690A] border border-[#4755690A] flex items-center justify-center">
              <Building className="w-4 h-4 text-accent" />
            </span>
            <span className="text-primary">{project.builder_company}</span>
          </div>
        )}
        {!hasInfo && (
          <p className="text-secondary">{t('projectDetails.noBuilderInfo')}</p>
        )}
      </div>
    </div>
  );
}

