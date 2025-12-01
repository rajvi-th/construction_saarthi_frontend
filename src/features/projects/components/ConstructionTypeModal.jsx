/**
 * ConstructionTypeModal Component
 * Modal for adding new construction type with floors requirement option
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Radio from '../../../components/ui/Radio';

export default function ConstructionTypeModal({
  isOpen,
  onClose,
  onSave,
}) {
  const [constructionType, setConstructionType] = useState('');
  const [requiresFloors, setRequiresFloors] = useState('yes');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setConstructionType('');
      setRequiresFloors('yes');
      setError('');
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

  const handleInputChange = (value) => {
    setConstructionType(value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSave = () => {
    if (!constructionType.trim()) {
      setError('Construction type is required');
      return;
    }

    // Call onSave with construction type data
    onSave({
      label: constructionType.trim(),
      value: constructionType.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      requiresFloors: requiresFloors === 'yes',
    });

    // Reset form
    setConstructionType('');
    setRequiresFloors('yes');
    setError('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && constructionType.trim()) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={handleKeyPress}
    >
      <div className="bg-white rounded-[12px] shadow-xl w-full max-w-md my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-semibold text-primary">Add New Construction Type</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-4">
          {/* Construction Type Input */}
          <div className="mb-6">
            <Input
              label="Construction Type"
              placeholder="Enter construction type"
              value={constructionType}
              onChange={(e) => handleInputChange(e.target.value)}
              error={error}
              autoFocus
            />
          </div>

          {/* Does this type require floors? */}
          <div>
            <p className="block text-sm font-medium text-primary mb-3">
              Does this type require floors?
            </p>
            <div className="flex items-center gap-6">
              <Radio
                name="requiresFloors"
                value="yes"
                label="Yes"
                checked={requiresFloors === 'yes'}
                onChange={() => setRequiresFloors('yes')}
              />
              <Radio
                name="requiresFloors"
                value="no"
                label="No"
                checked={requiresFloors === 'no'}
                onChange={() => setRequiresFloors('no')}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pb-5 px-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!constructionType.trim()}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

