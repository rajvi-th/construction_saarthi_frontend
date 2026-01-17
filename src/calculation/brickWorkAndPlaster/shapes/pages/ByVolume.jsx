import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import { ROUTES_FLAT } from '../../../../constants/routes';
import InputField from '../../../common/InputField';
import DownloadPDFModal from '../../../common/DownloadPDFModal';

// Import icons
import byVolumes from '../../../../assets/icons/byVolumes.svg';

const ShapesByVolume = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');

    // Brick Size (mm)
    const [brickL, setBrickL] = useState('');
    const [brickW, setBrickW] = useState('');
    const [brickT, setBrickT] = useState('');

    // Wall Size
    const [wallVolume, setWallVolume] = useState(''); // m3
    const [joint, setJoint] = useState(''); // mm

    // Mortar Ratio
    const [cementRatio, setCementRatio] = useState('');
    const [sandRatio, setSandRatio] = useState('');

    // Price
    const [brickPrice, setBrickPrice] = useState('');
    const [cementPrice, setCementPrice] = useState('');
    const [sandPrice, setSandPrice] = useState('');

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Calculation Logic
    const L_m = (parseFloat(brickL) || 0) / 1000;
    const W_m = (parseFloat(brickW) || 0) / 1000;
    const T_m = (parseFloat(brickT) || 0) / 1000;
    const j_m = (parseFloat(joint) || 0) / 1000;

    const V = parseFloat(wallVolume) || 0;
    const c = parseFloat(cementRatio) || 0;
    const s = parseFloat(sandRatio) || 0;

    const B1 = parseFloat(brickPrice) || 0;
    const C1 = parseFloat(cementPrice) || 0;
    const S1 = parseFloat(sandPrice) || 0;

    // No Of Bricks = (V)/((L+j)XwX(T+j))
    const denom = (L_m + j_m) * W_m * (T_m + j_m);
    const noOfBricks = denom > 0 ? (V / denom) : 0;

    // Mortar Dry Volume = ((V)-(((V)/((L+j)XwX(T+j)))XLXwXT))X1.42
    const totalBrickVolWithoutMortar = noOfBricks * L_m * W_m * T_m;
    const mortarDryVolume = (V - totalBrickVolWithoutMortar) * 1.42;

    // Cement Bags(50 Kg) = (cX(((V)-(((V)/((L+j)XwX(T+j)))XLXwXT))X1.42))/((c+s)X0.035)
    const cementBags = (c + s) > 0 ? (c * mortarDryVolume) / ((c + s) * 0.035) : 0;

    // Sand = (sX(((V)-(((V)/((L+j)XwX(T+j)))XLXwXT))X1.42))/(c+s)
    const sandVolume = (c + s) > 0 ? (s * mortarDryVolume) / (c + s) : 0;

    // Costs
    const brickCost = noOfBricks * B1;
    const cementCost = cementBags * C1;
    const sandCost = sandVolume * S1;
    const totalCost = brickCost + cementCost + sandCost;

    const handleReset = () => {
        setBrickL(''); setBrickW(''); setBrickT('');
        setWallVolume(''); setJoint('');
        setCementRatio(''); setSandRatio('');
        setBrickPrice(''); setCementPrice(''); setSandPrice('');
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
        { labelKey: 'brickWorkAndPlaster.clayBrick.brickLength', symbol: 'L', value: brickL || 0, unit: 'mm' },
        { labelKey: 'brickWorkAndPlaster.clayBrick.brickWidth', symbol: 'W', value: brickW || 0, unit: 'mm' },
        { labelKey: 'brickWorkAndPlaster.clayBrick.brickThickness', symbol: 'T', value: brickT || 0, unit: 'mm' },
        { labelKey: 'brickWorkAndPlaster.clayBrick.volume', symbol: 'V', value: wallVolume || 0, unit: 'm3' },
        { labelKey: 'brickWorkAndPlaster.bonds.brickToBrickJoint', symbol: 'j', value: joint || 0, unit: 'mm' },
        { labelKey: 'brickWorkAndPlaster.clayBrick.cement', symbol: 'C', value: cementRatio || 0 },
        { labelKey: 'brickWorkAndPlaster.clayBrick.sand', symbol: 'S', value: sandRatio || 0 },
        { labelKey: 'brickWorkAndPlaster.clayBrick.brickPrice', symbol: 'B1', value: brickPrice || 0, unitKey: 'brickWorkAndPlaster.clayBrick.currencyPerUnit' },
        { labelKey: 'brickWorkAndPlaster.clayBrick.cementPrice', symbol: 'C1', value: cementPrice || 0, unitKey: 'brickWorkAndPlaster.clayBrick.currencyPerUnit' },
        { labelKey: 'brickWorkAndPlaster.clayBrick.sandPrice', symbol: 'S1', value: sandPrice || 0, unitKey: 'brickWorkAndPlaster.clayBrick.currencyPerUnit' },
    ];

    const detailedOutputs = [
        { titleKey: 'brickWorkAndPlaster.clayBrick.results.volumeOfWall', labelKey: 'brickWorkAndPlaster.clayBrick.results.volumeOfWall', labelSuffix: ' =', formula: '(V)', value: V.toFixed(3), unit: 'm3' },
        { titleKey: 'brickWorkAndPlaster.clayBrick.results.noOfBricks', labelKey: 'brickWorkAndPlaster.clayBrick.results.noOfBricks', labelSuffix: ' =', formula: '(V/((L+j)XwX(T+j)))', value: noOfBricks.toFixed(3), unit: 'NOS' },
        { titleKey: 'brickWorkAndPlaster.clayBrick.results.mortarDryVolume', labelKey: 'brickWorkAndPlaster.clayBrick.results.mortarDryVolume', labelSuffix: ' =', formula: '((V)-(((V)/((L+j)XwX(T+j)))XLXwXT))X1.42', value: mortarDryVolume.toFixed(3), unit: 'm3' },
        { titleKey: 'brickWorkAndPlaster.clayBrick.results.cementBags', labelKey: 'brickWorkAndPlaster.clayBrick.results.cementBags', labelSuffix: ' =', formula: '(cX(((V)-(((V)/((L+j)XwX(T+j)))XLXwXT))X1.42))/((c+s)X0.035)', value: cementBags.toFixed(3), unit: 'bags' },
        { titleKey: 'brickWorkAndPlaster.clayBrick.results.sandVolume', labelKey: 'brickWorkAndPlaster.clayBrick.results.sandVolume', labelSuffix: ' =', formula: '(sX(((V)-(((V)/((L+j)XwX(T+j)))XLXwXT))X1.42))/(c+s)', value: sandVolume.toFixed(3), unit: 'm3' },
        { titleKey: 'brickWorkAndPlaster.clayBrick.results.brickCost', labelKey: 'brickWorkAndPlaster.clayBrick.results.brickCost', labelSuffix: ' =', formula: '(B1X((V)/((L+j)XwX(T+j))))', value: brickCost.toFixed(3), unitKey: 'brickWorkAndPlaster.clayBrick.currency' },
        { titleKey: 'brickWorkAndPlaster.clayBrick.results.cementCost', labelKey: 'brickWorkAndPlaster.clayBrick.results.cementCost', labelSuffix: ' =', formula: '(C1X((cX(((V)-(((V)/((L+j)XwX(T+j)))XLXwXT))X1.42))/((c+s)X0.035)))', value: cementCost.toFixed(3), unitKey: 'brickWorkAndPlaster.clayBrick.currency' },
        { titleKey: 'brickWorkAndPlaster.clayBrick.results.sandCost', labelKey: 'brickWorkAndPlaster.clayBrick.results.sandCost', labelSuffix: ' =', formula: '(S1X((sX(((V)-(((V)/((L+j)XwX(T+j)))XLXwXT))X1.42))/(c+s)))', value: sandCost.toFixed(3), unitKey: 'brickWorkAndPlaster.clayBrick.currency' },
        { titleKey: 'brickWorkAndPlaster.clayBrick.results.totalCost', labelKey: 'brickWorkAndPlaster.clayBrick.results.totalCost', labelSuffix: ' =', formula: '(Brick Cost + Cement Cost + Sand Cost)', value: totalCost.toFixed(3), unitKey: 'brickWorkAndPlaster.clayBrick.currency' },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20 px-4">
            <div className="mb-6">
                <PageHeader
                    title={t('brickWorkAndPlaster.shapes.byVolume')}
                    showBackButton
                    onBack={() => navigate(-1)}
                >
                    <div className="flex gap-4 items-center">
                        <Button
                            variant="secondary"
                            onClick={() => setIsDownloadModalOpen(true)}
                            className="border-[#E0E0E0] rounded-xl text-secondary !px-2 sm:!px-4 py-2"
                            leftIcon={<Download className="w-4 h-4 text-secondary " />}
                        >
                            <span className="text-sm font-medium">{t('history.downloadReport')}</span>
                        </Button>
                    </div>
                </PageHeader>
            </div>

            <div className="bg-[#F9F4EE] rounded-3xl p-4 sm:p-6">
                <div className="flex items-center gap-4 sm:gap-10 pb-6 border-b border-[#060C120A]">
                    <div className="flex items-center justify-center">
                        <img src={byVolumes} alt={t('brickWorkAndPlaster.shapes.byVolume')} className="object-contain" />
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    {/* Brick Size */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('brickWorkAndPlaster.clayBrick.brickSize')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                            <InputField unit="mm" value={brickL} onChange={(e) => setBrickL(e.target.value)} placeholder={t('brickWorkAndPlaster.clayBrick.brickLength')} />
                            <InputField unit="mm" value={brickW} onChange={(e) => setBrickW(e.target.value)} placeholder={t('brickWorkAndPlaster.clayBrick.brickWidth')} />
                            <div className="col-span-2 md:col-span-1">
                                <InputField unit="mm" value={brickT} onChange={(e) => setBrickT(e.target.value)} placeholder={t('brickWorkAndPlaster.clayBrick.brickThickness')} />
                            </div>
                        </div>
                    </div>

                    {/* Wall Size */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('brickWorkAndPlaster.clayBrick.wallSize')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                            <InputField unit="m3" value={wallVolume} onChange={(e) => setWallVolume(e.target.value)} placeholder={t('brickWorkAndPlaster.clayBrick.volume')} />
                            <InputField unit="mm" value={joint} onChange={(e) => setJoint(e.target.value)} placeholder={t('brickWorkAndPlaster.bonds.brickToBrickJoint')} />
                        </div>
                    </div>

                    {/* Mortar Ratio */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('brickWorkAndPlaster.clayBrick.mortarRatio')}</h3>
                        <div className="grid grid-cols-2 gap-2 md:gap-4">
                            <InputField value={cementRatio} onChange={(e) => setCementRatio(e.target.value)} placeholder={t('brickWorkAndPlaster.clayBrick.cement')} />
                            <InputField value={sandRatio} onChange={(e) => setSandRatio(e.target.value)} placeholder={t('brickWorkAndPlaster.clayBrick.sand')} />
                        </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('brickWorkAndPlaster.clayBrick.price')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                            <InputField suffix="₹/Unit" value={brickPrice} onChange={(e) => setBrickPrice(e.target.value)} placeholder={t('brickWorkAndPlaster.clayBrick.brickPrice')} />
                            <InputField suffix="₹" value={cementPrice} onChange={(e) => setCementPrice(e.target.value)} placeholder={t('brickWorkAndPlaster.clayBrick.cementPrice')} />
                            <InputField suffix="₹/Unit" value={sandPrice} onChange={(e) => setSandPrice(e.target.value)} placeholder={t('brickWorkAndPlaster.clayBrick.sandPrice')} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 sm:gap-6 mt-10">
                    <Button variant="secondary" onClick={handleReset} className="h-[50px] flex-1 sm:flex-none px-6 sm:px-12 bg-white border-[#E7D7C1] !rounded-2xl text-primary font-medium text-sm sm:text-base">{t('steel.weight.reset')}</Button>
                    <Button variant="primary" onClick={handleCalculate} className="h-[50px] flex-1 sm:flex-none px-6 sm:px-12 !bg-[#B02E0C] text-white !rounded-2xl font-medium text-sm sm:text-base">{t('steel.weight.calculate')}</Button>
                </div>
            </div>

            {showResult && (
                <div className="mt-10 animate-fade-in pb-10">
                    <h2 className="text-2xl font-semibold text-primary mb-6">{t('steel.weight.result')}</h2>
                    <div className="bg-white rounded-xl border border-[#060C121A] overflow-hidden mb-8 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[320px]">
                            <thead>
                                <tr className="bg-[#F7F7F7] border-b border-[#060C120A]">
                                    <th className="px-6 py-4 text-sm font-medium text-primary border-r border-[#060C120A]">{t('concrete.byVolume.material')}</th>
                                    <th className="px-6 py-4 text-sm font-medium text-primary border-r border-[#060C120A]">{t('concrete.byVolume.quantity')}</th>
                                    <th className="px-6 py-4 text-sm font-medium text-primary">{t('concrete.byVolume.unit')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#060C120A]">
                                {[
                                    { material: t('brickWorkAndPlaster.clayBrick.results.volumeOfWall'), quantity: V.toFixed(3), unit: 'm3' },
                                    { material: t('brickWorkAndPlaster.clayBrick.results.noOfBricks'), quantity: noOfBricks.toFixed(3), unit: 'NOS' },
                                    { material: t('brickWorkAndPlaster.clayBrick.results.mortarDryVolume'), quantity: mortarDryVolume.toFixed(3), unit: 'm3' },
                                    { material: t('brickWorkAndPlaster.clayBrick.results.cementBags'), quantity: cementBags.toFixed(3), unit: 'NOS' },
                                    { material: t('brickWorkAndPlaster.clayBrick.results.sandVolume'), quantity: sandVolume.toFixed(3), unit: 'm3' },
                                    { material: t('brickWorkAndPlaster.clayBrick.results.brickCost'), quantity: brickCost.toFixed(3), unit: '₹' },
                                    { material: t('brickWorkAndPlaster.clayBrick.results.cementCost'), quantity: cementCost.toFixed(3), unit: '₹' },
                                    { material: t('brickWorkAndPlaster.clayBrick.results.sandCost'), quantity: sandCost.toFixed(3), unit: '₹' },
                                    { material: t('brickWorkAndPlaster.clayBrick.results.totalCost'), quantity: totalCost.toFixed(3), unit: '₹' },
                                ].map((row, index) => (
                                    <tr key={index} className="hover:bg-[#F9F9F9] transition-colors">
                                        <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{row.material}</td>
                                        <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{row.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-primary">{row.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#FDF9F4] p-4 rounded-2xl flex items-center justify-between border border-[#F5E6D3] h-[58px]">
                            <span className="font-medium text-primary uppercase text-sm tracking-wider">{t('brickWorkAndPlaster.clayBrick.results.totalCost')}</span>
                            <span className="font-bold text-[#B02E0C] text-xl">₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_SHAPES_BY_VOLUME_DETAILED, { state: { calculationData, outputs: detailedOutputs } })}
                            className="!rounded-2xl text-lg font-medium hover:bg-[#B02E0C] transition-all h-[58px]"
                        >
                            {t('steel.weight.viewDetailed')}
                        </Button>
                    </div>
                </div>
            )}

            <DownloadPDFModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                onDownload={handleDownload}
                defaultTitle={t('brickWorkAndPlaster.shapes.byVolumeDetailedTitle')}
                isLoading={isDownloading}
            />
        </div>
    );
};

export default ShapesByVolume;
