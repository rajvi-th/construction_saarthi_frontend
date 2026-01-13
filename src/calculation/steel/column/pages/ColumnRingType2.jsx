import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, ChevronDown } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import colsRingType2 from '../../../../assets/icons/colsRingType2.svg';
import InputField from '../../../common/InputField';

const ColumnRingType2 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // State for input fields
    const [columnSizeX, setColumnSizeX] = useState('');
    const [columnSizeY, setColumnSizeY] = useState('');
    const [heightH, setHeightH] = useState('');
    const [ringDiameterR, setRingDiameterR] = useState('');
    const [stirrupsSpacingS, setStirrupsSpacingS] = useState('');
    const [noOfColumnsN, setNoOfColumnsN] = useState('');
    const [steelRate, setSteelRate] = useState('');

    const [showResult, setShowResult] = useState(false);



    // Calculation Logic
    const X = parseFloat(columnSizeX) || 0;
    const Y = parseFloat(columnSizeY) || 0;
    const H = parseFloat(heightH) || 0;
    const R = parseFloat(ringDiameterR) || 0;
    const S = parseFloat(stirrupsSpacingS) || 0;
    const n = parseFloat(noOfColumnsN) || 0;
    const rate = parseFloat(steelRate) || 0;

    // Formula: Stirrups = ((2X(X-80)+2X(Y-80)+20XR)/1000)X((1000XH/S)+1)X(RXR/162.28)Xn

    // Cutting Length in meters
    // (2*(X-80) + 2*(Y-80) + 20*R) / 1000
    const term1 = ((2 * (X - 80)) + (2 * (Y - 80)) + (20 * R)) / 1000;

    // Number of stirrups
    // ((1000 * H) / S) + 1
    const term2 = S > 0 ? ((1000 * H) / S) + 1 : 0;

    // Unit Weight (kg/m)
    // (R * R) / 162.28
    const term3 = (R * R) / 162.28;

    const stirrupsWeight = term1 * term2 * term3 * n;
    const totalCost = stirrupsWeight * rate;

    const handleReset = () => {
        setColumnSizeX('');
        setColumnSizeY('');
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
            titleKey: 'steel.column.stirrups',
            labelKey: 'steel.column.stirrups',
            labelSuffix: ' =',
            formula: '((2X(X-80)+2X(Y-80)+20XR)/1000)X((1000XH/S)+1)X(RXR/162.28)Xn',
            value: `${stirrupsWeight.toFixed(3)} KG`
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.column.ring2')}
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
                        <img src={colsRingType2} alt="Column Ring Type 2 Diagram" className="w-full h-full object-contain" />
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

                {/* Form Sections */}
                <div className="space-y-4 pt-4">
                    {/* Column Size Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.size')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={columnSizeX}
                                onChange={(e) => setColumnSizeX(e.target.value)}
                                placeholder={t('steel.column.columnSizeX')}
                            />
                            <InputField
                                unit="mm"
                                value={columnSizeY}
                                onChange={(e) => setColumnSizeY(e.target.value)}
                                placeholder={t('steel.column.columnSizeY')}
                            />
                            <div className="col-span-2 md:col-span-1">
                            <InputField
                                unit="m"
                                value={heightH}
                                onChange={(e) => setHeightH(e.target.value)}
                                placeholder={t('steel.column.columnHeightH')}
                            />
                            </div>
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

                    {/* Number of Columns */}
                    <div className="space-y-3 pt-2">
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
                                <tr className="hover:bg-[#F9F9F9] transition-colors">
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('steel.column.stirrups')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{stirrupsWeight.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A] last:border-r-0">Kg</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#FDF9F4] p-4 rounded-2xl flex items-center justify-between border border-[#F5E6D3] h-[58px]">
                            <span className="font-medium text-primary uppercase text-sm tracking-wider">{t('steel.weight.totalCost')}</span>
                            <span className="font-bold text-accent text-xl">₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_COLUMN_RING_TYPE2_DETAILED, {
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

export default ColumnRingType2;
