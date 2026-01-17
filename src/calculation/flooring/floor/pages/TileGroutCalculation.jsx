import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import { ROUTES_FLAT } from '../../../../constants/routes';
import InputField from '../../../common/InputField';
import DownloadPDFModal from '../../../common/DownloadPDFModal';

// Import the specific icon
import tileGroutIllustration from '../../../../assets/icons/tileGrouts.svg';

const TileGroutCalculation = () => {
    const navigate = useNavigate();
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Inputs
    const [roomLength, setRoomLength] = useState('');
    const [roomWidth, setRoomWidth] = useState('');
    const [tileLength, setTileLength] = useState('');
    const [tileWidth, setTileWidth] = useState('');
    const [gapWidth, setGapWidth] = useState('');
    const [gapDepth, setGapDepth] = useState('');
    const [weightPerBag, setWeightPerBag] = useState('');

    const [showResult, setShowResult] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Results state
    const [results, setResults] = useState({
        totalRoomArea: 0,
        noOfTiles: 0,
        groutVolume: 0,
        groutBags: 0
    });

    const handleCalculate = () => {
        const L = parseFloat(roomLength) || 0;
        const W = parseFloat(roomWidth) || 0;
        const l = parseFloat(tileLength) || 0;
        const w = parseFloat(tileWidth) || 0;
        const t = parseFloat(gapWidth) || 0;
        const d = parseFloat(gapDepth) || 0;
        const K = parseFloat(weightPerBag) || 0;

        // Formula from image
        // Convert mm inputs to meters for calculation
        const L_m = L / 1000;
        const W_m = W / 1000;
        const l_m = l / 1000;
        const w_m = w / 1000;
        const t_m = t / 1000;
        const d_m = d / 1000;

        const area = L_m * W_m;
        const tilesCount = area / ((w_m + t_m) * (l_m + t_m));
        const volume = (area - (tilesCount * l_m * w_m)) * d_m;
        const weight = volume * 1600; // Density from formula X1600

        setResults({
            totalRoomArea: area,
            noOfTiles: tilesCount,
            groutVolume: volume,
            groutBags: weight
        });
        setShowResult(true);
    };

    const handleReset = () => {
        setRoomLength('');
        setRoomWidth('');
        setTileLength('');
        setTileWidth('');
        setGapWidth('');
        setGapDepth('');
        setWeightPerBag('');
        setShowResult(false);
    };

    const handleDownload = async (title) => {
        setIsDownloading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
        } finally {
            setIsDownloading(false);
            setIsDownloadModalOpen(false);
        }
    };

    const calculationData = [
        { name: 'Room Length', symbol: 'L', value: `${(parseFloat(roomLength) / 1000).toFixed(3)} m` },
        { name: 'Room Width', symbol: 'W', value: `${(parseFloat(roomWidth) / 1000).toFixed(3)} m` },
        { name: 'Tile Length', symbol: 'l', value: `${(parseFloat(tileLength) / 1000).toFixed(3)} m` },
        { name: 'Tile Width', symbol: 'w', value: `${(parseFloat(tileWidth) / 1000).toFixed(3)} m` },
        { name: 'Gap Width', symbol: 't', value: `${gapWidth} mm` },
        { name: 'Gap Depth', symbol: 'd', value: `${gapDepth} mm` },
        { name: 'Weight Per Bag', symbol: 'K', value: `${weightPerBag} KG` },
    ];

    const detailedOutputs = [
        {
            title: 'Total Room Area',
            label: 'Total Room Area',
            labelSuffix: ' =',
            formula: 'LXW',
            value: results.totalRoomArea.toFixed(3),
            unit: 'sq.m.'
        },
        {
            title: 'No Of Tiles',
            label: 'No Of Tiles',
            labelSuffix: ' =',
            formula: '(LXW)/((w+t/1000)X(l+t/1000))',
            value: results.noOfTiles.toFixed(3),
            unit: 'NOS'
        },
        {
            title: 'Grout Volume',
            label: 'Grout Volume',
            labelSuffix: ' =',
            formula: '(LXW-(((LXW)/((w+t/1000)X(l+t/1000)))XlXw))Xd/1000',
            value: results.groutVolume.toFixed(3),
            unit: 'm3'
        },
        {
            title: 'Grout Bags',
            label: 'Grout Bags',
            labelSuffix: ' =',
            formula: '(LXW-(((LXW)/((w+t/1000)X(l+t/1000)))XlXw))Xd/1000X1600',
            value: results.groutBags.toFixed(3),
            unit: 'Bags'
        }
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title="Tile Grout Calculation"
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
                        <img src={tileGroutIllustration} alt="Tile Grout Diagram" className="object-contain" />
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
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4 w-full">
                        <InputField
                            unit="mm"
                            value={roomLength}
                            onChange={(e) => setRoomLength(e.target.value)}
                            placeholder="Room length"
                        />
                        <InputField
                            unit="mm"
                            value={roomWidth}
                            onChange={(e) => setRoomWidth(e.target.value)}
                            placeholder="Room width"
                        />
                        <InputField
                            unit="mm"
                            value={tileLength}
                            onChange={(e) => setTileLength(e.target.value)}
                            placeholder="Tile length"
                        />
                        <InputField
                            unit="mm"
                            value={tileWidth}
                            onChange={(e) => setTileWidth(e.target.value)}
                            placeholder="Tile width"
                        />
                        <InputField
                            unit="mm"
                            value={gapWidth}
                            onChange={(e) => setGapWidth(e.target.value)}
                            placeholder="Gap width"
                        />
                        <InputField
                            unit="mm"
                            value={gapDepth}
                            onChange={(e) => setGapDepth(e.target.value)}
                            placeholder="Gap depth"
                        />
                    </div>
                    <InputField
                        suffix="KG"
                        value={weightPerBag}
                        onChange={(e) => setWeightPerBag(e.target.value)}
                        placeholder="Weights per bag"
                    />

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
                                    { material: 'Total Room Area', quantity: results.totalRoomArea.toFixed(3), unit: 'sq.m.' },
                                    { material: 'No of Tiles', quantity: results.noOfTiles.toFixed(3), unit: 'NOS' },
                                    { material: 'Grout Volume', quantity: results.groutVolume.toFixed(3), unit: 'm3' },
                                    { material: 'Grout Bags', quantity: results.groutBags.toFixed(3), unit: 'Bags' },
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
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_FLOORING_TILE_GROUT_DETAILED, {
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
                defaultTitle="Tile Grout Detailed Report"
                isLoading={isDownloading}
            />
        </div>
    );
};

export default TileGroutCalculation;
