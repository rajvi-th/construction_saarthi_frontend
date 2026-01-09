import React from 'react';
import { useTranslation } from 'react-i18next';
import ConcreteItem from './ConcreteItem';
import Staircase1Icon from '../../../../assets/icons/Staircase1.svg';
import Staircase2Icon from '../../../../assets/icons/Staircase2.svg';

const StaircaseSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');

    const staircaseItems = [
        { id: 'staircase1', title: t('concrete.staircase.straightStaircase'), icon: Staircase1Icon },
        { id: 'staircase2', title: t('concrete.staircase.dogLeggedStaircase'), icon: Staircase2Icon },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {staircaseItems.map((item) => (
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

export default StaircaseSection;

