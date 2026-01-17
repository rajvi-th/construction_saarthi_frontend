import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/layout/PageHeader';
import InputsTable from '../../shapes/components/InputsTable';
import OutputsTable from '../../shapes/components/OutputsTable';

const ByVolumeDetailed = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { calculationData, outputs } = location.state || { calculationData: [], outputs: [] };

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20 px-4">
            <div className="mb-6">
                <PageHeader
                    title="By Volume Detailed Report"
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="space-y-8">
                <InputsTable
                    title="Inputs"
                    data={calculationData}
                />

                <OutputsTable
                    title="Outputs"
                    outputs={outputs}
                />
            </div>
        </div>
    );
};

export default ByVolumeDetailed;
