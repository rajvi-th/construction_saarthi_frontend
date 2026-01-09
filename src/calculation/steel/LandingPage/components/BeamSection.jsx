import React from 'react';
import { useTranslation } from 'react-i18next';
import ReinforcementItem from './ReinforcementItem';

// Import icons
import bmType1 from '../../../../assets/icons/bmType1.svg';
import bmType2 from '../../../../assets/icons/bmType2.svg';
import bmType3 from '../../../../assets/icons/bmType3.svg';
import bmType4 from '../../../../assets/icons/bmType4.svg';
import bmType5 from '../../../../assets/icons/bmType5.svg';
import bmType6 from '../../../../assets/icons/bmType6.svg';
import bmType7 from '../../../../assets/icons/bmType7.svg';
import bmType8 from '../../../../assets/icons/bmType8.svg';
import bmType9 from '../../../../assets/icons/bmType9.svg';
import bmType10 from '../../../../assets/icons/bmType10.svg';
import bmHorizontalBar from '../../../../assets/icons/bmHorizontalBar.svg';
import bmRing1 from '../../../../assets/icons/bmRing1.svg';
import bmRing2 from '../../../../assets/icons/bmRing2.svg';

import { useNavigate } from 'react-router-dom';

const BeamSection = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();
    const comingSoonPath = '/calculation/coming-soon';

    const beamItems = [
        { id: 'beam1', title: t('steel.beam.type1'), icon: bmType1, path: comingSoonPath },
        { id: 'beam2', title: t('steel.beam.type2'), icon: bmType2, path: comingSoonPath },
        { id: 'beam3', title: t('steel.beam.type3'), icon: bmType3, path: comingSoonPath },
        { id: 'beam4', title: t('steel.beam.type4'), icon: bmType4, path: comingSoonPath },
        { id: 'beam5', title: t('steel.beam.type5'), icon: bmType5, path: comingSoonPath },
        { id: 'beam6', title: t('steel.beam.type6'), icon: bmType6, path: comingSoonPath },
        { id: 'beam7', title: t('steel.beam.type7'), icon: bmType7, path: comingSoonPath },
        { id: 'beam8', title: t('steel.beam.type8'), icon: bmType8, path: comingSoonPath },
        { id: 'beam9', title: t('steel.beam.type9'), icon: bmType9, path: comingSoonPath },
        { id: 'beam10', title: t('steel.beam.type10'), icon: bmType10, path: comingSoonPath },
        { id: 'beamHorizontal', title: t('steel.beam.horizontal'), icon: bmHorizontalBar, path: comingSoonPath },
        { id: 'beamRing1', title: t('steel.beam.ring1'), icon: bmRing1, path: comingSoonPath },
        { id: 'beamRing2', title: t('steel.beam.ring2'), icon: bmRing2, path: comingSoonPath },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {beamItems.map((item) => (
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

export default BeamSection;

