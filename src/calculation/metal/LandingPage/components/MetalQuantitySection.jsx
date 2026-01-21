import React from 'react';
import { useTranslation } from 'react-i18next';
import MetalItem from './MetalItem';
import { useNavigate } from 'react-router-dom';
import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import pipeMetal from '../../../../assets/icons/pipeMetal.svg';
import roundBarMetal from '../../../../assets/icons/roundBarMetal.svg';
import squareBarMetal from '../../../../assets/icons/squareBarMetal.svg';
import squareTubingMetal from '../../../../assets/icons/squareTubingMetal.svg';
import tBarMetal from '../../../../assets/icons/tBarMetal.svg';
import beamMetal from '../../../../assets/icons/beamMetal.svg';
import channelMetal from '../../../../assets/icons/channelMetal.svg';
import angleMetal from '../../../../assets/icons/angleMetal.svg';
import flatBarMetal from '../../../../assets/icons/flatBarMetal.svg';
import sheetMetal from '../../../../assets/icons/sheetMetal.svg';
import hexagonalBarMetal from '../../../../assets/icons/hexagonalBarMetal.svg';
import triangularBarMetal from '../../../../assets/icons/triangularBarMetal.svg';
import triangularPipeMetal from '../../../../assets/icons/triangularPipeMetal.svg';

const MetalQuantitySection = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();
    const comingSoonPath = '/calculation/coming-soon';

    const metalItems = [
        { id: 'pipe', title: t('metal.quantity.pipe'), icon: pipeMetal, path: ROUTES_FLAT.CALCULATION_METAL_PIPE },
        { id: 'roundBar', title: t('metal.quantity.roundBar'), icon: roundBarMetal, path: ROUTES_FLAT.CALCULATION_METAL_ROUND_BAR },
        { id: 'squareBar', title: t('metal.quantity.squareBar'), icon: squareBarMetal, path: ROUTES_FLAT.CALCULATION_METAL_SQUARE_BAR },
        { id: 'squareTubing', title: t('metal.quantity.squareTubing'), icon: squareTubingMetal, path: ROUTES_FLAT.CALCULATION_METAL_SQUARE_TUBING },
        { id: 'tBar', title: t('metal.quantity.tBar'), icon: tBarMetal, path: ROUTES_FLAT.CALCULATION_METAL_T_BAR },
        { id: 'beam', title: t('metal.quantity.beam'), icon: beamMetal, path: ROUTES_FLAT.CALCULATION_METAL_BEAM },
        { id: 'channel', title: t('metal.quantity.channel'), icon: channelMetal, path: ROUTES_FLAT.CALCULATION_METAL_CHANNEL },
        { id: 'angle', title: t('metal.quantity.angle'), icon: angleMetal, path: ROUTES_FLAT.CALCULATION_METAL_ANGLE },
        { id: 'flatBar', title: t('metal.quantity.flatBar'), icon: flatBarMetal, path: ROUTES_FLAT.CALCULATION_METAL_FLAT_BAR },
        { id: 'sheet', title: t('metal.quantity.sheet'), icon: sheetMetal, path: ROUTES_FLAT.CALCULATION_METAL_SHEET },
        { id: 'hexagonalBar', title: t('metal.quantity.hexagonalBar'), icon: hexagonalBarMetal, path: ROUTES_FLAT.CALCULATION_METAL_HEXAGONAL_BAR },
        { id: 'triangularBar', title: t('metal.quantity.triangularBar'), icon: triangularBarMetal, path: ROUTES_FLAT.CALCULATION_METAL_TRIANGULAR_BAR },
        { id: 'triangularPipe', title: t('metal.quantity.triangularPipe'), icon: triangularPipeMetal, path: ROUTES_FLAT.CALCULATION_METAL_TRIANGULAR_PIPE },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
            {metalItems.map((item) => (
                <div key={item.id} className="flex-1">
                    <MetalItem
                        title={item.title}
                        icon={item.icon}
                        onClick={() => navigate(item.path, { state: { title: item.title, pageName: item.title } })}
                    />
                </div>
            ))}
        </div>
    );
};

export default MetalQuantitySection;
