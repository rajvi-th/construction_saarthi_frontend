import React from 'react';
import { useTranslation } from 'react-i18next';
import ReinforcementItem from './ReinforcementItem';

// Import icons
import colType1 from '../../../../assets/icons/colsType1.svg';
import colType2 from '../../../../assets/icons/colsType2.svg';
import colType3 from '../../../../assets/icons/colsType3.svg';
import colType4 from '../../../../assets/icons/colsType4.svg';
import colType5 from '../../../../assets/icons/colsType5.svg';
import colType6 from '../../../../assets/icons/colsType6.svg';
import colType7 from '../../../../assets/icons/colsType7.svg';
import colType8 from '../../../../assets/icons/colsType8.svg';
import colType9 from '../../../../assets/icons/colsType9.svg';
import colType10 from '../../../../assets/icons/colsType10.svg';
import colType11 from '../../../../assets/icons/colsType11.svg';
import colType12 from '../../../../assets/icons/colsType12.svg';
import colVerticalSteel from '../../../../assets/icons/colsVerticalSteel.svg';
import colRing1 from '../../../../assets/icons/colRing1.svg';
import colRing2 from '../../../../assets/icons/colRing2.svg';

import { useNavigate } from 'react-router-dom';
import { ROUTES_FLAT } from '../../../../constants/routes';

const ColumnSection = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const columnItems = [
        { id: 'col1', title: t('steel.column.type1'), icon: colType1, path: ROUTES_FLAT.CALCULATION_COLUMN_TYPE1 },
        { id: 'col2', title: t('steel.column.type2'), icon: colType2, path: ROUTES_FLAT.CALCULATION_COLUMN_TYPE2 },
        { id: 'col3', title: t('steel.column.type3'), icon: colType3, path: ROUTES_FLAT.CALCULATION_COLUMN_TYPE3 },
        { id: 'col4', title: t('steel.column.type4'), icon: colType4, path: ROUTES_FLAT.CALCULATION_COLUMN_TYPE4 },
        { id: 'col5', title: t('steel.column.type5'), icon: colType5, path: ROUTES_FLAT.CALCULATION_COLUMN_TYPE5 },
        { id: 'col6', title: t('steel.column.type6'), icon: colType6, path: ROUTES_FLAT.CALCULATION_COLUMN_TYPE6 },
        { id: 'col7', title: t('steel.column.type7'), icon: colType7, path: ROUTES_FLAT.CALCULATION_COLUMN_TYPE7 },
        { id: 'col8', title: t('steel.column.type8'), icon: colType8, path: ROUTES_FLAT.CALCULATION_COLUMN_TYPE8 },
        { id: 'col9', title: t('steel.column.type9'), icon: colType9, path: ROUTES_FLAT.CALCULATION_COLUMN_TYPE9 },
        { id: 'col10', title: t('steel.column.type10'), icon: colType10, path: ROUTES_FLAT.CALCULATION_COLUMN_TYPE10 },
        { id: 'col11', title: t('steel.column.type11'), icon: colType11, path: ROUTES_FLAT.CALCULATION_COLUMN_TYPE11 },
        { id: 'col12', title: t('steel.column.type12'), icon: colType12, path: ROUTES_FLAT.CALCULATION_COLUMN_TYPE12 },
        { id: 'colVertical', title: t('steel.column.vertical'), icon: colVerticalSteel, path: ROUTES_FLAT.CALCULATION_COLUMN_VERTICAL_STEEL },
        { id: 'colRing1', title: t('steel.column.ring1'), icon: colRing1, path: ROUTES_FLAT.CALCULATION_COLUMN_RING_TYPE1 },
        { id: 'colRing2', title: t('steel.column.ring2'), icon: colRing2, path: ROUTES_FLAT.CALCULATION_COLUMN_RING_TYPE2 },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {columnItems.map((item) => (
                <div key={item.id} className="flex-1">
                    <ReinforcementItem
                        title={item.title}
                        icon={item.icon}
                        onClick={() => navigate(item.path)}
                        noBackground={true}
                    />
                </div>
            ))}
        </div>
    );
};

export default ColumnSection;
