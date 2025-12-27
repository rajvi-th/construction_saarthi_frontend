/**
 * Edit Builder Page
 * Form page for editing an existing builder/client
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';
import { useAuth } from '../../../hooks/useAuth';
import { useBuilderClient } from '../hooks';
import { ROUTES_FLAT } from '../../../constants/routes';
import { BuilderForm } from '../components';

export default function EditBuilder() {
  const { t, i18n } = useTranslation('builderClient');
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedWorkspace } = useAuth();
  const { getBuilder, updateBuilder, isUpdating, isLoading } = useBuilderClient();
  
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch builder data on mount
  useEffect(() => {
    const fetchBuilderData = async () => {
      if (!id) return;

      try {
        const data = await getBuilder(id);
        setInitialData(data);
      } catch (err) {
        console.error('Failed to fetch builder data:', err);
        setError(t('form.errors.fetchFailed', { defaultValue: 'Failed to load builder data. Please try again.' }));
      }
    };

    fetchBuilderData();
  }, [id, getBuilder, t]);

  const handleSubmit = async (submitData) => {
    if (!selectedWorkspace || !id) {
      throw new Error(t('form.errors.workspaceRequired', { defaultValue: 'Workspace is required' }));
    }

    const currentLanguage = i18n.language || 'en';

    // If FormData, append workspace_id, role, and language
    if (submitData instanceof FormData) {
      submitData.append('workspace_id', selectedWorkspace);
      submitData.append('role', 'builder'); // Use "builder" for builders, "vendors" for vendors
      submitData.append('language', currentLanguage);
      await updateBuilder(id, submitData);
    } else {
      const dataWithWorkspace = {
        ...submitData,
        workspace_id: selectedWorkspace,
        role: 'builder', // Use "builder" for builders, "vendors" for vendors
        language: currentLanguage,
      };
      await updateBuilder(id, dataWithWorkspace);
    }

    // Navigate back to builders list
    navigate(ROUTES_FLAT.BUILDERS);
  };

  const handleCancel = () => {
    navigate(ROUTES_FLAT.BUILDERS);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={t('form.editBuilder', { defaultValue: 'Edit Builder' })}
          showBackButton={true}
          backTo={ROUTES_FLAT.BUILDERS}
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
          title={t('form.editBuilder', { defaultValue: 'Edit Builder' })}
          showBackButton={true}
          backTo={ROUTES_FLAT.BUILDERS}
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
        title={t('form.editBuilder', { defaultValue: 'Edit Builder' })}
        showBackButton={true}
        backTo={ROUTES_FLAT.BUILDERS}
      />

      {/* Form */}
      {initialData && (
        <BuilderForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isUpdating}
        />
      )}
    </div>
  );
}
