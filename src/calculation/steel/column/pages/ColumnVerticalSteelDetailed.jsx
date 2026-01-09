import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import InputsTable from '../components/InputsTable';
import OutputsTable from '../components/OutputsTable';

const ColumnVerticalSteelDetailed = () => {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();
    const location = useLocation();
    const { calculationData = [], outputs = [], history = false, date, time } = location.state || {};

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20 px-4">
            <div className="mb-8 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2"
                        >
                            <ArrowLeft className="w-6 h-6 text-primary" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-semibold text-primary">
                                {history ? t('steel.column.verticalSteel') : t('steel.column.verticalSteelDetailed')}
                            </h1>
                            {(date || time) && (
                                <p className="text-sm text-secondary mt-1">
                                    {date} {time && `| ${time}`}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                {/* Inputs Table */}
                <InputsTable
                    data={calculationData}
                    title={t('steel.weight.inputs')}
                />

                {/* Outputs Table */}
                <OutputsTable
                    outputs={outputs}
                    title={t('steel.weight.outputs')}
                />
            </div>
        </div>
    );
};

export default ColumnVerticalSteelDetailed;
