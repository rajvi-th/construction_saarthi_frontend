import { Plus, ArrowLeftRight, RotateCw, AlertTriangle, Download, Trash2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import Button from '../../../components/ui/Button';
import DropdownMenu from '../../../components/ui/DropdownMenu';

export default function InventoryItemHeader({
  itemName,
  onBack,
  onEdit,
  onAskForMaterial,
  onTransferMaterial,
  onRestock,
  onDestroy,
  onDownloadPDF,
  onDelete,
  isConsumable = false,
}) {
  const { t } = useTranslation('siteInventory');

  // Build menu items based on item type
  const menuItems = [
    ...(onEdit ? [{
      label: t('actions.edit', { defaultValue: 'Edit Material' }),
      onClick: onEdit,
      icon: <Pencil className="w-4 h-4" />,
    }] : []),
    {
      label: t('actions.restock', { defaultValue: 'Restock Material' }),
      onClick: onRestock || (() => { }),
      icon: <RotateCw className="w-4 h-4" />,
    },
  ];

  // Only show "Destroy Material" for reusable items
  if (!isConsumable && onDestroy) {
    menuItems.push({
      label: t('actions.destroy', { defaultValue: 'Destroy Material' }),
      onClick: onDestroy,
      icon: <AlertTriangle className="w-4 h-4" />,
    });
  }

  menuItems.push(
    {
      label: t('actions.downloadPDF', { defaultValue: 'Download as PDF' }),
      onClick: onDownloadPDF || (() => { }),
      icon: <Download className="w-4 h-4" />,
    },
    {
      label: t('actions.deleteItem', {
        defaultValue: 'Delete {{itemName}}',
        itemName,
      }),
      onClick: onDelete || (() => { }),
      icon: <Trash2 className="w-4 h-4 text-accent" />,
      textColor: 'text-accent',
    }
  );

  return (
    <PageHeader
      title={itemName}
      showBackButton
      onBack={onBack}
      className="capitalize"
    >
      {/* Actions row - mobile + desktop */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Primary actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="sm"
            // leftIcon={<Plus className="w-4 h-4 text-primary" />}
            className="whitespace-nowrap !text-primary font-medium !bg-[#060C120A]"
            onClick={onAskForMaterial}
          >
            {t('itemDetails.askForMaterial', { defaultValue: 'Ask for Material' })}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            // leftIcon={<ArrowLeftRight className="w-4 h-4" />}
            className="whitespace-nowrap !text-primary font-medium !bg-[#060C120A]"
            onClick={onTransferMaterial}
          >
            {t('itemDetails.transferMaterial', { defaultValue: 'Transfer Material' })}
          </Button>
        </div>

        {/* More menu (3‑dot) */}
        <DropdownMenu items={menuItems} />
      </div>
    </PageHeader>
  );
}

