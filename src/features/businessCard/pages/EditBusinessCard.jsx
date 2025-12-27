import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import BusinessCardForm from '../components/BusinessCardForm';
import Loader from '../../../components/ui/Loader';
import { useBusinessCard } from '../hooks';
import { ROUTES_FLAT } from '../../../constants/routes';

export default function EditBusinessCard() {
  const { t } = useTranslation('businessCard');
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCard, updateCard, isUpdating, isLoading } = useBusinessCard();
  const [businessCardData, setBusinessCardData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch business card data
  useEffect(() => {
    const fetchBusinessCard = async () => {
      if (!id) return;

      setIsFetching(true);
      try {
        const response = await getCard(id);
        setBusinessCardData(response);
      } catch (error) {
        // Error is already handled in the hook
        navigate(ROUTES_FLAT.BUSINESS_CARD);
      } finally {
        setIsFetching(false);
      }
    };

    fetchBusinessCard();
  }, [id, getCard, navigate]);

  const handleSubmit = async (formData) => {
    if (!id) return;

    try {
      await updateCard(id, formData);
      navigate(ROUTES_FLAT.BUSINESS_CARD);
    } catch (error) {
    }
  };

  if (isFetching) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={t('edit.title', { defaultValue: 'Edit Business Card' })}
        showBackButton={true}
        backTo={ROUTES_FLAT.BUSINESS_CARD}
      />

      {/* Business Card Form */}
      <BusinessCardForm
        initialData={businessCardData}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTES_FLAT.BUSINESS_CARD)}
        isLoading={isUpdating || isLoading}
      />
    </div>
  );
}

