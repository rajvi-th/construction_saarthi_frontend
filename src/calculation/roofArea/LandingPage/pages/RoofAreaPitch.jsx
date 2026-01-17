import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/layout/PageHeader';
import RoofItem from '../components/RoofItem';

import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import flatRoof from '../../../../assets/icons/flatRoof.svg';
import shedRoof from '../../../../assets/icons/shedRoof.svg';
import gableRoof from '../../../../assets/icons/gableRoof.svg';
import boxGableRoof from '../../../../assets/icons/boxGableRoof.svg';
import mShapedRoof from '../../../../assets/icons/mShapedRoof.svg';
import butterflyRoof from '../../../../assets/icons/butterflyRoof.svg';
import saltboxRoof from '../../../../assets/icons/saltboxRoof.svg';
import pyramidHipRoof from '../../../../assets/icons/pyramidHipRoof.svg';
import hexagonalRoof from '../../../../assets/icons/hexagonalRoof.svg';

const RoofAreaPitch = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const items = [
        { id: 'flat', title: 'Flat Roof', icon: flatRoof, path: ROUTES_FLAT.CALCULATION_ROOF_AREA_FLAT_ROOF },
        { id: 'shed', title: 'Shed Roof', icon: shedRoof, path: ROUTES_FLAT.CALCULATION_ROOF_AREA_SHED_ROOF },
        { id: 'gable', title: 'Gable Roof', icon: gableRoof, path: ROUTES_FLAT.CALCULATION_ROOF_AREA_GABLE_ROOF },
        { id: 'boxGable', title: 'Box Gable Roof', icon: boxGableRoof, path: ROUTES_FLAT.CALCULATION_ROOF_AREA_BOX_GABLE_ROOF },
        { id: 'mShaped', title: 'M shaped Roof', icon: mShapedRoof, path: ROUTES_FLAT.CALCULATION_ROOF_AREA_M_SHAPED_ROOF },
        { id: 'butterfly', title: 'Butterfly Roof', icon: butterflyRoof, path: ROUTES_FLAT.CALCULATION_ROOF_AREA_BUTTERFLY_ROOF },
        { id: 'saltbox', title: 'Saltbox Roof', icon: saltboxRoof, path: ROUTES_FLAT.CALCULATION_ROOF_AREA_SALTBOX_ROOF },
        { id: 'pyramidHip', title: 'Pyramid Hip Roof', icon: pyramidHipRoof, path: ROUTES_FLAT.CALCULATION_ROOF_AREA_PYRAMID_HIP_ROOF },
        { id: 'hexagonal', title: 'Hexagonal Roof', icon: hexagonalRoof, path: ROUTES_FLAT.CALCULATION_ROOF_AREA_HEXAGONAL_ROOF },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title="Roof Area & Pitch Calculator"
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.map((item) => (
                    <RoofItem
                        key={item.id}
                        title={item.title}
                        icon={item.icon}
                        onClick={() => navigate(item.path)}
                    />
                ))}
            </div>
        </div>
    );
};

export default RoofAreaPitch;
