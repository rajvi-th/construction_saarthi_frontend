/**
 * Dropdown Component
 * Clean, reusable and production-ready with Add New support
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import AddItemModal from './AddItemModal';

export default function Dropdown({
  options: externalOptions = [],
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  disabled = false,
  className = '',
  error,
  showSeparator = false,
  addButtonLabel = 'Add New',
  onAddNew,
  renderOption,
  customButton,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [internalOptions, setInternalOptions] = useState([]);
  const dropdownRef = useRef(null);

  // Merge external + internal options
  const options = [...externalOptions, ...internalOptions];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (option) => {
    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}

      {customButton ? (
        customButton(isOpen, setIsOpen)
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-2.5 rounded-lg border bg-white text-left flex items-center justify-between
            transition-colors focus:outline-none
            ${error ? "border-red-500" : "border-gray-300 focus:border-black/30"}
            ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:border-gray-400"}
          `}
        >
          <span className={selectedOption ? "" : "text-gray-400"}>
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto px-2 py-2">
          {options.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No options available
            </div>
          )}

          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full px-4 py-2 rounded-xl text-left text-sm transition-colors 
                         hover:bg-gray-100 cursor-pointer"
            >
              {renderOption ? renderOption(option, value === option.value) : option.label}
            </button>
          ))}

          {showSeparator && (
            <>
              <div className="border-t border-gray-200 my-2"></div>

              {onAddNew && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
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

      {/* Add Item Modal */}
      {onAddNew && (
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

            // Call onAddNew callback - parent handles adding to state
            // If onAddNew is provided, parent manages the state, so don't add to internal
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

            // Select the newly added option
            onChange?.(newOption.value);
          }}
          title={`Add ${addButtonLabel.replace('Add ', '')}`}
          placeholder={`Enter ${addButtonLabel.replace('Add ', '').toLowerCase()} name`}
          label="Name"
        />
      )}
    </div>
  );
}
