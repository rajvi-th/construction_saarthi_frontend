import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import EmptyState from '../../../components/shared/EmptyState';
import EmptyStateSvg from '../../../assets/icons/EmptyState.svg';
import Loader from '../../../components/ui/Loader';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Radio from '../../../components/ui/Radio';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { InventoryItemCard, Tabs, TransferRequestCard } from '../components';
import { useSiteInventory } from '../hooks';
import { useAuth } from '../../auth/store';
import { ROUTES_FLAT } from '../../../constants/routes';
import { PROJECT_ROUTES } from '../../projects/constants';
import { useDebounce } from '../../../hooks/useDebounce';

export default function SiteInventory() {
  const { t } = useTranslation('siteInventory');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getItems, deleteItem, isLoading } = useSiteInventory();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [materialType, setMaterialType] = useState('reusable'); // 'reusable' or 'consumable'
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'transfer', 'ask', 'restock', 'destroy'
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [transferRequests, setTransferRequests] = useState([]);
  
  // Get project context from navigation state (if navigated from project details)
  const projectId = location.state?.projectId;
  const projectName = location.state?.projectName;
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (user) {
      loadInventoryItems();
    }
  }, [user]);

  // Filter items based on search and material type
  useEffect(() => {
    let filtered = [...inventoryItems];
    
    // Filter by material type
    if (materialType) {
      filtered = filtered.filter((item) => {
        const itemType = item?.materialType || item?.type || item?.category;
        return itemType?.toLowerCase() === materialType.toLowerCase();
      });
    }
    
    // Filter by search query
    if (debouncedSearch.trim()) {
      const search = debouncedSearch.toLowerCase();
      filtered = filtered.filter((item) => {
        const itemName = (item?.name || item?.itemName || '').toLowerCase();
        const specification = (item?.specification || item?.spec || '').toLowerCase();
        return itemName.includes(search) || specification.includes(search);
      });
    }
    
    setFilteredItems(filtered);
  }, [inventoryItems, materialType, debouncedSearch]);

  // Mock data for demonstration
  const getMockInventoryItems = () => {
    const currentDate = new Date();
    const mockItems = [
      {
        id: '1',
        name: 'Plywood',
        specification: '48"x96"',
        quantity: 300,
        quantityUnit: 'Sheets',
        costPerUnit: 150,
        totalPrice: 45000,
        materialType: 'reusable',
        date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        projectId: projectId || null,
      },
      {
        id: '2',
        name: 'Teka',
        specification: '100 piece',
        quantity: 300,
        quantityUnit: 'Sheets',
        costPerUnit: 150,
        totalPrice: 45000,
        materialType: 'reusable',
        date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        projectId: projectId || null,
      },
      {
        id: '3',
        name: 'Cement',
        specification: '50kg bag',
        quantity: 100,
        quantityUnit: 'Bags',
        costPerUnit: 400,
        totalPrice: 40000,
        materialType: 'consumable',
        purchased: 150,
        currentStock: 130,
        purchasedPrice: 150,
        date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        projectId: projectId || null,
      },
      {
        id: '4',
        name: 'Steel Rods',
        specification: '12mm',
        quantity: 500,
        quantityUnit: 'Pieces',
        costPerUnit: 80,
        totalPrice: 40000,
        materialType: 'reusable',
        date: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        projectId: projectId || null,
      },
      {
        id: '5',
        name: 'Sand',
        specification: 'Fine',
        quantity: 200,
        quantityUnit: 'Cubic Feet',
        costPerUnit: 50,
        totalPrice: 10000,
        materialType: 'consumable',
        purchased: 250,
        currentStock: 200,
        purchasedPrice: 50,
        date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        projectId: projectId || null,
      },
    ];
    return mockItems;
  };

  const loadInventoryItems = async () => {
    try {
      // Try to get items from API first
      const itemsArray = await getItems();
      
      // Ensure we have an array
      let allItems = Array.isArray(itemsArray) ? itemsArray : [];
      
      // If no items from API, use mock data
      if (allItems.length === 0) {
        allItems = getMockInventoryItems();
      }
      
      // Filter items to show only logged-in user's items (if user filtering needed)
      const userId = user?.id || user?.userId || user?.user_id || user?._id;
      
      let filteredItems = allItems;
      
      if (userId) {
        filteredItems = allItems.filter((item) => {
          const itemUserId = item?.userId || 
                            item?.user_id || 
                            item?.user?.id || 
                            item?.user?._id ||
                            item?.createdBy ||
                            item?.created_by ||
                            item?.ownerId ||
                            item?.owner_id;
          
          // If item has userId, filter by it, otherwise show all (for mock data)
          if (itemUserId) {
            return String(itemUserId) === String(userId);
          }
          return true; // Show items without userId (mock data)
        });
      }
      
      // If projectId is provided, filter items by project
      if (projectId) {
        filteredItems = filteredItems.filter((item) => {
          const itemProjectId = item?.projectId || 
                               item?.project_id || 
                               item?.project?.id ||
                               item?.project?.project_id;
          // If item has projectId, filter by it, otherwise show all (for mock data)
          if (itemProjectId) {
            return String(itemProjectId) === String(projectId);
          }
          return true; // Show items without projectId (mock data)
        });
      }
      
      setInventoryItems(filteredItems);
    } catch (error) {
      // On error, use mock data
      const mockItems = getMockInventoryItems();
      setInventoryItems(mockItems);
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

  const handleRestock = (item) => {
    // TODO: Implement restock functionality
    console.log('Restock item:', item);
  };

  const handleLogUsage = (item) => {
    // TODO: Implement log usage functionality
    console.log('Log usage for item:', item);
  };

  const handleDestroy = (item) => {
    // TODO: Implement destroy functionality
    console.log('Destroy item:', item);
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

  // Mock data for transfer requests
  const getMockTransferRequests = () => {
    const currentDate = new Date();
    return [
      {
        id: '1',
        quantity: 25,
        materialName: 'Plywood Sheets',
        specification: '48"x96"',
        fromProject: 'Shiv Residency',
        toProject: 'Shree Villa',
        status: 'approved',
        timestamp: new Date(currentDate.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: '2',
        quantity: 25,
        materialName: 'Plywood Sheets',
        specification: '48"x96"',
        fromProject: 'Shiv Residency',
        toProject: 'Shree Villa',
        status: 'rejected',
        timestamp: new Date(currentDate.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        rejectionReason: 'Currently in use! we\'ll update you!',
        rejectionAudio: true, // Has audio rejection reason
      },
      {
        id: '3',
        quantity: 25,
        materialName: 'Plywood Sheets',
        specification: '48"x96"',
        fromProject: 'Shiv Residency',
        toProject: 'Shree Villa',
        status: 'pending',
        timestamp: new Date(currentDate.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      },
      {
        id: '4',
        quantity: 25,
        materialName: 'Plywood Sheets',
        specification: '48"x96"',
        fromProject: 'Shiv Residency',
        toProject: 'Shree Villa',
        status: 'pending',
        timestamp: new Date(currentDate.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      },
      {
        id: '5',
        quantity: 25,
        materialName: 'Plywood Sheets',
        specification: '48"x96"',
        fromProject: 'Shiv Residency',
        toProject: 'Shree Villa',
        status: 'pending',
        timestamp: new Date(currentDate.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      },
      {
        id: '6',
        quantity: 25,
        materialName: 'Plywood Sheets',
        specification: '48"x96"',
        fromProject: 'Shiv Residency',
        toProject: 'Shree Villa',
        status: 'pending',
        timestamp: new Date(currentDate.getTime() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
      },
    ];
  };

  useEffect(() => {
    if (activeTab === 'transfer') {
      // Load transfer requests when transfer tab is active
      const mockRequests = getMockTransferRequests();
      setTransferRequests(mockRequests);
    }
  }, [activeTab]);

  const handleApproveRequest = (requestId) => {
    // TODO: Implement approve API call
    setTransferRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: 'approved' } : req
      )
    );
  };

  const handleRejectRequest = (requestId) => {
    // TODO: Implement reject API call with rejection reason
    setTransferRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: 'rejected', rejectionReason: 'Currently in use! we\'ll update you!' } : req
      )
    );
  };

  // Calculate pending transfer requests count
  const pendingTransferCount = transferRequests.filter((r) => r.status === 'pending').length;

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
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full lg:w-auto">
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
            iconSize="w-4 h-4 text-accent"
            className="w-full sm:w-auto whitespace-nowrap"

          >
            {t('addButton', { defaultValue: 'Add New Inventory' })}
          </Button>
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
        <div className="mb-6 flex gap-6">
          <Radio
            name="materialType"
            value="reusable"
            checked={materialType === 'reusable'}
            onChange={(e) => setMaterialType(e.target.value)}
            label={t('materialType.reusable', { defaultValue: 'Reusable' })}
          />
          <Radio
            name="materialType"
            value="consumable"
            checked={materialType === 'consumable'}
            onChange={(e) => setMaterialType(e.target.value)}
            label={t('materialType.consumable', { defaultValue: 'Consumable' })}
          />
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
                  onLogUsage={handleLogUsage}
                  onDownloadPDF={handleDownloadPDF}
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
          <div className="mb-6 flex gap-6">
            <Radio
              name="materialType"
              value="reusable"
              checked={materialType === 'reusable'}
              onChange={(e) => setMaterialType(e.target.value)}
              label={t('materialType.reusable', { defaultValue: 'Reusable' })}
            />
            <Radio
              name="materialType"
              value="consumable"
              checked={materialType === 'consumable'}
              onChange={(e) => setMaterialType(e.target.value)}
              label={t('materialType.consumable', { defaultValue: 'Consumable' })}
            />
          </div>

          {/* Transfer Requests List */}
          {transferRequests.length === 0 ? (
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
                  onReject={handleRejectRequest}
                  t={t}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Other tabs - Placeholder */}
      {activeTab !== 'inventory' && activeTab !== 'transfer' && (
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-gray-600">
            {t('tabComingSoon', { defaultValue: 'This feature is coming soon...' })}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={
          itemToDelete?.item
            ? t('deleteModal.title', {
                defaultValue: 'Delete {{itemName}}',
                itemName: itemToDelete.item.name || itemToDelete.item.itemName || 'Item',
              })
            : t('deleteModal.title', { defaultValue: 'Delete Item', itemName: 'Item' })
        }
        message={
          itemToDelete?.item
            ? t('deleteModal.message', {
                defaultValue: 'Are you sure you want to delete {{itemName}} from inventory? This action is irreversible, and your data cannot be recovered.',
                itemName: (itemToDelete.item.name || itemToDelete.item.itemName || 'this item').toLowerCase(),
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

