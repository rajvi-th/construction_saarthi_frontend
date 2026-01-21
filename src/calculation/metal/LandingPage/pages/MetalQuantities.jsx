import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../../components/layout/PageHeader';
import MetalAccordion from '../components/MetalAccordion';
import { useNavigate } from 'react-router-dom';

// Section Components
import MetalQuantitySection from '../components/MetalQuantitySection';
import BoltedJointsSection from '../components/BoltedJointsSection';
import WeldedJointsSection from '../components/WeldedJointsSection';

const MetalQuantities = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen max-w-7xl mx-auto">
            <div className="mb-8">
                <PageHeader
                    title={t('metal.title')}
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="space-y-4">
                <MetalAccordion title={t('metal.sections.quantity')} defaultOpen={true}>
                    <MetalQuantitySection />
                </MetalAccordion>

                <MetalAccordion title={t('metal.sections.boltedJoints')}>
                    <BoltedJointsSection />
                </MetalAccordion>

                <MetalAccordion title={t('metal.sections.weldedJoints')}>
                    <WeldedJointsSection />
                </MetalAccordion>
            </div>
        </div>
    );
};

export default MetalQuantities;
