/**
 * Edit Vendor Page
 * Form page for editing an existing vendor
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';
import { useAuth } from '../../../hooks/useAuth';
import { useVendors } from '../hooks';
import { ROUTES_FLAT } from '../../../constants/routes';
import { BuilderForm } from '../../builderClient/components'; // Reuse BuilderForm

export default function EditVendor() {
  const { t, i18n } = useTranslation('builderClient'); // Reuse builderClient translations
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedWorkspace } = useAuth();
  const { getVendor, updateVendor, isUpdating, isLoading } = useVendors();
  
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch vendor data on mount
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!id) return;

      try {
        const data = await getVendor(id);
        setInitialData(data);
      } catch (err) {
        console.error('Failed to fetch vendor data:', err);
        setError(t('form.errors.fetchFailed', { defaultValue: 'Failed to load vendor data. Please try again.' }));
      }
    };

    fetchVendorData();
  }, [id, getVendor, t]);

  const handleSubmit = async (submitData) => {
    if (!selectedWorkspace || !id) {
      throw new Error(t('form.errors.workspaceRequired', { defaultValue: 'Workspace is required' }));
    }

    const currentLanguage = i18n.language || 'en';

    // If FormData, append workspace_id, role, and language
    if (submitData instanceof FormData) {
      submitData.append('workspace_id', selectedWorkspace);
      submitData.append('role', 'vendors'); // Use "vendors" for vendors
      submitData.append('language', currentLanguage);
      await updateVendor(id, submitData);
    } else {
      const dataWithWorkspace = {
        ...submitData,
        workspace_id: selectedWorkspace,
        role: 'vendors', // Use "vendors" for vendors
        language: currentLanguage,
      };
      await updateVendor(id, dataWithWorkspace);
    }

    // Navigate back to vendors list
    navigate(ROUTES_FLAT.VENDORS);
  };

  const handleCancel = () => {
    navigate(ROUTES_FLAT.VENDORS);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={t('form.editVendor', { defaultValue: 'Edit Vendor' })}
          showBackButton={true}
          backTo={ROUTES_FLAT.VENDORS}
        />
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={t('form.editVendor', { defaultValue: 'Edit Vendor' })}
          showBackButton={true}
          backTo={ROUTES_FLAT.VENDORS}
        />
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-accent">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={t('form.editVendor', { defaultValue: 'Edit Vendor' })}
        showBackButton={true}
        backTo={ROUTES_FLAT.VENDORS}
      />

      {/* Form */}
      {initialData && (
        <BuilderForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isUpdating}
          type="vendor"
        />
      )}
    </div>
  );
}

