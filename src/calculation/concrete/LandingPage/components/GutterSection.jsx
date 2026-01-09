import React from 'react';
import { useTranslation } from 'react-i18next';
import ConcreteItem from './ConcreteItem';
import Gshape1Icon from '../../../../assets/icons/Gshape1.svg';
import Gshape2Icon from '../../../../assets/icons/Gshape2.svg';

const GutterSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');

    const gutterItems = [
        { id: 'gutter1', title: t('concrete.gutter.gutterShape1'), icon: Gshape1Icon },
        { id: 'gutter2', title: t('concrete.gutter.gutterShape2'), icon: Gshape2Icon },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {gutterItems.map((item) => (
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

export default GutterSection;

