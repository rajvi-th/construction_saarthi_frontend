/**
 * Add New Inventory Page
 * Form for adding new inventory items
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import Radio from '../../../components/ui/Radio';
import Dropdown from '../../../components/ui/Dropdown';
import NumberInput from '../../../components/ui/NumberInput';
import DatePicker from '../../../components/ui/DatePicker';
import FileUpload from '../../../components/ui/FileUpload';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import Button from '../../../components/ui/Button';
import Loader from '../../../components/ui/Loader';
import { ROUTES_FLAT } from '../../../constants/routes';
import { createSiteInventory } from '../api/siteInventoryApi';
import { getAllProjects } from '../../projects/api/projectApi';
import { showSuccess, showError } from '../../../utils/toast';
import { useAuth } from '../../../hooks/useAuth';
import { useMaterials, useUnits, useInventoryTypes } from '../hooks';
import { useVendors } from '../../vendors/hooks';
import AddMaterialModal from '../components/AddMaterialModal';
import AddVendorModal from '../components/AddVendorModal';
import { X } from 'lucide-react';

export default function AddSiteInventory() {
  const { t } = useTranslation('siteInventory');
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();
  const workspaceId = selectedWorkspace;
  const projectContextId = location.state?.projectId || '';
  const projectContextName = location.state?.projectName || '';

  const { inventoryTypeOptions, isLoading: isLoadingInventoryTypes } = useInventoryTypes();
  const [inventoryType, setInventoryType] = useState(null); // Dynamic inventory type ID
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [checkInDate, setCheckInDate] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [lowStockAlert, setLowStockAlert] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [conditionDescription, setConditionDescription] = useState('');
  
  // Set default inventory type when options are loaded
  useEffect(() => {
    if (inventoryTypeOptions.length > 0 && !inventoryType) {
      setInventoryType(inventoryTypeOptions[0].value);
    }
  }, [inventoryTypeOptions, inventoryType]);
  
  const inventoryTypeId = inventoryType;
  const { materials, materialOptions, isLoadingMaterials, createNewMaterial, refetch: refetchMaterials } = useMaterials(inventoryTypeId);
  const { unitOptions } = useUnits(selectedWorkspace);
  const { getVendors, createVendor, isLoading: isLoadingVendors } = useVendors();
  const [vendorOptions, setVendorOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Get unit name from selected material, fallback to inventory type based unit
  const selectedMaterialData = materials.find((m) => (m.id || m._id || m.materialId) === selectedMaterial);
  // Find unit name from unitOptions using unitId
  const materialUnitId = selectedMaterialData?.unitId;
  const unitOption = unitOptions.find((u) => u.value === materialUnitId);
  // Show unit name (label), not unit ID
  const unit = unitOption?.label || selectedMaterialData?.unitName || (inventoryType === 'reusable' ? 'sq.ft' : 'piece');

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

  // Fetch materials on mount
  useEffect(() => {
    refetchMaterials();
  }, [refetchMaterials]);

  // Fetch vendors
  useEffect(() => {
    if (!selectedWorkspace) return;
    loadVendors();
  }, [selectedWorkspace, getVendors]);

  // Fetch projects
  useEffect(() => {
    if (workspaceId) {
      loadProjects();
    }
  }, [workspaceId]);

  const loadVendors = async () => {
    try {
      const vendorsArray = await getVendors(selectedWorkspace);
      
      const options = vendorsArray.map((vendor) => {
        const value = vendor.id || vendor._id || vendor.vendorId;
        const label = vendor.full_name;
        return {
          value,
          label: String(label),
        };
      });
      
      setVendorOptions(options);
    } catch (error) {
      console.error('Error loading vendors:', error);
      setVendorOptions([]);
    }
  };

  const handleAddNewMaterial = async (materialData) => {
    try {
      // Create material via hook
      const newOption = await createNewMaterial({
        ...materialData,
        type: inventoryType, // Use current inventory type
      });
      
      // Select the newly created material
      setSelectedMaterial(newOption.value);
      
      return newOption;
    } catch (error) {
      // Error is already handled in the hook
      throw error;
    }
  };

  const handleAddNewVendor = async (vendorData) => {
    try {
      if (!workspaceId) {
        showError(t('errors.workspaceRequired', { defaultValue: 'Workspace is required' }));
        throw new Error('Workspace ID is required to create vendor');
      }

      // Prepare vendor payload with correct field names for builder/vendor API
      // API expects: { full_name, country_code, phone_number, company_Name, address, role, workspace_id }
      const payload = {
        full_name: (vendorData.name || '').trim(),
        country_code: vendorData.countryCode || '+91',
        phone_number: (vendorData.contactNumber || '').trim(),
        company_Name: vendorData.company_Name || vendorData.companyName || '',
        address: vendorData.address || '',
        role: 'vendors',
        workspace_id: workspaceId,
      };

      // Create vendor via hook (returns axios response)
      const response = await createVendor(payload);

      // Try to extract created vendor object from response
      const createdVendor =
        response?.data?.user ||
        response?.data?.vendor ||
        response?.data?.data ||
        response?.data ||
        payload;

      const newOption = {
        value:
          createdVendor.id ||
          createdVendor._id ||
          createdVendor.vendorId ||
          createdVendor.userId ||
          Date.now().toString(),
        // Use full_name for display; fallback to name from modal
        label: createdVendor.full_name || vendorData.name || '',
      };
      
      setVendorOptions((prev) => [...prev, newOption]);
      setSelectedVendor(newOption.value);
      showSuccess(t('addStock.vendorAdded', { defaultValue: 'Vendor added successfully' }));
      return newOption;
    } catch (error) {
      console.error('Error creating vendor:', error);
      const errorMessage = error?.response?.data?.message || error?.message || t('addStock.vendorAddFailed', { defaultValue: 'Failed to add vendor' });
      showError(errorMessage);
      throw error;
    }
  };

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const projects = await getAllProjects(workspaceId);
      
      const options = projects.map((project) => ({
        value: project.id || project.project_id || project._id,
        label: project.name || project.title || project.projectName || 'Untitled Project',
      }));
      
      setProjectOptions(options);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjectOptions([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      const fileType = file.type || '';
      const isValidType = fileType.startsWith('image/') || fileType.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        showError(t('addInventory.errors.invalidFileType', { defaultValue: 'Only JPG, PNG, and MP4 files are allowed' }));
        return false;
      }
      if (!isValidSize) {
        showError(t('addInventory.errors.fileTooLarge', { defaultValue: 'File size must be less than 10MB' }));
        return false;
      }
      return true;
    });

    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!selectedMaterial) {
      newErrors.material = t('addInventory.errors.materialRequired', { defaultValue: 'Material is required' });
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
      newErrors.quantity = t('addInventory.errors.quantityRequired', { defaultValue: 'Quantity is required' });
    }
    
    if (!checkInDate) {
      newErrors.checkInDate = t('addInventory.errors.checkInDateRequired', { defaultValue: 'Check in date is required' });
    }
    
    if (!selectedVendor) {
      newErrors.vendor = t('addInventory.errors.vendorRequired', { defaultValue: 'Vendor is required' });
    }
    
    if (!lowStockAlert || parseFloat(lowStockAlert) <= 0) {
      newErrors.lowStockAlert = t('addInventory.errors.lowStockAlertRequired', { defaultValue: 'Low stock alert is required' });
    }

    if (uploadedFiles.length === 0) {
      newErrors.files = t('addInventory.errors.filesRequired', { defaultValue: 'At least one photo or video is required' });
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
      // Use inventoryType directly as inventoryTypeId (it's already the ID)
      const inventoryTypeId = inventoryType;

      // Use project ID from navigation context (if available)
      const projectID = projectContextId || '';
      
      const formData = {
        materialsId: selectedMaterial,
        quantity: quantity,
        costPerUnit: costPerUnit || '0',
        totalPrice: totalPrice || '0',
        projectID: projectID,
        vendorID: selectedVendor,
        Description: conditionDescription || '',
        inventoryTypeId: inventoryTypeId,
        files: uploadedFiles, // Array of files
        // Optional fields
        checkInDate: checkInDate ? checkInDate.toISOString().split('T')[0] : '',
        lowStockAlert: lowStockAlert || '',
      };
      
      await createSiteInventory(formData);
      
      showSuccess(t('addInventory.success', { defaultValue: 'Inventory item added successfully' }));
      navigate(ROUTES_FLAT.SITE_INVENTORY, {
        state: projectContextId ? { projectId: projectContextId, projectName: projectContextName } : undefined,
      });
    } catch (error) {
      console.error('Error creating inventory:', error);
      const errorMessage = error?.response?.data?.message || error?.message || t('addInventory.errors.createFailed', { defaultValue: 'Failed to create inventory item' });
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES_FLAT.SITE_INVENTORY, {
      state: projectContextId ? { projectId: projectContextId, projectName: projectContextName } : undefined,
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t('addInventory.title', { defaultValue: 'Add New Inventory' })}
        showBackButton
        onBack={handleCancel}
      />

      <form onSubmit={handleSubmit} className="mt-6">
        {/* Inventory Type Selection */}
        <div className="flex gap-6 mb-6 flex-wrap">
          {isLoadingInventoryTypes ? (
            <Loader size="sm" />
          ) : (
            inventoryTypeOptions.map((type) => (
              <Radio
                key={type.value}
                label={type.label}
                name="inventoryType"
                value={type.value}
                checked={inventoryType === type.value}
                onChange={(e) => setInventoryType(e.target.value)}
              />
            ))
          )}
        </div>

        {/* Form Fields - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Material */}
          <div>
            <Dropdown
              label={t('addInventory.material', { defaultValue: 'Material' })}
              options={materialOptions}
              value={selectedMaterial}
              onChange={(value) => {
                setSelectedMaterial(value);
                if (errors.material) {
                  setErrors((prev) => ({ ...prev, material: '' }));
                }
              }}
              placeholder={t('addInventory.materialPlaceholder', { defaultValue: 'Select material' })}
              error={errors.material}
              required
              disabled={isLoadingMaterials}
              showSeparator={true}
              addButtonLabel={t('addNewAsk.addNewMaterial', { defaultValue: 'Add New Material' })}
              onAddNew={handleAddNewMaterial}
              customModal={AddMaterialModal}
              customModalProps={{ materialType: inventoryType, t }}
            />
          </div>

          {/* Quantity */}
          <div>
            <NumberInput
              label={t('addInventory.quantity', { defaultValue: 'Quantity' })}
              placeholder="00"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                if (errors.quantity) {
                  setErrors((prev) => ({ ...prev, quantity: '' }));
                }
              }}
              required
              error={errors.quantity}
              unit={unit}
              className="w-full"
            />
          </div>

          {/* Cost Per Unit */}
          <div>
            <NumberInput
              label={t('addInventory.costPerUnit', { defaultValue: 'Cost Per Unit' })}
              placeholder="00"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
              unit={unit}
              showCurrency
              className="w-full"
            />
          </div>

          {/* Total Price */}
          <div>
            <NumberInput
              label={t('addInventory.totalPrice', { defaultValue: 'Total Price' })}
              placeholder="00"
              value={totalPrice}
              onChange={(e) => {
                setTotalPrice(e.target.value);
              }}
              showCurrency
              className="w-full"
            />
          </div>

          {/* Check In Date */}
          <div>
            <DatePicker
              label={t('addInventory.checkInDate', { defaultValue: 'Check In Date' })}
              value={checkInDate}
              onChange={(date) => {
                setCheckInDate(date);
                if (errors.checkInDate) {
                  setErrors((prev) => ({ ...prev, checkInDate: '' }));
                }
              }}
              placeholder="DD/MM/YYYY"
              required
              error={errors.checkInDate}
            />
          </div>

          {/* Vendor */}
          <div>
            <Dropdown
              label={t('addInventory.vendor', { defaultValue: 'Vendor' })}
              options={vendorOptions}
              value={selectedVendor}
              onChange={(value) => {
                setSelectedVendor(value);
                if (errors.vendor) {
                  setErrors((prev) => ({ ...prev, vendor: '' }));
                }
              }}
              placeholder={t('addInventory.vendorPlaceholder', { defaultValue: 'Select Vendor' })}
              error={errors.vendor}
              required
              disabled={isLoadingVendors}
              showSeparator={true}
              addButtonLabel={t('addStock.addNewVendor', { defaultValue: 'Add New Vendor' })}
              onAddNew={handleAddNewVendor}
              customModal={AddVendorModal}
              customModalProps={{ t }}
            />
          </div>

          {/* Low Stock Alert */}
          <div>
            <NumberInput
              label={t('addInventory.lowStockAlert', { defaultValue: 'Low Stock Alert' })}
              placeholder="00"
              value={lowStockAlert}
              onChange={(e) => {
                setLowStockAlert(e.target.value);
                if (errors.lowStockAlert) {
                  setErrors((prev) => ({ ...prev, lowStockAlert: '' }));
                }
              }}
              required
              error={errors.lowStockAlert}
              unit={unit}
              className="w-full"
            />
          </div>
        </div>

        {/* Upload Photos/Videos */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-primary mb-2">
            {t('addInventory.uploadPhotosVideos', { defaultValue: 'Upload Photos/Videos' })}
            <span className="text-accent ml-1">*</span>
          </label>
          <FileUpload
            title={t('addInventory.uploadPhotosVideos', { defaultValue: 'Upload Photos/ Videos' })}
            supportedFormats="JPG, PNG, MP4"
            maxSize={10}
            maxSizeUnit="MB"
            onFileSelect={handleFileSelect}
            accept=".jpg,.jpeg,.png,.mp4"
            uploadButtonText={t('addInventory.upload', { defaultValue: 'Upload' })}
            supportedFormatLabel={t('addInventory.supportedFormat', { defaultValue: 'Supported Format:' })}
          />
          {errors.files && (
            <p className="mt-1 text-sm text-accent">{errors.files}</p>
          )}
          
          {/* Display uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className=" aspect-square border-black-soft border-2 rounded-lg">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-2 right-2 bg-accent text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Condition Description */}
        <div className="mb-6">
          <RichTextEditor
            label={t('addInventory.conditionDescription', { defaultValue: 'Condition Description' })}
            value={conditionDescription}
            onChange={setConditionDescription}
            placeholder={t('addInventory.conditionDescriptionPlaceholder', { defaultValue: 'Enter text here' })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            className="w-full sm:w-auto order-2 sm:order-1"
            disabled={isSubmitting}
          >
            {t('addInventory.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto order-1 sm:order-2"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t('addInventory.adding', { defaultValue: 'Adding...' })
              : t('addInventory.addMaterial', { defaultValue: 'Add Material' })}
          </Button>
        </div>
      </form>
    </div>
  );
}
