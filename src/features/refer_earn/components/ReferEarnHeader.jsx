import PageHeader from '../../../components/layout/PageHeader';
import Button from '../../../components/ui/Button';

export default function ReferEarnHeader() {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:flex-wrap lg:items-center mb-6">
      <div>
        <PageHeader
          title="Refer & Earn"
          showBackButton={false}
          className="mb-1"
        />
        <p className="text-sm md:text-base text-secondary max-w-xl">
          Invite your friends and earn rewards when they join Construction Saarthi and add
          their first project.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="md"
          className="whitespace-nowrap rounded-lg py-2.5"
        >
          View My Wallet
        </Button>
      </div>
    </div>
  );
}


