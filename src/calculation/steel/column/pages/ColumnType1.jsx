import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Share2, Download, ChevronDown, History as HistoryIcon } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import colsType1 from '../../../../assets/icons/colsType1.svg';

const ColumnType1 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Column Size
    const [sideX, setSideX] = useState('');
    const [sideY, setSideY] = useState('');
    const [diameterD, setDiameterD] = useState('');
    const [height, setHeight] = useState('');

    // Stirrups Details
    const [ringDiameter, setRingDiameter] = useState('');
    const [spacingS, setSpacingS] = useState('');

    // Additional Details
    const [noOfColumns, setNoOfColumns] = useState('');
    const [noOfColumn, setNoOfColumn] = useState('');
    const [steelRate, setSteelRate] = useState('');

    const [showResult, setShowResult] = useState(false);

    // Helper function to handle positive number input
    const handlePositiveNumberInput = (setter) => (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setter(value);
        }
    };

    // Calculation Logic (Simplified formulas)
    const X = parseFloat(sideX) || 0;
    const Y = parseFloat(sideY) || 0;
    const D = parseFloat(diameterD) || 0;
    const H = parseFloat(height) || 0;
    const rd = parseFloat(ringDiameter) || 0;
    const s = parseFloat(spacingS) || 0;
    const nColumns = parseFloat(noOfColumns) || 0;
    const nColumn = parseFloat(noOfColumn) || 0;
    const R = parseFloat(steelRate) || 0;

    // Vertical Steel Weight: n * (Height/1000) * (D^2/162.28) * nBars (assuming 4 for type 1 or similar)
    const nBars = 4; // Assuming 4 bars for Column Type 1
    const finalN = nColumn || 1;
    const verticalWeight = (H / 1000) * ((D * D) / 162.28) * nBars * nColumns * finalN;

    // Stirrups: ((X-40)*2 + (Y-40)*2 + hooks) / 1000 * (rd^2/162.28) * (H/s + 1)
    const stirrupLen = ((X - 40) * 2 + (Y - 40) * 2 + 100) / 1000;
    const stirrupNos = s > 0 ? (H / s) + 1 : 0;
    const stirrupWeight = stirrupLen * stirrupNos * ((rd * rd) / 162.28) * nColumns * finalN;

    const colVolume = (X * Y * H * nColumns * finalN) / 1000000000;

    const totalSteel = verticalWeight + stirrupWeight;
    const totalPrice = totalSteel * R;

    const handleReset = () => {
        setSideX('');
        setSideY('');
        setDiameterD('');
        setHeight('');
        setRingDiameter('');
        setSpacingS('');
        setNoOfColumns('');
        setNoOfColumn('');
        setSteelRate('');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };

    const UnitSelector = ({ unit }) => (
        <div className="flex items-center px-2 sm:px-4 border-r border-[#060C121A] bg-gray-50/50 cursor-pointer min-w-[55px] sm:min-w-[80px] justify-between group">
            <span className="text-secondary text-sm sm:text-base font-medium">{unit}</span>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary group-hover:text-accent" />
        </div>
    );

    const calculationData = [
        { labelKey: 'steel.column.sideX', name: t('steel.column.sideX'), symbol: 'X', value: `${sideX} mm` },
        { labelKey: 'steel.column.sideY', name: t('steel.column.sideY'), symbol: 'Y', value: `${sideY} mm` },
        { labelKey: 'steel.column.diameter', name: t('steel.column.diameter'), symbol: 'D', value: `${diameterD} mm` },
        { labelKey: 'steel.column.columnHeight', name: t('steel.column.columnHeight'), symbol: 'H', value: `${height} mm` },
        { labelKey: 'steel.column.ringDiameter', name: t('steel.column.ringDiameter'), symbol: 'rd', value: `${ringDiameter} mm` },
        { labelKey: 'steel.column.spacing', name: t('steel.column.spacing'), symbol: 'S', value: `${spacingS} mm` },
        { labelKey: 'steel.column.noOfColumns', name: t('steel.column.noOfColumns'), symbol: 'N', value: `${noOfColumns} NOS` },
        { labelKey: 'steel.column.steelRate', name: t('steel.column.steelRate'), symbol: 'r', value: `₹ ${steelRate} / kg` },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.column.type1')}
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
                    <div className="flex items-center justify-center w-24 h-24 sm:w-38 sm:h-38">
                        <img src={colsType1} alt="Column Type 1 Diagram" className="w-full h-full object-contain" />
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
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                            {/* Side X */}
                            <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                                <UnitSelector unit="mm" />
                                <input
                                    type="text"
                                    value={sideX}
                                    onChange={handlePositiveNumberInput(setSideX)}
                                    className="flex-1 px-3 sm:px-6 text-sm sm:text-base text-primary focus:outline-none "
                                    placeholder={t('steel.column.sideX')}
                                />
                            </div>

                            {/* Side Y */}
                            <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                                <UnitSelector unit="mm" />
                                <input
                                    type="text"
                                    value={sideY}
                                    onChange={handlePositiveNumberInput(setSideY)}
                                    className="flex-1 px-3 sm:px-6 text-sm sm:text-base text-primary focus:outline-none "
                                    placeholder={t('steel.column.sideY')}
                                />
                            </div>

                            {/* Diameter D */}
                            <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                                <UnitSelector unit="mm" />
                                <input
                                    type="text"
                                    value={diameterD}
                                    onChange={handlePositiveNumberInput(setDiameterD)}
                                    className="flex-1 px-3 sm:px-6 text-sm sm:text-base text-primary focus:outline-none"
                                    placeholder={t('steel.column.diameter')}
                                />
                            </div>

                            {/* Column Height */}
                            <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                                <UnitSelector unit="mm" />
                                <input
                                    type="text"
                                    value={height}
                                    onChange={handlePositiveNumberInput(setHeight)}
                                    className="flex-1 px-3 sm:px-6 text-sm sm:text-base text-primary focus:outline-none"
                                    placeholder={t('steel.column.columnHeight')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stirrups Details Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.stirrupsDetails')}</h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            {/* Ring Diameter */}
                            <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                                <UnitSelector unit="mm" />
                                <input
                                    type="text"
                                    value={ringDiameter}
                                    onChange={handlePositiveNumberInput(setRingDiameter)}
                                    className="flex-1 px-3 sm:px-6 text-sm sm:text-base text-primary focus:outline-none"
                                    placeholder={t('steel.column.ringDiameter')}
                                />
                            </div>

                            {/* Spacing S */}
                            <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                                <UnitSelector unit="mm" />
                                <input
                                    type="text"
                                    value={spacingS}
                                    onChange={handlePositiveNumberInput(setSpacingS)}
                                    className="flex-1 px-3 sm:px-6 text-sm sm:text-base text-primary focus:outline-none"
                                    placeholder={t('steel.column.spacing')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Details Section */}
                    <div className="space-y-3 pt-2">
                        {/* No of Columns */}
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.noOfColumns')}</h3>
                        <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                            <div className="flex-1 px-4 sm:px-6 flex items-center">
                                <span className="text-secondary text-sm sm:text-base font-medium mr-4">{t('steel.column.noOfColumns')}</span>
                                <input
                                    type="text"
                                    value={noOfColumns}
                                    onChange={handlePositiveNumberInput(setNoOfColumns)}
                                    className="flex-1 text-sm sm:text-base text-primary focus:outline-none h-full"
                                    placeholder={t('steel.weight.wastagePlaceholder')}
                                />
                            </div>
                            <div className="flex items-center px-4">
                                <span className="text-accent text-sm sm:text-base uppercase">NOS</span>
                            </div>
                        </div>

                    </div>

                    {/* Price Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.weight.price')}</h3>
                        <div className="relative">
                            <input
                                type="text"
                                value={steelRate}
                                onChange={handlePositiveNumberInput(setSteelRate)}
                                className="w-full h-[50px] sm:h-[58px] bg-white rounded-2xl px-4 sm:px-6 py-2 sm:py-4 text-sm sm:text-base text-primary border border-[#060C121A] focus:outline-none focus:border-accent/40 transition-all"
                                placeholder={t('steel.column.steelRate')}
                            />
                            <span className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-accent text-sm sm:text-base font-medium">₹/Kg</span>
                        </div>
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
                                    { material: t('steel.column.vertical'), quantity: verticalWeight.toFixed(3), unit: 'Kg' },
                                    { material: t('steel.column.stirrups'), quantity: stirrupWeight.toFixed(3), unit: 'Kg' },
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
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_COLUMN_TYPE1_DETAILED, {
                                state: {
                                    calculationData,
                                    outputs: [
                                        {
                                            titleKey: 'steel.column.volume',
                                            labelKey: 'steel.column.volume',
                                            labelSuffix: ':',
                                            formula: 'X * Y * H * N / 1,000,000,000',
                                            value: `${colVolume.toFixed(3)} m³`
                                        },
                                        {
                                            titleKey: 'steel.column.vertical',
                                            label: 'D1 =',
                                            formula: '4 * D * D * H * N / 162.28',
                                            value: `${verticalWeight.toFixed(3)} Kg`
                                        },
                                        {
                                            titleKey: 'steel.column.stirrups',
                                            label: 'D2 =',
                                            formula: '(((2*(X-80)+2*(Y-80)+20*rd)/1000)*(((1000*H/S)+1)*(rd*rd)/162.28)*N)',
                                            value: `${stirrupWeight.toFixed(3)} Kg`
                                        },
                                        {
                                            titleKey: 'steel.weight.totalSteel',
                                            labelKey: 'steel.weight.totalSteel',
                                            labelSuffix: ' =',
                                            formula: '(4*D*D*H*N/162.28) + ((((2*(X-80)+2*(Y-80)+20*rd)/1000)*(((1000*H/S)+1)*(rd*rd)/162.28)*N))',
                                            value: `${totalSteel.toFixed(3)} Kg`
                                        },
                                        {
                                            titleKey: 'steel.weight.totalPrice',
                                            labelKey: 'steel.weight.totalPrice',
                                            labelSuffix: ' =',
                                            formula: 'Total Steel * r',
                                            value: `₹ ${totalPrice.toFixed(3)}`
                                        },
                                    ]
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

export default ColumnType1;
