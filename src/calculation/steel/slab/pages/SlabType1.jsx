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
import slType1 from '../../../../assets/icons/slType1.svg';

const SlabType1 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('calculation');
    const [unitType, setUnitType] = useState('metric'); // metric or imperial

    // Slab Size
    const [lengthL1, setLengthL1] = useState('');
    const [lengthL2, setLengthL2] = useState('');
    const [diameterD1, setDiameterD1] = useState('');

    // Bar Details
    const [barDiameterD2, setBarDiameterD2] = useState('');

    // Spacing Details
    const [s1, setS1] = useState('');
    const [s2, setS2] = useState('');
    const [depthD, setDepthD] = useState('');

    // Price
    const [steelRate, setSteelRate] = useState('');

    const [showResult, setShowResult] = useState(false);

    // Calculation Logic (Following formulas from Image 3)
    const L1 = parseFloat(lengthL1) || 0;
    const L2 = parseFloat(lengthL2) || 0;
    const D1 = parseFloat(diameterD1) || 0;
    const D2 = parseFloat(barDiameterD2) || 0;
    const S1 = parseFloat(s1) || 0;
    const S2 = parseFloat(s2) || 0;
    const d = parseFloat(depthD) || 0;
    const r = parseFloat(steelRate) || 0;

    // Volume = ((L1 * L2 * d) / 1000)
    const volume = (L1 * L2 * d) / 1000;

    // D1 Weight = (L2 + 0.4) * ((L1 * 1000 / S1) + 1) * (D1 * D1 / 162.28)
    const d1Weight = S1 > 0 ? (L2 + 0.4) * ((L1 * 1000 / S1) + 1) * (D1 * D1 / 162.28) : 0;

    // D2 Weight = (L1 + 0.4) * ((L2 * 1000 / S2) + 1) * (D2 * D2 / 162.28)
    const d2Weight = S2 > 0 ? (L1 + 0.4) * ((L2 * 1000 / S2) + 1) * (D2 * D2 / 162.28) : 0;

    const totalSteel = d1Weight + d2Weight;
    const totalPrice = totalSteel * r;

    const handleReset = () => {
        setLengthL1('');
        setLengthL2('');
        setDiameterD1('');
        setBarDiameterD2('');
        setS1('');
        setS2('');
        setDepthD('');
        setSteelRate('');
        setShowResult(false);
    };

    const handleCalculate = () => {
        setShowResult(true);
    };

    const calculationData = [
        { labelKey: 'steel.slab.lengthL1', name: t('steel.slab.lengthL1'), symbol: 'L1', value: `${lengthL1} mm` },
        { labelKey: 'steel.slab.lengthL2', name: t('steel.slab.lengthL2'), symbol: 'L2', value: `${lengthL2} mm` },
        { labelKey: 'steel.slab.diameterD1', name: t('steel.slab.diameterD1'), symbol: 'D1', value: `${diameterD1} mm` },
        { labelKey: 'steel.slab.barDiameterD2', name: t('steel.slab.barDiameterD2'), symbol: 'D2', value: `${barDiameterD2} mm` },
        { labelKey: 'steel.slab.s1', name: t('steel.slab.s1'), symbol: 'S1', value: `${s1} mm` },
        { labelKey: 'steel.slab.s2', name: t('steel.slab.s2'), symbol: 'S2', value: `${s2} mm` },
        { labelKey: 'steel.slab.depthD', name: t('steel.slab.depthD'), symbol: 'd', value: `${depthD} mm` },
        { labelKey: 'steel.slab.rateSteel', name: t('steel.slab.rateSteel'), symbol: 'r', value: `₹ ${steelRate} / kg` },
    ];

    const detailedOutputs = [
        {
            titleKey: 'steel.slab.volume',
            labelKey: 'steel.slab.volume',
            labelSuffix: ':',
            formula: '((L1XL2Xd)/1000)',
            value: `${volume.toFixed(3)} m³`
        },
        {
            titleKey: 'steel.slab.d1',
            labelKey: 'steel.slab.d1',
            labelSuffix: '=',
            formula: 'D1 = (L2+0.4)X((L1X1000/ S1)+1)X(D1XD1/162.28)',
            value: `${d1Weight.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.slab.d2',
            labelKey: 'steel.slab.d2',
            labelSuffix: '=',
            formula: 'D2 = (L1+0.4)X((L2X1000/ S2)+1)X(D2XD2/162.28)',
            value: `${d2Weight.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.slab.totalSteel',
            labelKey: 'steel.slab.totalSteel',
            labelSuffix: '=',
            formula: 'Total Steel = ((L2+0.4)X((L1X1000/ S1)+1)X(D1XD1/162.28)+((L1+0.4)X((L2X1000/ S2)+1)X(D2XD2/162.28))',
            value: `${totalSteel.toFixed(3)} KG`
        },
        {
            titleKey: 'steel.slab.totalPrice',
            labelKey: 'steel.slab.totalPrice',
            labelSuffix: '=',
            formula: 'Total Price = ((L2+0.4)X((L1X1000/ S1)+1)X(D1XD1/162.28)+((L1+0.4)X((L2X1000/ S2)+1)X(D2XD2/162.28))XR',
            value: `₹ ${totalPrice.toFixed(3)}`
        },
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto pb-20">
            <div className="mb-6">
                <PageHeader
                    title={t('steel.slab.type1')}
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
                    <div className="flex items-center justify-center">
                        <img src={slType1} alt="Slab Diagram" className="w-full h-full object-contain" />
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
                    {/* Slab Size Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.slab.slabSize')}</h3>
                        <div className="grid grid-cols-2 gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={lengthL1}
                                onChange={(e) => setLengthL1(e.target.value)}
                                placeholder={t('steel.slab.lengthL1')}
                            />
                            <InputField
                                unit="mm"
                                value={lengthL2}
                                onChange={(e) => setLengthL2(e.target.value)}
                                placeholder={t('steel.slab.lengthL2')}
                            />
                        </div>
                        <div className="pt-2">
                            <InputField
                                unit="mm"
                                value={diameterD1}
                                onChange={(e) => setDiameterD1(e.target.value)}
                                placeholder={t('steel.slab.diameterD1')}
                            />
                        </div>
                    </div>

                    {/* Bar Details Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.slab.barDetails')}</h3>
                        <InputField
                            unit="mm"
                            value={barDiameterD2}
                            onChange={(e) => setBarDiameterD2(e.target.value)}
                            placeholder={t('steel.slab.barDiameterD2')}
                        />
                    </div>

                    {/* Spacing Details Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.slab.spacingDetails')}</h3>
                        <div className="grid grid-cols-2 gap-2 md:gap-4">
                            <InputField
                                unit="mm"
                                value={s1}
                                onChange={(e) => setS1(e.target.value)}
                                placeholder={t('steel.slab.s1')}
                            />
                            <InputField
                                unit="mm"
                                value={s2}
                                onChange={(e) => setS2(e.target.value)}
                                placeholder={t('steel.slab.s2')}
                            />
                        </div>
                        <div className="pt-2">
                            <InputField
                                unit="mm"
                                value={depthD}
                                onChange={(e) => setDepthD(e.target.value)}
                                placeholder={t('steel.slab.depthD')}
                            />
                        </div>
                    </div>

                    {/* Price Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-primary ml-1">{t('steel.weight.price')}</h3>
                        <InputField
                            value={steelRate}
                            onChange={(e) => setSteelRate(e.target.value)}
                            placeholder={t('steel.slab.rateSteel')}
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
                                    { material: t('steel.slab.volume'), quantity: volume.toFixed(3), unit: 'm³' },
                                    { material: t('steel.slab.d1'), quantity: d1Weight.toFixed(3), unit: 'kg' },
                                    { material: t('steel.slab.d2'), quantity: d2Weight.toFixed(3), unit: 'kg' },
                                    { material: t('steel.slab.totalSteel'), quantity: totalSteel.toFixed(3), unit: 'kg' },
                                    { material: t('steel.slab.totalPrice'), quantity: totalPrice.toFixed(3), unit: '₹' },
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
                            onClick={() => navigate(ROUTES_FLAT.CALCULATION_SLAB_TYPE1_DETAILED, {
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

export default SlabType1;
