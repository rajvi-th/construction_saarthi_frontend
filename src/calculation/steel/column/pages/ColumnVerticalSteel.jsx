import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, ChevronDown } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import colsVerticalSteel from '../../../../assets/icons/colsVerticalSteel.svg';
import InputField from '../../../common/InputField';

const ColumnVerticalSteel = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // State for input fields
    const [heightH, setHeightH] = useState('');
    const [diameterD1, setDiameterD1] = useState('');
    const [numVerticalBarsN1, setNumVerticalBarsN1] = useState('');
    const [noOfColumnsN2, setNoOfColumnsN2] = useState('');
    const [steelRate, setSteelRate] = useState('');

    const [showResult, setShowResult] = useState(false);



    // Calculation Logic (Vertical Steel Only variant)
    const H = parseFloat(heightH) || 0;
    const D1 = parseFloat(diameterD1) || 0;
    const n1 = parseFloat(numVerticalBarsN1) || 0;
    const n2 = parseFloat(noOfColumnsN2) || 0;
    const r = parseFloat(steelRate) || 0;

    // Formula from Image 4: Vertical Steel(D) = n2 * D1 * D1 * H * n1 / 162.28
    const totalWeight = (n2 * D1 * D1 * H * n1) / 162.28;
    const totalPrice = totalWeight * r;

    const handleReset = () => {
        setHeightH('');
        setDiameterD1('');
        setNumVerticalBarsN1('');
        setNoOfColumnsN2('');
        setSteelRate('');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };



    const calculationData = [
        { labelKey: 'steel.column.barDiameterD1', labelSuffix: '', name: t('steel.column.barDiameterD1'), symbol: 'D1', value: `${diameterD1} mm` },
        { labelKey: 'steel.column.columnHeightH', labelSuffix: '', name: t('steel.column.columnHeightH'), symbol: 'H', value: `${heightH} m` },
        { labelKey: 'steel.column.numVerticalBarsN1', labelSuffix: '', name: t('steel.column.numVerticalBarsN1'), symbol: 'n1', value: `${numVerticalBarsN1} NOS` },
        { labelKey: 'steel.column.noOfColumnsN2', labelSuffix: '', name: t('steel.column.noOfColumnsN2'), symbol: 'n2', value: `${noOfColumnsN2} NOS` },
        { labelKey: 'steel.column.price', labelSuffix: '', name: t('steel.column.price'), symbol: 'R', value: `${steelRate} ₹/kg` },
    ];

    const calculationOutputs = [
        {
            titleKey: 'steel.column.verticalSteelD',
            labelKey: 'steel.column.verticalSteelD',
            labelSuffix: ':',
            formula: 'n2XD1XD1XHXn1/162.28',
            value: `${totalWeight.toFixed(3)} kg`
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.column.verticalSteel')}
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
                        <img src={colsVerticalSteel} alt="Column Vertical Steel Diagram" className="w-full h-full object-contain" />
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
                        <div className="grid gap-2 md:gap-4">
                            <InputField
                                unit="m"
                                value={heightH}
                                onChange={(e) => setHeightH(e.target.value)}
                                placeholder={t('steel.column.columnHeightH')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.barDetails')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={diameterD1}
                                onChange={(e) => setDiameterD1(e.target.value)}
                                placeholder={t('steel.column.barDiameterD1')}
                            />
                            <InputField
                                value={numVerticalBarsN1}
                                onChange={(e) => setNumVerticalBarsN1(e.target.value)}
                                placeholder={t('steel.column.numVerticalBarsN1')}
                                suffix="NOS"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.noOfColumns')}</h3>
                        <InputField
                            value={noOfColumnsN2}
                            onChange={(e) => setNoOfColumnsN2(e.target.value)}
                            placeholder={t('steel.column.noOfColumnsN2')}
                            suffix="NOS"
                        />
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.column.price')}</h3>
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
                                    { material: t('steel.column.verticalSteelD'), quantity: totalWeight.toFixed(3), unit: 'Kg' },
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
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_COLUMN_VERTICAL_STEEL_DETAILED, {
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

export default ColumnVerticalSteel;
