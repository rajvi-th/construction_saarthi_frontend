import React from 'react';
import { useTranslation } from 'react-i18next';
import ReinforcementItem from './ReinforcementItem';
import footingType1 from '../../../../assets/icons/footingType1.svg';
import footingType2 from '../../../../assets/icons/footingType2.svg';

import { useNavigate } from 'react-router-dom';
import { ROUTES_FLAT } from '../../../../constants/routes';

const FootingSection = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const footingItems = [
        { id: 'foot1', title: t('steel.footing.type1'), icon: footingType1, path: ROUTES_FLAT.CALCULATION_FOOTING_TYPE1 },
        { id: 'foot2', title: t('steel.footing.type2'), icon: footingType2, path: ROUTES_FLAT.CALCULATION_FOOTING_TYPE2 },
    ];

    // Dynamic grid columns based on item count
    const getGridCols = (count) => {
        if (count >= 3) return 'lg:grid-cols-3';
        return `lg:grid-cols-${count}`;
    };

    return (
        <div className={`grid grid-cols-2 ${getGridCols(footingItems.length)} gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6`}>
            {footingItems.map((item) => (
                <div key={item.id} className="flex-1">
                    <ReinforcementItem
                        title={item.title}
                        icon={item.icon}
                        onClick={() => navigate(item.path)}
                    />
                </div>
            ))}
        </div>
    );
};

export default FootingSection;
