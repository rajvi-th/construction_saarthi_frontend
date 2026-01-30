import { useState, useCallback, useEffect } from 'react';
import { getMaterialsList, createMaterial, updateMaterial, getInventoryItemsByProjectAndType } from '../api/siteInventoryApi';
import { showError, showSuccess } from '../../../utils/toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';

/**
 * Custom hook for fetching and managing materials
 * @param {string|number} inventoryTypeId - Inventory type ID (required: 1=Reusable, 2=Consumable)
 * @param {string|number} [projectId] - Project ID (optional: if provided, fetches materials for specific project)
 * @returns {Object} { materials, materialOptions, isLoadingMaterials, isCreatingMaterial, error, refetch, createNewMaterial }
 */
export const useMaterials = (inventoryTypeId, projectId = null) => {
  const { t } = useTranslation('siteInventory');
  const { selectedWorkspace } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isCreatingMaterial, setIsCreatingMaterial] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch materials list
   */
  const fetchMaterials = useCallback(async () => {
    // If projectId is provided, we don't necessarily need selectedWorkspace for the API call (as per my new API func),
    // but usually workspace is context.
    // If projectId is NOT provided, we definitely need selectedWorkspace.
    
    if (!inventoryTypeId) {
        setMaterials([]);
        setMaterialOptions([]);
        setIsLoadingMaterials(false);
        return;
    }
    
    if (!projectId && !selectedWorkspace) {
      setMaterials([]);
      setMaterialOptions([]);
      setIsLoadingMaterials(false);
      return;
    }

    try {
      setIsLoadingMaterials(true);
      setError(null);
      
      let response;
      if (projectId) {
         response = await getInventoryItemsByProjectAndType(projectId, inventoryTypeId);
      } else {
         response = await getMaterialsList(selectedWorkspace, inventoryTypeId);
      }

      // API response structure: { materials: [...] } or direct array
      let materialsArray = [];

      if (Array.isArray(response?.data?.materials)) {
        materialsArray = response.data.materials;
      } else if (Array.isArray(response?.materials)) {
        materialsArray = response.materials;
      } else if (Array.isArray(response?.data)) {
        materialsArray = response.data;
      } else if (Array.isArray(response)) {
        materialsArray = response;
      } else if (Array.isArray(response?.data?.data)) {
         // Added this check loosely based on siteInventoryApi structures
         materialsArray = response.data.data;
      }

      setMaterials(materialsArray);

      // Transform materials to dropdown options format
      const options = materialsArray.map((material) => ({
        value: (material.id || material._id || material.materialId || material.materialsId)?.toString() || '',
        label: material.unit_name
          ? `${material.name || material.materialName || material.label} • ${material.unit_name}`
          : material.name || material.materialName || material.label,
        // Preserve original data for use in renderOption or other logic
        name: material.name || material.materialName || material.label,
        unitName: material.unit_name || material.unitName || '',
        ...material
      }));

      setMaterialOptions(options);
    } catch (err) {
      console.error('Error fetching materials:', err);
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        t('addNewAsk.materialLoadFailed', { defaultValue: 'Failed to load materials' });
      setError(errorMessage);
      showError(errorMessage);
      setMaterials([]);
      setMaterialOptions([]);
    } finally {
      setIsLoadingMaterials(false);
    }
  }, [selectedWorkspace, inventoryTypeId, projectId, t]);

  /**
   * Create a new material
   * @param {Object} materialData - Material data
   * @param {string} materialData.name - Material name
   * @param {string} materialData.type - Material type ('reusable' or 'consumable')
   * @param {string|number} materialData.unitId - Unit ID
   * @returns {Promise<Object>} Created material data
   */
  const createNewMaterial = useCallback(async (materialData) => {
    if (!selectedWorkspace) {
      showError(t('errors.workspaceRequired', { defaultValue: 'Please select a workspace first' }));
      throw new Error('Workspace ID is required');
    }

    try {
      setIsCreatingMaterial(true);
      setError(null);

      // Convert type string to inventoryTypeId number
      // Reusable = 1, Consumable = 2
      let inventoryTypeId = 2; // Default to Consumable
      if (materialData.type === 'reusable') {
        inventoryTypeId = 1;
      } else if (materialData.type === 'consumable') {
        inventoryTypeId = 2;
      } else if (materialData.inventoryTypeId) {
        // If inventoryTypeId is already provided, use it
        inventoryTypeId = typeof materialData.inventoryTypeId === 'string'
          ? parseInt(materialData.inventoryTypeId, 10)
          : materialData.inventoryTypeId;
      }

      // Ensure unitId is a number and is valid
      if (!materialData.unitId) {
        showError(t('addNewAsk.errors.unitRequired', { defaultValue: 'Unit is required' }));
        throw new Error('Unit ID is required');
      }

      const unitId = typeof materialData.unitId === 'string'
        ? parseInt(materialData.unitId, 10)
        : materialData.unitId;

      if (isNaN(unitId) || unitId <= 0) {
        showError(t('addNewAsk.errors.unitRequired', { defaultValue: 'Valid unit is required' }));
        throw new Error('Valid unit ID is required');
      }

      // Ensure name is not empty
      const materialName = (materialData.name || materialData.label || '').trim();
      if (!materialName) {
        showError(t('addNewAsk.errors.itemNameRequired', { defaultValue: 'Material name is required' }));
        throw new Error('Material name is required');
      }

      // API expects: { name, unitId, WID, inventoryTypeId }
      const payload = {
        name: materialName,
        unitId: unitId,
        WID: typeof selectedWorkspace === 'string' ? parseInt(selectedWorkspace, 10) : selectedWorkspace,
        inventoryTypeId: inventoryTypeId,
      };

      const response = await createMaterial(payload);

      // API response structure: { message: "...", material: { id, name, unitId, ... } }
      const createdMaterial = response?.data?.material || response?.material || response?.data?.data || response?.data || materialData;

      // Add to materials list
      const newMaterial = {
        id: (createdMaterial.id || createdMaterial._id)?.toString(),
        name: createdMaterial.name || materialData.name || materialData.label,
        type: createdMaterial.inventoryTypeId || inventoryTypeId,
        unitId: createdMaterial.unitId?.toString() || unitId?.toString(),
        unit_name: materialData.unitName || materialData.unit, // Store unit name if available
      };

      setMaterials((prev) => [...prev, newMaterial]);

      // Add to options list
      const newOption = {
        value: newMaterial.id,
        label: newMaterial.unit_name
          ? `${newMaterial.name} • ${newMaterial.unit_name}`
          : newMaterial.name,
        name: newMaterial.name,
        unitName: newMaterial.unit_name,
        ...newMaterial
      };

      setMaterialOptions((prev) => [...prev, newOption]);

      showSuccess(t('addNewAsk.materialAdded', { defaultValue: 'Material added successfully' }));

      return newOption;
    } catch (err) {
      console.error('Error creating material:', err);
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        t('addNewAsk.materialAddFailed', { defaultValue: 'Failed to add material' });
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsCreatingMaterial(false);
    }
  }, [selectedWorkspace, t]);

  /**
   * Update an existing material
   * @param {string|number} id - Material ID
   * @param {Object} materialData - Material data
   * @returns {Promise<Object>} Updated material data
   */
  const updateExistingMaterial = useCallback(async (id, materialData) => {
    try {
      setIsCreatingMaterial(true);
      setError(null);

      const payload = {
        name: materialData.name,
        unitId: materialData.unitId,
      };

      const response = await updateMaterial(id, payload);

      showSuccess(t('addNewAsk.materialUpdated', { defaultValue: 'Material updated successfully' }));

      // Refetch to get updated list
      await fetchMaterials();

      return response?.data || response;
    } catch (err) {
      console.error('Error updating material:', err);
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        t('addNewAsk.materialUpdateFailed', { defaultValue: 'Failed to update material' });
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsCreatingMaterial(false);
    }
  }, [fetchMaterials, t]);

  // Automatically fetch materials when workspace changes
  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return {
    materials,
    materialOptions,
    isLoadingMaterials,
    isCreatingMaterial,
    error,
    refetch: fetchMaterials,
    createNewMaterial,
    updateExistingMaterial,
  };
};

export default useMaterials;

