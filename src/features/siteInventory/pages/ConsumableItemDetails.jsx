import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Loader from '../../../components/ui/Loader';
import Pagination from '../../../components/ui/Pagination';
import { LogUsageModal, InventoryItemHeader, InventoryItemInfo } from '../components';
import { ROUTES_FLAT } from '../../../constants/routes';

export default function ConsumableItemDetails() {
  const { t } = useTranslation('siteInventory');
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const projectId = location.state?.projectId;
  const projectName = location.state?.projectName;

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logUsageHistory, setLogUsageHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [logUsageModalOpen, setLogUsageModalOpen] = useState(false);
  const [destroyModalOpen, setDestroyModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadItemDetails();
    }
  }, [id]);

  const loadItemDetails = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock data matching the API structure
    const mockItem = {
      id: id,
      materialName: 'Cement (Ultratech)',
      material: { 
        name: 'Cement (Ultratech)', 
        unitId: 6, 
        unitName: 'Bags' 
      },
      Description: 'Cement (Ultratech 43 Grade)',
      Quantity: 150,
      quantity: 150,
      costPerUnit: 380,
      totalPrice: 57000,
      projectID: projectId || '11',
      projectName: projectName || 'Sunrise Villa - Site A',
      inventoryTypeId: 2, // 2 = consumable
      createdAt: '2025-12-03T09:35:58.722Z',
      updatedAt: '2025-12-03T09:35:58.722Z',
    };

    // Mock log usage history
    const mockLogUsageHistory = [
      {
        id: '1',
        quantity: 10,
        user: 'Shree Villa',
        role: 'Supervisor',
        description: 'Elus veniam quos occaecati aliquid. Rerum et eaque doloribus dolorem.',
        date: '2025-06-28T10:00:00.000Z',
        createdAt: '2025-06-28T10:00:00.000Z',
      },
      {
        id: '2',
        quantity: 5,
        user: 'Mira Homes',
        role: 'Supervisor',
        description: '',
        date: '2025-06-27T10:00:00.000Z',
        createdAt: '2025-06-27T10:00:00.000Z',
      },
      {
        id: '3',
        quantity: 12,
        user: 'Aarav',
        role: 'Supervisor',
        description: '',
        date: '2025-06-25T10:00:00.000Z',
        createdAt: '2025-06-25T10:00:00.000Z',
      },
      {
        id: '4',
        quantity: 10,
        user: 'Mahesh Kanojiya',
        role: 'Supervisor',
        description: '',
        date: '2025-06-24T10:00:00.000Z',
        createdAt: '2025-06-24T10:00:00.000Z',
      },
    ];

    setItem(mockItem);
    setLogUsageHistory(mockLogUsageHistory);
    setIsLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  const handleBack = () => {
    navigate(ROUTES_FLAT.SITE_INVENTORY, { 
      state: projectId ? { projectId, projectName } : undefined 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">
          {t('itemDetails.notFound', { defaultValue: 'Item not found' })}
        </p>
        <Button
          variant="secondary"
          onClick={handleBack}
          className="mt-4"
        >
          {t('itemDetails.backToList', { defaultValue: 'Back to List' })}
        </Button>
      </div>
    );
  }

  // Extract item data
  const itemName = item.material?.name || item.materialName || 'Unnamed Item';
  const specification = item.Description || '';
  const quantityUnit = item.material?.unitName || item.unit || 'pcs';
  
  // Calculate stats
  const purchased = item.Quantity || item.quantity || 0;
  const used = logUsageHistory.reduce((sum, log) => sum + (parseFloat(log.quantity) || 0), 0);
  const inStock = Math.max(purchased - used, 0);
  const avgCostPerUnit = item.costPerUnit || 0;
  const totalPrice = item.totalPrice || (purchased * avgCostPerUnit);

  // Sort log usage history by date (newest first)
  const sortedLogHistory = [...logUsageHistory].sort((a, b) => {
    const aDate = new Date(a.date || a.createdAt || 0);
    const bDate = new Date(b.date || b.createdAt || 0);
    return bDate - aDate;
  });

  const totalItems = sortedLogHistory.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogHistory = sortedLogHistory.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenLogUsage = () => {
    setLogUsageModalOpen(true);
  };

  const handleCloseLogUsage = () => {
    setLogUsageModalOpen(false);
  };

  const handleLogUsage = async (logData) => {
    // TODO: Integrate log usage API
    console.log('Log usage from consumable details page:', logData);
    
    // Add to local state for immediate UI update
    const newLog = {
      id: Date.now().toString(),
      quantity: logData.usedQuantity,
      user: logData.userName || 'Current User',
      role: logData.role || 'Supervisor',
      description: logData.description || '',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    setLogUsageHistory(prev => [newLog, ...prev]);
    setLogUsageModalOpen(false);
  };

  const handleDestroy = async (logData) => {
    // TODO: Integrate destroy material API
    console.log('Destroy material from consumable details page:', logData);
    setDestroyModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-0">
      {/* Header */}
      <InventoryItemHeader
        itemName={itemName}
        onBack={handleBack}
        onDelete={() => {}}
        isConsumable={true}
      />

      {/* Item Info */}
      <InventoryItemInfo
        itemName={itemName}
        specification={specification}
        quantityUnit={quantityUnit}
        projectName={projectName}
        formatDate={formatDate}
      />

      {/* Stats Cards - Purchased, Used, In Stock, Avg Cost, Total Price */}
      <div className="bg-[#F9F5EF] rounded-2xl p-4 sm:p-6 mb-6 border border-[#060C120F] shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="text-center pb-4 sm:pb-0 lg:border-r-2 border-[#E7D7C1]">
            <p className="text-xs sm:text-sm text-secondary mb-1">
              {t('purchased', { defaultValue: 'Purchased' })}
            </p>
            <p className="text-base sm:text-lg font-semibold text-primary">
              {purchased} {quantityUnit}
            </p>
          </div>
          
          <div className="text-center pb-4 sm:pb-0 lg:border-r-2 border-[#E7D7C1]">
            <p className="text-xs sm:text-sm text-secondary mb-1">
              {t('used', { defaultValue: 'Used' })}
            </p>
            <p className="text-base sm:text-lg font-semibold text-primary">
              {used} {quantityUnit}
            </p>
          </div>
          
          <div className="text-center pb-4 sm:pb-0 lg:border-r-2 border-[#E7D7C1]">
            <p className="text-xs sm:text-sm text-secondary mb-1">
              {t('inStock', { defaultValue: 'In Stock' })}
            </p>
            <p className="text-base sm:text-lg font-semibold text-primary">
              {inStock} {quantityUnit}
            </p>
          </div>
          
          <div className="text-center pb-4 sm:pb-0 lg:border-r-2 border-[#E7D7C1]">
            <p className="text-xs sm:text-sm text-secondary mb-1">
              {t('itemDetails.avgCostPerUnit', { defaultValue: 'Avg Cost per Unit' })}
            </p>
            <p className="text-base sm:text-lg font-semibold text-primary">
              {formatCurrency(avgCostPerUnit)}
            </p>
          </div>
          
          <div className="text-center col-span-2 sm:col-span-1 pb-4 sm:pb-0">
            <p className="text-xs sm:text-sm text-secondary mb-1">
              {t('itemDetails.totalPrice', { defaultValue: 'Total Price' })}
            </p>
            <p className="text-base sm:text-lg font-semibold text-primary">
              {formatCurrency(totalPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Log Usage Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">
            {t('logUsage', { defaultValue: 'Log Usage' })}
          </h2>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenLogUsage}
            className="bg-accent hover:bg-accent/90 whitespace-nowrap"
          >
            {t('actions.addLogUsage', { defaultValue: 'Add Log Usage' })}
          </Button>
        </div>

        {sortedLogHistory.length === 0 ? (
          <p className="text-center text-secondary text-sm py-8">
            {t('noLogUsage', { defaultValue: 'No log usage history available' })}
          </p>
        ) : (
          <div className="space-y-0 mb-6">
            {paginatedLogHistory.map((log, index) => (
              <div
                key={log.id}
                className={`p-4 sm:p-5 border-b border-black-soft ${
                  index === 0 ? 'rounded-t-xl' : ''
                } ${
                  index === paginatedLogHistory.length - 1 ? 'rounded-b-xl border-b-0' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap flex-col items-start gap-2">
                      <span className="text-xs sm:text-sm text-secondary">
                        {formatDate(log.date || log.createdAt)}
                      </span>
                      <span className="text-sm sm:text-base text-secondary">
                        <span className="text-primary font-medium">{log.quantity}</span> {quantityUnit} {t('used', { defaultValue: 'Used' })} by <span className="text-primary font-medium">{log.user}</span>
                      </span>
                    </div>
                    
                    {log.role && (
                      <p className="text-xs sm:text-sm text-secondary mb-2">
                        {log.role}
                      </p>
                    )}
                    
                    {log.description && (
                      <p className="text-xs sm:text-sm text-secondary">
                        {log.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Log Usage Modal */}
      <LogUsageModal
        isOpen={logUsageModalOpen}
        onClose={handleCloseLogUsage}
        onLogUsage={handleLogUsage}
        item={item}
        title={t('logUsageModal.title', { defaultValue: 'Log Usage' })}
        subtitle={t('logUsageModal.subtitle', { defaultValue: 'Enter the quantity used on your site.' })}
      />

      {/* Destroy Material Modal */}
      <LogUsageModal
        isOpen={destroyModalOpen}
        onClose={() => setDestroyModalOpen(false)}
        onLogUsage={handleDestroy}
        item={item}
        title={t('destroyModal.title', {
          defaultValue: 'Destroy {{itemName}}',
          itemName,
        })}
        subtitle={t('destroyModal.subtitle', {
          defaultValue: 'Enter the quantity of material that has been damaged or discarded.',
        })}
        confirmText={t('destroyModal.destroy', { defaultValue: 'Destroy' })}
        cancelText={t('destroyModal.cancel', { defaultValue: 'Cancel' })}
      />
    </div>
  );
}

