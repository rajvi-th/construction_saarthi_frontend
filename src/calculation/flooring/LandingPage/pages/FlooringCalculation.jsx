import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/layout/PageHeader';
import FlooringItem from '../components/FlooringItem';

import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import flooringIcon from '../../../../assets/icons/flooringg.svg';
import paverCalculationIcon from '../../../../assets/icons/paverCalculation.svg';
import tileGroutIcon from '../../../../assets/icons/tileGrout.svg';

const FlooringCalculation = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const items = [
        { id: 'flooring', title: t('roofArea.flooring.title'), icon: flooringIcon, path: ROUTES_FLAT.CALCULATION_FLOORING_FLOORING },
        { id: 'paver', title: t('roofArea.paver.title'), icon: paverCalculationIcon, path: ROUTES_FLAT.CALCULATION_FLOORING_PAVER },
        { id: 'tileGrout', title: t('roofArea.tileGrout.title'), icon: tileGroutIcon, path: ROUTES_FLAT.CALCULATION_FLOORING_TILE_GROUT },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('quickActions.items.flooringCalculation')}
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <FlooringItem
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

export default FlooringCalculation;
