import React from 'react';
import { useTranslation } from 'react-i18next';
import ReinforcementItem from './ReinforcementItem';

// Import icons
import straightBar from '../../../../assets/icons/straightBar.svg';
import lShapeBar from '../../../../assets/icons/lShapeBar.svg';
import uShapeBar from '../../../../assets/icons/uShapeBar.svg';
import stirrups from '../../../../assets/icons/stirrups.svg';

import { useNavigate } from 'react-router-dom';

const CuttingLengthSection = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();
    const comingSoonPath = '/calculation/coming-soon';

    const cuttingItems = [
        { id: 'cut1', title: t('steel.cutting.straight'), icon: straightBar, path: comingSoonPath },
        { id: 'cut2', title: t('steel.cutting.lShape'), icon: lShapeBar, path: comingSoonPath },
        { id: 'cut3', title: t('steel.cutting.uShape'), icon: uShapeBar, path: comingSoonPath },
        { id: 'cut4', title: t('steel.cutting.stirrups'), icon: stirrups, path: comingSoonPath },
    ];

    // Dynamic grid columns based on item count
    const getGridCols = (count) => {
        if (count >= 3) return 'lg:grid-cols-3';
        return `lg:grid-cols-${count}`;
    };

    return (
        <div className={`grid grid-cols-2 ${getGridCols(cuttingItems.length)} gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6`}>
            {cuttingItems.map((item) => (
                <div key={item.id} className="flex-1">
                    <ReinforcementItem
                        title={item.title}
                        icon={item.icon}
                        onClick={() => navigate(item.path)}
                        noBackground={true}
                    />
                </div>
            ))}
        </div>
    );
};

export default CuttingLengthSection;

