/**
 * Pagination Component
 * Reusable pagination component with items per page selector and page navigation
 */

import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Dropdown from './Dropdown';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 5,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20, 50],
  showItemsPerPage = true,
  showPageInfo = true,
  t: customT,
}) {
  const { t } = useTranslation('common');
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
      // Reset to first page when items per page changes
      if (onPageChange) {
        onPageChange(1);
      }
    }
  };

  // Don't render if no items
  if (totalItems === 0) {
    return null;
  }

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with smart pagination
      if (currentPage <= 3) {
        // Show first 5 pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Show last 5 pages
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show pages around current
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
      {/* Left: Items per page selector */}
      {showItemsPerPage && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">
            {t('pagination.show', { defaultValue: 'Show' })}
          </span>
          <Dropdown
            options={itemsPerPageOptions.map((option) => ({
              value: option,
              label: option.toString(),
            }))}
            value={itemsPerPage}
            onChange={(value) => handleItemsPerPageChange(Number(value))}
            placeholder={itemsPerPage.toString()}
            className="w-auto"
            position="top"
            customButton={(isOpen, setIsOpen) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
                className="px-3 py-1.5 border border-black-soft rounded-lg text-sm text-primary bg-white focus:outline-none cursor-pointer hover:border-gray-400 transition-colors flex items-center justify-between gap-2 min-w-[60px]"
              >
                <span>{itemsPerPage}</span>
                <ChevronDown
                  className={`w-4 h-4 text-secondary transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          />
          <span className="text-sm text-secondary">
            {t('pagination.perPage', { defaultValue: 'per page' })}
          </span>
        </div>
      )}

      {/* Right: Page navigation */}
      {totalPages > 0  && (
        <div className="flex items-center gap-2">
           {/* Page info */}
           {showPageInfo && (
            <span className="text-sm text-secondary ml-2 whitespace-nowrap">
              {startIndex + 1}-{Math.min(endIndex, totalItems)}{' '}
              {t('pagination.of', { defaultValue: 'of' })} {totalItems}
            </span>
          )}
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-black-soft disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Previous page"
          >
            <ArrowLeft className="w-4 h-4 text-secondary" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {visiblePages.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? 'text-primary border border-black-soft'
                    : 'text-secondary hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-black-soft disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Next page"
          >
            <ArrowLeft className="w-4 h-4 text-secondary rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}

