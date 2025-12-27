/**
 * Add-ons Component
 * Displays add-ons for members and calculations
 */

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { User, Plus, Minus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import AddMemberModal from './AddMemberModal';
import { useSubscriptions } from '../hooks';
import { getWorkspaceMembers } from '../../auth/api';
import { useAuth } from '../../auth/store';
import { showError } from '../../../utils/toast';
import { ROUTES_FLAT } from '../../../constants/routes';

export default function AddOns() {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();
  const { subscriptions } = useSubscriptions();
  const [calculationQuantity, setCalculationQuantity] = useState(1);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const usedMembers = 2;
  const totalMembers = 3;
  const usedCalculations = 47;
  const totalCalculations = 50;
  const calculationPrice = 99;

  // Get first 2 members for display
  const displayedMembers = members.slice(0, 2);

  // Get member price from shared subscription plans data
  const memberPrice = useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) {
      return 99; // Default price
    }

    // Get the first active plan's addMember price
    const firstPlan = subscriptions.find(plan =>
      plan &&
      plan.addMember?.price_per_member
    );

    if (firstPlan?.addMember?.price_per_member) {
      const price = parseFloat(firstPlan.addMember.price_per_member);
      if (!isNaN(price)) {
        return price;
      }
    }
    
    return 99; // Default price
  }, [subscriptions]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedWorkspace) {
        setIsLoadingMembers(false);
        return;
      }

      try {
        setIsLoadingMembers(true);
        const response = await getWorkspaceMembers(selectedWorkspace);

        // Handle different response structures (same pattern as AddedMembers and useMembers hook)
        const membersData = response?.data || response?.members || response || [];
        const membersList = Array.isArray(membersData) ? membersData : [];

        // Map API response to component format
        const mappedMembers = membersList.map(member => ({
          id: member.id,
          name: member.name || '',
          role: member.role || '',
          phone: member.phone_number
            ? `${member.country_code || ''} ${member.phone_number}`.trim()
            : '',
        }));

        setMembers(mappedMembers);
      } catch (error) {
        console.error('Error fetching workspace members:', error);
        const errorMessage = error?.response?.data?.message ||
          error?.message ||
          'Failed to load members';
        showError(errorMessage);
        setMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [selectedWorkspace, refreshKey]);

  const handleAddMember = () => {
    setIsAddMemberModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddMemberModalOpen(false);
  };

  const handleSaveMember = (memberData) => {
    // This callback is kept for backward compatibility
    // The actual API call is now handled in AddMemberModal
    console.log('Member data saved:', memberData);
  };

  const handleMemberAdded = () => {
    // Refresh members list after successful addition
    setRefreshKey(prev => prev + 1);
  };

  const handleViewAddedMembers = () => {
    navigate(ROUTES_FLAT.SUBSCRIPTION_ADDED_MEMBERS);
  };

  const handleIncrement = () => {
    setCalculationQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setCalculationQuantity(prev => Math.max(1, prev - 1));
  };

  return (
    <section className="mb-6">
      <h2 className="font-medium text-primary mb-2">
        {t('addOns.title', { defaultValue: 'Add-ons' })}
      </h2>

      <div className="space-y-4">
        {/* Add More Members */}
        <div className="bg-[#F6F6F6CC] rounded-2xl border border-lightGray p-4 md:p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-medium text-primary mb-1">
                {t('addOns.addMoreMembers', { defaultValue: 'Add More Members' })}
              </h3>
              <p className="text-xs md:text-[13px] text-primary-light">
                {t('addOns.membersUsed', {
                  defaultValue: "You've used {{used}} of {{total}} included users",
                  used: usedMembers,
                  total: totalMembers,
                })}
              </p>
            </div>
            <p className="text-sm md:text-[20px] font-semibold text-accent mt-2">
              ₹{memberPrice}
              <span className="text-xs md:text-sm font-normal text-primary-light">
                /user/month
              </span>
            </p>
          </div>

          {/* Members List */}
          <div className="space-y-2 pt-3 border-t border-lightGray">
            {isLoadingMembers ? (
              <p className="text-sm text-primary-light">{t('common.loading', { defaultValue: 'Loading members...' })}</p>
            ) : displayedMembers.length > 0 ? (
              displayedMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent flex-shrink-0" />
                  <p className="text-sm md:text-base text-primary">
                    {member.name}: <span className="text-primary-light">{member.role}</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-primary-light">{t('addOns.noMembers', { defaultValue: 'No members found' })}</p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center justify-end gap-2 sm:gap-4 mt-2 md:mt-0">
            <button
              type="button"
              onClick={handleViewAddedMembers}
              className="text-sm md:text-[13px] font-medium text-accent whitespace-nowrap cursor-pointer"
            >
              <span className="sm:hidden">
                {t('addOns.viewMembersMobile', { defaultValue: 'View members' })}
              </span>
              <span className="hidden sm:inline">
                {t('addOns.viewAddedMembers', {
                  defaultValue: 'View Added Member List',
                })}
              </span>
            </button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddMember}
              className="whitespace-nowrap !rounded-xl !px-4 !py-2"
            >
              {t('addOns.addMember', { defaultValue: 'Add Member' })}
            </Button>
          </div>
        </div>

        {/* Buy More Calculations */}
        <div className="bg-[#F6F6F6CC] rounded-2xl border border-lightGray p-4 md:p-5">
          <div className="mb-4">
            <h3 className="text-base md:text-lg font-medium text-primary mb-1">
              {t('addOns.buyMoreCalculations', { defaultValue: 'Buy More Calculations' })}
            </h3>
            <p className="text-xs md:text-sm text-primary-light">
              {t('addOns.calculationsUsed', {
                defaultValue: "You've used {{used}} of {{total}} available calculations this cycle.",
                used: usedCalculations,
                total: totalCalculations,
              })}
            </p>
          </div>

          {/* Packs Available */}
          <div className="pt-3 border-t border-lightGray">
            <p className="text-sm md:text-base font-medium text-primary ">
              {t('addOns.packsAvailable', { defaultValue: 'Packs Available' })}
            </p>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs md:text-xs text-primary-light">
                +25 {t('addOns.calculations', { defaultValue: 'Calculations' })}
              </p>
              <div className="flex items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg bg-white">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="p-2 hover:bg-[#F9FAFB] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-primary cursor-pointer" />
                  </button>
                  <input
                    type="number"
                    value={calculationQuantity}
                    readOnly
                    className="w-12 text-center text-sm md:text-base font-medium text-primary border-0 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="p-2 hover:bg-[#F9FAFB] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-primary cursor-pointer" />
                  </button>
                </div>
                <p className="text-base md:text-lg font-medium text-accent whitespace-nowrap">
                  ₹{calculationPrice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveMember}
        onMemberAdded={handleMemberAdded}
        existingMembersCount={usedMembers}
        memberPrice={memberPrice}
      />
    </section>
  );
}

