import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import EmptyState from '../../../components/shared/EmptyState';
import EmptyStateSvg from '../../../assets/icons/EmptyState.svg';
import BusinessCardDetail from '../components/BusinessCardDetail';
import Loader from '../../../components/ui/Loader';
import { useBusinessCard } from '../hooks';
import { useAuth } from '../../auth/store';
import { ROUTES_FLAT } from '../../../constants/routes';

export default function BusinessCard() {
  const { t } = useTranslation('businessCard');
  const navigate = useNavigate();
  const { user } = useAuth(); // Get logged-in user
  const { getCards, deleteCard, isLoading } = useBusinessCard();
  const [businessCards, setBusinessCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    if (user) {
      loadBusinessCards();
    }
  }, [user]);

  // Auto-select first card when cards are loaded
  useEffect(() => {
    if (businessCards.length > 0 && !selectedCard) {
      setSelectedCard(businessCards[0]);
    } else if (businessCards.length === 0) {
      setSelectedCard(null);
    }
  }, [businessCards, selectedCard]);

  const loadBusinessCards = async () => {
    try {
      const cardsArray = await getCards();
      
      // Ensure we have an array
      const allCards = Array.isArray(cardsArray) ? cardsArray : [];
      
      // Filter cards to show only logged-in user's cards
      // Check multiple possible field names for user identification
      const userId = user?.id || user?.userId || user?.user_id || user?._id;
      const userPhone = user?.phone || user?.phone_number || user?.phoneNumber;
      
      // Normalize phone number (remove spaces, country code prefix if needed)
      const normalizePhone = (phone) => {
        if (!phone) return null;
        return String(phone).replace(/\s+/g, '').replace(/^\+91/, '');
      };
      
      const normalizedUserPhone = normalizePhone(userPhone);
      
      const filteredCards = allCards.filter((card) => {
        // Check various possible field names for card owner (userId)
        const cardUserId = card?.userId || 
                          card?.user_id || 
                          card?.user?.id || 
                          card?.user?._id ||
                          card?.createdBy ||
                          card?.created_by ||
                          card?.ownerId ||
                          card?.owner_id;
        
        // Check phone number from card
        const cardPhone = card?.phone || 
                         card?.phone_number || 
                         card?.phoneNumber ||
                         card?.contactNumber;
        const normalizedCardPhone = normalizePhone(cardPhone);
        
        // First try to filter by userId if both exist
        if (userId && cardUserId) {
          // Compare as strings to handle different ID formats
          return String(cardUserId) === String(userId);
        }
        
        // Fallback: filter by phone number if userId is not available
        if (normalizedUserPhone && normalizedCardPhone) {
          return normalizedUserPhone === normalizedCardPhone;
        }
        
        // If no userId or phone match, don't show this card (strict filtering)
        return false;
      });
      
      setBusinessCards(filteredCards);
    } catch (error) {
      // Error is already handled in the hook
      setBusinessCards([]);
      setSelectedCard(null);
    }
  };

  const handleCreateBusinessCard = () => {
    navigate(ROUTES_FLAT.ADD_BUSINESS_CARD);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCard(id);
      // Reload cards after deletion
      await loadBusinessCards();
      // If deleted card was selected, clear selection
      if (selectedCard && (selectedCard.id === id || selectedCard._id === id)) {
        setSelectedCard(null);
      }
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // If loading, show loader
  if (isLoading && businessCards.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={t('title', { defaultValue: 'Business Card' })}
          showBackButton={false}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  // If no cards, show empty state
  if (businessCards.length === 0 && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={t('title', { defaultValue: 'Business Card' })}
          showBackButton={false}
        />
        <EmptyState
          image={EmptyStateSvg}
          title={t('emptyState.title', { defaultValue: 'No Card Added' })}
          message={t('emptyState.message', { defaultValue: 'Create your business card for share your work and contacts' })}
          actionLabel={t('emptyState.createButton', { defaultValue: 'Create Business Card' })}
          onAction={handleCreateBusinessCard}
        />
      </div>
    );
  }

  // If cards exist but none selected yet, show loader (waiting for auto-selection)
  if (businessCards.length > 0 && !selectedCard) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={t('title', { defaultValue: 'Business Card' })}
          showBackButton={false}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  // Show selected card detail
  if (selectedCard) {
    return (
      <BusinessCardDetail
        businessCard={selectedCard}
        onDelete={handleDelete}
      />
    );
  }

  // Fallback: show empty state if no cards and not loading
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t('title', { defaultValue: 'Business Card' })}
        showBackButton={false}
      />
      <EmptyState
        image={EmptyStateSvg}
        title={t('emptyState.title', { defaultValue: 'No Card Added' })}
        message={t('emptyState.message', { defaultValue: 'Create your business card for share your work and contacts' })}
        actionLabel={t('emptyState.createButton', { defaultValue: 'Create Business Card' })}
        onAction={handleCreateBusinessCard}
      />
    </div>
  );
}

