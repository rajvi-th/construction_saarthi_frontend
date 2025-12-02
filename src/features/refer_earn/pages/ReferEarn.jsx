import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import Button from '../../../components/ui/Button';
import Loader from '../../../components/ui/Loader';
import { ReferralSummaryCards, InvitesList } from '../components';
import bonusIcon from '../../../assets/icons/bonusIcon.svg';
import { ROUTES_FLAT } from '../../../constants/routes';
import { useReferrals } from '../hooks';

export default function ReferEarn() {
  const { t } = useTranslation('referEarn');
  const navigate = useNavigate();
  const {
    referralCode,
    totalEarned,
    invites,
    isLoading,
    shareReferral,
  } = useReferrals();

  const handleViewWallet = () => {
    navigate(ROUTES_FLAT.REFER_EARN_WALLET);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-0 md:px-4 bg-[#F9FAFB]">
        <PageHeader title={t('header.title')} showBackButton={false} className=''>
          <div className="flex justify-start md:justify-end">
            <Button
              variant="primary"
              size="sm"
              className="whitespace-nowrap rounded-lg px-4 py-2"
              onClick={handleViewWallet}
            >
              {t('header.viewWallet')}
            </Button>
          </div>
        </PageHeader>

        {/* Bonus details hero */}
        <div className="flex justify-center mt-5 mb-6">
          <div className="flex flex-col items-center text-center md:max-w-[350px]">
            <img
              src={bonusIcon}
              alt="Refer & Earn bonus"
              className="w-40 md:w-56 h-auto mb-3"
            />
            <h2 className="text-lg font-semibold text-primary">
              {t('bonus.title')}
            </h2>
            <p className="mt-1 text-xs md:text-sm text-primary-light max-w-md">
              {t('bonus.description')}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            <ReferralSummaryCards
              referralCode={referralCode || '--------'}
              creditsAmount={`₹${totalEarned || 0}`}
              onShareCode={shareReferral}
            />
            <InvitesList invites={invites} />
          </>
        )}
      </div>
    </div>
  );
}

