/**
 * ContractTypeModal Component
 * Modal for adding new contract type
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function ContractTypeModal({
  isOpen,
  onClose,
  onSave,
}) {
  const [contractType, setContractType] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setContractType('');
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
    setContractType(value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSave = () => {
    if (!contractType.trim()) {
      setError('Contract type is required');
      return;
    }

    // Call onSave with contract type data
    onSave({
      label: contractType.trim(),
      value: contractType.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    });

    // Reset form
    setContractType('');
    setError('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && contractType.trim()) {
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-semibold text-primary">Add New Contract Type</h3>
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
          {/* Contract Type Input */}
          <div>
            <Input
              label="Contract Type"
              placeholder="Enter contract type"
              value={contractType}
              onChange={(e) => handleInputChange(e.target.value)}
              error={error}
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pb-5 px-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!contractType.trim()}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

