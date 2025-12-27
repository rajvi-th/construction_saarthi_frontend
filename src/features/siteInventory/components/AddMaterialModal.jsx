import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../hooks/useAuth';
import { useUnits } from '../hooks';

export default function AddMaterialModal({
  isOpen,
  onClose,
  onSave,
  materialType,
  t: tProp, // Keep for backward compatibility but don't use
}) {
  const { t } = useTranslation('siteInventory');
  // Always use hook translation to ensure correct namespace and language
  const { selectedWorkspace } = useAuth();
  const { unitOptions, isLoadingUnits, createNewUnit, refetch: refetchUnits } = useUnits(selectedWorkspace);
  const [itemName, setItemName] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setItemName('');
      setSelectedUnit('');
      setErrors({});
      refetchUnits();
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
  }, [isOpen, refetchUnits]);

  const handleAddNewUnit = async (newUnit) => {
    try {
      const newOption = await createNewUnit(newUnit);
      // Select the newly created unit
      setSelectedUnit(newOption.value);
      return newOption;
    } catch (error) {
      // Error is already handled in the hook
      throw error;
    }
  };

  const handleUnitSelect = (value) => {
    setSelectedUnit(value);
    if (errors.unit) {
      setErrors((prev) => ({ ...prev, unit: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!itemName.trim()) {
      newErrors.itemName = t('addNewAsk.errors.itemNameRequired', { defaultValue: 'Item name is required' });
    }
    
    if (!selectedUnit) {
      newErrors.unit = t('addNewAsk.errors.unitRequired', { defaultValue: 'Unit is required' });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    
    try {
      // Find the selected unit label
      const selectedUnitOption = unitOptions.find((u) => u.value === selectedUnit);
      const unitLabel = selectedUnitOption?.label || selectedUnit;

      // Call onSave with the material data
      await onSave({
        label: itemName.trim(),
        name: itemName.trim(),
        unit: unitLabel,
        unitId: selectedUnit,
        type: materialType,
      });
      
      setItemName('');
      setSelectedUnit('');
      onClose();
    } catch (error) {
      console.error('Error saving material:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isSaving) {
      onClose();
      setItemName('');
      setSelectedUnit('');
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg my-auto">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="text-2xl font-medium text-primary">
            {t('addNewAsk.addNewMaterial', { defaultValue: 'Add New Material' })}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="transition-colors cursor-pointer"
            disabled={isSaving}
          >
            <X className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          {/* Item Name */}
          <div>
            <Input
              label={t('addNewAsk.name', { defaultValue: 'Name' })}
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                if (errors.itemName) {
                  setErrors((prev) => ({ ...prev, itemName: '' }));
                }
              }}
              placeholder={t('addNewAsk.materialNamePlaceholder', { defaultValue: 'Enter new material name' })}
              required
              error={errors.itemName}
              disabled={isSaving}
              autoFocus
            />
          </div>

          {/* Unit */}
          <div>
            <Dropdown
              label={t('addNewAsk.unit', { defaultValue: 'Unit' })}
              options={unitOptions}
              value={selectedUnit}
              onChange={handleUnitSelect}
              placeholder={t('addNewAsk.unitPlaceholder', { defaultValue: 'Select Unit' })}
              error={errors.unit}
              className="w-full"
              showSeparator={true}
              addButtonLabel={t('addNewAsk.addNewUnit', { defaultValue: 'Add New Unit' })}
              onAddNew={handleAddNewUnit}
              disabled={isLoadingUnits || isSaving}
              addModalPlaceholder={t('addNewAsk.unitNamePlaceholder', { defaultValue: 'Enter unit name' })}
              addModalLabel={t('addNewAsk.unitName', { defaultValue: 'Unit Name' })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
            {t('addNewAsk.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving || !itemName.trim() || !selectedUnit}>
            {isSaving
              ? t('addNewAsk.adding', { defaultValue: 'Adding...' })
              : t('addNewAsk.add', { defaultValue: 'Add' })}
          </Button>
        </div>
      </div>
    </div>
  );
}

