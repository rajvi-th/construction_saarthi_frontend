/**
 * Add Builder Page
 * Form page for adding a new builder/client
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import { useAuth } from '../../../hooks/useAuth';
import { useBuilderClient } from '../hooks';
import { ROUTES_FLAT } from '../../../constants/routes';
import { BuilderForm } from '../components';

export default function AddBuilder() {
  const { t, i18n } = useTranslation('builderClient');
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();
  const { createBuilder, isCreating } = useBuilderClient();

  const handleSubmit = async (submitData) => {
    if (!selectedWorkspace) {
      throw new Error(t('form.errors.workspaceRequired', { defaultValue: 'Workspace is required' }));
    }

    const currentLanguage = i18n.language || 'en';

    // If FormData, append workspace_id and role
    if (submitData instanceof FormData) {
      submitData.append('workspace_id', selectedWorkspace);
      submitData.append('role', 'builder'); // Use "builder" for builders, "vendors" for vendors
      await createBuilder(submitData);
    } else {
      const dataWithWorkspace = {
        ...submitData,
        workspace_id: selectedWorkspace,
        role: 'builder', // Use "builder" for builders, "vendors" for vendors
      };
      await createBuilder(dataWithWorkspace);
    }

    // Navigate back to builders list
    navigate(ROUTES_FLAT.BUILDERS);
  };

  const handleCancel = () => {
    navigate(ROUTES_FLAT.BUILDERS);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={t('form.addBuilder', { defaultValue: 'Add Builder' })}
        showBackButton={true}
      />

      {/* Form */}
      <BuilderForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isCreating}
      />
    </div>
  );
}
