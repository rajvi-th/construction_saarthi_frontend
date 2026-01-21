import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader';
import Button from '../../../components/ui/Button';
import Radio from '../../../components/ui/Radio';
import InputField from '../../common/InputField';
import DownloadPDFModal from '../../common/DownloadPDFModal';

const WaterProofingCalculation = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric');

    // Inputs
    const [brickLength, setBrickLength] = useState('');
    const [brickWidth, setBrickWidth] = useState('');
    const [brickDepth, setBrickDepth] = useState('');
    const [surfaceLength, setSurfaceLength] = useState('');
    const [surfaceWidth, setSurfaceWidth] = useState('');
    const [waterProofingDepth, setWaterProofingDepth] = useState('');
    const [mortarJoint, setMortarJoint] = useState('');

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Calculation Logic
    const L = parseFloat(brickLength) || 0; // mm
    const W = parseFloat(brickWidth) || 0; // mm
    const D = parseFloat(brickDepth) || 0; // mm
    const l = parseFloat(surfaceLength) || 0; // m
    const w = parseFloat(surfaceWidth) || 0; // m
    const d = parseFloat(waterProofingDepth) || 0; // mm
    const J = parseFloat(mortarJoint) || 0; // mm

    // Formulas based on user's image request:
    // No Of Bricks With Mortar = l X w / (((L/1000 + J/1000) + (W/1000 + J/1000)))
    // Note: The denominator uses addition (+) instead of multiplication (*) as per explicit visual instruction, 
    // even though geometrically area division usually implies multiplication.
    // However, if the user insists "same as per image", we follow the image formula text literally.
    // Wait, let's look at the result in image again: 75.000 for 6x4m area with standard bricks.
    // 6x4 = 24. Denom approx (0.2 + 0.1) = 0.3. 24/0.3 = 80. Close to 75. 
    // If it was multiplication: 0.2 * 0.1 = 0.02. 24/0.02 = 1200. 
    // The result 75 confirms the formula uses ADDITION in denominator.

    const termL = (L / 1000) + (J / 1000);
    const termW = (W / 1000) + (J / 1000);
    const denominator = termL + termW;

    const noOfBricks = denominator !== 0 ? (l * w) / denominator : 0;

    // Volume Of Mortar = (lXwXd/1000) - ((lXw/((L/1000+J/1000)+(W/1000+J/1000))) X L/1000 X W/1000 X D/1000)
    // Basically: Total Volume - Brick Volume
    const totalVolume = l * w * (d / 1000);
    const brickVolume = noOfBricks * (L / 1000) * (W / 1000) * (D / 1000);
    const volumeOfMortar = totalVolume - brickVolume;

    const handleReset = () => {
        setBrickLength('');
        setBrickWidth('');
        setBrickDepth('');
        setSurfaceLength('');
        setSurfaceWidth('');
        setWaterProofingDepth('');
        setMortarJoint('');
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
        { labelKey: 'waterProofing.brickLength', symbol: 'L', value: L, unitKey: 'concrete.byVolume.mmUnit' },
        { labelKey: 'waterProofing.brickWidth', symbol: 'W', value: W, unitKey: 'concrete.byVolume.mmUnit' },
        { labelKey: 'waterProofing.brickDepth', symbol: 'D', value: D, unitKey: 'concrete.byVolume.mmUnit' },
        { labelKey: 'waterProofing.surfaceLength', symbol: 'l', value: l, unitKey: 'concrete.byVolume.mUnit' },
        { labelKey: 'waterProofing.surfaceWidth', symbol: 'w', value: w, unitKey: 'concrete.byVolume.mUnit' },
        { labelKey: 'waterProofing.waterProofingDepth', symbol: 'd', value: d, unitKey: 'concrete.byVolume.mmUnit' },
        { labelKey: 'waterProofing.mortarJoint', symbol: 'J', value: J, unitKey: 'concrete.byVolume.mmUnit' },
    ];

    const detailedOutputs = [
        {
            titleKey: 'waterProofing.results.noOfBricks',
            labelKey: 'waterProofing.results.noOfBricks',
            labelSuffix: ' =',
            formula: 'lXw/((L/1000+J/1000)+(W/1000+J/1000))',
            value: noOfBricks.toFixed(3),
            unitKey: 'history.units.nos',
        },
        {
            titleKey: 'waterProofing.results.volumeOfMortar',
            labelKey: 'waterProofing.results.volumeOfMortar',
            labelSuffix: ' =',
            formula: '(lXwXd/1000)-((lXw/((L/1000+J/1000)+(W/1000+J/1000)))XL/1000XW/1000XD/1000)',
            value: volumeOfMortar.toFixed(3),
            unitKey: 'concrete.byVolume.m3Unit',
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('waterProofing.title')}
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
                <div className="flex items-center gap-4 sm:gap-10 pb-6 border-b border-[#060C120A] mb-6">
                    {/* Radio Group */}
                    <div className="flex flex-row gap-6">
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
                <div className="space-y-4">
                    {/* First Row: 3 Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField
                            unit={t('concrete.byVolume.mmUnit')}
                            value={brickLength}
                            onChange={(e) => setBrickLength(e.target.value)}
                            placeholder={t('waterProofing.brickLength')}
                        />
                        <InputField
                            unit={t('concrete.byVolume.mmUnit')}
                            value={brickWidth}
                            onChange={(e) => setBrickWidth(e.target.value)}
                            placeholder={t('waterProofing.brickWidth')}
                        />
                        <InputField
                            unit={t('concrete.byVolume.mmUnit')}
                            value={brickDepth}
                            onChange={(e) => setBrickDepth(e.target.value)}
                            placeholder={t('waterProofing.brickDepth')}
                        />
                    </div>
                    {/* Second Row: 2 Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            unit={t('concrete.byVolume.mUnit')}
                            value={surfaceLength}
                            onChange={(e) => setSurfaceLength(e.target.value)}
                            placeholder={t('waterProofing.surfaceLength')}
                        />
                        <InputField
                            unit={t('concrete.byVolume.mUnit')}
                            value={surfaceWidth}
                            onChange={(e) => setSurfaceWidth(e.target.value)}
                            placeholder={t('waterProofing.surfaceWidth')}
                        />
                    </div>
                    {/* Third Row: 2 Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            unit={t('concrete.byVolume.mmUnit')}
                            value={waterProofingDepth}
                            onChange={(e) => setWaterProofingDepth(e.target.value)}
                            placeholder={t('waterProofing.waterProofingDepth')}
                        />
                        <InputField
                            unit={t('concrete.byVolume.mmUnit')}
                            value={mortarJoint}
                            onChange={(e) => setMortarJoint(e.target.value)}
                            placeholder={t('waterProofing.mortarJoint')}
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
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('waterProofing.results.noOfBricks')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{noOfBricks.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary">NOS</td>
                                </tr>
                                <tr className="hover:bg-[#F9F9F9] transition-colors">
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('waterProofing.results.volumeOfMortar')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{volumeOfMortar.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary">m³</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex justify-end">
                        <Button
                            variant="primary"
                            onClick={() => navigate('/calculation/water-proofing/detailed', {
                                state: {
                                    calculationData,
                                    outputs: detailedOutputs
                                }
                            })}
                            className="!rounded-2xl text-lg font-medium h-[50px]"
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
                defaultTitle={t('waterProofing.detailedTitle')}
                isLoading={isDownloading}
            />
        </div>
    );
};

export default WaterProofingCalculation;
