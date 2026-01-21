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

// Import the specific icon
import flooringIllustration from '../../../../assets/icons/flooringgs.svg';

const Flooring = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Inputs
    const [roomLengthL, setRoomLengthL] = useState('');
    const [roomWidthW, setRoomWidthW] = useState('');
    const [doorWidthD, setDoorWidthD] = useState('');
    const [skirtingHeightH, setSkirtingHeightH] = useState('');
    const [tileLengthl, setTileLengthl] = useState('');
    const [tileWidthw, setTileWidthw] = useState('');
    const [wastageS, setWastageS] = useState('');

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Calculation Logic
    const L = parseFloat(roomLengthL) || 0;
    const W = parseFloat(roomWidthW) || 0;
    const D = parseFloat(doorWidthD) || 0;
    const H = parseFloat(skirtingHeightH) || 0;
    const l = parseFloat(tileLengthl) || 0;
    const w = parseFloat(tileWidthw) || 0;
    const S = parseFloat(wastageS) || 0;

    // Logic to replicate Image 0 Results:
    // ... (same as before)

    const door_m = D / 1000; // Formula says d/1000
    const h_m = H / 1000;
    const tile_l_m = l / 1000;
    const tile_w_m = w / 1000;

    const floorAreaCalc = L * W;
    const skirtingAreaCalc = (2 * (L + W) - door_m) * h_m;
    const totalAreaCalc = floorAreaCalc + skirtingAreaCalc;
    const tileAreaCalc = tile_l_m * tile_w_m;

    const noOfBlocks = tileAreaCalc > 0 ? (totalAreaCalc / tileAreaCalc) * (1 + S / 100) : 0;
    const cementBags = (L * W * 0.01) / 0.035;
    const cementKg = cementBags * 50;
    const sandKg = (L * W * 0.01 * 6) * 1550;

    const handleReset = () => {
        setRoomLengthL('');
        setRoomWidthW('');
        setDoorWidthD('');
        setSkirtingHeightH('');
        setTileLengthl('');
        setTileWidthw('');
        setWastageS('');
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
        { labelKey: 'roofArea.flooring.roomLengthL', symbol: 'L', value: `${L} m` },
        { labelKey: 'roofArea.flooring.roomWidthW', symbol: 'W', value: `${W} m` },
        { labelKey: 'roofArea.flooring.doorWidthD', symbol: 'D', value: `${D} mm` },
        { labelKey: 'roofArea.flooring.skirtingHeightH', symbol: 'H', value: `${H} mm` },
        { labelKey: 'roofArea.flooring.tileLengthl', symbol: 'l', value: `${l} mm` },
        { labelKey: 'roofArea.flooring.tileWidthw', symbol: 'w', value: `${w} mm` },
        { labelKey: 'roofArea.flooring.wastageS', symbol: 'S', value: `${S}%` },
    ];

    const detailedOutputs = [
        {
            titleKey: 'roofArea.flooring.results.noOfBlocks',
            labelKey: 'roofArea.flooring.results.noOfBlocks',
            labelSuffix: ' =',
            formula: '((LXW+(2X(L+W)-d/1000)XH/ 1000)/ ((l/1000)X(w/1000)))X(1+S/100)',
            value: noOfBlocks.toFixed(3),
            unit: 'NOS'
        },
        {
            titleKey: 'roofArea.flooring.results.cementBags',
            labelKey: 'roofArea.flooring.results.cementBags',
            labelSuffix: ' =',
            formula: '(LXWX0.07/7)/0.035',
            value: cementBags.toFixed(3),
            unit: 'Bags(50kg)'
        },
        {
            titleKey: 'roofArea.flooring.results.cement',
            labelKey: 'roofArea.flooring.results.cement',
            labelSuffix: ' =',
            formula: '(LXWX0.07/7)X50/0.035',
            value: cementKg.toFixed(3),
            unit: 'KG'
        },
        {
            titleKey: 'roofArea.flooring.results.sand',
            labelKey: 'roofArea.flooring.results.sand',
            labelSuffix: ' =',
            formula: '((LXWX0.07X6)/7)X1550',
            value: sandKg.toFixed(3),
            unit: 'KG'
        }
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('roofArea.flooring.title')}
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
                        <img src={flooringIllustration} alt="Flooring Diagram" className="object-contain" />
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
                                value={roomLengthL}
                                onChange={(e) => setRoomLengthL(e.target.value)}
                                placeholder={t('roofArea.flooring.roomLengthL')}
                            />
                            <InputField
                                unit="mm"
                                value={roomWidthW}
                                onChange={(e) => setRoomWidthW(e.target.value)}
                                placeholder={t('roofArea.flooring.roomWidthW')}
                            />
                            <InputField
                                unit="mm"
                                value={doorWidthD}
                                onChange={(e) => setDoorWidthD(e.target.value)}
                                placeholder={t('roofArea.flooring.doorWidthD')}
                            />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <InputField
                                unit="mm"
                                value={skirtingHeightH}
                                onChange={(e) => setSkirtingHeightH(e.target.value)}
                                placeholder={t('roofArea.flooring.skirtingHeightH')}
                            />
                            <InputField
                                unit="mm"
                                value={tileLengthl}
                                onChange={(e) => setTileLengthl(e.target.value)}
                                placeholder={t('roofArea.flooring.tileLengthl')}
                            />
                            <InputField
                                unit="mm"
                                value={tileWidthw}
                                onChange={(e) => setTileWidthw(e.target.value)}
                                placeholder={t('roofArea.flooring.tileWidthw')}
                            />
                        </div>
                        <div className="">
                            <InputField
                                suffix="%"
                                value={wastageS}
                                onChange={(e) => setWastageS(e.target.value)}
                                placeholder={t('roofArea.flooring.wastageS')}
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
                                    { materialKey: 'roofArea.flooring.results.noOfBlocks', quantity: noOfBlocks.toFixed(3), unit: 'NOS' },
                                    { materialKey: 'roofArea.flooring.results.cementBags', quantity: Math.floor(cementBags), unit: 'Bags (50kg)' },
                                    { materialKey: 'roofArea.flooring.results.cement', quantity: cementKg.toFixed(3), unit: 'Kg' },
                                    { materialKey: 'roofArea.flooring.results.sand', quantity: sandKg.toFixed(3), unit: 'Kg' },
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
                    <div className="flex justify-end">
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_FLOORING_DETAILED, {
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
                defaultTitle={t('roofArea.flooring.detailedTitle')}
                isLoading={isDownloading}
            />
        </div>
    );
};

export default Flooring;
