import React from 'react';
import { useTranslation } from 'react-i18next';
import ConcreteItem from './ConcreteItem';
import TsimpleIcon from '../../../../assets/icons/Tsimple.svg';
import TsquareIcon from '../../../../assets/icons/Tsquare.svg';

const TubeSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');

    const tubeItems = [
        { id: 'tube1', title: t('concrete.tube.simpleTube'), icon: TsimpleIcon },
        { id: 'tube2', title: t('concrete.tube.squareTube'), icon: TsquareIcon },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {tubeItems.map((item) => (
                <div key={item.id} className="flex-1">
                    <ConcreteItem
                        title={item.title}
                        icon={item.icon}
                        onClick={() => onItemClick(item.title)}
                    />
                </div>
            ))}
        </div>
    );
};

export default TubeSection;

