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
import kingClosers from '../../../../assets/icons/kingClosers.svg';

const KingCloser = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');

    // Brick Size (mm)
    const [brickL, setBrickL] = useState('');
    const [brickW, setBrickW] = useState('');
    const [brickT, setBrickT] = useState('');

    // Wall Size (m)
    const [wallL, setWallL] = useState('');
    const [wallH, setWallH] = useState('');
    const [joint, setJoint] = useState(''); // in mm

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Calculation Logic
    const L_m = (parseFloat(brickL) || 0) / 1000;
    const W_m = (parseFloat(brickW) || 0) / 1000;
    const T_m = (parseFloat(brickT) || 0) / 1000;
    const J_m = (parseFloat(joint) || 0) / 1000;

    const l = parseFloat(wallL) || 0;
    const h = parseFloat(wallH) || 0;

    // Volume Of Wall = l * h * W_m (using width as thickness for volume if not specified, matching image calc)
    const volumeOfWall = l * h * W_m;

    // No of King Closer = (2 * (h / (T_m + J_m))) 
    // This is the formula in the image 2 text: (2 * (H / (T + j)))
    const noOfKingCloser = (T_m + J_m) > 0 ? (2 * (h / (T_m + J_m))) : 0;

    const handleReset = () => {
        setBrickL(''); setBrickW(''); setBrickT('');
        setWallL(''); setWallH(''); setJoint('');
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
        { labelKey: 'brickWorkAndPlaster.clayBrick.brickLength', symbol: 'L', value: `${brickL || 0} mm` },
        { labelKey: 'brickWorkAndPlaster.clayBrick.brickWidth', symbol: 'W', value: `${brickW || 0} mm` },
        { labelKey: 'brickWorkAndPlaster.clayBrick.brickThickness', symbol: 'T', value: `${brickT || 0} mm` },
        { labelKey: 'brickWorkAndPlaster.clayBrick.wallLength', symbol: 'l', value: `${wallL || 0} m` },
        { labelKey: 'brickWorkAndPlaster.clayBrick.wallHeight', symbol: 'h', value: `${wallH || 0} m` },
        { labelKey: 'brickWorkAndPlaster.bonds.brickToBrickJoint', symbol: 'j', value: `${joint || 0} mm` },
    ];

    const detailedOutputs = [
        {
            titleKey: 'brickWorkAndPlaster.clayBrick.results.volumeOfWall',
            labelKey: 'brickWorkAndPlaster.clayBrick.results.volumeOfWall',
            labelSuffix: ' =',
            formula: '(lXhXw)',
            value: `${volumeOfWall.toFixed(3)} m3`
        },
        {
            titleKey: 'brickWorkAndPlaster.clayBrick.results.noOfKingCloser',
            labelKey: 'brickWorkAndPlaster.clayBrick.results.noOfBricks',
            labelSuffix: ' =',
            formula: '(2 X (h / (T + j)))',
            value: `${noOfKingCloser.toFixed(3)} NOS`
        }
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('brickWorkAndPlaster.bonds.kingCloserTitle')}
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
                        <img src={kingClosers} alt={t('brickWorkAndPlaster.bonds.kingCloserTitle')} className="object-contain" />
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                            <InputField unit="m" value={wallL} onChange={(e) => setWallL(e.target.value)} placeholder={t('brickWorkAndPlaster.clayBrick.wallLength')} />
                            <InputField unit="m" value={wallH} onChange={(e) => setWallH(e.target.value)} placeholder={t('brickWorkAndPlaster.clayBrick.wallHeight')} />
                            <div className="col-span-2 md:col-span-1">
                                <InputField unit="mm" value={joint} onChange={(e) => setJoint(e.target.value)} placeholder={t('brickWorkAndPlaster.bonds.brickToBrickJoint')} />
                            </div>
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
                                    { material: t('brickWorkAndPlaster.clayBrick.results.volumeOfWall'), quantity: volumeOfWall.toFixed(3), unit: 'm3' },
                                    { material: t('brickWorkAndPlaster.clayBrick.results.noOfKingCloser'), quantity: noOfKingCloser.toFixed(3), unit: 'NOS' },
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
                    <div className="flex justify-end">
                        <Button variant="primary" onClick={() => navigate(ROUTES_FLAT.CALCULATION_KING_CLOSER_DETAILED, { state: { calculationData, outputs: detailedOutputs } })} className="!rounded-2xl hover:bg-[#B02E0C] transition-all h-[50px]  !px-8">{t('steel.weight.viewDetailed')}</Button>
                    </div>
                </div>
            )}

            <DownloadPDFModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                onDownload={handleDownload}
                defaultTitle={t('brickWorkAndPlaster.bonds.kingCloserDetailedTitle')}
                isLoading={isDownloading}
            />
        </div>
    );
};

export default KingCloser;
