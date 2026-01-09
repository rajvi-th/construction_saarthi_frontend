import React from 'react';
import { useTranslation } from 'react-i18next';
import ConcreteItem from './ConcreteItem';
import Wallshape1Icon from '../../../../assets/icons/Wallshape1.svg';
import Wallshape2Icon from '../../../../assets/icons/Wallshape2.svg';

const WallSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');

    const wallItems = [
        { id: 'wall1', title: t('concrete.wall.wallShape1'), icon: Wallshape1Icon },
        { id: 'wall2', title: t('concrete.wall.wallShape2'), icon: Wallshape2Icon },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {wallItems.map((item) => (
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

export default WallSection;

