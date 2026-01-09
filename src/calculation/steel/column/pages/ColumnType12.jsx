import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, ChevronDown } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import colsType12 from '../../../../assets/icons/colsType12.svg';

const ColumnType12 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // State for input fields
    const [diameterD, setDiameterD] = useState('');
    const [height, setHeight] = useState('');
    const [diameterD1, setDiameterD1] = useState('');
    const [ringDiameterR1, setRingDiameterR1] = useState('');
    const [spacingS, setSpacingS] = useState('');
    const [noOfColumns, setNoOfColumns] = useState('');
    const [steelRate, setSteelRate] = useState('');

    const [showResult, setShowResult] = useState(false);

    // Reusable positive number input handler
    const handlePositiveNumberInput = (setter) => (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setter(value);
        }
    };

    // Calculation Logic (Circular Column Type 12)
    const D = parseFloat(diameterD) || 0;
    const H = parseFloat(height) || 0;
    const H_mm = H * 1000;
    const d = parseFloat(diameterD1) || 0;
    const R = parseFloat(ringDiameterR1) || 0;
    const s = parseFloat(spacingS) || 0;
    const nColumns = parseFloat(noOfColumns) || 0;
    const r = parseFloat(steelRate) || 0;

    // Formulas (Same structure as Type 11 as they are both circular variants)
    // Volume: (3.14X(0.5XD)X(0.5XD)XHXn)/1000000
    const colVolume = (3.14 * (0.5 * D) * (0.5 * D) * H_mm * nColumns) / 1000000000;

    // Vertical Steel (D1): 6XdXdXHXn/162
    const weightD1 = (6 * d * d * H * nColumns) / 162;

    // Stirrups (R): (((3.14X(D-80))+20XR)/1000)X((1000XH/S)+1)X(RXR/162)Xn
    const cuttingLengthR = ((3.14 * (D - 80)) + (20 * R)) / 1000;
    const numStirrups = s > 0 ? (H_mm / s) + 1 : 0;
    const weightPerR = (R * R) / 162;
    const stirrupWeightR = cuttingLengthR * numStirrups * weightPerR * nColumns;

    const totalSteel = weightD1 + stirrupWeightR;
    const totalPrice = totalSteel * r;

    const handleReset = () => {
        setDiameterD('');
        setHeight('');
        setDiameterD1('');
        setRingDiameterR1('');
        setSpacingS('');
        setNoOfColumns('');
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
        { labelKey: 'steel.column.columnDiameterD', labelSuffix: '', name: 'Column Diameter D', symbol: 'D', value: `${diameterD} mm` },
        { labelKey: 'steel.column.columnHeightH', labelSuffix: '', name: 'Column Height H', symbol: 'H', value: `${parseFloat(height) * 1000 || 0} mm` },
        { labelKey: 'steel.column.barDiameterD1', labelSuffix: '', name: 'Bar Diameter D1', symbol: 'd', value: `${diameterD1} mm` },
        { labelKey: 'steel.column.ringDiameterR', labelSuffix: '', name: 'Ring Diameter R', symbol: 'R', value: `${ringDiameterR1} mm` },
        { labelKey: 'steel.column.stirrupsSpacingS', labelSuffix: '', name: 'Stirrups Spacing S', symbol: 'S', value: `${spacingS} mm` },
        { labelKey: 'steel.column.noOfColumns', labelSuffix: ' - N', name: 'Number of Columns - N', symbol: 'N', value: `${noOfColumns} NOS` },
        { labelKey: 'steel.column.price', labelSuffix: '', name: 'Rate of Steel', symbol: 'R', value: `${steelRate} currency per kg` },
    ];

    const calculationOutputs = [
        {
            titleKey: 'steel.column.volume',
            labelKey: 'steel.column.volume',
            labelSuffix: '',
            formula: ': (3.14X(0.5XD)X(0.5XD)XHXn)/1000000',
            value: `= ${colVolume.toFixed(3)} m3`
        },
        {
            titleKey: 'steel.column.verticalSteelD1',
            labelKey: 'steel.column.verticalSteelD1',
            labelSuffix: '',
            formula: ' = 6XdXdXHXn/162',
            value: `= ${weightD1.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.column.stirrupsR',
            labelKey: 'steel.column.stirrupsR',
            labelSuffix: '',
            formula: ' = (((3.14X(D-80))+20XR)/1000)X((1000XH/S)+1)X(RXR/162)Xn',
            value: `= ${stirrupWeightR.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.weight.totalSteel',
            labelKey: 'steel.weight.totalSteel',
            labelSuffix: '',
            formula: ' = (6XdXdXHXn/162)+((((3.14X(D-80))+20XR)/1000)X((1000XH/S)+1)X(RXR/162)Xn)',
            value: `= ${totalSteel.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.weight.totalPrice',
            labelKey: 'steel.weight.totalPrice',
            labelSuffix: '',
            formula: ' = ((6XdXdXHXn/162)+((((3.14X(D-80))+20XR)/1000)X((1000XH/S)+1)X(RXR/162)Xn))Xr',
            value: `= ${totalPrice.toFixed(3)} Currency`
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.column.type12')}
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
                    <div className="flex items-center justify-center  w-24 h-24 sm:w-45 sm:h-38">
                        <img src={colsType12} alt="Column Type 12 Diagram" className="w-full h-full object-contain" />
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
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.columnSize')}</h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-6">
                            <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                                <UnitSelector unit="mm" />
                                <input
                                    type="text"
                                    value={diameterD}
                                    onChange={handlePositiveNumberInput(setDiameterD)}
                                    className="flex-1 px-3 sm:px-6 text-sm sm:text-base text-primary focus:outline-none"
                                    placeholder={t('steel.column.columnDiameterD')}
                                />
                            </div>
                            <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                                <UnitSelector unit="m" />
                                <input
                                    type="text"
                                    value={height}
                                    onChange={handlePositiveNumberInput(setHeight)}
                                    className="flex-1 px-3 sm:px-6 text-sm sm:text-base text-primary focus:outline-none"
                                    placeholder={t('steel.column.columnHeightH')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.barDetails')}</h3>
                        <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                            <UnitSelector unit="mm" />
                            <input
                                type="text"
                                value={diameterD1}
                                onChange={handlePositiveNumberInput(setDiameterD1)}
                                className="flex-1 px-3 sm:px-6 text-sm sm:text-base text-primary focus:outline-none"
                                placeholder={t('steel.column.barDiameterD1')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.ringDetails')}</h3>
                        <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                            <UnitSelector unit="mm" />
                            <input
                                type="text"
                                value={ringDiameterR1}
                                onChange={handlePositiveNumberInput(setRingDiameterR1)}
                                className="flex-1 px-3 sm:px-6 text-sm sm:text-base text-primary focus:outline-none"
                                placeholder={t('steel.column.ringDiameterR1')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.stirrupsDetails')}</h3>
                        <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                            <UnitSelector unit="mm" />
                            <input
                                type="text"
                                value={spacingS}
                                onChange={handlePositiveNumberInput(setSpacingS)}
                                className="flex-1 px-3 sm:px-6 text-sm sm:text-base text-primary focus:outline-none"
                                placeholder={t('steel.column.stirrupsSpacingS')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.noOfColumns')}</h3>
                        <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[50px] sm:h-[58px]">
                            <input
                                type="text"
                                value={noOfColumns}
                                onChange={handlePositiveNumberInput(setNoOfColumns)}
                                className="flex-1 px-3 sm:px-6 text-sm sm:text-base text-primary focus:outline-none h-full"
                                placeholder={t('steel.column.noOfColumn')}
                            />
                            <div className="flex items-center px-4">
                                <span className="text-accent text-sm sm:text-base uppercase">NOS</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.price')}</h3>
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
                                    { material: t('steel.column.volume'), quantity: colVolume.toFixed(3), unit: 'm³' },
                                    { material: t('steel.column.verticalSteelD1'), quantity: weightD1.toFixed(3), unit: 'kg' },
                                    { material: t('steel.column.stirrupsR'), quantity: stirrupWeightR.toFixed(3), unit: 'kg' },
                                    { material: t('steel.weight.totalSteel'), quantity: totalSteel.toFixed(3), unit: 'kg' },
                                    { material: t('steel.weight.totalPrice'), quantity: totalPrice.toFixed(3), unit: '₹' },
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
                            <span className="font-bold text-accent text-xl">₹{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_COLUMN_TYPE12_DETAILED, {
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

export default ColumnType12;
