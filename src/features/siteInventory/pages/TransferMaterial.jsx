/**
 * Transfer Material Page
 * Form for transferring materials from current project to another project
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import Dropdown from '../../../components/ui/Dropdown';
import NumberInput from '../../../components/ui/NumberInput';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import Button from '../../../components/ui/Button';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import { showSuccess, showError } from '../../../utils/toast';
import { useAuth } from '../../../hooks/useAuth';
import { getAllProjects } from '../../projects/api/projectApi';
import { requestMaterial } from '../api/siteInventoryApi';

export default function TransferMaterial() {
  const { t } = useTranslation('siteInventory');
  const navigate = useNavigate();
  const location = useLocation();
  const { inventoryId } = useParams();
  const { selectedWorkspace } = useAuth();
  
  // Get project context from navigation state (current project - where we're transferring FROM)
  const currentProjectId = location.state?.projectId;
  const currentProjectName = location.state?.projectName;
  const item = location.state?.item; // Inventory item being transferred
  
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [conditionDescription, setConditionDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get material name and unit from item
  const materialName = item?.material?.name || item?.materialName || item?.name || 'Material';
  const quantityUnit = item?.material?.unit_name || item?.unit_name || item?.unitName || '';

  // Calculate total price when quantity or cost per unit changes
  useEffect(() => {
    if (quantity && costPerUnit) {
      const qty = parseFloat(quantity) || 0;
      const cost = parseFloat(costPerUnit) || 0;
      if (qty > 0 && cost > 0) {
        const total = (qty * cost).toFixed(2);
        setTotalPrice(total);
      } else {
        setTotalPrice('');
      }
    } else {
      setTotalPrice('');
    }
  }, [quantity, costPerUnit]);

  // Load projects list for "Transfer to Project"
  useEffect(() => {
    const loadProjects = async () => {
      if (!selectedWorkspace) {
        setProjectOptions([]);
        return;
      }

      try {
        const projects = await getAllProjects(selectedWorkspace);
        const options = projects
          .filter((project) => {
            // Exclude current project
            const projectId = project.id || project.project_id || project._id;
            return projectId?.toString() !== currentProjectId?.toString();
          })
          .map((project) => ({
            value: project.id || project.project_id || project._id,
            label:
              project.name ||
              project.title ||
              project.projectName ||
              'Untitled Project',
          }));
        setProjectOptions(options);
      } catch (error) {
        console.error('Error loading projects for TransferMaterial:', error);
        setProjectOptions([]);
      }
    };

    loadProjects();
  }, [selectedWorkspace, currentProjectId]);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleProjectSelect = (value) => {
    const selectedProject = projectOptions.find((p) => p.value === value);
    if (selectedProject && !selectedProjects.find((p) => p.value === value)) {
      setSelectedProjects([...selectedProjects, selectedProject]);
      if (errors.transferTo) {
        setErrors((prev) => ({ ...prev, transferTo: '' }));
      }
    }
  };

  const handleRemoveProject = (projectId) => {
    setSelectedProjects(selectedProjects.filter((p) => p.value !== projectId));
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
    if (errors.quantity) {
      setErrors((prev) => ({ ...prev, quantity: '' }));
    }
  };

  const handleCostPerUnitChange = (e) => {
    setCostPerUnit(e.target.value);
    if (errors.costPerUnit) {
      setErrors((prev) => ({ ...prev, costPerUnit: '' }));
    }
  };

  const handleDescriptionChange = (value) => {
    setConditionDescription(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validation
      if (!inventoryId) {
        showError(t('transferMaterial.errors.inventoryIdRequired', { defaultValue: 'Inventory ID is required' }));
        setIsSubmitting(false);
        return;
      }

      if (!quantity || parseFloat(quantity) <= 0) {
        setErrors((prev) => ({ ...prev, quantity: t('transferMaterial.errors.quantityRequired', { defaultValue: 'Quantity is required' }) }));
        setIsSubmitting(false);
        return;
      }

      if (!costPerUnit || parseFloat(costPerUnit) <= 0) {
        setErrors((prev) => ({ ...prev, costPerUnit: t('transferMaterial.errors.costPerUnitRequired', { defaultValue: 'Cost per unit is required' }) }));
        setIsSubmitting(false);
        return;
      }

      if (selectedProjects.length === 0) {
        setErrors((prev) => ({ ...prev, transferTo: t('transferMaterial.errors.transferToRequired', { defaultValue: 'Please select at least one project' }) }));
        setIsSubmitting(false);
        return;
      }

      if (!currentProjectId) {
        showError(t('transferMaterial.errors.currentProjectRequired', { defaultValue: 'Current project ID is required' }));
        setIsSubmitting(false);
        return;
      }
      
      // Create transfer request using requestMaterial API
      // For transfer: fromProjectId = currentProjectId, toProjects = selectedProjects
      await requestMaterial({
        inventoryId: inventoryId,
        quantity: parseFloat(quantity) || 0,
        description: conditionDescription || '',
        fromProjectId: currentProjectId,
        toProjects: selectedProjects.map((project) => project.value),
      });
      
      showSuccess(t('transferMaterial.success', { defaultValue: 'Transfer request sent successfully' }));
      
      // Navigate back after success
      navigate(-1);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || t('transferMaterial.errors.submitFailed', { defaultValue: 'Failed to send transfer request' });
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={`${t('transferMaterial.title', { defaultValue: 'Transfer Material' })} • ${materialName}`}
        showBackButton={true}
        onBack={handleCancel}
      />

      <form onSubmit={handleSubmit} className="mt-6">
        {/* Transfer to Project */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-primary mb-2">
            {t('transferMaterial.transferTo', { defaultValue: 'Transfer to Project' })}
            <span className="text-accent ml-1">*</span>
          </label>
          
          {/* Selected Projects Tags */}
          {selectedProjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedProjects.map((project) => (
                <div
                  key={project.value}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200"
                >
                  <span className="text-sm text-primary">{project.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(project.value)}
                    className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Project Dropdown - shown only when no project is selected */}
          {selectedProjects.length === 0 && (
            <Dropdown
              options={projectOptions}
              value=""
              onChange={handleProjectSelect}
              placeholder={t('transferMaterial.transferToPlaceholder', { defaultValue: 'Select project' })}
              error={errors.transferTo}
              className="w-full"
            />
          )}
        </div>

        {/* Quantity Input */}
        <div className="mb-6">
          <NumberInput
            label={t('transferMaterial.quantity', { defaultValue: 'Quantity' })}
            placeholder="00"
            value={quantity}
            onChange={handleQuantityChange}
            required
            error={errors.quantity}
            unit={quantityUnit}
            className="w-full"
          />
        </div>

        {/* Cost Per Unit and Total Price - Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Cost Per Unit */}
          <div>
            <NumberInput
              label={t('transferMaterial.costPerUnit', { defaultValue: 'Cost Per Unit' })}
              value={costPerUnit}
              onChange={handleCostPerUnitChange}
              placeholder="00"
              showCurrency
              error={errors.costPerUnit}
              className="w-full"
            />
          </div>

          {/* Total Price */}
          <div>
            <NumberInput
              label={t('transferMaterial.totalPrice', { defaultValue: 'Total Price' })}
              value={totalPrice}
              onChange={() => {}} // Read-only, calculated automatically
              placeholder="00"
              showCurrency
              disabled
              className="w-full"
            />
          </div>
        </div>

        {/* Condition Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-primary mb-2">
            {t('transferMaterial.conditionDescription', { defaultValue: 'Condition Description' })}
          </label>
          <RichTextEditor
            value={conditionDescription}
            onChange={handleDescriptionChange}
            placeholder={t('transferMaterial.conditionDescriptionPlaceholder', { defaultValue: 'Enter text here' })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-8 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            className="w-full sm:w-auto order-2 sm:order-1"
            disabled={isSubmitting}
          >
            {t('transferMaterial.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto order-1 sm:order-2"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t('transferMaterial.sending', { defaultValue: 'Sending...' })
              : t('transferMaterial.sendTransferRequest', { defaultValue: 'Send Transfer Request' })}
          </Button>
        </div>
      </form>
    </div>
  );
}

