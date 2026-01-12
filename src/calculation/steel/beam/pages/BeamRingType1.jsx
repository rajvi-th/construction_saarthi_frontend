import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import PageHeader from '../../../../components/layout/PageHeader';
import Button from '../../../../components/ui/Button';
import Radio from '../../../../components/ui/Radio';
import { ROUTES_FLAT } from '../../../../constants/routes';
import InputField from '../../../common/InputField';

// Import icons
import beamRingType1 from '../../../../assets/icons/beamRingType1.svg';

const BeamRingType1 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Inputs
    const [ringDiameterR, setRingDiameterR] = useState(''); // R
    const [columnSizeX, setColumnSizeX] = useState(''); // X
    const [columnHeightH, setColumnHeightH] = useState(''); // H
    const [stirrupSpacingS, setStirrupSpacingS] = useState(''); // S
    const [noOfColumns, setNoOfColumns] = useState(''); // n
    const [steelRate, setSteelRate] = useState(''); // r

    const [showResult, setShowResult] = useState(false);

    // Calculation Logic
    const R = parseFloat(ringDiameterR) || 0;
    const X = parseFloat(columnSizeX) || 0;
    const H = parseFloat(columnHeightH) || 0; // in meters as per image label
    const S = parseFloat(stirrupSpacingS) || 0;
    const n = parseFloat(noOfColumns) || 0;
    const r = parseFloat(steelRate) || 0;

    // Formula: Stirrups = ((4X(X-80)+20XR)/1000)X((1000XH/S)+1)X(RXR/162.28)Xn
    const part1 = (4 * (X - 80) + 20 * R) / 1000;
    const part2 = S > 0 ? (1000 * H / S) + 1 : 0;
    const part3 = (R * R) / 162.28;
    const stirrupsWeight = part1 * part2 * part3 * n;

    const totalPrice = stirrupsWeight * r;

    const handleReset = () => {
        setRingDiameterR('');
        setColumnSizeX('');
        setColumnHeightH('');
        setStirrupSpacingS('');
        setNoOfColumns('');
        setSteelRate('');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };

    const calculationData = [
        { labelKey: 'steel.beam.ringDiameterR', name: t('steel.beam.ringDiameterR'), symbol: 'R', value: `${ringDiameterR} mm` },
        { labelKey: 'steel.beam.columnSizeX', name: t('steel.beam.columnSizeX'), symbol: 'X', value: `${columnSizeX} mm` },
        { labelKey: 'steel.beam.columnHeightH', name: t('steel.beam.columnHeightH'), symbol: 'H', value: `${columnHeightH} m` },
        { labelKey: 'steel.beam.stirrupsSpacingS', name: t('steel.beam.stirrupsSpacingS'), symbol: 'S', value: `${stirrupSpacingS} mm` },
        { labelKey: 'steel.beam.numColumnN', name: t('steel.beam.numColumnN'), symbol: 'n', value: `${noOfColumns} NOS` },
    ];

    const detailedOutputs = [
        {
            titleKey: 'steel.beam.stirrups',
            labelKey: 'steel.beam.stirrups',
            labelSuffix: '=',
            formula: '((4X(X-80)+20XR)/1000)X((1000XH/S)+1)X(RXR/162.28)Xn',
            value: `${stirrupsWeight.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.weight.totalPrice',
            labelKey: 'steel.weight.totalPrice',
            labelSuffix: '=',
            formula: 'Stirrups * r',
            value: `₹ ${totalPrice.toFixed(3)}`
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.beam.ringType1')}
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
                        <img src={beamRingType1} alt="Beam Ring Diagram" className="w-full h-full object-contain" />
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
                    <div className="space-y-4">
                        <InputField
                            unit="mm"
                            value={ringDiameterR}
                            onChange={(e) => setRingDiameterR(e.target.value)}
                            placeholder={t('steel.beam.ringDiameterR')}
                        />
                        <div className='grid md:grid-cols-2 gap-4'>
                            <InputField
                                unit="mm"
                                value={columnSizeX}
                                onChange={(e) => setColumnSizeX(e.target.value)}
                                placeholder={t('steel.beam.columnSizeX')}
                            />
                            <InputField
                                unit="m"
                                value={columnHeightH}
                                onChange={(e) => setColumnHeightH(e.target.value)}
                                placeholder={t('steel.beam.columnHeightH')}
                            />
                        </div>
                        <InputField
                            unit="mm"
                            value={stirrupSpacingS}
                            onChange={(e) => setStirrupSpacingS(e.target.value)}
                            placeholder={t('steel.beam.stirrupsSpacingS')}
                        />
                        <InputField
                            value={noOfColumns}
                            onChange={(e) => setNoOfColumns(e.target.value)}
                            placeholder={t('steel.beam.numColumnN')}
                            suffix="NOS"
                        />
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
                                <tr className="hover:bg-[#F9F9F9] transition-colors">
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('steel.beam.stirrups')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{stirrupsWeight.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A] last:border-r-0">kg</td>
                                </tr>
                                <tr className="hover:bg-[#F9F9F9] transition-colors">
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{t('steel.weight.totalPrice')}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A]">{totalPrice.toFixed(3)}</td>
                                    <td className="px-6 py-4 text-sm text-primary border-r border-[#060C120A] last:border-r-0">₹</td>
                                </tr>
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
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_BEAM_RING_TYPE1_DETAILED, {
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

export default BeamRingType1;
