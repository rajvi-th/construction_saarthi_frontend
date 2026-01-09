import React from 'react';
import { useTranslation } from 'react-i18next';
import ConcreteItem from './ConcreteItem';
import Cstone1Icon from '../../../../assets/icons/Cstone1.svg';
import Cstone2Icon from '../../../../assets/icons/Cstone2.svg';

const CurbedStoneSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');

    const curbedStoneItems = [
        { id: 'curbedStone1', title: t('concrete.curbedStone.curbStone1'), icon: Cstone1Icon },
        { id: 'curbedStone2', title: t('concrete.curbedStone.curbStone2'), icon: Cstone2Icon },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {curbedStoneItems.map((item) => (
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

export default CurbedStoneSection;

