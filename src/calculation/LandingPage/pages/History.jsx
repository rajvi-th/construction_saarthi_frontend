import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Download } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import Button from '../../../components/ui/Button';
import CalculationTable from '../components/CalculationTable';

const History = () => {
    const { t } = useTranslation('calculation');
    const [title, setTitle] = useState('');
    const [area, setArea] = useState('40,000');
    const [cost, setCost] = useState('25,00,000');
    const [showResults, setShowResults] = useState(true);

    const MATERIAL_DATA = [
        { material: t('history.materials.cement'), quantity: '800.000', unit: t('history.units.bags') },
        { material: t('history.materials.sand'), quantity: '1632.000', unit: t('history.units.ton') },
        { material: t('history.materials.aggregate'), quantity: '1216.000', unit: t('history.units.ton') },
        { material: t('history.materials.steel'), quantity: '7500.000', unit: t('history.units.kg') },
        { material: t('history.materials.paint'), quantity: '360.000', unit: t('history.units.liters') },
        { material: t('history.materials.bricks'), quantity: '17000.000', unit: t('history.units.nos') },
        { material: t('history.materials.flooring'), quantity: '2600.000', unit: t('history.units.sqft') },
        { material: t('history.materials.windows'), quantity: '240.000', unit: t('history.units.sqft') },
        { material: t('history.materials.doors'), quantity: '260.000', unit: t('history.units.sqft') },
    ];

    const WORK_COST_DATA = [
        { work: t('history.works.design'), quantity: '100000000.00', unit: '₹' },
        { work: t('history.works.excavation'), quantity: '6000000.00', unit: '₹' },
        { work: t('history.works.foundation'), quantity: '2400000000.00', unit: '₹' },
        { work: t('history.works.rcc'), quantity: '4600000000.00', unit: '₹' },
        { work: t('history.works.brickwork'), quantity: '18000000.00', unit: '₹' },
        { work: t('history.works.plaster'), quantity: '120000000.00', unit: '₹' },
    ];

    const handleReset = () => {
        setTitle('');
        setArea('');
        setCost('');
        setShowResults(false);
    };

    const handleCalculate = () => {
        console.log('Calculating...', { title, area, cost });
        setShowResults(true);
    };

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-6 ">
                <PageHeader
                    title={t('quickActions.items.constructionCost')}
                    showBackButton
                    onBack={() => window.history.back()}
                >
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => console.log('Share')}
                            className="bg-white rounded-xl text-secondary !px-2 py-2"
                            leftIcon={<Share2 className="w-4 h-4 text-secondary" />}
                        >
                            <span className="text-sm font-medium">{t('history.sharePdf')}</span>
                        </Button>
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
            <div className=" bg-[#F9F4EE] rounded-2xl px-5 py-5.5 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Calculation Title */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-secondary ml-1">
                            {t('history.calcTitle')}
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full h-[68px] bg-white rounded-2xl px-6 py-4 text-lg text-primary border border-[#060C121A] focus:outline-none focus:border-[#060C121A]"
                                placeholder={t('history.enterValue')}
                            />
                        </div>
                    </div>

                    {/* Construction Area */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-secondary ml-1">
                            {t('history.constructionArea')}
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                className="w-full h-[68px] bg-white rounded-2xl px-6 py-4 text-lg text-primary border border-[#060C121A] focus:outline-none focus:border-[#060C121A]"
                                placeholder="0"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-accent">
                                {t('history.units.sqft')}
                            </span>
                        </div>
                    </div>

                    {/* Construction Cost */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-secondary ml-1">
                            {t('history.constructionCost')}
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                className="w-full h-[68px] bg-white rounded-2xl px-6 py-4 text-lg text-primary border border-[#060C121A] focus:outline-none focus:border-[#060C121A]"
                                placeholder="0"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-accent">
                                ₹
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        className="bg-white border-[#E7D7C1] rounded-xl text-lg font-medium !px- transition-all"
                    >
                        {t('history.reset')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCalculate}
                        className="rounded-xl font-medium shadow-lg"
                    >
                        {t('history.calculate')}
                    </Button>
                </div>
            </div>

            {/* Tables Section */}
            {showResults && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CalculationTable
                        title={t('history.materialQuantity')}
                        headers={[t('history.headers.material'), t('history.headers.quantity'), t('history.headers.unit')]}
                        data={MATERIAL_DATA}
                    />

                    <CalculationTable
                        title={t('history.workCost')}
                        headers={[t('history.headers.material'), t('history.headers.quantity'), t('history.headers.unit')]}
                        data={WORK_COST_DATA}
                    />
                </div>
            )}
        </div>
    );
};

export default History;
