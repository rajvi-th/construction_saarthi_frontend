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
import slopBackfilling1Icon from '../../../../assets/icons/SlopBackfilling1st.svg';

const SlopBackfilling1 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric');

    // Inputs
    const [length, setLength] = useState('');
    const [base, setBase] = useState('');
    const [height, setHeight] = useState('');
    const [tripVolume, setTripVolume] = useState('');
    const [price, setPrice] = useState('');

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Calculation Logic
    const L = parseFloat(length) || 0;
    const B = parseFloat(base) || 0;
    const H = parseFloat(height) || 0;
    const T = parseFloat(tripVolume) || 0;
    const P = parseFloat(price) || 0;

    // Formulas
    // Material Volume = 0.5 * H * B * L
    const materialVolume = 0.5 * H * B * L;
    const numberOfTrips = T !== 0 ? materialVolume / T : 0;
    const totalCost = numberOfTrips * P;

    const handleReset = () => {
        setLength('');
        setBase('');
        setHeight('');
        setTripVolume('');
        setPrice('');
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
        { labelKey: 'excavation.slopBackfilling1.length', symbol: 'L', value: `${L} m` },
        { labelKey: 'excavation.slopBackfilling1.base', symbol: 'B', value: `${B} m` },
        { labelKey: 'excavation.slopBackfilling1.height', symbol: 'H', value: `${H} m` },
        { labelKey: 'excavation.slopBackfilling1.tripVolume', symbol: 'T', value: `${T} m` },
        { labelKey: 'excavation.slopBackfilling1.price', symbol: 'P', value: `${P} ${t('roofArea.common.currency')} Per MT` },
    ];

    const detailedOutputs = [
        {
            titleKey: 'excavation.slopBackfilling1.results.materialVolume',
            labelKey: 'excavation.slopBackfilling1.results.materialVolume',
            labelSuffix: ' =',
            formula: '0.5XHX BXL',
            value: `${materialVolume.toFixed(3)} m3`,
        },
        {
            titleKey: 'excavation.slopBackfilling1.results.numberOfTrips',
            labelKey: 'excavation.slopBackfilling1.results.numberOfTrips',
            labelSuffix: ' =',
            formula: '(0.5XHX BXL)/T',
            value: `${numberOfTrips.toFixed(3)} Nos`,
        },
        {
            titleKey: 'excavation.slopBackfilling1.results.totalCost',
            labelKey: 'excavation.slopBackfilling1.results.totalCost',
            labelSuffix: ' =',
            formula: '((0.5XHX BXL)/T)XP',
            value: `${totalCost.toFixed(3)} ${t('roofArea.common.currency')}`,
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('excavation.slopBackfilling1.title')}
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
                        <img src={slopBackfilling1Icon} alt="Slop Backfilling 1" className="object-contain" />
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField
                            unit="m"
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            placeholder={t('excavation.slopBackfilling1.length')}
                        />
                        <InputField
                            unit="m"
                            value={base}
                            onChange={(e) => setBase(e.target.value)}
                            placeholder={t('excavation.slopBackfilling1.base')}
                        />
                        <InputField
                            unit="m"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder={t('excavation.slopBackfilling1.height')}
                        />
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <InputField
                            unit="m"
                            value={tripVolume}
                            onChange={(e) => setTripVolume(e.target.value)}
                            placeholder={t('excavation.slopBackfilling1.tripVolume')}
                        />
                        <InputField
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder={t('excavation.slopBackfilling1.price')}
                            suffix="₹/MT"
                        />
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
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('excavation.slopBackfilling1.results.materialVolume')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{materialVolume.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary">m3</td>
                                </tr>
                                <tr className="hover:bg-[#F9F9F9] transition-colors">
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('excavation.slopBackfilling1.results.numberOfTrips')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{numberOfTrips.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary">Nos</td>
                                </tr>
                                <tr className="hover:bg-[#F9F9F9] transition-colors">
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('excavation.slopBackfilling1.results.totalCost')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{totalCost.toFixed(3)}</td>
                                    {/* Using Rupee symbol here to match image result table specifically */}
                                    <td className="px-6 py-4 text-sm text-primary">₹</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mt-8 mb-6">
                        {/* Total Cost Display */}
                        <div className="bg-[#F9F4EE] rounded-2xl px-6 flex justify-between items-center w-full md:w-1/2 h-[58px]">
                            <span className='text-primary font-medium'>{t('excavation.slopBackfilling1.results.totalCost')}</span>
                            <span className='text-[#B02E0C] font-bold text-lg'>₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
                        </div>

                        {/* Bottom Actions */}
                        <Button
                            variant="primary"
                            onClick={() => navigate('/calculation/excavation/slop-backfilling-1/detailed', {
                                state: {
                                    calculationData,
                                    outputs: detailedOutputs
                                }
                            })}
                            className="!rounded-2xl text-lg font-medium hover:bg-[#B02E0C] transition-all w-full md:w-1/2 h-[58px]"
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
                defaultTitle={t('excavation.slopBackfilling1.detailedTitle')}
                isLoading={isDownloading}
            />
        </div>
    );
};

export default SlopBackfilling1;
