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
  t,
  formatDate,
  formatCurrency,
}) {
  const itemId = item.id || item._id;
  const itemName = item.name || item.itemName || 'Unnamed Item';
  const specification = item.specification || item.spec || '';
  const quantity = item.quantity || 0;
  const quantityUnit = item.quantityUnit || item.unit || 'piece';
  const costPerUnit = item.costPerUnit || item.unitPrice || 0;
  const totalPrice = item.totalPrice || (quantity * costPerUnit);
  const date = item.date || item.createdAt || item.updatedAt;
  const materialType = item.materialType || item.type || item.category || 'reusable';
  const isConsumable = materialType?.toLowerCase() === 'consumable';
  
  // Consumable specific fields
  const purchased = item.purchased || item.purchasedQuantity || quantity;
  const currentStock = item.currentStock || item.stock || quantity;
  const purchasedPrice = item.purchasedPrice || item.purchasePrice || costPerUnit;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center shadow-sm">
      {/* Item Info */}
      <div className="flex-1">
        <div className="border-b border-black-soft pb-4 mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-primary">
              {itemName}
              {specification && (
                <span className="text-secondary font-normal"> • {specification}</span>
              )}
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
              onClick={() => onTransfer?.(item)}
              leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}
              className="whitespace-nowrap"
            >
              {t('transfer', { defaultValue: 'Transfer' })}
            </Button>
            <DropdownMenu
              items={[
                {
                  label: t('actions.restock', { defaultValue: 'Restock Material' }),
                  onClick: () => onRestock?.(item),
                  icon: <RotateCw className="w-4 h-4" />,
                },
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
                {
                  label: t('actions.deleteItem', {
                    defaultValue: 'Delete {{itemName}}',
                    itemName: itemName,
                  }),
                  onClick: () => onDelete?.(itemId),
                  icon: <Trash2 className="w-4 h-4 text-accent" />,
                  textColor: 'text-accent',
                },      
              ]}
            />
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

