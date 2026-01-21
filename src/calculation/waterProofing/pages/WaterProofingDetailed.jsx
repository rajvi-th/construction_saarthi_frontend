import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import InputsTable from '../components/InputsTable';
import OutputsTable from '../components/OutputsTable';

const WaterProofingDetailed = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();
    const location = useLocation();
    const { calculationData = [], outputs = [] } = location.state || {};

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('waterProofing.detailedTitle')}
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="space-y-10">
                {/* Inputs Table */}
                <InputsTable
                    data={calculationData}
                    // Using text 'Inputs' as header for the inputs section
                    title={t('waterProofing.inputs')}
                />

                {/* Outputs Table */}
                <OutputsTable
                    outputs={outputs}
                    // Using text 'Outputs' as header for the outputs section
                    title={t('waterProofing.outputs')}
                />
            </div>
        </div>
    );
};

export default WaterProofingDetailed;
