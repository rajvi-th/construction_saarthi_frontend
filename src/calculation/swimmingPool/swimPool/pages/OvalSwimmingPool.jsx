import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import InputField from '../../../common/InputField';
import DownloadPDFModal from '../../../common/DownloadPDFModal';
import ovalSwimmingPoolIcon from '../../../../assets/icons/ovalSwimmingPools.svg';

const OvalSwimmingPool = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric');

    // Inputs
    const [radiusA, setRadiusA] = useState('');
    const [radiusB, setRadiusB] = useState('');
    const [depth, setDepth] = useState('');

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Calculation Logic
    const A = parseFloat(radiusA) || 0;
    const B = parseFloat(radiusB) || 0;
    const D = parseFloat(depth) || 0;
    const PI = Math.PI;

    // Volume = PI * A * B * D
    // Volume (Litre) = Volume * 1000
    // Volume (Gallon) = Volume * 264
    const volumeBase = PI * A * B * D;
    const volumeLitre = volumeBase * 1000;
    const volumeGallon = volumeBase * 264;

    const handleReset = () => {
        setRadiusA('');
        setRadiusB('');
        setDepth('');
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
        { labelKey: 'swimmingPool.oval.radiusA', symbol: 'Ra', value: `${A} ${t('concrete.byVolume.mUnit')}` },
        { labelKey: 'swimmingPool.oval.radiusB', symbol: 'Rb', value: `${B} ${t('concrete.byVolume.mUnit')}` },
        { labelKey: 'swimmingPool.oval.depth', symbol: 'd', value: `${D} ${t('concrete.byVolume.mUnit')}` },
    ];

    const detailedOutputs = [
        {
            titleKey: 'swimmingPool.oval.results.volume',
            labelKey: 'swimmingPool.oval.results.volume',
            labelSuffix: ' =',
            formula: 'π X Ra X Rb X d X 1000',
            value: `${volumeLitre.toFixed(3)} ${t('history.units.liter')}`,
        },
        {
            titleKey: 'swimmingPool.oval.results.volume',
            labelKey: 'swimmingPool.oval.results.volume',
            labelSuffix: ' =',
            formula: 'π X Ra X Rb X d X 264',
            value: `${volumeGallon.toFixed(3)} ${t('history.units.gallon')}`,
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('swimmingPool.oval.title')}
                    showBackButton
                    onBack={() => navigate(-1)}
                >
                    <div className="flex gap-4 items-center">
                        <Button
                            variant="secondary"
                            onClick={() => setIsDownloadModalOpen(true)}
                            className="bg-white border-[#E0E0E0] rounded-xl text-secondary !px-2 sm:!px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm"
                            leftIcon={<Download className="w-4 h-4 text-secondary" />}
                        >
                            <span className="text-sm font-medium">{t('history.downloadReport')}</span>
                        </Button>
                    </div>
                </PageHeader>
            </div>

            {/* Content Card */}
            <div className="bg-[#F9F4EE] rounded-2xl p-4 sm:p-6">
                <div className="flex items-center gap-4 sm:gap-10 pb-6 border-b border-[#060C120A]">
                    {/* Icon Box */}
                    <div className="flex items-center">
                        <img src={ovalSwimmingPoolIcon} alt={t('swimmingPool.oval.title')} className="w-full h-full object-contain" />
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
                <div className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField
                            unit={t('concrete.byVolume.mUnit')}
                            value={radiusA}
                            onChange={(e) => setRadiusA(e.target.value)}
                            placeholder={t('swimmingPool.oval.radiusA')}
                        />
                        <InputField
                            unit={t('concrete.byVolume.mUnit')}
                            value={radiusB}
                            onChange={(e) => setRadiusB(e.target.value)}
                            placeholder={t('swimmingPool.oval.radiusB')}
                        />
                        <InputField
                            unit={t('concrete.byVolume.mUnit')}
                            value={depth}
                            onChange={(e) => setDepth(e.target.value)}
                            placeholder={t('swimmingPool.oval.depth')}
                        />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 sm:gap-6 mt-8">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        className="h-[50px] flex-1 sm:flex-none px-6 sm:px-12 bg-white border-[#E7D7C1] !rounded-2xl text-primary font-medium text-sm sm:text-base hover:bg-gray-50 transition-colors"
                    >
                        {t('roofArea.common.reset')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCalculate}
                        className="h-[50px] flex-1 sm:flex-none px-6 sm:px-12 !bg-[#B02E0C] text-white !rounded-2xl font-medium text-sm sm:text-base hover:bg-[#96270a] transition-colors"
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
                            className={`px-12 py-3 border-b-2 transition-all cursor-pointer font-medium ${unitType === 'metric' ? 'border-[#B02E0C] text-[#B02E0C]' : 'border-transparent text-secondary hover:text-primary transition-colors'}`}
                        >
                            {t('roofArea.common.metric')}
                        </button>
                        <button
                            onClick={() => setUnitType('imperial')}
                            className={`px-12 py-3 border-b-2 transition-all cursor-pointer font-medium ${unitType === 'imperial' ? 'border-[#B02E0C] text-[#B02E0C]' : 'border-transparent text-secondary hover:text-primary transition-colors'}`}
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
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('swimmingPool.oval.results.volume')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{volumeLitre.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary">{t('history.units.liter')}</td>
                                </tr>
                                <tr className="hover:bg-[#F9F9F9] transition-colors">
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('swimmingPool.oval.results.volume')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{volumeGallon.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary">{t('history.units.gallon')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex justify-end">
                        <Button
                            variant="primary"
                            onClick={() => navigate('/calculation/swimming-pool/oval/detailed', {
                                state: {
                                    calculationData,
                                    outputs: detailedOutputs
                                }
                            })}
                            className="!rounded-2xl text-lg font-medium hover:bg-[#96270a] transition-all h-[58px] px-10 shadow-md"
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
                defaultTitle={t('swimmingPool.oval.detailedTitle')}
                isLoading={isDownloading}
            />
        </div>
    );
};

export default OvalSwimmingPool;
