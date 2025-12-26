import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';


const getStatusClasses = (type) => {
  switch (type) {
    case 'success':
      return 'bg-[#34C759] text-white';
    case 'warning':
      return 'bg-[#FF9500] text-white';
    case 'danger':
      return 'bg-[#B02E0C] text-white';
    default:
      return 'bg-[#BABABA] text-white';
  }
};

const getAvatarClasses = (type) => {
  switch (type) {
    case 'success':
      return 'bg-[#F0FDF4] border border-[#86EFAC] text-[#16A34A]';
    case 'warning':
      return 'bg-[#FFFBEB] border border-[#FED7AA] text-[#EA580C]';
    case 'danger':
      return 'bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]';
    default:
      return 'bg-[#FFF7ED] border border-[#FED7AA] text-[#B45309]';
  }
};

export default function InvitesList({ invites = [] }) {
  const { t } = useTranslation('referEarn');
  const [expandedId, setExpandedId] = useState(invites[0]?.id ?? null);

  const handleToggle = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <section className="">
       <header className=" py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base md:text-lg font-medium text-primary">
            {t('invites.title')}
          </h2>
        
        </div>
      </header>

      <div className="flex flex-col gap-3 md:gap-3.5 pb-4">
        {invites.length === 0 ? (
          <div className="text-center py-8 text-primary-light">
            <p>{t('invites.noInvites', { defaultValue: 'No invites found.' })}</p>
          </div>
        ) : (
          invites.map((invite) => {
          const isExpanded = expandedId === invite.id;

          return (
          <article
            key={invite.id}
            className="bg-white rounded-2xl border border-[#ECEFF3] shadow-[0_1px_3px_rgba(15,23,42,0.06)] px-5 py-3.5 md:px-6 md:py-4 flex flex-col gap-2.5 cursor-pointer"
            onClick={() => handleToggle(invite.id)}
          >
            {/* Top row: avatar, name, status pill + chevron */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[10px] md:text-xs font-medium flex-shrink-0 ${getAvatarClasses(
                    invite.statusType
                  )}`}
                >
                  {invite.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm md:text-base font-medium text-primary truncate">
                    {invite.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs md:text-xs font-medium ${getStatusClasses(
                    invite.statusType
                  )}`}
                >
                  {invite.statusLabel}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(invite.id);
                  }}
                  className="w-7 h-7 flex items-center justify-center bg-white text-secondary transition-colors cursor-pointer"
                  aria-label={isExpanded ? t('invites.collapseDetails') : t('invites.expandDetails')}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom section: only when expanded */}
            {isExpanded && (
              <div className="mt-2.5 pt-2.5 border-t border-[#F1F5F9] flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
                {/* Left column: Invite & Reward status */}
                <div className="space-y-2 text-xs md:text-sm w-full md:w-auto">
                  <div>
                    <p className="font-medium text-secondary">{t('invites.inviteStatus')}</p>
                    <p className="text-primary mt-0.5">
                      {invite.inviteStatus}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-secondary">{t('invites.rewardStatus')}</p>
                    <p className="text-primary mt-0.5">
                      {invite.rewardStatus}
                    </p>
                  </div>
                </div>

                {/* Right column: chips */}
                {(invite.codeUsed || invite.joinedVia) && (
                  <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto md:justify-end">
                    {invite.codeUsed && (
                      <div className="w-full md:w-auto min-w-[140px] h-[56px] flex flex-col items-center justify-center border border-[#E7D7C1] rounded-2xl px-4 py-2 text-[11px] md:text-xs text-secondary bg-white">
                        <span className="font-medium text-primary-light leading-none mb-1">
                          {t('invites.codeUsed')}
                        </span>
                        <span className="font-semibold text-primary text-xs md:text-sm leading-none">
                          {invite.codeUsed}
                        </span>
                      </div>
                    )}
                    {invite.joinedVia && (
                      <div className="w-full md:w-auto min-w-[160px] h-[56px] flex flex-col items-center justify-center border border-[#E7D7C1] rounded-2xl px-4 py-2 text-[11px] md:text-xs text-secondary bg-white">
                        <span className="font-medium text-primary-light leading-none mb-1">
                          {t('invites.joinedVia')}
                        </span>
                        <span className="font-semibold text-primary text-xs md:text-sm leading-none">
                          {invite.joinedVia}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </article>
        );
        })
        )}
      </div>
    </section>
  );
}


