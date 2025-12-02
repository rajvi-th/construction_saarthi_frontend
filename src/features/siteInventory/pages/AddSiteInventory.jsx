import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import { useSiteInventory } from '../hooks';
import { ROUTES_FLAT } from '../../../constants/routes';

export default function AddSiteInventory() {
  const { t } = useTranslation('siteInventory');
  const navigate = useNavigate();
  const { createItem, isCreating } = useSiteInventory();

  const handleCancel = () => {
    navigate(ROUTES_FLAT.SITE_INVENTORY);
  };

  const handleSubmit = async (formData) => {
    try {
      await createItem(formData);
      navigate(ROUTES_FLAT.SITE_INVENTORY);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={t('add.title', { defaultValue: 'Add Site Inventory' })}
        showBackButton={true}
      />

      {/* TODO: Add SiteInventoryForm component when ready */}
      <div className="mt-6">
        <p className="text-gray-600">
          {t('formComingSoon', { defaultValue: 'Site Inventory form coming soon...' })}
        </p>
      </div>
    </div>
  );
}

