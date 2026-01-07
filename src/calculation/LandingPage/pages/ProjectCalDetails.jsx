import React from 'react';
import { useTranslation } from 'react-i18next';
import { History, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';

import calculatorIcon from '../../../assets/icons/CalculatorMinimalistic.svg';
import QuickActions from '../components/QuickActions';

/* ---------------- MOCK DATA ---------------- */

const MOCK_PROJECT = {
    id: '1',
    name: 'Demo Construction Project',
};

const getMockCalculations = (t) => [
    {
        id: 1,
        label: t('projectDetails.totalCalculations'),
        value: 50,
    },
    {
        id: 2,
        label: t('projectDetails.usedCalculations'),
        value: 50,
    },
];

export default function ProjectCalDetails() {
    const { t } = useTranslation('calculation');
    const navigate = useNavigate();
    const isLoading = false;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto px-0">

                <div className="mb-6">
                    <PageHeader
                        title={MOCK_PROJECT.name}
                        showBackButton
                        onBack={() => window.history.back()}
                    >
                        <div
                            className=""
                        >
                            <button
                                className="flex items-center gap-2 text-accent font-medium cursor-pointer"
                                onClick={() => navigate('/calculation/history')}
                            >
                                <History className="w-5 h-5 text-accent" />
                                <span>{t('projectDetails.history')}</span>
                            </button>
                        </div>
                    </PageHeader>
                </div>




                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

                    {/* Calculation Cards */}
                    {getMockCalculations(t).map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-4 rounded-2xl shadow-sm relative overflow-hidden flex items-center gap-4"
                        >
                            {/* Ribbon */}
                            <div className="absolute -right-6 top-1 rotate-45 bg-[#D34526] h-2 w-24" />
                            <div className="absolute -right-6 top-6 rotate-45 bg-[#D34526] h-2 w-24" />

                            {/* Icon */}
                            <div className="w-12 h-12 bg-[#FDF6F3] border border-[#E7D7C1] rounded-xl flex items-center justify-center flex-shrink-0">
                                <img
                                    src={calculatorIcon}
                                    alt="Calculator"
                                    className="w-7 h-7"
                                />
                            </div>

                            {/* Text */}
                            <div>
                                <h3 className="text-2xl font-bold text-primary">
                                    {item.value}
                                </h3>
                                <p className="text-sm text-secondary">
                                    {item.label}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Buy Calculations Card (3rd position) */}
                    <button
                        onClick={() => console.log('Buy Calculations')}
                        className="bg-[#FDF6F3] hover:bg-[#faefe9] active:bg-[#f8e8e0] transition-colors rounded-2xl p-4 flex items-center gap-4 text-left group cursor-pointer border border-[#E7D7C1]"
                    >
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                            <Plus className="w-6 h-6 text-white" />
                        </div>

                        <div>
                            <p className="text-lg font-bold text-accent">
                                {t('projectDetails.buyCalculations')}
                            </p>
                        </div>
                    </button>
                </div>

                {/* Quick Actions Section */}
                <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-1 mb-8">
                    <QuickActions />
                </div>
            </div>
        </div>
    );
}
