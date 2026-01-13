import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, ChevronDown } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import colsRingType1 from '../../../../assets/icons/colsRingType1.svg';
import InputField from '../../../common/InputField';

const ColumnRingType1 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // State for input fields
    const [columnSizeX, setColumnSizeX] = useState('');
    const [heightH, setHeightH] = useState('');
    const [ringDiameterR, setRingDiameterR] = useState('');
    const [stirrupsSpacingS, setStirrupsSpacingS] = useState('');
    const [noOfColumnsN, setNoOfColumnsN] = useState('');
    // const [steelRate, setSteelRate] = useState(''); // Not shown in Image 1, but typical for steel calc. Image 2 shows "Total Cost", so we likely need rate. Wait, Image 1 doesn't show Rate input.
    // However, Image 2 shows "Total Cost ₹1816.120". So we MUST have a rate input or a hidden default.
    // Looking at previous patterns, 'steel.column.price' is usually there.
    // But specific request says "as per first image input field add karo". First image does NOT show Rate input.
    // BUT second image definitely shows Total Cost.
    // I will add the Rate input but maybe keep it at the bottom or assume the user wants it.
    // Actually, usually these forms have a rate input. Maybe it's scrolled down in the screenshot?
    // I'll add it for completeness because "Total Cost" is required in result.

    const [steelRate, setSteelRate] = useState('');

    const [showResult, setShowResult] = useState(false);



    // Calculation Logic
    const X = parseFloat(columnSizeX) || 0;
    const H = parseFloat(heightH) || 0;
    const R = parseFloat(ringDiameterR) || 0;
    const S = parseFloat(stirrupsSpacingS) || 0;
    const n = parseFloat(noOfColumnsN) || 0;
    const rate = parseFloat(steelRate) || 0;

    // Formula from Image 3: Stirrups = ((4X(X-80)+20XR)/1000)X((1000XH/S)+1)X(RXR/162.28)Xn
    // Interpretation:
    // (4*(X-80) + 20*R)/1000  -> Cutting length in meters? (X in mm so X-80 is mm. + 20*R mm. /1000 -> m)
    // (1000*H/S + 1) -> Number of stirrups. H is in m, S is in mm. So 1000*H converts H to mm. /S + 1. Correct.
    // (R*R/162.28) -> Unit weight (kg/m).
    // n -> Number of columns.

    // Let's implement this exactly.
    const term1 = ((4 * (X - 80)) + (20 * R)) / 1000;
    const term2 = S > 0 ? ((1000 * H) / S) + 1 : 0;
    const term3 = (R * R) / 162.28;

    const stirrupsWeight = term1 * term2 * term3 * n;
    const totalCost = stirrupsWeight * rate;

    const handleReset = () => {
        setColumnSizeX('');
        setHeightH('');
        setRingDiameterR('');
        setStirrupsSpacingS('');
        setNoOfColumnsN('');
        setSteelRate('');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };



    const calculationData = [
        { labelKey: 'steel.column.ringDiameterR', labelSuffix: '', name: t('steel.column.ringDiameterR'), symbol: 'R', value: `${ringDiameterR} mm` },
        { labelKey: 'steel.column.columnSizeX', labelSuffix: '', name: t('steel.column.columnSizeX'), symbol: 'X', value: `${columnSizeX} mm` },
        { labelKey: 'steel.column.columnHeightH', labelSuffix: '', name: t('steel.column.columnHeightH'), symbol: 'H', value: `${heightH} m` },
        { labelKey: 'steel.column.stirrupsSpacingS', labelSuffix: '', name: t('steel.column.stirrupsSpacingS'), symbol: 'S', value: `${stirrupsSpacingS} mm` },
        { labelKey: 'steel.column.noOfColumn', labelSuffix: ' - n', name: t('steel.column.noOfColumn'), symbol: 'n', value: `${noOfColumnsN} NOS` },
    ];

    const calculationOutputs = [
        {
            titleKey: 'steel.column.stirrups', // Or generic 'Stirrups'
            labelKey: 'steel.column.stirrups',
            labelSuffix: ' =',
            formula: '((4X(X-80)+20XR)/1000)X((1000XH/S)+1)X(RXR/162.28)Xn',
            value: `${stirrupsWeight.toFixed(3)} KG`
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.column.ring1')}
                    showBackButton
                    onBack={() => navigate(-1)}
                >
                    <div className="flex gap-4 items-center">
                        <Button
                            variant="secondary"
                            className="bg-white border-[#E0E0E0] rounded-xl text-secondary !px-2 sm:!px-4 py-2"
                            leftIcon={<Download className="w-4 h-4 text-secondary" />}
                        >
                            <span className="text-sm font-medium">{t('history.downloadReport')}</span>
                        </Button>
                    </div>
                </PageHeader>
            </div>

            {/* Content Card */}
            <div className="bg-[#F9F4EE] rounded-3xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-4 sm:gap-10 pb-6 border-b border-[#060C120A]">
                    <div className="flex items-center justify-center">
                        <img src={colsRingType1} alt="Column Ring Type 1 Diagram" className="w-full h-full object-contain" />
                    </div>

                    <div className="flex flex-col gap-4">
                        <Radio
                            label={t('steel.weight.metric')}
                            name="unitType"
                            value="metric"
                            checked={unitType === 'metric'}
                            onChange={() => setUnitType('metric')}
                            className="text-base sm:text-lg"
                        />
                        <Radio
                            label={t('steel.weight.imperial')}
                            name="unitType"
                            value="imperial"
                            checked={unitType === 'imperial'}
                            onChange={() => setUnitType('imperial')}
                            className="text-base sm:text-lg"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    {/* Column Size */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.columnSize')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={columnSizeX}
                                onChange={(e) => setColumnSizeX(e.target.value)}
                                placeholder={t('steel.column.columnSizeX')}
                            />
                            <InputField
                                unit="m"
                                value={heightH}
                                onChange={(e) => setHeightH(e.target.value)}
                                placeholder={t('steel.column.columnHeightH')}
                            />
                        </div>
                    </div>

                    {/* Ring Details */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.ringDetails')}</h3>
                        <div className="grid gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={ringDiameterR}
                                onChange={(e) => setRingDiameterR(e.target.value)}
                                placeholder={t('steel.column.ringDiameterR')}
                            />
                        </div>
                    </div>

                    {/* Stirrups Details */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.stirrupsDetails')}</h3>
                        <div className="grid gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={stirrupsSpacingS}
                                onChange={(e) => setStirrupsSpacingS(e.target.value)}
                                placeholder={t('steel.column.stirrupsSpacingS')}
                            />
                        </div>
                    </div>

                    {/* No of Columns */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.noOfColumns')}</h3>
                        <InputField
                            value={noOfColumnsN}
                            onChange={(e) => setNoOfColumnsN(e.target.value)}
                            placeholder={t('steel.column.noOfColumn')}
                            suffix="NOS"
                        />
                    </div>

                    {/* Price Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.weight.price')}</h3>
                        <InputField
                            value={steelRate}
                            onChange={(e) => setSteelRate(e.target.value)}
                            placeholder={t('steel.column.steelRate')}
                            suffix="₹/Kg"
                        />
                    </div>

                </div>

                <div className="flex justify-end gap-3 sm:gap-6 mt-8">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        className="h-[50px] sm:h-[58px] flex-1 sm:flex-none px-6 sm:px-12 bg-white border-[#E7D7C1] !rounded-2xl text-primary font-medium"
                    >
                        {t('steel.weight.reset')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCalculate}
                        className="h-[50px] sm:h-[58px] flex-1 sm:flex-none px-6 sm:px-12 !bg-[#B02E0C] text-white !rounded-2xl font-medium"
                    >
                        {t('steel.weight.calculate')}
                    </Button>
                </div>
            </div>

            {showResult && (
                <div className="mt-10 animate-fade-in pb-10 px-4">
                    <h2 className="text-2xl font-semibold text-primary mb-6">{t('steel.weight.result')}</h2>

                    {/* Result Table */}
                    <div className="bg-white rounded-xl border border-[#060C121A] overflow-hidden mb-8 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[320px]">
                            <thead>
                                <tr className="bg-[#F7F7F7] border-b border-[#060C120A]">
                                    <th className="px-6 py-4 text-sm font-medium text-primary border-r border-[#060C120A]">{t('history.headers.material')}</th>
                                    <th className="px-6 py-4 text-sm font-medium text-primary border-r border-[#060C120A]">{t('history.headers.quantity')}</th>
                                    <th className="px-6 py-4 text-sm font-medium text-primary last:border-r-0">{t('history.headers.unit')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#060C120A]">
                                {[
                                    { material: t('steel.column.stirrups'), quantity: stirrupsWeight.toFixed(3), unit: 'Kg' },
                                ].map((row, index) => (
                                    <tr key={index} className="hover:bg-[#F9F9F9] transition-colors">
                                        <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{row.material}</td>
                                        <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{row.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-primary last:border-r-0">{row.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#FDF9F4] p-4 rounded-2xl flex items-center justify-between border border-[#F5E6D3] h-[58px]">
                            <span className="font-medium text-primary uppercase text-sm tracking-wider">{t('steel.weight.totalCost')}</span>
                            <span className="font-bold text-accent text-xl">₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_COLUMN_RING_TYPE1_DETAILED, {
                                state: {
                                    calculationData,
                                    outputs: calculationOutputs
                                }
                            })}
                            className="!rounded-2xl text-lg font-medium hover:bg-[#B02E0C] h-[58px]"
                        >
                            {t('steel.weight.viewDetailed')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColumnRingType1;
