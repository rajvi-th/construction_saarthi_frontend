import React from 'react';
import { useTranslation } from 'react-i18next';
import MetalItem from './MetalItem';
import { useNavigate } from 'react-router-dom';

// Import icons
import clevisBolted from '../../../../assets/icons/clevisBolted.svg';
import blindBolted from '../../../../assets/icons/blindBolted.svg';
import flangeBolted from '../../../../assets/icons/flangeBolted.svg';
import pinnedBolted from '../../../../assets/icons/pinnedBolted.svg';
import lapBolted from '../../../../assets/icons/lapBolted.svg';

const BoltedJointsSection = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();
    const comingSoonPath = '/calculation/coming-soon';

    const boltedItems = [
        { id: 'clevis', title: t('metal.bolted.clevis'), icon: clevisBolted, path: comingSoonPath },
        { id: 'blind', title: t('metal.bolted.blind'), icon: blindBolted, path: comingSoonPath },
        { id: 'flange', title: t('metal.bolted.flange'), icon: flangeBolted, path: comingSoonPath },
        { id: 'pinned', title: t('metal.bolted.pinned'), icon: pinnedBolted, path: comingSoonPath },
        { id: 'lap', title: t('metal.bolted.lap'), icon: lapBolted, path: comingSoonPath },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {boltedItems.map((item) => (
                <div key={item.id} className="flex-1">
                    <MetalItem
                        title={item.title}
                        icon={item.icon}
                        onClick={() => navigate(item.path, { state: { title: item.title, pageName: item.title } })}
                    />
                </div>
            ))}
        </div>
    );
};

export default BoltedJointsSection;
