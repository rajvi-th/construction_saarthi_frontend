import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Share2, Download, History as HistoryIcon } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import beamHorizontalBar from '../../../../assets/icons/beamHorizontalBars.svg';
import InputField from '../../../common/InputField';

const BeamHorizontalBar = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Beam Size
    const [beamSideB1, setBeamSideB1] = useState('');
    const [beamSideB2, setBeamSideB2] = useState('');
    const [beamLengthL, setBeamLengthL] = useState('');

    // Bar Details
    const [barDiameterD1, setBarDiameterD1] = useState('');
    const [numVerticalBarsN1, setNumVerticalBarsN1] = useState('');
    const [numBeamsN2, setNumBeamsN2] = useState('');

    // Price
    const [steelRate, setSteelRate] = useState('');

    const [showResult, setShowResult] = useState(false);

    // Calculation Logic
    const b1 = parseFloat(beamSideB1) || 0;
    const b2 = parseFloat(beamSideB2) || 0;
    const L = parseFloat(beamLengthL) || 0;
    const D1 = parseFloat(barDiameterD1) || 0;
    const n1 = parseFloat(numVerticalBarsN1) || 0;
    const n2 = parseFloat(numBeamsN2) || 0;
    const r = parseFloat(steelRate) || 0;

    // Formula: Vertical Steel(D) = n2 * D1 * D1 * (L + b1 + b2) * n1 / 162.28
    // Assuming L, b1, b2 are input in mm and need to be converted to meters for the length part of the formula.
    // D1 is in mm. D1^2/162.28 is weight per meter.
    // Total Length in meters = (L + b1 + b2) / 1000
    // Total Weight = (Total Length) * (Weight per meter) * n1 * n2

    // Note: The formula in the image shows: n2 X D1 X D1 X (L+b1+b2) X n1 / 162.28
    // It doesn't explicitly show division by 1000 for length, but typically length is in meters for this formula. 
    // Given the previous files used mm for length inputs and converted, I will do the same.

    const totalLengthM = (L + b1 + b2) / 1000;
    const weightPerMeter = (D1 * D1) / 162.28;
    const totalSteelWeight = weightPerMeter * totalLengthM * n1 * n2;

    const totalPrice = totalSteelWeight * r;

    const handleReset = () => {
        setBeamSideB1('');
        setBeamSideB2('');
        setBeamLengthL('');
        setBarDiameterD1('');
        setNumVerticalBarsN1('');
        setNumBeamsN2('');
        setSteelRate('');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };

    const calculationData = [
        { labelKey: 'steel.beam.barDiameterD1', name: t('steel.beam.barDiameterD1'), symbol: 'D1', value: `${barDiameterD1} mm` },
        { labelKey: 'steel.beam.beamSideB1', name: t('steel.beam.beamSideB1'), symbol: 'b1', value: `${beamSideB1} mm` },
        { labelKey: 'steel.beam.beamSideB2', name: t('steel.beam.beamSideB2'), symbol: 'b2', value: `${beamSideB2} mm` },
        { labelKey: 'steel.beam.beamLengthL', name: t('steel.beam.beamLengthL'), symbol: 'L', value: `${beamLengthL} mm` },
        { labelKey: 'steel.beam.numVerticalBarsN1', name: t('steel.beam.numVerticalBarsN1'), symbol: 'n1', value: `${numVerticalBarsN1}` },
        { labelKey: 'steel.beam.numBeamsN2', name: t('steel.beam.numBeamsN2'), symbol: 'n2', value: `${numBeamsN2} NOS` },
    ];

    // Add Price to calculation data? Usually detailed report shows inputs used for logic. 
    // Image 3 ends at n2, so I won't add Rate there, but it is available.

    const detailedOutputs = [
        {
            titleKey: 'steel.beam.verticalSteel',
            labelKey: 'steel.beam.verticalSteel',
            labelSuffix: '=',
            formula: 'n2XD1XD1X(L+b1+b2) Xn1 /162.28',
            value: `${totalSteelWeight.toFixed(3)} KG`
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.beam.horizontal')}
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
                        <img src={beamHorizontalBar} alt="Beam Diagram" className="w-full h-full object-contain" />
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
                                value={beamSideB1}
                                onChange={(e) => setBeamSideB1(e.target.value)}
                                placeholder={t('steel.beam.beamSideB1')}
                            />
                            <InputField
                                unit="mm"
                                value={beamSideB2}
                                onChange={(e) => setBeamSideB2(e.target.value)}
                                placeholder={t('steel.beam.beamSideB2')}
                            />
                            <div className='col-span-2 md:col-span-1'>
                                <InputField
                                    unit="mm"
                                    value={beamLengthL}
                                    onChange={(e) => setBeamLengthL(e.target.value)}
                                    placeholder={t('steel.beam.beamLengthL')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bar Details Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.beam.barDetails')}</h3>
                        <div className="space-y-2">
                            <InputField
                                unit="mm"
                                value={barDiameterD1}
                                onChange={(e) => setBarDiameterD1(e.target.value)}
                                placeholder={t('steel.beam.barDiameterD1')}
                            />
                            <InputField
                                unit="mm"
                                value={numVerticalBarsN1}
                                onChange={(e) => setNumVerticalBarsN1(e.target.value)}
                                placeholder={t('steel.beam.numVerticalBarsN1')}
                            />
                            <InputField
                                value={numBeamsN2}
                                onChange={(e) => setNumBeamsN2(e.target.value)}
                                placeholder={t('steel.beam.numBeamsN2')}
                                suffix="NOS"
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
                                    { material: t('steel.beam.verticalSteel'), quantity: totalSteelWeight.toFixed(3), unit: 'kg' },
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
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_BEAM_HORIZONTAL_DETAILED, {
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

export default BeamHorizontalBar;
