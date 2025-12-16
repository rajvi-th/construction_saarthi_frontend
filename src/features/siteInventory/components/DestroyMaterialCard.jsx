/**
 * Destroy Material Card Component
 * Displays a single destroyed material entry with quantity, material name, and reason
 */

export default function DestroyMaterialCard({
  item,
  t,
}) {
  const {
    quantity,
    materialName,
    material,
    quantityUnit,
    unit,
    reason,
    destroyReason,
    description,
  } = item;

  // Get material name from various possible fields
  const displayMaterialName = 
    material?.name || 
    materialName || 
    item?.name || 
    item?.itemName || 
    'Unknown Material';

  // Get quantity unit
  const displayUnit = 
    unit?.name || 
    quantityUnit || 
    item?.unit || 
    '';

  // Get reason from various possible fields
  const displayReason = 
    reason || 
    destroyReason || 
    description || 
    '';

  // Format quantity with material name and unit
  // Format: "20 Plywood sheets" or "14 Teka" or "18 Marbles"
  const displayQuantity = `${quantity || 0} ${displayMaterialName}${displayUnit ? ` ${displayUnit}` : ''}`;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col gap-3">
        {/* Quantity and Material Name */}
        <div>
          <p className="text-base sm:text-lg font-normal text-primary">
            {displayQuantity}
          </p>
        </div>

        {/* Reason Section */}
        {displayReason && (
          <div className="flex flex-col gap-2">
            <p className="text-sm sm:text-base font-semibold text-primary">
              {t('destroyMaterials.reason', { defaultValue: 'Reason' })}
            </p>
            <p className="text-sm sm:text-base font-normal text-secondary">
              {displayReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

