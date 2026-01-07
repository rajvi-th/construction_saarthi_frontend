import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../../components/layout/PageHeader';
import SteelAccordion from '../components/SteelAccordion';
import { useNavigate } from 'react-router-dom';

// Section Components
import WeightSection from '../components/WeightSection';
import FootingSection from '../components/FootingSection';
import ColumnSection from '../components/ColumnSection';
import BeamSection from '../components/BeamSection';
import SlabSection from '../components/SlabSection';
import CuttingLengthSection from '../components/CuttingLengthSection';

const SteelQuantities = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    const handleItemClick = (itemTitle) => {
        if (itemTitle === t('steel.weight.reinforcement')) {
            navigate('/calculation/steel/weight/reinforcement');
        } else if (itemTitle === t('steel.footing.type1')) {
            navigate('/calculation/steel/footing/type1');
        } else if (itemTitle === t('steel.footing.type2')) {
            navigate('/calculation/steel/footing/type2');
        } else if (itemTitle === t('steel.footing.type3')) {
            navigate('/calculation/coming-soon');
        }
    };

    return (
        <div className="min-h-screen max-w-7xl mx-auto">
            <div className="mb-8">
                <PageHeader
                    title={t('quickActions.items.steelQuantities')}
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="">
                <SteelAccordion title={t('steel.sections.weight')} defaultOpen={true}>
                    <WeightSection onItemClick={handleItemClick} />
                </SteelAccordion>

                <SteelAccordion title={t('steel.sections.footing')}>
                    <FootingSection onItemClick={handleItemClick} />
                </SteelAccordion>

                <SteelAccordion title={t('steel.sections.column')}>
                    <ColumnSection onItemClick={handleItemClick} />
                </SteelAccordion>

                <SteelAccordion title={t('steel.sections.beam')}>
                    <BeamSection onItemClick={handleItemClick} />
                </SteelAccordion>

                <SteelAccordion title={t('steel.sections.slab')}>
                    <SlabSection onItemClick={handleItemClick} />
                </SteelAccordion>

                <SteelAccordion title={t('steel.sections.cuttingLength')}>
                    <CuttingLengthSection onItemClick={handleItemClick} />
                </SteelAccordion>
            </div>
        </div>
    );
};

export default SteelQuantities;
