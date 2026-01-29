import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';
import walletIcon from '../../../assets/icons/Wallet.svg';
import { Crown, ChevronRight } from 'lucide-react';
import { ROUTES_FLAT } from '../../../constants/routes';
import { useWallet } from '../hooks/useWallet';
import { formatCurrencyINR, formatDate } from '../../labourAttendance/utils/formatting';

const getAmountClasses = (type) => {
  if (type === 'credit') return 'text-[#34C759]';
  if (type === 'debit') return 'text-[#FF3B30]';
  return 'text-primary';
};

const getActivityInfo = (activity, t) => {
  const { transaction_type, description } = activity;

  switch (transaction_type) {
    case 'coupon_discount':
      return {
        title: description,
        description: '',
      };
    case 'referral_reward':
      return {
        title: t('wallet.referralReward'),
        description: description,
      };
    case 'subscription':
      return {
        title: t('wallet.subscription'),
        description: description,
      };
    case 'calculator_upgrade':
      return {
        title: t('wallet.calculatorUpgrade'),
        description: description,
      };
    default:
      return {
        title: transaction_type ? transaction_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Transaction',
        description: description,
      };
  }
};

export default function Wallet() {
  const { t } = useTranslation('referEarn');
  const navigate = useNavigate();
  const { data: walletData, isLoading } = useWallet();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const summary = walletData || {};
  const currentBalance = summary.current_balance || 0;
  const activities = summary.wallet_activity || [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-0 md:px-4 bg-[#F9FAFB]">
        <PageHeader title={t('wallet.title')}
          showBackButton={true}
          backTo={ROUTES_FLAT.REFER_EARN}
        />

        {/* Current balance card */}
        <section className="mb-8">
          <div
            className="rounded-3xl px-4 sm:px-8 py-3 sm:py-5 bg-[#F9F4EE] border"
            style={{ borderColor: '#060C120F' }}
          >
            <div className="flex flex-col items-center text-center">
              <p className="text-xs sm:text-lg font-medium text-primary tracking-wide">
                {t('wallet.currentBalance')}
              </p>
              <p className="text-[11px] sm:text-xs text-primary-light mb-2">
                {t('wallet.balanceDescription')}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[12px] bg-white px-6 sm:px-8 py-2 border border-[#F5D9B8]"
              >
                <span className="flex items-center justify-center">
                  <img src={walletIcon} alt="Wallet" className="w-6 h-6" />
                </span>
                <span className="text-base sm:text-lg font-semibold text-[#B02E0C]">
                  {formatCurrencyINR(currentBalance)}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Wallet Activity */}
        <section className="mb-8 px-4 md:px-0">
          <h2 className="text-lg font-medium text-primary mb-3">
            {t('wallet.walletActivity')}
          </h2>
          <div className="flex flex-col gap-3">
            {activities.length > 0 ? (
              activities.map((activity, idx) => {
                const info = getActivityInfo(activity, t);
                const isCredit = activity.type === 'credit';
                return (
                  <article
                    key={activity.reference_id || idx}
                    className="bg-white rounded-2xl border border-[#ECEFF3] shadow-[0_1px_3px_rgba(15,23,42,0.06)] px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className=" font-medium text-primary truncate">
                        {info.title}
                      </p>
                      {info.description && (
                        <p className="mt-1 text-xs sm:text-xs text-primary-light truncate">
                          {info.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                      <span
                        className={`text-lg font-medium ${getAmountClasses(
                          activity.type
                        )}`}
                      >
                        {isCredit ? '+' : '-'} {formatCurrencyINR(activity.amount)}
                      </span>
                      <span className="text-[11px] sm:text-xs text-primary-light">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="text-center text-primary-light py-10 italic">
                {t('common.noData', { ns: 'common', defaultValue: 'No activity yet' })}
              </p>
            )}
          </div>
        </section>

        {/* Use Wallet */}
        <section className="px-4 md:px-0 pb-8">
          <h2 className="text-sm sm:text-base font-semibold text-primary mb-3">
            {t('wallet.useWallet')}
          </h2>
          <div
            onClick={() => navigate(ROUTES_FLAT.SUBSCRIPTION)}
            className="bg-white rounded-2xl cursor-pointer border border-[#ECEFF3] shadow-[0_1px_3px_rgba(15,23,42,0.06)] px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center justify-center text-[#FF9500]">
                <Crown className="w-6 h-6" strokeWidth={2.4} />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium text-primary">
                  {t('wallet.upgradeToPro')}
                </p>
                <p className="mt-0.5 text-[11px] sm:text-xs text-primary-light">
                  {t('wallet.upgradeDescription')}
                </p>
              </div>
            </div>
            <span className="text-primary-light">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}



