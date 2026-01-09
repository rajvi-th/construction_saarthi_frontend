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
                    <WeightSection />
                </SteelAccordion>

                <SteelAccordion title={t('steel.sections.footing')}>
                    <FootingSection />
                </SteelAccordion>

                <SteelAccordion title={t('steel.sections.column')}>
                    <ColumnSection />
                </SteelAccordion>

                <SteelAccordion title={t('steel.sections.beam')}>
                    <BeamSection />
                </SteelAccordion>

                <SteelAccordion title={t('steel.sections.slab')}>
                    <SlabSection />
                </SteelAccordion>

                <SteelAccordion title={t('steel.sections.cuttingLength')}>
                    <CuttingLengthSection />
                </SteelAccordion>
            </div>
        </div>
    );
};

export default SteelQuantities;
