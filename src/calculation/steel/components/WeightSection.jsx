import React from 'react';
import { useTranslation } from 'react-i18next';
import ReinforcementItem from './ReinforcementItem';
import rainForcementWeight from '../../../assets/icons/rainForcementWeight.svg';

const WeightSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');
    return (
        <div className="flex flex-col gap-4">
            <ReinforcementItem
                title={t('steel.weight.reinforcement')}
                icon={rainForcementWeight}
                onClick={() => onItemClick(t('steel.weight.reinforcement'))}
            />
        </div>
    );
};

export default WeightSection;
