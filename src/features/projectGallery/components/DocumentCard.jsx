import { useTranslation } from 'react-i18next';
import { MoreVertical } from 'lucide-react';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import PdfIcon from '../../../assets/icons/Pdf.svg';

export default function DocumentCard({ document, onView, onDelete }) {
  const { t } = useTranslation('projectGallery');

  // Extract file name from URL
  const getFileName = () => {
    if (document.name) return document.name;
    if (document.fileName) return document.fileName;
    if (document.url) {
      const urlParts = document.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // Remove query parameters if any
      return fileName.split('?')[0] || 'Document';
    }
    return 'Document';
  };

  // Format file size (if available, otherwise show placeholder)
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return null;
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date and time (e.g., "26 Sep 2024 3:20 PM")
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const fileName = getFileName();
  const fileSize = formatFileSize(document.size || document.fileSize);
  const dateTime = formatDateTime(document.createdAt || document.date);

  const menuItems = [
    {
      label: t('actions.view', { defaultValue: 'View' }),
      onClick: () => {
        if (onView) onView(document);
        else if (document.url) window.open(document.url, '_blank');
      },
    },
    ...(onDelete ? [{
      label: t('actions.delete', { defaultValue: 'Delete' }),
      onClick: () => {
        if (onDelete) onDelete(document);
      },
      textColor: 'text-red-600',
    }] : []),
  ];

  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-4 border border-black-soft">
      {/* PDF Icon */}
      <div className="flex-shrink-0">
        <img src={PdfIcon} alt="PDF" className="w-12 h-12" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-primary truncate mb-1">
          {fileName}
        </h3>
        <p className="text-sm text-secondary">
          {fileSize && `${fileSize} • `}
          {dateTime}
        </p>
      </div>

      {/* Options Menu */}
      <div className="flex-shrink-0">
        <DropdownMenu
          items={menuItems}
          position="right"
          trigger={
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
              <MoreVertical className="w-5 h-5 text-secondary" />
            </button>
          }
        />
      </div>
    </div>
  );
}

