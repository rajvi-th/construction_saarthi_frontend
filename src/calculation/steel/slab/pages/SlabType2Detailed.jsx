import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import InputsTable from '../components/InputsTable';
import OutputCards from '../components/OutputCards';

const SlabType2Detailed = () => {
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
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 group pt-6 px-4 sm:px-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1 cursor-pointer"
                    >
                        <ArrowLeft className="w-6 h-6 text-primary" />
                    </button>
                    <h1 className="text-xl font-bold text-primary">
                        {history ? t('steel.slab.type2') : t('steel.slab.type2Detailed')}
                    </h1>
                </div>
                {date && time && (
                    <span className="text-secondary text-sm font-medium">
                        {date} {time}
                    </span>
                )}
            </div>

            {/* Inputs Section */}
            <div className="mt-8 px-4 sm:px-0">
                <InputsTable
                    title={t('steel.weight.inputs')}
                    data={calculationData}
                />
            </div>

            {/* Outputs Section */}
            <OutputCards
                title={t('steel.weight.outputs')}
                outputs={outputs}
            />
        </div>
    );
};

export default SlabType2Detailed;
