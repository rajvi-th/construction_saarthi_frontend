import React from 'react';
import { useTranslation } from 'react-i18next';
import BrickWorkItem from './BrickWorkItem';
import { useNavigate } from 'react-router-dom';
import claybrick from '../../../../assets/icons/claybrick.svg';
import aac from '../../../../assets/icons/aac.svg';
import sandPlaster from '../../../../assets/icons/sandPlaster.svg';
import gypsum from '../../../../assets/icons/gypsum.svg';

import { ROUTES_FLAT } from '../../../../constants/routes';

const QuantitySection = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const items = [
        { id: 'clayBrick', title: t('brickWorkAndPlaster.quantity.clayBrick'), icon: claybrick, path: ROUTES_FLAT.CALCULATION_CLAY_BRICK },
        { id: 'byVolume', title: 'By Volume', icon: claybrick, path: ROUTES_FLAT.CALCULATION_BY_VOLUME },
        { id: 'aacBlock', title: t('brickWorkAndPlaster.quantity.aacBlock'), icon: aac, path: ROUTES_FLAT.CALCULATION_AAC_BLOCK },
        { id: 'sandPlaster', title: t('brickWorkAndPlaster.quantity.sandPlaster'), icon: sandPlaster, path: ROUTES_FLAT.CALCULATION_SAND_PLASTER },
        { id: 'gypsumPlaster', title: t('brickWorkAndPlaster.quantity.gypsumPlaster'), icon: gypsum, path: ROUTES_FLAT.CALCULATION_GYPSUM_PLASTER },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-2">
            {items.map((item) => (
                <BrickWorkItem
                    key={item.id}
                    title={item.title}
                    icon={item.icon}
                    onClick={() => navigate(item.path)}
                />
            ))}
        </div>
    );
};

export default QuantitySection;
