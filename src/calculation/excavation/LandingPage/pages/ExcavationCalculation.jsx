import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/layout/PageHeader';
import ExcavationItem from '../components/ExcavationItem';
import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import verticalExcavationIcon from '../../../../assets/icons/verticalExcavations.svg';
import slopExcavationIcon from '../../../../assets/icons/slopExcavations.svg';
import slopBackfilling1Icon from '../../../../assets/icons/slopBackfilling1st.svg';
import slopBackfilling2Icon from '../../../../assets/icons/slopBackfilling2nd.svg';

const ExcavationCalculation = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const items = [
        { id: 'vertical', title: t('excavation.vertical.title'), icon: verticalExcavationIcon, path: '/calculation/excavation/vertical' },
        { id: 'slop', title: t('excavation.slop.title'), icon: slopExcavationIcon, path: '/calculation/excavation/slop' },
        { id: 'slopBackfilling1', title: t('excavation.slopBackfilling1.title'), icon: slopBackfilling1Icon, path: '/calculation/excavation/slop-backfilling-1' },
        { id: 'slopBackfilling2', title: t('excavation.slopBackfilling2.title'), icon: slopBackfilling2Icon, path: '/calculation/excavation/slop-backfilling-2' },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('quickActions.items.excavation')}
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <ExcavationItem
                        key={item.id}
                        title={item.title}
                        icon={item.icon}
                        onClick={() => navigate(item.path)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ExcavationCalculation;
