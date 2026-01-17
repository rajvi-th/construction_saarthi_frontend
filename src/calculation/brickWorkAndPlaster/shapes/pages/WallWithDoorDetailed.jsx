import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../../components/layout/PageHeader';
import InputsTable from '../components/InputsTable';
import OutputsTable from '../components/OutputsTable';

const WallWithDoorDetailed = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const { calculationData, outputs } = location.state || { calculationData: [], outputs: [] };

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20 px-4">
            <div className="mb-6">
                <PageHeader
                    title={t('brickWorkAndPlaster.shapes.wallWithDoorDetailedTitle')}
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="space-y-8">
                <InputsTable
                    title={t('steel.weight.inputs')}
                    data={calculationData}
                />

                <OutputsTable
                    title={t('steel.weight.outputs')}
                    outputs={outputs}
                />
            </div>
        </div>
    );
};

export default WallWithDoorDetailed;
