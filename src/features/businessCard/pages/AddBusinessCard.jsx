import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import BusinessCardForm from '../components/BusinessCardForm';
import { useBusinessCard } from '../hooks';
import { ROUTES_FLAT } from '../../../constants/routes';

export default function AddBusinessCard() {
  const { t } = useTranslation('businessCard');
  const navigate = useNavigate();
  const { createCard, isCreating } = useBusinessCard();

  const handleCancel = () => {
    navigate(ROUTES_FLAT.BUSINESS_CARD);
  };

  const handleSubmit = async (formData) => {
    try {
      await createCard(formData);
      navigate(ROUTES_FLAT.BUSINESS_CARD);
    } catch (error) {
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={t('add.title', { defaultValue: 'Add Business Card' })}
        showBackButton={true}
      />

      {/* Business Card Form */}
      <BusinessCardForm
        initialData={null}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isCreating}
      />
    </div>
  );
}

