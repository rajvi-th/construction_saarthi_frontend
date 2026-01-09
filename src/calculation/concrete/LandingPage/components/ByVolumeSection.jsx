import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ConcreteItem from './ConcreteItem';
import CvolumeIcon from '../../../../assets/icons/Cvolume.svg';

const ByVolumeSection = ({ onItemClick }) => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const volumeItems = [
        { id: 'volume1', title: t('concrete by Volume'), icon: CvolumeIcon },
    ];

    const handleClick = (itemTitle) => {
        if (itemTitle === t('concrete by Volume')) {
            navigate('/calculation/concrete/by-volume');
        } else if (onItemClick) {
            onItemClick(itemTitle);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {volumeItems.map((item) => (
                <div key={item.id} className="flex-1">
                    <ConcreteItem
                        title={item.title}
                        icon={item.icon}
                        onClick={() => handleClick(item.title)}
                    />
                </div>
            ))}
        </div>
    );
};

export default ByVolumeSection;

