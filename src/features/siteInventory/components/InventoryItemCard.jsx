/**
 * Inventory Item Card Component
 * Displays a single inventory item with details and actions
 */

import { ArrowLeftRight, RotateCw, AlertTriangle, Download, Trash2, Plus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import DropdownMenu from '../../../components/ui/DropdownMenu';

export default function InventoryItemCard({
  item,
  onTransfer,
  onEdit,
  onDelete,
  onRestock,
  onDestroy,
  onLogUsage,
  onDownloadPDF,
  onViewDetails,
  inventoryTypes = [], // Array of inventory types from API
  t,
  formatDate,
  formatCurrency,
}) {
  const itemId = item.id || item._id;
  
  // Handle new API response structure
  // New structure: item.material.name OR item.materialName, item.Description, item.quantityDetails[]
  // Old structure: item.name, item.specification, item.quantity
  const itemName =
    item?.material?.name ||
    item.materialName ||
    item.name ||
    item.itemName ||
    'Unnamed Item';
  const specification = item.Description || item.specification || item.spec || '';
  
  // Handle quantityDetails array (new structure)
  const quantityDetails = item.quantityDetails || [];
  let quantity = item.quantity ?? item.Quantity ?? 0;
  let costPerUnit = item.costPerUnit || item.unitPrice || 0;
  
  if (quantityDetails.length > 0) {
    // Sum up all quantity values for total quantity
    quantity = quantityDetails.reduce((sum, detail) => {
      const detailQty =
        detail.itemCount ?? detail.Quantity ?? detail.quantity ?? 0;
      return sum + (parseFloat(detailQty) || 0);
    }, 0);

    // Get average price or first price for costPerUnit
    const prices = quantityDetails
      .map((detail) => {
        const p = detail.price ?? detail.costPerUnit;
        return parseFloat(p) || 0;
      })
      .filter((price) => price > 0);
    if (prices.length > 0) {
      costPerUnit = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    } else if (quantityDetails[0]?.price || quantityDetails[0]?.costPerUnit) {
      const firstPrice =
        quantityDetails[0].price ?? quantityDetails[0].costPerUnit;
      costPerUnit = parseFloat(firstPrice) || 0;
    }
  }
  
  // Get unit - new structure has material.unitId
  // TODO: Map unitId to unit name if units list is available
  const quantityUnit = item.quantityUnit || item.unit || item?.material?.unitName || 
    (item?.material?.unitId ? `Unit ${item.material.unitId}` : 'piece');
  
  const totalPrice = item.totalPrice || (quantity * costPerUnit);
  const date = item.date || item.createdAt || item.updatedAt;
  
  // Determine if item is consumable based on inventoryTypeId dynamically
  const inventoryTypeId = item.inventoryTypeId?.toString();
  // Find inventory type from API to check if it's consumable
  const itemInventoryType = inventoryTypes.find(
    (type) => (type.id?.toString() || type.inventoryTypeId?.toString()) === inventoryTypeId
  );
  // Check if the inventory type name contains 'consumable' (case-insensitive)
  const typeName = itemInventoryType?.name || itemInventoryType?.typeName || '';
  const isConsumable = typeName.toLowerCase().includes('consumable');
  
  // Consumable specific fields
  // For consumable, quantityDetails might track purchased vs used
  const purchased = item.purchased || item.purchasedQuantity || quantity;
  const currentStock = item.currentStock || item.stock || quantity;
  const purchasedPrice = item.purchasedPrice || item.purchasePrice || costPerUnit;

  return (
    <div 
      className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onViewDetails?.(item)}
    >
      {/* Item Info */}
      <div className="flex-1">
        <div className="border-b border-black-soft pb-4 mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-primary capitalize">
              {itemName}
              {/* {specification && (
                <span className="text-secondary font-normal"> • {specification}</span>
              )} */}
            </h3>
            <p className="text-sm text-secondary">
              {formatDate(date)}
            </p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTransfer?.(item);
              }}
              leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}
              className="whitespace-nowrap"
            >
              {t('transfer', { defaultValue: 'Transfer' })}
            </Button>
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu
                items={[
                  ...(onRestock ? [{
                    label: t('actions.restock', { defaultValue: 'Restock Material' }),
                    onClick: () => onRestock?.(item),
                    icon: <RotateCw className="w-4 h-4" />,
                  }] : []),
                ...(isConsumable
                  ? [
                      {
                        label: t('actions.addLogUsage', { defaultValue: 'Add Log Usage' }),
                        onClick: () => onLogUsage?.(item),
                        icon: <Plus className="w-4 h-4" />,
                      },
                    ]
                  : [
                      {
                        label: t('actions.destroy', { defaultValue: 'Destroy Material' }),
                        onClick: () => onDestroy?.(item),
                        icon: <AlertTriangle className="w-4 h-4" />,
                      },
                    ]),
                {
                  label: t('actions.downloadPDF', { defaultValue: 'Download as PDF' }),
                  onClick: () => onDownloadPDF?.(item),
                  icon: <Download className="w-4 h-4" />,
                },
                ...(onDelete ? [{
                  label: t('actions.deleteItem', {
                    defaultValue: 'Delete {{itemName}}',
                    itemName: itemName,
                  }),
                  onClick: () => onDelete?.(itemId),
                  icon: <Trash2 className="w-4 h-4 text-accent" />,
                  textColor: 'text-accent',
                }] : []),      
              ]}
              />
            </div>
          </div>
        </div>

        {/* Financial Details */}
        {isConsumable ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-secondary mb-1">
                {t('purchased', { defaultValue: 'Purchased' })}
              </p>
              <p className="text-sm font-medium text-primary">
                {purchased} {quantityUnit}
              </p>
            </div>
            <div>
              <p className="text-xs text-secondary mb-1">
                {t('currentStock', { defaultValue: 'Current Stock' })}
              </p>
              <p className="text-sm font-medium text-primary">
                {currentStock} {quantityUnit}
              </p>
            </div>
            <div>
              <p className="text-xs text-secondary mb-1">
                {t('purchasedPrice', { defaultValue: 'Purchased Price' })}
              </p>
              <p className="text-sm font-medium text-primary">
                {formatCurrency(purchasedPrice)}/{quantityUnit}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-secondary mb-1">
                {t('quantity', { defaultValue: 'Quantity' })}
              </p>
              <p className="text-sm font-medium text-primary">
                {quantity} {quantityUnit}
              </p>
            </div>
            <div>
              <p className="text-xs text-secondary mb-1">
                {t('costPerUnit', { defaultValue: 'Cost Per Unit' })}
              </p>
              <p className="text-sm font-medium text-primary">
                {formatCurrency(costPerUnit)}/{quantityUnit}
              </p>
            </div>
            <div>
              <p className="text-xs text-secondary mb-1">
                {t('totalPrice', { defaultValue: 'Total Price' })}
              </p>
              <p className="text-sm font-medium text-primary">
                {formatCurrency(totalPrice)}
              </p>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

