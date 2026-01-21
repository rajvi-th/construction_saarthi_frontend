import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import Dropdown from '../../../../components/ui/Dropdown';
import InputField from '../../../common/InputField';
import flatBarMetalDiagram from '../../../../assets/icons/flatBarMetals.svg';

const FlatBarMetal = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Inputs
    const [sideA, setSideA] = useState('');
    const [sideB, setSideB] = useState('');
    const [lengthL, setLengthL] = useState('');
    const [noOfUnits, setNoOfUnits] = useState('');
    const [rateOfMetal, setRateOfMetal] = useState('');
    const [metalType, setMetalType] = useState('steel');
    const [density, setDensity] = useState('0.00');

    const [showResult, setShowResult] = useState(false);

    const metalDensities = [
        { value: 'steel', label: 'Steel', density: '7850.00' },
        { value: 'aluminum', label: 'Aluminum', density: '2700.00' },
        { value: 'copper', label: 'Copper', density: '8960.00' },
        { value: 'brass', label: 'Brass', density: '8500.00' },
        { value: 'stainless_steel', label: 'Stainless Steel', density: '8000.00' },
    ];

    const handleMetalTypeChange = (value) => {
        setMetalType(value);
        const selected = metalDensities.find(m => m.value === value);
        if (selected) {
            setDensity(selected.density);
        }
    };

    // Calculation Logic
    const a = parseFloat(sideA) || 0;
    const b = parseFloat(sideB) || 0;
    const L = parseFloat(lengthL) || 0;
    const N_val = parseFloat(noOfUnits) || 0;
    const R_val = parseFloat(rateOfMetal) || 0;
    const dens_val = parseFloat(density) || 0;

    // Volume = a * b * L (a, b in mm, L in m)
    const volume_m3_per_unit = (a * b * (L * 1000)) / 1000000000;
    const unitWeight = volume_m3_per_unit * dens_val;
    const totalWeight = unitWeight * N_val;
    const totalPrice = totalWeight * R_val;

    const handleReset = () => {
        setSideA('');
        setSideB('');
        setLengthL('');
        setNoOfUnits('');
        setRateOfMetal('');
        setMetalType('steel');
        setDensity('0.00');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('metal.quantity.flatBar')}
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

            {/* Main Content Card */}
            <div className="bg-[#FAF5F0] rounded-3xl p-3 md:p-6">
                <div className="flex items-center gap-4 sm:gap-10 pb-6 border-b border-[#060C120A]">
                    {/* Diagram Box */}
                    <div className="flex items-center justify-center">
                        <img src={flatBarMetalDiagram} alt="Flat Bar Diagram" className="w-full h-full object-contain max-h-48" />
                    </div>

                    {/* Radio Group */}
                    <div className="flex flex-col gap-4">
                        <Radio
                            label={t('metal.common.metric')}
                            name="unitType"
                            value="metric"
                            checked={unitType === 'metric'}
                            onChange={() => setUnitType('metric')}
                            className="text-base sm:text-lg"
                        />
                        <Radio
                            label={t('metal.common.imperial')}
                            name="unitType"
                            value="imperial"
                            checked={unitType === 'imperial'}
                            onChange={() => setUnitType('imperial')}
                            className="text-base sm:text-lg"
                        />
                    </div>
                </div>

                <div className="md:space-y-4 space-y-2 pt-6">
                    {/* Row 1: Side - a, Side - b, Length - L */}
                    <div className="grid md:grid-cols-3 gap-2 md:gap-4">
                        <InputField
                            placeholder={t('metal.flatBar.sideA')}
                            suffix="mm"
                            value={sideA}
                            onChange={(e) => setSideA(e.target.value)}
                        />
                        <InputField
                            placeholder={t('metal.flatBar.sideB')}
                            suffix="mm"
                            value={sideB}
                            onChange={(e) => setSideB(e.target.value)}
                        />
                        <div className="col-span-2 md:col-span-1">
                            <InputField
                                placeholder={t('metal.flatBar.lengthL')}
                                suffix="m"
                                value={lengthL}
                                onChange={(e) => setLengthL(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Row 2: No of Units, Rate of Metal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                        <InputField
                            placeholder={t('metal.common.noOfUnits')}
                            suffix="Unit"
                            value={noOfUnits}
                            onChange={(e) => setNoOfUnits(e.target.value)}
                        />
                        <InputField
                            placeholder={t('metal.common.rateOfMetal')}
                            suffix="₹/Kg"
                            value={rateOfMetal}
                            onChange={(e) => setRateOfMetal(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 pt-2">
                        <h3 className="font-medium text-primary ml-1">{t('metal.common.typeOfMetal')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Dropdown
                                value={metalType}
                                onChange={handleMetalTypeChange}
                                options={metalDensities.map(m => ({ ...m, label: t(`metal.densities.${m.value}`) }))}
                                placeholder={t('metal.common.selectMetal')}
                                className="h-[48px] sm:h-[56px] [&>button]:h-full [&>button]:border-[#060C121A] [&>button]:focus:border-accent/40 [&>button]:hover:border-[#060C121A]"
                            />
                            <InputField
                                value={density}
                                onChange={(e) => setDensity(e.target.value)}
                                suffix="Kg/m³"
                            />
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
                        {t('metal.common.reset')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCalculate}
                        className="h-[50px] sm:h-[58px] flex-1 sm:flex-none px-6 sm:px-12 !bg-[#B02E0C] text-white !rounded-2xl font-medium text-sm sm:text-base"
                    >
                        {t('metal.common.calculate')}
                    </Button>
                </div>
            </div>

            {/* Result Section */}
            {showResult && (
                <div className="mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                    <h2 className="text-lg font-medium text-primary mb-3">{t('metal.common.result')}</h2>

                    <div className="bg-white rounded-xl border border-[#060C121A] overflow-hidden overflow-x-auto">
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
                                    { material: t('metal.common.unitWeight'), quantity: unitWeight.toFixed(3), unit: 'Kg' },
                                    { material: t('metal.common.totalWeight'), quantity: totalWeight.toFixed(3), unit: 'Kg' },
                                    { material: t('metal.common.totalPrice'), quantity: totalPrice.toFixed(2), unit: '₹' },
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

                    <div className="bg-[#FAF5F0] p-4 rounded-2xl flex items-center justify-between border border-[#F5E6D3] h-[58px]">
                        <span className="font-medium text-primary uppercase text-sm tracking-wider">{t('metal.common.totalCost')}</span>
                        <span className="font-bold text-[#B02E0C] text-xl">₹{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlatBarMetal;
