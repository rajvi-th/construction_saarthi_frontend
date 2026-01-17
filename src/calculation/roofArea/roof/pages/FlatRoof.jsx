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

// Import icons
import flatRoofs from '../../../../assets/icons/flatRoofs.svg';

const FlatRoof = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Inputs
    const [baseLengthA, setBaseLengthA] = useState('');
    const [baseLengthB, setBaseLengthB] = useState('');
    const [eaveLengthC, setEaveLengthC] = useState('');
    const [roomPrice, setRoomPrice] = useState('');

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Calculation Logic
    const A = parseFloat(baseLengthA) || 0;
    const B = parseFloat(baseLengthB) || 0;
    const C = parseFloat(eaveLengthC) || 0;
    const P = parseFloat(roomPrice) || 0;

    // Convert inputs to meters if needed (assuming inputs are in mm based on image, but logical implementation usually handles unit conversion.
    // However, for simplicity and matching the image which shows dropdown 'mm', we will convert mm to m for calculation if unit is metric)
    // The image shows input '10 m' in detailed view so assuming user enters meters or we convert.
    // Wait, the input fields in image show 'mm' dropdown. So inputs are mm.
    const A_m = unitType === 'metric' ? A / 1000 : A; // assuming metric input is mm
    const B_m = unitType === 'metric' ? B / 1000 : B;
    const C_m = unitType === 'metric' ? C / 1000 : C;

    // Roof Area = (a + c + c) * (b + c + c)
    const roofArea = (A_m + C_m + C_m) * (B_m + C_m + C_m);

    // Roof Cost
    const roofCost = roofArea * P;

    const handleReset = () => {
        setBaseLengthA('');
        setBaseLengthB('');
        setEaveLengthC('');
        setRoomPrice('');
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
        { labelKey: 'roofArea.flatRoof.baseLengthA', symbol: 'A', value: `${(A / 1000).toFixed(3)} m` }, // Displaying converted value in detailed report as per image
        { labelKey: 'roofArea.flatRoof.baseLengthB', symbol: 'B', value: `${(B / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.flatRoof.eaveLengthC', symbol: 'C', value: `${(C / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.flatRoof.roomPrice', symbol: 'P', value: roomPrice, unitKey: 'roofArea.common.currencyPerSqM' },
    ];

    const detailedOutputs = [
        {
            titleKey: 'roofArea.flatRoof.results.roofArea',
            labelKey: 'roofArea.flatRoof.results.roofArea',
            labelSuffix: ' =',
            formula: '(a+c+c)X(b+c+c)',
            value: roofArea.toFixed(3),
            unit: 'sq.m.'
        },
        {
            titleKey: 'roofArea.flatRoof.results.roofCost',
            labelKey: 'roofArea.flatRoof.results.roofCost',
            labelSuffix: ' =',
            formula: '(a+c+c)X(b+c+c)Xp',
            value: roofCost.toFixed(3),
            unitKey: 'roofArea.common.currency'
        }
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('roofArea.flatRoof.title')}
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
                        <img src={flatRoofs} alt="Flat Roof Diagram" className=" object-contain" />
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
                        <div className='grid md:grid-cols-3 gap-4'>
                            <InputField
                                unit="mm"
                                value={baseLengthA}
                                onChange={(e) => setBaseLengthA(e.target.value)}
                                placeholder={t('roofArea.flatRoof.baseLengthA')}
                            />
                            <InputField
                                unit="mm"
                                value={baseLengthB}
                                onChange={(e) => setBaseLengthB(e.target.value)}
                                placeholder={t('roofArea.flatRoof.baseLengthB')}
                            />
                            <InputField
                                unit="mm"
                                value={eaveLengthC}
                                onChange={(e) => setEaveLengthC(e.target.value)}
                                placeholder={t('roofArea.flatRoof.eaveLengthC')}
                            />
                        </div>
                        <InputField
                            unit="mm"
                            suffix="₹/sq.m."
                            value={roomPrice}
                            onChange={(e) => setRoomPrice(e.target.value)}
                            placeholder={t('roofArea.flatRoof.roomPrice')}
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
                                {[
                                    { materialKey: 'roofArea.flatRoof.results.roofArea', quantity: roofArea.toFixed(3), unit: 'sq.m.' },
                                    { materialKey: 'roofArea.flatRoof.results.roofCost', quantity: roofCost.toFixed(3), unit: '₹' },
                                ].map((row, index) => (
                                    <tr key={index} className="hover:bg-[#F9F9F9] transition-colors">
                                        <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t(row.materialKey)}</td>
                                        <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{row.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-primary">{row.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#FDF9F4] p-4 rounded-2xl flex items-center justify-between border border-[#F5E6D3] h-[58px]">
                            <span className="font-medium text-primary uppercase text-sm tracking-wider">{t('roofArea.common.totalCost')}</span>
                            <span className="font-bold text-[#B02E0C] text-xl">₹{roofCost.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_ROOF_AREA_FLAT_ROOF_DETAILED, {
                                state: {
                                    calculationData,
                                    outputs: detailedOutputs
                                }
                            })}
                            className="!rounded-2xl text-lg font-medium hover:bg-[#B02E0C] transition-all h-[58px]"
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
                defaultTitle={t('roofArea.flatRoof.detailedTitle')}
                isLoading={isDownloading}
            />
        </div>
    );
};

export default FlatRoof;
