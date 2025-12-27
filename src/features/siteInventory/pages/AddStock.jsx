/**
 * Add Stock Page
 * Form for adding stock to restock requests
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import NumberInput from '../../../components/ui/NumberInput';
import Dropdown from '../../../components/ui/Dropdown';
import Button from '../../../components/ui/Button';
import { ROUTES_FLAT } from '../../../constants/routes';
import { getVendorsList, createVendor, restockMaterial } from '../api/siteInventoryApi';
import { showSuccess, showError } from '../../../utils/toast';
import { useAuth } from '../../../hooks/useAuth';
import AddVendorModal from '../components/AddVendorModal';

export default function AddStock() {
  const { t } = useTranslation('siteInventory');
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();
  
  const { request, item, projectId, projectName } = location.state || {};
  
  // Use item if available (from InventoryItemCard restock), otherwise use request (from RestockRequestCard)
  const restockData = item || request;
  
  const [quantity, setQuantity] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [vendorOptions, setVendorOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);

  // Get unit from restockData (item or request)
  // For item: check material.unitId or quantityUnit
  // For request: check quantityUnit
  const unit = restockData?.quantityUnit || 
               restockData?.unit || 
               restockData?.material?.unitName || 
               (restockData?.material?.unitId ? `Unit ${restockData.material.unitId}` : 'piece');
  
  // Get material name
  const materialName = restockData?.material?.name || 
                       restockData?.materialName || 
                       restockData?.name || 
                       restockData?.itemName || 
                       '';

  // Fetch vendors from API
  useEffect(() => {
    if (selectedWorkspace) {
      loadVendors();
    }
  }, [selectedWorkspace]);

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

  const loadVendors = async () => {
    if (!selectedWorkspace) {
      return;
    }
    
    try {
      setIsLoadingVendors(true);
      const response = await getVendorsList(selectedWorkspace);
      
      // Handle different response structures
      // API response structure: { users: [...] } or direct array
      let vendorsArray = [];
      
      if (Array.isArray(response?.users)) {
        vendorsArray = response.users;
      } else if (Array.isArray(response?.data?.users)) {
        vendorsArray = response.data.users;
      } else if (Array.isArray(response?.data)) {
        vendorsArray = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        vendorsArray = response.data.data;
      } else if (Array.isArray(response)) {
        vendorsArray = response;
      } else if (response?.data && typeof response.data === 'object') {
        vendorsArray = response.data.data || Object.values(response.data).filter(Array.isArray)[0] || [];
      }
      
      // Transform vendors to dropdown options format
      const options = vendorsArray.map((vendor) => {
        const vendorLabel = vendor.full_name || vendor.name || vendor.vendorName || vendor.label || 'Unknown Vendor';
        return {
          value: vendor.id || vendor._id || vendor.vendorId,
          label: String(vendorLabel), // Ensure it's always a string
        };
      });
      
      setVendorOptions(options);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || t('addStock.errors.vendorLoadFailed', { defaultValue: 'Failed to load vendors' });
      showError(errorMessage);
      setVendorOptions([]);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  const handleAddNewVendor = async (vendorData) => {
    if (!selectedWorkspace) {
      showError(t('addStock.errors.workspaceRequired', { defaultValue: 'Workspace is required' }));
      return;
    }
    
    try {
      // Create vendor via API
      const response = await createVendor({
        name: vendorData.name,
        countryCode: vendorData.countryCode,
        contactNumber: vendorData.contactNumber,
        companyName: vendorData.companyName,
        address: vendorData.address,
        workspace_id: selectedWorkspace,
      });
      
      // Get the created vendor data
      const createdVendor = response?.data?.data || response?.data || vendorData;
      
      // Add to options list
      const newOption = {
        value: createdVendor.id || createdVendor._id || Date.now().toString(),
        label: String(createdVendor.full_name || createdVendor.name || vendorData.name || 'Unknown Vendor'),
      };
      
      setVendorOptions((prev) => [...prev, newOption]);
      
      // Select the newly created vendor
      setSelectedVendor(newOption.value);
      
      showSuccess(t('addStock.vendorAdded', { defaultValue: 'Vendor added successfully' }));
      
      return newOption;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || t('addStock.vendorAddFailed', { defaultValue: 'Failed to add vendor' });
      showError(errorMessage);
      throw error;
    }
  };

  const handleVendorSelect = (value) => {
    setSelectedVendor(value);
    if (errors.vendor) {
      setErrors((prev) => ({ ...prev, vendor: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!quantity || parseFloat(quantity) <= 0) {
      newErrors.quantity = t('addStock.errors.quantityRequired', { defaultValue: 'Quantity is required' });
    }
    
    if (!selectedVendor) {
      newErrors.vendor = t('addStock.errors.vendorRequired', { defaultValue: 'Vendor is required' });
    }
    
    if (!totalPrice || parseFloat(totalPrice) <= 0) {
      newErrors.totalPrice = t('addStock.errors.totalPriceRequired', { defaultValue: 'Total price is required' });
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
      // Get inventory ID from item or request
      const inventoryId = item?.id || item?._id || request?.inventoryId || request?.id;
      
      if (!inventoryId) {
        showError(t('addStock.errors.inventoryIdRequired', { defaultValue: 'Inventory ID is required' }));
        setIsSubmitting(false);
        return;
      }
      
      if (!projectId) {
        showError(t('addStock.errors.projectRequired', { defaultValue: 'Project ID is required' }));
        setIsSubmitting(false);
        return;
      }
      
      // Get inventoryTypeId from item or request
      const inventoryTypeId = item?.inventoryTypeId || request?.inventoryTypeId || 1; // Default to 1 (reusable)
      
      // Call restock API
      await restockMaterial({
        inventoryId: inventoryId,
        quantity: parseFloat(quantity),
        projectID: projectId,
        vendorID: selectedVendor,
        price: parseFloat(costPerUnit) || 0,
        inventoryTypeId: inventoryTypeId,
      });
      
      showSuccess(t('addStock.success', { defaultValue: 'Stock added successfully' }));
      
      // Navigate back after success
      navigate(ROUTES_FLAT.SITE_INVENTORY, {
        state: projectId ? { projectId, projectName } : undefined,
      });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          t('addStock.errors.restockFailed', { defaultValue: 'Failed to add stock. Please try again.' });
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!restockData) {
    // If no restock data (item or request), redirect back
    navigate(-1);
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={materialName ? `${t('addStock.title', { defaultValue: 'Restock Material' })} • ${materialName}` : t('addStock.title', { defaultValue: 'Restock Material' })}
        showBackButton
        onBack={handleBack}
      />

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Quantity */}
            <div>
              <NumberInput
                label={t('addStock.quantity', { defaultValue: 'Quantity' })}
                placeholder="00"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuantity(value);
                  if (errors.quantity) {
                    setErrors((prev) => ({ ...prev, quantity: '' }));
                  }
                }}
                required
                error={errors.quantity}
                className="w-full"
              />
            </div>

            {/* Cost Per Unit */}
            <div>
              <NumberInput
                label={t('addStock.costPerUnit', { defaultValue: 'Cost Per Unit' })}
                placeholder="00"
                value={costPerUnit}
                onChange={(e) => {
                  const value = e.target.value;
                  setCostPerUnit(value);
                }}
                unit={unit}
                showCurrency
                className="w-full"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Vendor */}
            <div>
              <Dropdown
                label={t('addStock.vendor', { defaultValue: 'Vendor' })}
                options={vendorOptions}
                value={selectedVendor}
                onChange={handleVendorSelect}
                placeholder={t('addStock.vendorPlaceholder', { defaultValue: 'Select Vendor' })}
                error={errors.vendor}
                className="w-full"
                showSeparator={true}
                addButtonLabel={t('addStock.addNewVendor', { defaultValue: 'Add New Vendor' })}
                onAddNew={handleAddNewVendor}
                disabled={isLoadingVendors}
                customModal={AddVendorModal}
                customModalProps={{ t }}
              />
            </div>

            {/* Total Price */}
            <div>
              <NumberInput
                label={t('addStock.totalPrice', { defaultValue: 'Total Price' })}
                placeholder="00"
                value={totalPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  setTotalPrice(value);
                  if (errors.totalPrice) {
                    setErrors((prev) => ({ ...prev, totalPrice: '' }));
                  }
                }}
                required
                error={errors.totalPrice}
                showCurrency
                className="w-full"
              />
            </div>
          </div>
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
            {t('addStock.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto order-1 sm:order-2"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t('addStock.restocking', { defaultValue: 'Restocking...' })
              : t('addStock.restockMaterial', { defaultValue: 'Restock Material' })}
          </Button>
        </div>
      </form>
    </div>
  );
}

