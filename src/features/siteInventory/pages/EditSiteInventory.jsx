import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';
import { useSiteInventory } from '../hooks';
import { ROUTES_FLAT } from '../../../constants/routes';

export default function EditSiteInventory() {
  const { t } = useTranslation('siteInventory');
  const navigate = useNavigate();
  const { id } = useParams();
  const { getItem, updateItem, isUpdating, isLoading } = useSiteInventory();
  const [itemData, setItemData] = useState(null);

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    try {
      const data = await getItem(id);
      setItemData(data);
    } catch (error) {
      // Error is already handled in the hook
      navigate(ROUTES_FLAT.SITE_INVENTORY);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES_FLAT.SITE_INVENTORY);
  };

  const handleSubmit = async (formData) => {
    try {
      await updateItem(id, formData);
      navigate(ROUTES_FLAT.SITE_INVENTORY);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={t('edit.title', { defaultValue: 'Edit Site Inventory' })}
          showBackButton={true}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={t('edit.title', { defaultValue: 'Edit Site Inventory' })}
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

