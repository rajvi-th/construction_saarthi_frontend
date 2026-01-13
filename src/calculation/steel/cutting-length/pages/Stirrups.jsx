import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import InputField from '../../../common/InputField';
import { ROUTES_FLAT } from '../../../../constants/routes';

// Import icons
import stirrups from '../../../../assets/icons/stirrupss.svg';

const Stirrups = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Inputs
    const [lengthA, setLengthA] = useState('');
    const [lengthB, setLengthB] = useState('');
    const [diameter, setDiameter] = useState('');
    const [noOfBars, setNoOfBars] = useState('');

    const [showResult, setShowResult] = useState(false);

    // Calculation Logic
    const A = parseFloat(lengthA) || 0;
    const B = parseFloat(lengthB) || 0;
    const d = parseFloat(diameter) || 0;
    const N = parseFloat(noOfBars) || 0;

    // Length of Each Bar = (2*A) + (2*B) + (10*d)
    // Note: A, B are in meters. d is in mm.
    // Convert d to meters: d (m) = d / 1000
    const lengthOfEachBar = (2 * A) + (2 * B) + (10 * d / 1000);

    // Total Length of Bar = Length of Each Bar * N
    const totalLength = lengthOfEachBar * N;

    // Weight of the Bar = (Total Length * d^2) / 162.28
    const weight = (totalLength * d * d) / 162.28;

    const handleReset = () => {
        setLengthA('');
        setLengthB('');
        setDiameter('');
        setNoOfBars('');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };

    const calculationData = [
        { labelKey: 'steel.cutting.lengthA', name: t('steel.cutting.lengthA'), symbol: 'A', value: `${lengthA} m` },
        { labelKey: 'steel.cutting.lengthB', name: t('steel.cutting.lengthB'), symbol: 'B', value: `${lengthB} m` },
        { labelKey: 'steel.cutting.noOfBars', name: t('steel.cutting.noOfBars'), symbol: 'N', value: `${noOfBars} NOS` },
        { labelKey: 'steel.cutting.diameterBar', name: t('steel.cutting.diameterBar'), symbol: 'd', value: `${diameter} mm` },
    ];

    const detailedOutputs = [
        {
            titleKey: 'steel.cutting.lengthEachBar',
            labelKey: 'steel.cutting.lengthEachBar',
            labelSuffix: '=',
            formula: '((2XA)+(2XB)+(10Xd))',
            value: `${lengthOfEachBar.toFixed(3)} m`
        },
        {
            titleKey: 'steel.cutting.totalLengthBar',
            labelKey: 'steel.cutting.totalLengthBar',
            labelSuffix: '=',
            formula: '(((2XA)+(2XB)+(10Xd))XN)',
            value: `${totalLength.toFixed(3)} m`
        },
        {
            titleKey: 'steel.cutting.weightBar',
            labelKey: 'steel.cutting.weightBar',
            labelSuffix: '=',
            formula: '(((((2XA)+(2XB)+(10Xd))XN)XdXd)/162.28)',
            value: `${weight.toFixed(3)} KG`
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.cutting.stirrups')}
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
                        <img src={stirrups} alt="Stirrups Diagram" className="w-full h-full object-contain" />
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
                    <div className='grid md:grid-cols-2 gap-4'>
                        <InputField
                            unit="m"
                            value={lengthA}
                            onChange={(e) => setLengthA(e.target.value)}
                            placeholder={t('steel.cutting.lengthA')}
                        />
                        <InputField
                            unit="m"
                            value={lengthB}
                            onChange={(e) => setLengthB(e.target.value)}
                            placeholder={t('steel.cutting.lengthB')}
                        />
                    </div>
                    <InputField
                        unit="mm"
                        value={diameter}
                        onChange={(e) => setDiameter(e.target.value)}
                        placeholder={t('steel.cutting.diameterBar')}
                    />
                    <InputField
                        value={noOfBars}
                        onChange={(e) => setNoOfBars(e.target.value)}
                        suffix="NOS"
                        placeholder={t('steel.cutting.noOfBars')}
                    />
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
                                    { material: t('steel.cutting.lengthEachBar'), quantity: lengthOfEachBar.toFixed(3), unit: 'm' },
                                    { material: t('steel.cutting.totalLengthBar'), quantity: totalLength.toFixed(3), unit: 'm' },
                                    { material: t('steel.cutting.weightBar'), quantity: weight.toFixed(3), unit: 'KG' },
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
                    <div className="flex justify-end gap-6">
                        <Button
                            variant="primary"
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_STIRRUPS_DETAILED, {
                                state: {
                                    calculationData,
                                    outputs: detailedOutputs
                                }
                            })}
                            className="!rounded-2xl text-lg font-medium hover:bg-[#B02E0C] transition-all h-[58px] w-full md:w-auto"
                        >
                            {t('steel.weight.viewDetailed')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stirrups;
