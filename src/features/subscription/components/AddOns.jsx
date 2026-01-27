import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Plus, Minus, ChevronRight } from 'lucide-react';
import AddMemberModal from './AddMemberModal';
import { useSubscriptions } from '../hooks';
import { getWorkspaceMembers } from '../../auth/api';
import { useAuth } from '../../auth/store';
import { showError } from '../../../utils/toast';
import { ROUTES_FLAT } from '../../../constants/routes';
import { updateAddon } from '../api/subscriptionApi';
import addCircleIcon from "../../../assets/icons/Add Circle.svg";

export default function AddOns({ onCalculationChange, onUsersChange }) {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();
  const {
    subscriptions,
    purchasedPlan,
    hasActiveSubscription,
    planSummary,
    isLoadingSummary,
    isLoadingSubscriptions,
    fetchPlanSummary
  } = useSubscriptions();

  const [calculationQuantity, setCalculationQuantity] = useState(0); // Default increment unit
  const [isCalcEditEnabled, setIsCalcEditEnabled] = useState(false);
  const [memberQuantity, setMemberQuantity] = useState(0);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Constants - use planSummary for available counts, fallback to defaults
  const freeMembersCount = planSummary?.members?.available ?? (purchasedPlan?.free_sub_user_count || 0);
  const freeCalculationsCount = planSummary?.calculations?.available ?? (purchasedPlan?.free_calculation || 0);
  const planName = hasActiveSubscription && purchasedPlan ? purchasedPlan.name : 'Free';
  const isLoading = isLoadingSummary || isLoadingSubscriptions;

  // Prices - use dynamic prices from purchasedPlan, fallback to defaults
  const memberPrice = parseFloat(purchasedPlan?.addMember?.price_per_member || 99);
  const calculationPricePerUnit = parseFloat(purchasedPlan?.addCalculation?.price_per_member || 10);
  const calculationMinPack = parseInt(purchasedPlan?.addCalculation?.minimum_calculation || 20);
  const calculationPackPrice = calculationPricePerUnit * calculationMinPack;

  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedWorkspace) {
        setIsLoadingMembers(false);
        return;
      }

      try {
        setIsLoadingMembers(true);
        const response = await getWorkspaceMembers(selectedWorkspace);
        const membersData = response?.data || response?.members || response || [];
        const membersList = Array.isArray(membersData) ? membersData : [];

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
        showError('Failed to load members');
        setMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [selectedWorkspace, refreshKey]);

  const handleUpdateAddon = async (type, action) => {
    if (!purchasedPlan?.id) return;

    try {
      await updateAddon({
        subscription_plan_id: purchasedPlan.id,
        type,
        action
      });
      // Refetch summary to update "Available" counts
      fetchPlanSummary(purchasedPlan.id);
    } catch (error) {
      console.error('Failed to update addon:', error);
      // Fallback state update is still done locally, but error is shown
      showError(t('common.error', { defaultValue: 'Action failed' }));
    }
  };

  const handleAddMemberClick = () => {
    setIsAddMemberModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddMemberModalOpen(false);
  };

  const handleMemberAdded = () => {
    setRefreshKey(prev => prev + 1);
    // If we want the counter to increment when a member is added via modal:
    setMemberQuantity(prev => prev + 1);
  };

  const handleViewAddedMembers = () => {
    navigate(ROUTES_FLAT.SUBSCRIPTION_ADDED_MEMBERS);
  };

  const hasInitializedRef = useRef(false);

  // Sync internal counters with backend data to match the price in the bottom bar
  useEffect(() => {
    // Only initialize once to prevent UI flickering/resets when planSummary is refetched after manual updates
    // if (hasInitializedRef.current) return;

    // if (planSummary) {
    //   const purchasedMembers = planSummary?.members?.purchased ?? 0;
    //   const purchasedCalcs = planSummary?.calculations?.purchased ?? 0;

    //   // Calculate number of packs (e.g., 25 calculations = 1 pack)
    //   const packs = calculationMinPack > 0 ? Math.floor(purchasedCalcs / calculationMinPack) : purchasedCalcs;

    //   setMemberQuantity(purchasedMembers);
    //   setCalculationQuantity(packs);
    //   hasInitializedRef.current = true;
    // } else if (purchasedPlan && !isLoadingSummary) {
    //   const purchasedMembers = purchasedPlan?.total_members_purchased ?? 0;
    //   const purchasedCalcs = purchasedPlan?.total_calculations_purchased ?? 0;
    //   const packs = calculationMinPack > 0 ? Math.floor(purchasedCalcs / calculationMinPack) : purchasedCalcs;

    //   setMemberQuantity(purchasedMembers);
    //   setCalculationQuantity(packs);
    //   hasInitializedRef.current = true;
    // }
  }, [planSummary, purchasedPlan, calculationMinPack, isLoadingSummary]);

  // Reset initialization when workspace changes to fetch fresh data for the new context
  useEffect(() => {
    hasInitializedRef.current = false;
  }, [selectedWorkspace]);

  // Toggle Calculation Edit
  const handleToggleCalcEdit = () => {
    setIsCalcEditEnabled(prev => !prev);
  };

  // Calculation Counter
  const handleCalcIncrement = () => {
    if (!isCalcEditEnabled) return;
    const newQty = calculationQuantity + 1;
    setCalculationQuantity(newQty);
    handleUpdateAddon('calculation', 'add');
    if (onCalculationChange) {
      onCalculationChange(newQty * (calculationMinPack || 25));
    }
  };

  const handleCalcDecrement = () => {
    if (!isCalcEditEnabled || calculationQuantity <= 0) return;
    const newQty = Math.max(0, calculationQuantity - 1);
    setCalculationQuantity(newQty);
    handleUpdateAddon('calculation', 'remove');
    if (onCalculationChange) {
      onCalculationChange(newQty * (calculationMinPack || 25));
    }
  };

  // Member Counter
  const handleMemberIncrement = () => {
    const newQty = memberQuantity + 1;
    setMemberQuantity(newQty);
    handleUpdateAddon('member', 'add');
    if (onUsersChange) {
      // Just pass newQty as subUsers, assuming 1 main user as default
      onUsersChange(1, newQty);
    }
  };

  const handleMemberDecrement = () => {
    if (memberQuantity <= 0) return;
    const newQty = memberQuantity - 1;
    setMemberQuantity(newQty);
    handleUpdateAddon('member', 'remove');
    if (onUsersChange) {
      onUsersChange(1, newQty);
    }
  };

  return (
    <section className="mb-6">
      <h2 className="text-base md:text-lg font-medium text-primary mb-3">
        {t('addOns.title', { defaultValue: 'Add-ons' })}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Members Add-on Card */}
        <div className="bg-[#F6F6F6CC] rounded-2xl border border-[#060C120F] flex flex-col">
          <div className="p-4 sm:p-5 flex-1">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="text-base sm:text-lg font-medium text-primary">
                {t('addOns.availableMembers')} <span className="text-accent">{freeMembersCount}</span>
              </h3>
              <button
                className="flex items-center gap-1.5 cursor-pointer group shrink-0 w-fit"
                onClick={handleAddMemberClick}
              >
                <img
                  src={addCircleIcon}
                  alt="Add"
                  className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                />
                <span className="text-accent text-xs sm:text-sm font-medium">
                  {t('addOns.addMoreMembers')}
                </span>
              </button>
            </div>
            <p className="text-xs sm:text-[13px] text-[#060C1280] mb-4 leading-snug">
              {t('addOns.membersSubtext', { count: freeMembersCount, plan: planName })}
            </p>

            {/* Inner White Box */}
            <div className="bg-white rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                {/* Custom Counter Control */}
                <div className="flex items-center gap-2 border border-[#060C121A] rounded-lg bg-white p-1 w-fit">
                  <button
                    onClick={handleMemberDecrement}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Minus className="w-4 h-4 text-primary opacity-50" />
                  </button>
                  <div className="w-10 h-8 flex items-center justify-center bg-[#F6F6F6] rounded-md">
                    <span className="text-sm font-semibold text-primary">{memberQuantity}</span>
                  </div>
                  <button
                    onClick={handleMemberIncrement}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary opacity-50" />
                  </button>
                </div>

                <p className="text-primary text-sm font-medium">
                  ₹{memberPrice}<span className="text-[#060C1280] font-normal">/{t('addOns.perMember')}</span>
                </p>
              </div>
            </div>

            {/* Bottom Row */}
            <button
              onClick={handleViewAddedMembers}
              className="flex items-center justify-between mt-3 cursor-pointer w-full group"
            >
              <span className="text-sm text-primary group-hover:text-accent transition-colors">
                {t('addOns.viewAllAddedMembers')}
              </span>
              <ChevronRight className="w-4 h-4 text-[#060C124D] group-hover:text-accent transition-colors" />
            </button>
          </div>
        </div>

        {/* Calculations Add-on Card */}
        <div className="bg-[#F6F6F6CC] rounded-2xl border border-[#060C120F] flex flex-col">
          <div className="p-4 sm:p-5 flex-1 text-left">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="text-base sm:text-lg font-medium text-primary">
                {t('addOns.availableCalculations')} <span className="text-accent">{freeCalculationsCount}</span>
              </h3>
              <button
                className="flex items-center gap-1.5 cursor-pointer group shrink-0 w-fit"
                onClick={handleToggleCalcEdit}
              >
                <img
                  src={addCircleIcon}
                  alt="Add"
                  className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                />
                <span className="text-accent text-xs sm:text-sm font-medium">
                  <span className="hidden md:inline lg:hidden xl:inline">
                    {t('addOns.addMoreCalculationPacks', { defaultValue: 'Add more calculation packs' })}
                  </span>
                  <span className="inline md:hidden lg:inline xl:hidden">
                    {t('addOns.addCalculation', { defaultValue: 'Add calculation' })}
                  </span>
                </span>
              </button>
            </div>
            <p className="text-xs sm:text-[13px] text-[#060C1280] mb-4 leading-snug">
              {t('addOns.calculationsSubtext', { count: freeCalculationsCount, plan: planName })}
            </p>

            {/* Inner White Box */}
            <div className={`bg-white rounded-xl p-3 sm:p-4 transition-all ${!isCalcEditEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                {/* Custom Counter Control */}
                <div className="flex items-center gap-2 border border-[#060C121A] rounded-lg bg-white p-1 w-fit">
                  <button
                    onClick={handleCalcDecrement}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Minus className="w-4 h-4 text-primary opacity-50" />
                  </button>
                  <div className="w-10 h-8 flex items-center justify-center bg-[#F6F6F6] rounded-md">
                    <span className="text-sm font-semibold text-primary">{calculationQuantity}</span>
                  </div>
                  <button
                    onClick={handleCalcIncrement}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary opacity-50" />
                  </button>
                </div>

                <p className="text-primary text-sm font-medium">
                  ₹{calculationPackPrice}<span className="text-[#060C1280] font-normal">/{t('addOns.perCalculations', { count: 25 })}</span>
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
        onMemberAdded={handleMemberAdded}
        existingMembersCount={members.length}
        memberPrice={memberPrice}
      />
    </section>
  );
}

