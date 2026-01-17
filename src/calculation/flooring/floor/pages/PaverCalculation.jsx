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
import paverIllustration from '../../../../assets/icons/paverCalculations.svg';

const PaverCalculation = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Inputs
    const [surfaceLength, setSurfaceLength] = useState('');
    const [surfaceWidth, setSurfaceWidth] = useState('');
    const [paverLength, setPaverLength] = useState('');
    const [paverWidth, setPaverWidth] = useState('');
    const [paverPrice, setPaverPrice] = useState('');
    const [installationCost, setInstallationCost] = useState('');

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Results state
    const [results, setResults] = useState({
        surfaceArea: 0,
        noOfPavers: 0,
        paverCost: 0,
        totalInstallationCost: 0,
        totalExpenses: 0
    });

    const handleCalculate = () => {
        const L = parseFloat(surfaceLength) || 0;
        const W = parseFloat(surfaceWidth) || 0;
        const l = parseFloat(paverLength) || 0;
        const w = parseFloat(paverWidth) || 0;
        const R = parseFloat(paverPrice) || 0;
        const I = parseFloat(installationCost) || 0;

        // Conversion from mm to meters for area calc if unit is mm
        // Image suggests L and W are mm in dropdown
        const L_m = L / 1000;
        const W_m = W / 1000;
        const l_m = l / 1000;
        const w_m = w / 1000;

        const area = L_m * W_m;
        const paverArea = l_m * w_m;
        const count = paverArea > 0 ? area / paverArea : 0;
        const pCost = count * R;
        const iCost = area * I;
        const total = pCost + iCost;

        setResults({
            surfaceArea: area,
            noOfPavers: count,
            paverCost: pCost,
            totalInstallationCost: iCost,
            totalExpenses: total
        });
        setShowResult(true);
    };

    const handleReset = () => {
        setSurfaceLength('');
        setSurfaceWidth('');
        setPaverLength('');
        setPaverWidth('');
        setPaverPrice('');
        setInstallationCost('');
        setShowResult(false);
    };

    const handleDownload = async (title) => {
        setIsDownloading(true);
        try {
            // PDF generation logic would go here
            await new Promise(resolve => setTimeout(resolve, 1500));
        } finally {
            setIsDownloading(false);
            setIsDownloadModalOpen(false);
        }
    };

    const calculationData = [
        { name: 'Surface Length', symbol: 'L', value: `${(parseFloat(surfaceLength) / 1000).toFixed(3)} m` },
        { name: 'Surface Width', symbol: 'W', value: `${(parseFloat(surfaceWidth) / 1000).toFixed(3)} m` },
        { name: 'Paver Length', symbol: 'l', value: `${(parseFloat(paverLength) / 1000).toFixed(3)} m` },
        { name: 'Paver Width', symbol: 'w', value: `${(parseFloat(paverWidth) / 1000).toFixed(3)} m` },
        { name: 'Paver Price', symbol: 'R', value: `${paverPrice} Currency pr Unit` },
        { name: 'Installation Cost', symbol: 'I', value: `${installationCost} Currency pr Sq.m.` },
    ];

    const detailedOutputs = [
        {
            title: 'Surface Area',
            label: 'Surface Area',
            labelSuffix: ' =',
            formula: 'LXW',
            value: results.surfaceArea.toFixed(3),
            unit: 'sq.m.'
        },
        {
            title: 'Number of Pavers',
            label: 'Number of Pavers',
            labelSuffix: ' =',
            formula: '(LXW)/(lXw)',
            value: results.noOfPavers.toFixed(3),
            unit: 'NOS'
        },
        {
            title: 'Paver Cost',
            label: 'Paver Cost',
            labelSuffix: ' =',
            formula: '((LXW)/(lXw))XR',
            value: results.paverCost.toFixed(3),
            unit: '₹'
        },
        {
            title: 'Total Installation Cost',
            label: 'Total Installation Cost',
            labelSuffix: ' =',
            formula: 'LXWXI',
            value: results.totalInstallationCost.toFixed(3),
            unit: '₹'
        },
        {
            title: 'Total Expenses',
            label: 'Total Expenses',
            labelSuffix: ' =',
            formula: '((LXW)/(lXw))XR+LXWXI',
            value: results.totalExpenses.toFixed(3),
            unit: '₹'
        }
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title="Paver Calculation"
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
                            <span className="text-sm font-medium">Download Report</span>
                        </Button>
                    </div>
                </PageHeader>
            </div>

            {/* Content Card */}
            <div className="bg-[#F9F4EE] rounded-3xl p-4 sm:p-6">
                <div className="flex items-center gap-4 sm:gap-10 pb-6 border-b border-[#060C120A]">
                    {/* Icon Box */}
                    <div className="flex items-center justify-center">
                        <img src={paverIllustration} alt="Paver Diagram" className="object-contain" />
                    </div>

                    {/* Radio Group */}
                    <div className="flex flex-col gap-4">
                        <Radio
                            label="Metric"
                            name="unitType"
                            value="metric"
                            checked={unitType === 'metric'}
                            onChange={() => setUnitType('metric')}
                            className="text-base sm:text-lg"
                        />
                        <Radio
                            label="Imperial"
                            name="unitType"
                            value="imperial"
                            checked={unitType === 'imperial'}
                            onChange={() => setUnitType('imperial')}
                            className="text-base sm:text-lg"
                        />
                    </div>
                </div>

                {/* Form Sections */}
                <div className="pt-6 flex justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <InputField
                            unit="mm"
                            value={surfaceLength}
                            onChange={(e) => setSurfaceLength(e.target.value)}
                            placeholder="Surface Length (L)"
                        />
                        <InputField
                            unit="mm"
                            value={surfaceWidth}
                            onChange={(e) => setSurfaceWidth(e.target.value)}
                            placeholder="Surface Width (W)"
                        />
                        <InputField
                            unit="mm"
                            value={paverLength}
                            onChange={(e) => setPaverLength(e.target.value)}
                            placeholder="Paver Length (l)"
                        />
                        <InputField
                            unit="mm"
                            value={paverWidth}
                            onChange={(e) => setPaverWidth(e.target.value)}
                            placeholder="Paver Width (w)"
                        />
                        <InputField
                            suffix="₹/Unit"
                            value={paverPrice}
                            onChange={(e) => setPaverPrice(e.target.value)}
                            placeholder="Paver Price (R)"
                        />
                        <InputField
                            suffix="₹/sq.m."
                            value={installationCost}
                            onChange={(e) => setInstallationCost(e.target.value)}
                            placeholder="Installation Cost (I)"
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
                        Reset
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCalculate}
                        className="h-[50px] flex-1 sm:flex-none px-6 sm:px-12 !bg-[#B02E0C] text-white !rounded-2xl font-medium text-sm sm:text-base"
                    >
                        Calculate
                    </Button>
                </div>
            </div>

            {/* Result Section */}
            {showResult && (
                <div className="mt-10 animate-fade-in pb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-primary">Result</h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[#060C121A] mb-8">
                        <button
                            onClick={() => setUnitType('metric')}
                            className={`px-12 py-3 border-b-2 transition-all cursor-pointer font-medium ${unitType === 'metric' ? 'border-[#B02E0C] text-[#B02E0C]' : 'border-transparent text-secondary'}`}
                        >
                            Metric
                        </button>
                        <button
                            onClick={() => setUnitType('imperial')}
                            className={`px-12 py-3 border-b-2 transition-all cursor-pointer font-medium ${unitType === 'imperial' ? 'border-[#B02E0C] text-[#B02E0C]' : 'border-transparent text-secondary'}`}
                        >
                            Imperial
                        </button>
                    </div>

                    {/* Result Table */}
                    <div className="bg-white rounded-xl border border-[#060C121A] overflow-hidden mb-8 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[320px]">
                            <thead>
                                <tr className="bg-[#F7F7F7] border-b border-[#060C120A]">
                                    <th className="px-6 py-4 text-sm font-medium text-primary border-r border-[#060C120A]">Material</th>
                                    <th className="px-6 py-4 text-sm font-medium text-primary border-r border-[#060C120A]">Quantity</th>
                                    <th className="px-6 py-4 text-sm font-medium text-primary">Unit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#060C120A]">
                                {[
                                    { material: 'Surface Area', quantity: results.surfaceArea.toFixed(3), unit: 'sq.m.' },
                                    { material: 'Number of Pavers', quantity: results.noOfPavers.toFixed(3), unit: 'NOS' },
                                    { material: 'Paver Cost', quantity: results.paverCost.toFixed(3), unit: '₹' },
                                    { material: 'Total Installation Cost', quantity: results.totalInstallationCost.toFixed(3), unit: '₹' },
                                    { material: 'Total Expenses', quantity: results.totalExpenses.toFixed(3), unit: '₹' },
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

                    {/* Bottom Actions */}
                    <div className="flex justify-end">
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_FLOORING_PAVER_DETAILED, {
                                state: {
                                    calculationData,
                                    outputs: detailedOutputs
                                }
                            })}
                            className="!rounded-2xl text-lg font-medium hover:bg-[#B02E0C] transition-all h-[50px]"
                        >
                            View Detailed Result
                        </Button>
                    </div>
                </div>
            )}

            <DownloadPDFModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                onDownload={handleDownload}
                defaultTitle="Paver Detailed Report"
                isLoading={isDownloading}
            />
        </div>
    );
};

export default PaverCalculation;
