import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ROUTES_FLAT from '../../../../constants/routes';
import { Share2, Download, ChevronDown, History as HistoryIcon } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import DropdownMenu from '../../../../components/ui/DropdownMenu';
import rainForcementWeight from '../../../../assets/icons/rainForcementWeight.svg';

const ReinforcementWeight = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial
    const [wastage, setWastage] = useState('');
    const [diameter, setDiameter] = useState('');
    const [diameterUnit, setDiameterUnit] = useState('mm');
    const [length, setLength] = useState('');
    const [lengthUnit, setLengthUnit] = useState('m');
    const [noOfBars, setNoOfBars] = useState('');
    const [price, setPrice] = useState('');
    const [showResult, setShowResult] = useState(false);

    const handleReset = () => {
        setWastage('');
        setDiameter('');
        setLength('');
        setNoOfBars('');
        setPrice('');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };

    const dropdownItems = [
        {
            label: t('projectDetails.history'),
            icon: <HistoryIcon className="w-4 h-4" />,
            onClick: () => console.log('History clicked'),
        },
        {
            label: t('history.sharePdf'),
            icon: <Share2 className="w-4 h-4" />,
            onClick: () => console.log('Share clicked'),
        }
    ];

    const resultData = [
        { material: t('steel.weight.totalLength'), quantity: '60.960', unit: 'm' },
        { material: t('steel.weight.singleRodWeight'), quantity: '1.878', unit: 'Kg' },
        { material: t('steel.weight.totalWeight'), quantity: '37.565', unit: 'Kg' },
        { material: t('steel.weight.totalPrice'), quantity: '7512.941', unit: '₹' },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.weight.reinforcement')}
                    showBackButton
                    onBack={() => window.history.back()}
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
                        <DropdownMenu
                            items={dropdownItems}
                            position="right"
                            className="flex items-center justify-center"
                        />
                    </div>
                </PageHeader>
            </div>

            {/* Content Card */}
            <div className="bg-[#F9F4EE] rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-lightGray">
                    {/* Icon Box */}
                    <div className="w-35 h-24 bg-white rounded-2xl flex items-center justify-center border border-[#B02E0C29]">
                        <img src={rainForcementWeight} alt="Weight" className="w-16 h-16 object-contain" />
                    </div>

                    {/* Radio Group */}
                    <div className="flex items-center gap-8">
                        <Radio
                            label={t('steel.weight.metric')}
                            name="unitType"
                            value="metric"
                            checked={unitType === 'metric'}
                            onChange={() => setUnitType('metric')}
                        />
                        <Radio
                            label={t('steel.weight.imperial')}
                            name="unitType"
                            value="imperial"
                            checked={unitType === 'imperial'}
                            onChange={() => setUnitType('imperial')}
                        />
                    </div>
                </div>

                {/* Form Sections */}
                <div className="space-y-6 pt-6">
                    {/* Material Wastage */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm sm:text-base font-medium text-primary ml-1">
                            {t('steel.weight.wastage')}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={wastage}
                                onChange={(e) => setWastage(e.target.value)}
                                className="w-full h-[58px] bg-white rounded-2xl px-6 py-4 text-base text-primary border border-[#060C121A] focus:outline-none focus:border-accent/40 transition-all"
                                placeholder={t('steel.weight.wastagePlaceholder')}
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary font-medium">%</span>
                        </div>
                    </div>

                    {/* Grid Inputs row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Diameter */}
                        <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[58px]">
                            <div className="flex items-center px-4 border-r border-[#060C121A] bg-gray-50/50 cursor-pointer min-w-[80px] justify-between group">
                                <span className="text-secondary font-medium">{diameterUnit}</span>
                                <ChevronDown className="w-4 h-4 text-secondary group-hover:text-accent" />
                            </div>
                            <input
                                type="text"
                                value={diameter}
                                onChange={(e) => setDiameter(e.target.value)}
                                className="flex-1 px-6 text-base text-primary focus:outline-none"
                                placeholder={t('steel.weight.diameter')}
                            />
                        </div>

                        {/* Length */}
                        <div className="flex bg-white rounded-2xl border border-[#060C121A] focus-within:border-accent/40 transition-all overflow-hidden h-[58px]">
                            <div className="flex items-center px-4 border-r border-[#060C121A] bg-gray-50/50 cursor-pointer min-w-[80px] justify-between group">
                                <span className="text-secondary font-medium">{lengthUnit}</span>
                                <ChevronDown className="w-4 h-4 text-secondary group-hover:text-accent" />
                            </div>
                            <input
                                type="text"
                                value={length}
                                onChange={(e) => setLength(e.target.value)}
                                className="flex-1 px-6 text-base sm:text-lg text-primary focus:outline-none font-medium"
                                placeholder={t('steel.weight.length')}
                            />
                        </div>
                    </div>

                    {/* Grid Inputs row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* No of Bars */}
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                value={noOfBars}
                                onChange={(e) => setNoOfBars(e.target.value)}
                                className="w-full h-[58px] bg-white rounded-2xl px-6 py-4 text-base sm:text-lg text-primary border border-[#060C121A] focus:outline-none focus:border-accent/40 transition-all"
                                placeholder={t('steel.weight.noOfBars')}
                            />
                        </div>

                        {/* Price */}
                        <div className="relative">
                            <input
                                type="text"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full h-[58px] bg-white rounded-2xl px-6 py-4 text-base sm:text-lg text-primary border border-[#060C121A] focus:outline-none focus:border-accent/40 transition-all"
                                placeholder={t('steel.weight.price')}
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary font-medium">{t('history.units.kg')}/{t('history.units.ton')}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 mt-7">
                    <button
                        onClick={handleReset}
                        className="h-[52px] px-10 bg-white border border-[#E7D7C1] rounded-xl text-primary font-medium hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        {t('steel.weight.reset')}
                    </button>
                    <button
                        onClick={handleCalculate}
                        className="h-[52px] px-10 bg-[#D4947E] text-white rounded-xl font-medium hover:bg-[#C4846E] transition-all cursor-pointer"
                    >
                        {t('steel.weight.calculate')}
                    </button>
                </div>
            </div>

            {/* Result Section (Conditional) */}
            {showResult && (
                <div className="mt-10 animate-fade-in pb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-primary">{t('steel.weight.result')}</h2>
                        <button
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_REINFORCEMENT_WEIGHT_HISTORY)}
                            className="text-accent font-medium cursor-pointer"
                        >
                            {t('projectDetails.history')}
                        </button>
                    </div>

                    {/* Tabs Synchronized with unitType */}
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

                    {/* Result Table Styled like CalculationTable */}
                    <div className="bg-white rounded-xl border border-[#060C121A] overflow-hidden mb-8 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[320px]">
                            <thead>
                                <tr className="bg-[#F7F7F7] border-b border-[#060C120A]">
                                    {[t('history.headers.material'), t('history.headers.quantity'), t('history.headers.unit')].map((header, index) => (
                                        <th
                                            key={index}
                                            className="px-6 py-4 text-sm font-semibold text-primary border-r border-[#060C120A] last:border-r-0"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#060C120A]">
                                {resultData.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-[#F9F9F9] transition-colors">
                                        <td className="px-6 py-4 text-sm text-secondary font-medium border-r border-[#060C120A]">{row.material}</td>
                                        <td className="px-6 py-4 text-sm text-primary font-medium border-r border-[#060C120A]">{row.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-secondary font-medium border-r border-[#060C120A] last:border-r-0">{row.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Actions (Half Width) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#FDF9F4] p-4 rounded-2xl flex items-center justify-between border border-[#F5E6D3] h-[58px]">
                            <span className=" font-medium text-primary">{t('steel.weight.totalCost')}</span>
                            <span className=" font-bold text-accent">₹44,567.33</span>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_REINFORCEMENT_WEIGHT_DETAILED, {
                                state: { diameter, length, noOfBars, price, unitType }
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

export default ReinforcementWeight;
