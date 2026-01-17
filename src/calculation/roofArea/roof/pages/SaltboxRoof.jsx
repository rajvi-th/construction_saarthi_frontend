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
import saltboxRoofs from '../../../../assets/icons/saltboxRoofs.svg';

const SaltboxRoof = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Inputs
    const [baseLengthA1, setBaseLengthA1] = useState('');
    const [baseLengthA2, setBaseLengthA2] = useState('');
    const [baseLengthB, setBaseLengthB] = useState('');
    const [eaveLengthC, setEaveLengthC] = useState('');
    const [riseH1, setRiseH1] = useState('');
    const [riseH2, setRiseH2] = useState('');
    const [roomPrice, setRoomPrice] = useState('');

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Calculation Logic
    const A1 = parseFloat(baseLengthA1) || 0;
    const A2 = parseFloat(baseLengthA2) || 0;
    const B = parseFloat(baseLengthB) || 0;
    const C = parseFloat(eaveLengthC) || 0;
    const H1 = parseFloat(riseH1) || 0;
    const H2 = parseFloat(riseH2) || 0;
    const P = parseFloat(roomPrice) || 0;

    const A1_m = unitType === 'metric' ? A1 / 1000 : A1;
    const A2_m = unitType === 'metric' ? A2 / 1000 : A2;
    const B_m = unitType === 'metric' ? B / 1000 : B;
    const C_m = unitType === 'metric' ? C / 1000 : C;
    const H1_m = unitType === 'metric' ? H1 / 1000 : H1;
    const H2_m = unitType === 'metric' ? H2 / 1000 : H2;

    // Roof Area Calculation
    // Formula from image: (sqrt((h1*h1)+(a1*a1))*b) + (sqrt((h2*h2)+((a2+c)*(a2+c)))*b)
    // Note: The formula in the image result section seems to be:
    // (sqrt((h1Xh1)+(a1Xa1))Xb) + (sqrt((h2Xh2)+((a2+c)X(a2+c)))Xb)
    // There is a slight discrepancy in typical Saltbox geometry depending on where C (eave) applies.
    // Usually one side is longer (cat-slide).
    // Based on the formula provided in the image:
    // Part 1 Area: sqrt(H1^2 + A1^2) * B  (No eave C on this side?)
    // Part 2 Area: sqrt(H2^2 + (A2+C)^2) * B (Eave C added to A2)
    // Let's implement EXACTLY as the image formula string unless it's clearly wrong.
    // The image formula shows: Roof Area = (sqrt((h1Xh1)+(a1Xa1))Xb)+(sqrt((h2Xh2)+((a2+c)X(a2+c)))Xb)

    // However, looking closely at typical roof calcs, B is usually the length of the roof ridge.
    // Let's assume B needs (B+2C) if eaves are on gable ends, but here it just says Xb.
    // The image for "Inputs" shows "Eave Length C".
    // I will follow the specific formula string visible in the 'Detailed Report' image.

    const slopeLength1 = Math.sqrt((H1_m * H1_m) + (A1_m * A1_m));
    const term2Part = A2_m + C_m;
    const slopeLength2 = Math.sqrt((H2_m * H2_m) + (term2Part * term2Part));

    const roofArea = (slopeLength1 * B_m) + (slopeLength2 * B_m);

    // Roof Cost
    const roofCost = roofArea * P;

    const handleReset = () => {
        setBaseLengthA1('');
        setBaseLengthA2('');
        setBaseLengthB('');
        setEaveLengthC('');
        setRiseH1('');
        setRiseH2('');
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
        { labelKey: 'roofArea.saltboxRoof.baseLengthA1', symbol: 'A1', value: `${(A1 / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.saltboxRoof.baseLengthA2', symbol: 'A2', value: `${(A2 / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.saltboxRoof.baseLengthB', symbol: 'B', value: `${(B / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.saltboxRoof.eaveLengthC', symbol: 'C', value: `${(C / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.saltboxRoof.riseH1', symbol: 'H1', value: `${(H1 / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.saltboxRoof.riseH2', symbol: 'H2', value: `${(H2 / 1000).toFixed(3)} m` },
        { labelKey: 'roofArea.saltboxRoof.roomPrice', symbol: 'P', value: roomPrice, unitKey: 'roofArea.common.currencyPerSqM' },
    ];

    const detailedOutputs = [
        {
            titleKey: 'roofArea.saltboxRoof.results.roofArea',
            labelKey: 'roofArea.saltboxRoof.results.roofArea',
            labelSuffix: ' =',
            formula: '(sqrt((h1Xh1)+(a1Xa1))Xb)+(sqrt((h2Xh2)+((a2+c)X(a2+c)))Xb)',
            value: roofArea.toFixed(3),
            unit: 'sq.m.'
        },
        {
            titleKey: 'roofArea.saltboxRoof.results.roofCost',
            labelKey: 'roofArea.saltboxRoof.results.roofCost',
            labelSuffix: ' =',
            formula: '((sqrt((h1Xh1)+(a1Xa1))Xb)+(sqrt((h2Xh2)+((a2+c)X(a2+c)))Xb))Xp',
            value: roofCost.toFixed(3),
            unitKey: 'roofArea.common.currency'
        }
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('roofArea.saltboxRoof.title')}
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
                        <img src={saltboxRoofs} alt="Saltbox Roof Diagram" className=" object-contain" />
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
                        <div className="grid grid-cols-3 gap-4">
                            <InputField
                                unit="mm"
                                value={baseLengthA1}
                                onChange={(e) => setBaseLengthA1(e.target.value)}
                                placeholder={t('roofArea.saltboxRoof.baseLengthA1')}
                            />

                            <InputField
                                unit="mm"
                                value={baseLengthA2}
                                onChange={(e) => setBaseLengthA2(e.target.value)}
                                placeholder={t('roofArea.saltboxRoof.baseLengthA2')}
                            />

                            <InputField
                                unit="mm"
                                value={baseLengthB}
                                onChange={(e) => setBaseLengthB(e.target.value)}
                                placeholder={t('roofArea.saltboxRoof.baseLengthB')}
                            />
                        </div>

                        <InputField
                            unit="mm"
                            value={eaveLengthC}
                            onChange={(e) => setEaveLengthC(e.target.value)}
                            placeholder={t('roofArea.saltboxRoof.eaveLengthC')}
                        />

                        {/* Rise H1 */}
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                unit="mm"
                                value={riseH1}
                                onChange={(e) => setRiseH1(e.target.value)}
                                placeholder={t('roofArea.saltboxRoof.riseH1')}
                            />

                            <InputField
                                unit="mm"
                                value={riseH2}
                                onChange={(e) => setRiseH2(e.target.value)}
                                placeholder={t('roofArea.saltboxRoof.riseH2')}
                            />
                        </div>

                        {/* Room Price */}
                        <div>
                            <InputField
                                unit="mm"
                                suffix="₹/sq.m."
                                value={roomPrice}
                                onChange={(e) => setRoomPrice(e.target.value)}
                                placeholder={t('roofArea.saltboxRoof.roomPrice')}
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
                                    { materialKey: 'roofArea.saltboxRoof.results.roofArea', quantity: roofArea.toFixed(3), unit: 'sq.m.' },
                                    { materialKey: 'roofArea.saltboxRoof.results.roofCost', quantity: roofCost.toFixed(3), unit: '₹' },
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
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_ROOF_AREA_SALTBOX_ROOF_DETAILED, {
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
                defaultTitle={t('roofArea.saltboxRoof.detailedTitle')}
                isLoading={isDownloading}
            />
        </div>
    );
};

export default SaltboxRoof;
