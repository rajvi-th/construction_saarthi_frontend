import React from 'react';
import { useTranslation } from 'react-i18next';
import ReinforcementItem from './ReinforcementItem';

// Import icons
import slabType1 from '../../../../assets/icons/slabType1.svg';
import slabType2 from '../../../../assets/icons/slabType2.svg';
import slabType3 from '../../../../assets/icons/slabType3.svg';

import { useNavigate } from 'react-router-dom';

const SlabSection = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();
    const comingSoonPath = '/calculation/coming-soon';

    const slabItems = [
        { id: 'sl1', title: t('steel.slab.type1'), icon: slabType1, path: comingSoonPath },
        { id: 'sl2', title: t('steel.slab.type2'), icon: slabType2, path: comingSoonPath },
        { id: 'sl3', title: t('steel.slab.type3'), icon: slabType3, path: comingSoonPath },
    ];

    // Dynamic grid columns based on item count
    const getGridCols = (count) => {
        if (count >= 3) return 'lg:grid-cols-3';
        return `lg:grid-cols-${count}`;
    };

    return (
        <div className={`grid grid-cols-2 ${getGridCols(slabItems.length)} gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6`}>
            {slabItems.map((item) => (
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

export default SlabSection;

