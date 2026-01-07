import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import InputsTable from '../components/InputsTable';
import OutputCard from '../components/OutputCard';

const FootingType1Detailed = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');

    // Get data from navigation state
    const data = location.state || {};
    const {
        calculationData = [],
        outputs = [],
        date,
        time,
        history = false
    } = data;

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 group pt-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1 cursor-pointer"
                    >
                        <ArrowLeft className="w-6 h-6 text-primary" />
                    </button>
                    <h1 className="text-xl font-bold text-primary">
                        {history ? t('steel.footing.type1') : t('steel.footing.type1Detailed')}
                    </h1>
                </div>
                {date && time && (
                    <span className="text-secondary text-sm font-medium">
                        {date} {time}
                    </span>
                )}
            </div>

            {/* Inputs Section */}
            <div className="mt-8">
                <InputsTable
                    title={t('steel.weight.inputs')}
                    data={calculationData}
                />
            </div>

            {/* Outputs Section */}
            <div className="mt-10 space-y-6">
                <h2 className="text-lg font-medium text-primary ml-1 mb-4">{t('steel.weight.outputs')}</h2>
                {outputs.map((output, index) => (
                    <OutputCard
                        key={index}
                        title={output.title}
                        formula={output.formula}
                        value={output.value}
                    />
                ))}
            </div>
        </div>
    );
};

export default FootingType1Detailed;
