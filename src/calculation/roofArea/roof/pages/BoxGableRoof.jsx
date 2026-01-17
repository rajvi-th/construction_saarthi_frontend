import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, ChevronDown } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import { ROUTES_FLAT } from '../../../../constants/routes';
import InputField from '../../../common/InputField';
import DownloadPDFModal from '../../../common/DownloadPDFModal';

// Import icons
import boxGableRoofs from '../../../../assets/icons/boxGableRoofs.svg';

const BoxGableRoof = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Inputs
    const [baseLengthA, setBaseLengthA] = useState('');
    const [baseLengthB, setBaseLengthB] = useState('');
    const [eaveLengthC, setEaveLengthC] = useState('');
    const [eaveLengthD, setEaveLengthD] = useState('');
    const [riseH, setRiseH] = useState('');
    const [roomPrice, setRoomPrice] = useState('');

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Calculation Logic
    const A = parseFloat(baseLengthA) || 0;
    const B = parseFloat(baseLengthB) || 0;
    const C = parseFloat(eaveLengthC) || 0;
    const D = parseFloat(eaveLengthD) || 0;
    const H = parseFloat(riseH) || 0;
    const P = parseFloat(roomPrice) || 0;

    const A_m = unitType === 'metric' ? A / 1000 : A;
    const B_m = unitType === 'metric' ? B / 1000 : B;
    const C_m = unitType === 'metric' ? C / 1000 : C;
    const D_m = unitType === 'metric' ? D / 1000 : D;
    const H_m = unitType === 'metric' ? H / 1000 : H;

    // Roof Area = sqrt((h*h) + ((0.5*a)+c)*((0.5*a)+c)) * (b+(2*d)) * 2
    // Formula from image: sqrt((hXh)+(((0.5Xa)+c)X((0.5Xa)+c)))X(b+(2Xd))X2
    // There is a slight ambiguity in the image formula "X2" at the end. 
    // Standard Gable simplified: Length of rafter * Length of roof * 2 sides.
    // Rafter length = sqrt(H^2 + (A/2 + C)^2) if C is overhang on the gable end? 
    // Or is C the overhang on the eave side?
    // Let's stick strictly to the formula provided in the image text.

    const term1 = H_m * H_m;
    const halfA_plus_C = (0.5 * A_m) + C_m;
    const term2 = halfA_plus_C * halfA_plus_C; // ((0.5Xa)+c)X((0.5Xa)+c)

    // Rafter calculation part
    const rafterLength = Math.sqrt(term1 + term2);

    // Length along the ridge/eave
    const lengthB_plus_2D = B_m + (2 * D_m); // b+(2Xd)

    // Total Area
    const roofArea = rafterLength * lengthB_plus_2D * 2;

    // Roof Cost
    const roofCost = roofArea * P;

    const handleReset = () => {
        setBaseLengthA('');
        setBaseLengthB('');
        setEaveLengthC('');
        setEaveLengthD('');
        setRiseH('');
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
        { labelKey: 'roofArea.boxGableRoof.baseLengthA', symbol: 'A', value: `${(A / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.boxGableRoof.baseLengthB', symbol: 'B', value: `${(B / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.boxGableRoof.eaveLengthC', symbol: 'C', value: `${(C / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.boxGableRoof.eaveLengthD', symbol: 'D', value: `${(D / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.boxGableRoof.riseH', symbol: 'H', value: `${(H / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.boxGableRoof.roomPrice', symbol: 'P', value: roomPrice, unitKey: 'roofArea.common.currencyPerSqM' },
    ];

    const detailedOutputs = [
        {
            titleKey: 'roofArea.boxGableRoof.results.roofArea',
            labelKey: 'roofArea.boxGableRoof.results.roofArea',
            labelSuffix: ' =',
            formula: 'sqrt((hXh)+(((0.5Xa)+c)X((0.5Xa)+c)))X(b+(2Xd))X2',
            value: roofArea.toFixed(3),
            unit: 'sq.m.'
        },
        {
            titleKey: 'roofArea.boxGableRoof.results.roofCost',
            labelKey: 'roofArea.boxGableRoof.results.roofCost',
            labelSuffix: ' =',
            formula: '(sqrt((hXh)+(((0.5Xa)+c)X((0.5Xa)+c)))X(b+(2Xd))X2)Xp',
            value: roofCost.toFixed(3),
            unitKey: 'roofArea.common.currency'
        }
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('roofArea.boxGableRoof.title')}
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
                        <img src={boxGableRoofs} alt="Box Gable Roof Diagram" className=" object-contain" />
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
                        {/* A and B in one row */}
                        <div className='grid md:grid-cols-2 gap-4'>
                            <InputField
                                unit="mm"
                                value={baseLengthA}
                                onChange={(e) => setBaseLengthA(e.target.value)}
                                placeholder={t('roofArea.boxGableRoof.baseLengthA')}
                            />
                            <InputField
                                unit="mm"
                                value={baseLengthB}
                                onChange={(e) => setBaseLengthB(e.target.value)}
                                placeholder={t('roofArea.boxGableRoof.baseLengthB')}
                            />
                        </div>

                        {/* C and D in one row */}
                        <div className='grid md:grid-cols-2 gap-4'>
                            <InputField
                                unit="mm"
                                value={eaveLengthC}
                                onChange={(e) => setEaveLengthC(e.target.value)}
                                placeholder={t('roofArea.boxGableRoof.eaveLengthC')}
                            />
                            <InputField
                                unit="mm"
                                value={eaveLengthD}
                                onChange={(e) => setEaveLengthD(e.target.value)}
                                placeholder={t('roofArea.boxGableRoof.eaveLengthD')}
                            />
                        </div>

                        {/* Rise H and Room Price */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <InputField
                                unit="mm"
                                value={riseH}
                                onChange={(e) => setRiseH(e.target.value)}
                                placeholder={t('roofArea.boxGableRoof.riseH')}
                            />
                            <InputField
                                unit="mm"
                                suffix="₹/sq.m."
                                value={roomPrice}
                                onChange={(e) => setRoomPrice(e.target.value)}
                                placeholder={t('roofArea.boxGableRoof.roomPrice')}
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
                                {[
                                    { materialKey: 'roofArea.boxGableRoof.results.roofArea', quantity: roofArea.toFixed(3), unit: 'sq.m.' },
                                    { materialKey: 'roofArea.boxGableRoof.results.roofCost', quantity: roofCost.toFixed(3), unit: '₹' },
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
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_ROOF_AREA_BOX_GABLE_ROOF_DETAILED, {
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
                defaultTitle={t('roofArea.boxGableRoof.detailedTitle')}
                isLoading={isDownloading}
            />
        </div>
    );
};

export default BoxGableRoof;
