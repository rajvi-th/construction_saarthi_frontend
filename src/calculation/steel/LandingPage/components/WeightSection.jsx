import React from 'react';
import { useTranslation } from 'react-i18next';
import ReinforcementItem from './ReinforcementItem';
import rainForcementWeight from '../../../../assets/icons/rainForcementWeight.svg';

const WeightSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');

    const weightItems = [
        { id: 'weight1', title: t('steel.weight.reinforcement'), icon: rainForcementWeight },
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
                        onClick={() => onItemClick(item.title)}
                    />
                </div>
            ))}
        </div>
    );
};

export default WeightSection;
