/**
 * Edit Inventory Page
 * Form for editing existing inventory items
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import Radio from '../../../components/ui/Radio';
import Dropdown from '../../../components/ui/Dropdown';
import NumberInput from '../../../components/ui/NumberInput';
import Input from '../../../components/ui/Input';
import DatePicker from '../../../components/ui/DatePicker';
import FileUpload from '../../../components/ui/FileUpload';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import Button from '../../../components/ui/Button';
import Loader from '../../../components/ui/Loader';
import { ROUTES_FLAT } from '../../../constants/routes';
import { showSuccess, showError } from '../../../utils/toast';
import { useAuth } from '../../../hooks/useAuth';
import { useSiteInventory, useMaterials, useUnits, useInventoryTypes } from '../hooks';
import { useVendors } from '../../vendors/hooks';
import AddMaterialModal from '../components/AddMaterialModal';
import EditMaterialModal from '../components/EditMaterialModal';
import AddVendorModal from '../components/AddVendorModal';
import { X, Pencil } from 'lucide-react';

export default function EditSiteInventory() {
  const { t } = useTranslation('siteInventory');
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();
  const { projectId, projectName, fromProjects, fromDashboard, fromDetails, itemName } = location.state || {};
  const workspaceId = selectedWorkspace;

  const { getItem, updateItem, isUpdating, isLoading: isFetchingItem } = useSiteInventory();
  const { inventoryTypeOptions, isLoading: isLoadingInventoryTypes } = useInventoryTypes();

  const [inventoryType, setInventoryType] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState(null);
  const [brand, setBrand] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [checkInDate, setCheckInDate] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [conditionDescription, setConditionDescription] = useState('');
  const [errors, setErrors] = useState({});

  const { materials, materialOptions, isLoadingMaterials, createNewMaterial, updateExistingMaterial, refetch: refetchMaterials } = useMaterials(inventoryType);
  const { unitOptions } = useUnits(selectedWorkspace);
  const { getVendors, createVendor, isLoading: isLoadingVendors } = useVendors();
  const [vendorOptions, setVendorOptions] = useState([]);

  // Fetch item details on mount
  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    try {
      const data = await getItem(id);
      if (data) {
        setInventoryType(data.inventoryTypeId?.toString());
        setSelectedMaterial(data.materialId?.toString());
        setQuantity(data.quantity?.toString() || '');
        setCostPerUnit(data.avgCostPerUnit?.toString() || data.costPerUnit?.toString() || '');
        setTotalPrice(data.totalPrice?.toString() || '');
        setConditionDescription(data.description || '');
        setSelectedProject(data.projectID?.toString() || '');
        setBrand(data.brand || '');

        if (data.createdAt) {
          setCheckInDate(new Date(data.createdAt));
        }

        // Handle vendor from logs if not directly available
        if (data.vendorID) {
          setSelectedVendor(data.vendorID.toString());
        } else if (data.unUsedLogs && data.unUsedLogs.length > 0) {
          setSelectedVendor(data.unUsedLogs[0].vendorID?.toString() || '');
        }

        // Handle images
        if (data.images && Array.isArray(data.images)) {
          setExistingImages(data.images);
        }
      }
    } catch (error) {
      console.error('Error loading item:', error);
    }
  };

  // Fetch vendors
  useEffect(() => {
    if (!selectedWorkspace) return;
    loadVendors();
  }, [selectedWorkspace, getVendors]);

  const loadVendors = async () => {
    try {
      const vendorsArray = await getVendors(selectedWorkspace);
      const options = vendorsArray.map((vendor) => ({
        value: (vendor.id || vendor._id || vendor.vendorId).toString(),
        label: vendor.full_name,
      }));
      setVendorOptions(options);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const handleUpdateMaterial = async (materialData) => {
    try {
      await updateExistingMaterial(materialData.id, materialData);
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  const handleAddNewMaterial = async (materialData) => {
    try {
      const newOption = await createNewMaterial({
        ...materialData,
        type: inventoryType,
      });
      setSelectedMaterial(newOption.value);
      return newOption;
    } catch (error) {
      throw error;
    }
  };

  const selectedMaterialData = materials.find((m) => (m.id || m._id || m.materialId)?.toString() === selectedMaterial);
  const materialUnitId = selectedMaterialData?.unitId;
  const unitOption = unitOptions.find((u) => u.value === materialUnitId);
  const unit = selectedMaterialData?.unit_name || unitOption?.label || selectedMaterialData?.unitName || (inventoryType === '1' ? 'sq.ft' : 'piece');

  useEffect(() => {
    if (quantity && costPerUnit) {
      const qty = parseFloat(quantity) || 0;
      const cost = parseFloat(costPerUnit) || 0;
      if (qty > 0 && cost > 0) {
        setTotalPrice((qty * cost).toFixed(2));
      }
    }
  }, [quantity, costPerUnit]);

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      const fileType = file.type || '';
      return fileType.startsWith('image/') || fileType.startsWith('video/');
    });
    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedMaterial) newErrors.material = t('addInventory.errors.materialRequired');
    if (!quantity || parseFloat(quantity) <= 0) newErrors.quantity = t('addInventory.errors.quantityRequired');
    if (!selectedVendor) newErrors.vendor = t('addInventory.errors.vendorRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const formData = {
        materialsId: selectedMaterial,
        quantity: quantity,
        costPerUnit: costPerUnit || '0',
        totalPrice: totalPrice || '0',
        projectID: selectedProject,
        vendorID: selectedVendor,
        Description: conditionDescription || '',
        inventoryTypeId: inventoryType,
        files: uploadedFiles,
        brand: brand,
        // Include IDs of existing images to keep
        existingImageIds: JSON.stringify(existingImages.map(img => img.id))
      };

      await updateItem(id, formData);
      showSuccess(t('editInventory.success', { defaultValue: 'Inventory item updated successfully' }));
      if (fromDetails) {
        // Navigate back to details page (Inventory or Consumable)
        const isConsumable = inventoryType === '2';
        const detailRoute = isConsumable ? ROUTES_FLAT.CONSUMABLE_ITEM_DETAILS : ROUTES_FLAT.INVENTORY_ITEM_DETAILS;
        navigate(detailRoute.replace(':id', id), {
          state: { projectId, projectName, fromProjects, fromDashboard, itemName }
        });
      } else {
        navigate(ROUTES_FLAT.SITE_INVENTORY, { 
          state: { 
            projectId, 
            projectName, 
            fromProjects, 
            fromDashboard 
          } 
        });
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  if (isFetchingItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t('editInventory.title', { defaultValue: 'Edit Inventory' })}
        showBackButton
        onBack={() => {
          if (fromDetails) {
            const isConsumable = inventoryType === '2';
            const detailRoute = isConsumable ? ROUTES_FLAT.CONSUMABLE_ITEM_DETAILS : ROUTES_FLAT.INVENTORY_ITEM_DETAILS;
            navigate(detailRoute.replace(':id', id), {
              state: { projectId, projectName, fromProjects, fromDashboard, itemName }
            });
          } else {
            navigate(ROUTES_FLAT.SITE_INVENTORY, { 
              state: { 
                projectId, 
                projectName, 
                fromProjects, 
                fromDashboard 
              } 
            });
          }
        }}
      />

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex gap-6 mb-6 flex-wrap">
          {inventoryTypeOptions.map((type) => (
            <Radio
              key={type.value}
              label={type.label}
              name="inventoryType"
              value={type.value}
              checked={inventoryType === type.value.toString()}
              onChange={(e) => setInventoryType(e.target.value)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="lg:col-span-2">
            <Dropdown
              label={t('addInventory.material', { defaultValue: 'Material' })}
              options={materialOptions}
              value={selectedMaterial}
              onChange={(val) => {
                setSelectedMaterial(val);
                if (errors.material) setErrors(prev => ({ ...prev, material: '' }));
              }}
              placeholder={t('addInventory.materialPlaceholder')}
              error={errors.material}
              required
              disabled={isLoadingMaterials}
              showSeparator
              addButtonLabel={t('addNewAsk.addNewMaterial')}
              onAddNew={handleAddNewMaterial}
              customModal={AddMaterialModal}
              customModalProps={{ materialType: inventoryType, t }}
              renderOption={(option, isSelected) => (
                <div className="flex items-center justify-between w-full group py-0.5">
                  <span className={`${isSelected ? "font-semibold text-primary" : "text-primary/70"} text-sm`}>
                    {option.label}
                  </span>
                  <div
                    className="bg-gray-200 w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-accent transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMaterialToEdit(option);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-800 hover:text-accent" />
                  </div>
                </div>
              )}
            />
          </div>

          <NumberInput
            label={t('addInventory.quantity')}
            placeholder="00"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            error={errors.quantity}
          />

          <Input
            label={`${t('addInventory.brand')} (Optional)`}
            placeholder={t('addInventory.brandPlaceholder')}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />

          <NumberInput
            label={t('addInventory.costPerUnit')}
            placeholder="00"
            value={costPerUnit}
            onChange={(e) => setCostPerUnit(e.target.value)}
            unit={unit}
            showCurrency
          />

          <NumberInput
            label={t('addInventory.totalCost')}
            placeholder="00"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            required
            showCurrency
          />

          <Dropdown
            label={t('addInventory.vendor')}
            options={vendorOptions}
            value={selectedVendor}
            onChange={setSelectedVendor}
            placeholder={t('addInventory.vendorPlaceholder')}
            error={errors.vendor}
            required
            disabled={isLoadingVendors}
            showSeparator
            addButtonLabel={t('addStock.addNewVendor')}
            onAddNew={createVendor}
            customModal={AddVendorModal}
            customModalProps={{ t }}
          />

          <DatePicker
            label={t('addInventory.checkInDate')}
            value={checkInDate}
            onChange={setCheckInDate}
            placeholder="DD/MM/YYYY"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-primary mb-2">
            {t('addInventory.uploadPhotosVideos')}
          </label>
          <FileUpload
            supportedFormats="JPG, PNG, MP4"
            onFileSelect={handleFileSelect}
            accept=".jpg,.jpeg,.png,.mp4"
          />

          <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {/* Existing Images */}
            {existingImages.map((img) => (
              <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100">
                <img src={img.url} alt="Inventory" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(img.id)}
                  className="absolute top-1 right-1 bg-accent text-white rounded-full p-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {/* New Uploads */}
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group aspect-square border rounded-lg overflow-hidden border-accent/20">
                <img src={URL.createObjectURL(file)} alt="New upload" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute top-1 right-1 bg-accent text-white rounded-full p-0.5 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <RichTextEditor
            label={t('addInventory.conditionDescription')}
            value={conditionDescription}
            onChange={setConditionDescription}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button variant="secondary" onClick={() => {
            if (fromDetails) {
              const isConsumable = inventoryType === '2';
              const detailRoute = isConsumable ? ROUTES_FLAT.CONSUMABLE_ITEM_DETAILS : ROUTES_FLAT.INVENTORY_ITEM_DETAILS;
              navigate(detailRoute.replace(':id', id), {
                state: { projectId, projectName, fromProjects, fromDashboard, itemName }
              });
            } else {
              navigate(ROUTES_FLAT.SITE_INVENTORY, { 
                state: { 
                  projectId, 
                  projectName, 
                  fromProjects, 
                  fromDashboard 
                } 
              });
            }
          }}>
            {t('addInventory.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isUpdating}>
            {isUpdating ? t('common.saving') : t('editInventory.editButton', { defaultValue: 'Edit Material' })}
          </Button>
        </div>
      </form>

      <EditMaterialModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateMaterial}
        material={materialToEdit}
      />
    </div>
  );
}
