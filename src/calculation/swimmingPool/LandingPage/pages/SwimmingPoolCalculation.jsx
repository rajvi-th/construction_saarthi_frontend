import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/layout/PageHeader';
import SwimmingPoolItem from '../components/SwimmingPoolItem';

// Import icons
import rectangularIcon from '../../../../assets/icons/rectangularSwimmingPools.svg';
import circularIcon from '../../../../assets/icons/circularSwimmingPools.svg';
import ovalIcon from '../../../../assets/icons/ovalSwimmingPools.svg';
import romanIcon from '../../../../assets/icons/romanSwimmingPools.svg';
import grecianIcon from '../../../../assets/icons/grecianSwimmingPools.svg';
import lShapeIcon from '../../../../assets/icons/lShapeSwimmingPools.svg';

const SwimmingPoolCalculation = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const items = [
        { id: 'rectangular', title: t('swimmingPool.rectangular.title'), icon: rectangularIcon, path: '/calculation/swimming-pool/rectangular' },
        { id: 'circular', title: t('swimmingPool.circular.title'), icon: circularIcon, path: '/calculation/swimming-pool/circular' },
        { id: 'oval', title: t('swimmingPool.oval.title'), icon: ovalIcon, path: '/calculation/swimming-pool/oval' },
        { id: 'roman', title: t('swimmingPool.roman.title'), icon: romanIcon, path: '/calculation/swimming-pool/roman' },
        { id: 'grecian', title: t('swimmingPool.grecian.title'), icon: grecianIcon, path: '/calculation/swimming-pool/grecian' },
        { id: 'lShape', title: t('swimmingPool.lShape.title'), icon: lShapeIcon, path: '/calculation/swimming-pool/l-shape' },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('swimmingPool.title')}
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <SwimmingPoolItem
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

export default SwimmingPoolCalculation;
