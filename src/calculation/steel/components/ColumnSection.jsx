import React from 'react';
import { useTranslation } from 'react-i18next';
import ReinforcementItem from './ReinforcementItem';

// Import icons
import colType1 from '../../../assets/icons/colType1.svg';
import colType2 from '../../../assets/icons/colType2.svg';
import colType3 from '../../../assets/icons/colType3.svg';
import colType4 from '../../../assets/icons/colType4.svg';
import colType5 from '../../../assets/icons/colType5.svg';
import colType6 from '../../../assets/icons/colType6.svg';
import colType7 from '../../../assets/icons/colType7.svg';
import colType8 from '../../../assets/icons/colType8.svg';
import colType9 from '../../../assets/icons/colType9.svg';
import colType10 from '../../../assets/icons/colType10.svg';
import colType11 from '../../../assets/icons/colType11.svg';
import colType12 from '../../../assets/icons/colType12.svg';
import colVerticalSteel from '../../../assets/icons/colVerticalSteel.svg';
import colRing1 from '../../../assets/icons/colRing1.svg';
import colRing2 from '../../../assets/icons/colRing2.svg';

const ColumnSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');
    const columnItems = [
        { id: 'col1', title: t('steel.column.type1'), icon: colType1 },
        { id: 'col2', title: t('steel.column.type2'), icon: colType2 },
        { id: 'col3', title: t('steel.column.type3'), icon: colType3 },
        { id: 'col4', title: t('steel.column.type4'), icon: colType4 },
        { id: 'col5', title: t('steel.column.type5'), icon: colType5 },
        { id: 'col6', title: t('steel.column.type6'), icon: colType6 },
        { id: 'col7', title: t('steel.column.type7'), icon: colType7 },
        { id: 'col8', title: t('steel.column.type8'), icon: colType8 },
        { id: 'col9', title: t('steel.column.type9'), icon: colType9 },
        { id: 'col10', title: t('steel.column.type10'), icon: colType10 },
        { id: 'col11', title: t('steel.column.type11'), icon: colType11 },
        { id: 'col12', title: t('steel.column.type12'), icon: colType12 },
        { id: 'colVertical', title: t('steel.column.vertical'), icon: colVerticalSteel },
        { id: 'colRing1', title: t('steel.column.ring1'), icon: colRing1 },
        { id: 'colRing2', title: t('steel.column.ring2'), icon: colRing2 },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
            {columnItems.map((item) => (
                <div key={item.id} className="flex-1">
                    <ReinforcementItem
                        title={item.title}
                        icon={item.icon}
                        onClick={() => onItemClick(item.title)}
                        noBackground={true}
                    />
                </div>
            ))}
        </div>
    );
};

export default ColumnSection;
