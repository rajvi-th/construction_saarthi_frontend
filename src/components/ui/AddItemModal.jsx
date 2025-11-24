/**
 * AddItemModal Component
 * Modal for adding new items to dropdown
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export default function AddItemModal({
  isOpen,
  onClose,
  onSave,
  title = 'Add New Item',
  placeholder = 'Enter name',
  label = 'Name',
}) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(inputValue.trim());
      setInputValue('');
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <label className="block text-sm font-medium text-primary mb-2">
            {label}
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            autoFocus
            className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[rgba(6,12,18,0.3)] transition-colors"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!inputValue.trim()}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

