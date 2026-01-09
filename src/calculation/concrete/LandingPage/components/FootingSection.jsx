import React from 'react';
import { useTranslation } from 'react-i18next';
import ConcreteItem from './ConcreteItem';
import FoottingboxIcon from '../../../../assets/icons/Foottingbox.svg';
import FootingtrapezoidaIcon from '../../../../assets/icons/Footingtrapezoida.svg';

const FootingSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');

    const footingItems = [
        { id: 'footing1', title: t('concrete.footing.boxFooting'), icon: FoottingboxIcon },
        { id: 'footing2', title: t('concrete.footing.trapezoidalFooting'), icon: FootingtrapezoidaIcon },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {footingItems.map((item) => (
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

export default FootingSection;

