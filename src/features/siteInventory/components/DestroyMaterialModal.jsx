/**
 * DestroyMaterialModal Component
 * Modal for destroying material from inventory
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import NumberInput from '../../../components/ui/NumberInput';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import { useMaterials, useUnits, useInventoryTypes } from '../hooks';
import { useAuth } from '../../../hooks/useAuth';
import AddMaterialModal from './AddMaterialModal';

export default function DestroyMaterialModal({
  isOpen,
  onClose,
  onDestroy,
  projectId,
}) {
  const { t } = useTranslation('siteInventory');
  const { selectedWorkspace } = useAuth();
  
  const { inventoryTypeOptions, isLoading: isLoadingInventoryTypes } = useInventoryTypes();
  const [materialType, setMaterialType] = useState(null); // Dynamic inventory type ID
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Set default inventory type when options are loaded
  useEffect(() => {
    if (inventoryTypeOptions.length > 0 && !materialType) {
      setMaterialType(inventoryTypeOptions[0].value);
    }
  }, [inventoryTypeOptions, materialType]);

  // Use materialType directly as inventoryTypeId (it's already the ID)
  const inventoryTypeId = materialType;
  const { materials, materialOptions, isLoadingMaterials, createNewMaterial, refetch: refetchMaterials } = useMaterials(inventoryTypeId);
  const { unitOptions } = useUnits(selectedWorkspace);

  // Get unit name from selected material
  const selectedMaterialData = materials.find((m) => (m.id || m._id || m.materialId) === selectedMaterial);
  const materialUnitId = selectedMaterialData?.unitId;
  const unitOption = unitOptions.find((u) => u.value === materialUnitId);
  // Use unit from selected material or default
  const unit = unitOption?.label || selectedMaterialData?.unitName || 'piece';

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMaterial('');
      setQuantity('');
      setReason('');
      setErrors({});
      setMaterialType('reusable');
    }
  }, [isOpen]);

  // Fetch materials when modal opens
  useEffect(() => {
    if (isOpen) {
      refetchMaterials();
    }
  }, [isOpen, refetchMaterials]);

  useEffect(() => {
    if (isOpen) {
      // Prevent background scroll
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen]);

  const handleAddNewMaterial = async (materialData) => {
    try {
      const newOption = await createNewMaterial({
        ...materialData,
        type: materialType,
      });
      setSelectedMaterial(newOption.value);
      return newOption;
    } catch (error) {
      throw error;
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!selectedMaterial) {
      newErrors.material = t('destroyMaterialModal.errors.materialRequired', { defaultValue: 'Material is required' });
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
      newErrors.quantity = t('destroyMaterialModal.errors.quantityRequired', { defaultValue: 'Quantity is required' });
    }

    if (!reason || reason.trim() === '') {
      newErrors.reason = t('destroyMaterialModal.errors.reasonRequired', { defaultValue: 'Reason is required' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDestroy = async () => {
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      // Determine actual inventoryTypeId from selected material
      const actualInventoryTypeId = selectedMaterialData?.inventoryTypeId || inventoryTypeId;
      
      await onDestroy?.({
        materialId: selectedMaterial,
        materialName: selectedMaterialData?.name || selectedMaterialData?.materialName || '',
        quantity: parseFloat(quantity),
        reason: reason,
        unit: unit,
        inventoryTypeId: actualInventoryTypeId,
        projectId: projectId,
      });
      handleClose();
    } catch (error) {
      console.error('Error destroying material:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setSelectedMaterial('');
      setQuantity('');
      setReason('');
      setErrors({});
    }
  };

  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4">
          <h3 className="text-2xl font-medium text-primary">
            {t('destroyMaterialModal.title', { defaultValue: 'Destroy Material' })}
          </h3>
          <p className="text-base text-secondary mt-2">
            {t('destroyMaterialModal.subtitle', { defaultValue: 'Enter the quantity of material that has been damaged or discarded.' })}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Material Dropdown */}
          <div>
            <Dropdown
              label={t('destroyMaterialModal.material', { defaultValue: 'Material' })}
              options={materialOptions}
              value={selectedMaterial}
              onChange={(value) => {
                setSelectedMaterial(value);
                if (errors.material) {
                  setErrors({ ...errors, material: '' });
                }
              }}
              placeholder={t('destroyMaterialModal.materialPlaceholder', { defaultValue: 'Select material' })}
              error={errors.material}
              required
              disabled={isLoadingMaterials || isLoading}
              showSeparator={true}
              addButtonLabel={t('addNewAsk.addNewMaterial', { defaultValue: 'Add New Material' })}
              onAddNew={handleAddNewMaterial}
              customModal={AddMaterialModal}
              customModalProps={{ materialType, t }}
            />
          </div>

          {/* Quantity Field */}
          <div>
            <NumberInput
              label={t('destroyMaterialModal.quantity', { defaultValue: 'Quantity' })}
              value={quantity}
              onChange={(e) => {
                const value = e.target.value;
                setQuantity(value);
                if (errors.quantity) {
                  setErrors({ ...errors, quantity: '' });
                }
              }}
              placeholder="00"
              required
              error={errors.quantity}
              disabled={isLoading}
              unit={unit}
            />
          </div>

          {/* Reason Field */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('destroyMaterialModal.reason', { defaultValue: 'Reason' })}
              <span className="text-accent ml-1">*</span>
            </label>
            <RichTextEditor
              value={reason}
              onChange={(value) => {
                setReason(value);
                if (errors.reason) {
                  setErrors({ ...errors, reason: '' });
                }
              }}
              placeholder={t('destroyMaterialModal.reasonPlaceholder', { defaultValue: 'Enter text here' })}
              disabled={isLoading}
            />
            {errors.reason && (
              <p className="text-sm text-accent mt-1">{errors.reason}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('destroyMaterialModal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleDestroy}
            disabled={isLoading}
          >
            {isLoading 
              ? t('destroyMaterialModal.destroying', { defaultValue: 'Destroying...' })
              : t('destroyMaterialModal.destroy', { defaultValue: 'Destroy Material' })
            }
          </Button>
        </div>
      </div>
    </div>
  );
}

