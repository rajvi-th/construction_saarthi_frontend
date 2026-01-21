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
import verticalExcavationIcon from '../../../../assets/icons/verticalExcavations.svg';

const VerticalExcavation = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Inputs
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [depth, setDepth] = useState('');
    const [tripVolume, setTripVolume] = useState('');
    const [price, setPrice] = useState('');

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Calculation Logic
    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    const D = parseFloat(depth) || 0;
    const d = parseFloat(tripVolume) || 0;
    const p = parseFloat(price) || 0;

    // Formulas
    const capacity = L * W * D;
    const numberOfTrips = d !== 0 ? capacity / d : 0;
    // Total Cost formula in image: ((LXWXD)/d)Xp -> capacity / d * p (Trips * price per trip?) 
    // Wait, price input says "Price ₹/MT". 
    // Detailed inputs says "Price 100 Currency pr MT".
    // Formula says `((LXWXD)/d)Xp`. 
    // If d is trip volume, capacity/d is Number of Trips. 
    // So Cost = Trips * Price.
    // This implies Price is "Price per Trip". The "₹/MT" in placeholder might be misleading or I should stick to image formula.
    // I will assume Price is per Trip given the formula structure.

    // However, usually Price per MT implies weight. Here we deal with Volume.
    // For now I follow the FORMULA strictly: numberOfTrips * p
    const totalCost = numberOfTrips * p;

    const handleReset = () => {
        setLength('');
        setWidth('');
        setDepth('');
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
        { labelKey: 'excavation.vertical.length', symbol: 'L', value: `${L} m` },
        { labelKey: 'excavation.vertical.width', symbol: 'W', value: `${W} m` },
        { labelKey: 'excavation.vertical.depth', symbol: 'D', value: `${D} m` },
        { labelKey: 'excavation.vertical.tripVolume', symbol: 'd', value: `${d} m` },
        { labelKey: 'excavation.vertical.price', symbol: 'p', value: `${p} Currency pr MT` }, // Text from image
    ];

    const detailedOutputs = [
        {
            titleKey: 'excavation.vertical.results.capacity',
            labelKey: 'excavation.vertical.results.capacity',
            labelSuffix: ' =',
            formula: 'LXWXD',
            value: `${capacity.toFixed(3)} m3`,
        },
        {
            titleKey: 'excavation.vertical.results.numberOfTrips',
            labelKey: 'excavation.vertical.results.numberOfTrips',
            labelSuffix: ' =',
            formula: '(LXWXD)/d',
            value: `${numberOfTrips.toFixed(3)} m3`, // Image has m3 here, likely copy paste error in mock. Trips is a count. I will keep it similar to image but maybe drop unit or use "Trips" if asked. Image has 'm3'. I will stick to image to be safe, or just "m3" as requested "put content same as per image".
        },
        {
            titleKey: 'excavation.vertical.results.totalCost',
            labelKey: 'excavation.vertical.results.totalCost',
            labelSuffix: ' =',
            formula: '((LXWXD)/d)Xp',
            value: `${totalCost.toFixed(3)} m3`, // Again, image has m3. This is definitely weird for Cost. But I follow "content same as per image".
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('excavation.vertical.title')}
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
                        <img src={verticalExcavationIcon} alt="Vertical Excavation" className="object-contain" />
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
                            placeholder={t('excavation.vertical.length')}
                        />
                        <InputField
                            unit="m"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            placeholder={t('excavation.vertical.width')}
                        />
                        <InputField
                            unit="m"
                            value={depth}
                            onChange={(e) => setDepth(e.target.value)}
                            placeholder={t('excavation.vertical.depth')}
                        />
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <InputField
                            unit="m"
                            value={tripVolume}
                            onChange={(e) => setTripVolume(e.target.value)}
                            placeholder={t('excavation.vertical.tripVolume')}
                        />
                        <InputField
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder={t('excavation.vertical.price')}
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
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('excavation.vertical.results.capacity')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{capacity.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary">m3</td>
                                </tr>
                                <tr className="hover:bg-[#F9F9F9] transition-colors">
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('excavation.vertical.results.numberOfTrips')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{numberOfTrips.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary">m3</td>
                                </tr>
                                <tr className="hover:bg-[#F9F9F9] transition-colors">
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('excavation.vertical.results.totalCost')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{totalCost.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary">m3</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mt-8 mb-6">
                        {/* Total Cost Display */}
                        <div className="bg-[#F9F4EE] rounded-2xl px-6 flex justify-between items-center w-full md:w-1/2 h-[58px]">
                            <span className='text-primary font-medium'>{t('excavation.vertical.results.totalCost')}</span>
                            <span className='text-[#B02E0C] font-bold text-lg'>₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
                        </div>

                        {/* Bottom Actions */}
                        <Button
                            variant="primary"
                            onClick={() => navigate('/calculation/excavation/vertical/detailed', {
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
                defaultTitle={t('excavation.vertical.detailedTitle')}
                isLoading={isDownloading}
            />
        </div>
    );
};

export default VerticalExcavation;
