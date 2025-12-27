import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';
import walletIcon from '../../../assets/icons/Wallet.svg';
import { Crown, ChevronRight } from 'lucide-react';
import { ROUTES_FLAT } from '../../../constants/routes';

const WALLET_ACTIVITIES = [
  {
    id: 1,
    title: 'Referral Reward',
    description: "Earned from Ramesh's Signup",
    amount: '+ ₹200',
    type: 'credit',
    date: '11 June 2025',
  },
  {
    id: 2,
    title: 'Subscription',
    description: 'Pro Plan - 1 Month',
    amount: '- ₹399',
    type: 'debit',
    date: '10 June 2025',
  },
  {
    id: 3,
    title: 'Referral Reward',
    description: "Earned from Amit's Signup",
    amount: '+ ₹200',
    type: 'credit',
    date: '09 June 2025',
  },
  {
    id: 4,
    title: 'Calculator Upgrade',
    description: 'Unlimited Construction Calculator Access',
    amount: '- ₹99',
    type: 'debit',
    date: '07 June 2025',
  },
];

const getAmountClasses = (type) => {
  if (type === 'credit') return 'text-[#34C759]';
  if (type === 'debit') return 'text-[#FF3B30]';
  return 'text-primary';
};

export default function Wallet() {
  const { t } = useTranslation('referEarn');
  // Placeholder for future API loading state
  const isLoadingActivity = false;

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
            className="rounded-3xl px-4 sm:px-8 py-6 sm:py-7 bg-[#F9F4EE] border"
            style={{ borderColor: '#060C120F' }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <p className="text-xs sm:text-sm font-medium text-primary-light tracking-wide">
                {t('wallet.currentBalance')}
              </p>
              <p className="text-[11px] sm:text-xs text-primary-light">
                {t('wallet.balanceDescription')}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[12px] bg-white px-6 sm:px-8 py-2 border border-[#F5D9B8]"
              >
                <span className="flex items-center justify-center">
                  <img src={walletIcon} alt="Wallet" className="w-6 h-6" />
                </span>
                <span className="text-base sm:text-lg font-semibold text-primary">
                  ₹1,200
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Wallet Activity */}
         <section className="mb-8">
           <h2 className="text-lg font-medium text-primary mb-3">
             {t('wallet.walletActivity')}
           </h2>
           {isLoadingActivity ? (
             <div className="flex items-center justify-center py-10">
               <Loader size="lg" />
             </div>
           ) : (
             <div className="flex flex-col gap-3">
               {WALLET_ACTIVITIES.map((item) => (
                 <article
                   key={item.id}
                   className="bg-white rounded-2xl border border-[#ECEFF3] shadow-[0_1px_3px_rgba(15,23,42,0.06)] px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3"
                 >
                   <div className="min-w-0">
                     <p className=" font-medium text-primary">
                       {item.title}
                     </p>
                     <p className="mt-1 text-xs sm:text-xs text-primary-light truncate">
                       {item.description}
                     </p>
                   </div>
                   <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                     <span
                       className={`text-lg font-medium ${getAmountClasses(
                         item.type
                       )}`}
                     >
                       {item.amount}
                     </span>
                     <span className="text-[11px] sm:text-xs text-primary-light">
                       {item.date}
                     </span>
                   </div>
                 </article>
               ))}
             </div>
           )}
         </section>

        {/* Use Wallet */}
        <section>
          <h2 className="text-sm sm:text-base font-semibold text-primary mb-3">
            {t('wallet.useWallet')}
          </h2>
          <div className="bg-white rounded-2xl cursor-pointer border border-[#ECEFF3] shadow-[0_1px_3px_rgba(15,23,42,0.06)] px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3">
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


