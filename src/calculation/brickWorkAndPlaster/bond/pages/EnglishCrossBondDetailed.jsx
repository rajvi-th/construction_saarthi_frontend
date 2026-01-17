import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../../components/layout/PageHeader';
import InputsTable from '../components/InputsTable';
import OutputsTable from '../components/OutputsTable';

const EnglishCrossBondDetailed = () => {
    const { t } = useTranslation('calculation');
    const location = useLocation();
    const navigate = useNavigate();
    const { calculationData, outputs } = location.state || {};

    useEffect(() => {
        if (!calculationData || !outputs) {
            navigate(-1);
        }
    }, [calculationData, outputs, navigate]);

    if (!calculationData || !outputs) return null;

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <PageHeader
                title={t('brickWorkAndPlaster.bonds.dutchDetailedTitle')}
                showBackButton
                onBack={() => navigate(-1)}
            />

            <InputsTable data={calculationData} title={t('steel.weight.inputs')} />

            <OutputsTable
                title={t('steel.weight.outputs')}
                outputs={outputs}
            />
        </div>
    );
};

export default EnglishCrossBondDetailed;

