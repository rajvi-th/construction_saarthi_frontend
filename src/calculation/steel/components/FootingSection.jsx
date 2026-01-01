import React from 'react';
import { useTranslation } from 'react-i18next';
import ReinforcementItem from './ReinforcementItem';
import footingType1 from '../../../assets/icons/footingType1.svg';
import footingType2 from '../../../assets/icons/footingType2.svg';

const FootingSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');
    return (
        <div className="flex flex-wrap gap-8 sm:gap-12">
            <div className="flex-1 min-w-[200px]">
                <ReinforcementItem
                    title={t('steel.footing.type1')}
                    icon={footingType1}
                    onClick={() => onItemClick(t('steel.footing.type1'))}
                />
            </div>
            <div className="flex-1 min-w-[200px]">
                <ReinforcementItem
                    title={t('steel.footing.type2')}
                    icon={footingType2}
                    onClick={() => onItemClick(t('steel.footing.type2'))}
                />
            </div>
        </div>
    );
};

export default FootingSection;
