import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/layout/PageHeader';
import watchBig from '../../assets/images/watchBig.svg';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ComingSoon(props) {
  const { t } = useTranslation('calculation');
  const { title: propTitle, subtitle: propSubtitle, backTo: propBackTo, onBack: propOnBack } = props || {};
  const location = useLocation();
  const navigate = useNavigate();

  const state = location?.state || {};

  const title = propTitle ?? state.title ?? t('comingSoon.title');
  const propSubtitleVal = propSubtitle ?? state.subtitle ?? null;
  const pageName = props.pageName ?? state.pageName ?? title;
  const pageColor = props.pageColor ?? state.pageColor ?? (String(pageName).toLowerCase().includes('rail') ? 'text-accent' : 'text-primary');
  const backTo = propBackTo ?? state.backTo;

  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-12">
      <PageHeader title={title} backTo={backTo} onBack={handleBack} />

      <div className="flex flex-col items-center justify-center mt-8 sm:mt-12">
        <img src={watchBig} alt="watch" className="w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72" />

        <h2 className="mt-8 text-2xl sm:text-3xl md:text-4xl font-semibold text-primary">
          {t('comingSoon.comingSoonText')}
        </h2>

        <p className="mt-3 max-w-xl text-center text-sm sm:text-base text-muted">
          {propSubtitleVal ? (
            propSubtitleVal
          ) : (
            <>
              <span>{t('comingSoon.launchTextPart1')}</span>
              <span className={`${pageColor} font-medium`}>{pageName}</span>
              <span>{t('comingSoon.launchTextPart2')}</span>
            </>
          )}
        </p>

        <button
          onClick={handleBack}
          className="mt-6 inline-flex items-center gap-2 text-sm text-accent font-medium hover:underline"
        >
          {t('comingSoon.backButton')}
        </button>
      </div>
    </div>
  );
}
