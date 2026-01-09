import React from 'react';
import { useTranslation } from 'react-i18next';
import ConcreteItem from './ConcreteItem';
import CsquareIcon from '../../../../assets/icons/Csquare.svg';
import CrectangleIcon from '../../../../assets/icons/Crectangle.svg';
import CroundIcon from '../../../../assets/icons/Cround.svg';

const ColumnSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');

    const columnItems = [
        { id: 'column1', title: t('concrete.column.squareColumn'), icon: CsquareIcon },
        { id: 'column2', title: t('concrete.column.rectangularColumn'), icon: CrectangleIcon },
        { id: 'column3', title: t('concrete.column.roundColumn'), icon: CroundIcon },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {columnItems.map((item) => (
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

export default ColumnSection;

