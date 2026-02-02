/**
 * Inventory Item Details Page (Fully Responsive UI)
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import Loader from '../../../components/ui/Loader';
import Pagination from '../../../components/ui/Pagination';
import StatusBadge from '../../../components/ui/StatusBadge';
import { LogUsageModal, ReleaseModal, InventoryItemHeader, InventoryItemInfo } from '../components';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import Button from '../../../components/ui/Button';
import { showError, showSuccess } from '../../../utils/toast';
import { getSiteInventory, useMaterial, destroyMaterial } from '../api/siteInventoryApi';
import { useWorkspaceRole } from '../../dashboard/hooks';

export default function InventoryItemDetails() {
  const { t } = useTranslation('siteInventory');
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const currentUserRole = useWorkspaceRole();

  // Check if user can add/edit/delete (supervisor role cannot)
  const canModifyInventory = currentUserRole?.toLowerCase() !== 'supervisor';

  const { projectId, projectName, fromProjects, fromDashboard } = location.state || {};

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [distributionHistory, setDistributionHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [logUsageModalOpen, setLogUsageModalOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [destroyModalOpen, setDestroyModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadItemDetails();
    }
  }, [id]);

  const loadItemDetails = async () => {
    setIsLoading(true);
    try {
      const response = await getSiteInventory(id);
      const data = response?.data || response;

      if (data) {
        setItem(data);
        // Map distributions and ensure requestType is mapped to type for consistency
        const history = (data.distributions || []).map(dist => ({
          ...dist,
          type: dist.requestType || 'transfer'
        }));
        setDistributionHistory(history);
      }
    } catch (error) {
      console.error('Error loading item details:', error);
      showError(t('itemDetails.errorLoading', { defaultValue: 'Error loading item details' }));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  const handleBack = () => {
    navigate(ROUTES_FLAT.SITE_INVENTORY, { 
      state: { 
        projectId, 
        projectName, 
        fromProjects, 
        fromDashboard 
      } 
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

  const itemName = item.materialName || item.material?.name || 'Unnamed Item';
  const quantityDetails = item.quantityDetails || [];
  const specification = item.description || item.Description || "";
  const images = (item.images || []).map(img => typeof img === 'string' ? img : img.url);

  let totalQuantity = item.quantity !== undefined ? item.quantity : quantityDetails.reduce((sum, d) => sum + (parseFloat(d.itemCount) || 0), 0);
  let avgCostPerUnit = item.avgCostPerUnit !== undefined ? item.avgCostPerUnit : (quantityDetails.length ? (quantityDetails.reduce((s, d) => s + d.price, 0) / quantityDetails.length) : 0);
  let totalPrice = item.totalPrice || totalQuantity * avgCostPerUnit;
  let currentStock = item.currentStock !== undefined ? item.currentStock : totalQuantity;

  const quantityUnit = item.unitName || item.material?.unitName || "pcs";
  const lastUpdated = item.updatedAt || item.createdAt;

  // Separate & sort
  const usedDistributions = distributionHistory.filter(d => d.type === 'used');
  const transferDistributions = distributionHistory.filter(d => d.type === 'transfer');
  const sortedHistory = [...usedDistributions, ...transferDistributions];

  const totalItems = sortedHistory.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = sortedHistory.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();

    if (statusLower === 'approved') {
      return (
        <StatusBadge
          text={t('itemDetails.status.approved', { defaultValue: 'Approved' })}
          color="green"
          className="text-xs font-medium"
        />
      );
    }

    if (statusLower === 'pending') {
      return (
        <StatusBadge
          text={t('itemDetails.status.pending', { defaultValue: 'Pending' })}
          color="yellow"
          className="text-xs font-medium"
        />
      );
    }

    if (statusLower === 'rejected') {
      return (
        <StatusBadge
          text={t('itemDetails.status.rejected', { defaultValue: 'Rejected' })}
          color="red"
          className="text-xs font-medium"
        />
      );
    }

    return null;
  };

  const handleOpenLogUsage = () => {
    setLogUsageModalOpen(true);
  };

  const handleCloseLogUsage = () => {
    setLogUsageModalOpen(false);
  };

  const handleLogUsage = async (logData) => {
    try {
      await useMaterial({
        inventoryId: id,
        quantity: logData.quantity,
        reason: logData.reason
      });
      showSuccess(t('itemDetails.usageLogged', { defaultValue: 'Usage logged successfully' }));
      setLogUsageModalOpen(false);
      loadItemDetails(); // Refetch data
    } catch (error) {
      console.error('Error logging usage:', error);
      showError(t('itemDetails.errorLoggingUsage', { defaultValue: 'Error logging usage' }));
    }
  };

  const handleOpenRelease = (distribution) => {
    setSelectedRelease(distribution);
    setReleaseModalOpen(true);
  };

  const handleCloseRelease = () => {
    setReleaseModalOpen(false);
    setSelectedRelease(null);
  };

  const handleRelease = async (data) => {
    // TODO: Integrate release API
    console.log('Release from details page:', data);
    setReleaseModalOpen(false);
    setSelectedRelease(null);
  };

  const handleDestroy = async (logData) => {
    try {
      await destroyMaterial({
        inventoryId: id,
        quantity: logData.quantity,
        reason: logData.reason
      });
      showSuccess(t('itemDetails.materialDestroyed', { defaultValue: 'Material destruction logged' }));
      setDestroyModalOpen(false);
      loadItemDetails(); // Refetch data
    } catch (error) {
      console.error('Error destroying material:', error);
      showError(t('itemDetails.errorDestroying', { defaultValue: 'Error logging material destruction' }));
    }
  };

  const handleTransferMaterial = () => {
    const itemId = item?.id || item?._id || id;
    if (!itemId) {
      showError(t('errors.inventoryIdRequired', { defaultValue: 'Inventory ID is required' }));
      return;
    }

    navigate(getRoute(ROUTES_FLAT.TRANSFER_MATERIAL, { inventoryId: itemId }), {
      state: {
        projectId,
        projectName,
        fromProjects,
        fromDashboard,
        itemName,
        item,
        fromDetails: true,
      },
    });
  };

  const handleAskForMaterial = () => {
    navigate(ROUTES_FLAT.ADD_NEW_ASK, {
      state: {
        projectId,
        projectName,
        fromProjects,
        fromDashboard,
        itemName,
        item,
        fromDetails: true,
      },
    });
  };

  const handleEdit = () => {
    navigate(ROUTES_FLAT.EDIT_SITE_INVENTORY.replace(':id', id), {
      state: { 
        projectId, 
        projectName, 
        fromProjects, 
        fromDashboard,
        itemName,
        fromDetails: true
      },
    });
  };

  const inventoryTypeId = item.inventoryTypeId?.toString();
  const isConsumable = item.material?.typeName?.toLowerCase().includes('consumable') ||
    item.material?.inventoryType?.toLowerCase().includes('consumable') ||
    item.inventoryType?.toLowerCase().includes('consumable');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-0">
      {/* Header */}
      <InventoryItemHeader
        itemName={itemName}
        onBack={handleBack}
        onEdit={canModifyInventory ? handleEdit : null}
        onAskForMaterial={handleAskForMaterial}
        onTransferMaterial={handleTransferMaterial}
        onDestroy={() => setDestroyModalOpen(true)}
        onDelete={() => { }}
        isConsumable={isConsumable}
      />

      {/* Item Info */}
      <InventoryItemInfo
        itemName={itemName}
        specification={specification}
        quantityUnit={quantityUnit}
        lastUpdated={lastUpdated}
        formatDate={formatDate}
      />

      {/* Overview */}
      <div className="bg-[#F9F5EF] rounded-2xl p-4 sm:p-6 mb-6 border border-[#060C120F]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-center">

          {[
            {
              label: t('itemDetails.quantity', { defaultValue: 'Quantity' }),
              value: `${totalQuantity} ${quantityUnit}`,
            },
            {
              label: t('itemDetails.avgCostPerUnit', { defaultValue: 'Avg Cost per Unit' }),
              value: `${formatCurrency(avgCostPerUnit)}/${quantityUnit}`,
            },
            {
              label: t('itemDetails.totalPrice', { defaultValue: 'Total Price' }),
              value: formatCurrency(totalPrice),
            },
            {
              label: t('itemDetails.currentStock', { defaultValue: 'Current Stock' }),
              value: `${currentStock} ${quantityUnit}`,
            },
          ].map((item, i) => (
            <div key={i} className="pb-4 lg:pb-0 lg:border-r-2 border-[#E7D7C1] last:border-none">
              <p className="text-secondary">{item.label}</p>
              <p className="text-lg sm:text-xl font-medium text-primary">{item.value}</p>
            </div>
          ))}

        </div>
      </div>

      {/* Description */}
      {(specification || images.length) > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-primary">
            {t('itemDetails.conditionDescription', { defaultValue: 'Condition/Description' })}
          </h2>

          {specification && (
            <p className="text-sm text-secondary mt-1">{specification}</p>
          )}

          <div className="flex gap-3 sm:gap-4 mt-4 flex-wrap">
            {images.slice(0, 3).map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribution */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold text-primary">
            {t('itemDetails.distribution', { defaultValue: 'Distribution' })}
          </h2>

          <div
            className="flex items-center gap-2 text-accent font-medium text-sm cursor-pointer hover:opacity-75"
            onClick={handleOpenLogUsage}
          >
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white" />
            </div>
            {t('itemDetails.usedInYourSite', { defaultValue: 'Used in Your Site' })}
          </div>
        </div>

        {sortedHistory.length === 0 ? (
          <p className="text-center text-secondary text-sm py-8">
            {t('itemDetails.noDistribution', { defaultValue: 'No distribution history available' })}
          </p>
        ) : (
          <div className="space-y-2 mb-6">
            {paginatedHistory.map((dist) => {
              const isUsed = dist.type === 'used';

              return (
                <div
                  key={dist.id}
                  className="p-3 sm:p-4 bg-white shadow-sm border border-black-soft rounded-xl"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-3">
                        <h3 className="font-medium text-primary capitalize">
                          {isUsed
                            ? `${dist.quantity} ${quantityUnit} • ${itemName}`
                            : dist.projectName}
                        </h3>

                        <span className="capitalize!">
                          {!isUsed && getStatusBadge(dist.status)}
                        </span>
                      </div>

                      <div className="mt-1 space-y-1 text-xs sm:text-sm text-secondary">
                        <p>{formatDate(dist.date)}</p>

                        {!isUsed && (
                          <p>
                            {t('itemDetails.quantity', { defaultValue: 'Quantity' })}:{' '}
                            <span className="font-medium text-primary">
                              {dist.quantity} {quantityUnit}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {isUsed && (
                      <Button
                        size="sm"
                        className="bg-accent text-white px-3 py-1 text-xs sm:text-sm rounded-full"
                        onClick={() => handleOpenRelease(dist)}
                      >
                        {t('itemDetails.release', { defaultValue: 'Release' })}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
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

      {/* Used In Your Site / Log Usage Modal */}
      <LogUsageModal
        isOpen={logUsageModalOpen}
        onClose={handleCloseLogUsage}
        onLogUsage={handleLogUsage}
        item={item}
        title={t('itemDetails.usedInYourSite', { defaultValue: 'Used In Your Site' })}
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
      />

      {/* Release Modal */}
      <ReleaseModal
        isOpen={releaseModalOpen}
        onClose={handleCloseRelease}
        onRelease={handleRelease}
        item={item}
        distribution={selectedRelease}
        title={t('releaseModal.title', {
          defaultValue: 'Release {{itemName}}',
          itemName,
        })}
        subtitle={t('releaseModal.subtitle', {
          defaultValue: 'Enter the quantity you want to release from site.',
        })}
      />
    </div>
  );
}
