import React from 'react';
import { useTranslation } from 'react-i18next';
import MetalItem from './MetalItem';
import { useNavigate } from 'react-router-dom';

// Import icons
import buttWelded from '../../../../assets/icons/buttWelded.svg';
import cornerWelded from '../../../../assets/icons/cornerWelded.svg';
import lapWelded from '../../../../assets/icons/lapWelded.svg';
import tjointWelded from '../../../../assets/icons/tjointWelded.svg';
import edgeWelded from '../../../../assets/icons/edgeWelded.svg';

const WeldedJointsSection = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();
    const comingSoonPath = '/calculation/coming-soon';

    const weldedItems = [
        { id: 'butt', title: t('metal.welded.butt'), icon: buttWelded, path: comingSoonPath },
        { id: 'corner', title: t('metal.welded.corner'), icon: cornerWelded, path: comingSoonPath },
        { id: 'lap', title: t('metal.welded.lap'), icon: lapWelded, path: comingSoonPath },
        { id: 'tJoint', title: t('metal.welded.tJoint'), icon: tjointWelded, path: comingSoonPath },
        { id: 'edge', title: t('metal.welded.edge'), icon: edgeWelded, path: comingSoonPath },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {weldedItems.map((item) => (
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

export default WeldedJointsSection;
