import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Share2, Download, ChevronDown, History as HistoryIcon } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import colType4 from '../../../../assets/icons/colsType4.svg';
import InputField from '../../../common/InputField';

const ColumnType4 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Column Size
    const [sideX, setSideX] = useState('');
    const [sideY, setSideY] = useState('');
    const [height, setHeight] = useState('');

    // Bar Details
    const [diameterD1, setDiameterD1] = useState('');
    const [diameterD2, setDiameterD2] = useState('');

    // Ring Details
    const [ringDiameterR1, setRingDiameterR1] = useState('');
    const [ringDiameterR2, setRingDiameterR2] = useState('');
    const [ringDiameterR3, setRingDiameterR3] = useState('');

    // Stirrups Details
    const [spacingS, setSpacingS] = useState('');

    // Additional Details
    const [noOfColumns, setNoOfColumns] = useState('');
    const [steelRate, setSteelRate] = useState('');

    const [showResult, setShowResult] = useState(false);

    // Calculation Logic
    const X = parseFloat(sideX) || 0;
    const Y = parseFloat(sideY) || 0;
    const H = parseFloat(height) || 0;
    const H_mm = H * 1000;

    const D1 = parseFloat(diameterD1) || 0;
    const D2 = parseFloat(diameterD2) || 0;
    const R1 = parseFloat(ringDiameterR1) || 0;
    const R2 = parseFloat(ringDiameterR2) || 0;
    const R3 = parseFloat(ringDiameterR3) || 0;
    const s = parseFloat(spacingS) || 0;
    const nColumns = parseFloat(noOfColumns) || 0;
    const r = parseFloat(steelRate) || 0;

    // Formulas based on Image 4
    // Volume
    const colVolume = (X * Y * H_mm * nColumns) / 1000000000;

    // Vertical Steel (D1) - Formula: 4*D1*D1*H*N/162.28 
    const weightD1 = (4 * D1 * D1 * H * nColumns) / 162.28;

    // Vertical Steel (D2) - Formula: 6*D2*D2*H*N/162.28 (6 bars as per image output)
    const weightD2 = (6 * D2 * D2 * H * nColumns) / 162.28;

    // Stirrups (R1)
    // Formula: ((2*(X-80)+2*(Y-80)+20*R1)/1000)*(((1000*H/S)+1)*(R1*R1)/162.28)*N
    const cuttingLengthR1 = (2 * (X - 80) + 2 * (Y - 80) + 20 * R1) / 1000;
    const numStirrups = s > 0 ? (H_mm / s) + 1 : 0;
    const weightPerR1 = (R1 * R1) / 162.28;
    const stirrupWeightR1 = cuttingLengthR1 * numStirrups * weightPerR1 * nColumns;

    // Stirrups (R2)
    // Formula: ((((2*(X-80))/3)+2*(Y-80)+20*R2)/1000)*(((1000*H/S)+1)*(R2*R2)/162.28)*N
    const cuttingLengthR2 = (((2 * (X - 80)) / 3) + 2 * (Y - 80) + 20 * R2) / 1000;
    const weightPerR2 = (R2 * R2) / 162.28;
    const stirrupWeightR2 = cuttingLengthR2 * numStirrups * weightPerR2 * nColumns;

    // Stirrups (R3)
    // Formula: (((Y-80)+20*R3)/1000)*(((1000*H/S)+1)*(R3*R3)/162.28)*N
    // Note: Formula string in image seems to be '(((Y-80)+20XR3)/1000)X((1000XH/S)+1)X(R3XR3/162.28)Xn'
    // This looks like a single link or similar.
    const cuttingLengthR3 = ((Y - 80) + 20 * R3) / 1000;
    const weightPerR3 = (R3 * R3) / 162.28;
    const stirrupWeightR3 = cuttingLengthR3 * numStirrups * weightPerR3 * nColumns;

    const totalSteel = weightD1 + weightD2 + stirrupWeightR1 + stirrupWeightR2 + stirrupWeightR3;
    const totalPrice = totalSteel * r;

    const handleReset = () => {
        setSideX('');
        setSideY('');
        setHeight('');
        setDiameterD1('');
        setDiameterD2('');
        setRingDiameterR1('');
        setRingDiameterR2('');
        setRingDiameterR3('');
        setSpacingS('');
        setNoOfColumns('');
        setSteelRate('');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };



    const calculationData = [
        { labelKey: 'steel.column.sideX', name: t('steel.column.sideX'), symbol: 'X', value: `${sideX} mm` },
        { labelKey: 'steel.column.sideY', name: t('steel.column.sideY'), symbol: 'Y', value: `${sideY} mm` },
        { labelKey: 'steel.column.columnHeight', name: t('steel.column.columnHeight') + " H", symbol: 'H', value: `${height} mm` },
        { labelKey: 'steel.column.diameter', labelSuffix: ' D1', name: t('steel.column.diameter') + " D1", symbol: 'D1', value: `${diameterD1} mm` },
        { labelKey: 'steel.column.diameter', labelSuffix: ' D2', name: t('steel.column.diameter') + " D2", symbol: 'D2', value: `${diameterD2} mm` },
        { labelKey: 'steel.column.ringDiameter', labelSuffix: ' R1', name: t('steel.column.ringDiameter') + " R1", symbol: 'R1', value: `${ringDiameterR1} mm` },
        { labelKey: 'steel.column.ringDiameter', labelSuffix: ' R2', name: t('steel.column.ringDiameter') + " R2", symbol: 'R2', value: `${ringDiameterR2} mm` },
        { labelKey: 'steel.column.ringDiameter', labelSuffix: ' R3', name: t('steel.column.ringDiameter') + " R3", symbol: 'R3', value: `${ringDiameterR3} mm` },
        { labelKey: 'steel.column.spacing', labelSuffix: ' S', name: t('steel.column.spacing') + " S", symbol: 'S', value: `${spacingS} mm` },
        { labelKey: 'steel.column.noOfColumns', labelSuffix: ' - N', name: t('steel.column.noOfColumns') + " - N", symbol: 'N', value: `${noOfColumns} NOS` },
        { labelKey: 'steel.column.steelRate', labelSuffix: ' r', name: t('steel.column.steelRate'), symbol: 'r', value: `₹ ${steelRate} / kg` },
    ];

    const calculationOutputs = [
        {
            titleKey: 'steel.column.volume',
            labelKey: 'steel.column.volume',
            labelSuffix: ':',
            formula: 'XXYXHXN/1000000',
            value: `${colVolume.toFixed(3)} m3`
        },
        {
            titleKey: 'steel.column.vertical',
            titleSuffix: '(D1)',
            labelKey: 'steel.column.vertical',
            labelSuffix: '(D1) =',
            formula: '4XD1XD1XHXN/162.28',
            value: `${weightD1.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.column.vertical',
            titleSuffix: '(D2)',
            labelKey: 'steel.column.vertical',
            labelSuffix: '(D2) =',
            formula: '6XD2XD2XHXN/162.28',
            value: `${weightD2.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.column.stirrups',
            titleSuffix: '(R1)',
            labelKey: 'steel.column.stirrups',
            labelSuffix: '(R1) =',
            formula: '((2X(X-80)+2X(Y-80)+20XR1)/1000)X(((1000XH/S)+1)X(R1XR1)/162.28)Xn',
            value: `${stirrupWeightR1.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.column.stirrups',
            titleSuffix: '(R2)',
            labelKey: 'steel.column.stirrups',
            labelSuffix: '(R2) =',
            formula: '((((2X(X-80)/3)+2X(Y-80)+20XR2)/1000)X(((1000XH/S)+1)X(R2XR2)/162.28)Xn',
            value: `${stirrupWeightR2.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.column.stirrups',
            titleSuffix: '(R3)',
            labelKey: 'steel.column.stirrups',
            labelSuffix: '(R3) =',
            formula: '(((Y-80)+20XR3)/1000)X((1000XH/S)+1)X(R3XR3/162.28)Xn',
            value: `${stirrupWeightR3.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.weight.totalSteel',
            labelKey: 'steel.weight.totalSteel',
            labelSuffix: ' =',
            formula: '(((Y-80)+20XR3)/1000)X((1000XH/S)+1)X(R3XR3/162.28)Xn+(4XD1XD1XHXn/162.28)+(6XD2XD2XHXn/162.28)+(((2X(X-80)+2X(Y-80)+20XR1)/1000)X(((1000XH/S)+1)X(R1XR1)/162.28)Xn)+((((2X(X-80)/3)+2X(Y-80)+20XR2)/1000)X(((1000XH/S)+1)X(R2XR2)/162.28)Xn)',
            value: `${totalSteel.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.weight.totalPrice',
            labelKey: 'steel.weight.totalPrice',
            labelSuffix: ' =',
            formula: '(((((Y-80)+20XR3)/ 1000)X((1000XH/S)+1)X(R3XR3/162.28)Xn)+(4XD1XD1XHXn/162.28)+(6XD2XD2XHXn/162.28)+(((2X(X-80)+2X(Y-80)+20XR1)/ 1000)X(((1000XH/S)+1)X(R1XR1/162.28)Xn)+((((2X(X-80)/3)+2X(Y-80)+20XR2)/ 1000)X(((1000XH/S)+1)X(R2XR2/ 162.28)Xn))Xr',
            value: `₹ ${totalPrice.toFixed(3)}`
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.column.type4')}
                    showBackButton
                    onBack={() => navigate(-1)}
                >
                    <div className="flex gap-4 items-center">
                        <Button
                            variant="secondary"
                            onClick={() => console.log('Download')}
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
                        <img src={colType4} alt="Column Type 4 Diagram" className="w-full h-full object-contain" />
                    </div>

                    {/* Radio Group */}
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

                {/* Form Sections */}
                <div className="space-y-4 pt-4">
                    {/* Column Size Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.size')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={sideX}
                                onChange={(e) => setSideX(e.target.value)}
                                placeholder={t('steel.column.sideX')}
                            />
                            <InputField
                                unit="mm"
                                value={sideY}
                                onChange={(e) => setSideY(e.target.value)}
                                placeholder={t('steel.column.sideY')}
                            />
                            <div className="col-span-2 md:col-span-1">
                                <InputField
                                    unit="m"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    placeholder={t('steel.column.columnHeight') + " - H"}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bar Details Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.footing.barDetails')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={diameterD1}
                                onChange={(e) => setDiameterD1(e.target.value)}
                                placeholder={t('steel.column.diameter') + " D1"}
                            />
                            <InputField
                                unit="mm"
                                value={diameterD2}
                                onChange={(e) => setDiameterD2(e.target.value)}
                                placeholder={t('steel.column.diameter') + " D2"}
                            />
                        </div>
                    </div>

                    {/* Ring Details Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.ringDetails')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={ringDiameterR1}
                                onChange={(e) => setRingDiameterR1(e.target.value)}
                                placeholder={t('steel.column.ringDiameterR1')}
                            />
                            <InputField
                                unit="mm"
                                value={ringDiameterR2}
                                onChange={(e) => setRingDiameterR2(e.target.value)}
                                placeholder={t('steel.column.ringDiameterR2')}
                            />
                            <div className="col-span-2 md:col-span-1">
                                <InputField
                                    unit="mm"
                                    value={ringDiameterR3}
                                    onChange={(e) => setRingDiameterR3(e.target.value)}
                                    placeholder={t('steel.column.ringDiameterR3')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stirrups Details Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.stirrupsDetails')}</h3>
                        <div className="grid gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={spacingS}
                                onChange={(e) => setSpacingS(e.target.value)}
                                placeholder={t('steel.column.spacing') + " - s"}
                            />
                        </div>
                    </div>

                    {/* Number of Columns Section */}
                    <div className="space-y-3 pt-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.noOfColumns') + " - N"}</h3>
                        <InputField
                            value={noOfColumns}
                            onChange={(e) => setNoOfColumns(e.target.value)}
                            placeholder={t('steel.weight.wastagePlaceholder')}
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

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 sm:gap-6 mt-8">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        className="h-[50px] sm:h-[58px] flex-1 sm:flex-none px-6 sm:px-12 bg-white border-[#E7D7C1] !rounded-2xl text-primary font-medium text-sm sm:text-base"
                    >
                        {t('steel.weight.reset')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCalculate}
                        className="h-[50px] sm:h-[58px] flex-1 sm:flex-none px-6 sm:px-12 !bg-[#B02E0C] text-white !rounded-2xl font-medium text-sm sm:text-base"
                    >
                        {t('steel.weight.calculate')}
                    </Button>
                </div>
            </div>

            {/* Result Section */}
            {showResult && (
                <div className="mt-10 animate-fade-in pb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-primary">{t('steel.weight.result')}</h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[#060C121A] mb-8">
                        <button
                            onClick={() => setUnitType('metric')}
                            className={`px-12 py-3 border-b-2 transition-all cursor-pointer font-medium ${unitType === 'metric' ? 'border-accent text-accent' : 'border-transparent text-secondary'}`}
                        >
                            {t('steel.weight.metric')}
                        </button>
                        <button
                            onClick={() => setUnitType('imperial')}
                            className={`px-12 py-3 border-b-2 transition-all cursor-pointer font-medium ${unitType === 'imperial' ? 'border-accent text-accent' : 'border-transparent text-secondary'}`}
                        >
                            {t('steel.weight.imperial')}
                        </button>
                    </div>

                    {/* Result Table */}
                    <div className="bg-white rounded-xl border border-[#060C121A] overflow-hidden mb-8 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[320px]">
                            <thead>
                                <tr className="bg-[#F7F7F7] border-b border-[#060C120A]">
                                    {[t('history.headers.material'), t('history.headers.quantity'), t('history.headers.unit')].map((header, index) => (
                                        <th
                                            key={index}
                                            className="px-6 py-4 text-sm font-medium text-primary border-r border-[#060C120A] last:border-r-0"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#060C120A]">
                                {[
                                    { material: t('steel.column.volume'), quantity: colVolume.toFixed(3), unit: 'm³' },
                                    { material: t('steel.column.vertical') + '(D1)', quantity: weightD1.toFixed(3), unit: 'Kg' },
                                    { material: t('steel.column.vertical') + '(D2)', quantity: weightD2.toFixed(3), unit: 'Kg' },
                                    { material: t('steel.column.stirrups') + '(R1)', quantity: stirrupWeightR1.toFixed(3), unit: 'Kg' },
                                    { material: t('steel.column.stirrups') + '(R2)', quantity: stirrupWeightR2.toFixed(3), unit: 'Kg' },
                                    { material: t('steel.column.stirrups') + '(R3)', quantity: stirrupWeightR3.toFixed(3), unit: 'Kg' },
                                    { material: t('steel.weight.totalSteel'), quantity: totalSteel.toFixed(3), unit: 'Kg' },
                                    { material: t('steel.weight.totalPrice'), quantity: totalPrice.toFixed(3), unit: '₹' },
                                ].map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-[#F9F9F9] transition-colors">
                                        <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{row.material}</td>
                                        <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{row.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A] last:border-r-0">{row.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#FDF9F4] p-4 rounded-2xl flex items-center justify-between border border-[#F5E6D3] h-[58px]">
                            <span className="font-medium text-primary uppercase text-sm tracking-wider">{t('steel.weight.totalCost')}</span>
                            <span className="font-bold text-accent text-xl">₹{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_COLUMN_TYPE4_DETAILED, {
                                state: {
                                    calculationData,
                                    outputs: calculationOutputs
                                }
                            })}
                            className="!rounded-2xl text-lg font-medium hover:bg-[#B02E0C] transition-all h-[58px]"
                        >
                            {t('steel.weight.viewDetailed')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColumnType4;
