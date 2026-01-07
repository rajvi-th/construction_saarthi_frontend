/**
 * Report Card Component for DPR
 * Displays individual report information in a card format
 */

import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

export default function ReportCard({ report, onClick }) {
  const { t } = useTranslation('dpr');

  const title = report.title || report.description || 'Untitled Report';
  const date = report.date || report.created_at || '';

  // Format date if it's a string
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[16px] shadow-sm cursor-pointer p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-primary line-clamp-2">
            {title}
          </h3>
          {formattedDate && (
            <p className="mt-1 text-sm text-[#060C1280]">
              {formattedDate}
            </p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-[#060C1280] flex-shrink-0" />
      </div>
    </div>
  );
}

