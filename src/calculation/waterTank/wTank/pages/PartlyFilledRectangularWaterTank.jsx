import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import { ROUTES_FLAT } from '../../../../constants/routes';
import InputField from '../../../common/InputField';
import DownloadPDFModal from '../../../common/DownloadPDFModal';
import partlyFilledRectangularTankIcon from '../../../../assets/icons/partlyFilledRectangularTanks.svg';

const PartlyFilledRectangularWaterTank = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Inputs
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [waterLevel, setWaterLevel] = useState('');

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Calculation Logic
    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    const H = parseFloat(height) || 0;
    const Level = parseFloat(waterLevel) || 0;

    // Formulas
    // Total Capacity = L * W * H * 1000
    // Water Quantity = L * W * Level * 1000
    // Filled % = (Water Quantity / Total Capacity) * 100

    const totalCapacity = L * W * H * 1000;
    const waterQuantity = L * W * Level * 1000;
    const filledPercentage = totalCapacity !== 0 ? (waterQuantity / totalCapacity) * 100 : 0;

    const handleReset = () => {
        setLength('');
        setWidth('');
        setHeight('');
        setWaterLevel('');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };

    const handleDownload = async (pdfTitle) => {
        try {
            setIsDownloading(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
            setIsDownloadModalOpen(false);
        }
    };

    const calculationData = [
        { labelKey: 'waterTank.partlyFilledRectangular.length', symbol: 'L', value: `${L} m` },
        { labelKey: 'waterTank.partlyFilledRectangular.width', symbol: 'W', value: `${W} m` },
        { labelKey: 'waterTank.partlyFilledRectangular.height', symbol: 'H', value: `${H} m` },
        { labelKey: 'waterTank.partlyFilledRectangular.waterLevel', symbol: 'L', value: `${Level} m` },
    ];

    const detailedOutputs = [
        {
            titleKey: 'waterTank.partlyFilledRectangular.results.totalCapacity',
            labelKey: 'waterTank.partlyFilledRectangular.results.totalCapacity',
            labelSuffix: ' =',
            formula: 'LXWXHX1000',
            value: `${totalCapacity.toFixed(3)} Litre`,
        },
        {
            titleKey: 'waterTank.partlyFilledRectangular.results.waterQuantity',
            labelKey: 'waterTank.partlyFilledRectangular.results.waterQuantity',
            labelSuffix: ' =',
            formula: 'LXWXLX1000',
            value: `${waterQuantity.toFixed(3)} Litre`,
        },
        {
            titleKey: 'waterTank.partlyFilledRectangular.results.filledPercentage',
            labelKey: 'waterTank.partlyFilledRectangular.results.filledPercentage',
            labelSuffix: ' =',
            formula: '((LXWXLX1000)/(LXWXHX1000))X100',
            value: `${filledPercentage.toFixed(3)}`,
            unit: '%'
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('waterTank.partlyFilledRectangular.title')}
                    showBackButton
                    onBack={() => navigate(-1)}
                >
                    <div className="flex gap-4 items-center">
                        <Button
                            variant="secondary"
                            onClick={() => setIsDownloadModalOpen(true)}
                            className="bg-white border-[#E0E0E0] rounded-xl text-secondary !px-2 sm:!px-4 py-2"
                            leftIcon={<Download className="w-4 h-4 text-secondary" />}
                        >
                            <span className="text-sm font-medium">{t('history.downloadReport')}</span>
                        </Button>
                    </div>
                </PageHeader>
            </div>

            {/* Content Card */}
            <div className="bg-[#F9F4EE] rounded-3xl p-4 sm:p-6">
                <div className="flex items-center gap-4 sm:gap-10 pb-6 border-b border-[#060C120A]">
                    {/* Icon Box */}
                    <div className="flex items-center justify-center">
                        <img src={partlyFilledRectangularTankIcon} alt="Partly Filled Rectangular Water Tank" className="object-contain" />
                    </div>

                    {/* Radio Group */}
                    <div className="flex flex-col gap-4">
                        <Radio
                            label={t('roofArea.common.metric')}
                            name="unitType"
                            value="metric"
                            checked={unitType === 'metric'}
                            onChange={() => setUnitType('metric')}
                            className="text-base sm:text-lg"
                        />
                        <Radio
                            label={t('roofArea.common.imperial')}
                            name="unitType"
                            value="imperial"
                            checked={unitType === 'imperial'}
                            onChange={() => setUnitType('imperial')}
                            className="text-base sm:text-lg"
                        />
                    </div>
                </div>

                {/* Form Sections */}
                <div className="space-y-4 pt-4">
                    <div className="space-y-4">
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <InputField
                                unit="m"
                                value={length}
                                onChange={(e) => setLength(e.target.value)}
                                placeholder={t('waterTank.partlyFilledRectangular.length')}
                            />
                            <InputField
                                unit="m"
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                placeholder={t('waterTank.partlyFilledRectangular.width')}
                            />
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <InputField
                                unit="m"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder={t('waterTank.partlyFilledRectangular.height')}
                            />
                            <InputField
                                unit="m"
                                value={waterLevel}
                                onChange={(e) => setWaterLevel(e.target.value)}
                                placeholder={t('waterTank.partlyFilledRectangular.waterLevel')}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 sm:gap-6 mt-8">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        className="h-[50px] flex-1 sm:flex-none px-6 sm:px-12 bg-white border-[#E7D7C1] !rounded-2xl text-primary font-medium text-sm sm:text-base"
                    >
                        {t('roofArea.common.reset')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCalculate}
                        className="h-[50px] flex-1 sm:flex-none px-6 sm:px-12 !bg-[#B02E0C] text-white !rounded-2xl font-medium text-sm sm:text-base"
                    >
                        {t('roofArea.common.calculate')}
                    </Button>
                </div>
            </div>

            {/* Result Section */}
            {showResult && (
                <div className="mt-10 animate-fade-in pb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-primary">{t('roofArea.common.result')}</h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[#060C121A] mb-8">
                        <button
                            onClick={() => setUnitType('metric')}
                            className={`px-12 py-3 border-b-2 transition-all cursor-pointer font-medium ${unitType === 'metric' ? 'border-[#B02E0C] text-[#B02E0C]' : 'border-transparent text-secondary'}`}
                        >
                            {t('roofArea.common.metric')}
                        </button>
                        <button
                            onClick={() => setUnitType('imperial')}
                            className={`px-12 py-3 border-b-2 transition-all cursor-pointer font-medium ${unitType === 'imperial' ? 'border-[#B02E0C] text-[#B02E0C]' : 'border-transparent text-secondary'}`}
                        >
                            {t('roofArea.common.imperial')}
                        </button>
                    </div>

                    {/* Result Table */}
                    <div className="bg-white rounded-xl border border-[#060C121A] overflow-hidden mb-8 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[320px]">
                            <thead>
                                <tr className="bg-[#F7F7F7] border-b border-[#060C120A]">
                                    <th className="px-6 py-4 text-sm font-medium text-primary border-r border-[#060C120A]">{t('history.headers.material')}</th>
                                    <th className="px-6 py-4 text-sm font-medium text-primary border-r border-[#060C120A]">{t('history.headers.quantity')}</th>
                                    <th className="px-6 py-4 text-sm font-medium text-primary">{t('history.headers.unit')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#060C120A]">
                                <tr className="hover:bg-[#F9F9F9] transition-colors">
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('waterTank.partlyFilledRectangular.results.totalCapacity')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{totalCapacity.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary">Litre</td>
                                </tr>
                                <tr className="hover:bg-[#F9F9F9] transition-colors">
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('waterTank.partlyFilledRectangular.results.waterQuantity')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{waterQuantity.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary">Litre</td>
                                </tr>
                                <tr className="hover:bg-[#F9F9F9] transition-colors">
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('waterTank.partlyFilledRectangular.results.filledPercentage')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{filledPercentage.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary">%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex justify-end">
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_WATER_TANK_PARTLY_FILLED_RECTANGULAR + '/detailed', {
                                state: {
                                    calculationData,
                                    outputs: detailedOutputs
                                }
                            })}
                            className="!rounded-2xl text-lg font-medium hover:bg-[#B02E0C] transition-all h-[50px]"
                        >
                            {t('roofArea.common.viewDetailed')}
                        </Button>
                    </div>
                </div>
            )}

            <DownloadPDFModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                onDownload={handleDownload}
                defaultTitle={t('waterTank.partlyFilledRectangular.detailedTitle')}
                isLoading={isDownloading}
            />
        </div>
    );
};

export default PartlyFilledRectangularWaterTank;
