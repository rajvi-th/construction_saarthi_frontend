import { useState, useEffect, useCallback } from 'react';
import { getMyReferrals, generateReferralLink, shareReferralApi } from '../api';
import { showError } from '../../../utils/toast';

const mapStatusType = (invite) => {
  if (invite.earned_amount && invite.earned_amount > 0) return 'success';
  if (invite.invite_status?.toLowerCase().includes('expired')) return 'danger';
  if (invite.reward_status?.toLowerCase().includes('pending')) return 'warning';
  return 'default';
};

const getInitials = (name = '') => {
  const clean = (name || '').trim();
  if (!clean || clean.toUpperCase() === 'N/A') return 'NA';
  const parts = clean.split(/\s+/);
  const first = parts[0]?.[0] || '';
  const second = parts[1]?.[0] || '';
  return (first + second).toUpperCase();
};

export const useReferrals = () => {
  const [referralCode, setReferralCode] = useState('');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReferrals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getMyReferrals();

      const code = response?.referral_code || '';
      const earned = response?.total_earned || 0;
      const list = Array.isArray(response?.data) ? response.data : [];

      setReferralCode(code);
      setTotalReferrals(response?.total_referrals || list.length);
      setTotalEarned(earned);

      const mappedInvites = list.map((item, index) => {
        const name = item.name && item.name !== 'N/A' ? item.name : 'N/A';
        const statusType = mapStatusType(item);

        return {
          id: item.id || index,
          name,
          initials: getInitials(name),
          inviteStatus: item.invite_status || '',
          rewardStatus: item.reward_status || '',
          statusLabel:
            item.earned_amount && item.earned_amount > 0
              ? `Earned ₹${item.earned_amount}`
              : item.invite_status || item.status || 'Invite Sent',
          statusType,
          codeUsed: item.code_used || '',
          joinedVia:
            item.joined_via && item.joined_via !== 'N/A'
              ? item.joined_via === 'whatsapp'
                ? 'WhatsApp'
                : item.joined_via
              : null,
          uniqueNumber: item.code_used || '',
        };
      });

      setInvites(mappedInvites);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      const message =
        err?.response?.data?.message || err?.message || 'Failed to load referrals';
      setError(message);
      setInvites([]);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const shareReferral = useCallback(
    async (sharedVia = 'whatsapp') => {
      if (!referralCode) {
        showError('Referral code not available yet.');
        return null;
      }

      if (!invites.length) {
        showError('No referrals available to share.');
        return null;
      }

      const targetInvite =
        invites.find((inv) => inv.statusType === 'default' || inv.statusType === 'warning') ||
        invites[0];

      try {
        const generateResponse = await generateReferralLink({
          referral_code: referralCode,
          unique_number: targetInvite.uniqueNumber,
        });

        const uniqueNumber =
          generateResponse?.unique_number || targetInvite.uniqueNumber || '';
        const referralLink = generateResponse?.referral_link || '';

        if (uniqueNumber) {
          await shareReferralApi({
            unique_number: uniqueNumber,
            shared_via: sharedVia,
          });
        }

        return referralLink || null;
      } catch (err) {
        console.error('Error generating or sharing referral link:', err);
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to generate referral link.';
        showError(message);
        return null;
      }
    },
    [referralCode, invites]
  );

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  return {
    referralCode,
    totalReferrals,
    totalEarned,
    invites,
    isLoading,
    error,
    refetch: fetchReferrals,
    shareReferral,
  };
};

export default useReferrals;


