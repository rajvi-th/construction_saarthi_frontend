import React from 'react';
import { useTranslation } from 'react-i18next';
import ReinforcementItem from './ReinforcementItem';
import rainForcementWeight from '../../../../assets/icons/rainForcementWeight.svg';

import { useNavigate } from 'react-router-dom';
import { ROUTES_FLAT } from '../../../../constants/routes';

const WeightSection = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const weightItems = [
        { id: 'weight1', title: t('steel.weight.reinforcement'), icon: rainForcementWeight, path: ROUTES_FLAT.CALCULATION_REINFORCEMENT_WEIGHT },
    ];

    // Dynamic grid columns based on item count
    const getGridCols = (count) => {
        if (count >= 3) return 'lg:grid-cols-3';
        return `lg:grid-cols-${count}`;
    };

    return (
        <div className={`grid grid-cols-2 ${getGridCols(weightItems.length)} gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6`}>
            {weightItems.map((item) => (
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

export default WeightSection;
