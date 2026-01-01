import React from 'react';
import { useTranslation } from 'react-i18next';

const SlabSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');
    return (
        <div className="text-secondary text-sm italic py-2">
            {t('steel.comingSoon.slab')}
        </div>
    );
};

export default SlabSection;
