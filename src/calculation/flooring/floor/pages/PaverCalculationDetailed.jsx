import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../../components/layout/PageHeader';
import InputsTable from '../components/InputsTable';
import OutputsTable from '../components/OutputsTable';

const PaverCalculationDetailed = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const location = useLocation();

    // Get data from location state
    const { calculationData = [], outputs = [] } = location.state || {};

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('roofArea.paver.detailedTitle')}
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="space-y-10">
                {/* Inputs Table */}
                <InputsTable
                    data={calculationData}
                    title={t('roofArea.common.inputs')}
                />

                {/* Outputs Table */}
                <OutputsTable
                    outputs={outputs}
                    title={t('roofArea.common.outputs')}
                />
            </div>
        </div>
    );
};

export default PaverCalculationDetailed;
