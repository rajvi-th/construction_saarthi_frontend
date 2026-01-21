import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/layout/PageHeader';
import WaterTankItem from '../components/WaterTankItem';

import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import rectangularWaterTankIcon from '../../../../assets/icons/rectangularWaterTank.svg';
import cylindricalWaterTankIcon from '../../../../assets/icons/cylindricalWaterTank.svg';
import partlyFilledCircularTankIcon from '../../../../assets/icons/partlyFilledCircularTank.svg';
import partlyFilledRectangularTankIcon from '../../../../assets/icons/partlyFilledRectangularTank.svg';

const WaterTankCalculation = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const items = [
        { id: 'rectangular', title: t('waterTank.rectangular.title'), icon: rectangularWaterTankIcon, path: ROUTES_FLAT.CALCULATION_WATER_TANK_RECTANGULAR },
        { id: 'cylindrical', title: t('waterTank.cylindrical.title'), icon: cylindricalWaterTankIcon, path: ROUTES_FLAT.CALCULATION_WATER_TANK_CYLINDRICAL },
        { id: 'partlyFilledCircular', title: t('waterTank.partlyFilledCircular.title'), icon: partlyFilledCircularTankIcon, path: ROUTES_FLAT.CALCULATION_WATER_TANK_PARTLY_FILLED_CIRCULAR },
        { id: 'partlyFilledRectangular', title: t('waterTank.partlyFilledRectangular.title'), icon: partlyFilledRectangularTankIcon, path: ROUTES_FLAT.CALCULATION_WATER_TANK_PARTLY_FILLED_RECTANGULAR },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('quickActions.items.waterTankCapacity')}
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <WaterTankItem
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

export default WaterTankCalculation;
