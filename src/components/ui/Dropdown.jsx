/**
 * Dropdown Component
 * Clean, reusable and production-ready with Add New support
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Plus, Search } from 'lucide-react';
import AddItemModal from './AddItemModal';
import BuilderFormModal from './BuilderFormModal';

export default function Dropdown({
  options: externalOptions = [],
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  disabled = false,
  className = '',
  error,
  required = false,
  showSeparator = false,
  addButtonLabel = 'Add New',
  onAddNew,
  renderOption,
  customButton,
  useBuilderModal = false,
  workspaceId = null,
  customModal: CustomModal = null,
  customModalProps = {},
  position = 'bottom', // 'top' or 'bottom'
  searchable = false, // Enable search functionality
  searchPlaceholder = 'Search...', // Placeholder for search input
}) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [internalOptions, setInternalOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Merge external + internal options
  const options = [...externalOptions, ...internalOptions];

  // Filter options based on search query
  const filteredOptions = searchable && searchQuery
    ? options.filter((option) =>
        option.label?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when dropdown opens and searchable is enabled
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (option) => {
    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-md text-black font-normal mb-1">
          {label}
          {required && <span>*</span>}
        </label>
      )}

      {customButton ? (
        customButton(isOpen, setIsOpen)
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-3 rounded-xl border bg-white text-sm text-left flex items-center justify-between
            transition-colors focus:outline-none
            ${error ? "border-red-500" : "border-gray-200 focus:border-black/30"}
            ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:border-gray-400"}
          `}
        >
          <span className={selectedOption ? "" : "text-secondary"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {isOpen && (
        <div className={`absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto ${
          position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}>
          {/* Search Input */}
          {searchable && (
            <div className="sticky top-0 bg-white border-b border-gray-200 px-2 py-2 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          <div className="px-2 py-2">
            {filteredOptions.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {searchQuery ? 'No results found' : 'No options available'}
              </div>
            )}

            {filteredOptions.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-4 py-2 rounded-xl text-left text-sm transition-colors cursor-pointer
                         ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                {renderOption ? renderOption(option, isSelected) : option.label}
              </button>
            );
            })}
          </div>

          {showSeparator && (
            <>
              <div className="border-t border-gray-200 my-2"></div>

              {onAddNew && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    // Always open modal (either CustomModal or default AddItemModal)
                    setIsModalOpen(true);
                  }}
                  className="w-full px-4 py-1 flex items-center gap-2 text-sm text-accent font-medium hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span>{addButtonLabel}</span>
                </button>
              )}
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {/* Custom Modal, Builder Form Modal, or Add Item Modal */}
      {onAddNew && CustomModal && isModalOpen ? (
        <CustomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data) => {
            // Custom modal handles its own data structure
            await onAddNew(data);
            setIsModalOpen(false);
          }}
          {...customModalProps}
        />
      ) : onAddNew && useBuilderModal ? (
        <BuilderFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          workspaceId={workspaceId}
          onSave={async (builderData) => {
            const tempOption = {
              value: `temp-${Date.now()}`,
              label: builderData.full_name || builderData.name,
            };
            
            // Parent will create builder and return the actual builder with ID
            await onAddNew(tempOption, builderData);
          }}
        />
      ) : onAddNew ? (
        <AddItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={async (label) => {
            const newOption = {
              value:
                label.toLowerCase().replace(/\s+/g, "-") +
                "-" +
                Date.now(),
              label,
            };

            if (onAddNew) {
              await onAddNew(newOption);
              // Parent is managing state, so don't add to internalOptions
            } else {
              // If no onAddNew callback, add to internal state
              const existsInInternal = internalOptions.some(
                (o) => o.value === newOption.value || o.label === newOption.label
              );
              if (!existsInInternal) {
                setInternalOptions((prev) => [...prev, newOption]);
              }
            }
            onChange?.(newOption.value);
          }}
          title={addButtonLabel || t('add', { defaultValue: 'Add New' })}
          placeholder={t('enterbankName', { defaultValue: 'Enter bank name' })}
          label={t('bankname', { defaultValue: 'Bank Name' })}
        />
      ) : null}
    </div>
  );
}
