import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftRight, Plus } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import EmptyState from '../../../components/shared/EmptyState';
import EmptyStateSvg from '../../../assets/icons/EmptyState.svg';
import Loader from '../../../components/ui/Loader';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Radio from '../../../components/ui/Radio';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { InventoryItemCard, Tabs, TransferRequestCard, ApproveTransferModal, RejectTransferModal, LogUsageModal, AskForMaterialCard, RestockRequestCard, DestroyMaterialCard, DestroyMaterialModal } from '../components';
import { useSiteInventory, useInventoryTypes } from '../hooks';
import { getTransferRequests, approveTransferRequest, rejectTransferRequest, getAskMaterialRequests, getRestockRequests, getDestroyedMaterials } from '../api/siteInventoryApi';
import { useAuth } from '../../auth/store';
import { ROUTES_FLAT } from '../../../constants/routes';
import { PROJECT_ROUTES } from '../../projects/constants';
import { useDebounce } from '../../../hooks/useDebounce';
import { showError, showSuccess } from '../../../utils/toast';

export default function SiteInventory() {
  const { t } = useTranslation('siteInventory');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, selectedWorkspace } = useAuth();
  const { getItems, deleteItem, isLoading } = useSiteInventory();
  const { inventoryTypes, inventoryTypeOptions, isLoading: isLoadingInventoryTypes } = useInventoryTypes();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [materialType, setMaterialType] = useState(null); 
  const [activeTab, setActiveTab] = useState('inventory');  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [transferRequests, setTransferRequests] = useState([]);
  const [isLoadingTransferRequests, setIsLoadingTransferRequests] = useState(false);
  const [askForMaterials, setAskForMaterials] = useState([]);
  const [restockRequests, setRestockRequests] = useState([]);
  const [destroyMaterials, setDestroyMaterials] = useState([]);
  const [isLoadingDestroyMaterials, setIsLoadingDestroyMaterials] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [logUsageModalOpen, setLogUsageModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [destroyModalOpen, setDestroyModalOpen] = useState(false);
  const [destroyItem, setDestroyItem] = useState(null);
  const [addDestroyMaterialModalOpen, setAddDestroyMaterialModalOpen] = useState(false);
  
  // Get project context from navigation state (if navigated from project details)
  const projectId = location.state?.projectId;
  const projectName = location.state?.projectName;
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Update materialType when inventory types are loaded
  useEffect(() => {
    if (inventoryTypeOptions.length > 0 && !materialType) {
      const firstType = inventoryTypeOptions[0].value;
      console.log('Setting default materialType to:', firstType, 'Label:', inventoryTypeOptions[0].label);
      setMaterialType(firstType);
    }
  }, [inventoryTypeOptions, materialType]);

  useEffect(() => {
    if (user && materialType) {
      loadInventoryItems();
    }
  }, [user, materialType, projectId]);

  // Filter items based on search and material type
  useEffect(() => {
    let filtered = [...inventoryItems];
    
    // Filter by material type (inventoryTypeId)
    if (materialType) {
      filtered = filtered.filter((item) => {
        const itemInventoryTypeId = item?.inventoryTypeId?.toString();
        return itemInventoryTypeId === materialType.toString();
      });
    }
    
    // Filter by search query
    if (debouncedSearch.trim()) {
      const search = debouncedSearch.toLowerCase();
      filtered = filtered.filter((item) => {
        const itemName = (
          item?.material?.name ||
          item?.materialName ||
          item?.name ||
          item?.itemName ||
          ''
        ).toLowerCase();
        const specification = (item?.Description || item?.specification || item?.spec || '').toLowerCase();
        return itemName.includes(search) || specification.includes(search);
      });
    }
    
    setFilteredItems(filtered);
  }, [inventoryItems, materialType, debouncedSearch]);

  const loadInventoryItems = async () => {
    try {
      const params = {};
      if (projectId) params.projectID = projectId;
      if (materialType) params.inventoryTypeId = materialType;
  
      // Fetch items
      const itemsArray = await getItems(params);
  
      // Direct set — no user filtering, no bad project filtering
      setInventoryItems(itemsArray || []);
  
    } catch (error) {
      console.error('Error loading inventory items:', error);
      showError("Failed to load inventory items");
      setInventoryItems([]);
    }
  };
  

  const handleCreateSiteInventory = () => {
    navigate(ROUTES_FLAT.ADD_SITE_INVENTORY, {
      state: projectId ? { projectId, projectName } : undefined,
    });
  };

  const handleBack = () => {
    if (projectId) {
      // Navigate back to project details if came from there
      navigate(PROJECT_ROUTES.PROJECT_DETAILS.replace(':slug', projectName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || projectId), {
        state: { projectId, projectName },
      });
    } else {
      // Navigate to projects list or dashboard
      navigate(ROUTES_FLAT.PROJECTS);
    }
  };

  const handleDeleteClick = (id) => {
    const item = inventoryItems.find((item) => (item.id || item._id) === id);
    setItemToDelete({ id, item });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteItem(itemToDelete.id);
      await loadInventoryItems();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleTransfer = (item) => {
    // TODO: Implement transfer functionality
    console.log('Transfer item:', item);
  };

  const handleEdit = (item) => {
    navigate(ROUTES_FLAT.EDIT_SITE_INVENTORY.replace(':id', item.id || item._id), {
      state: projectId ? { projectId, projectName } : undefined,
    });
  };

  const handleViewDetails = (item) => {
    const itemId = item.id || item._id;
    
    // Determine if item is consumable based on inventoryTypeId
    const inventoryTypeId = item.inventoryTypeId?.toString();
    // Find inventory type from API to check if it's consumable
    const itemInventoryType = inventoryTypes.find(
      (type) => (type.id?.toString() || type.inventoryTypeId?.toString()) === inventoryTypeId
    );
    // Check if the inventory type name contains 'consumable' (case-insensitive)
    const typeName = itemInventoryType?.name || itemInventoryType?.typeName || '';
    const isConsumable = typeName.toLowerCase().includes('consumable');
    
    // Navigate to appropriate details page
    const route = isConsumable 
      ? ROUTES_FLAT.CONSUMABLE_ITEM_DETAILS 
      : ROUTES_FLAT.INVENTORY_ITEM_DETAILS;
    
    navigate(route.replace(':id', itemId), {
      state: projectId ? { projectId, projectName } : undefined,
    });
  };

  const handleRestock = (item) => {
    navigate(ROUTES_FLAT.ADD_STOCK, {
      state: {
        item, 
        projectId,
        projectName,
      },
    });
  };

  const handleLogUsage = (logData) => {
    // logData contains the item with usedQuantity and description
    const itemId = logData.id || logData._id;
    // TODO: Implement log usage API call
    console.log('Log usage for item:', logData);
    setLogUsageModalOpen(false);
    setSelectedItem(null);
  };

  const handleLogUsageClick = (item) => {
    setSelectedItem(item);
    setLogUsageModalOpen(true);
  };

  const handleDestroy = (item) => {
    setDestroyItem(item);
    setDestroyModalOpen(true);
  };

  const handleAddDestroyMaterial = async (destroyData) => {
    // TODO: Integrate destroy material API call
    console.log('Destroy material:', destroyData);
    // After successful API call, reload destroy materials list
    await loadDestroyMaterials();
    showSuccess(t('destroyMaterials.success', { defaultValue: 'Material destroyed successfully' }));
  };

  const handleDownloadPDF = (item) => {
    // TODO: Implement PDF download functionality
    console.log('Download PDF for item:', item);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const loadTransferRequests = useCallback(async () => {
    setIsLoadingTransferRequests(true);
    try {
      const params = {};
      
      if (projectId) {
        params.projectID = projectId;
      }
      
      // Add inventoryTypeId if materialType is selected
      if (materialType) {
        params.inventoryTypeId = materialType;
      }
      
      const response = await getTransferRequests(params);
      
      // Handle different response structures
      let requestsArray = [];
      
      // Most common: axios response { data: { requests: [...] } }
      if (Array.isArray(response?.data?.requests)) {
        requestsArray = response.data.requests;
      }
      // http wrapper returning { requests: [...] } directly
      else if (Array.isArray(response?.requests)) {
        requestsArray = response.requests;
      }
      // Fallbacks
      else if (Array.isArray(response?.data)) {
        requestsArray = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        requestsArray = response.data.data;
      } else if (Array.isArray(response)) {
        requestsArray = response;
      } else if (response?.data && typeof response.data === 'object') {
        requestsArray =
          response.data.requests ||
          response.data.data ||
          Object.values(response.data).find((v) => Array.isArray(v)) ||
          [];
      }
      
      setTransferRequests(Array.isArray(requestsArray) ? requestsArray : []);
    } catch (error) {
      console.error('Error loading transfer requests:', error);
      const errorMessage = error?.response?.data?.message || error?.message || t('errors.fetchFailed', { defaultValue: 'Failed to load transfer requests' });
      showError(errorMessage);
      setTransferRequests([]);
    } finally {
      setIsLoadingTransferRequests(false);
    }
  }, [projectId, t]);

  const loadAskMaterialRequests = useCallback(async () => {
    try {
      const params = {};
      
      if (projectId) {
        params.projectID = projectId;
      }
      
      // Add inventoryTypeId if materialType is selected
      if (materialType) {
        params.inventoryTypeId = materialType;
      }
      
      const response = await getAskMaterialRequests(params);
      
      // Handle different response structures
      let requestsArray = [];
      
      // Most common: axios response { data: { requests: [...] } }
      if (Array.isArray(response?.data?.requests)) {
        requestsArray = response.data.requests;
      }
      // http wrapper returning { requests: [...] } directly
      else if (Array.isArray(response?.requests)) {
        requestsArray = response.requests;
      }
      // Fallbacks
      else if (Array.isArray(response?.data)) {
        requestsArray = response.data;
      } else if (Array.isArray(response)) {
        requestsArray = response;
      } else if (response?.data && typeof response.data === 'object') {
        requestsArray =
          response.data.requests ||
          response.data.data ||
          Object.values(response.data).find((v) => Array.isArray(v)) ||
          [];
      }
      setAskForMaterials(Array.isArray(requestsArray) ? requestsArray : []);
    } catch (error) {
      console.error('Error loading ask material requests:', error);
      const errorMessage = error?.response?.data?.message || error?.message || t('errors.fetchFailed', { defaultValue: 'Failed to load ask material requests' });
      showError(errorMessage);
      setAskForMaterials([]);
    }
  }, [projectId, t]);

  const loadRestockRequests = useCallback(async () => {
    try {
      const params = {
        requestStatus: 'active', // Default to active requests
      };

      if (projectId) {
        params.projectID = projectId;
      }

      // Add inventoryTypeId if materialType (inventory type ID) is selected
      if (materialType) {
        params.inventoryTypeId = materialType;
      }

      const response = await getRestockRequests(params);
      
      // Handle different response structures
      let requestsArray = [];
      
      // Most common: axios response { data: { requests: [...] } }
      if (Array.isArray(response?.data?.requests)) {
        requestsArray = response.data.requests;
      }
      // http wrapper returning { requests: [...] } directly
      else if (Array.isArray(response?.requests)) {
        requestsArray = response.requests;
      }
      // Fallbacks
      else if (Array.isArray(response?.data)) {
        requestsArray = response.data;
      } else if (Array.isArray(response)) {
        requestsArray = response;
      } else if (response?.data && typeof response.data === 'object') {
        requestsArray =
          response.data.requests ||
          response.data.data ||
          Object.values(response.data).find((v) => Array.isArray(v)) ||
          [];
      }
      setRestockRequests(Array.isArray(requestsArray) ? requestsArray : []);
    } catch (error) {
      console.error('Error loading restock requests:', error);
      const errorMessage = error?.response?.data?.message || error?.message || t('errors.fetchFailed', { defaultValue: 'Failed to load restock requests' });
      showError(errorMessage);
      setRestockRequests([]);
    }
  }, [projectId, materialType, t]);

  const loadDestroyMaterials = useCallback(async () => {
    setIsLoadingDestroyMaterials(true);
    try {
      const params = {};
      
      if (projectId) {
        params.projectID = projectId;
      }
      
      const response = await getDestroyedMaterials(params);
      
      // Handle different response structures
      let materialsArray = [];
      
      // Most common: axios response { data: { materials: [...] } }
      if (Array.isArray(response?.data?.materials)) {
        materialsArray = response.data.materials;
      }
      // http wrapper returning { materials: [...] } directly
      else if (Array.isArray(response?.materials)) {
        materialsArray = response.materials;
      }
      // Fallbacks
      else if (Array.isArray(response?.data)) {
        materialsArray = response.data;
      } else if (Array.isArray(response)) {
        materialsArray = response;
      } else if (response?.data && typeof response.data === 'object') {
        materialsArray =
          response.data.materials ||
          response.data.data ||
          Object.values(response.data).find((v) => Array.isArray(v)) ||
          [];
      }
      
      setDestroyMaterials(Array.isArray(materialsArray) ? materialsArray : []);
    } catch (error) {
      console.error('Error loading destroy materials:', error);
      const errorMessage = error?.response?.data?.message || error?.message || t('errors.fetchFailed', { defaultValue: 'Failed to load destroy materials' });
      showError(errorMessage);
      setDestroyMaterials([]);
    } finally {
      setIsLoadingDestroyMaterials(false);
    }
  }, [projectId, t]);

  // Load data when tab changes or projectId changes
  useEffect(() => {
    if (!user) return;
    
    if (activeTab === 'transfer') {
      loadTransferRequests();
    } else if (activeTab === 'ask') {
      loadAskMaterialRequests();
    } else if (activeTab === 'restock') {
      loadRestockRequests();
    } else if (activeTab === 'destroy') {
      loadDestroyMaterials();
    }
  }, [activeTab, projectId, materialType, user, loadTransferRequests, loadAskMaterialRequests, loadRestockRequests, loadDestroyMaterials]);

  const handleApproveRequest = async (approvedData) => {
    try {
      const requestId = approvedData.id || approvedData._id;
      
      if (!requestId) {
        showError(t('errors.requestIdRequired', { defaultValue: 'Transfer request ID is required' }));
        return;
      }
      
      // Get source inventory ID from the request (required for backend)
      const sourceInventoryId = approvedData.inventory_From_ID || approvedData.inventoryFromId || approvedData.inventoryFrom_ID;
      
      if (!sourceInventoryId) {
        showError(t('errors.sourceInventoryRequired', { defaultValue: 'Source inventory ID is required' }));
        return;
      }
      
      // Call approve API with transfer request ID in URL path
      await approveTransferRequest(requestId, {
        costPerUnit: approvedData.approvedCostPerUnit || approvedData.costPerUnit,
        quantity: approvedData.approvedQuantity || approvedData.quantity,
        totalPrice: approvedData.approvedTotalPrice || approvedData.totalPrice,
        inventoryId: sourceInventoryId,
        sourceInventoryId: sourceInventoryId,
      });
      
      // Update local state
      setTransferRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: 'approved' } : req
        )
      );
      
      showSuccess(t('transferRequest.approved', { defaultValue: 'Transfer request approved successfully' }));
      setApproveModalOpen(false);
      setSelectedRequest(null);
      
      // Reload transfer requests to get updated data
      await loadTransferRequests();
    } catch (error) {
      console.error('Error approving transfer request:', error);
      const errorMessage = error?.response?.data?.message || error?.message || t('errors.approveFailed', { defaultValue: 'Failed to approve transfer request' });
      showError(errorMessage);
    }
  };

  const handleRejectRequest = async (rejectedData) => {
    if (!selectedWorkspace) {
      showError(t('errors.workspaceRequired', { defaultValue: 'Please select a workspace first' }));
      return;
    }

    try {
      const requestId = rejectedData.id || rejectedData._id;
      
      // Map rejection type from modal ('voice', 'text', 'both') to API format ('audio', 'text', 'both')
      let rejectionType = rejectedData.rejectionType || 'text';
      if (rejectionType === 'voice') {
        rejectionType = 'audio';
      }
      
      // Call reject API
      await rejectTransferRequest(selectedWorkspace, {
        reason: rejectedData.textReason || 'Rejected',
        rejectionType: rejectionType,
        audioFile: rejectedData.voiceNote, 
      });
      
      // Update local state
      setTransferRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { 
            ...req, 
            status: 'rejected', 
            rejectionReason: rejectedData.textReason || 'Rejected',
            rejectionAudio: rejectedData.voiceNote ? true : false
          } : req
        )
      );
      
      showSuccess(t('transferRequest.rejected', { defaultValue: 'Transfer request rejected successfully' }));
      setRejectModalOpen(false);
      setSelectedRequest(null);
      
      // Reload transfer requests to get updated data
      await loadTransferRequests();
    } catch (error) {
      console.error('Error rejecting transfer request:', error);
      const errorMessage = error?.response?.data?.message || error?.message || t('errors.rejectFailed', { defaultValue: 'Failed to reject transfer request' });
      showError(errorMessage);
    }
  };

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setApproveModalOpen(true);
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  // Calculate pending transfer requests count
  const pendingTransferCount = transferRequests.filter((r) => r.status === 'pending').length;

  // Handle Add New Ask button
  const handleAddNewAsk = () => {
    navigate(ROUTES_FLAT.ADD_NEW_ASK, { state: { projectId, projectName } });
  };

  // Handle Restock Request Actions
  const handleRestockApprove = (request) => {
    // TODO: Implement approve restock request API call
    setRestockRequests((prev) =>
      prev.map((req) =>
        req.id === request.id ? { ...req, status: 'approved' } : req
      )
    );
  };

  const handleRestockRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const handleRestockReject = (rejectedData) => {
    // rejectedData contains the request with rejectionType, voiceNote, textReason
    const requestId = rejectedData.id || rejectedData._id;
    // TODO: Implement reject restock request API call with rejection reason
    setRestockRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { 
          ...req, 
          status: 'rejected', 
          rejectionReason: rejectedData.textReason || 'Rejected',
          rejectionAudio: rejectedData.voiceNote ? true : false
        } : req
      )
    );
    setRejectModalOpen(false);
    setSelectedRequest(null);
  };

  const handleAddStock = (request) => {
    navigate(ROUTES_FLAT.ADD_STOCK, {
      state: {
        request,
        projectId,
        projectName,
      },
    });
  };

  // Tabs configuration
  const tabs = [
    { id: 'inventory', label: t('tabs.inventory', { defaultValue: 'Inventory Materials' }) },
    { id: 'transfer', label: t('tabs.transfer', { defaultValue: 'Transfer Requests' }), badge: pendingTransferCount > 0 ? pendingTransferCount : undefined },
    { id: 'ask', label: t('tabs.ask', { defaultValue: 'Ask for Materials' }) },
    { id: 'restock', label: t('tabs.restock', { defaultValue: 'Restock Requests' }) },
    { id: 'destroy', label: t('tabs.destroy', { defaultValue: 'Destroy Materials' }) },
  ];

  // If loading, show loader
  if (isLoading && inventoryItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={projectName || t('title', { defaultValue: 'Site Inventory' })}
          showBackButton={!!projectId}
          onBack={projectId ? handleBack : undefined}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header with Search and Add Button */}
      <PageHeader
        title={projectName || t('title', { defaultValue: 'Site Inventory' })}
        showBackButton={!!projectId}
        onBack={projectId ? handleBack : undefined}
        className='capitalize'
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full lg:w-auto">
          {activeTab === 'inventory' && (
            <>
              <div className="flex-1 w-full sm:w-auto sm:flex-none">
                <SearchBar
                  placeholder={t('searchPlaceholder', { defaultValue: 'Search materials' })}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-[260px]"
                />
              </div>
              <Button
                variant="primary"
                onClick={handleCreateSiteInventory}
                leftIconName="Plus"
                iconSize="w-4 h-4"
                className="w-full sm:w-auto whitespace-nowrap"
              >
                {t('addButton', { defaultValue: 'Add New Inventory' })}
              </Button>
            </>
          )}
        </div>
      </PageHeader>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Material Type Filter - Only show for inventory tab */}
      {activeTab === 'inventory' && (
        <div className="mb-6 flex gap-6 flex-wrap">
          {isLoadingInventoryTypes ? (
            <Loader size="sm" />
          ) : (
            inventoryTypeOptions.map((type) => (
              <Radio
                key={type.value}
                name="materialType"
                value={type.value}
                checked={materialType?.toString() === type.value?.toString()}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  console.log('Selected inventory type:', selectedValue, 'Type:', type.label);
                  setMaterialType(selectedValue);
                }}
                label={type.label}
              />
            ))
          )}
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'inventory' && (
        <>
          {filteredItems.length === 0 && !isLoading ? (
            <EmptyState
              image={EmptyStateSvg}
              title={t('emptyState.title', { defaultValue: 'No Items Added' })}
              message={t('emptyState.message', { defaultValue: 'Add items to track your site inventory' })}
              actionLabel={t('emptyState.createButton', { defaultValue: 'Add Site Inventory' })}
              onAction={handleCreateSiteInventory}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredItems.map((item) => (
                <InventoryItemCard
                  key={item.id || item._id}
                  item={item}
                  onTransfer={handleTransfer}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onRestock={handleRestock}
                  onDestroy={handleDestroy}
                  onLogUsage={handleLogUsageClick}
                  onDownloadPDF={handleDownloadPDF}
                  onViewDetails={handleViewDetails}
                  inventoryTypes={inventoryTypes}
                  t={t}
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Transfer Requests Tab */}
      {activeTab === 'transfer' && (
        <>
          {/* Material Type Filter */}
          <div className="mb-6 flex gap-6 flex-wrap">
            {isLoadingInventoryTypes ? (
              <Loader size="sm" />
            ) : (
              inventoryTypeOptions.map((type) => (
                <Radio
                  key={type.value}
                  name="materialType"
                  value={type.value}
                  checked={materialType === type.value}
                  onChange={(e) => setMaterialType(e.target.value)}
                  label={type.label}
                />
              ))
            )}
          </div>

          {/* Transfer Requests List */}
          {isLoadingTransferRequests ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader size="lg" />
            </div>
          ) : transferRequests.length === 0 ? (
            <EmptyState
              image={EmptyStateSvg}
              title={t('transferRequests.emptyState.title', { defaultValue: 'No Transfer Requests' })}
              message={t('transferRequests.emptyState.message', { defaultValue: 'No transfer requests found' })}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {transferRequests.map((request) => (
                <TransferRequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectClick}
                  t={t}
                  formatTime={formatTime}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Restock Requests Tab */}
      {activeTab === 'restock' && (
        <>
          {/* Material Type Filter */}
          <div className="mb-6 flex gap-6 flex-wrap">
            {isLoadingInventoryTypes ? (
              <Loader size="sm" />
            ) : (
              inventoryTypeOptions.map((type) => (
                <Radio
                  key={type.value}
                  name="restockMaterialType"
                  value={type.value}
                  checked={materialType === type.value}
                  onChange={(e) => setMaterialType(e.target.value)}
                  label={type.label}
                />
              ))
            )}
          </div>

          {/* Restock Requests List */}
          {restockRequests.length === 0 ? (
            <EmptyState
              image={EmptyStateSvg}
              title={t('restockRequests.emptyState.title', { defaultValue: 'No Restock Requests' })}
              message={t('restockRequests.emptyState.message', { defaultValue: 'No restock requests found' })}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {restockRequests.map((request) => (
                <RestockRequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleRestockApprove}
                  onReject={handleRestockRejectClick}
                  onAddStock={handleAddStock}
                  t={t}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Ask for Materials Tab */}
      {activeTab === 'ask' && (
        <>
          {/* Material Type Filter with Add New Ask Link */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-6 flex-wrap">
              {isLoadingInventoryTypes ? (
                <Loader size="sm" />
              ) : (
                inventoryTypeOptions.map((type) => (
                  <Radio
                    key={type.value}
                    name="askMaterialType"
                    value={type.value}
                    checked={materialType === type.value}
                    onChange={(e) => setMaterialType(e.target.value)}
                    label={type.label}
                  />
                ))
              )}
            </div>
            <button
              onClick={handleAddNewAsk}
              className="flex items-center gap-2 text-accent hover:text-[#9F290A] transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4.5 h-4.5 rounded-full bg-accent flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-accent font-medium">
                {t('askForMaterials.addNewAsk', { defaultValue: 'Add New Ask' })}
              </span>
            </button>
          </div>

          {/* Ask for Materials List */}
          {askForMaterials.length === 0 ? (
            <EmptyState
              image={EmptyStateSvg}
              title={t('askForMaterials.emptyState.title', { defaultValue: 'No Material Requests' })}
              message={t('askForMaterials.emptyState.message', { defaultValue: 'No material requests found' })}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {askForMaterials.map((request) => (
                <AskForMaterialCard
                  key={request.id}
                  request={request}
                  t={t}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Destroy Materials Tab */}
      {activeTab === 'destroy' && (
        <>
          {/* Header with Add Destroy Material Button */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1"></div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setAddDestroyMaterialModalOpen(true);
                }}
                className="flex items-center gap-2 text-accent transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="w-4.5 h-4.5 rounded-full bg-accent flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-white stroke-3"/>
                </span>
                <span className="font-medium text-sm sm:text-base">
                  {t('destroyMaterials.addDestroyMaterial', { defaultValue: 'Add Destroy Material' })}
                </span>
              </button>
            </div>
          </div>

          {/* Destroy Materials List */}
          {isLoadingDestroyMaterials ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader size="lg" />
            </div>
          ) : destroyMaterials.length === 0 ? (
            <EmptyState
              image={EmptyStateSvg}
              title={t('destroyMaterials.emptyState.title', { defaultValue: 'No Destroyed Materials' })}
              message={t('destroyMaterials.emptyState.message', { defaultValue: 'No destroyed materials found' })}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {destroyMaterials.map((item) => (
                <DestroyMaterialCard
                  key={item.id || item._id}
                  item={item}
                  t={t}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Approve Transfer Modal */}
      <ApproveTransferModal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedRequest(null);
        }}
        onApprove={handleApproveRequest}
        request={selectedRequest}
        formatCurrency={formatCurrency}
      />

      {/* Reject Transfer/Restock Modal */}
      <RejectTransferModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedRequest(null);
        }}
        onReject={(rejectedData) => {
          // Check if it's a restock request or transfer request based on activeTab
          if (activeTab === 'restock') {
            handleRestockReject(rejectedData);
          } else {
            handleRejectRequest(rejectedData);
          }
        }}
        request={selectedRequest}
      />

      {/* Log Usage Modal */}
      <LogUsageModal
        isOpen={logUsageModalOpen}
        onClose={() => {
          setLogUsageModalOpen(false);
          setSelectedItem(null);
        }}
        onLogUsage={handleLogUsage}
        item={selectedItem}
      />

      {/* Destroy Material Modal */}
      <LogUsageModal
        isOpen={destroyModalOpen}
        onClose={() => {
          setDestroyModalOpen(false);
          setDestroyItem(null);
        }}
        onLogUsage={(logData) => {
          // TODO: Integrate destroy material API
          console.log('Destroy material from list page:', logData);
          setDestroyModalOpen(false);
          setDestroyItem(null);
        }}
        item={destroyItem}
        title={t('destroyModal.title', {
          defaultValue: 'Destroy {{itemName}}',
          itemName:
            destroyItem?.material?.name ||
            destroyItem?.materialName ||
            destroyItem?.name ||
            destroyItem?.itemName ||
            '',
        })}
        subtitle={t('destroyModal.subtitle', {
          defaultValue:
            'Enter the quantity of material that has been damaged or discarded.',
        })}
      />

      {/* Add Destroy Material Modal */}
      <DestroyMaterialModal
        isOpen={addDestroyMaterialModalOpen}
        onClose={() => {
          setAddDestroyMaterialModalOpen(false);
        }}
        onDestroy={handleAddDestroyMaterial}
        projectId={projectId}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={
          itemToDelete?.item
            ? t('deleteModal.title', {
                defaultValue: 'Delete {{itemName}}',
                itemName:
                  itemToDelete.item?.material?.name ||
                  itemToDelete.item.materialName ||
                  itemToDelete.item.name ||
                  itemToDelete.item.itemName ||
                  'Item',
              })
            : t('deleteModal.title', { defaultValue: 'Delete Item', itemName: 'Item' })
        }
        message={
          itemToDelete?.item
            ? t('deleteModal.message', {
                defaultValue: 'Are you sure you want to delete {{itemName}} from inventory? This action is irreversible, and your data cannot be recovered.',
                itemName: (
                  itemToDelete.item?.material?.name ||
                  itemToDelete.item.materialName ||
                  itemToDelete.item.name ||
                  itemToDelete.item.itemName ||
                  'this item'
                ).toLowerCase(),
              })
            : t('deleteModal.message', {
                defaultValue: 'Are you sure you want to delete this item? This action is irreversible.',
                itemName: 'this item',
              })
        }
        confirmText={t('deleteConfirm', { defaultValue: 'Yes, Delete' })}
        cancelText={t('cancel', { defaultValue: 'Cancel' })}
        confirmVariant="danger"
        isLoading={isLoading}
      />
    </div>
  );
}

