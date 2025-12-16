/**
 * Builders & Clients Page
 * Displays list of builders and clients together in one list
 * Based on the UI design with expandable cards, search, and actions
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Building, Phone, MapPin, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Loader from '../../../components/ui/Loader';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import EmptyState from '../../../components/shared/EmptyState';
import { useAuth } from '../../../hooks/useAuth';
import { useBuilderClient } from '../hooks';
import { ROUTES_FLAT } from '../../../constants/routes';

export default function Builders() {
  const { t } = useTranslation('builderClient');
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();
  const { getBuilders, isLoading, deleteBuilder } = useBuilderClient();
  const [allItems, setAllItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Fetch builders (builders and clients are the same, only fetch builders)
  useEffect(() => {
    if (!selectedWorkspace) return;
    
    const fetchData = async () => {
      try {
        // Only fetch builders (builders and clients are the same)
        const data = await getBuilders(selectedWorkspace);
        setAllItems(data || []);
      } catch (error) {
        console.error('Failed to fetch builders:', error);
      }
    };

    fetchData();
  }, [getBuilders, selectedWorkspace]);

  // Filter list based on search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    
    const query = searchQuery.toLowerCase();
    return allItems.filter((item) => {
      const name = (item.name || item.full_name || '').toLowerCase();
      const company = (item.company_Name || item.company_name || item.company || '').toLowerCase();
      const phone = (item.phone_number || item.phone || '').toLowerCase();
      
      return name.includes(query) || company.includes(query) || phone.includes(query);
    });
  }, [allItems, searchQuery]);

  const handleToggle = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleAdd = () => {
    navigate(ROUTES_FLAT.ADD_BUILDER);
  };

  const handleEdit = (item) => {
    const itemId = item.id || item._id;
    if (itemId) {
      navigate(ROUTES_FLAT.EDIT_BUILDER.replace(':id', itemId));
    }
  };

  const handleDelete = async (item) => {
    const itemName = item.name || item.full_name || 'this item';
    
    if (window.confirm(t('deleteConfirm', { 
      name: itemName,
      defaultValue: `Are you sure you want to delete ${itemName}?` 
    }))) {
      try {
        await deleteBuilder(item.id || item._id);
        if (selectedWorkspace) {
          // Re-fetch builders
          const data = await getBuilders(selectedWorkspace);
          setAllItems(data || []);
        }
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get avatar URL or return null
  const getAvatarUrl = (item) => {
    return item.profile_photo || item.avatar || item.profilePhoto || null;
  };

  // Render list item card
  const renderItemCard = (item) => {
    const isExpanded = expandedId === (item.id || item._id);
    const itemId = item.id || item._id;
    const itemName = item.name || item.full_name || 'Unknown';
    const companyName = item.company_Name || item.company_name || item.company || '';
    const phoneNumber = item.phone_number || item.phone || '';
    const address = item.address || '';
    const avatarUrl = getAvatarUrl(item);

    const menuItems = [
      {
        label: t('menu.edit', { defaultValue: 'Edit' }),
        icon: <Edit className="w-4 h-4" />,
        onClick: () => handleEdit(item),
      },
      {
        label: t('menu.delete', { defaultValue: 'Delete' }),
        icon: <Trash2 className="w-4 h-4 text-accent" />,
        onClick: () => handleDelete(item),
        textColor: 'text-accent',
      },
    ];

    return (
      <div
        key={itemId}
        className="bg-white rounded-2xl border border-[#ECEFF3] shadow-[0_1px_3px_rgba(15,23,42,0.06)] px-4 py-3.5 md:px-5 md:py-4"
      >
        {/* Main Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Avatar and Name */}
          <div 
            className="flex items-center gap-3 md:gap-4 min-w-0 flex-1 cursor-pointer"
            onClick={() => handleToggle(itemId)}
          >
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={itemName}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-sm md:text-base font-medium text-primary flex-shrink-0">
                {getInitials(itemName)}
              </div>
            )}
            
            {/* Name */}
            <div className="min-w-0 flex-1">
              <p className="text-sm md:text-base font-medium text-primary truncate">
                {itemName}
              </p>
            </div>
          </div>

          {/* Right: Chevron and Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Chevron */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(itemId);
              }}
              className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary transition-colors cursor-pointer"
              aria-label={isExpanded ? t('collapse', { defaultValue: 'Collapse' }) : t('expand', { defaultValue: 'Expand' })}
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 text-accent ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Three Dots Menu */}
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu
                items={menuItems}
                position="right"
              />
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (() => {
          const details = [
            { value: companyName, icon: Building, iconColor: 'text-primary' },
            { value: phoneNumber, icon: Phone, iconColor: 'text-primary' },
            { value: address, icon: MapPin, iconColor: 'text-primary' },
          ].filter(detail => detail.value);

          return (
            <div className="mt-3 pt-3 border-t border-black-soft space-y-2.5 md:space-y-3">
              {details.length > 0 ? (
                details.map((detail, index) => {
                  const IconComponent = detail.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#4755690A] border border-[#4755690A] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <IconComponent className={`w-4 h-4 ${detail.iconColor}`} />
                      </div>
                      <p className="text-sm md:text-base text-primary pt-1.5">
                        {detail.value}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-secondary pl-12">
                  {t('noDetails', { defaultValue: 'No additional details available' })}
                </p>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Search and Add Button */}
      <PageHeader
        title={t('pages.builders.title', { defaultValue: 'Builders & Clients' })}
        showBackButton={true}
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full lg:w-auto">
          <div className="flex-1 w-full sm:w-auto sm:flex-none">
            <SearchBar
              placeholder={t('searchPlaceholder', { defaultValue: 'Search builders' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[260px]"
            />
          </div>
          <Button
            variant="primary"
            onClick={handleAdd}
            leftIconName="Plus"
            iconSize="w-4 h-4"
            className="w-full sm:w-auto whitespace-nowrap"
          >
            {t('addBuilder', { defaultValue: 'Add Builder' })}
          </Button>
        </div>
      </PageHeader>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" />
        </div>
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon="inbox"
          title={searchQuery 
            ? t('emptyState.noResults', { defaultValue: 'No Results Found' })
            : t('emptyState.noBuildersClients', { defaultValue: 'No Builders or Clients' })
          }
          message={searchQuery
            ? t('emptyState.noResultsMessage', { defaultValue: 'No builders or clients found matching your search. Try adjusting your search terms.' })
            : t('emptyState.noBuildersClientsMessage', { defaultValue: 'You haven\'t added any builders or clients yet. Add your first builder or client to get started.' })
          }
          actionLabel={!searchQuery ? t('emptyState.addBuilder', { defaultValue: 'Add Builder' }) : undefined}
          onAction={!searchQuery ? handleAdd : undefined}
          iconSize="lg"
          padding="default"
        />
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredList.map((item) => renderItemCard(item))}
        </div>
      )}
    </div>
  );
}
