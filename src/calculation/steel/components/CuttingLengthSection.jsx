import React from 'react';
import { useTranslation } from 'react-i18next';

const CuttingLengthSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');
    return (
        <div className="text-secondary text-sm italic py-2">
            {t('steel.comingSoon.cutting')}
        </div>
    );
};

export default CuttingLengthSection;
