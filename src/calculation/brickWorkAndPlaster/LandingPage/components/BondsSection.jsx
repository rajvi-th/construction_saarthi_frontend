import React from 'react';
import { useTranslation } from 'react-i18next';
import BrickWorkItem from './BrickWorkItem';
import { useNavigate } from 'react-router-dom';
import stretcherBond from '../../../../assets/icons/stretcherBond.svg';
import headerBond from '../../../../assets/icons/headerBond.svg';
import englishBond from '../../../../assets/icons/englishBond.svg';
import flemishBond from '../../../../assets/icons/flemishBond.svg';
import stackBond from '../../../../assets/icons/stackBond.svg';
import englishCrossBond from '../../../../assets/icons/englishCrossBond.svg';
import gardenWallBond from '../../../../assets/icons/gardenWallBond.svg';
import { ROUTES_FLAT } from '../../../../constants/routes';

const BondsSection = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const items = [
        { id: 'stretcher', title: t('brickWorkAndPlaster.bonds.stretcher'), icon: stretcherBond, path: ROUTES_FLAT.CALCULATION_STRETCHER_BOND },
        { id: 'header', title: t('brickWorkAndPlaster.bonds.header'), icon: headerBond, path: ROUTES_FLAT.CALCULATION_HEADER_BOND },
        { id: 'english', title: t('brickWorkAndPlaster.bonds.english'), icon: englishBond, path: ROUTES_FLAT.CALCULATION_ENGLISH_BOND },
        { id: 'flemish', title: t('brickWorkAndPlaster.bonds.flemish'), icon: flemishBond, path: ROUTES_FLAT.CALCULATION_FLEMISH_BOND },
        { id: 'stack', title: t('brickWorkAndPlaster.bonds.stack'), icon: stackBond, path: ROUTES_FLAT.CALCULATION_STACK_BOND },
        { id: 'dutch', title: t('brickWorkAndPlaster.bonds.dutch'), icon: englishCrossBond, path: ROUTES_FLAT.CALCULATION_ENGLISH_CROSS_BOND },
        { id: 'gardenWall', title: t('brickWorkAndPlaster.bonds.gardenWall'), icon: gardenWallBond, path: ROUTES_FLAT.CALCULATION_GARDEN_WALL_BOND },
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

export default BondsSection;
