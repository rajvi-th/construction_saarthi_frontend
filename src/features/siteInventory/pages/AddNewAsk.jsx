/**
 * Add New Ask Page
 * Form for requesting materials from other projects
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import Radio from '../../../components/ui/Radio';
import Dropdown from '../../../components/ui/Dropdown';
import NumberInput from '../../../components/ui/NumberInput';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import Button from '../../../components/ui/Button';
import { ROUTES_FLAT } from '../../../constants/routes';
import { showSuccess, showError } from '../../../utils/toast';
import { useAuth } from '../../../hooks/useAuth';
import { useWorkspaceRole } from '../../dashboard/hooks';
import { getAllProjects } from '../../projects/api/projectApi';
import { useMaterials, useInventoryTypes } from '../hooks';
import { requestMaterial } from '../api/siteInventoryApi';
import AddMaterialModal from '../components/AddMaterialModal';

export default function AddNewAsk() {
  const { t } = useTranslation('siteInventory');
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();
  const currentUserRole = useWorkspaceRole();

  // Get project context and item from navigation state
  const { projectId: currentProjectId, projectName: currentProjectName, fromProjects, fromDashboard, itemName, fromDetails } = location.state || {};
  const itemContext = location.state?.item;

  const { inventoryTypeOptions, isLoading: isLoadingInventoryTypes } = useInventoryTypes();
  const [materialType, setMaterialType] = useState(itemContext?.inventoryTypeId || null);
  const [selectedMaterial, setSelectedMaterial] = useState(itemContext?.id || itemContext?._id || '');
  const [quantity, setQuantity] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Material name for title
  const contextMaterialName = itemContext?.material?.name || itemContext?.materialName || itemContext?.name;
  const pageTitle = itemContext
    ? `${t('addNewAsk.askForMaterial', { defaultValue: 'Ask for Material' })} • ${contextMaterialName}`
    : t('addNewAsk.title', { defaultValue: 'Add New Ask' });

  // Set default inventory type when options are loaded
  useEffect(() => {
    if (inventoryTypeOptions.length > 0 && !materialType) {
      setMaterialType(inventoryTypeOptions[0].value);
    }
  }, [inventoryTypeOptions, materialType]);

  // Use materialType directly as inventoryTypeId (it's already the ID)
  const inventoryTypeId = materialType;
  const { materials, materialOptions, isLoadingMaterials, createNewMaterial, refetch: refetchMaterials } = useMaterials(inventoryTypeId);

  // Get quantity unit from selected material, fallback to default
  const selectedMaterialData = materials.find(
    (m) => (m.id || m._id || m.materialId) === selectedMaterial
  );
  const quantityUnit = selectedMaterialData?.unit_name || selectedMaterialData?.unitName;

  // Fetch materials from API
  useEffect(() => {
    refetchMaterials();
  }, [refetchMaterials]);

  // Handle adding new material (from custom modal)
  const handleAddNewMaterial = async (materialData) => {
    try {
      // Create material via hook
      const newOption = await createNewMaterial({
        ...materialData,
        type: materialType, // 'reusable' or 'consumable'
      });

      // Select the newly created material
      setSelectedMaterial(newOption.value);

      return newOption;
    } catch (error) {
      // Error is already handled in the hook
      throw error;
    }
  };

  // Load real projects list for "Request Material From"
  useEffect(() => {
    const loadProjects = async () => {
      if (!selectedWorkspace) {
        setProjectOptions([]);
        return;
      }

      try {
        const projects = await getAllProjects(selectedWorkspace);
        const options = projects.map((project) => ({
          value: project.id || project.project_id || project._id,
          label:
            project.name ||
            project.title ||
            project.projectName ||
            'Untitled Project',
        }));
        setProjectOptions(options);
      } catch (error) {
        console.error('Error loading projects for AddNewAsk:', error);
        setProjectOptions([]);
      }
    };

    loadProjects();
  }, [selectedWorkspace]);

  const handleCancel = () => {
    if (fromDetails && itemContext) {
      const isConsumable = itemContext.inventoryTypeId === 2 || itemContext.material?.typeName?.toLowerCase().includes('consumable');
      const detailRoute = isConsumable ? ROUTES_FLAT.CONSUMABLE_ITEM_DETAILS : ROUTES_FLAT.INVENTORY_ITEM_DETAILS;
      const itemId = itemContext.id || itemContext._id;
      navigate(detailRoute.replace(':id', itemId), {
        state: { 
          projectId: currentProjectId, 
          projectName: currentProjectName, 
          fromProjects, 
          fromDashboard,
          itemName
        } 
      });
    } else {
      navigate(ROUTES_FLAT.SITE_INVENTORY, { 
        state: { 
          projectId: currentProjectId, 
          projectName: currentProjectName, 
          fromProjects, 
          fromDashboard 
        } 
      });
    }
  };

  const handleMaterialSelect = (value) => {
    setSelectedMaterial(value);
    if (errors.material) {
      setErrors((prev) => ({ ...prev, material: '' }));
    }
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
    if (errors.quantity) {
      setErrors((prev) => ({ ...prev, quantity: '' }));
    }
  };

  const handleProjectSelect = (value) => {
    const project = projectOptions.find((p) => p.value === value);
    // Allow only a single project selection; replace any existing selection
    if (project) {
      setSelectedProjects([project]);
    }
    if (errors.requestFrom) {
      setErrors((prev) => ({ ...prev, requestFrom: '' }));
    }
  };

  const handleRemoveProject = (value) => {
    setSelectedProjects(selectedProjects.filter((p) => p.value !== value));
  };

  const handleDescriptionChange = (newValue) => {
    setDescription(newValue);
  };

  const validate = () => {
    const newErrors = {};

    if (!selectedMaterial) {
      newErrors.material = t('addNewAsk.errors.materialRequired', { defaultValue: 'Material is required' });
    }

    if (!quantity || quantity === '0' || quantity === '00') {
      newErrors.quantity = t('addNewAsk.errors.quantityRequired', { defaultValue: 'Quantity is required' });
    }

    if (selectedProjects.length === 0) {
      newErrors.requestFrom = t('addNewAsk.errors.requestFromRequired', { defaultValue: 'Please select at least one project' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!currentProjectId) {
        showError(t('addNewAsk.errors.projectRequired', { defaultValue: 'Project ID is required' }));
        setIsSubmitting(false);
        return;
      }

      if (selectedProjects.length === 0) {
        showError(t('addNewAsk.errors.projectsRequired', { defaultValue: 'Please select at least one project to request from' }));
        setIsSubmitting(false);
        return;
      }

      // Create a single API call with all selected projects in toProjects array
      await requestMaterial({
        inventoryId: selectedMaterial,
        quantity: parseFloat(quantity) || 0,
        description: description,
        fromProjectId: currentProjectId,
        toProjects: selectedProjects.map(project => project.value),
      });

      showSuccess(t('addNewAsk.success', { defaultValue: 'Material request sent successfully' }));

      if (fromDetails && itemContext) {
        const isConsumable = itemContext.inventoryTypeId === 2 || itemContext.material?.typeName?.toLowerCase().includes('consumable');
        const detailRoute = isConsumable ? ROUTES_FLAT.CONSUMABLE_ITEM_DETAILS : ROUTES_FLAT.INVENTORY_ITEM_DETAILS;
        const itemId = itemContext.id || itemContext._id;
        navigate(detailRoute.replace(':id', itemId), {
          state: { 
            projectId: currentProjectId, 
            projectName: currentProjectName, 
            fromProjects, 
            fromDashboard,
            itemName
          } 
        });
      } else {
        navigate(ROUTES_FLAT.SITE_INVENTORY, {
          state: { 
            projectId: currentProjectId, 
            projectName: currentProjectName,
            fromProjects,
            fromDashboard
          },
        });
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || t('addNewAsk.errors.submitFailed', { defaultValue: 'Failed to send material request' });
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={pageTitle}
        showBackButton={true}
        onBack={handleCancel}
      />

      <form onSubmit={handleSubmit} className="mt-6">
        {/* Hide material type selection if item context is provided */}
        {!itemContext && (
          <div className="mb-6 flex gap-6 flex-wrap">
            {isLoadingInventoryTypes ? (
              <div className="text-sm text-secondary">Loading...</div>
            ) : (
              inventoryTypeOptions.map((type) => (
                <Radio
                  key={type.value}
                  name="materialType"
                  value={type.value}
                  checked={materialType?.toString() === type.value?.toString()}
                  onChange={(e) => setMaterialType(e.target.value)}
                  label={type.label}
                />
              ))
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Request Material From - Now as tags/dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-primary mb-2">
              {t('addNewAsk.requestFrom', { defaultValue: 'Request Material From' })}
              <span className="text-accent ml-1">*</span>
            </label>

            <Dropdown
              options={projectOptions.filter(
                (project) => project.value?.toString() !== currentProjectId?.toString()
              )}
              value={selectedProjects.length === 1 ? selectedProjects[0].value : ""}
              onChange={handleProjectSelect}
              placeholder={t('addNewAsk.requestFromPlaceholder', { defaultValue: 'Select project' })}
              error={errors.requestFrom}
              className="w-full"
            />
          </div>

          {/* Quantity Input */}
          <div className="mb-6">
            <NumberInput
              label={t('addNewAsk.quantity', { defaultValue: 'Quantity' })}
              placeholder="00"
              value={quantity}
              onChange={handleQuantityChange}
              required
              error={errors.quantity}
              unit={quantityUnit}
              className="w-full"
            />
          </div>
        </div>

        {/* Material Selection - Only show if not fixed */}
        {!itemContext && (
          <div className="mb-6">
            <Dropdown
              label={t('addNewAsk.material', { defaultValue: 'Material' })}
              options={materialOptions}
              value={selectedMaterial}
              onChange={handleMaterialSelect}
              placeholder={t('addNewAsk.materialPlaceholder', { defaultValue: 'Select material' })}
              error={errors.material}
              className="w-full"
              showSeparator={currentUserRole?.toLowerCase() !== 'supervisor'}
              addButtonLabel={currentUserRole?.toLowerCase() !== 'supervisor' ? t('addNewAsk.addNewMaterial', { defaultValue: 'Add New Material' }) : ''}
              onAddNew={currentUserRole?.toLowerCase() !== 'supervisor' ? handleAddNewMaterial : null}
              disabled={isLoadingMaterials}
              customModal={currentUserRole?.toLowerCase() !== 'supervisor' ? AddMaterialModal : null}
              customModalProps={currentUserRole?.toLowerCase() !== 'supervisor' ? { materialType, t } : {}}
            />
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-primary mb-2">
            {t('addNewAsk.description', { defaultValue: 'Description' })}
          </label>
          <RichTextEditor
            value={description}
            onChange={handleDescriptionChange}
            placeholder={t('addNewAsk.descriptionPlaceholder', { defaultValue: 'Enter text here' })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-8 pt-6 ">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            className="w-full sm:w-auto order-2 sm:order-1"
            disabled={isSubmitting}
          >
            {t('addNewAsk.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto order-1 sm:order-2"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t('addNewAsk.sending', { defaultValue: 'Sending...' })
              : t('addNewAsk.sendRequest', { defaultValue: 'Send Request' })}
          </Button>
        </div>
      </form>

    </div>
  );
}

