import walletIcon from '../../../assets/icons/Wallet.svg';
import { Copy, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showSuccess, showError } from '../../../utils/toast';

export default function ReferralSummaryCards({
  creditsAmount = '₹1,200',
  referralCode = 'THOMAS324',
  onCopyCode,
  onShareCode, // should return referralLink if available
}) {
  const { t } = useTranslation('referEarn');

  const handleCopy = () => {
    if (onCopyCode) {
      onCopyCode(referralCode);
      return;
    }
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(referralCode).catch(() => {});
    }
  };

  const handleShare = async () => {
    try {
      let referralLink = null;

      if (onShareCode) {
        referralLink = await onShareCode(referralCode);
      }

      const shareText = referralLink
        ? `Use my Construction Saarthi referral link: ${referralLink}`
        : `Use my Construction Saarthi referral code: ${referralCode}`;

      if (navigator.share) {
        await navigator.share({
          title: t('share.shareTitle'),
          text: shareText,
          url: referralLink || window.location.href,
        });
        showSuccess(t('share.shareSuccess'));
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        showSuccess(t('share.shareCopied'));
      } else {
        showError(t('share.shareNotSupported'));
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        showError(t('share.shareError'));
      }
    }
  };

  return (
    <div className="grid gap-4 md:gap-5 md:grid-cols-2 mb-8">
      {/* Credits Earned */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 md:px-6 md:py-5 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 rounded-full bg-[#F9FAFB] flex items-center justify-center">
              <img
                src={walletIcon}
                alt="Credits wallet"
                className="w-10 h-10"
              />
            </div>
            <p className="text-base md:text-lg font-medium text-primary">
              {t('summary.creditsEarned')}
            </p>
          </div>
          <p className="text-xl md:text-2xl font-semibold text-[#B3330E]">
            {creditsAmount}
          </p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-[#FFF7ED] rounded-2xl border border-[#FDE4C8] px-5 py-4 md:px-6 md:py-5 flex flex-col gap-3">
        <p className=" text-primary font-medium">{t('summary.yourReferralCode')}</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex-1">
            <div className="w-full rounded-xl border border-[#FDE4C8] bg-white px-6 py-2.5 text-center font-semibold text-sm md:text-base tracking-[0em] text-primary">
              {referralCode}
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FFF1F2] border border-[#FECACA] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
              aria-label={t('summary.copyCode')}
            >
              <Copy className="w-4 h-4" strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#ECFDF3] border border-[#BBF7D0] text-[#16A34A] hover:bg-[#DCFCE7] transition-colors"
              aria-label={t('summary.shareCode')}
            >
              <Share2 className="w-4 h-4" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
