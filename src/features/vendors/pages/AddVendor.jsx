/**
 * Add Vendor Page
 * Form page for adding a new vendor
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import { useAuth } from '../../../hooks/useAuth';
import { useVendors } from '../hooks';
import { ROUTES_FLAT } from '../../../constants/routes';
import { BuilderForm } from '../../builderClient/components'; // Reuse BuilderForm

export default function AddVendor() {
  const { t, i18n } = useTranslation('builderClient'); // Reuse builderClient translations
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();
  const { createVendor, isCreating } = useVendors();

  const handleSubmit = async (submitData) => {
    if (!selectedWorkspace) {
      throw new Error(t('form.errors.workspaceRequired', { defaultValue: 'Workspace is required' }));
    }

    const currentLanguage = i18n.language || 'en';

    // If FormData, append workspace_id and role
    if (submitData instanceof FormData) {
      submitData.append('workspace_id', selectedWorkspace);
      submitData.append('role', 'vendors'); // Use "vendors" for vendors
      submitData.append('language', currentLanguage);
      await createVendor(submitData);
    } else {
      const dataWithWorkspace = {
        ...submitData,
        workspace_id: selectedWorkspace,
        role: 'vendors', // Use "vendors" for vendors
        language: currentLanguage,
      };
      await createVendor(dataWithWorkspace);
    }

    // Navigate back to vendors list
    navigate(ROUTES_FLAT.VENDORS);
  };

  const handleCancel = () => {
    navigate(ROUTES_FLAT.VENDORS);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={t('form.addVendor', { defaultValue: 'Add Vendor' })}
        showBackButton={true}
      />

      {/* Form */}
      <BuilderForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isCreating}
        type="vendor"
      />
    </div>
  );
}

