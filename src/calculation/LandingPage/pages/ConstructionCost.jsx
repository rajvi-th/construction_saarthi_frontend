import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Download, FileText, TrendingUp, Activity, AlertTriangle, Lightbulb, ChevronDown } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import Button from '../../../components/ui/Button';
import CalculationTable from '../components/CalculationTable';
import CalculationSummary from '../components/CalculationSummary';
import Loader from '../../../components/ui/Loader';
import { calculateProject } from '../../../features/projects/api/projectApi';
import { showError, showSuccess } from '../../../utils/toast';

import InputField from '../../common/InputField';

const ConstructionCost = () => {
    const { t } = useTranslation('calculation');
    const [title, setTitle] = useState('');
    const [area, setArea] = useState('');
    const [cost, setCost] = useState('');
    const [city, setCity] = useState('Surat');
    const [language, setLanguage] = useState('English');
    const [note, setNote] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [calculationResult, setCalculationResult] = useState(null);

    const handleReset = () => {
        setTitle('');
        setArea('');
        setCost('');
        setCity('Surat');
        setLanguage('English');
        setNote('');
        setError(null);
        setCalculationResult(null);
    };

    const handleCalculate = async () => {
        if (!area || !cost) {
            showError("Please enter area and cost");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            setCalculationResult(null);

            const payload = {
                feature_name: "construction_cost",
                constructionArea: parseFloat(area),
                constructionCost: parseFloat(cost),
                constructionCity: city,
                constructionLanguage: language,
                additional_note: note,
            };

            const response = await calculateProject(payload);

            if (response.success && response.prompts?.[0]) {
                const promptResult = response.prompts[0].result;

                // Check if the result is an error message (string starting with "Error:")
                if (typeof promptResult === 'string' && promptResult.startsWith('Error:')) {
                    setError(promptResult);
                } else if (promptResult?.calculation) {
                    setCalculationResult(promptResult);
                    showSuccess("Calculation completed successfully");
                } else {
                    setError("Failed to get calculation results. Please check your inputs and try again.");
                }
            } else {
                setError("Failed to connect to calculation service. Please try again.");
            }
        } catch (error) {
            console.error("Calculation error:", error);
            setError("A system error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to format raw error messages into user-friendly text
    const formatErrorMessage = (msg) => {
        if (typeof msg !== 'string') return "An unknown error occurred";

        if (msg.includes('Quota exceeded')) {
            const retryMatch = msg.match(/Please retry in ([\d.]+)s/);
            const seconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : null;
            return `AI Usage limit reached. ${seconds ? `Please wait about ${seconds} seconds before trying again.` : 'Please try again in a moment.'} This is usually due to high traffic on the free tier.`;
        }

        if (msg.startsWith('Error:')) {
            // Remove stack traces or technical details if they exist after the main message
            return msg.split('\n')[0].replace('Error:', '').trim();
        }

        return msg;
    };

    // Helper to format material and work labels
    const formatLabel = (key) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(' Inr', '').replace(' Nos', '').replace(' Ton', '').replace(' Bags', '').replace(' Liter', '').replace(' Kg', '').replace(' Sqft', '');
    };

    const getMaterialData = () => {
        if (!calculationResult?.calculation?.material_quantity) return [];
        return Object.entries(calculationResult.calculation.material_quantity).map(([key, value]) => ({
            material: formatLabel(key),
            quantity: value.toLocaleString(),
            unit: key.split('_').pop().charAt(0).toUpperCase() + key.split('_').pop().slice(1)
        }));
    };

    const getWorkCostData = () => {
        if (!calculationResult?.calculation?.work_cost_breakdown) return [];
        return Object.entries(calculationResult.calculation.work_cost_breakdown).map(([key, value]) => ({
            work: formatLabel(key),
            amount: `₹${value.toLocaleString()}`,
        }));
    };

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-6 ">
                <PageHeader
                    title={t('history.constructionCost')}
                    showBackButton
                    onBack={() => window.history.back()}
                >
                    <div className="flex gap-3">
                        {/* <Button
                            variant="secondary"
                            onClick={() => console.log('Share')}
                            className="bg-white rounded-xl text-secondary !px-2 py-2"
                            leftIcon={<Share2 className="w-4 h-4 text-secondary" />}
                        >
                            <span className="text-sm font-medium">{t('history.sharePdf')}</span>
                        </Button> */}
                        <Button
                            variant="secondary"
                            onClick={() => console.log('Download')}
                            className="bg-white border-[#E0E0E0] rounded-xl text-secondary !px-2 py-2"
                            leftIcon={<Download className="w-4 h-4 text-secondary" />}
                        >
                            <span className="text-sm font-medium">{t('history.downloadReport')}</span>
                        </Button>
                    </div>
                </PageHeader>
            </div>

            {/* Content Card */}
            <div className=" bg-[#F9F4EE] rounded-3xl px-6 py-8 mb-10 border border-[#060C120A]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Calculation Title */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-secondary ml-1">
                            {t('history.calcTitle')}
                        </label>
                        <InputField
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('history.enterValue')}
                        />
                    </div>

                    {/* Construction Area */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-secondary ml-1">
                            {t('history.constructionArea')}
                        </label>
                        <InputField
                            inputMode="numeric"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder="0"
                            suffix="Sq. Ft."
                        />
                    </div>

                    {/* Construction Cost */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-secondary ml-1">
                            {t('history.constructionCost')}
                        </label>
                        <InputField
                            inputMode="numeric"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            placeholder="0"
                            suffix="₹/Sq. Ft."
                        />
                    </div>

                    {/* Construction City */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-secondary ml-1">
                            {t('history.constructionCity')}
                        </label>
                        <InputField
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder={t('history.enterValue')}
                        />
                    </div>

                    {/* Construction Language */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-secondary ml-1">
                            {t('history.constructionLanguage')}
                        </label>
                        <InputField
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            placeholder={t('history.enterValue')}
                        />
                    </div>

                    {/* Additional Note */}
                    <div className="flex flex-col gap-1.5 lg:col-span-1">
                        <label className="text-sm font-semibold text-secondary ml-1">
                            {t('history.additionalNote')}
                        </label>
                        <InputField
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t('history.enterValue')}
                        />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 mt-4">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        className="bg-white border-[#E7D7C1] rounded-xl text-primary font-semibold px-8 py-3 hover:bg-white/80 transition-all"
                    >
                        {t('history.reset')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCalculate}
                        disabled={isLoading}
                        className="rounded-xl font-bold px-10 py-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {t('history.calculating')}
                            </div>
                        ) : t('history.calculate')}
                    </Button>
                </div>
            </div>

            {/* Results Section */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader size="lg" />
                    <p className="text-secondary font-medium animate-pulse">{t('history.analyzing')}</p>
                </div>
            )}

            {/* Error Message Section */}
            {!isLoading && error && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 bg-red-50 border border-red-100 rounded-3xl p-6 mb-10 flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-red-900 mb-1">{t('history.calculationAlert')}</h4>
                        <p className="text-red-800/80 text-sm leading-relaxed whitespace-pre-line">
                            {formatErrorMessage(error)}
                        </p>
                    </div>
                </div>
            )}

            {!isLoading && calculationResult && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">

                    {/* AI Insights Section */}
                    {calculationResult.ai_insights && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                            {/* Left Column: Engineer Summary, Budget Health, Risk Observations */}
                            <div className="space-y-6">
                                {/* Engineer Summary */}
                                <div className="bg-white p-6 rounded-3xl border border-[#F0F0F0] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-primary">{t('history.engineerSummary')}</h4>
                                    </div>
                                    <p className="text-secondary text-sm leading-relaxed whitespace-pre-line">
                                        {calculationResult.ai_insights.engineer_summary}
                                    </p>
                                </div>

                                {/* Budget Health */}
                                <div className="bg-white p-6 rounded-3xl border border-[#F0F0F0] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-primary">{t('history.budgetHealth')}</h4>
                                    </div>
                                    <p className="text-secondary text-sm leading-relaxed">
                                        {calculationResult.ai_insights.budget_health}
                                    </p>
                                </div>

                                {/* Risk Observations */}
                                <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-red-900">{t('history.riskObservations')}</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        {calculationResult.ai_insights.risk_observations?.map((item, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-red-800/80">
                                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Right Column: Major Cost Drivers, Practical Suggestions */}
                            <div className="space-y-6">
                                {/* Major Cost Drivers */}
                                <div className="bg-white p-6 rounded-3xl border border-[#F0F0F0] shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-primary">{t('history.majorCostDrivers')}</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        {calculationResult.ai_insights.major_cost_drivers?.map((item, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-secondary">
                                                <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Practical Suggestions */}
                                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                            <Lightbulb className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-blue-900">{t('history.practicalSuggestions')}</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        {calculationResult.ai_insights.practical_suggestions?.map((item, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-blue-800/80">
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tables Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <CalculationTable
                            title={t('history.materialQuantity')}
                            headers={[t('history.headers.material'), t('history.headers.quantity'), t('history.headers.unit')]}
                            data={getMaterialData()}
                        />

                        <CalculationTable
                            title={t('history.workCost')}
                            headers={[t('history.headers.material'), t('history.headers.amount')]}
                            data={getWorkCostData()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConstructionCost;
