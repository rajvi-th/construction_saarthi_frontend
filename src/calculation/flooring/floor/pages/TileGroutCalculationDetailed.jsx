import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../../../components/layout/PageHeader';
import InputsTable from '../components/InputsTable';
import OutputsTable from '../components/OutputsTable';

const TileGroutCalculationDetailed = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get data from location state
    const { calculationData = [], outputs = [] } = location.state || {};

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title="Tile Grout Detailed Report"
                    showBackButton
                    onBack={() => navigate(-1)}
                />
            </div>

            <div className="space-y-10">
                {/* Inputs Table */}
                <InputsTable
                    data={calculationData}
                    title="Inputs"
                />

                {/* Outputs Table */}
                <OutputsTable
                    outputs={outputs}
                    title="Outputs"
                />
            </div>
        </div>
    );
};

export default TileGroutCalculationDetailed;
