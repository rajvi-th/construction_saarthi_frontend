import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Share2, Download, History as HistoryIcon } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import beamType1 from '../../../../assets/icons/beamType1.svg';
import InputField from '../../../common/InputField';

const BeamType1 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Beam Size
    const [sideX, setSideX] = useState('');
    const [sideY, setSideY] = useState('');
    const [lengthL, setLengthL] = useState('');

    // Steel Details
    const [topD1, setTopD1] = useState('');
    const [bottomD2, setBottomD2] = useState('');

    // Ring Details
    const [ringDiameterR, setRingDiameterR] = useState('');

    // Stirrups Details
    const [stirrupSpacingS, setStirrupSpacingS] = useState('');

    // Additional Details
    const [noOfColumns, setNoOfColumns] = useState('');
    const [steelRate, setSteelRate] = useState('');

    const [showResult, setShowResult] = useState(false);

    // Calculation Logic
    const X = parseFloat(sideX) || 0;
    const Y = parseFloat(sideY) || 0;
    const L = parseFloat(lengthL) || 0;
    const D1 = parseFloat(topD1) || 0;
    const D2 = parseFloat(bottomD2) || 0;
    const R = parseFloat(ringDiameterR) || 0;
    const S = parseFloat(stirrupSpacingS) || 0;
    const n = parseFloat(noOfColumns) || 0;
    const r = parseFloat(steelRate) || 0;

    // Volume = X * Y * L * n / 10^9
    const volume = (X * Y * L * n) / 1000000000;

    // Top Steel (D1)
    // Formula from Image 4: ((L+540)X0.002)XD1XD1Xn/162.28
    const topSteelWeight = ((L + 540) * 0.002) * D1 * D1 * n / 162.28;

    // Bottom Steel (D2)
    // Formula from Image 4: ((L+540)X0.002)XD2XD2Xn/162.28
    const bottomSteelWeight = ((L + 540) * 0.002) * D2 * D2 * n / 162.28;

    // Stirrups (S)
    // Formula from Image 4: ((2X(X-60)+2X(Y-60)+20XR))/1000X((L/S)+1)X(RXR/162.28)Xn
    const stirrupPart1 = (2 * (X - 60) + 2 * (Y - 60) + 20 * R) / 1000;
    const stirrupPart2 = S > 0 ? (L / S) + 1 : 0;
    const stirrupPart3 = (R * R) / 162.28;
    const stirrupsWeight = stirrupPart1 * stirrupPart2 * stirrupPart3 * n;

    const totalSteel = topSteelWeight + bottomSteelWeight + stirrupsWeight;
    const totalPrice = totalSteel * r;

    const handleReset = () => {
        setSideX('');
        setSideY('');
        setLengthL('');
        setTopD1('');
        setBottomD2('');
        setRingDiameterR('');
        setStirrupSpacingS('');
        setNoOfColumns('');
        setSteelRate('');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };

    const calculationData = [
        { labelKey: 'steel.beam.sideX', name: t('steel.beam.sideX'), symbol: 'X', value: `${sideX} mm` },
        { labelKey: 'steel.beam.sideY', name: t('steel.beam.sideY'), symbol: 'Y', value: `${sideY} mm` },
        { labelKey: 'steel.beam.lengthL', name: t('steel.beam.lengthL'), symbol: 'L', value: `${lengthL} mm` },
        { labelKey: 'steel.beam.topSteelD1', name: t('steel.beam.topSteelD1'), symbol: 'D1', value: `${topD1} mm` },
        { labelKey: 'steel.beam.bottomSteelD2', name: t('steel.beam.bottomSteelD2'), symbol: 'D2', value: `${bottomD2} mm` },
        { labelKey: 'steel.beam.ringDiameterR', name: t('steel.beam.ringDiameterR'), symbol: 'R', value: `${ringDiameterR} mm` },
        { labelKey: 'steel.beam.stirrupsSpacingS', name: t('steel.beam.stirrupsSpacingS'), symbol: 'S', value: `${stirrupSpacingS} mm` },
        { labelKey: 'steel.beam.noOfColumns', name: t('steel.beam.noOfColumns'), symbol: 'n', value: `${noOfColumns} NOS` },
        { labelKey: 'steel.beam.rateOfSteel', name: t('steel.beam.rateOfSteel'), symbol: 'r', value: `₹ ${steelRate} / kg` },
    ];

    const detailedOutputs = [
        {
            titleKey: 'steel.beam.volume',
            labelKey: 'steel.beam.volume',
            labelSuffix: ':',
            formula: 'XXYXLXn/1000000000',
            value: `${volume.toFixed(3)} m³`
        },
        {
            titleKey: 'steel.beam.topSteel',
            labelKey: 'steel.beam.topSteel',
            labelSuffix: '=',
            formula: '((L+540)X0.002)XD1XD1Xn/162.28',
            value: `${topSteelWeight.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.beam.bottomSteel',
            labelKey: 'steel.beam.bottomSteel',
            labelSuffix: '=',
            formula: '((L+540)X0.002)XD2XD2Xn/162.28',
            value: `${bottomSteelWeight.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.beam.stirrups',
            labelKey: 'steel.beam.stirrups',
            labelSuffix: '=',
            formula: '((2X(X-60)+2X(Y-60)+20XR))/1000X((L/S)+1)X(RXR/162.28)Xn',
            value: `${stirrupsWeight.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.weight.totalSteel',
            labelKey: 'steel.weight.totalSteel',
            labelSuffix: '=',
            formula: '(((L+540) X0.002)XD1XD1Xn/162.28)+(((L+540)X0.002)XD2XD2Xn/162.28)+(((2X(X-60)+2X(Y-60)+20XR))/1000X((L/S)+1)X(RXR/162.28)Xn)',
            value: `${totalSteel.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.weight.totalPrice',
            labelKey: 'steel.weight.totalPrice',
            labelSuffix: '=',
            formula: '((((L+540)X0.002)XD1XD1Xn/162.28)+(((L+540)X0.002)XD2XD2Xn/162.28)+(((2X(X-60)+2X(Y-60)+20XR))/1000X((L/S)+1)X(RXR/162.28)Xn)) * r',
            value: `${totalPrice.toFixed(3)}`
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.beam.type1')}
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
                    <div className="flex items-center justify-center ">
                        <img src={beamType1} alt="Beam Diagram" className="w-full h-full object-contain" />
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
                    {/* Beam Size Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.beam.size')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={sideX}
                                onChange={(e) => setSideX(e.target.value)}
                                placeholder={t('steel.beam.sideX')}
                            />
                            <InputField
                                unit="mm"
                                value={sideY}
                                onChange={(e) => setSideY(e.target.value)}
                                placeholder={t('steel.beam.sideY')}
                            />
                            <div className="col-span-2 md:col-span-1">
                                <InputField
                                    unit="mm"
                                    value={lengthL}
                                    onChange={(e) => setLengthL(e.target.value)}
                                    placeholder={t('steel.beam.lengthL')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Steel Details Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.beam.steelDetails')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={topD1}
                                onChange={(e) => setTopD1(e.target.value)}
                                placeholder={t('steel.beam.topSteelD1')}
                            />
                            <InputField
                                unit="mm"
                                value={bottomD2}
                                onChange={(e) => setBottomD2(e.target.value)}
                                placeholder={t('steel.beam.bottomSteelD2')}
                            />
                        </div>
                    </div>

                    {/* Ring Details Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.beam.ringDetails')}</h3>
                        <div className="grid gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={ringDiameterR}
                                onChange={(e) => setRingDiameterR(e.target.value)}
                                placeholder={t('steel.beam.ringDiameterR')}
                            />
                        </div>
                    </div>

                    {/* Stirrups Details Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.beam.stirrupsDetails')}</h3>
                        <div className="grid gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={stirrupSpacingS}
                                onChange={(e) => setStirrupSpacingS(e.target.value)}
                                placeholder={t('steel.beam.stirrupsSpacingS')}
                            />
                        </div>
                    </div>

                    {/* No of Columns (Using this title as per user request, though it's Beam) */}
                    <div className="space-y-3 pt-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.beam.noOfColumns')}</h3>
                        <InputField
                            value={noOfColumns}
                            onChange={(e) => setNoOfColumns(e.target.value)}
                            placeholder={t('steel.beam.noOfColumns')}
                            suffix="NOS"
                        />
                    </div>

                    {/* Price Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.beam.price')}</h3>
                        <InputField
                            value={steelRate}
                            onChange={(e) => setSteelRate(e.target.value)}
                            placeholder={t('steel.beam.rateOfSteel')}
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
                                    { material: t('steel.beam.volume'), quantity: volume.toFixed(3), unit: 'm³' },
                                    { material: t('steel.beam.topSteel'), quantity: topSteelWeight.toFixed(3), unit: 'kg' },
                                    { material: t('steel.beam.bottomSteel'), quantity: bottomSteelWeight.toFixed(3), unit: 'kg' },
                                    { material: t('steel.beam.stirrups'), quantity: stirrupsWeight.toFixed(3), unit: 'kg' },
                                    { material: t('steel.weight.totalSteel'), quantity: totalSteel.toFixed(3), unit: 'kg' },
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
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_BEAM_TYPE1_DETAILED, {
                                state: {
                                    calculationData,
                                    outputs: detailedOutputs
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

export default BeamType1;
